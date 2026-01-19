// Contract Negotiation Tracker - Document Parser Utility
// Parses DOCX, PDF, and TXT files to extract clauses for template import

import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ParsedClause {
  clauseNumber: string;
  topic: string;
  issue: string;
  clauseText: string;
  confidence: number; // 0-100 parsing confidence score
  warnings?: string[]; // Potential issues detected
}

export interface ParsedDocument {
  title: string;
  clauses: ParsedClause[];
  overallConfidence: number; // Average confidence across all clauses
  warnings?: string[]; // Document-level warnings
}

interface Paragraph {
  text: string;
  isBold: boolean;
  isHeading: boolean;
}

/**
 * Parse a DOCX file and extract clauses
 */
export async function parseDocx(file: File): Promise<ParsedDocument> {
  const zip = await JSZip.loadAsync(file);
  
  // Get the main document XML
  const documentXml = zip.file('word/document.xml');
  if (!documentXml) {
    throw new Error('Invalid DOCX file: missing document.xml');
  }

  const xmlContent = await documentXml.async('string');
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlContent, 'application/xml');

  // Extract paragraphs with formatting info
  const paragraphs = extractParagraphs(doc);
  
  // Parse structure into clauses
  const result = parseStructure(paragraphs);
  
  return result;
}

/**
 * Extract paragraphs from the document XML
 */
function extractParagraphs(doc: Document): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  
  // Get all paragraph elements (w:p)
  const pElements = doc.getElementsByTagName('w:p');
  
  for (let i = 0; i < pElements.length; i++) {
    const p = pElements[i];
    
    // Check paragraph style for headings
    const pStyle = p.getElementsByTagName('w:pStyle')[0];
    const styleName = pStyle?.getAttribute('w:val') || '';
    const isHeading = styleName.toLowerCase().includes('heading') || 
                      styleName.toLowerCase() === 'title';
    
    // Check if paragraph has bold formatting
    const runElements = p.getElementsByTagName('w:r');
    let hasBold = false;
    let text = '';
    
    for (let j = 0; j < runElements.length; j++) {
      const run = runElements[j];
      
      // Check for bold in run properties
      const rPr = run.getElementsByTagName('w:rPr')[0];
      if (rPr) {
        const bold = rPr.getElementsByTagName('w:b')[0];
        if (bold) {
          hasBold = true;
        }
      }
      
      // Get text content
      const textElements = run.getElementsByTagName('w:t');
      for (let k = 0; k < textElements.length; k++) {
        text += textElements[k].textContent || '';
      }
    }
    
    // Trim and skip empty paragraphs
    text = text.trim();
    if (text) {
      paragraphs.push({
        text,
        isBold: hasBold,
        isHeading: isHeading || styleName === 'Title'
      });
    }
  }
  
  return paragraphs;
}

/**
 * Pattern to match section headers like "1. Definitions" or "10. Miscellaneous"
 */
const SECTION_PATTERN = /^(\d+)\.\s+(.+)$/;

/**
 * Pattern to match subsection numbers like "1.1", "2.3", "10.15"
 */
const SUBSECTION_PATTERN = /^(\d+\.\d+(?:\.\d+)?)\s+(.*)$/;

/**
 * Pattern to match letter-based clauses like "A.1", "B.2"
 */
const LETTER_SUBSECTION_PATTERN = /^([A-Z]\.\d+(?:\.\d+)?)\s+(.*)$/;

/**
 * Common legal section topics for smart detection
 */
const COMMON_TOPICS = [
  'Definitions', 'License', 'Grant', 'Scope', 'Term', 'Termination',
  'Payment', 'Fees', 'Confidentiality', 'Intellectual Property', 'IP',
  'Warranty', 'Warranties', 'Indemnification', 'Indemnity', 'Liability',
  'Limitation', 'Damages', 'Insurance', 'Compliance', 'Data Protection',
  'Privacy', 'Security', 'Audit', 'Force Majeure', 'Assignment', 'Notice',
  'Notices', 'Governing Law', 'Dispute', 'Arbitration', 'Jurisdiction',
  'Miscellaneous', 'General', 'Amendment', 'Waiver', 'Severability',
  'Entire Agreement', 'Representations', 'Covenants', 'Conditions'
];

/**
 * Calculate confidence score for a parsed clause
 */
