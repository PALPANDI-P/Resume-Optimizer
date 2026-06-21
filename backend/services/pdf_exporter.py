def create_pdf(content, output_path, template_id='cc-001'):
    from fpdf import FPDF

    TRACK_COLORS = {
        'beg': [
            {'header': '#0f172a', 'accent': '#2563eb'},
            {'header': '#1e3a8a', 'accent': '#3b82f6'},
            {'header': '#14532d', 'accent': '#16a34a'},
            {'header': '#1e293b', 'accent': '#64748b'},
            {'header': '#172554', 'accent': '#1d4ed8'},
            {'header': '#0f172a', 'accent': '#475569'},
            {'header': '#1c1917', 'accent': '#78716c'},
            {'header': '#0c4a6e', 'accent': '#0891b2'},
            {'header': '#365314', 'accent': '#65a30d'},
            {'header': '#4c1d95', 'accent': '#7c3aed'},
        ],
        'exp': [
            {'header': '#0c0a09', 'accent': '#b45309'},
            {'header': '#1e3a5f', 'accent': '#b87333'},
            {'header': '#450a0a', 'accent': '#b91c1c'},
            {'header': '#1c1917', 'accent': '#78716c'},
            {'header': '#172554', 'accent': '#1e40af'},
            {'header': '#422006', 'accent': '#a16207'},
            {'header': '#082f49', 'accent': '#0369a1'},
            {'header': '#1a1a2e', 'accent': '#c9a227'},
            {'header': '#212529', 'accent': '#6c757d'},
            {'header': '#2d1b00', 'accent': '#d97706'},
        ],
        'it': [
            {'header': '#0f172a', 'accent': '#0284c7'},
            {'header': '#312e81', 'accent': '#6d28d9'},
            {'header': '#022c22', 'accent': '#0d9488'},
            {'header': '#1e1b4b', 'accent': '#4f46e5'},
            {'header': '#0f172a', 'accent': '#06b6d4'},
            {'header': '#172554', 'accent': '#2563eb'},
            {'header': '#1a1a2e', 'accent': '#6366f1'},
            {'header': '#0c4a6e', 'accent': '#0ea5e9'},
            {'header': '#1e293b', 'accent': '#8b5cf6'},
            {'header': '#134e4a', 'accent': '#14b8a6'},
        ],
        'gov': [
            {'header': '#0f172a', 'accent': '#1e40af'},
            {'header': '#14532d', 'accent': '#15803d'},
            {'header': '#1c1917', 'accent': '#57534e'},
            {'header': '#1e3a8a', 'accent': '#1d4ed8'},
            {'header': '#064e3b', 'accent': '#047857'},
            {'header': '#292524', 'accent': '#78716c'},
            {'header': '#0c4a6e', 'accent': '#0284c7'},
            {'header': '#1e293b', 'accent': '#475569'},
            {'header': '#365314', 'accent': '#4d7c0f'},
            {'header': '#3f6212', 'accent': '#65a30d'},
        ],
        'biz': [
            {'header': '#0f172a', 'accent': '#1e40af'},
            {'header': '#1e3a5f', 'accent': '#0f766e'},
            {'header': '#1c1917', 'accent': '#44403c'},
            {'header': '#172554', 'accent': '#1e40af'},
            {'header': '#0f172a', 'accent': '#475569'},
            {'header': '#292524', 'accent': '#78716c'},
            {'header': '#1e293b', 'accent': '#64748b'},
            {'header': '#0c4a6e', 'accent': '#0284c7'},
            {'header': '#1c1917', 'accent': '#b91c1c'},
            {'header': '#1e3a8a', 'accent': '#2563eb'},
        ],
    }

    TRACK_FONTS = {
        'beg': [
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Times', 'secondary': 'Times'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
        ],
        'exp': [
            {'primary': 'Times', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Times', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Times', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Times', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Times', 'secondary': 'Helvetica'},
        ],
        'it': [
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
        ],
        'gov': [
            {'primary': 'Times', 'secondary': 'Times'},
            {'primary': 'Times', 'secondary': 'Times'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Times', 'secondary': 'Times'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Times', 'secondary': 'Times'},
            {'primary': 'Times', 'secondary': 'Times'},
        ],
        'biz': [
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
            {'primary': 'Times', 'secondary': 'Times'},
            {'primary': 'Helvetica', 'secondary': 'Helvetica'},
        ],
    }

    TRACK_HEADER_TYPES = {
        'beg': ['classic', 'classic', 'classic', 'classic', 'modern-split', 'centered', 'classic', 'classic', 'modern-split', 'centered'],
        'exp': ['modern-banner', 'classic', 'centered', 'centered', 'modern-split', 'classic', 'modern-banner', 'modern-banner', 'classic', 'centered'],
        'it':  ['modern-split', 'modern-banner', 'modern-split', 'modern-banner', 'modern-banner', 'modern-split', 'classic', 'classic', 'modern-banner', 'modern-split'],
        'gov': ['classic', 'classic', 'classic', 'centered', 'classic', 'centered', 'classic', 'centered', 'classic', 'classic'],
        'biz': ['modern-split', 'modern-banner', 'modern-split', 'classic', 'modern-split', 'modern-split', 'classic', 'classic', 'modern-banner', 'modern-split'],
    }

    TRACK_DIVIDERS = {
        'beg': ['none', 'thin-line', 'thin-line', 'thin-line', 'none', 'thin-line', 'accent-bar', 'accent-bar', 'accent-bar', 'thin-line'],
        'exp': ['thick-line', 'double-line', 'ornament', 'ornament', 'colored-block', 'accent-bar', 'colored-block', 'thick-line', 'double-line', 'thin-line'],
        'it':  ['accent-bar', 'gradient-line', 'gradient-line', 'accent-bar', 'gradient-line', 'accent-bar', 'thin-line', 'thin-line', 'gradient-line', 'accent-bar'],
        'gov': ['thin-line', 'thin-line', 'none', 'thin-line', 'thin-line', 'thin-line', 'thin-line', 'none', 'thin-line', 'thin-line'],
        'biz': ['accent-bar', 'colored-block', 'accent-bar', 'accent-bar', 'thick-line', 'thick-line', 'thin-line', 'accent-bar', 'double-line', 'thin-line'],
    }

    TRACK_SPACING = {
        'beg': [0.95, 1.0, 0.95, 1.0, 1.0, 0.95, 1.0, 1.05, 1.0, 0.95],
        'exp': [1.1, 1.15, 1.15, 1.2, 1.1, 1.05, 1.1, 1.15, 1.1, 1.05],
        'it':  [1.0, 1.05, 1.0, 1.05, 1.05, 1.0, 1.0, 1.0, 1.05, 1.0],
        'gov': [0.95, 1.0, 1.0, 0.95, 1.0, 1.0, 0.95, 1.0, 1.0, 0.95],
        'biz': [1.05, 1.05, 1.0, 1.05, 1.1, 1.05, 1.0, 1.0, 1.1, 1.0],
    }

    TRACK_LAYOUTS = {
        'beg': ['single-column', 'single-column', 'single-column', 'single-column', 'single-column', 'sidebar-right', 'two-column', 'sidebar-right', 'two-column', 'single-column'],
        'exp': ['single-column', 'single-column', 'single-column', 'single-column', 'single-column', 'grid-layout', 'grid-layout', 'single-column', 'single-column', 'single-column'],
        'it':  ['sidebar-left', 'single-column', 'sidebar-left', 'single-column', 'single-column', 'sidebar-left', 'single-column', 'single-column', 'single-column', 'sidebar-left'],
        'gov': ['single-column', 'single-column', 'single-column', 'single-column', 'single-column', 'single-column', 'single-column', 'single-column', 'single-column', 'single-column'],
        'biz': ['single-column', 'single-column', 'single-column', 'single-column', 'single-column', 'sidebar-left', 'single-column', 'single-column', 'single-column', 'sidebar-left'],
    }

    def build_template_style(template_id):
        parts = template_id.split('-')
        if len(parts) != 3:
            return None
        track_key, num_str = parts[0], parts[2]
        track_map = {'beg': 'beg', 'exp': 'exp', 'it': 'it', 'gov': 'gov', 'biz': 'biz'}
        key = track_map.get(track_key)
        if not key:
            return None
        try:
            idx = int(num_str) - 1
        except ValueError:
            return None
        mod = idx % 10
        if key not in TRACK_COLORS or mod >= len(TRACK_COLORS[key]):
            return None
        return {
            'font': TRACK_FONTS[key][mod]['primary'],
            'header_color': TRACK_COLORS[key][mod]['header'],
            'accent': TRACK_COLORS[key][mod]['accent'],
            'layout': TRACK_LAYOUTS[key][mod],
            'header_type': TRACK_HEADER_TYPES[key][mod],
            'sidebar_bg': '#f8fafc',
            'divider_style': TRACK_DIVIDERS[key][mod],
            'spacing_scale': TRACK_SPACING[key][mod],
        }

    # Static entries for non-generated IDs
    STATIC_STYLES = {
        'ats-001': {'font': 'Helvetica', 'header_color': '#0f172a', 'accent': '#1e40af', 'layout': 'single-column', 'header_type': 'classic', 'sidebar_bg': 'null', 'divider_style': 'thin-line', 'spacing_scale': 1.0},
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

    def get_style(tid):
        if tid in STATIC_STYLES:
            return STATIC_STYLES[tid]
        generated = build_template_style(tid)
        if generated:
            return generated
        return {'font': 'Helvetica', 'header_color': '#000000', 'accent': '#000000', 'layout': 'single-column', 'header_type': 'classic', 'sidebar_bg': 'null', 'divider_style': 'thin-line', 'spacing_scale': 1.0}

    config = get_style(template_id)

    DEFAULT_STYLE = {'font': 'Helvetica', 'header_color': '#000000', 'accent': '#000000', 'layout': 'single-column', 'header_type': 'classic', 'sidebar_bg': 'null', 'divider_style': 'thin-line', 'spacing_scale': 1.0}

    pdf = FPDF()
    margin = 15
    pdf.set_margins(margin, margin, margin)
    pdf.set_auto_page_break(True, margin=margin)
    pdf.add_page()

    encoded_content = content.encode('latin-1', 'replace').decode('latin-1')
    lines = encoded_content.split('\n')

    sections = []
    current_section = {'title': 'HEADER', 'content': []}

    SECTION_HEADERS = {
        'PROFESSIONAL SUMMARY', 'SUMMARY', 'OBJECTIVE', 'SKILLS', 'WORK EXPERIENCE',
        'EXPERIENCE', 'EDUCATION', 'PROJECTS', 'CERTIFICATIONS', 'AWARDS',
        'LANGUAGES', 'CONTACT', 'INTERESTS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES',
        'PROFESSIONAL EXPERIENCE', 'EMPLOYMENT HISTORY', 'CAREER SUMMARY',
        'VOLUNTEER', 'PUBLICATIONS', 'REFERENCES',
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
        pdf.multi_cell(width, 8 * spacing_scale, txt=section['title'])

        line_y = pdf.get_y()
        divider_style = config.get('divider_style', 'thin-line')
        pdf.set_draw_color(*accent_rgb)

        x1 = x_offset if x_offset is not None else margin
        x2 = x1 + width

        if divider_style == 'none':
            pass
        elif divider_style == 'thick-line':
            pdf.set_line_width(1.2)
            pdf.line(x1, line_y, x2, line_y)
            pdf.set_line_width(0.2)
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
        else:
            pdf.line(x1, line_y, x2, line_y)

        pdf.set_draw_color(0, 0, 0)
        pdf.ln(3 * spacing_scale)
        pdf.set_text_color(0, 0, 0)
        pdf.set_font(font_name, '', 10)
        for line in section['content']:
            if x_offset is not None:
                pdf.set_x(x_offset)
            line_strip = line.strip()
            if line_strip.startswith(('-', '•', '*')):
                pdf.set_x((x_offset if x_offset is not None else margin) + 5)
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
        content_end_y = None

        if ht == 'centered':
            pdf.set_font(font_name, 'B', 24)
            pdf.multi_cell(0, 15 * spacing_scale, txt=name, align='C')
            pdf.set_font(font_name, '', 10)
            pdf.set_text_color(100, 100, 100)
            if contact:
                pdf.multi_cell(0, 5 * spacing_scale, txt=" | ".join(c.strip() for c in contact), align='C')
            content_end_y = pdf.get_y()
        elif ht == 'modern-split':
            pdf.set_font(font_name, 'B', 24)
            pdf.multi_cell(width / 2, 15 * spacing_scale, txt=name)
            curr_y = pdf.get_y()
            half_width = width / 2
            pdf.set_xy(margin + half_width, curr_y - (15 * spacing_scale))
            pdf.set_font(font_name, '', 9)
            pdf.set_text_color(100, 100, 100)
            for c in contact:
                pdf.set_x(margin + half_width)
                pdf.multi_cell(half_width, 5 * spacing_scale, txt=c.strip(), align='R')
            content_end_y = max(curr_y, pdf.get_y())
            pdf.set_xy(margin, content_end_y)
        elif ht in ['banner', 'modern-banner', 'executive-banner']:
            banner_h = 35
            total_banner_h = banner_h + 10 + (len(contact) * 5 * spacing_scale)
            pdf.set_fill_color(*header_rgb)
            pdf.rect(margin, pdf.get_y(), pdf.w - 2 * margin, total_banner_h, 'F')
            pdf.set_text_color(255, 255, 255)
            pdf.set_font(font_name, 'B', 22)
            pdf.multi_cell(0, 12 * spacing_scale, txt=name)
            pdf.set_font(font_name, '', 9)
            for c in contact:
                pdf.multi_cell(0, 5 * spacing_scale, txt=c.strip())
            pdf.set_text_color(0, 0, 0)
            pdf.set_y(pdf.get_y() + 5 * spacing_scale)
        else:
            pdf.set_font(font_name, 'B', 24)
            pdf.multi_cell(0, 15 * spacing_scale, txt=name)
            pdf.set_font(font_name, '', 10)
            pdf.set_text_color(100, 100, 100)
            for c in contact:
                pdf.multi_cell(0, 5 * spacing_scale, txt=c.strip())
            content_end_y = pdf.get_y()
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
            pdf.multi_cell(0, 15 * spacing_scale, txt=name, align='C')
            pdf.set_font(font_name, '', 10)
            pdf.set_text_color(100, 100, 100)
            if contact_info:
                pdf.multi_cell(0, 5 * spacing_scale, txt=" | ".join(c.strip() for c in contact_info), align='C')
            pdf.ln(10 * spacing_scale)
        elif ht == 'modern-split':
            pdf.set_font(font_name, 'B', 24)
            pdf.multi_cell((pdf.w - 2 * margin) / 2, 15 * spacing_scale, txt=name)
            curr_y = pdf.get_y()
            half_width = (pdf.w - 2 * margin) / 2
            pdf.set_xy(margin + half_width, curr_y - (15 * spacing_scale))
            pdf.set_font(font_name, '', 9)
            pdf.set_text_color(100, 100, 100)
            for c in contact_info:
                pdf.set_x(margin + half_width)
                pdf.multi_cell(half_width, 5 * spacing_scale, txt=c.strip(), align='R')
            pdf.set_xy(margin, max(curr_y, pdf.get_y()))
            pdf.ln(10 * spacing_scale)
        elif ht in ['banner', 'modern-banner', 'executive-banner']:
            banner_h = 35
            total_banner_h = banner_h + 10 + (len(contact_info) * 5 * spacing_scale)
            pdf.set_fill_color(*header_rgb)
            pdf.rect(margin, pdf.get_y(), pdf.w - 2 * margin, total_banner_h, 'F')
            pdf.set_text_color(255, 255, 255)
            pdf.set_font(font_name, 'B', 22)
            pdf.multi_cell(0, 12 * spacing_scale, txt=name)
            pdf.set_font(font_name, '', 9)
            for c in contact_info:
                pdf.multi_cell(0, 5 * spacing_scale, txt=c.strip())
            pdf.set_text_color(0, 0, 0)
            pdf.set_y(pdf.get_y() + 5 * spacing_scale)
            pdf.ln(10 * spacing_scale)
        else:
            pdf.set_font(font_name, 'B', 24)
            pdf.multi_cell(0, 15 * spacing_scale, txt=name)
            pdf.set_font(font_name, '', 10)
            pdf.set_text_color(100, 100, 100)
            for c in contact_info:
                pdf.multi_cell(0, 5 * spacing_scale, txt=c.strip())
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

        if config['layout'] == 'timeline':
            for s in sections:
                if s['title'] != 'HEADER':
                    render_section(s, pdf.w - 2 * margin)
        elif 'sidebar' in config['layout'] or config['layout'] in ('grid-layout', 'two-column'):
            sidebar_sections = ['SKILLS', 'CONTACT', 'LANGUAGES', 'CERTIFICATIONS', 'AWARDS', 'EDUCATION', 'INTERESTS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES']
            sidebar = [s for s in sections if s['title'] in sidebar_sections]
            main = [s for s in sections if s['title'] not in sidebar_sections and s['title'] != 'HEADER']

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
                    pdf.rect(margin, 0, col_w + 5, pdf.h, 'F')
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
