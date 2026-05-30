import docx
from docx.shared import Pt, Inches, RGBColor


def create_docx(content, output_path, template_id="cc-001"):
    doc = docx.Document()

    # Template configs synced with frontend IDs
    TEMPLATE_STYLES = {
        "ats-001": {
            "font": "Times New Roman",
            "size": 11,
            "h_size": 14,
            "accent": "1e40af",
        },
        "tech-001": {"font": "Arial", "size": 10, "h_size": 13, "accent": "2563eb"},
        "prof-001": {
            "font": "Times New Roman",
            "size": 11,
            "h_size": 14,
            "accent": "0f766e",
        },
        "ats-002": {"font": "Arial", "size": 10, "h_size": 13, "accent": "374151"},
        "beg-001": {"font": "Arial", "size": 11, "h_size": 14, "accent": "e11d48"},
        "exec-001": {"font": "Arial", "size": 12, "h_size": 15, "accent": "b87333"},
        "prof-002": {
            "font": "Times New Roman",
            "size": 11,
            "h_size": 14,
            "accent": "475569",
        },
        "tech-002": {"font": "Arial", "size": 10, "h_size": 13, "accent": "0284c7"},
        "exec-002": {"font": "Arial", "size": 11, "h_size": 14, "accent": "0f766e"},
        "beg-002": {"font": "Arial", "size": 11, "h_size": 14, "accent": "1e40af"},
        "tech-003": {"font": "Arial", "size": 10, "h_size": 13, "accent": "6d28d9"},
        "ats-003": {"font": "Arial", "size": 10, "h_size": 13, "accent": "1e40af"},
        "beg-003": {"font": "Arial", "size": 10, "h_size": 13, "accent": "16a34a"},
        "exec-003": {
            "font": "Times New Roman",
            "size": 12,
            "h_size": 15,
            "accent": "b45309",
        },
        "tech-004": {"font": "Arial", "size": 11, "h_size": 14, "accent": "d97706"},
    }

    DEFAULT = {"font": "Arial", "size": 11, "h_size": 14, "accent": "000000"}
    config = TEMPLATE_STYLES.get(template_id, DEFAULT)

    # Set consistent margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.9)
        section.right_margin = Inches(0.9)

    # Set default style
    style = doc.styles["Normal"]
    style.font.name = config["font"]
    style.font.size = Pt(config["size"])

    # Known section headers
    SECTION_HEADERS = {
        "PROFESSIONAL SUMMARY",
        "SUMMARY",
        "OBJECTIVE",
        "SKILLS",
        "WORK EXPERIENCE",
        "EXPERIENCE",
        "EDUCATION",
        "PROJECTS",
        "CERTIFICATIONS",
        "AWARDS",
        "PUBLICATIONS",
        "REFERENCES",
        "LANGUAGES",
        "INTERESTS",
        "VOLUNTEER",
        "PROFESSIONAL EXPERIENCE",
        "CAREER SUMMARY",
        "TECHNICAL SKILLS",
        "CORE COMPETENCIES",
        "EMPLOYMENT HISTORY",
    }

    ENTRY_SECTIONS = {
        "WORK EXPERIENCE",
        "EXPERIENCE",
        "EDUCATION",
        "PROJECTS",
        "CERTIFICATIONS",
        "PROFESSIONAL EXPERIENCE",
        "EMPLOYMENT HISTORY",
    }

    accent_color = RGBColor.from_string(config["accent"])

    lines = content.split("\n")
    current_section = None
    is_first_line = True

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue

        normalized = line.upper().rstrip(":")
        is_header = normalized in SECTION_HEADERS or (
            line.isupper()
            and len(line) > 2
            and len(line) < 50
            and "@" not in line
            and "|" not in line
        )

        # First non-empty line = name
        if is_first_line and not is_header:
            p = doc.add_paragraph()
            run = p.add_run(line)
            run.bold = True
            run.font.size = Pt(config["h_size"] + 6)
            run.font.color.rgb = accent_color
            run.font.name = config["font"]
            p.space_after = Pt(2)
            is_first_line = False
            continue

        is_first_line = False

        if is_header:
            # Add spacing before section
            spacer = doc.add_paragraph()
            spacer.space_before = Pt(4)
            spacer.space_after = Pt(0)

            p = doc.add_paragraph()
            run = p.add_run(normalized)
            run.bold = True
            run.font.size = Pt(config["h_size"])
            run.font.color.rgb = accent_color
            run.font.name = config["font"]
            p.space_after = Pt(6)

            # Add a thin line under section header
            from docx.oxml.ns import qn
            from docx.oxml import OxmlElement

            pBorder = OxmlElement("w:pBdr")
            bottom = OxmlElement("w:bottom")
            bottom.set(qn("w:val"), "single")
            bottom.set(qn("w:sz"), "4")
            bottom.set(qn("w:space"), "1")
            bottom.set(qn("w:color"), config["accent"])
            pBorder.append(bottom)
            p.paragraph_format.element.get_or_add_pPr().append(pBorder)

            current_section = normalized
            continue

        # Bullet point
        if line.startswith("•") or line.startswith("-") or line.startswith("*"):
            p = doc.add_paragraph(style="List Bullet")
            content_text = line.lstrip("•-* ").strip()
            run = p.add_run(content_text)
            run.font.size = Pt(config["size"])
            run.font.name = config["font"]
            p.paragraph_format.left_indent = Inches(0.25)
            p.space_after = Pt(2)
            continue

        # Sub-header detection
        if current_section in ENTRY_SECTIONS:
            is_sub = False
            if " at " in line or "|" in line:
                is_sub = True
            elif any(ch.isdigit() for ch in line) and (
                "-" in line or "to" in line.lower()
            ):
                is_sub = True

            if is_sub:
                p = doc.add_paragraph()
                run = p.add_run(line)
                run.bold = True
                run.font.size = Pt(config["size"] + 1)
                run.font.name = config["font"]
                p.space_after = Pt(2)
                continue

        # Contact info lines (near top, contain @ or phone-like patterns)
        if not current_section and ("@" in line or "|" in line):
            p = doc.add_paragraph()
            run = p.add_run(line)
            run.font.size = Pt(config["size"] - 1)
            run.font.name = config["font"]
            run.font.color.rgb = RGBColor(100, 100, 100)
            p.space_after = Pt(1)
            continue

        # Normal paragraph
        p = doc.add_paragraph(line)
        p.paragraph_format.space_after = Pt(2)

    doc.save(output_path)
