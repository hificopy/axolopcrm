// import chromaService from './chroma-service.js'; // Temporarily disabled
import OpenAI from "openai";
import config from "../config/app.config.js";
import logger from "../utils/logger.js";

class RAGService {
  constructor() {
    this.chromaService = null; // Temporarily disabled
    this.openai = null;

    // Initialize OpenAI client if API key exists
    if (config.openai.enabled) {
      this.openai = new OpenAI({
        apiKey: config.openai.apiKey,
      });
    } else if (config.groq.enabled) {
      // Use Groq as an alternative
      this.openai = new OpenAI({
        apiKey: config.groq.apiKey,
        baseURL: "https://api.groq.com/openai/v1",
      });
    }

    this.initialized = this.validateConfiguration();
  }

  /**
   * Validate service configuration
   */
  validateConfiguration() {
    const hasChroma = !!this.chromaService.client;
    const hasAI = !!this.openai;

    if (!hasChroma) {
      logger.error(
        "❌ ChromaDB is not initialized. RAG service will not work properly.",
      );
    }

    if (!hasAI) {
      logger.error(
        "❌ No AI provider (OpenAI or Groq) is configured. RAG service will not work properly.",
      );
    }

    return hasChroma && hasAI;
  }

  /**
   * Convert text to embedding using OpenAI
   */
  async createEmbedding(text) {
    if (!this.openai) {
      throw new Error("AI provider not configured");
    }

    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-ada-002", // Using OpenAI's embedding model
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      logger.error("Error creating embedding:", error);
      throw error;
    }
  }

  /**
   * Add document to RAG knowledge base
   */
  async addDocument(collectionName, documentId, content, metadata = {}) {
    if (!this.initialized) {
      throw new Error("RAG service is not properly initialized");
    }

    try {
      // Create embedding for the document
      const embedding = await this.createEmbedding(content);

      // Add to ChromaDB
      await this.chromaService.addEmbedding(
        collectionName,
        [embedding], // embeddings
        [metadata], // metadatas
        [documentId], // ids
        [content], // documents
      );

      logger.info(
        `Document added to RAG knowledge base: ${documentId} in collection: ${collectionName}`,
      );

      return {
        success: true,
        documentId,
        collection: collectionName,
      };
    } catch (error) {
      logger.error("Error adding document to RAG:", error);
      throw error;
    }
  }

  /**
   * Add multiple documents to RAG knowledge base
   */
  async addDocuments(collectionName, documents) {
    if (!this.initialized) {
      throw new Error("RAG service is not properly initialized");
    }

    try {
      const embeddings = [];
      const metadatas = [];
      const ids = [];
      const contents = [];

      // Create embeddings for all documents
      for (const doc of documents) {
        const embedding = await this.createEmbedding(doc.content);
        embeddings.push(embedding);
        metadatas.push(doc.metadata || {});
        ids.push(doc.id);
        contents.push(doc.content);
      }

      // Add all to ChromaDB
      await this.chromaService.addEmbedding(
        collectionName,
        embeddings,
        metadatas,
        ids,
        contents,
      );

      logger.info(
        `Added ${documents.length} documents to RAG knowledge base: ${collectionName}`,
      );

      return {
        success: true,
        documentsAdded: documents.length,
        collection: collectionName,
      };
    } catch (error) {
      logger.error("Error adding documents to RAG:", error);
      throw error;
    }
  }

  /**
   * Perform semantic search in the knowledge base
   */
  async search(collectionName, query, topK = 5, filter = {}) {
    if (!this.initialized) {
      throw new Error("RAG service is not properly initialized");
    }

    try {
      // Create embedding for the query
      const queryEmbedding = await this.createEmbedding(query);

      // Query ChromaDB
      const result = await this.chromaService.queryCollection(
        collectionName,
        query,
        queryEmbedding,
        topK,
      );

      // Format the results
      const formattedResults = result.documents[0].map((doc, index) => ({
        id: result.ids[0][index],
        content: doc,
        metadata: result.metadatas[0][index],
        distance: result.distances[0][index],
      }));

      logger.info(
        `Found ${formattedResults.length} results for query in collection: ${collectionName}`,
      );

      return {
        success: true,
        query,
        results: formattedResults,
        collection: collectionName,
      };
    } catch (error) {
      logger.error("Error performing RAG search:", error);
      throw error;
    }
  }

  /**
   * Generate response using RAG (Retrieval Augmented Generation)
   */
  async generateResponse(
    collectionName,
    query,
    contextCount = 3,
    systemPrompt = null,
  ) {
    if (!this.initialized) {
      throw new Error("RAG service is not properly initialized");
    }

    try {
      // First, search for relevant context
      const searchResult = await this.search(
        collectionName,
        query,
        contextCount,
      );

      if (!searchResult.results || searchResult.results.length === 0) {
        // If no relevant context found, return a default response
        return {
          success: true,
          query,
          response:
            "I couldn't find any relevant information to answer your question.",
          sources: [],
          collection: collectionName,
        };
      }

      // Prepare the context from the search results
      const context = searchResult.results
        .map((result) => `Source: ${result.id}\nContent: ${result.content}`)
        .join("\n\n---\n\n");

      // Prepare the system prompt
      const defaultSystemPrompt = `You are a helpful AI assistant. Use the provided context to answer the user's question. If the context doesn't contain the information needed to answer the question, say so. Be concise and accurate. Context:\n\n${context}`;

      // Prepare the messages for the AI
      const messages = [
        {
          role: "system",
          content: systemPrompt || defaultSystemPrompt,
        },
        {
          role: "user",
          content: query,
        },
      ];

      // Generate response using AI
      const response = await this.openai.chat.completions.create({
        model: config.openai.enabled ? config.openai.model : config.groq.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      // Extract the AI's response
      const aiResponse = response.choices[0].message.content;

      // Extract sources used
      const sources = searchResult.results.map((result) => ({
        id: result.id,
        content: result.content,
        metadata: result.metadata,
      }));

      logger.info(
        `Generated RAG response for query in collection: ${collectionName}`,
      );

      return {
        success: true,
        query,
        response: aiResponse,
        sources,
        collection: collectionName,
      };
    } catch (error) {
      logger.error("Error generating RAG response:", error);
      throw error;
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats(collectionName) {
    if (!this.initialized) {
      throw new Error("RAG service is not properly initialized");
    }

    try {
      const stats = await this.chromaService.getCollectionStats(collectionName);
      return stats;
    } catch (error) {
      logger.error("Error getting collection stats:", error);
      throw error;
    }
  }

  /**
   * Delete document from knowledge base
   */
  async deleteDocument(collectionName, documentId) {
    if (!this.initialized) {
      throw new Error("RAG service is not properly initialized");
    }

    try {
      await this.chromaService.deleteEmbedding(collectionName, [documentId]);

      logger.info(
        `Document deleted from RAG knowledge base: ${documentId} in collection: ${collectionName}`,
      );

      return {
        success: true,
        documentId,
        collection: collectionName,
      };
    } catch (error) {
      logger.error("Error deleting document from RAG:", error);
      throw error;
    }
  }

  /**
   * Create or get a collection
   */
  async getOrCreateCollection(collectionName) {
    if (!this.initialized) {
      throw new Error("RAG service is not properly initialized");
    }

    try {
      const collection =
        await this.chromaService.getOrCreateCollection(collectionName);
      return collection;
    } catch (error) {
      logger.error("Error getting/creating collection:", error);
      throw error;
    }
  }

  /**
   * Get all collections
   */
  async getAllCollections() {
    if (!this.initialized) {
      throw new Error("RAG service is not properly initialized");
    }

    try {
      // Note: ChromaDB doesn't have a built-in method to list collections
      // This is a limitation that would require extending the service or using the raw API
      return Array.from(this.chromaService.collections.keys());
    } catch (error) {
      logger.error("Error getting collections:", error);
      throw error;
    }
  }

  /**
   * Add knowledge base document from various sources
   */
  async addKnowledgeBaseDocument(
    collectionName,
    docType,
    title,
    content,
    source = null,
    additionalMetadata = {},
  ) {
    if (!this.initialized) {
      throw new Error("RAG service is not properly initialized");
    }

    try {
      const documentId = `${docType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const metadata = {
        type: docType,
        title: title,
        source: source,
        created_at: new Date().toISOString(),
        ...additionalMetadata,
      };

      const result = await this.addDocument(
        collectionName,
        documentId,
        content,
        metadata,
      );

      logger.info(
        `Knowledge base document added: ${title} (${docType}) to collection: ${collectionName}`,
      );

      return result;
    } catch (error) {
      logger.error("Error adding knowledge base document:", error);
      throw error;
    }
  }
}

export default new RAGService();