function calculateClauseConfidence(clause: Omit<ParsedClause, 'confidence' | 'warnings'>): { confidence: number; warnings: string[] } {
  let confidence = 100;
  const warnings: string[] = [];

  // Check clause number format
  if (!clause.clauseNumber || clause.clauseNumber === 'Intro' || clause.clauseNumber === 'N/A') {
    confidence -= 20;
    warnings.push('Missing or unclear clause number');
  }

  // Check topic
  if (!clause.topic || clause.topic === 'General') {
    confidence -= 15;
    warnings.push('Topic could not be determined');
  }

  // Check clause text length
  if (clause.clauseText.length < 20) {
    confidence -= 25;
    warnings.push('Clause text appears too short');
  } else if (clause.clauseText.length < 50) {
    confidence -= 10;
    warnings.push('Clause text may be incomplete');
  }

  // Check issue extraction
  if (!clause.issue || clause.issue.length < 3) {
    confidence -= 10;
    warnings.push('Issue summary could not be extracted');
  }

  // Bonus for recognized topic names
  if (COMMON_TOPICS.some(t => clause.topic.toLowerCase().includes(t.toLowerCase()))) {
    confidence = Math.min(100, confidence + 10);
  }

  return { confidence: Math.max(0, confidence), warnings };
}

/**
 * Parse paragraphs into structured clauses with confidence scoring
 */
function parseStructure(paragraphs: Paragraph[]): ParsedDocument {
  const clauses: ParsedClause[] = [];
  const documentWarnings: string[] = [];
  let title = '';
  let currentSection = '';
  let currentTopic = '';
  
  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    const text = para.text;
    
    // Check for document title (first bold/heading paragraph)
    if (i === 0 && (para.isHeading || para.isBold)) {
      title = text;
      continue;
    }
    
    // Skip subtitle/disclaimer paragraphs early in document
    if (i < 3 && text.toLowerCase().includes('demonstration') || 
        text.toLowerCase().includes('demo') ||
        text.toLowerCase().includes('not legal advice')) {
      continue;
    }
    
    // Check for section header (bold + pattern like "1. Definitions")
    const sectionMatch = text.match(SECTION_PATTERN);
    if (sectionMatch && para.isBold) {
      currentSection = sectionMatch[1];
      currentTopic = sectionMatch[2];
      continue;
    }
    
    // Check for subsection (pattern like "1.1 Something" or "A.1 Something")
    const subsectionMatch = text.match(SUBSECTION_PATTERN) || text.match(LETTER_SUBSECTION_PATTERN);
    if (subsectionMatch) {
      const clauseNumber = subsectionMatch[1];
      const restOfText = subsectionMatch[2];
      
      // Extract the subclause title/topic from the beginning of the clause
      let subclauseTopic = '';
      let clauseText = restOfText;
      
      // Check if starts with quoted term (definition pattern like '"Affiliate" means...')
      const defMatch = restOfText.match(/^"([^"]+)"\s*(.*)$/);
      if (defMatch) {
        subclauseTopic = defMatch[1];
        clauseText = restOfText; // Keep full text including the quoted term
      } else {
        // Check for pattern like "Term. This Agreement..." or "Fees. Customer will pay..."
        const titleMatch = restOfText.match(/^([A-Z][a-zA-Z\s]+?)[\.\:]\s*(.*)$/);
        if (titleMatch && titleMatch[1].length < 50) {
          subclauseTopic = titleMatch[1].trim();
          clauseText = restOfText; // Keep full text including the title
        } else {
          // Check for pattern like "Invoicing and payment. Vendor will..."
          const multiWordTitleMatch = restOfText.match(/^([A-Z][a-zA-Z\s,;]+?)[\.\:]\s+[A-Z](.*)$/);
          if (multiWordTitleMatch && multiWordTitleMatch[1].length < 60) {
            subclauseTopic = multiWordTitleMatch[1].trim();
            clauseText = restOfText;
          } else {
            // Use first few words as topic summary
            const words = restOfText.split(/\s+/);
            if (words.length > 3) {
              subclauseTopic = words.slice(0, 3).join(' ');
              if (words.length > 3) subclauseTopic += '...';
            } else {
              subclauseTopic = restOfText.slice(0, 50);
            }
          }
        }
      }
      
      const baseClause = {
        clauseNumber,
        // Use subclause title as topic, fall back to section topic if none found
        topic: subclauseTopic || currentTopic || 'General',
        issue: currentTopic || 'General', // Use section as the category/issue
        clauseText: restOfText
      };
      
      const { confidence, warnings } = calculateClauseConfidence(baseClause);
      clauses.push({ ...baseClause, confidence, warnings: warnings.length > 0 ? warnings : undefined });
      continue;
    }
    
    // For non-numbered bold paragraphs that look like section headers
    if (para.isBold && text.length < 100 && !text.includes('.') && i > 2) {
      currentTopic = text;
      continue;
    }
    
    // Check if this looks like a main section without subsections (standalone clause)
    if (sectionMatch && !para.isBold) {
      // This is a numbered clause without bold formatting
      const clauseNumber = sectionMatch[1];
      const restOfText = sectionMatch[2];
      
      const baseClause = {
        clauseNumber,
        topic: currentTopic || 'General',
        issue: restOfText.slice(0, 50) + (restOfText.length > 50 ? '...' : ''),
        clauseText: restOfText
      };
      
      const { confidence, warnings } = calculateClauseConfidence(baseClause);
      clauses.push({ ...baseClause, confidence, warnings: warnings.length > 0 ? warnings : undefined });
      continue;
    }
    
    // If we have a current section and this is a substantial paragraph without numbering,
    // it might be introductory text - we can include it as a clause
    if (currentSection === '' && text.length > 100 && !text.match(/^\d/)) {
      // This is likely an introductory paragraph
      const baseClause = {
        clauseNumber: 'Intro',
        topic: 'Introduction',
        issue: 'Preamble',
        clauseText: text
      };
      
      const { confidence, warnings } = calculateClauseConfidence(baseClause);
      clauses.push({ ...baseClause, confidence, warnings: warnings.length > 0 ? warnings : undefined });
    }
  }
  
  // Calculate overall confidence
  const overallConfidence = clauses.length > 0 
    ? Math.round(clauses.reduce((sum, c) => sum + c.confidence, 0) / clauses.length)
    : 0;
  
  // Document-level warnings
  const docWarnings: string[] = [];
  if (clauses.length === 0) {
    docWarnings.push('No clauses could be extracted from the document');
  }
  if (clauses.length < 5) {
    docWarnings.push('Very few clauses detected - document may not be a standard contract');
  }
  const lowConfidenceClauses = clauses.filter(c => c.confidence < 70);
  if (lowConfidenceClauses.length > 0) {
    docWarnings.push(`${lowConfidenceClauses.length} clause(s) may need manual review`);
  }
  
  return { 
    title, 
    clauses,
    overallConfidence,
    warnings: docWarnings.length > 0 ? docWarnings : undefined
  };
}

