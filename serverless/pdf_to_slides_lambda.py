import json
import fitz  # PyMuPDF
import base64
import io

def extract_pdf_content(pdf_bytes):
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    slides = []
    for page_num, page in enumerate(doc):
        text = page.get_text()
        images = []
        for img in page.get_images(full=True):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_b64 = base64.b64encode(image_bytes).decode("utf-8")
            images.append({
                "b64": image_b64,
                "ext": base_image["ext"]
            })
        slides.append({
            "title": f"Page {page_num+1}",
            "text": text,
            "images": images
        })
    return slides

def lambda_handler(event, context):
    # Expecting event["body"] to be base64-encoded PDF
    pdf_b64 = event.get("body", "")
    pdf_bytes = base64.b64decode(pdf_b64)
    slides = extract_pdf_content(pdf_bytes)
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"slides": slides})
    }
