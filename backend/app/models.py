from sqlalchemy import Column, Integer, String, Numeric, Date, TIMESTAMP, func
from app.database import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(100), nullable=True)
    vendor_name = Column(String(255), nullable=True)
    invoice_date = Column(Date, nullable=True)
    amount = Column(Numeric(12, 2), nullable=True)
    tax_amount = Column(Numeric(12, 2), nullable=True)
    total_amount = Column(Numeric(12, 2), nullable=True)
    payment_status = Column(String(20), default="unknown")
    source_file = Column(String(500), nullable=False)
    upload_timestamp = Column(TIMESTAMP, server_default=func.now())
    processing_status = Column(String(20), default="pending")


class UploadLog(Base):
    __tablename__ = "upload_logs"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(500))
    file_type = Column(String(20))
    records_extracted = Column(Integer, default=0)
    uploaded_at = Column(TIMESTAMP, server_default=func.now())
    status = Column(String(20))
