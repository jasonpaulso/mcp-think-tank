import { VoyageAIClient, VoyageAI } from 'voyageai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { config } from '../config.js';

// Load environment variables
dotenv.config();

// Cosine similarity calculation
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same dimension');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Embedding service for vector representations
class EmbeddingService {
  private client: VoyageAIClient | null = null;
  private isInitialized = false;
  private cacheEnabled: boolean;
  private cacheDir: string;
  private textCacheFile: string;
  private imageCacheFile: string;
  private multimodalCacheFile: string;
  private textCache: Map<string, number[]> = new Map();
  private imageCache: Map<string, number[]> = new Map();
  private multimodalCache: Map<string, number[]> = new Map();
  private embeddingModel: string;
  private embeddingDimensions: number;
  private apiKey: string | undefined;

  constructor() {
    // Get cache configuration
    this.cacheEnabled = config.embedding.cache !== false;
    this.cacheDir = config.embedding.cacheDir || path.join(os.homedir(), '.mcp-think-server', 'cache');
    this.textCacheFile = path.join(this.cacheDir, 'text-embeddings.json');
    this.imageCacheFile = path.join(this.cacheDir, 'image-embeddings.json');
    this.multimodalCacheFile = path.join(this.cacheDir, 'multimodal-embeddings.json');
    
    // Get model configuration
    this.embeddingModel = config.embedding.model || 'voyage-3-large';
    this.embeddingDimensions = config.embedding.dimensions || 1024;

    // Get API key from config or environment
    this.apiKey = config.embedding.voyageApiKey || process.env.VOYAGE_API_KEY;

    // Initialize cache
    if (this.cacheEnabled) {
      this.initializeCache();
    }
  }

  // Initialize the embedding service
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    if (!this.apiKey) {
      console.warn('VOYAGE_API_KEY not set, embedding service will not be available');
      return;
    }

