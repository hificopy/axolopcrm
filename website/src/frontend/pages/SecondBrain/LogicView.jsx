import { useState, useEffect, useRef } from 'react';
import { FileText, Network, Database, Folder, Link2, Plus, Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import SecondBrainLayout from '../../layouts/SecondBrainLayout';
import secondBrainApi from '../../services/secondBrainApi';

const LogicView = () => {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showNewNodeModal, setShowNewNodeModal] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  // Fetch nodes and connections on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      try {
        // Fetch nodes and connections in parallel
        const [nodesData, connectionsData] = await Promise.all([
          secondBrainApi.getNodes(),
          secondBrainApi.getConnections(),
        ]);

        // Transform nodes to include rendering positions
        const transformedNodes = nodesData.nodes.map(node => ({
          ...node,
          x: node.position_x || (node.orbit_level === 0 ? 400 + Math.random() * 200 : 0),
          y: node.position_y || (node.orbit_level === 0 ? 300 : 0),
          angle: node.angle || Math.random() * 360,
          radius: node.radius || (node.orbit_level * 100 + 180),
          orbit: node.orbit_level,
        }));

        // Transform connections
        const transformedConnections = connectionsData.map(conn => ({
          id: conn.id,
          from: conn.from_node_id,
          to: conn.to_node_id,
          type: conn.connection_type,
          strength: conn.strength,
        }));

        setNodes(transformedNodes);
        setConnections(transformedConnections);
      } catch (apiError) {
        // Fallback: Use empty data if API fails
        console.warn('API not available, using empty logic map:', apiError);
        setNodes([]);
        setConnections([]);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(null); // Don't show error, just use empty state
      setNodes([]);
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  // Animation loop for orbiting nodes
  useEffect(() => {
    let animationFrame;
    let time = 0;

    const animate = () => {
      time += 0.005;

      setNodes(prevNodes =>
        prevNodes.map(node => {
          if (node.orbit > 0) {
            // Calculate orbiting position
            const centerX = 500;
            const centerY = 300;
            const angle = (node.angle + time * (4 - node.orbit)) * (Math.PI / 180);
            const x = centerX + Math.cos(angle) * node.radius;
            const y = centerY + Math.sin(angle) * node.radius;
            return { ...node, x, y };
          }
          return node;
        })
      );

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  // Draw graph on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    ctx.strokeStyle = 'rgba(118, 27, 20, 0.2)';
    ctx.lineWidth = 2;
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size / 2, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();

      // Glow effect
      if (selectedNode?.id === node.id) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Node border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Icon
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const icon = node.type === 'database' ? 'D' : node.type === 'mindmap' ? 'M' : 'N';
      ctx.fillText(icon, node.x, node.y);

      // Label
      ctx.font = '12px Inter';
      ctx.fillStyle = 'white';
      ctx.fillText(node.label, node.x, node.y + node.size / 2 + 15);
    });
  }, [nodes, connections, selectedNode]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked on a node
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
      return distance < node.size / 2;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
    } else {
      setSelectedNode(null);
    }
  };

  const getNodeIcon = (type) => {
    switch (type) {
      case 'database': return <Database className="w-4 h-4" />;
      case 'mindmap': return <Network className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return <Folder className="w-4 h-4" />;
    }
  };

  const handleCreateNode = async (nodeData) => {
    try {
      setIsCreating(true);
      const newNode = await secondBrainApi.createNode(nodeData);
      await loadData(); // Reload data to get updated list
      setShowNewNodeModal(false);
    } catch (err) {
      console.error('Error creating node:', err);
      alert(`Failed to create node: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateConnection = async (fromNodeId, toNodeId) => {
    try {
      setIsCreating(true);
      await secondBrainApi.createConnection({
        from_node_id: fromNodeId,
        to_node_id: toNodeId,
        connection_type: 'related',
        strength: 1.0,
      });
      await loadData(); // Reload data to get updated connections
      setShowConnectionModal(false);
    } catch (err) {
      console.error('Error creating connection:', err);
      alert(`Failed to create connection: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSyncCRM = async () => {
    try {
      setIsCreating(true);
      const result = await secondBrainApi.syncCRMData({
        types: ['contacts', 'leads', 'deals', 'activities'],
      });
      await loadData(); // Reload to show synced nodes
      alert(`Synced: ${result.results.contacts.length} contacts, ${result.results.leads.length} leads`);
    } catch (err) {
      console.error('Error syncing CRM:', err);
      alert(`Failed to sync CRM: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  // Calculate node counts
  const nodeCounts = {
    database: nodes.filter(n => n.type === 'database').length,
    document: nodes.filter(n => n.type === 'document').length,
    mindmap: nodes.filter(n => n.type === 'mindmap').length,
  };

  // Loading state
  if (loading) {
    return (
      <SecondBrainLayout>
        <div className="h-full min-h-screen flex items-center justify-center pt-[150px] bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-[#761B14] mx-auto mb-4 animate-spin" />
            <p className="text-gray-900 dark:text-white text-lg font-semibold">Loading Logic Map...</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">Fetching nodes and connections</p>
          </div>
        </div>
      </SecondBrainLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <SecondBrainLayout>
        <div className="h-full min-h-screen flex items-center justify-center pt-[150px] bg-gray-50 dark:bg-gray-900">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-gray-900 dark:text-white text-xl font-bold mb-2">Failed to Load Data</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={loadData}
              className="px-6 py-3 bg-[#761B14] hover:bg-[#651610] text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </SecondBrainLayout>
    );
  }

  return (
    <SecondBrainLayout>
      <div className="relative h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900 p-0 m-0">
        {/* Floating Action Buttons */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={handleSyncCRM}
            disabled={isCreating}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-gray-200 dark:border-gray-700"
            title="Sync CRM data to create nodes"
          >
            <RefreshCw className={`w-4 h-4 ${isCreating ? 'animate-spin' : ''}`} />
            <span className="text-sm">Sync CRM</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors disabled:opacity-50 shadow-lg border border-gray-200 dark:border-gray-700"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowNewNodeModal(true)}
            disabled={isCreating}
            className="flex items-center gap-2 px-3 py-2 bg-[#761B14] hover:bg-[#651610] text-white rounded-lg transition-colors disabled:opacity-50 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">New Node</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="absolute inset-0 w-full h-full flex overflow-hidden">
          {/* Graph Canvas */}
          <div className="flex-1 relative">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="absolute inset-0 cursor-pointer"
              style={{ width: '100%', height: '100%' }}
            />

            {/* Instructions overlay */}
            {!selectedNode && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
                <p className="text-gray-900 dark:text-white text-sm">
                  <span className="font-semibold">Click</span> on any node to view details •
                  <span className="font-semibold ml-2">Scroll</span> to zoom
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Node Details */}
          {selectedNode && (
            <div className="w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 overflow-y-auto shadow-xl">
              <div className="p-6">
                {/* Node Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: selectedNode.color }}
                    >
                      {getNodeIcon(selectedNode.type)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedNode.label}</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{selectedNode.type}</p>
                    </div>
                  </div>
                </div>

                {/* Node Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="text-gray-600 dark:text-gray-400 text-xs mb-1">Connections</div>
                    <div className="text-gray-900 dark:text-white text-2xl font-bold">
                      {connections.filter(c => c.from === selectedNode.id || c.to === selectedNode.id).length}
                    </div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="text-gray-600 dark:text-gray-400 text-xs mb-1">Orbit Level</div>
                    <div className="text-gray-900 dark:text-white text-2xl font-bold">{selectedNode.orbit}</div>
                  </div>
                </div>

                {/* Connected Nodes */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Connected To
                  </h3>
                  <div className="space-y-2">
                    {connections
                      .filter(c => c.from === selectedNode.id || c.to === selectedNode.id)
                      .map((conn, i) => {
                        const connectedId = conn.from === selectedNode.id ? conn.to : conn.from;
                        const connectedNode = nodes.find(n => n.id === connectedId);
                        return connectedNode ? (
                          <button
                            key={i}
                            onClick={() => setSelectedNode(connectedNode)}
                            className="w-full flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors group border border-gray-200 dark:border-gray-700"
                          >
                            <div
                              className="w-8 h-8 rounded flex items-center justify-center text-white text-xs"
                              style={{ backgroundColor: connectedNode.color }}
                            >
                              {getNodeIcon(connectedNode.type)}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="text-gray-900 dark:text-white text-sm font-medium group-hover:text-[#761B14] transition-colors">
                                {connectedNode.label}
                              </div>
                              <div className="text-gray-600 dark:text-gray-400 text-xs capitalize">{connectedNode.type}</div>
                            </div>
                            <Link2 className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-[#761B14] transition-colors" />
                          </button>
                        ) : null;
                      })}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#761B14] hover:bg-[#651610] text-white rounded-lg transition-colors shadow-sm">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">Open {selectedNode.type}</span>
                  </button>
                  <button
                    onClick={() => setShowConnectionModal(true)}
                    disabled={isCreating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors disabled:opacity-50 border border-gray-200 dark:border-gray-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="font-medium">Create Connection</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* New Node Modal */}
        {showNewNodeModal && <NewNodeModal onClose={() => setShowNewNodeModal(false)} onCreate={handleCreateNode} isCreating={isCreating} />}

        {/* Connection Modal */}
        {showConnectionModal && selectedNode && (
          <ConnectionModal
            fromNode={selectedNode}
            nodes={nodes}
            onClose={() => setShowConnectionModal(false)}
            onCreate={handleCreateConnection}
            isCreating={isCreating}
          />
        )}
      </div>
    </SecondBrainLayout>
  );
};

// New Node Modal Component
const NewNodeModal = ({ onClose, onCreate, isCreating }) => {
  const [formData, setFormData] = useState({
    type: 'document',
    label: '',
    description: '',
    color: '#4C7FFF',
    orbit_level: 1,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.label.trim()) {
      alert('Please enter a label');
      return;
    }
    onCreate(formData);
  };

  const typeColors = {
    database: '#761B14',
    document: '#4C7FFF',
    mindmap: '#00D084',
    folder: '#FFA500',
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Create New Node</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value, color: typeColors[e.target.value] })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#761B14]"
            >
              <option value="database">Database</option>
              <option value="document">Document</option>
              <option value="mindmap">Mind Map</option>
              <option value="folder">Folder</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Label *</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#761B14]"
              placeholder="Enter node label..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#761B14]"
              placeholder="Enter description..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Orbit Level</label>
            <select
              value={formData.orbit_level}
              onChange={(e) => setFormData({ ...formData, orbit_level: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#761B14]"
            >
              <option value={0}>0 - Center (Fixed)</option>
              <option value={1}>1 - Inner Ring</option>
              <option value={2}>2 - Middle Ring</option>
              <option value={3}>3 - Outer Ring</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#761B14] hover:bg-[#651610] text-white rounded-lg transition-colors disabled:opacity-50"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Node'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Connection Modal Component
const ConnectionModal = ({ fromNode, nodes, onClose, onCreate, isCreating }) => {
  const [selectedNodeId, setSelectedNodeId] = useState('');

  const availableNodes = nodes.filter(n => n.id !== fromNode.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedNodeId) {
      alert('Please select a node to connect to');
      return;
    }
    onCreate(fromNode.id, selectedNodeId);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Create Connection</h2>
        <div className="mb-4">
          <p className="text-gray-400 text-sm mb-2">From:</p>
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: fromNode.color }}>
              <span className="text-white text-xs font-bold">
                {fromNode.type === 'database' ? 'D' : fromNode.type === 'mindmap' ? 'M' : 'N'}
              </span>
            </div>
            <div>
              <div className="text-white font-medium">{fromNode.label}</div>
              <div className="text-gray-400 text-xs capitalize">{fromNode.type}</div>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Connect To:</label>
            <select
              value={selectedNodeId}
              onChange={(e) => setSelectedNodeId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#761B14]"
              required
            >
              <option value="">Select a node...</option>
              {availableNodes.map(node => (
                <option key={node.id} value={node.id}>
                  {node.label} ({node.type})
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#761B14] hover:bg-[#651610] text-white rounded-lg transition-colors disabled:opacity-50"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Connection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogicView;
