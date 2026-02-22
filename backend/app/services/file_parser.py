import io
import zipfile
from pathlib import Path
import pdfplumber
import pandas as pd
from app.services.ocr_service import extract_text_from_image


SUPPORTED_EXTENSIONS = {".pdf", ".xlsx", ".xls", ".csv", ".jpg", ".jpeg", ".png", ".zip"}


def parse_file(filename: str, file_bytes: bytes) -> list[str]:
    """
    Route file to the correct parser.
    Returns a list of raw text strings (one per invoice/sheet/page).
    """
    ext = Path(filename).suffix.lower()

    if ext == ".pdf":
        return _parse_pdf(file_bytes)
    elif ext in {".xlsx", ".xls"}:
        return _parse_excel(file_bytes)
    elif ext == ".csv":
        return _parse_csv(file_bytes)
    elif ext in {".jpg", ".jpeg", ".png"}:
        return [extract_text_from_image(file_bytes)]
    elif ext == ".zip":
        return _parse_zip(file_bytes)
    else:
        return []


def _parse_pdf(file_bytes: bytes) -> list[str]:
    """Extract text from all pages of a PDF. Falls back to OCR if text is empty."""
    texts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text and text.strip():
                texts.append(text.strip())
            else:
                # Scanned page — convert to image and OCR
                img = page.to_image(resolution=200).original
                img_bytes = io.BytesIO()
                img.save(img_bytes, format="PNG")
                ocr_text = extract_text_from_image(img_bytes.getvalue())
                if ocr_text:
                    texts.append(ocr_text)
    return texts if texts else []


def _parse_excel(file_bytes: bytes) -> list[str]:
    """Convert each row of each sheet to a text representation."""
    texts = []
    xls = pd.ExcelFile(io.BytesIO(file_bytes))
    for sheet_name in xls.sheet_names:
        df = xls.parse(sheet_name)
        df = df.dropna(how="all")
        for _, row in df.iterrows():
            row_text = " | ".join(
                f"{col}: {val}" for col, val in row.items() if pd.notna(val)
            )
            if row_text.strip():
                texts.append(row_text)
    return texts


def _parse_csv(file_bytes: bytes) -> list[str]:
    """Convert each CSV row to a text representation."""
    texts = []
    df = pd.read_csv(io.BytesIO(file_bytes))
    df = df.dropna(how="all")
    for _, row in df.iterrows():
        row_text = " | ".join(
            f"{col}: {val}" for col, val in row.items() if pd.notna(val)
        )
        if row_text.strip():
            texts.append(row_text)
    return texts


def _parse_zip(file_bytes: bytes) -> list[str]:
    """Recursively extract and parse all files from a ZIP archive."""
    texts = []
    with zipfile.ZipFile(io.BytesIO(file_bytes)) as zf:
        for member in zf.infolist():
            if member.is_dir():
                continue
            member_bytes = zf.read(member.filename)
            member_texts = parse_file(member.filename, member_bytes)
            texts.extend(member_texts)
    return texts