    try {
      this.client = new VoyageAIClient({ apiKey: this.apiKey });
      this.isInitialized = true;
      console.log(`Initialized Voyage AI embedding service with model: ${this.embeddingModel}`);
    } catch (error) {
      console.error('Error initializing Voyage AI client:', error);
    }
  }

  // Check if the service is available
  isAvailable() {
    return this.isInitialized && this.client !== null;
  }

  // Initialize the embedding cache
  private initializeCache() {
    // Create cache directory if it doesn't exist
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }

    // Load text cache if it exists
    if (fs.existsSync(this.textCacheFile)) {
      try {
        const cacheData = JSON.parse(fs.readFileSync(this.textCacheFile, 'utf-8'));
        this.textCache = new Map(Object.entries(cacheData));
        console.log(`Loaded ${this.textCache.size} cached text embeddings`);
      } catch (error) {
        console.warn('Error loading text embedding cache:', error);
      }
    }

    // Load image cache if it exists
    if (fs.existsSync(this.imageCacheFile)) {
      try {
        const cacheData = JSON.parse(fs.readFileSync(this.imageCacheFile, 'utf-8'));
        this.imageCache = new Map(Object.entries(cacheData));
        console.log(`Loaded ${this.imageCache.size} cached image embeddings`);
      } catch (error) {
        console.warn('Error loading image embedding cache:', error);
      }
    }

    // Load multimodal cache if it exists
    if (fs.existsSync(this.multimodalCacheFile)) {
      try {
        const cacheData = JSON.parse(fs.readFileSync(this.multimodalCacheFile, 'utf-8'));
        this.multimodalCache = new Map(Object.entries(cacheData));
        console.log(`Loaded ${this.multimodalCache.size} cached multimodal embeddings`);
      } catch (error) {
        console.warn('Error loading multimodal embedding cache:', error);
      }
    }
  }

  // Save the cache to disk
  private saveCache() {
    if (!this.cacheEnabled) {
      return;
    }

    try {
      // Save text cache
      fs.writeFileSync(
        this.textCacheFile,
        JSON.stringify(Object.fromEntries(this.textCache))
      );

      // Save image cache
      fs.writeFileSync(
        this.imageCacheFile,
        JSON.stringify(Object.fromEntries(this.imageCache))
      );

      // Save multimodal cache
      fs.writeFileSync(
        this.multimodalCacheFile,
        JSON.stringify(Object.fromEntries(this.multimodalCache))
      );
    } catch (error) {
      console.warn('Error saving embedding caches:', error);
    }
  }

  // Generate a single embedding for a text
  async generateEmbedding(text: string, inputType: 'query' | 'document' = 'document'): Promise<number[] | null> {
    if (!this.isAvailable()) {
      await this.initialize();
      if (!this.isAvailable()) {
        return null;
      }
    }

    // Check cache first if enabled
    if (this.cacheEnabled) {
      const cacheKey = `${inputType}:${text}`;
      const cachedEmbedding = this.textCache.get(cacheKey);
      if (cachedEmbedding) {
        return cachedEmbedding;
      }
    }

    try {
      // Generate embedding using the correct request format
      const response = await this.client!.embed({
        model: this.embeddingModel,
        input: [text],
        inputType: inputType,
      });

      if (response && Array.isArray(response)) {
        const embedding = response[0];

        // Cache the embedding if enabled
        if (this.cacheEnabled) {
          const cacheKey = `${inputType}:${text}`;
          this.textCache.set(cacheKey, embedding);
          this.saveCache();
        }

        return embedding;
      }
    } catch (error) {
      console.error('Error generating embedding:', error);
    }

    return null;
  }

  // Generate multiple embeddings for a list of texts
  async generateEmbeddings(texts: string[], inputType: 'query' | 'document' = 'document'): Promise<(number[] | null)[]> {
    if (!this.isAvailable()) {
      await this.initialize();
      if (!this.isAvailable()) {
        return texts.map(() => null);
      }
    }

    // Check which texts are not in cache
    const textsToEmbed: string[] = [];
    const results: (number[] | null)[] = new Array(texts.length).fill(null);
    const indices: number[] = [];

    if (this.cacheEnabled) {
      texts.forEach((text, index) => {
        const cacheKey = `${inputType}:${text}`;
        const cachedEmbedding = this.textCache.get(cacheKey);
        if (cachedEmbedding) {
          results[index] = cachedEmbedding;
        } else {
          textsToEmbed.push(text);
          indices.push(index);
        }
      });
    } else {
      textsToEmbed.push(...texts);
      indices.push(...Array.from({ length: texts.length }, (_, i) => i));
    }

    // If all embeddings are cached, return them
    if (textsToEmbed.length === 0) {
      return results;
    }

    try {
      // Generate embeddings for texts not in cache
      const batchSize = 100; // API limit
      for (let i = 0; i < textsToEmbed.length; i += batchSize) {
        const batch = textsToEmbed.slice(i, i + batchSize);
        const batchIndices = indices.slice(i, i + batchSize);

        const response = await this.client!.embed({
          model: this.embeddingModel,
          input: batch,
          inputType: inputType,
        });

        if (response && Array.isArray(response)) {
          // Store embeddings in results and cache
          for (let j = 0; j < response.length; j++) {
            const embedding = response[j];
            const originalIndex = batchIndices[j];
            results[originalIndex] = embedding;

            // Cache the embedding if enabled
            if (this.cacheEnabled) {
              const text = textsToEmbed[j + i];
              const cacheKey = `${inputType}:${text}`;
              this.textCache.set(cacheKey, embedding);
            }
          }

          // Save cache
          if (this.cacheEnabled) {
            this.saveCache();
          }
        }
      }
    } catch (error) {
      console.error('Error generating embeddings:', error);
    }

    return results;
  }

  // Generate embedding for an image URL
  async generateImageEmbedding(imageUrl: string): Promise<number[] | null> {
    if (!this.isAvailable()) {
      await this.initialize();
      if (!this.isAvailable()) {
        return null;
      }
    }

    // Check cache first if enabled
    if (this.cacheEnabled) {
      const cacheKey = `image:${imageUrl}`;
      const cachedEmbedding = this.imageCache.get(cacheKey);
      if (cachedEmbedding) {
        return cachedEmbedding;
      }
    }

    try {
      // For now, use a text-based approach since the current version may not support multimodal
      const response = await this.client!.embed({
        model: 'voyage-3-large', // Use standard model for now
        input: [`[IMAGE URL: ${imageUrl}]`], // Create a text representation
        inputType: 'document',
      });

      if (response && Array.isArray(response)) {
        const embedding = response[0];

        // Cache the embedding if enabled
        if (this.cacheEnabled) {
          const cacheKey = `image:${imageUrl}`;
          this.imageCache.set(cacheKey, embedding);
          this.saveCache();
        }

        return embedding;
      }
    } catch (error) {
      console.error('Error generating image embedding:', error);
    }

    return null;
  }

  // Generate multimodal embedding for an entity with both text and image
  async generateMultimodalEmbedding(
    text: string, 
    imageUrl: string | null = null
  ): Promise<number[] | null> {
    if (!this.isAvailable()) {
      await this.initialize();
      if (!this.isAvailable()) {
        return null;
      }
    }

    // Create cache key for multimodal content
    const cacheKey = `multimodal:${text}:${imageUrl || ''}`;

    // Check cache first if enabled
    if (this.cacheEnabled) {
      const cachedEmbedding = this.multimodalCache.get(cacheKey);
      if (cachedEmbedding) {
        return cachedEmbedding;
      }
    }

    try {
      // For now, use a text-based approach until we can implement proper multimodal embedding
      let combinedText = text;
      if (imageUrl) {
        combinedText = `${text} [IMAGE URL: ${imageUrl}]`;
      }

      const response = await this.client!.embed({
        model: this.embeddingModel,
        input: [combinedText],
        inputType: 'document',
      });

      if (response && Array.isArray(response)) {
        const embedding = response[0];

        // Cache the embedding if enabled
        if (this.cacheEnabled) {
          this.multimodalCache.set(cacheKey, embedding);
          this.saveCache();
        }

        return embedding;
      }
    } catch (error) {
      console.error('Error generating multimodal embedding:', error);
    }

    return null;
  }

  // Calculate cosine similarity between two vectors
  cosineSimilarity(a: number[], b: number[]): number {
    return cosineSimilarity(a, b);
  }

  // Clear all caches
  clearCache() {
    this.textCache.clear();
    this.imageCache.clear();
    this.multimodalCache.clear();
    
    if (this.cacheEnabled) {
      this.saveCache();
    }
  }
}

// Create and export a singleton instance
export const embeddingService = new EmbeddingService(); 