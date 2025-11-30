/**
 * Second Brain - Notes Service
 * Complete Notion/Obsidian clone
 * Handles documents, blocks, bi-directional links, backlinks
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Get all notes for a user
 */
const getNotes = async (userId, options = {}) => {
  try {
    let query = supabase
      .from('second_brain_notes')
      .select('*, links_from:second_brain_note_links!source_note_id(count), links_to:second_brain_note_links!target_note_id(count)')
      .eq('user_id', userId);

    // Filter by folder
    if (options.folder) {
      query = query.eq('folder', options.folder);
    }

    // Filter by starred
    if (options.starred) {
      query = query.eq('starred', true);
    }

    // Search
    if (options.search) {
      query = query.textSearch('search_vector', options.search);
    }

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      query = query.contains('tags', options.tags);
    }

    // Pagination
    const page = options.page || 1;
    const limit = options.limit || 50;
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Order by
    const sortBy = options.sortBy || 'updated_at';
    const sortOrder = options.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;
    if (error) throw error;

    return {
      notes: data,
      pagination: { page, limit, total: data.length },
    };
  } catch (error) {
    console.error('[NotesService] Error getting notes:', error);
    throw error;
  }
};

/**
 * Get a single note by ID with all related data
 */
const getNoteById = async (userId, noteId) => {
  try {
    const { data: note, error: noteError } = await supabase
      .from('second_brain_notes')
      .select(`
        *,
        links_from:second_brain_note_links!source_note_id(*, target_note:second_brain_notes!target_note_id(id, title)),
        links_to:second_brain_note_links!target_note_id(*, source_note:second_brain_notes!source_note_id(id, title)),
        comments:second_brain_note_comments(*)
      `)
      .eq('id', noteId)
      .eq('user_id', userId)
      .single();

    if (noteError) throw noteError;

    // Update view count
    await supabase
      .from('second_brain_notes')
      .update({ view_count: (note.view_count || 0) + 1 })
      .eq('id', noteId);

    return note;
  } catch (error) {
    console.error('[NotesService] Error getting note:', error);
    throw error;
  }
};

/**
 * Get note by slug (for wiki-style URLs)
 */
const getNoteBySlug = async (userId, slug) => {
  try {
    const { data, error } = await supabase
      .from('second_brain_notes')
      .select('*')
      .eq('user_id', userId)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[NotesService] Error getting note by slug:', error);
    throw error;
  }
};

/**
 * Create a new note
 */
const createNote = async (userId, noteData) => {
  try {
    // Generate slug from title
    const slug = noteData.title
      ? noteData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : `note-${Date.now()}`;

    const note = {
      user_id: userId,
      title: noteData.title || 'Untitled',
      slug,
      content: noteData.content || { type: 'doc', content: [] }, // ProseMirror document
      content_text: noteData.content_text || '', // Plain text for search
      folder: noteData.folder || 'default',
      icon: noteData.icon,
      cover_image: noteData.cover_image,
      starred: noteData.starred || false,
      is_database: noteData.is_database || false,
      database_type: noteData.database_type, // 'table', 'board', 'list', 'calendar', 'gallery'
      tags: noteData.tags || [],
      workspace_id: noteData.workspace_id,
    };

    const { data, error } = await supabase
      .from('second_brain_notes')
      .insert(note)
      .select()
      .single();

    if (error) throw error;

    await logActivity(userId, 'create', 'note', data.id, { title: data.title });
    return data;
  } catch (error) {
    console.error('[NotesService] Error creating note:', error);
    throw error;
  }
};

/**
 * Update a note
 */
