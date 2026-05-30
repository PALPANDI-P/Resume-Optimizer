from pypdf import PdfReader
import docx

def extract_text(filepath, ext):
    try:
        if ext == 'txt':
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.read()
        elif ext == 'pdf':
            text = ""
            reader = PdfReader(filepath)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text
        elif ext == 'docx':
            doc = docx.Document(filepath)
            return "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        print(f"Extraction error ({ext}): {str(e)}")
        raise e
    return ""

