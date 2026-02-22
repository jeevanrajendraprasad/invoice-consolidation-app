from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from decimal import Decimal


class InvoiceExtracted(BaseModel):
    invoice_number: Optional[str] = None
    vendor_name: Optional[str] = None
    invoice_date: Optional[str] = None
    amount: Optional[float] = None
    tax_amount: Optional[float] = None
    total_amount: Optional[float] = None
    payment_status: Optional[str] = "unknown"


class InvoiceResponse(BaseModel):
    id: int
    invoice_number: Optional[str]
    vendor_name: Optional[str]
    invoice_date: Optional[date]
    amount: Optional[Decimal]
    tax_amount: Optional[Decimal]
    total_amount: Optional[Decimal]
    payment_status: Optional[str]
    source_file: str
    upload_timestamp: Optional[datetime]
    processing_status: str

    class Config:
        from_attributes = True


class UploadLogResponse(BaseModel):
    id: int
    filename: Optional[str]
    file_type: Optional[str]
    records_extracted: int
    uploaded_at: Optional[datetime]
    status: Optional[str]

    class Config:
        from_attributes = True
