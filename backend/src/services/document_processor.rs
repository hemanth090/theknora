use crate::models::{DocumentChunk, ProcessedDocument};
use anyhow::{anyhow, Result};
use log::{info, warn};
use std::fs;
use std::path::Path;
use std::io::Read;

pub struct DocumentProcessor {
    chunk_size: usize,
    chunk_overlap: usize,
}

impl DocumentProcessor {
    pub fn new(chunk_size: usize, chunk_overlap: usize) -> Self {
        DocumentProcessor {
            chunk_size,
            chunk_overlap,
        }
    }

    pub fn process_file(&self, file_path: &str) -> Result<ProcessedDocument> {
        self.process_file_with_name(file_path, None)
    }

    pub fn process_file_with_name(&self, file_path: &str, original_name: Option<&str>) -> Result<ProcessedDocument> {
        let path = Path::new(file_path);

        if !path.exists() {
            return Err(anyhow!("File not found: {}", file_path));
        }

        // Try to get extension from original filename first, then from file path
        let extension = if let Some(name) = original_name {
            Path::new(name)
                .extension()
                .and_then(|ext| ext.to_str())
                .map(|s| format!(".{}", s.to_lowercase()))
        } else {
            None
        }.or_else(|| {
            path
                .extension()
                .and_then(|ext| ext.to_str())
                .map(|s| format!(".{}", s.to_lowercase()))
        }).ok_or_else(|| {
            let file_name = path.file_name().map(|n| n.to_string_lossy()).unwrap_or_default();
            anyhow!("Cannot determine file extension for file: {} (path: {})", file_name, file_path)
        })?;

        let supported_extensions = [".pdf", ".txt", ".doc", ".docx", ".csv", ".xlsx", ".xls", ".md", ".pptx", ".json"];
        if !supported_extensions.contains(&extension.as_str()) {
            return Err(anyhow!("Unsupported file format: {}. Supported formats: {:?}", extension, supported_extensions));
        }

        let text = self.extract_text_by_type(path, &extension)?;

        if text.trim().is_empty() {
            return Err(anyhow!("No text content could be extracted from file"));
        }

        let chunks = self.create_chunks(&text);

        let file_size = fs::metadata(path)?.len();
        let file_name = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        info!("Successfully processed file: {} ({} bytes, {} chunks)", file_name, file_size, chunks.len());

        Ok(ProcessedDocument {
            file_path: file_path.to_string(),
            file_name,
            file_type: extension,
            text,
            num_chunks: chunks.len(),
            chunks,
            file_size,
        })
    }

    fn extract_text_by_type(&self, path: &Path, extension: &str) -> Result<String> {
        match extension {
            ".txt" => self.extract_txt_text(path),
            ".md" => self.extract_markdown_text(path),
            ".json" => self.extract_json_text(path),
            ".csv" => self.extract_csv_text(path),
            ".xlsx" | ".xls" => self.extract_excel_text(path),
            ".pdf" => self.extract_pdf_text(path),
            ".docx" => self.extract_docx_text(path),
            ".doc" => self.extract_doc_text(path),
            ".pptx" => self.extract_pptx_text(path),
            _ => Err(anyhow!("No extractor available for {}", extension)),
        }
    }

    fn extract_txt_text(&self, path: &Path) -> Result<String> {
        let content = fs::read_to_string(path)
            .map_err(|e| anyhow!("Error reading text file: {}", e))?;

        info!("Successfully extracted text from {:?}", path);
        Ok(content)
    }

    fn extract_markdown_text(&self, path: &Path) -> Result<String> {
        let content = fs::read_to_string(path)
            .map_err(|e| anyhow!("Error reading markdown file: {}", e))?;

        let text = content
            .lines()
            .map(|line| {
                let trimmed = line.trim_start_matches(|c: char| c == '#' || c == ' ' || c == '-' || c == '*');
                trimmed.trim_start_matches('*').trim_start_matches('_')
            })
            .filter(|line| !line.is_empty())
            .collect::<Vec<_>>()
            .join("\n");

        info!("Extracted markdown from {:?}", path);
        Ok(text)
    }