const updateNote = async (userId, noteId, updates) => {
  try {
    const allowedUpdates = {
      title: updates.title,
      content: updates.content,
      content_text: updates.content_text,
      folder: updates.folder,
      icon: updates.icon,
      cover_image: updates.cover_image,
      starred: updates.starred,
      tags: updates.tags,
    };

    // Update slug if title changed
    if (updates.title) {
      allowedUpdates.slug = updates.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key =>
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    const { data, error} = await supabase
      .from('second_brain_notes')
      .update({ ...allowedUpdates, updated_at: new Date() })
      .eq('id', noteId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Extract and update bi-directional links
    if (updates.content || updates.content_text) {
      await updateBidirectionalLinks(userId, noteId, updates.content_text || '');
    }

    await logActivity(userId, 'update', 'note', noteId, { updates: Object.keys(allowedUpdates) });
    return data;
  } catch (error) {
    console.error('[NotesService] Error updating note:', error);
    throw error;
  }
};

/**
 * Delete a note
 */
const deleteNote = async (userId, noteId) => {
  try {
    const { error } = await supabase
      .from('second_brain_notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', userId);

    if (error) throw error;

    await logActivity(userId, 'delete', 'note', noteId, {});
    return { success: true };
  } catch (error) {
    console.error('[NotesService] Error deleting note:', error);
    throw error;
  }
};

/**
 * Update bi-directional links based on note content
 */
const updateBidirectionalLinks = async (userId, noteId, contentText) => {
  try {
    // Extract [[wiki-links]] from content
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    const matches = [...contentText.matchAll(wikiLinkRegex)];
    const linkedTitles = matches.map(m => m[1].trim());

    // Delete existing links from this note
    await supabase
      .from('second_brain_note_links')
      .delete()
      .eq('source_note_id', noteId);

    // Create new links
    if (linkedTitles.length > 0) {
      // Find target notes by title
      const { data: targetNotes } = await supabase
        .from('second_brain_notes')
        .select('id, title')
        .eq('user_id', userId)
        .in('title', linkedTitles);

      if (targetNotes && targetNotes.length > 0) {
        const links = targetNotes.map(target => ({
          source_note_id: noteId,
          target_note_id: target.id,
          link_type: 'wiki',
        }));

        await supabase
          .from('second_brain_note_links')
          .insert(links);
      }
    }
  } catch (error) {
    console.error('[NotesService] Error updating bi-directional links:', error);
    // Don't throw - link updates shouldn't break main flow
  }
};

/**
 * Get backlinks for a note
 */
const getBacklinks = async (userId, noteId) => {
  try {
    const { data, error } = await supabase
      .from('second_brain_note_links')
      .select(`
        *,
        source_note:second_brain_notes!source_note_id(id, title, slug, icon, folder)
      `)
      .eq('target_note_id', noteId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[NotesService] Error getting backlinks:', error);
    throw error;
  }
};

/**
 * Search notes with advanced filtering
 */
const searchNotes = async (userId, query, options = {}) => {
  try {
    let search = supabase
      .from('second_brain_notes')
      .select('id, title, slug, icon, content_text, folder, tags, updated_at')
      .eq('user_id', userId);

    // Full-text search
    if (query) {
      search = search.textSearch('search_vector', query);
    }

    // Filter by folder
    if (options.folder) {
      search = search.eq('folder', options.folder);
    }

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      search = search.contains('tags', options.tags);
    }

    // Limit results
    const limit = options.limit || 20;
    search = search.limit(limit);

    const { data, error } = await search;
    if (error) throw error;

    return data;
  } catch (error) {
    console.error('[NotesService] Error searching notes:', error);
    throw error;
  }
};

/**
 * Get all folders for a user
 */
const getFolders = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('second_brain_notes')
      .select('folder')
      .eq('user_id', userId)
      .not('folder', 'is', null);

    if (error) throw error;

    // Get unique folders with counts
    const folderCounts = {};
    data.forEach(note => {
      folderCounts[note.folder] = (folderCounts[note.folder] || 0) + 1;
    });

    return Object.entries(folderCounts).map(([name, count]) => ({
      name,
      count,
    }));
  } catch (error) {
    console.error('[NotesService] Error getting folders:', error);
    throw error;
  }
};

/**
 * Get all tags for a user
 */
const getTags = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('second_brain_notes')
      .select('tags')
      .eq('user_id', userId)
      .not('tags', 'is', null);

    if (error) throw error;

    // Flatten and count tags
    const tagCounts = {};
    data.forEach(note => {
      note.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts).map(([name, count]) => ({
      name,
      count,
    }));
  } catch (error) {
    console.error('[NotesService] Error getting tags:', error);
    throw error;
  }
};

/**
 * Add a comment to a note
 */
const addComment = async (userId, noteId, commentData) => {
  try {
    const comment = {
      note_id: noteId,
      user_id: userId,
      content: commentData.content,
      position: commentData.position, // For inline comments
    };

    const { data, error } = await supabase
      .from('second_brain_note_comments')
      .insert(comment)
      .select()
      .single();

    if (error) throw error;

    await logActivity(userId, 'comment', 'note', noteId, { comment_id: data.id });
    return data;
  } catch (error) {
    console.error('[NotesService] Error adding comment:', error);
    throw error;
  }
};

/**
 * Get comments for a note
 */
const getComments = async (userId, noteId) => {
  try {
    const { data, error } = await supabase
      .from('second_brain_note_comments')
      .select('*')
      .eq('note_id', noteId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[NotesService] Error getting comments:', error);
    throw error;
  }
};

/**
 * Duplicate a note
 */
const duplicateNote = async (userId, noteId) => {
  try {
    const original = await getNoteById(userId, noteId);
    if (!original) throw new Error('Note not found');

    const duplicate = await createNote(userId, {
      title: `${original.title} (Copy)`,
      content: original.content,
      content_text: original.content_text,
      folder: original.folder,
      tags: original.tags,
    });

    return duplicate;
  } catch (error) {
    console.error('[NotesService] Error duplicating note:', error);
    throw error;
  }
};

/**
 * Move note to folder
 */
const moveToFolder = async (userId, noteId, folder) => {
  try {
    const { data, error } = await supabase
      .from('second_brain_notes')
      .update({ folder, updated_at: new Date() })
      .eq('id', noteId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    await logActivity(userId, 'move', 'note', noteId, { folder });
    return data;
  } catch (error) {
    console.error('[NotesService] Error moving note:', error);
    throw error;
  }
};

/**
 * Log activity
 */
const logActivity = async (userId, actionType, entityType, entityId, details) => {
  try {
    await supabase
      .from('second_brain_activity')
      .insert({
        user_id: userId,
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId,
        details,
      });
  } catch (error) {
    console.error('[NotesService] Error logging activity:', error);
    // Don't throw - activity logging shouldn't break main flow
  }
};

export default {
  getNotes,
  getNoteById,
  getNoteBySlug,
  createNote,
  updateNote,
  deleteNote,
  getBacklinks,
  searchNotes,
  getFolders,
  getTags,
  addComment,
  getComments,
  duplicateNote,
  moveToFolder,
};
