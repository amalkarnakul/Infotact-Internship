// Simple TF-IDF style embedding using word frequency vectors
// No external ML dependencies required

const generateEmbedding = async (text) => {
  try {
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
    const freq = {};
    words.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });

    // Build a fixed-size vector using hash bucketing (512 dimensions)
    const size = 512;
    const vector = new Array(size).fill(0);
    Object.entries(freq).forEach(([word, count]) => {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = (hash * 31 + word.charCodeAt(i)) % size;
      }
      vector[Math.abs(hash)] += count / words.length;
    });

    // Normalize
    const mag = Math.sqrt(vector.reduce((s, v) => s + v * v, 0));
    return mag ? vector.map((v) => v / mag) : vector;
  } catch (error) {
    console.error('Embedding error:', error.message);
    return [];
  }
};

const cosineSimilarity = (a, b) => {
  if (!a || !b || a.length !== b.length) return 0;
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return magA && magB ? dot / (magA * magB) : 0;
};

module.exports = { generateEmbedding, cosineSimilarity };