/**
 * Parse plain text content into clauses
 */
export function parseText(content: string): ParsedDocument {
  const lines = content.split(/\r?\n/).filter(l => l.trim());
  const paragraphs: Paragraph[] = lines.map(line => ({
    text: line.trim(),
    isBold: false, // Can't detect bold in plain text
    isHeading: false
  }));
  
  // Treat uppercase lines as section headers
  paragraphs.forEach(p => {
    if (p.text === p.text.toUpperCase() && p.text.length < 100) {
      p.isBold = true;
    }
    // Also treat lines starting with numbers as potential headers if short
    const sectionMatch = p.text.match(SECTION_PATTERN);
    if (sectionMatch && p.text.length < 50) {
      p.isBold = true;
    }
  });
  
  return parseStructure(paragraphs);
}

/**
 * Parse a PDF file and extract text content
 */
export async function parsePdf(file: File): Promise<ParsedDocument> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const paragraphs: Paragraph[] = [];
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      let currentLine = '';
      let lastY: number | null = null;
      
      for (const item of textContent.items) {
        if ('str' in item) {
          const textItem = item as { str: string; transform: number[]; fontName?: string };
          const y = textItem.transform[5];
          
          // Check if we're on a new line (different Y position)
          if (lastY !== null && Math.abs(y - lastY) > 5) {
            if (currentLine.trim()) {
              // Detect if this might be a heading (short, potentially bold based on font)
              const isBold = textItem.fontName?.toLowerCase().includes('bold') || false;
              const isHeading = currentLine.length < 100 && (
                currentLine === currentLine.toUpperCase() ||
                currentLine.match(SECTION_PATTERN) !== null
              );
              
              paragraphs.push({
                text: currentLine.trim(),
                isBold,
                isHeading
              });
            }
            currentLine = '';
          }
          
          currentLine += textItem.str;
          lastY = y;
        }
      }
      
      // Don't forget the last line of the page
      if (currentLine.trim()) {
        paragraphs.push({
          text: currentLine.trim(),
          isBold: false,
          isHeading: false
        });
      }
      
      fullText += '\n';
    }
    
    return parseStructure(paragraphs);
  } catch (error) {
    // If PDF.js fails, try to provide a helpful error
    if (error instanceof Error && error.message.includes('password')) {
      throw new Error('This PDF is password-protected. Please provide an unprotected PDF.');
    }
    throw new Error('Failed to parse PDF. The file may be corrupted or contain only scanned images (OCR not supported).');
  }
}

/**
 * Parse a file (DOCX, PDF, or TXT) and return structured clauses
 */
export async function parseFile(file: File): Promise<ParsedDocument> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'docx':
      return parseDocx(file);
    
    case 'pdf':
      return parsePdf(file);
    
    case 'txt':
      const content = await file.text();
      return parseText(content);
    
    default:
      throw new Error(`Unsupported file format: ${extension}. Please use .docx, .pdf, or .txt files.`);
  }
}
