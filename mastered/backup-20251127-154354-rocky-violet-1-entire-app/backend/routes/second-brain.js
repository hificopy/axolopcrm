/**
 * Second Brain API Routes
 * Complete REST API for Logic, Maps, and Notes
 */

import express from 'express';
import nodeService from '../services/second-brain-node-service.js';
import mapsService from '../services/second-brain-maps-service.js';
import notesService from '../services/second-brain-notes-service.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// =====================================================
// LOGIC VIEW - Nodes and Connections
// =====================================================

/**
 * GET /api/second-brain/nodes
 * Get all nodes for user
 */
router.get('/nodes', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const options = {
    type: req.query.type,
    workspaceId: req.query.workspace_id,
    tags: req.query.tags ? req.query.tags.split(',') : undefined,
    search: req.query.search,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 100,
  };

  const result = await nodeService.getNodes(userId, options);
  res.json(result);
}));

/**
 * GET /api/second-brain/nodes/:id
 * Get single node with details
 */
router.get('/nodes/:id', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const nodeId = req.params.id;

  const node = await nodeService.getNodeById(userId, nodeId);
  if (!node) {
    return res.status(404).json({ error: 'Node not found' });
  }

  res.json(node);
}));

/**
 * POST /api/second-brain/nodes
 * Create new node
 */
router.post('/nodes', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const nodeData = req.body;

  // Validation
  if (!nodeData.type || !nodeData.label) {
    return res.status(400).json({ error: 'Type and label are required' });
  }

  const validTypes = ['database', 'document', 'mindmap', 'folder'];
  if (!validTypes.includes(nodeData.type)) {
    return res.status(400).json({ error: 'Invalid node type' });
  }

  const node = await nodeService.createNode(userId, nodeData);
  res.status(201).json(node);
}));

/**
 * PUT /api/second-brain/nodes/:id
 * Update node
 */
router.put('/nodes/:id', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const nodeId = req.params.id;
  const updates = req.body;

  const node = await nodeService.updateNode(userId, nodeId, updates);
  if (!node) {
    return res.status(404).json({ error: 'Node not found' });
  }

  res.json(node);
}));

/**
 * DELETE /api/second-brain/nodes/:id
 * Delete node
 */
router.delete('/nodes/:id', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const nodeId = req.params.id;

  await nodeService.deleteNode(userId, nodeId);
  res.json({ success: true, message: 'Node deleted' });
}));

/**
 * GET /api/second-brain/connections
 * Get all connections
 */
router.get('/connections', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const connections = await nodeService.getConnections(userId);
  res.json(connections);
}));

/**
 * POST /api/second-brain/connections
 * Create connection between nodes
 */
router.post('/connections', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { from_node_id, to_node_id, connection_type, strength, label, color, metadata } = req.body;

  if (!from_node_id || !to_node_id) {
    return res.status(400).json({ error: 'from_node_id and to_node_id are required' });
  }

  const connection = await nodeService.createConnection(
    userId,
    from_node_id,
    to_node_id,
    { connectionType: connection_type, strength, label, color, metadata }
  );

  res.status(201).json(connection);
}));

/**
 * DELETE /api/second-brain/connections/:id
 * Delete connection
 */
router.delete('/connections/:id', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const connectionId = req.params.id;

  await nodeService.deleteConnection(userId, connectionId);
  res.json({ success: true, message: 'Connection deleted' });
}));

/**
 * POST /api/second-brain/nodes/:id/link-crm
 * Link node to CRM record
 */
router.post('/nodes/:id/link-crm', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const nodeId = req.params.id;
  const { crm_record_type, crm_record_id, sync_enabled } = req.body;

  if (!crm_record_type || !crm_record_id) {
    return res.status(400).json({ error: 'crm_record_type and crm_record_id are required' });
  }

  const validTypes = ['lead', 'contact', 'deal', 'activity', 'opportunity', 'campaign'];
  if (!validTypes.includes(crm_record_type)) {
    return res.status(400).json({ error: 'Invalid CRM record type' });
  }

  const link = await nodeService.linkToCRM(
    userId,
    nodeId,
    crm_record_type,
    crm_record_id,
    { syncEnabled: sync_enabled }
  );

  res.status(201).json(link);
}));

/**
 * GET /api/second-brain/nodes/:id/crm-links
 * Get CRM links for node
 */
router.get('/nodes/:id/crm-links', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const nodeId = req.params.id;

  const links = await nodeService.getCRMLinks(userId, nodeId);
  res.json(links);
}));

/**
 * POST /api/second-brain/sync-crm
 * Sync CRM data to create nodes
 */
router.post('/sync-crm', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { types } = req.body; // ['contacts', 'leads', 'deals', 'activities']

  const results = await nodeService.syncCRMData(userId, { types });
  res.json({
    success: true,
    message: 'CRM data synced successfully',
    results,
  });
}));

