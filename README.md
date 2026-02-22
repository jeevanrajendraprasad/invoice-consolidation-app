# AI Invoice Consolidation System

Automatically extracts, normalizes, and stores invoice data from PDFs, Excel files, scanned images, and ZIP archives into a unified PostgreSQL database. Uses Groq LLM (llama3-8b-8192) for field extraction and Tesseract OCR for scanned documents.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18 + Vite + Tailwind CSS      |
| Backend   | FastAPI + SQLAlchemy                |
| Database  | PostgreSQL 14+                      |
| LLM       | Groq API (llama3-8b-8192, free tier)|
| OCR       | Tesseract v5 + pytesseract          |

## Architecture

```
File Upload (PDF / Excel / CSV / Image / ZIP)
        │
        ▼
  file_parser.py  ──────────────────────────────┐
  ├── PDF → pdfplumber (text) / OCR (scanned)   │
  ├── Excel/CSV → pandas                         │
  ├── Image → Tesseract OCR                      │
  └── ZIP → recursive processing                 │
        │                                         │
        ▼                                         │
  llm_service.py (Groq API)                      │
  └── llama3-8b-8192 → structured JSON           │
        │                                         │
        ▼                                         │
  PostgreSQL (invoices table) ◄───────────────────┘
        │
        ▼
  React Frontend
  ├── /           Upload page
  ├── /invoices   Table + filter + Excel export
  └── /dashboard  KPI charts (Recharts)
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+ running locally
- Tesseract v5

### Install Tesseract

**Windows:** Download installer from https://github.com/UB-Mannheim/tesseract/wiki
**Mac:** `brew install tesseract`
**Linux:** `sudo apt install tesseract-ocr`

## Setup

### 1. Database

```bash
psql -U postgres -f backend/init_db.sql
```

### 2. Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt

cp .env.example .env
# Edit .env — set GROQ_API_KEY and DATABASE_URL

uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at: http://localhost:5173

## API Endpoints

| Method | Endpoint          | Description                        |
|--------|-------------------|------------------------------------|
| POST   | /upload           | Upload files for processing        |
| GET    | /invoices         | List invoices (supports ?vendor=&payment_status=) |
| GET    | /invoices/{id}    | Single invoice                     |
| GET    | /export           | Download all invoices as .xlsx     |
| GET    | /logs             | Upload history                     |
| GET    | /health           | Health check                       |

## Supported File Types

- **PDF** — text-based or scanned (auto-detected, OCR fallback)
- **Excel** (.xlsx, .xls) — each row treated as one invoice
- **CSV** — each row treated as one invoice
- **Images** (.jpg, .jpeg, .png) — OCR extracted
- **ZIP** — all contained files processed recursively

## LLM Prompt Strategy

The system uses `temperature=0` for deterministic JSON output. On invalid JSON, it retries once with a stricter prompt. Failed extractions are saved with `processing_status = 'failed'` for manual review.

## Environment Variables

| Variable       | Description                             |
|----------------|-----------------------------------------|
| GROQ_API_KEY   | From https://console.groq.com           |
| DATABASE_URL   | PostgreSQL connection string            |
| UPLOAD_DIR     | Temp dir for uploaded files             |