    fn extract_json_text(&self, path: &Path) -> Result<String> {
        let content = fs::read_to_string(path)
            .map_err(|e| anyhow!("Error reading JSON file: {}", e))?;

        match serde_json::from_str::<serde_json::Value>(&content) {
            Ok(json) => {
                let text = self.json_to_text(&json);
                info!("Extracted JSON from {:?}", path);
                Ok(text)
            }
            Err(e) => Err(anyhow!("Failed to parse JSON: {}", e))
        }
    }

    fn json_to_text(&self, value: &serde_json::Value) -> String {
        match value {
            serde_json::Value::Object(obj) => {
                obj.iter()
                    .map(|(k, v)| format!("{}: {}", k, self.json_to_text(v)))
                    .collect::<Vec<_>>()
                    .join("\n")
            }
            serde_json::Value::Array(arr) => {
                arr.iter()
                    .map(|v| self.json_to_text(v))
                    .collect::<Vec<_>>()
                    .join("\n")
            }
            serde_json::Value::String(s) => s.clone(),
            serde_json::Value::Number(n) => n.to_string(),
            serde_json::Value::Bool(b) => b.to_string(),
            serde_json::Value::Null => String::new(),
        }
    }

    fn extract_csv_text(&self, path: &Path) -> Result<String> {
        let content = fs::read_to_string(path)
            .map_err(|e| anyhow!("Error reading CSV file: {}", e))?;

        let mut text = format!("Document: {}\n\n", path.file_name().unwrap_or_default().to_string_lossy());

        let mut reader = csv::Reader::from_reader(content.as_bytes());

        if let Ok(headers) = reader.headers() {
            let header_text = headers.iter().collect::<Vec<_>>().join(" | ");
            text.push_str(&header_text);
            text.push_str("\n---\n");
        }

        for result in reader.records() {
            if let Ok(record) = result {
                text.push_str(&record.iter().collect::<Vec<_>>().join(" | "));
                text.push('\n');
            }
        }

        info!("Extracted CSV from {:?}", path);
        Ok(text)
    }

    fn extract_excel_text(&self, path: &Path) -> Result<String> {
        use calamine::{Reader, Xlsx};

        let file = fs::File::open(path)
            .map_err(|e| anyhow!("Failed to open Excel file: {}", e))?;

        let mut workbook: Xlsx<_> = Xlsx::new(file)
            .map_err(|e| anyhow!("Failed to open Excel file: {}", e))?;

        let mut text = String::new();
        let sheet_names: Vec<_> = workbook.sheet_names().to_vec();

        for sheet_name in sheet_names {
            text.push_str(&format!("Sheet: {}\n", sheet_name));
            text.push_str(&"─".repeat(50));
            text.push('\n');

            if let Some(Ok(range)) = workbook.worksheet_range(&sheet_name) {
                for row in range.rows() {
                    let row_text: Vec<String> = row
                        .iter()
                        .map(|cell| cell.to_string())
                        .collect();
                    text.push_str(&row_text.join(" | "));
                    text.push('\n');
                }
            } else {
                warn!("Could not read sheet {}", sheet_name);
            }
            text.push('\n');
        }

        info!("Extracted Excel from {:?}", path);
        Ok(text)
    }

    fn extract_pdf_text(&self, path: &Path) -> Result<String> {
        // Try using pdf-extract library first
        match pdf_extract::extract_text(path.to_str().ok_or_else(|| anyhow!("Invalid path"))?) {
            Ok(text) => {
                if !text.trim().is_empty() {
                    info!("Extracted PDF from {:?} using pdf-extract", path);
                    return Ok(text);
                }
            }
            Err(e) => {
                warn!("pdf-extract failed: {}, trying fallback method", e);
            }
        }

        // Fallback to byte-level extraction
        let mut file = fs::File::open(path)
            .map_err(|e| anyhow!("Failed to open PDF file: {}", e))?;

        let mut content = Vec::new();
        file.read_to_end(&mut content)
            .map_err(|e| anyhow!("Failed to read PDF file: {}", e))?;

        let text = self.extract_text_from_pdf_bytes(&content);

        if text.is_empty() {
            warn!("No text extracted from PDF");
            return Err(anyhow!("Could not extract text from PDF - file may be image-based or encrypted"));
        }

        info!("Extracted PDF from {:?} using fallback method", path);
        Ok(text)
    }

