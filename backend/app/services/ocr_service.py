import io
import pytesseract
from PIL import Image, ImageFilter, ImageEnhance
import pdfplumber


def preprocess_image(image: Image.Image) -> Image.Image:
    """Convert to grayscale, enhance contrast, apply threshold for better OCR."""
    image = image.convert("L")  # grayscale
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(2.0)
    image = image.point(lambda x: 0 if x < 128 else 255, "1")  # binarize
    return image


def extract_text_from_image(image_bytes: bytes) -> str:
    """Run Tesseract OCR on raw image bytes."""
    image = Image.open(io.BytesIO(image_bytes))
    image = preprocess_image(image)
    text = pytesseract.image_to_string(image, config="--psm 6")
    return text.strip()


def extract_text_from_scanned_pdf(file_bytes: bytes) -> str:
    """Extract text from a scanned PDF page-by-page using OCR."""
    from pdf2image import convert_from_bytes  # optional dependency

    pages = convert_from_bytes(file_bytes, dpi=200)
    full_text = []
    for page in pages:
        page = preprocess_image(page)
        page_text = pytesseract.image_to_string(page, config="--psm 6")
        full_text.append(page_text.strip())
    return "\n\n".join(full_text)
