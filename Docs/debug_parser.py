#!/usr/bin/env python3
import zipfile
import re

docx_file = "AI_Addendum_demo track changes.docx"

with zipfile.ZipFile(docx_file, "r") as z:
    with z.open("word/document.xml") as f:
        content = f.read().decode("utf-8")

# Find all paragraphs
p_pattern = r'<w:p[^>]*>(.*?)</w:p>'
paragraphs = re.findall(p_pattern, content, re.DOTALL)

# Section patterns
section_pattern = re.compile(r'^(\d+)\.\s+(.+)$')
subsection_pattern = re.compile(r'^(\d+\.\d+(?:\.\d+)?)\s+(.*)$')

print("=== ALL PARAGRAPHS ===")
for i, p in enumerate(paragraphs):
    all_text = re.findall(r'<w:t[^>]*>([^<]*)</w:t>', p)
    del_text = re.findall(r'<w:delText[^>]*>([^<]*)</w:delText>', p)
    text = "".join(all_text).strip()
    
    if not text and not del_text:
        continue
    
    has_ins = "<w:ins" in p
    has_del = "<w:del" in p
    
    sec_match = section_pattern.match(text)
    subsec_match = subsection_pattern.match(text)
    
    marker = ""
    if has_ins: marker += "[INS]"
    if has_del: marker += "[DEL]"
    if sec_match: marker += "[SEC]"
    if subsec_match: marker += "[SUB]"
    
    print(f"P{i}: {marker:15} '{text[:55]}...'")