    fn extract_text_from_pdf_bytes(&self, content: &[u8]) -> String {
        let mut text = String::new();
        let mut in_text_object = false;
        let mut current_text = String::new();

        // More robust extraction looking for text between BT/ET markers
        let mut i = 0;
        while i < content.len() {
            // Look for BT marker
            if i + 2 <= content.len() && &content[i..i + 2] == b"BT"
                && (i == 0 || content[i - 1].is_ascii_whitespace()) {
                in_text_object = true;
                i += 2;
                continue;
            }

            // Look for ET marker
            if in_text_object && i + 2 <= content.len() && &content[i..i + 2] == b"ET"
                && (i + 2 >= content.len() || content[i + 2].is_ascii_whitespace()) {
                in_text_object = false;
                if !current_text.trim().is_empty() {
                    text.push_str(&current_text);
                    text.push('\n');
                    current_text.clear();
                }
                i += 2;
                continue;
            }

            // Extract strings within parentheses when in text object
            if in_text_object && content[i] == b'(' {
                let mut j = i + 1;
                let mut paren_depth = 1;
                while j < content.len() && paren_depth > 0 {
                    if content[j] == b'\\' && j + 1 < content.len() {
                        j += 2;
                        continue;
                    }
                    if content[j] == b'(' {
                        paren_depth += 1;
                    } else if content[j] == b')' {
                        paren_depth -= 1;
                    }
                    j += 1;
                }
                if j > i + 1 {
                    for k in (i + 1)..(j - 1) {
                        let c = content[k];
                        if c >= 32 && c <= 126 {
                            current_text.push(c as char);
                        } else if c == b'\n' || c == b'\r' {
                            current_text.push(' ');
                        }
                    }
                    current_text.push(' ');
                }
                i = j;
                continue;
            }

            i += 1;
        }

        // Clean up the extracted text
        text.split_whitespace().collect::<Vec<_>>().join(" ")
    }

    fn extract_docx_text(&self, path: &Path) -> Result<String> {
        use zip::ZipArchive;

        let file = fs::File::open(path)
            .map_err(|e| anyhow!("Failed to open DOCX file: {}", e))?;

        let mut archive = ZipArchive::new(file)
            .map_err(|e| anyhow!("Failed to read DOCX archive: {}", e))?;

        let mut document_xml = archive
            .by_name("word/document.xml")
            .map_err(|e| anyhow!("Failed to find document.xml in DOCX: {}", e))?;

        let mut xml_content = String::new();
        document_xml
            .read_to_string(&mut xml_content)
            .map_err(|e| anyhow!("Failed to read document.xml: {}", e))?;

        let text = self.extract_text_from_xml(&xml_content);

        info!("Extracted DOCX from {:?}", path);
        Ok(text)
    }

    fn extract_text_from_xml(&self, xml: &str) -> String {
        let mut text = String::new();
        let mut inside_tag = false;
        let mut current_text = String::new();

        for ch in xml.chars() {
            match ch {
                '<' => {
                    inside_tag = true;
                    if !current_text.is_empty() {
                        text.push_str(&current_text);
                        text.push(' ');
                        current_text.clear();
                    }
                }
                '>' => {
                    inside_tag = false;
                }
                _ if !inside_tag => {
                    current_text.push(ch);
                }
                _ => {}
            }
        }

        if !current_text.is_empty() {
            text.push_str(&current_text);
        }

        text.split_whitespace().collect::<Vec<_>>().join(" ")
    }

