def create_pdf(content, output_path, template_id='cc-001'):
    from fpdf import FPDF

    # Template style configurations matching frontend template IDs
    TEMPLATE_STYLES = {
        'ats-001': {'font': 'Times', 'header_color': '#0f172a', 'accent': '#1e40af', 'layout': 'single-column', 'header_type': 'centered', 'sidebar_bg': 'null', 'divider_style': 'thin-line', 'spacing_scale': 1.0},
        'tech-001': {'font': 'Helvetica', 'header_color': '#0f172a', 'accent': '#2563eb', 'layout': 'sidebar-left', 'header_type': 'classic', 'sidebar_bg': '#f8fafc', 'divider_style': 'accent-bar', 'spacing_scale': 1.0},
        'prof-001': {'font': 'Times', 'header_color': '#1c1917', 'accent': '#0f766e', 'layout': 'single-column', 'header_type': 'modern-split', 'sidebar_bg': 'null', 'divider_style': 'double-line', 'spacing_scale': 1.1},
        'ats-002': {'font': 'Helvetica', 'header_color': '#000000', 'accent': '#374151', 'layout': 'single-column', 'header_type': 'classic', 'sidebar_bg': 'null', 'divider_style': 'none', 'spacing_scale': 0.95},
        'beg-001': {'font': 'Helvetica', 'header_color': '#292524', 'accent': '#e11d48', 'layout': 'sidebar-right', 'header_type': 'modern-split', 'sidebar_bg': '#fff1f2', 'divider_style': 'colored-block', 'spacing_scale': 1.05},
        'exec-001': {'font': 'Helvetica', 'header_color': '#1e3a5f', 'accent': '#b87333', 'layout': 'single-column', 'header_type': 'banner', 'sidebar_bg': 'null', 'divider_style': 'thick-line', 'spacing_scale': 1.15},
        'prof-002': {'font': 'Times', 'header_color': '#0c0a09', 'accent': '#475569', 'layout': 'single-column', 'header_type': 'centered', 'sidebar_bg': 'null', 'divider_style': 'ornament', 'spacing_scale': 1.1},
        'tech-002': {'font': 'Helvetica', 'header_color': '#0f172a', 'accent': '#0284c7', 'layout': 'sidebar-left', 'header_type': 'banner', 'sidebar_bg': '#e0f2fe', 'divider_style': 'accent-bar', 'spacing_scale': 1.0},
        'exec-002': {'font': 'Helvetica', 'header_color': '#1c1917', 'accent': '#0f766e', 'layout': 'grid-layout', 'header_type': 'classic', 'sidebar_bg': '#f0fdfa', 'divider_style': 'colored-block', 'spacing_scale': 1.05},
        'beg-002': {'font': 'Helvetica', 'header_color': '#0f172a', 'accent': '#1e40af', 'layout': 'two-column', 'header_type': 'centered', 'sidebar_bg': '#f8fafc', 'divider_style': 'thin-line', 'spacing_scale': 1.0},
        'tech-003': {'font': 'Helvetica', 'header_color': '#312e81', 'accent': '#6d28d9', 'layout': 'timeline', 'header_type': 'banner', 'sidebar_bg': '#ede9fe', 'divider_style': 'gradient-line', 'spacing_scale': 1.05},
        'ats-003': {'font': 'Helvetica', 'header_color': '#0f172a', 'accent': '#1e40af', 'layout': 'single-column', 'header_type': 'classic', 'sidebar_bg': 'null', 'divider_style': 'thick-line', 'spacing_scale': 1.0},
        'beg-003': {'font': 'Helvetica', 'header_color': '#14532d', 'accent': '#16a34a', 'layout': 'single-column', 'header_type': 'classic', 'sidebar_bg': 'null', 'divider_style': 'thin-line', 'spacing_scale': 0.95},
        'exec-003': {'font': 'Times', 'header_color': '#450a0a', 'accent': '#b45309', 'layout': 'single-column', 'header_type': 'centered', 'sidebar_bg': 'null', 'divider_style': 'ornament', 'spacing_scale': 1.15},
        'tech-004': {'font': 'Helvetica', 'header_color': '#0a0a0a', 'accent': '#d97706', 'layout': 'two-column', 'header_type': 'modern-split', 'sidebar_bg': '#fefce8', 'divider_style': 'gradient-line', 'spacing_scale': 1.05},
    }

    DEFAULT_STYLE = {'font': 'Helvetica', 'header_color': '#000000', 'accent': '#000000', 'layout': 'single-column', 'header_type': 'classic'}

    config = TEMPLATE_STYLES.get(template_id, DEFAULT_STYLE)

    pdf = FPDF()
    margin = 20
    pdf.set_margins(margin, margin, margin)
    pdf.set_auto_page_break(True, margin=margin)
    pdf.add_page()

    encoded_content = content.encode('latin-1', 'replace').decode('latin-1')
    lines = encoded_content.split('\n')

    # Parse into sections
    sections = []
    current_section = {'title': 'HEADER', 'content': []}

    SECTION_HEADERS = {
        'PROFESSIONAL SUMMARY', 'SUMMARY', 'OBJECTIVE', 'SKILLS', 'WORK EXPERIENCE',
        'EXPERIENCE', 'EDUCATION', 'PROJECTS', 'CERTIFICATIONS', 'AWARDS',
        'LANGUAGES', 'CONTACT', 'INTERESTS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES',
        'PROFESSIONAL EXPERIENCE', 'EMPLOYMENT HISTORY', 'CAREER SUMMARY',
        'VOLUNTEER', 'PUBLICATIONS', 'REFERENCES'
    }

    for line in lines:
        trimmed = line.strip()
        if not trimmed:
            continue
        upper = trimmed.upper().rstrip(':')
        is_header = upper in SECTION_HEADERS or (
            trimmed.isupper() and len(trimmed) > 2 and len(trimmed) < 50 and
            '@' not in trimmed and '|' not in trimmed and
            not trimmed.startswith(('-', '•', '*'))
        )
        if is_header:
            sections.append(current_section)
            current_section = {'title': upper, 'content': []}
        else:
            current_section['content'].append(line)
    sections.append(current_section)

    font_name = config['font']

    def hex_to_rgb(hex_color):
        hex_color = hex_color.lstrip('#')
        if len(hex_color) == 3:
            hex_color = ''.join([c*2 for c in hex_color])
        try:
            return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        except (ValueError, IndexError):
            return (0, 0, 0)

    accent_rgb = hex_to_rgb(config['accent'])
    header_rgb = hex_to_rgb(config['header_color'])

    spacing_scale = config.get('spacing_scale', 1.0)

    def render_section(section, width, x_offset=None):
        if x_offset is not None:
            pdf.set_x(x_offset)
        pdf.set_font(font_name, 'B', 12)
        pdf.set_text_color(*accent_rgb)
        pdf.multi_cell(width, 8, txt=section['title'])
        
        # Draw divider line
        line_y = pdf.get_y()
        divider_style = config.get('divider_style', 'thin-line')
        pdf.set_draw_color(*accent_rgb)
        
        x1 = x_offset or margin
        x2 = x1 + width
        
        if divider_style == 'none':
            pass
        elif divider_style == 'thick-line':
            pdf.set_line_width(1.2)
            pdf.line(x1, line_y, x2, line_y)
            pdf.set_line_width(0.2) # reset
        elif divider_style == 'double-line':
            pdf.line(x1, line_y, x2, line_y)
            pdf.line(x1, line_y + 1, x2, line_y + 1)
        elif divider_style == 'accent-bar':
            pdf.set_fill_color(*accent_rgb)
            pdf.rect(x1, line_y, 30, 2.5, 'F')
        elif divider_style == 'colored-block':
            pdf.set_fill_color(*accent_rgb)
            pdf.rect(x1, line_y - 5.5, 4.5, 6.5, 'F')
        elif divider_style == 'ornament':
            mid_x = (x1 + x2) / 2
            pdf.line(x1, line_y, mid_x - 6, line_y)
            pdf.set_fill_color(*accent_rgb)
            pdf.rect(mid_x - 2, line_y - 2, 4, 4, 'F')
            pdf.line(mid_x + 6, line_y, x2, line_y)
        elif divider_style == 'gradient-line':
            pdf.set_line_width(1.0)
            pdf.line(x1, line_y, x2, line_y)
            pdf.set_line_width(0.2)
            pdf.set_draw_color(180, 180, 180)
            pdf.line(x1, line_y + 1.5, x2, line_y + 1.5)
        else: # thin-line
            pdf.line(x1, line_y, x2, line_y)
            
        pdf.set_draw_color(0, 0, 0) # reset draw color
        pdf.ln(3 * spacing_scale)
        pdf.set_text_color(0, 0, 0)
        pdf.set_font(font_name, '', 10)
        for line in section['content']:
            if x_offset is not None:
                pdf.set_x(x_offset)
            line_strip = line.strip()
            if line_strip.startswith(('-', '•', '*')):
                pdf.set_x((x_offset or margin) + 5)
                pdf.multi_cell(width - 5, 5 * spacing_scale, txt=line_strip)
            elif ('|' in line_strip or ' at ' in line_strip) and len(line_strip) < 100:
                pdf.set_font(font_name, 'B', 10.5)
                if x_offset is not None:
                    pdf.set_x(x_offset)
                pdf.multi_cell(width, 6 * spacing_scale, txt=line_strip)
                pdf.set_font(font_name, '', 10)
            else:
                pdf.multi_cell(width, 5 * spacing_scale, txt=line_strip)
        pdf.ln(5 * spacing_scale)

    def render_header(header, width):
        if not header:
            return
        name = header['content'][0] if header['content'] else "Resume"
        contact = header['content'][1:]
        pdf.set_text_color(*header_rgb)

        ht = config['header_type']
        if ht == 'centered':
            pdf.set_font(font_name, 'B', 24)
            pdf.multi_cell(0, 15, txt=name, align='C')
            pdf.set_font(font_name, '', 10)
            pdf.set_text_color(100, 100, 100)
            if contact:
                pdf.multi_cell(0, 5, txt=" | ".join(c.strip() for c in contact), align='C')
        elif ht == 'modern-split':
            pdf.set_font(font_name, 'B', 24)
            pdf.multi_cell(width / 2, 15, txt=name)
            curr_y = pdf.get_y()
            pdf.set_xy(margin + width / 2, curr_y - 15)
            pdf.set_font(font_name, '', 9)
            pdf.set_text_color(100, 100, 100)
            for c in contact:
                pdf.set_x(margin + width / 2)
                pdf.multi_cell(width / 2, 5, txt=c.strip(), align='R')
        elif ht in ['banner', 'modern-banner', 'executive-banner']:
            # Colored banner header
            banner_h = 35
            pdf.set_fill_color(*header_rgb)
            pdf.rect(0, pdf.get_y() - margin, pdf.w, banner_h + 10, 'F')
            pdf.set_text_color(255, 255, 255)
            pdf.set_font(font_name, 'B', 22)
            pdf.multi_cell(0, 12, txt=name)
            pdf.set_font(font_name, '', 9)
            for c in contact:
                pdf.multi_cell(0, 5, txt=c.strip())
            pdf.set_text_color(0, 0, 0)
        else:  # classic
            pdf.set_font(font_name, 'B', 24)
            pdf.multi_cell(0, 15, txt=name)
            pdf.set_font(font_name, '', 10)
            pdf.set_text_color(100, 100, 100)
            for c in contact:
                pdf.multi_cell(0, 5, txt=c.strip())
        pdf.ln(10 * spacing_scale)

    is_cover_letter = len(sections) == 1 and sections[0]['title'] == 'HEADER'

    if is_cover_letter:
        content_lines = sections[0]['content']
        name = content_lines[0] if len(content_lines) > 0 else "Document"
        remaining = content_lines[1:] if len(content_lines) > 1 else []

        pdf.set_text_color(*header_rgb)
        ht = config['header_type']

        contact_info = []
        body_start_idx = 0
        for i, line in enumerate(remaining):
            if '@' in line or '|' in line or any(p in line.lower() for p in ['phone', 'mobile', 'location', 'address']):
                contact_info.append(line)
            else:
                body_start_idx = i
                break

        if ht == 'centered':
            pdf.set_font(font_name, 'B', 24)
            pdf.multi_cell(0, 15, txt=name, align='C')
            pdf.set_font(font_name, '', 10)
            pdf.set_text_color(100, 100, 100)
            if contact_info:
                pdf.multi_cell(0, 5, txt=" | ".join(c.strip() for c in contact_info), align='C')
            pdf.ln(10 * spacing_scale)
        elif ht == 'modern-split':
            pdf.set_font(font_name, 'B', 24)
            pdf.multi_cell((pdf.w - 2 * margin) / 2, 15, txt=name)
            curr_y = pdf.get_y()
            pdf.set_xy(margin + (pdf.w - 2 * margin) / 2, curr_y - 15)
            pdf.set_font(font_name, '', 9)
            pdf.set_text_color(100, 100, 100)
            for c in contact_info:
                pdf.set_x(margin + (pdf.w - 2 * margin) / 2)
                pdf.multi_cell((pdf.w - 2 * margin) / 2, 5, txt=c.strip(), align='R')
            pdf.set_xy(margin, max(curr_y, pdf.get_y()))
            pdf.ln(10 * spacing_scale)
        elif ht in ['banner', 'modern-banner', 'executive-banner']:
            banner_h = 35
            pdf.set_fill_color(*header_rgb)
            pdf.rect(0, pdf.get_y() - margin, pdf.w, banner_h + 10, 'F')
            pdf.set_text_color(255, 255, 255)
            pdf.set_font(font_name, 'B', 22)
            pdf.multi_cell(0, 12, txt=name)
            pdf.set_font(font_name, '', 9)
            for c in contact_info:
                pdf.multi_cell(0, 5, txt=c.strip())
            pdf.set_text_color(0, 0, 0)
            pdf.set_y(banner_h + 15)
            pdf.ln(10 * spacing_scale)
        else: # classic
            pdf.set_font(font_name, 'B', 24)
            pdf.multi_cell(0, 15, txt=name)
            pdf.set_font(font_name, '', 10)
            pdf.set_text_color(100, 100, 100)
            for c in contact_info:
                pdf.multi_cell(0, 5, txt=c.strip())
            pdf.ln(10 * spacing_scale)

        divider_style = config.get('divider_style', 'thin-line')
        if divider_style != 'none':
            pdf.set_draw_color(*accent_rgb)
            pdf.set_line_width(0.5)
            pdf.line(margin, pdf.get_y(), pdf.w - margin, pdf.get_y())
            pdf.ln(8 * spacing_scale)

        pdf.set_text_color(0, 0, 0)
        pdf.set_font(font_name, '', 10.5)
        for line in remaining[body_start_idx:]:
            pdf.multi_cell(0, 6 * spacing_scale, txt=line)
            pdf.ln(4 * spacing_scale)
    else:
        header_sec = next((s for s in sections if s['title'] == 'HEADER'), None)
        render_header(header_sec, pdf.w - 2 * margin)

        if 'sidebar' in config['layout'] or config['layout'] in ('grid-layout', 'two-column'):
            sidebar_sections = ['SKILLS', 'CONTACT', 'LANGUAGES', 'CERTIFICATIONS', 'AWARDS', 'EDUCATION', 'INTERESTS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES']
            sidebar = [s for s in sections if s['title'] in sidebar_sections]
            main = [s for s in sections if s['title'] not in sidebar_sections and s['title'] != 'HEADER']
            
            # For two-column, split evenly. For sidebar and grid, 1/3 and 2/3.
            if config['layout'] == 'two-column':
                col_w = (pdf.w - 2 * margin - 10) / 2
                main_w = col_w
            else:
                col_w = (pdf.w - 2 * margin - 10) / 3
                main_w = col_w * 2

            sidebar_bg = config.get('sidebar_bg')
            if sidebar_bg and sidebar_bg != 'null':
                bg_rgb = hex_to_rgb(sidebar_bg)
                pdf.set_fill_color(*bg_rgb)
                if config['layout'] in ('sidebar-left', 'grid-layout', 'two-column'):
                    pdf.rect(0, 0, margin + col_w + 5, pdf.h, 'F')
                else:
                    pdf.rect(margin + main_w + 5, 0, pdf.w - (margin + main_w + 5), pdf.h, 'F')

            start_y = pdf.get_y()
            if config['layout'] in ('sidebar-left', 'grid-layout', 'two-column'):
                for s in sidebar:
                    render_section(s, col_w, margin)
                pdf.set_y(start_y)
                for s in main:
                    render_section(s, main_w, margin + col_w + 10)
            else:
                for s in main:
                    render_section(s, main_w, margin)
                pdf.set_y(start_y)
                for s in sidebar:
                    render_section(s, col_w, margin + main_w + 10)
        else:
            for s in sections:
                if s['title'] != 'HEADER':
                    render_section(s, pdf.w - 2 * margin)

    pdf.output(output_path)
