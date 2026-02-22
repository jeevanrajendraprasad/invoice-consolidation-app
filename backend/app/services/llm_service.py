import os
import json
import logging
from groq import Groq
from dotenv import load_dotenv
from app.schemas.invoice import InvoiceExtracted

load_dotenv()

logger = logging.getLogger(__name__)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are a document data extraction assistant.
Extract invoice information from raw text and return ONLY valid JSON.
Do not include any explanation, markdown, or extra text.
If a field is missing or unclear, use null.
Normalize all field names exactly as specified."""

USER_PROMPT_TEMPLATE = """Extract invoice details from the following text and return JSON with EXACTLY these keys:
- invoice_number (string)
- vendor_name (string)
- invoice_date (string, format YYYY-MM-DD if possible)
- amount (float, before tax)
- tax_amount (float)
- total_amount (float)
- payment_status (string: "paid", "pending", or "unknown")

Text:
---
{raw_text}
---

Return only the JSON object. No markdown, no explanation."""


def _call_groq(raw_text: str, strict: bool = False) -> str:
    extra = " Be very strict: output ONLY the raw JSON object, nothing else." if strict else ""
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT + extra},
            {"role": "user", "content": USER_PROMPT_TEMPLATE.format(raw_text=raw_text[:4000])},
        ],
        temperature=0,
        max_tokens=512,
    )
    return response.choices[0].message.content.strip()


def extract_invoice_data(raw_text: str) -> InvoiceExtracted | None:
    """
    Call Groq LLM to extract structured invoice fields from raw text.
    Retries once with a stricter prompt on JSON parse failure.
    Returns an InvoiceExtracted instance or None on total failure.
    """
    for attempt, strict in enumerate([False, True]):
        try:
            llm_output = _call_groq(raw_text, strict=strict)

            # Strip markdown code fences if model wraps JSON anyway
            if llm_output.startswith("```"):
                llm_output = llm_output.split("```")[1]
                if llm_output.startswith("json"):
                    llm_output = llm_output[4:]

            data = json.loads(llm_output)
            return InvoiceExtracted(**data)
        except json.JSONDecodeError as e:
            logger.error(f"[LLM attempt {attempt+1}] JSON parse failed: {e} | Output was: {llm_output!r}")
        except Exception as e:
            logger.error(f"[LLM attempt {attempt+1}] Error: {type(e).__name__}: {e}")
            if attempt == 0:
                continue
            return None
    return None
