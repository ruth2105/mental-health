"""
PDF Processing Utilities for Mental Health App
Supports: text extraction, PDF generation, and file handling
"""

import os
from pathlib import Path
from typing import Optional, Dict, List
import logging

logger = logging.getLogger(__name__)

# Try to import PDF libraries (install if needed)
try:
    import PyPDF2
    PYPDF2_AVAILABLE = True
except ImportError:
    PYPDF2_AVAILABLE = False
    logger.warning("PyPDF2 not installed. Install with: pip install PyPDF2")

try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib import colors
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    logger.warning("ReportLab not installed. Install with: pip install reportlab")

try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False
    logger.warning("pdfplumber not installed. Install with: pip install pdfplumber")


class PDFExtractor:
    """Extract text and data from PDF files"""
    
    @staticmethod
    def extract_text_pypdf2(pdf_path: str) -> str:
        """Extract text using PyPDF2 (basic extraction)"""
        if not PYPDF2_AVAILABLE:
            raise ImportError("PyPDF2 is not installed")
        
        text = ""
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            logger.error(f"Error extracting text with PyPDF2: {e}")
            raise
        
        return text.strip()
    
    @staticmethod
    def extract_text_pdfplumber(pdf_path: str) -> str:
        """Extract text using pdfplumber (better for complex layouts)"""
        if not PDFPLUMBER_AVAILABLE:
            raise ImportError("pdfplumber is not installed")
        
        text = ""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            logger.error(f"Error extracting text with pdfplumber: {e}")
            raise
        
        return text.strip()
    
    @staticmethod
    def extract_text(pdf_path: str, method: str = 'auto') -> str:
        """
        Extract text from PDF using best available method
        
        Args:
            pdf_path: Path to PDF file
            method: 'auto', 'pypdf2', or 'pdfplumber'
        """
        if method == 'auto':
            # Try pdfplumber first (better quality), fallback to PyPDF2
            if PDFPLUMBER_AVAILABLE:
                return PDFExtractor.extract_text_pdfplumber(pdf_path)
            elif PYPDF2_AVAILABLE:
                return PDFExtractor.extract_text_pypdf2(pdf_path)
            else:
                raise ImportError("No PDF extraction library available")
        elif method == 'pdfplumber':
            return PDFExtractor.extract_text_pdfplumber(pdf_path)
        elif method == 'pypdf2':
            return PDFExtractor.extract_text_pypdf2(pdf_path)
        else:
            raise ValueError(f"Unknown method: {method}")
    
    @staticmethod
    def get_pdf_info(pdf_path: str) -> Dict:
        """Get PDF metadata and information"""
        if not PYPDF2_AVAILABLE:
            raise ImportError("PyPDF2 is not installed")
        
        info = {}
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                info['num_pages'] = len(reader.pages)
                info['metadata'] = reader.metadata
                
                if reader.metadata:
                    info['title'] = reader.metadata.get('/Title', 'N/A')
                    info['author'] = reader.metadata.get('/Author', 'N/A')
                    info['subject'] = reader.metadata.get('/Subject', 'N/A')
                    info['creator'] = reader.metadata.get('/Creator', 'N/A')
        except Exception as e:
            logger.error(f"Error getting PDF info: {e}")
            raise
        
        return info
    
    @staticmethod
    def extract_tables(pdf_path: str) -> List[List]:
        """Extract tables from PDF (requires pdfplumber)"""
        if not PDFPLUMBER_AVAILABLE:
            raise ImportError("pdfplumber is not installed")
        
        tables = []
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_tables = page.extract_tables()
                    if page_tables:
                        tables.extend(page_tables)
        except Exception as e:
            logger.error(f"Error extracting tables: {e}")
            raise
        
        return tables


