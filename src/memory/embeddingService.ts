import { OpenAI } from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Configuration options for the embedding service
interface EmbeddingServiceConfig {
  apiKey?: string;        // OpenAI API key
  model?: string;         // Embedding model to use
  dimensions?: number;    // Dimensions for the embeddings
  cacheDir?: string;      // Directory to store cache
  useCache?: boolean;     // Whether to use caching
}

// Default configuration
const DEFAULT_CONFIG: EmbeddingServiceConfig = {
  model: 'text-embedding-3-small',
  dimensions: 1536,
  cacheDir: path.join(os.homedir(), '.mcp-think-server', 'cache'),
  useCache: true
};

/**
 * Service for generating and comparing text embeddings
 */
export class EmbeddingService {
  private client: OpenAI | null = null;
  private config: EmbeddingServiceConfig;
  private cache: Map<string, number[]> = new Map();
  private cacheFile: string;
  private initialized = false;

  constructor(config: EmbeddingServiceConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.cacheFile = path.join(this.config.cacheDir!, 'embeddings-cache.json');
  }

  /**
   * Initialize the embedding service
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    // Get API key from config or environment variable
    const apiKey = this.config.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('OpenAI API key not found. Semantic search will be unavailable.');
      return false;
    }

    // Initialize OpenAI client
    try {
      this.client = new OpenAI({ apiKey });
      
      // Create cache directory if using cache
      if (this.config.useCache) {
        await this.ensureCacheDirectory();
        await this.loadCache();
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize embedding service:', error);
      return false;
    }
  }

  /**
   * Check if the service is available
   */
  isAvailable(): boolean {
    return this.initialized && this.client !== null;
  }

  /**
   * Generate an embedding for a text string
   */
  async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.isAvailable()) {
      await this.initialize();
      if (!this.isAvailable()) return null;
    }

    // Check cache first
    const cacheKey = `${this.config.model}:${text}`;
    if (this.config.useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const response = await this.client!.embeddings.create({
        model: this.config.model!,
        input: text
      });

      const embedding = response.data[0].embedding;
      
      // Store in cache
      if (this.config.useCache) {
        this.cache.set(cacheKey, embedding);
        this.saveCache();
      }
      
      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      return null;
    }
  }

  /**
   * Generate embeddings for multiple text strings
   */
  async generateEmbeddings(texts: string[]): Promise<(number[] | null)[]> {
    if (!this.isAvailable()) {
      await this.initialize();
      if (!this.isAvailable()) return texts.map(() => null);
    }

    // Filter out texts that already have cached embeddings
    const uncachedTexts: string[] = [];
    const uncachedIndices: number[] = [];
    const results: (number[] | null)[] = texts.map(() => null);

    if (this.config.useCache) {
      texts.forEach((text, index) => {
        const cacheKey = `${this.config.model}:${text}`;
        if (this.cache.has(cacheKey)) {
          results[index] = this.cache.get(cacheKey)!;
        } else {
          uncachedTexts.push(text);
          uncachedIndices.push(index);
        }
      });
    } else {
      uncachedTexts.push(...texts);
      uncachedIndices.push(...texts.map((_, i) => i));
    }

    // If there are uncached texts, get their embeddings
    if (uncachedTexts.length > 0) {
      try {
        // Split into batches of 20 to avoid rate limits
        const batchSize = 20;
        for (let i = 0; i < uncachedTexts.length; i += batchSize) {
          const batchTexts = uncachedTexts.slice(i, i + batchSize);
          const batchIndices = uncachedIndices.slice(i, i + batchSize);
          
          const response = await this.client!.embeddings.create({
            model: this.config.model!,
            input: batchTexts
          });

          // Store embeddings in results and cache
          response.data.forEach((item, j) => {
            const originalIndex = batchIndices[j];
            const text = uncachedTexts[j];
            results[originalIndex] = item.embedding;
            
            if (this.config.useCache) {
              const cacheKey = `${this.config.model}:${text}`;
              this.cache.set(cacheKey, item.embedding);
            }
          });
        }

        // Save cache after all embeddings are generated
        if (this.config.useCache) {
          this.saveCache();
        }
      } catch (error) {
        console.error('Error generating embeddings:', error);
      }
    }

    return results;
  }

  /**
   * Calculate the cosine similarity between two vectors
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimensions');
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

  /**
   * Ensure the cache directory exists
   */
  private async ensureCacheDirectory(): Promise<void> {
    try {
      await fs.promises.mkdir(this.config.cacheDir!, { recursive: true });
    } catch (error) {
      console.error('Failed to create cache directory:', error);
      this.config.useCache = false;
    }
  }

  /**
   * Load the embedding cache from disk
   */
  private async loadCache(): Promise<void> {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = await fs.promises.readFile(this.cacheFile, 'utf8');
        const parsed = JSON.parse(data);
        this.cache = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Failed to load embedding cache:', error);
      this.cache = new Map();
    }
  }

  /**
   * Save the embedding cache to disk
   */
  private async saveCache(): Promise<void> {
    try {
      const cacheObj = Object.fromEntries(this.cache);
      await fs.promises.writeFile(
        this.cacheFile,
        JSON.stringify(cacheObj),
        'utf8'
      );
    } catch (error) {
      console.error('Failed to save embedding cache:', error);
    }
  }
}

// Singleton instance of the embedding service
export const embeddingService = new EmbeddingService(); 