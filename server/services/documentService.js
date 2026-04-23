const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');
const officeParser = require('officeparser');
const DocumentChunk = require('../models/documentChunk.model');
const { generateEmbedding } = require('./embeddingService');

const extractText = async (buffer, mimetype) => {
  try {
    if (mimetype === 'application/pdf') {
      const data = await pdfParse(buffer);
      return data.text;
    }

    if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    if (mimetype === 'text/plain') {
      return buffer.toString('utf-8');
    }

    if (['image/png', 'image/jpeg', 'image/jpg'].includes(mimetype)) {
      const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
      return text;
    }

    if (
      mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimetype === 'application/vnd.ms-excel' ||
      mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      const text = await officeParser.parseOfficeAsync(buffer);
      return text;
    }

    return '';
  } catch (error) {
    console.error('Text extraction error:', error.message);
    return '';
  }
};

const chunkText = (text, chunkSize = 500, overlap = 50) => {
  const words = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim()) chunks.push(chunk);
  }

  return chunks;
};

const processDocument = async (documentId, userId, buffer, mimetype) => {
  try {
    const text = await extractText(buffer, mimetype);
    if (!text) return '';

    const chunks = chunkText(text);

    const chunkDocs = await Promise.all(
      chunks.map(async (content, index) => {
        const embedding = await generateEmbedding(content);
        return { document: documentId, user: userId, content, embedding, chunkIndex: index };
      })
    );

    await DocumentChunk.insertMany(chunkDocs);
    return text;
  } catch (error) {
    console.error('Document processing error:', error.message);
    return '';
  }
};

module.exports = { extractText, chunkText, processDocument };