// =====================================================
// MAPS VIEW - Infinite Canvas (Miro/Whimsical Clone)
// =====================================================

/**
 * GET /api/second-brain/maps
 * Get all maps/boards
 */
router.get('/maps', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const options = {
    workspaceId: req.query.workspace_id,
    search: req.query.search,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 50,
  };

  const result = await mapsService.getMaps(userId, options);
  res.json(result);
}));

/**
 * GET /api/second-brain/maps/:id
 * Get single map with all objects and connectors
 */
router.get('/maps/:id', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const mapId = req.params.id;

  const map = await mapsService.getMapById(userId, mapId);
  if (!map) {
    return res.status(404).json({ error: 'Map not found' });
  }

  res.json(map);
}));

/**
 * POST /api/second-brain/maps
 * Create new map/board
 */
router.post('/maps', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const mapData = req.body;

  if (!mapData.name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const map = await mapsService.createMap(userId, mapData);
  res.status(201).json(map);
}));

/**
 * PUT /api/second-brain/maps/:id
 * Update map
 */
router.put('/maps/:id', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const mapId = req.params.id;
  const updates = req.body;

  const map = await mapsService.updateMap(userId, mapId, updates);
  if (!map) {
    return res.status(404).json({ error: 'Map not found' });
  }

  res.json(map);
}));

/**
 * DELETE /api/second-brain/maps/:id
 * Delete map
 */
router.delete('/maps/:id', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const mapId = req.params.id;

  await mapsService.deleteMap(userId, mapId);
  res.json({ success: true, message: 'Map deleted' });
}));

/**
 * POST /api/second-brain/maps/:id/duplicate
 * Duplicate a map
 */
router.post('/maps/:id/duplicate', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const mapId = req.params.id;

  const newMap = await mapsService.duplicateMap(userId, mapId);
  res.status(201).json(newMap);
}));

/**
 * GET /api/second-brain/maps/:id/objects
 * Get all objects in a map
 */
router.get('/maps/:id/objects', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const mapId = req.params.id;

  const objects = await mapsService.getMapObjects(userId, mapId);
  res.json(objects);
}));

/**
 * POST /api/second-brain/maps/:id/objects
 * Create new object on map
 */
router.post('/maps/:id/objects', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const mapId = req.params.id;
  const objectData = req.body;

  if (!objectData.type) {
    return res.status(400).json({ error: 'Object type is required' });
  }

  const validTypes = ['shape', 'text', 'sticky_note', 'image', 'connector'];
  if (!validTypes.includes(objectData.type)) {
    return res.status(400).json({ error: 'Invalid object type' });
  }

  const object = await mapsService.createObject(userId, mapId, objectData);
  res.status(201).json(object);
}));

/**
 * PUT /api/second-brain/maps/:id/objects/:objectId
 * Update object
 */
router.put('/maps/:id/objects/:objectId', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const mapId = req.params.id;
  const objectId = req.params.objectId;
  const updates = req.body;

  const object = await mapsService.updateObject(userId, mapId, objectId, updates);
  res.json(object);
}));

/**
 * DELETE /api/second-brain/maps/:id/objects/:objectId
 * Delete object
 */
router.delete('/maps/:id/objects/:objectId', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const mapId = req.params.id;
  const objectId = req.params.objectId;

  await mapsService.deleteObject(userId, mapId, objectId);
  res.json({ success: true, message: 'Object deleted' });
}));

/**
 * PUT /api/second-brain/maps/:id/objects/bulk
 * Bulk update objects (for performance during drag/resize)
 */
router.put('/maps/:id/objects/bulk', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const mapId = req.params.id;
  const updates = req.body.updates;

  if (!Array.isArray(updates)) {
    return res.status(400).json({ error: 'Updates must be an array' });
  }

  const result = await mapsService.bulkUpdateObjects(userId, mapId, updates);
  res.json(result);
}));

/**
 * GET /api/second-brain/maps/:id/connectors
 * Get all connectors in a map
 */
router.get('/maps/:id/connectors', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const mapId = req.params.id;

  const connectors = await mapsService.getMapConnectors(userId, mapId);
  res.json(connectors);
}));

/**
 * POST /api/second-brain/maps/:id/connectors
 * Create connector between objects
 */
router.post('/maps/:id/connectors', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const mapId = req.params.id;
  const connectorData = req.body;

  if (!connectorData.from_object_id || !connectorData.to_object_id) {
    return res.status(400).json({ error: 'from_object_id and to_object_id are required' });
  }

  const connector = await mapsService.createConnector(userId, mapId, connectorData);
  res.status(201).json(connector);
}));

/**
 * DELETE /api/second-brain/maps/:id/connectors/:connectorId
 * Delete connector
 */
