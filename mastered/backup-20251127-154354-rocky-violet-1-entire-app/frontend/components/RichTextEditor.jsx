/**
 * Rich Text Editor Component
 * Native contentEditable implementation (no external dependencies)
 * Supports: Markdown shortcuts, Slash commands, Wiki links
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  Bold, Italic, Code, List, ListOrdered, CheckSquare, Quote,
  Heading1, Heading2, Heading3, Link, Image as ImageIcon
} from 'lucide-react';

const RichTextEditor = ({
  content = '',
  onChange,
  onSave,
  placeholder = 'Type / for commands, [[ for links...',
  className = '',
}) => {
  const editorRef = useRef(null);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [slashFilter, setSlashFilter] = useState('');
  const [selectedSlashIndex, setSelectedSlashIndex] = useState(0);
  const [showLinkAutocomplete, setShowLinkAutocomplete] = useState(false);
  const [linkQuery, setLinkQuery] = useState('');

  // Slash command options
  const slashCommands = [
    { id: 'h1', label: 'Heading 1', icon: Heading1, action: () => formatBlock('h1') },
    { id: 'h2', label: 'Heading 2', icon: Heading2, action: () => formatBlock('h2') },
    { id: 'h3', label: 'Heading 3', icon: Heading3, action: () => formatBlock('h3') },
    { id: 'list', label: 'Bullet List', icon: List, action: () => formatBlock('ul') },
    { id: 'numbered', label: 'Numbered List', icon: ListOrdered, action: () => formatBlock('ol') },
    { id: 'todo', label: 'To-do List', icon: CheckSquare, action: () => insertTodoList() },
    { id: 'quote', label: 'Quote', icon: Quote, action: () => formatBlock('blockquote') },
    { id: 'code', label: 'Code Block', icon: Code, action: () => insertCodeBlock() },
    { id: 'divider', label: 'Divider', icon: null, action: () => insertDivider() },
  ];

  // Filter slash commands based on input
  const filteredCommands = slashCommands.filter(cmd =>
    cmd.label.toLowerCase().includes(slashFilter.toLowerCase())
  );

  // Format text selection
  const formatText = useCallback((command) => {
    document.execCommand(command, false, null);
    editorRef.current?.focus();
  }, []);

  // Format block element
  const formatBlock = useCallback((tag) => {
    document.execCommand('formatBlock', false, tag);
    setShowSlashMenu(false);
    editorRef.current?.focus();
  }, []);

  // Insert code block
  const insertCodeBlock = useCallback(() => {
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = 'code here';
    code.className = 'block bg-gray-900 p-4 rounded-lg font-mono text-sm text-green-400';
    pre.appendChild(code);

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(pre);
    }

    setShowSlashMenu(false);
    editorRef.current?.focus();
  }, []);

  // Insert divider
  const insertDivider = useCallback(() => {
    const hr = document.createElement('hr');
    hr.className = 'my-6 border-gray-700';

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(hr);
    }

    setShowSlashMenu(false);
    editorRef.current?.focus();
  }, []);

  // Insert todo list
  const insertTodoList = useCallback(() => {
    const container = document.createElement('div');
    container.className = 'flex items-start gap-2 my-2';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'mt-1 accent-[#3F0D28]';

    const text = document.createElement('span');
    text.contentEditable = 'true';
    text.textContent = 'To-do item';
    text.className = 'flex-1';

    container.appendChild(checkbox);
    container.appendChild(text);

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(container);
    }

    setShowSlashMenu(false);
    editorRef.current?.focus();
  }, []);

  // Insert wiki link
  const insertWikiLink = useCallback((noteTitle) => {
    const link = document.createElement('a');
    link.href = `#/notes/${noteTitle.toLowerCase().replace(/\s+/g, '-')}`;
    link.textContent = noteTitle;
    link.className = 'text-[#3F0D28] hover:underline';
    link.setAttribute('data-wiki-link', noteTitle);

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(link);

      // Move cursor after link
      range.setStartAfter(link);
      range.setEndAfter(link);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    setShowLinkAutocomplete(false);
    setLinkQuery('');
    editorRef.current?.focus();
  }, []);

  // Handle input
  const handleInput = useCallback((e) => {
    const html = editorRef.current?.innerHTML || '';
    const text = editorRef.current?.textContent || '';

    // Check for slash command
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const textBeforeCursor = range.startContainer.textContent?.substring(0, range.startOffset) || '';

      // Detect slash command
      const slashMatch = textBeforeCursor.match(/\/(\w*)$/);
      if (slashMatch) {
        setSlashFilter(slashMatch[1]);
        setSelectedSlashIndex(0);

        // Get cursor position for menu
        const rect = range.getBoundingClientRect();
        setSlashMenuPosition({ x: rect.left, y: rect.bottom });
        setShowSlashMenu(true);
      } else {
        setShowSlashMenu(false);
      }

      // Detect wiki link
      const wikiMatch = textBeforeCursor.match(/\[\[([^\]]*?)$/);
      if (wikiMatch) {
        setLinkQuery(wikiMatch[1]);
        setShowLinkAutocomplete(true);
      } else {
        setShowLinkAutocomplete(false);
      }
    }

    // Auto-format markdown shortcuts
    autoFormatMarkdown(text);

    if (onChange) {
      onChange({ html, text });
    }
  }, [onChange]);

  // Auto-format markdown
  const autoFormatMarkdown = useCallback((text) => {
    const lines = text.split('\n');
    const lastLine = lines[lines.length - 1];

    // # for heading 1
    if (lastLine === '# ') {
      formatBlock('h1');
      // Remove the # character
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.startContainer.textContent = range.startContainer.textContent.replace('# ', '');
      }
    }
    // ## for heading 2
    else if (lastLine === '## ') {
      formatBlock('h2');
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.startContainer.textContent = range.startContainer.textContent.replace('## ', '');
      }
    }
    // - for bullet list
    else if (lastLine === '- ') {
      formatBlock('ul');
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.startContainer.textContent = range.startContainer.textContent.replace('- ', '');
      }
    }
    // 1. for numbered list
    else if (/^\d+\.\s$/.test(lastLine)) {
      formatBlock('ol');
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.startContainer.textContent = range.startContainer.textContent.replace(/^\d+\.\s/, '');
      }
    }
  }, [formatBlock]);

  // Handle keydown
  const handleKeyDown = useCallback((e) => {
    // Slash menu navigation
    if (showSlashMenu) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSlashIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSlashIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        filteredCommands[selectedSlashIndex]?.action();
      } else if (e.key === 'Escape') {
        setShowSlashMenu(false);
      }
      return;
    }

    // Complete wiki link with ]]
    if (showLinkAutocomplete && e.key === ']' && e.shiftKey) {
      e.preventDefault();
      insertWikiLink(linkQuery);
      return;
    }

    // Save shortcut (Cmd+S / Ctrl+S)
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      if (onSave) {
        onSave({
          html: editorRef.current?.innerHTML || '',
          text: editorRef.current?.textContent || ''
        });
      }
    }

    // Keyboard shortcuts
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatText('bold');
          break;
        case 'i':
          e.preventDefault();
          formatText('italic');
          break;
        case 'k': {
          e.preventDefault();
          // Insert link
          const url = prompt('Enter URL:');
          if (url) document.execCommand('createLink', false, url);
          break;
        }
      }
    }
  }, [showSlashMenu, showLinkAutocomplete, filteredCommands, selectedSlashIndex, linkQuery, formatText, insertWikiLink, onSave]);

  // Set initial content
  useEffect(() => {
    if (editorRef.current && content && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  return (
    <div className={`relative ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-700 bg-[#0a0a0a]">
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="p-2 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-white"
          title="Bold (Cmd+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="p-2 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-white"
          title="Italic (Cmd+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatText('code')}
          className="p-2 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-white"
          title="Inline Code"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        <button
          type="button"
          onClick={() => formatBlock('h1')}
          className="p-2 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-white"
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatBlock('h2')}
          className="p-2 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-white"
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        <button
          type="button"
          onClick={() => formatBlock('ul')}
          className="p-2 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-white"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => formatBlock('ol')}
          className="p-2 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-white"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-700 mx-1" />

        <button
          type="button"
          onClick={() => formatBlock('blockquote')}
          className="p-2 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-white"
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        <div className="text-xs text-gray-500">
          Type <span className="text-[#3F0D28]">/</span> for commands, <span className="text-[#3F0D28]">[[</span> for links
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="prose prose-invert max-w-none p-6 focus:outline-none min-h-[500px] bg-[#1a1a1a] text-white"
        style={{
          caretColor: '#3F0D28',
        }}
        data-placeholder={placeholder}
      />

      {/* Slash Command Menu */}
      {showSlashMenu && (
        <div
          className="absolute bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 py-2 min-w-[200px]"
          style={{
            left: slashMenuPosition.x,
            top: slashMenuPosition.y + 5,
          }}
        >
          {filteredCommands.map((cmd, index) => (
            <button
              key={cmd.id}
              onClick={cmd.action}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                index === selectedSlashIndex
                  ? 'bg-[#3F0D28] text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {cmd.icon && <cmd.icon className="w-4 h-4" />}
              <span className="font-medium">{cmd.label}</span>
            </button>
          ))}
          {filteredCommands.length === 0 && (
            <div className="px-4 py-2 text-gray-500 text-sm">No commands found</div>
          )}
        </div>
      )}

      {/* Wiki Link Autocomplete */}
      {showLinkAutocomplete && linkQuery && (
        <div
          className="absolute bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 py-2 min-w-[250px]"
          style={{
            left: slashMenuPosition.x,
            top: slashMenuPosition.y + 5,
          }}
        >
          <div className="px-4 py-2 text-sm text-gray-400">
            Creating link to: <span className="text-[#3F0D28] font-medium">{linkQuery}</span>
          </div>
          <div className="text-xs text-gray-500 px-4 py-1">
            Press <kbd className="bg-gray-700 px-1 rounded">]]</kbd> to complete
          </div>
        </div>
      )}

      {/* CSS for placeholder */}
      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #6b7280;
          pointer-events: none;
        }

        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.5em 0;
          color: white;
        }

        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
          color: white;
        }

        [contenteditable] h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.5em 0;
          color: white;
        }

        [contenteditable] ul, [contenteditable] ol {
          margin: 0.5em 0;
          padding-left: 2em;
        }

        [contenteditable] blockquote {
          border-left: 3px solid #3F0D28;
          padding-left: 1em;
          margin: 0.5em 0;
          color: #9ca3af;
          font-style: italic;
        }

        [contenteditable] code {
          background: #0a0a0a;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: 'SF Mono', monospace;
          font-size: 0.9em;
          color: #10b981;
        }

        [contenteditable] pre {
          background: #0a0a0a;
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
        }

        [contenteditable] a {
          color: #3F0D28;
          text-decoration: underline;
        }

        [contenteditable] hr {
          border: none;
          border-top: 1px solid #374151;
          margin: 1.5em 0;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
