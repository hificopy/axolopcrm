import { ChromaClient } from 'chromadb';

class ChromaService {
  constructor() {
    this.client = null;
    this.collections = new Map();
  }

  async initialize() {
    try {
      // Use internal Docker service name when in production, localhost for development
      const chromaUrl = process.env.NODE_ENV === 'production' 
        ? 'http://chromadb:8000' 
        : (process.env.CHROMADB_URL || 'http://localhost:8001');
      
      console.log(`🔌 Attempting to connect to ChromaDB at: ${chromaUrl}`);
      
      this.client = new ChromaClient({
        path: chromaUrl,
      });

      // Test the connection
      const heartbeat = await this.client.heartbeat();
      console.log('✅ ChromaDB service initialized successfully');
      console.log('📊 ChromaDB heartbeat:', heartbeat);
      return true;
    } catch (error) {
      console.error('❌ Error initializing ChromaDB service:', error.message);
      console.error('🔧 Failed to connect to ChromaDB at:', 
        process.env.NODE_ENV === 'production' 
          ? 'http://chromadb:8000' 
          : (process.env.CHROMADB_URL || 'http://localhost:8001')
      );
      console.error('📋 Error details:', error);
      return false;
    }
  }

  async getOrCreateCollection(collectionName) {
    if (this.collections.has(collectionName)) {
      return this.collections.get(collectionName);
    }

    try {
      // Try to get existing collection
      let collection;
      try {
        collection = await this.client.getCollection({
          collectionName: collectionName,
        });
      } catch (error) {
        // If collection doesn't exist, create it
        if (error.message.includes('Collection') && error.message.includes('does not exist')) {
          collection = await this.client.createCollection({
            collectionName: collectionName,
          });
          console.log(`📁 Created new ChromaDB collection: ${collectionName}`);
        } else {
          throw error;
        }
      }

      this.collections.set(collectionName, collection);
      return collection;
    } catch (error) {
      console.error(`❌ Error getting/creating collection ${collectionName}:`, error.message);
      throw error;
    }
  }

  async addEmbedding(collectionName, embeddings, metadatas, ids, documents) {
    try {
      const collection = await this.getOrCreateCollection(collectionName);
      
      const result = await collection.add({
        embeddings: embeddings,
        metadatas: metadatas,
        ids: ids,
        documents: documents,
      });

      return result;
    } catch (error) {
      console.error(`❌ Error adding embeddings to collection ${collectionName}:`, error.message);
      throw error;
    }
  }

  async queryCollection(collectionName, queryText, queryEmbedding, nResults = 10) {
    try {
      const collection = await this.getOrCreateCollection(collectionName);
      
      const result = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: nResults,
        where: {}, // Optional filter
      });

      return result;
    } catch (error) {
      console.error(`❌ Error querying collection ${collectionName}:`, error.message);
      throw error;
    }
  }

  async deleteEmbedding(collectionName, ids) {
    try {
      const collection = await this.getOrCreateCollection(collectionName);
      
      const result = await collection.delete({
        ids: ids,
      });

      return result;
    } catch (error) {
      console.error(`❌ Error deleting embeddings from collection ${collectionName}:`, error.message);
      throw error;
    }
  }

  async reset() {
    try {
      await this.client.reset();
      this.collections.clear();
      console.log('🔄 ChromaDB service reset');
    } catch (error) {
      console.error('❌ Error resetting ChromaDB service:', error.message);
      throw error;
    }
  }

  async getCollectionStats(collectionName) {
    try {
      const collection = await this.getOrCreateCollection(collectionName);
      const count = await collection.count();
      
      return {
        name: collectionName,
        count: count,
      };
    } catch (error) {
      console.error(`❌ Error getting stats for collection ${collectionName}:`, error.message);
      throw error;
    }
  }
}

// Singleton instance
const chromaService = new ChromaService();

export default chromaService;