const DocumentChunk = require('../models/documentChunk.model');
const { generateEmbedding, cosineSimilarity } = require('./embeddingService');

const getRelevantChunks = async (query, userId, topK = 5) => {
  try {
    const queryEmbedding = await generateEmbedding(query);
    if (!queryEmbedding.length) return [];

    const chunks = await DocumentChunk.find({ user: userId }).populate('document', 'originalName');

    const scored = chunks
      .filter((chunk) => chunk.embedding && chunk.embedding.length)
      .map((chunk) => ({
        chunk,
        score: cosineSimilarity(queryEmbedding, chunk.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return scored.map(({ chunk }) => ({
      content: chunk.content,
      source: chunk.document?.originalName || 'Unknown',
    }));
  } catch (error) {
    console.error('RAG error:', error.message);
    return [];
  }
};

const buildRAGPrompt = (context, userQuery) => {
  if (!context.length) return userQuery;

  const contextText = context
    .map((c, i) => `[Source ${i + 1}: ${c.source}]\n${c.content}`)
    .join('\n\n');

  return `You are a helpful AI assistant. Use the following document context to answer the user's question. If the context doesn't contain relevant information, answer based on your general knowledge.\n\nContext:\n${contextText}\n\nUser Question: ${userQuery}`;
};

module.exports = { getRelevantChunks, buildRAGPrompt };