class PDFGenerator:
    """Generate PDF documents"""
    
    @staticmethod
    def create_simple_pdf(output_path: str, title: str, content: str):
        """Create a simple PDF with title and content"""
        if not REPORTLAB_AVAILABLE:
            raise ImportError("ReportLab is not installed")
        
        try:
            doc = SimpleDocTemplate(output_path, pagesize=letter)
            styles = getSampleStyleSheet()
            story = []
            
            # Title
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=colors.HexColor('#2c3e50'),
                spaceAfter=30,
            )
            story.append(Paragraph(title, title_style))
            story.append(Spacer(1, 0.2 * inch))
            
            # Content
            for paragraph in content.split('\n\n'):
                if paragraph.strip():
                    story.append(Paragraph(paragraph, styles['BodyText']))
                    story.append(Spacer(1, 0.1 * inch))
            
            doc.build(story)
            logger.info(f"PDF created successfully: {output_path}")
        except Exception as e:
            logger.error(f"Error creating PDF: {e}")
            raise
    
    @staticmethod
    def create_therapy_report(
        output_path: str,
        patient_name: str,
        therapist_name: str,
        session_date: str,
        session_notes: str,
        diagnosis: Optional[str] = None,
        recommendations: Optional[str] = None
    ):
        """Create a therapy session report PDF"""
        if not REPORTLAB_AVAILABLE:
            raise ImportError("ReportLab is not installed")
        
        try:
            doc = SimpleDocTemplate(output_path, pagesize=letter)
            styles = getSampleStyleSheet()
            story = []
            
            # Header
            story.append(Paragraph("Therapy Session Report", styles['Title']))
            story.append(Spacer(1, 0.3 * inch))
            
            # Session Info Table
            data = [
                ['Patient:', patient_name],
                ['Therapist:', therapist_name],
                ['Date:', session_date],
            ]
            
            table = Table(data, colWidths=[2*inch, 4*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.grey),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 12),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(table)
            story.append(Spacer(1, 0.3 * inch))
            
            # Diagnosis
            if diagnosis:
                story.append(Paragraph("<b>Diagnosis:</b>", styles['Heading2']))
                story.append(Paragraph(diagnosis, styles['BodyText']))
                story.append(Spacer(1, 0.2 * inch))
            
            # Session Notes
            story.append(Paragraph("<b>Session Notes:</b>", styles['Heading2']))
            story.append(Paragraph(session_notes, styles['BodyText']))
            story.append(Spacer(1, 0.2 * inch))
            
            # Recommendations
            if recommendations:
                story.append(Paragraph("<b>Recommendations:</b>", styles['Heading2']))
                story.append(Paragraph(recommendations, styles['BodyText']))
            
            doc.build(story)
            logger.info(f"Therapy report created: {output_path}")
        except Exception as e:
            logger.error(f"Error creating therapy report: {e}")
            raise


class PDFManager:
    """Manage PDF files (merge, split, etc.)"""
    
    @staticmethod
    def merge_pdfs(pdf_paths: List[str], output_path: str):
        """Merge multiple PDFs into one"""
        if not PYPDF2_AVAILABLE:
            raise ImportError("PyPDF2 is not installed")
        
        try:
            merger = PyPDF2.PdfMerger()
            
            for pdf_path in pdf_paths:
                merger.append(pdf_path)
            
            merger.write(output_path)
            merger.close()
            logger.info(f"PDFs merged successfully: {output_path}")
        except Exception as e:
            logger.error(f"Error merging PDFs: {e}")
            raise
    
    @staticmethod
    def split_pdf(pdf_path: str, output_dir: str, pages_per_file: int = 1):
        """Split PDF into multiple files"""
        if not PYPDF2_AVAILABLE:
            raise ImportError("PyPDF2 is not installed")
        
        try:
            os.makedirs(output_dir, exist_ok=True)
            
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                total_pages = len(reader.pages)
                
                for i in range(0, total_pages, pages_per_file):
                    writer = PyPDF2.PdfWriter()
                    
                    for j in range(i, min(i + pages_per_file, total_pages)):
                        writer.add_page(reader.pages[j])
                    
                    output_filename = f"page_{i+1}_to_{min(i+pages_per_file, total_pages)}.pdf"
                    output_path = os.path.join(output_dir, output_filename)
                    
                    with open(output_path, 'wb') as output_file:
                        writer.write(output_file)
            
            logger.info(f"PDF split successfully into {output_dir}")
        except Exception as e:
            logger.error(f"Error splitting PDF: {e}")
            raise


# Utility function for Django views
def process_uploaded_pdf(uploaded_file, save_path: str) -> Dict:
    """
    Process an uploaded PDF file from Django request
    
    Args:
        uploaded_file: Django UploadedFile object
        save_path: Path to save the PDF
    
    Returns:
        Dict with extracted information
    """
    # Save the uploaded file
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    
    with open(save_path, 'wb+') as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)
    
    # Extract information
    result = {
        'file_path': save_path,
        'file_name': uploaded_file.name,
        'file_size': uploaded_file.size,
    }
    
    try:
        # Get PDF info
        info = PDFExtractor.get_pdf_info(save_path)
        result.update(info)
        
        # Extract text
        text = PDFExtractor.extract_text(save_path)
        result['text_content'] = text
        result['text_length'] = len(text)
        
    except Exception as e:
        logger.error(f"Error processing PDF: {e}")
        result['error'] = str(e)
    
    return result
