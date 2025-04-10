import { VoyageAIClient } from 'voyageai';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import config from '../config.js';

// Embedding provider type - now only Voyage is supported
export type EmbeddingProvider = 'voyage';

// Configuration options for the embedding service
interface EmbeddingServiceConfig {
  provider?: EmbeddingProvider; // Embedding provider to use (always 'voyage')
  apiKey?: string;              // API key for Voyage AI
  model?: string;               // Embedding model to use
  dimensions?: number;          // Dimensions for the embeddings
  cacheDir?: string;            // Directory to store cache
  useCache?: boolean;           // Whether to use caching
  // Voyage-specific options
  inputType?: 'query' | 'document'; // Type of input for Voyage AI
  quantization?: 'float' | 'int8' | 'binary'; // Quantization type for Voyage AI
}

// Default configuration for Voyage AI
const DEFAULT_CONFIG: EmbeddingServiceConfig = {
  provider: 'voyage',
  model: 'voyage-3-large',
  dimensions: 1024,
  inputType: 'query',
  quantization: 'float',
  cacheDir: path.join(os.homedir(), '.mcp-think-server', 'cache'),
  useCache: true,
};

/**
 * Service for generating and comparing text embeddings using Voyage AI
 */
export class EmbeddingService {
  private voyageClient: VoyageAIClient | null = null;
  private config: EmbeddingServiceConfig;
  private cache: Map<string, number[]> = new Map();
  private cacheFile: string;
  private initialized = false;

  constructor(config: EmbeddingServiceConfig = {}) {
    // Start with default config and override with provided config
    this.config = { 
      ...DEFAULT_CONFIG, 
      ...config
    };

    this.cacheFile = path.join(
      this.config.cacheDir!, 
      `embeddings-cache-voyage.json`
    );
  }

  /**
   * Initialize the embedding service
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;
    return this.initializeVoyage();
  }

  /**
   * Initialize Voyage AI client
   */
  private async initializeVoyage(): Promise<boolean> {
    // Check if API key is available
    const apiKey = this.config.apiKey;
    if (!apiKey) {
      console.warn('No Voyage AI API key found in configuration.');
      return false;
    }

    try {
      // Create Voyage client with proper options object
      this.voyageClient = new VoyageAIClient({ apiKey });
      console.log('Voyage AI client initialized.');
      
      // Load cache if available
      await this.loadCache();
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Voyage AI client:', error);
      return false;
    }
  }

  /**
   * Load embedding cache from disk
   */
  private async loadCache(): Promise<void> {
    if (!this.config.useCache) return;
    
    // Create cache directory if it doesn't exist
    const cacheDir = path.dirname(this.cacheFile);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    // Load cache if it exists
    if (fs.existsSync(this.cacheFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
        this.cache = new Map(Object.entries(data));
        console.log(`Loaded ${this.cache.size} cached embeddings.`);
      } catch (error) {
        console.warn('Failed to load embedding cache:', error);
        // Create a new cache if loading fails
        this.cache = new Map();
      }
    }
  }

