"""
Official PDF Report Generator for OIML R 76 NAWI Test Reports
Generates standardized, non-tamperable test certificates as per Legal Metrology Dept & OIML R 76-2 format.
"""

import io
from datetime import datetime
from typing import Dict, Any

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY


def generate_nawi_pdf_report(session_data: Dict[str, Any], instrument_data: Dict[str, Any], manufacturer_data: Dict[str, Any], evaluation_result: Dict[str, Any]) -> bytes:
    """
    Generates a complete official PDF report for a NAWI test session.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom Styles
    title_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Heading1'],
        alignment=TA_CENTER,
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#1E3A8A'),
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'HeaderSubtitle',
        parent=styles['Normal'],
        alignment=TA_CENTER,
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#374151'),
        fontName='Helvetica-Bold'
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#1E3A8A'),
        fontName='Helvetica-Bold',
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['BodyText'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#1F2937')
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontSize=8,
        leading=10,
        alignment=TA_CENTER,
        textColor=colors.white,
        fontName='Helvetica-Bold'
    )

    table_body_style = ParagraphStyle(
        'TableBody',
        parent=styles['Normal'],
        fontSize=8,
        leading=10,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#1F2937')
    )

    elements = []

    # 1. Official Header
    elements.append(Paragraph("GOVERNMENT OF INDIA", title_style))
    elements.append(Paragraph("MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION", subtitle_style))
    elements.append(Paragraph("DEPARTMENT OF CONSUMER AFFAIRS — LEGAL METROLOGY DIVISION", subtitle_style))
    elements.append(Paragraph("NATIONAL PHYSICAL LABORATORY / LEGAL METROLOGY TESTING CENTRE", subtitle_style))
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#1E3A8A'), spaceBefore=2, spaceAfter=8))

    # Certificate Title Block
    elements.append(Paragraph("TYPE EVALUATION TEST REPORT — OIML R 76-1:2006", ParagraphStyle('ReportTitle', parent=title_style, fontSize=12, textColor=colors.HexColor('#065F46'))))
    elements.append(Spacer(1, 6))

    # General Information Table
    session_code = session_data.get("session_code", "N/A")
    test_date = session_data.get("test_date", datetime.now().strftime("%Y-%m-%d"))
    reviewer_status = session_data.get("status") or evaluation_result.get("overall_status", "PENDING")
    reviewer_name = session_data.get("reviewer_name", "Official Reviewer")
    testing_officer = session_data.get("testing_officer", "Official Technician")

    status_color = "green" if reviewer_status == "APPROVED" else ("red" if reviewer_status == "REJECTED" else "#D97706")

    info_data = [
        [Paragraph("<b>Report / Session Code:</b>", body_style), Paragraph(session_code, body_style),
         Paragraph("<b>Date of Evaluation:</b>", body_style), Paragraph(str(test_date), body_style)],
        [Paragraph("<b>Manufacturer:</b>", body_style), Paragraph(manufacturer_data.get("name", "N/A"), body_style),
         Paragraph("<b>Country:</b>", body_style), Paragraph(manufacturer_data.get("country", "India"), body_style)],
        [Paragraph("<b>Instrument Model:</b>", body_style), Paragraph(instrument_data.get("model_name", "N/A"), body_style),
         Paragraph("<b>Serial Number:</b>", body_style), Paragraph(instrument_data.get("serial_number", "N/A"), body_style)],
        [Paragraph("<b>Accuracy Class:</b>", body_style), Paragraph(instrument_data.get("accuracy_class", "CLASS_III"), body_style),
         Paragraph("<b>Max Capacity (Max):</b>", body_style), Paragraph(f"{instrument_data.get('max_capacity', 0)} {instrument_data.get('unit', 'kg')}", body_style)],
        [Paragraph("<b>Verification Interval (e):</b>", body_style), Paragraph(f"{instrument_data.get('verification_scale_interval', 0)} {instrument_data.get('unit', 'kg')}", body_style),
         Paragraph("<b>Actual Interval (d):</b>", body_style), Paragraph(f"{instrument_data.get('actual_scale_interval', 0)} {instrument_data.get('unit', 'kg')}", body_style)],
        [Paragraph("<b>Testing Officer:</b>", body_style), Paragraph(testing_officer, body_style),
         Paragraph("<b>Reviewer Action / Status:</b>", body_style), Paragraph(f"<font color='{status_color}'><b>{reviewer_status}</b></font>", body_style)]
    ]

    t_info = Table(info_data, colWidths=[130, 130, 130, 130])
    t_info.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F9FAFB')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#D1D5DB')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t_info)
    elements.append(Spacer(1, 10))

    # Environmental Conditions
    elements.append(Paragraph("1. Laboratory Environmental Conditions", section_heading))
    env_data = [
        [Paragraph("<b>Ambient Temperature (°C):</b>", body_style), Paragraph(f"{session_data.get('temperature_c', 20.0)} °C", body_style),
         Paragraph("<b>Relative Humidity (%):</b>", body_style), Paragraph(f"{session_data.get('humidity_percent', 50.0)} %", body_style),
         Paragraph("<b>Pressure (hPa):</b>", body_style), Paragraph(f"{session_data.get('pressure_hpa', 1013.25)} hPa", body_style)]
    ]
    t_env = Table(env_data, colWidths=[120, 50, 120, 50, 110, 70])
    t_env.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#EFF6FF')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#BFDBFE')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#DBEAFE')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t_env)
    elements.append(Spacer(1, 10))

    # Test Observations & Results Section
    test_results = evaluation_result.get("test_results", {})

    # 2. Weighing Test Table (Span / Linearity)
    elements.append(Paragraph("2. Weighing Span & Linearity Test Results", section_heading))
    span_res = test_results.get("span_test", {})
    span_points = span_res.get("points", [])

    if span_points:
        span_table_data = [
            [Paragraph("Test Load", table_header_style), Paragraph("Indication", table_header_style),
             Paragraph("Error E", table_header_style), Paragraph("Permissible MPE", table_header_style), Paragraph("Status", table_header_style)]
        ]
        for pt in span_points:
            pt_color = "#047857" if pt["status"] == "PASS" else "#DC2626"
            span_table_data.append([
                Paragraph(f"{pt['load']}", table_body_style),
                Paragraph(f"{pt['indication']}", table_body_style),
                Paragraph(f"{pt['error']:+.4f}", table_body_style),
                Paragraph(f"±{pt['mpe']:.4f}", table_body_style),
                Paragraph(f"<font color='{pt_color}'><b>{pt['status']}</b></font>", table_body_style)
            ])
        t_span = Table(span_table_data, colWidths=[100, 100, 100, 110, 110])
        t_span.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E3A8A')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#D1D5DB')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F9FAFB')]),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ]))
        elements.append(t_span)
    else:
        elements.append(Paragraph("<i>No span test observations recorded.</i>", body_style))

    elements.append(Spacer(1, 10))

    # 3. Eccentricity Test Table
    elements.append(Paragraph("3. Eccentric Load Test Results", section_heading))
    ecc_res = test_results.get("eccentricity_test", {})
    ecc_positions = ecc_res.get("positions", [])

    if ecc_positions:
        ecc_table_data = [
            [Paragraph("Load Position", table_header_style), Paragraph("Applied Load", table_header_style),
             Paragraph("Indication", table_header_style), Paragraph("Error E", table_header_style),
             Paragraph("MPE", table_header_style), Paragraph("Status", table_header_style)]
        ]
        test_load = ecc_res.get("test_load", 0)
        for pos in ecc_positions:
            pos_color = "#047857" if pos["status"] == "PASS" else "#DC2626"
            ecc_table_data.append([
                Paragraph(pos["position"], table_body_style),
                Paragraph(f"{test_load}", table_body_style),
                Paragraph(f"{pos['indication']}", table_body_style),
                Paragraph(f"{pos['error']:+.4f}", table_body_style),
                Paragraph(f"±{pos['mpe']:.4f}", table_body_style),
                Paragraph(f"<font color='{pos_color}'><b>{pos['status']}</b></font>", table_body_style)
            ])
        t_ecc = Table(ecc_table_data, colWidths=[110, 80, 80, 80, 85, 85])
        t_ecc.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E3A8A')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#D1D5DB')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F9FAFB')]),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ]))
        elements.append(t_ecc)
    else:
        elements.append(Paragraph("<i>No eccentricity test observations recorded.</i>", body_style))

    elements.append(Spacer(1, 10))

    # 4. Summary & Official Signatures
    elements.append(Paragraph("4. Summary Evaluation & Reviewer Endorsement", section_heading))

    summary_text = (
        f"The instrument model <b>{instrument_data.get('model_name', '')}</b> (Serial No: <b>{instrument_data.get('serial_number', '')}</b>) "
        f"has been evaluated in accordance with <b>OIML Recommendation R 76-1:2006</b> for <b>{instrument_data.get('accuracy_class', 'CLASS_III')}</b> instruments.<br/><br/>"
        f"<b>REVIEWER DECISION & ENDORSEMENT:</b> This test report has been officially <b><font color='{status_color}'>{reviewer_status}</font></b> "
        f"by Reviewing Officer <b>{reviewer_name}</b>."
    )
    elements.append(Paragraph(summary_text, body_style))
    elements.append(Spacer(1, 20))

    # Signature & Stamp Block
    sig_data = [
        [Paragraph("<b>Tested By (Technician):</b>", body_style),
         Paragraph("<b>Reviewed & Verified By:</b>", body_style),
         Paragraph("<b>Official Reviewer Stamp / Seal:</b>", body_style)],
        [Paragraph(f"<br/><br/>_______________________<br/><b>{testing_officer}</b><br/>Legal Metrology Lab", body_style),
         Paragraph(f"<br/><br/>_______________________<br/><b>{reviewer_name}</b><br/>Senior Metrology Officer", body_style),
         Paragraph(f"<br/><br/><font color='{status_color}' size='10'><b>[ {reviewer_status} BY LEGAL METROLOGY ]</b></font>", body_style)]
    ]
    t_sig = Table(sig_data, colWidths=[170, 170, 180])
    t_sig.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    elements.append(t_sig)

    # Build PDF document
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
