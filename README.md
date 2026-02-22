# Invoice Consolidation App

I built this app as part of my internship task. The idea is simple - companies receive invoices from different vendors in different formats (PDF, Excel, images) and it becomes messy to manage them. This app collects all of them and puts the data in one place.

## What it does

- Upload invoice files (PDF, Excel, CSV, images or ZIP)
- Reads the data from each file automatically
- Saves everything into a database in same format
- You can download all invoices as one Excel file

## Tech I used

- React for the frontend
- FastAPI (Python) for the backend
- PostgreSQL for storing data
- Tesseract for reading text from images
- Groq API to understand and extract invoice fields
- Hosted on Vercel and Render

## Live App

- App: https://invoice-consolidation-app.vercel.app
- API Docs: https://invoice-backend.onrender.com/docs

Just open the app link, upload any invoice file and it will extract the data automatically.

## Folder structure

```
Intership/
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── init_db.sql
└── frontend/
    ├── src/
    └── package.json
```
