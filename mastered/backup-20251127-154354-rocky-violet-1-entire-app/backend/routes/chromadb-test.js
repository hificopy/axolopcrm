import express from "express";
const router = express.Router();
// import chromaService from '../services/chroma-service.js'; // Temporarily disabled

// Test route for ChromaDB
router.get("/test-chromadb", async (req, res) => {
  try {
    return res.status(503).json({
      success: false,
      error: "ChromaDB service temporarily disabled",
    });

    if (!chromaService.client) {
      return res.status(500).json({
        success: false,
        error: "ChromaDB client not initialized",
      });
    }

    // Test the connection
    const heartbeat = await chromaService.client.heartbeat();

    res.json({
      success: true,
      message: "ChromaDB connection successful",
      heartbeat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