  /**
   * Save embedding cache to disk
   */
  private saveCache(): void {
    if (!this.config.useCache) return;
    
    try {
      // Convert map to object for serialization
      const data = Object.fromEntries(this.cache);
      fs.writeFileSync(this.cacheFile, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save embedding cache:', error);
    }
  }

  /**
   * Check if the service is available
   */
  isAvailable(): boolean {
    return this.initialized && this.voyageClient !== null;
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
    const cacheKey = `voyage:${this.config.model}:${text}`;
    if (this.config.useCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Generate embedding using Voyage AI
    try {
      const embedding = await this.generateVoyageEmbedding(text);
      
      if (!embedding) return null;
      
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
   * Generate embedding with Voyage AI
   */
  private async generateVoyageEmbedding(text: string): Promise<number[] | null> {
    if (!this.voyageClient) return null;
    
    try {
      // Voyage API expects different parameter names than what we're using internally
      const response = await this.voyageClient.embed({
        model: this.config.model!,
        input: text,
        // Use proper parameter names compatible with the Voyage API
        ...(this.config.inputType && { inputType: this.config.inputType }),
        ...(this.config.dimensions && { dimensions: this.config.dimensions }),
        ...(this.config.quantization && { outputDtype: this.config.quantization })
      });

      // Handle the response safely
      const result = response as any;
      if (result && result.embeddings && Array.isArray(result.embeddings) && result.embeddings.length > 0) {
        return result.embeddings[0];
      }
      
      console.error('Unexpected Voyage API response format:', response);
      return null;
    } catch (error) {
      console.error('Error generating Voyage embedding:', error);
      return null;
    }
  }

  /**
   * Generate embeddings for multiple texts
   */
  async generateEmbeddings(texts: string[]): Promise<(number[] | null)[]> {
    if (!this.isAvailable()) {
      await this.initialize();
      if (!this.isAvailable()) {
        return texts.map(() => null);
      }
    }

    // Check cache and collect uncached texts
    const uncachedTexts: string[] = [];
    const uncachedIndices: number[] = [];
    const results: (number[] | null)[] = new Array(texts.length).fill(null);

    texts.forEach((text, i) => {
      const cacheKey = `voyage:${this.config.model}:${text}`;
      if (this.config.useCache && this.cache.has(cacheKey)) {
        results[i] = this.cache.get(cacheKey)!;
      } else {
        uncachedTexts.push(text);
        uncachedIndices.push(i);
      }
    });

    // If there are uncached texts, get their embeddings
    if (uncachedTexts.length > 0) {
      try {
        const embeddings = await this.generateVoyageEmbeddings(uncachedTexts);
        
        // Store embeddings in results and cache
        embeddings.forEach((embedding, i) => {
          if (embedding) {
            const originalIndex = uncachedIndices[i];
            const text = uncachedTexts[i];
            results[originalIndex] = embedding;
            
            if (this.config.useCache) {
              const cacheKey = `voyage:${this.config.model}:${text}`;
              this.cache.set(cacheKey, embedding);
            }
          }
        });

        // Save cache after all embeddings are generated
        if (this.config.useCache) {
          this.saveCache();
        }
      } catch (error) {
        console.error('Error generating embeddings batch:', error);
      }
    }

    return results;
  }

  /**
   * Generate embeddings for multiple texts with Voyage AI
   */
  private async generateVoyageEmbeddings(texts: string[]): Promise<(number[] | null)[]> {
    if (!this.voyageClient) {
      return texts.map(() => null);
    }
    
    try {
      const response = await this.voyageClient.embed({
        model: this.config.model!,
        input: texts,
        ...(this.config.inputType && { inputType: this.config.inputType }),
        ...(this.config.dimensions && { dimensions: this.config.dimensions }),
        ...(this.config.quantization && { outputDtype: this.config.quantization })
      });

      // Handle the response safely
      const result = response as any;
      if (result && result.embeddings && Array.isArray(result.embeddings)) {
        return result.embeddings;
      }
      
      console.error('Unexpected Voyage API response format:', response);
      return texts.map(() => null);
    } catch (error) {
      console.error('Error generating Voyage embeddings batch:', error);
      return texts.map(() => null);
    }
  }

  /**
   * Calculate cosine similarity between two vectors
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
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    if (normA === 0 || normB === 0) {
      return 0; // Handle division by zero
    }
    
    return dotProduct / (normA * normB);
  }
}

// Singleton instance of the embedding service
export const embeddingService = new EmbeddingService({
  provider: config.embedding.provider,
  apiKey: config.embedding.voyageApiKey,
  model: config.embedding.model,
  dimensions: config.embedding.dimensions,
  inputType: config.embedding.inputType,
  quantization: config.embedding.quantization,
  useCache: config.embedding.useCache,
  cacheDir: config.embedding.cacheDir
}); 