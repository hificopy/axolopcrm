import { useState, useEffect, useCallback } from 'react';
import { Network, Plus, Hand, Square, Circle, ArrowRight, Type, Image, StickyNote, Trash2, Copy, Layers } from 'lucide-react';
import SecondBrainLayout from '../../layouts/SecondBrainLayout';
import InfiniteCanvas from '../../components/InfiniteCanvas';
import secondBrainApi from '../../services/secondBrainApi';

const MapsView = () => {
  const [selectedTool, setSelectedTool] = useState('select');
  const [currentMap, setCurrentMap] = useState(null);
  const [objects, setObjects] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maps, setMaps] = useState([]);
  const [showMapSelector, setShowMapSelector] = useState(false);

  // Load maps on mount
  useEffect(() => {
    loadMaps();
  }, []);

  const loadMaps = async () => {
    try {
      setLoading(true);

      try {
        const response = await secondBrainApi.getMaps({ limit: 20 });
        setMaps(response.maps || []);

        // Load first map or create default
        if (response.maps && response.maps.length > 0) {
          loadMap(response.maps[0].id);
        } else {
          // Create default map
          const newMap = await secondBrainApi.createMap({
            name: 'My First Board',
            background_color: '#1a1a1a',
            viewport_x: 0,
            viewport_y: 0,
            viewport_zoom: 1,
          });
          setCurrentMap(newMap);
          setMaps([newMap]);
        }
      } catch (apiError) {
        // Fallback: Create a default local map if API fails
        console.warn('API not available, using local map:', apiError);
        const defaultMap = {
          id: 'local-map-1',
          name: 'My First Board',
          background_color: '#f9fafb',
          viewport_x: 0,
          viewport_y: 0,
          viewport_zoom: 1,
        };
        setCurrentMap(defaultMap);
        setMaps([defaultMap]);
        setObjects([]);
      }
    } catch (error) {
      console.error('Error loading maps:', error);
      // Ensure we always have a map to work with
      const fallbackMap = {
        id: 'fallback-map',
        name: 'New Board',
        background_color: '#f9fafb',
        viewport_x: 0,
        viewport_y: 0,
        viewport_zoom: 1,
      };
      setCurrentMap(fallbackMap);
      setMaps([fallbackMap]);
      setObjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMap = async (mapId) => {
    try {
      setLoading(true);

      try {
        const map = await secondBrainApi.getMap(mapId);
        setCurrentMap(map);

        // Load objects for this map
        const objectsData = await secondBrainApi.getMapObjects(mapId);
        setObjects(objectsData || []);
      } catch (apiError) {
        console.warn('API not available for loadMap, using empty canvas:', apiError);
        // Just use empty objects array if API fails
        setObjects([]);
      }
    } catch (error) {
      console.error('Error loading map:', error);
      setObjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewBoard = async () => {
    try {
      try {
        const newMap = await secondBrainApi.createMap({
          name: `Board ${maps.length + 1}`,
          background_color: '#f9fafb',
          viewport_x: 0,
          viewport_y: 0,
          viewport_zoom: 1,
        });
        setMaps([...maps, newMap]);
        setCurrentMap(newMap);
        setObjects([]);
      } catch (apiError) {
        // Fallback: Create local map
        console.warn('API not available, creating local board:', apiError);
        const localMap = {
          id: `local-map-${Date.now()}`,
          name: `Board ${maps.length + 1}`,
          background_color: '#f9fafb',
          viewport_x: 0,
          viewport_y: 0,
          viewport_zoom: 1,
        };
        setMaps([...maps, localMap]);
        setCurrentMap(localMap);
        setObjects([]);
      }
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const handleObjectsChange = useCallback(async (updatedObjects) => {
    setObjects(updatedObjects);

    // Auto-save to backend (debounced in production)
    if (currentMap) {
      try {
        // Find changed objects and update them
        const updates = updatedObjects
          .filter(obj => obj.isDirty)
          .map(obj => ({
            id: obj.id,
            position_x: obj.position_x,
            position_y: obj.position_y,
            width: obj.width,
            height: obj.height,
            rotation: obj.rotation,
            data: obj.data,
            style: obj.style,
          }));

        if (updates.length > 0) {
          await secondBrainApi.bulkUpdateMapObjects(currentMap.id, updates);
        }
      } catch (error) {
        console.error('Error saving objects:', error);
      }
    }
  }, [currentMap]);

  const handleCreateObject = useCallback(async (objectData) => {
    if (!currentMap) return;

    try {
      const newObject = await secondBrainApi.createMapObject(currentMap.id, objectData);
      setObjects([...objects, newObject]);
    } catch (error) {
      console.error('Error creating object:', error);
    }
  }, [currentMap, objects]);

  const handleDeleteObject = useCallback(async (objectId) => {
    if (!currentMap) return;

    try {
      await secondBrainApi.deleteMapObject(currentMap.id, objectId);
      setObjects(objects.filter(obj => obj.id !== objectId));
      setSelectedObject(null);
    } catch (error) {
      console.error('Error deleting object:', error);
    }
  }, [currentMap, objects]);

  const handleDuplicateObject = useCallback(async () => {
    if (!currentMap || !selectedObject) return;

    try {
      const newObject = await secondBrainApi.createMapObject(currentMap.id, {
        ...selectedObject,
        position_x: selectedObject.position_x + 20,
        position_y: selectedObject.position_y + 20,
      });
      setObjects([...objects, newObject]);
    } catch (error) {
      console.error('Error duplicating object:', error);
    }
  }, [currentMap, selectedObject, objects]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Delete' && selectedObject) {
      handleDeleteObject(selectedObject.id);
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'd' && selectedObject) {
      e.preventDefault();
      handleDuplicateObject();
    }
  }, [selectedObject, handleDeleteObject, handleDuplicateObject]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const toolButtons = [
    { id: 'select', icon: Hand, label: 'Select' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'sticky_note', icon: StickyNote, label: 'Sticky Note' },
    { id: 'image', icon: Image, label: 'Image' },
  ];

  if (loading) {
    return (
      <SecondBrainLayout>
        <div className="h-full min-h-screen flex items-center justify-center pt-[150px] bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <Network className="w-16 h-16 text-[#761B14] mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Loading canvas...</p>
          </div>
        </div>
      </SecondBrainLayout>
    );
  }

  return (
    <SecondBrainLayout>
      <div className="relative h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900 p-0 m-0">
        {/* Floating Toolbars */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
          {/* Tools */}
          <div className="flex items-center gap-1">
            {toolButtons.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setSelectedTool(id)}
                className={`p-2 rounded-lg transition-colors ${
                  selectedTool === id
                    ? 'bg-[#761B14] text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title={label}
              >
                <Icon className="w-5 h-5" />
              </button>
            ))}
          </div>

          {/* Object actions */}
          {selectedObject && (
            <>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center gap-1">
                <button
                  onClick={handleDuplicateObject}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  title="Duplicate (Cmd+D)"
                >
                  <Copy className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteObject(selectedObject.id)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  title="Delete (Del)"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>

        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {/* Map selector */}
          <div className="relative">
            <button
              onClick={() => setShowMapSelector(!showMapSelector)}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <span className="text-gray-900 dark:text-white font-medium">{currentMap?.name || 'Select Board'}</span>
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showMapSelector && (
              <div className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                {maps.map(map => (
                  <button
                    key={map.id}
                    onClick={() => {
                      loadMap(map.id);
                      setShowMapSelector(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      currentMap?.id === map.id ? 'bg-gray-100 dark:bg-gray-700 text-[#761B14]' : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {map.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleCreateNewBoard}
            className="flex items-center gap-2 px-4 py-2 bg-[#761B14] hover:bg-[#651610] text-white rounded-lg transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">New Board</span>
          </button>
        </div>

        {/* Canvas Area */}
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
          {currentMap ? (
            <InfiniteCanvas
              objects={objects}
              onObjectsChange={handleObjectsChange}
              onCreateObject={handleCreateObject}
              selectedTool={selectedTool}
              onObjectSelect={setSelectedObject}
              backgroundColor={currentMap?.background_color || '#f9fafb'}
              gridSize={20}
              showGrid={true}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Network className="w-24 h-24 text-[#761B14] mx-auto mb-6 opacity-50" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Board Selected</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first board to get started</p>
                <button
                  onClick={handleCreateNewBoard}
                  className="px-6 py-3 bg-[#761B14] hover:bg-[#651610] text-white rounded-lg transition-colors shadow-lg"
                >
                  Create Board
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SecondBrainLayout>
  );
};

export default MapsView;
