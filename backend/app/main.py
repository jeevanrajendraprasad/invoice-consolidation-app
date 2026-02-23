import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import upload, invoices

logging.basicConfig(level=logging.DEBUG)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Invoice Consolidation API",
    description="Extracts and normalizes invoice data from PDFs, Excel, images, and ZIP files using LLM.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://invoiceapp-psi.vercel.app",
        "https://invoiceapp-git-main-jeevanrajendraprasads-projects.vercel.app",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, tags=["Upload"])
app.include_router(invoices.router, tags=["Invoices"])