router.delete('/maps/:id/connectors/:connectorId', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const mapId = req.params.id;
  const connectorId = req.params.connectorId;

  await mapsService.deleteConnector(userId, mapId, connectorId);
  res.json({ success: true, message: 'Connector deleted' });
}));

// =====================================================
// NOTES VIEW - Documents (Notion/Obsidian Clone)
// =====================================================

/**
 * GET /api/second-brain/notes
 * Get all notes
 */
router.get('/notes', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const options = {
    folder: req.query.folder,
    starred: req.query.starred === 'true',
    search: req.query.search,
    tags: req.query.tags ? req.query.tags.split(',') : undefined,
    sortBy: req.query.sort_by,
    sortOrder: req.query.sort_order,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 50,
  };

  const result = await notesService.getNotes(userId, options);
  res.json(result);
}));

/**
 * GET /api/second-brain/notes/search
 * Search notes
 */
router.get('/notes/search', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const query = req.query.q;
  const options = {
    folder: req.query.folder,
    tags: req.query.tags ? req.query.tags.split(',') : undefined,
    limit: parseInt(req.query.limit) || 20,
  };

  const notes = await notesService.searchNotes(userId, query, options);
  res.json(notes);
}));

/**
 * GET /api/second-brain/notes/folders
 * Get all folders
 */
router.get('/notes/folders', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const folders = await notesService.getFolders(userId);
  res.json(folders);
}));

/**
 * GET /api/second-brain/notes/tags
 * Get all tags
 */
router.get('/notes/tags', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const tags = await notesService.getTags(userId);
  res.json(tags);
}));

/**
 * GET /api/second-brain/notes/:id
 * Get single note
 */
router.get('/notes/:id', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const noteId = req.params.id;

  const note = await notesService.getNoteById(userId, noteId);
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  res.json(note);
}));

/**
 * GET /api/second-brain/notes/slug/:slug
 * Get note by slug (for wiki-style URLs)
 */
router.get('/notes/slug/:slug', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const slug = req.params.slug;

  const note = await notesService.getNoteBySlug(userId, slug);
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  res.json(note);
}));

/**
 * POST /api/second-brain/notes
 * Create new note
 */
router.post('/notes', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const noteData = req.body;

  const note = await notesService.createNote(userId, noteData);
  res.status(201).json(note);
}));

/**
 * PUT /api/second-brain/notes/:id
 * Update note
 */
router.put('/notes/:id', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const noteId = req.params.id;
  const updates = req.body;

  const note = await notesService.updateNote(userId, noteId, updates);
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  res.json(note);
}));

/**
 * DELETE /api/second-brain/notes/:id
 * Delete note
 */
router.delete('/notes/:id', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const noteId = req.params.id;

  await notesService.deleteNote(userId, noteId);
  res.json({ success: true, message: 'Note deleted' });
}));

/**
 * POST /api/second-brain/notes/:id/duplicate
 * Duplicate a note
 */
router.post('/notes/:id/duplicate', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const noteId = req.params.id;

  const newNote = await notesService.duplicateNote(userId, noteId);
  res.status(201).json(newNote);
}));

/**
 * PUT /api/second-brain/notes/:id/move
 * Move note to folder
 */
router.put('/notes/:id/move', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const noteId = req.params.id;
  const { folder } = req.body;

  if (!folder) {
    return res.status(400).json({ error: 'Folder is required' });
  }

  const note = await notesService.moveToFolder(userId, noteId, folder);
  res.json(note);
}));

/**
 * GET /api/second-brain/notes/:id/backlinks
 * Get backlinks for a note
 */
router.get('/notes/:id/backlinks', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const noteId = req.params.id;

  const backlinks = await notesService.getBacklinks(userId, noteId);
  res.json(backlinks);
}));

/**
 * GET /api/second-brain/notes/:id/comments
 * Get comments for a note
 */
router.get('/notes/:id/comments', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const noteId = req.params.id;

  const comments = await notesService.getComments(userId, noteId);
  res.json(comments);
}));

/**
 * POST /api/second-brain/notes/:id/comments
 * Add comment to note
 */
router.post('/notes/:id/comments', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const noteId = req.params.id;
  const commentData = req.body;

  if (!commentData.content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const comment = await notesService.addComment(userId, noteId, commentData);
  res.status(201).json(comment);
}));

// =====================================================
// HEALTH CHECK
// =====================================================

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Second Brain API',
    version: '2.0.0',
    features: {
      logic: 'active',
      maps: 'active',
      notes: 'active',
    },
    endpoints: {
      logic: {
        nodes: 9,
        connections: 7,
        crm_sync: 1,
      },
      maps: {
        maps: 15,
        objects: 6,
        connectors: 3,
      },
      notes: {
        notes: 15,
        backlinks: 1,
        search: 1,
        folders: 1,
        tags: 1,
        comments: 2,
      },
    },
  });
});

export default router;
