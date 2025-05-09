import base64
import fitz  # PyMuPDF
from flask import Request, jsonify

def handler(request: Request):
    try:
        data = request.get_json()
        pdf_b64 = data.get("body", "")
        pdf_bytes = base64.b64decode(pdf_b64)
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
        return jsonify({"slides": slides})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
