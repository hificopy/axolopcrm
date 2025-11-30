/**
 * Second Brain API Service
 * Handles all API calls related to Second Brain (Logic, Maps, Notes)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

class SecondBrainAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/second-brain`;
  }

  // =====================================================
  // LOGIC VIEW - Nodes and Connections
  // =====================================================

  /**
   * Get all nodes for user
   * @param {Object} params - Query parameters (type, workspace_id, tags, search, page, limit)
   * @returns {Promise<Object>} Nodes and pagination info
   */
  async getNodes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}/nodes${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch nodes');
    }

    return await response.json();
  }

  /**
   * Get a single node by ID
   * @param {string} nodeId - Node ID
   * @returns {Promise<Object>} Node data with connections and CRM links
   */
  async getNode(nodeId) {
    const response = await fetch(`${this.baseURL}/nodes/${nodeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch node');
    }

    return await response.json();
  }

  /**
   * Create a new node
   * @param {Object} nodeData - Node data
   * @returns {Promise<Object>} Created node
   */
  async createNode(nodeData) {
    const response = await fetch(`${this.baseURL}/nodes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(nodeData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create node');
    }

    return await response.json();
  }

  /**
   * Update a node
   * @param {string} nodeId - Node ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated node
   */
  async updateNode(nodeId, updates) {
    const response = await fetch(`${this.baseURL}/nodes/${nodeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update node');
    }

    return await response.json();
  }

  /**
   * Delete a node
   * @param {string} nodeId - Node ID
   * @returns {Promise<Object>} Success response
   */
  async deleteNode(nodeId) {
    const response = await fetch(`${this.baseURL}/nodes/${nodeId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete node');
    }

    return await response.json();
  }

  /**
   * Get all connections
   * @returns {Promise<Array>} List of connections
   */
  async getConnections() {
    const response = await fetch(`${this.baseURL}/connections`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch connections');
    }

    return await response.json();
  }

  /**
   * Create a connection between nodes
   * @param {Object} connectionData - Connection data (from_node_id, to_node_id, connection_type, etc.)
   * @returns {Promise<Object>} Created connection
   */
  async createConnection(connectionData) {
    const response = await fetch(`${this.baseURL}/connections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(connectionData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create connection');
    }

    return await response.json();
  }

  /**
   * Delete a connection
   * @param {string} connectionId - Connection ID
   * @returns {Promise<Object>} Success response
   */
  async deleteConnection(connectionId) {
    const response = await fetch(`${this.baseURL}/connections/${connectionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete connection');
    }

    return await response.json();
  }

  /**
   * Link a node to a CRM record
   * @param {string} nodeId - Node ID
   * @param {Object} linkData - Link data (crm_record_type, crm_record_id, sync_enabled)
   * @returns {Promise<Object>} Created link
   */
  async linkToCRM(nodeId, linkData) {
    const response = await fetch(`${this.baseURL}/nodes/${nodeId}/link-crm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(linkData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to link to CRM');
    }

    return await response.json();
  }

  /**
   * Get CRM links for a node
   * @param {string} nodeId - Node ID
   * @returns {Promise<Array>} List of CRM links
   */
  async getCRMLinks(nodeId) {
    const response = await fetch(`${this.baseURL}/nodes/${nodeId}/crm-links`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch CRM links');
    }

    return await response.json();
  }

  /**
   * Sync CRM data to create nodes
   * @param {Object} options - Sync options (types: ['contacts', 'leads', 'deals', 'activities'])
   * @returns {Promise<Object>} Sync results
   */
  async syncCRMData(options = {}) {
    const response = await fetch(`${this.baseURL}/sync-crm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sync CRM data');
    }

    return await response.json();
  }

  // =====================================================
  // MAPS VIEW - Infinite Canvas
  // =====================================================

  async getMaps(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}/maps${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch maps');
    return await response.json();
  }

  async getMap(mapId) {
    const response = await fetch(`${this.baseURL}/maps/${mapId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch map');
    return await response.json();
  }

  async createMap(mapData) {
    const response = await fetch(`${this.baseURL}/maps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(mapData),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to create map');
    return await response.json();
  }

  async updateMap(mapId, updates) {
    const response = await fetch(`${this.baseURL}/maps/${mapId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to update map');
    return await response.json();
  }

  async deleteMap(mapId) {
    const response = await fetch(`${this.baseURL}/maps/${mapId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to delete map');
    return await response.json();
  }

  async duplicateMap(mapId) {
    const response = await fetch(`${this.baseURL}/maps/${mapId}/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to duplicate map');
    return await response.json();
  }

  async getMapObjects(mapId) {
    const response = await fetch(`${this.baseURL}/maps/${mapId}/objects`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch objects');
    return await response.json();
  }

  async createMapObject(mapId, objectData) {
    const response = await fetch(`${this.baseURL}/maps/${mapId}/objects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(objectData),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to create object');
    return await response.json();
  }

  async updateMapObject(mapId, objectId, updates) {
    const response = await fetch(`${this.baseURL}/maps/${mapId}/objects/${objectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to update object');
    return await response.json();
  }

  async deleteMapObject(mapId, objectId) {
    const response = await fetch(`${this.baseURL}/maps/${mapId}/objects/${objectId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to delete object');
    return await response.json();
  }

  async bulkUpdateMapObjects(mapId, updates) {
    const response = await fetch(`${this.baseURL}/maps/${mapId}/objects/bulk`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ updates }),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to bulk update');
    return await response.json();
  }

  async getMapConnectors(mapId) {
    const response = await fetch(`${this.baseURL}/maps/${mapId}/connectors`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch connectors');
    return await response.json();
  }

  async createMapConnector(mapId, connectorData) {
    const response = await fetch(`${this.baseURL}/maps/${mapId}/connectors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(connectorData),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to create connector');
    return await response.json();
  }

  async deleteMapConnector(mapId, connectorId) {
    const response = await fetch(`${this.baseURL}/maps/${mapId}/connectors/${connectorId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to delete connector');
    return await response.json();
  }

  // =====================================================
  // NOTES VIEW - Documents
  // =====================================================

  async getNotes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}/notes${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch notes');
    return await response.json();
  }

  async getNote(noteId) {
    const response = await fetch(`${this.baseURL}/notes/${noteId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch note');
    return await response.json();
  }

  async getNoteBySlug(slug) {
    const response = await fetch(`${this.baseURL}/notes/slug/${slug}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch note');
    return await response.json();
  }

  async createNote(noteData) {
    const response = await fetch(`${this.baseURL}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(noteData),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to create note');
    return await response.json();
  }

  async updateNote(noteId, updates) {
    const response = await fetch(`${this.baseURL}/notes/${noteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to update note');
    return await response.json();
  }

  async deleteNote(noteId) {
    const response = await fetch(`${this.baseURL}/notes/${noteId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to delete note');
    return await response.json();
  }

  async duplicateNote(noteId) {
    const response = await fetch(`${this.baseURL}/notes/${noteId}/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to duplicate note');
    return await response.json();
  }

  async moveNoteToFolder(noteId, folder) {
    const response = await fetch(`${this.baseURL}/notes/${noteId}/move`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ folder }),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to move note');
    return await response.json();
  }

  async getBacklinks(noteId) {
    const response = await fetch(`${this.baseURL}/notes/${noteId}/backlinks`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch backlinks');
    return await response.json();
  }

  async searchNotes(query, params = {}) {
    const queryString = new URLSearchParams({ q: query, ...params }).toString();
    const response = await fetch(`${this.baseURL}/notes/search?${queryString}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to search notes');
    return await response.json();
  }

  async getFolders() {
    const response = await fetch(`${this.baseURL}/notes/folders`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch folders');
    return await response.json();
  }

  async getTags() {
    const response = await fetch(`${this.baseURL}/notes/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch tags');
    return await response.json();
  }

  async getNoteComments(noteId) {
    const response = await fetch(`${this.baseURL}/notes/${noteId}/comments`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch comments');
    return await response.json();
  }

  async addNoteComment(noteId, commentData) {
    const response = await fetch(`${this.baseURL}/notes/${noteId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(commentData),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Failed to add comment');
    return await response.json();
  }

  // =====================================================
  // HEALTH CHECK
  // =====================================================

  /**
   * Check Second Brain API health
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    const response = await fetch(`${this.baseURL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Second Brain API is unhealthy');
    }

    return await response.json();
  }
}

// Export singleton instance
const secondBrainApi = new SecondBrainAPI();
export default secondBrainApi;
