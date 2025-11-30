import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Search, FolderTree, Clock, Star, ArrowLeft, ExternalLink, X, Hash } from 'lucide-react';
import SecondBrainLayout from '../../layouts/SecondBrainLayout';
import RichTextEditor from '../../components/RichTextEditor';
import secondBrainApi from '../../services/secondBrainApi';

const NotesView = () => {
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [backlinks, setBacklinks] = useState([]);
  const [showBacklinks, setShowBacklinks] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'

  // Load notes on mount
  useEffect(() => {
    loadNotes();
    loadFolders();
    loadTags();
  }, []);

  // Load notes based on filters
  const loadNotes = async (filters = {}) => {
    try {
      setLoading(true);
      const params = {
        folder: selectedFolder !== 'all' ? selectedFolder : undefined,
        search: searchQuery || undefined,
        starred: selectedFolder === 'starred' ? true : undefined,
        ...filters,
      };

      try {
        const response = await secondBrainApi.getNotes(params);
        setNotes(response.notes || []);
      } catch (apiError) {
        // Fallback: Use empty notes if API fails
        console.warn('API not available, using empty notes:', apiError);
        setNotes([]);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const response = await secondBrainApi.getFolders();
      setFolders(response || []);
    } catch (error) {
      console.warn('API not available, using empty folders:', error);
      setFolders([]);
    }
  };

  const loadTags = async () => {
    try {
      const response = await secondBrainApi.getTags();
      setTags(response || []);
    } catch (error) {
      console.warn('API not available, using empty tags:', error);
      setTags([]);
    }
  };

  const loadBacklinks = async (noteId) => {
    try {
      const response = await secondBrainApi.getBacklinks(noteId);
      setBacklinks(response || []);
    } catch (error) {
      console.error('Error loading backlinks:', error);
    }
  };

  // Create new note (Notion-like: create immediately, show in UI)
  const handleCreateNote = async () => {
    // Create a local note immediately (Notion-like UX)
    const localNote = {
      id: `local-${Date.now()}`,
      title: 'Untitled',
      content_text: '',
      content: '',
      folder: selectedFolder !== 'all' && selectedFolder !== 'starred' ? selectedFolder : 'default',
      starred: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isLocal: true, // Mark as local/unsaved
    };

    setNotes([localNote, ...notes]);
    setSelectedNote(localNote);

    // Try to save to API in background (optional)
    try {
      const savedNote = await secondBrainApi.createNote({
        title: 'Untitled',
        content_text: '',
        folder: localNote.folder,
      });
      // Replace local note with saved note
      setNotes(prev => prev.map(n => n.id === localNote.id ? { ...savedNote, isLocal: false } : n));
      setSelectedNote({ ...savedNote, isLocal: false });
    } catch (error) {
      console.warn('Could not save note to API, keeping local:', error);
      // Note remains local-only, which is fine
    }
  };

  // Select note and load backlinks
  const handleSelectNote = async (note) => {
    // Notion-like: If leaving an empty note, delete it
    if (selectedNote && (!selectedNote.title || selectedNote.title === 'Untitled') && (!selectedNote.content_text || selectedNote.content_text.trim() === '')) {
      // Delete empty note
      setNotes(prev => prev.filter(n => n.id !== selectedNote.id));

      // Try to delete from API if it was saved
      if (!selectedNote.isLocal) {
        try {
          await secondBrainApi.deleteNote(selectedNote.id);
        } catch (error) {
          console.warn('Could not delete empty note from API:', error);
        }
      }
    }

    setSelectedNote(note);

    // Only load backlinks if not a local note
    if (!note.isLocal) {
      try {
        await loadBacklinks(note.id);
      } catch (error) {
        console.warn('Could not load backlinks:', error);
      }
    }
    setShowBacklinks(false);
  };

  // Save note (debounced in production)
  const handleSaveNote = useCallback(async (content) => {
    if (!selectedNote) return;

    try {
      setSaveStatus('saving');
      await secondBrainApi.updateNote(selectedNote.id, {
        content_text: content.text,
        content: content.html,
      });
      setSaveStatus('saved');

      // Reload backlinks as content may have new [[links]]
      await loadBacklinks(selectedNote.id);

      // Update note in list
      setNotes(notes.map(n => n.id === selectedNote.id ? { ...n, content_text: content.text } : n));
    } catch (error) {
      console.error('Error saving note:', error);
      setSaveStatus('error');
    }
  }, [selectedNote, notes]);

  // Update note title
  const handleUpdateTitle = useCallback(async (title) => {
    if (!selectedNote) return;

    try {
      await secondBrainApi.updateNote(selectedNote.id, { title });
      setSelectedNote({ ...selectedNote, title });
      setNotes(notes.map(n => n.id === selectedNote.id ? { ...n, title } : n));
    } catch (error) {
      console.error('Error updating title:', error);
    }
  }, [selectedNote, notes]);

  // Toggle star
  const handleToggleStar = useCallback(async (note) => {
    try {
      await secondBrainApi.updateNote(note.id, { starred: !note.starred });
      setNotes(notes.map(n => n.id === note.id ? { ...n, starred: !n.starred } : n));
      if (selectedNote?.id === note.id) {
        setSelectedNote({ ...selectedNote, starred: !selectedNote.starred });
      }
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  }, [notes, selectedNote]);

  // Delete note
  const handleDeleteNote = useCallback(async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await secondBrainApi.deleteNote(noteId);
      setNotes(notes.filter(n => n.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }, [notes, selectedNote]);

  // Search
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      try {
        const response = await secondBrainApi.searchNotes(query);
        setNotes(response || []);
      } catch (error) {
        console.error('Error searching notes:', error);
      }
    } else if (query.length === 0) {
      loadNotes();
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <SecondBrainLayout>
      <div className="relative h-screen w-screen flex flex-col bg-gray-50 dark:bg-gray-900 p-0 m-0">
        {/* Floating Action Buttons */}
        {selectedNote && (
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-4">
            <button
              onClick={() => setSelectedNote(null)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-900 shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={selectedNote.title}
              onChange={(e) => handleUpdateTitle(e.target.value)}
              onBlur={(e) => handleUpdateTitle(e.target.value)}
              className="text-xl font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-900 shadow-lg border-none focus:outline-none flex-1 px-4 py-2 rounded-lg"
            />

            <button
              onClick={() => setShowBacklinks(!showBacklinks)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-900 shadow-lg"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm">{backlinks.length}</span>
            </button>

            <button
              onClick={() => handleToggleStar(selectedNote)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors bg-white dark:bg-gray-900 shadow-lg"
            >
              <Star className={`w-5 h-5 ${selectedNote.starred ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600 dark:text-gray-400'}`} />
            </button>
          </div>
        )}

        {!selectedNote && (
          <button
            onClick={handleCreateNote}
            className="btn-premium-red absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">New Note</span>
          </button>
        )}

        {/* Main Content */}
        <div className="absolute inset-0 w-full h-full overflow-hidden flex pt-16">
          {/* Notes List or Editor */}
          <div className="flex-1 overflow-hidden flex">
            {selectedNote ? (
              // Editor View
              <>
                <div className="flex-1 overflow-y-auto">
                  <RichTextEditor
                    content={selectedNote.content || ''}
                    onChange={handleSaveNote}
                    onSave={handleSaveNote}
                    className="h-full"
                  />
                </div>

                {/* Backlinks Panel */}
                {showBacklinks && backlinks.length > 0 && (
                  <div className="w-80 border-l border-gray-200 dark:border-gray-800/50 bg-white dark:bg-gray-900 overflow-y-auto p-4 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Backlinks</h3>
                      <button
                        onClick={() => setShowBacklinks(false)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {backlinks.map(backlink => (
                        <button
                          key={backlink.source_note.id}
                          onClick={() => handleSelectNote(backlink.source_note)}
                          className="w-full text-left p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium mb-1">
                            {backlink.source_note.icon && <span>{backlink.source_note.icon}</span>}
                            <span className="text-sm">{backlink.source_note.title}</span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-500">{backlink.source_note.folder}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Notes List View
              <div className="flex-1 w-full overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <FileText className="w-12 h-12 text-[#761B14] animate-pulse" />
                  </div>
                ) : notes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No notes yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first note to get started</p>
                    <button
                      onClick={handleCreateNote}
                      className="btn-premium-red px-6 py-3 text-white rounded-lg transition-colors"
                    >
                      Create Note
                    </button>
                  </div>
                ) : (
                  <div className="max-w-7xl mx-auto">
                    <div className="grid gap-3">
                      {notes.map(note => (
                        <button
                          key={note.id}
                          onClick={() => handleSelectNote(note)}
                          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800/30 hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg transition-all text-left group shadow-sm"
                        >
                          <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-[#761B14] transition-colors" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {note.icon && <span>{note.icon}</span>}
                              <div className="text-gray-900 dark:text-white font-medium truncate">{note.title}</div>
                            </div>
                            {note.content_text && (
                              <div className="text-sm text-gray-600 dark:text-gray-500 truncate">{note.content_text.substring(0, 100)}</div>
                            )}
                            <div className="text-xs text-gray-500 dark:text-gray-600 mt-1">
                              {note.folder} • {formatDate(note.updated_at)}
                            </div>
                          </div>
                          {note.starred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </SecondBrainLayout>
  );
};

export default NotesView;
