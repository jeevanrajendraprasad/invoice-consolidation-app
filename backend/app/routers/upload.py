import os
from pathlib import Path
from datetime import date as date_type
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from app.database import get_db
from app.models import Invoice, UploadLog
from app.services.file_parser import parse_file, SUPPORTED_EXTENSIONS
from app.services.llm_service import extract_invoice_data

load_dotenv()

router = APIRouter()
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "/tmp/uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _detect_file_type(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    mapping = {
        ".pdf": "pdf",
        ".xlsx": "excel", ".xls": "excel",
        ".csv": "csv",
        ".jpg": "image", ".jpeg": "image", ".png": "image",
        ".zip": "zip",
    }
    return mapping.get(ext, "unknown")


def _parse_date(date_str: str | None):
    if not date_str:
        return None
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y"):
        try:
            from datetime import datetime
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    return None


def _normalize_payment_status(status: str | None) -> str:
    if status and status.lower() in ("paid", "pending"):
        return status.lower()
    return "unknown"


@router.post("/upload")
async def upload_files(
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    results = []

    for upload_file in files:
        filename = upload_file.filename or "unknown"
        ext = Path(filename).suffix.lower()

        if ext not in SUPPORTED_EXTENSIONS:
            results.append({"filename": filename, "status": "rejected", "reason": "Unsupported file type"})
            continue

        file_bytes = await upload_file.read()

        # Save file to disk
        save_path = UPLOAD_DIR / filename
        save_path.write_bytes(file_bytes)

        file_type = _detect_file_type(filename)
        records_saved = 0
        log_status = "success"

        try:
            raw_texts = parse_file(filename, file_bytes)

            for raw_text in raw_texts:
                if not raw_text.strip():
                    continue

                extracted = extract_invoice_data(raw_text)

                if extracted is None:
                    # Save a failed record so it's visible for review
                    invoice = Invoice(
                        source_file=filename,
                        processing_status="failed",
                    )
                    db.add(invoice)
                    db.commit()
                    continue

                invoice = Invoice(
                    invoice_number=extracted.invoice_number,
                    vendor_name=extracted.vendor_name,
                    invoice_date=_parse_date(extracted.invoice_date),
                    amount=extracted.amount,
                    tax_amount=extracted.tax_amount,
                    total_amount=extracted.total_amount,
                    payment_status=_normalize_payment_status(extracted.payment_status),
                    source_file=filename,
                    processing_status="success",
                )
                db.add(invoice)
                db.commit()
                records_saved += 1

        except Exception as exc:
            log_status = "failed"
            db.rollback()

        # Write upload log
        log = UploadLog(
            filename=filename,
            file_type=file_type,
            records_extracted=records_saved,
            status=log_status,
        )
        db.add(log)
        db.commit()

        results.append({
            "filename": filename,
            "file_type": file_type,
            "records_extracted": records_saved,
            "status": log_status,
        })

    return JSONResponse(content={"results": results})
