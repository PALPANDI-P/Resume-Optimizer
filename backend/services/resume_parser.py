import fitz # PyMuPDF
import docx

def extract_text(filepath, ext):
    try:
        if ext == 'txt':
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.read()
        elif ext == 'pdf':
            text = ""
            doc = fitz.open(filepath)
            for page in doc:
                text += page.get_text()
            return text
        elif ext == 'docx':
            doc = docx.Document(filepath)
            return "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        print(f"Extraction error ({ext}): {str(e)}")
        raise e
    return ""