    fn extract_doc_text(&self, _path: &Path) -> Result<String> {
        warn!("DOC extraction not fully implemented");
        Err(anyhow!("DOC files require conversion to DOCX or TXT. Please convert your file using Microsoft Word or LibreOffice."))
    }

    fn extract_pptx_text(&self, path: &Path) -> Result<String> {
        use zip::ZipArchive;

        let file = fs::File::open(path)
            .map_err(|e| anyhow!("Failed to open PPTX file: {}", e))?;

        let mut archive = ZipArchive::new(file)
            .map_err(|e| anyhow!("Failed to read PPTX archive: {}", e))?;

        let mut text = String::new();
        let archive_len = archive.len();

        for i in 0..archive_len {
            let file_name = {
                match archive.by_index(i) {
                    Ok(f) => f.name().to_string(),
                    Err(_) => continue,
                }
            };

            if file_name.starts_with("ppt/slides/slide") && file_name.ends_with(".xml") {
                if let Ok(mut slide_file) = archive.by_index(i) {
                    let mut slide_content = String::new();
                    let _ = slide_file.read_to_string(&mut slide_content);
                    let slide_text = self.extract_text_from_xml(&slide_content);
                    text.push_str(&slide_text);
                    text.push('\n');
                }
            }
        }

        if text.is_empty() {
            return Err(anyhow!("No text content found in PPTX file"));
        }

        info!("Extracted PPTX from {:?}", path);
        Ok(text)
    }

    fn create_chunks(&self, text: &str) -> Vec<DocumentChunk> {
        if text.trim().is_empty() {
            return Vec::new();
        }

        let sentences: Vec<&str> = text
            .split(|c| c == '.' || c == '!' || c == '?' || c == '\n')
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .collect();

        let mut chunks = Vec::new();
        let mut current_chunk = String::new();
        let mut current_size = 0;

        for sentence in sentences {
            let sentence_size = sentence.len();

            if current_size + sentence_size > self.chunk_size && !current_chunk.is_empty() {
                chunks.push(DocumentChunk {
                    text: current_chunk.trim().to_string(),
                    size: current_size,
                    chunk_id: chunks.len(),
                });

                let overlap_text = self.get_overlap_text(&current_chunk);
                current_chunk = format!("{} {}", overlap_text, sentence);
                current_size = current_chunk.len();
            } else {
                if !current_chunk.is_empty() {
                    current_chunk.push(' ');
                }
                current_chunk.push_str(sentence);
                current_size += sentence_size + 1;
            }
        }

        if !current_chunk.trim().is_empty() {
            chunks.push(DocumentChunk {
                text: current_chunk.trim().to_string(),
                size: current_size,
                chunk_id: chunks.len(),
            });
        }

        info!("Created {} chunks from text", chunks.len());
        chunks
    }

    fn get_overlap_text(&self, text: &str) -> String {
        if text.len() <= self.chunk_overlap {
            return text.to_string();
        }

        let overlap_start = text.len() - self.chunk_overlap;
        let overlap_text = &text[overlap_start..];

        if let Some(sentence_break) = overlap_text.find(". ") {
            return overlap_text[sentence_break + 2..].to_string();
        }

        if let Some(word_break) = overlap_text.rfind(' ') {
            return overlap_text[word_break + 1..].to_string();
        }

        overlap_text.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_chunks() {
        let processor = DocumentProcessor::new(100, 20);
        let text = "This is sentence one. This is sentence two. This is sentence three.";
        let chunks = processor.create_chunks(text);
        assert!(!chunks.is_empty());
    }

    #[test]
    fn test_empty_text() {
        let processor = DocumentProcessor::new(100, 20);
        let chunks = processor.create_chunks("");
        assert!(chunks.is_empty());
    }

    #[test]
    fn test_json_extraction() {
        let processor = DocumentProcessor::new(1000, 100);
        let json = serde_json::json!({
            "name": "test",
            "items": [1, 2, 3]
        });
        let text = processor.json_to_text(&json);
        assert!(!text.is_empty());
        assert!(text.contains("test"));
    }
}
