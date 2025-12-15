import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Link, Image, Undo, Redo,
  Type, Palette, RefreshCw
} from 'lucide-react';

export default function RichTextEditor({ onChange, initialContent = '' }) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedText, setSelectedText] = useState('');
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        setSelectedText(range.toString());
      }
    };

    // Check for image selection
    const handleMouseUp = (e) => {
      if (e.target.tagName === 'IMG' && editorRef.current.contains(e.target)) {
        setSelectedImg(e.target);
      } else if (editorRef.current.contains(e.target)) {
        setSelectedImg(null);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = initialContent;
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
      editorRef.current.focus();
    }
  }, [initialContent]);

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    if (selectedText) {
      const url = prompt('Enter URL:', 'https://');
      if (url) {
        formatText('createLink', url);
      }
    } else {
      alert('Please select text to convert to link');
    }
  };

  const insertImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        formatText('insertImage', data.url);
      } else {
        alert('Image upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input
      }
    }
  };

  const clearFormatting = () => {
    formatText('removeFormat');
  };

  const ToolbarBtn = ({ onClick, icon: Icon, tooltip }) => (
    <button
      onClick={onClick}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center group relative"
      title={tooltip}
      type="button"
    >
      <Icon size={18} className="text-gray-700 dark:text-gray-300" />
      <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
        {tooltip}
      </span>
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Main Editor Card */}
      <div className="group relative bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-300 focus-within:shadow-md focus-within:ring-2 focus-within:ring-indigo-500/20">

        {/* Modern Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-gray-100 dark:border-gray-700/50 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <ToolbarBtn onClick={() => formatText('bold')} icon={Bold} tooltip="Bold" />
            <ToolbarBtn onClick={() => formatText('italic')} icon={Italic} tooltip="Italic" />
            <ToolbarBtn onClick={() => formatText('underline')} icon={Underline} tooltip="Underline" />
          </div>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1 flex-shrink-0" />

          <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <ToolbarBtn onClick={() => formatText('justifyLeft')} icon={AlignLeft} tooltip="Left" />
            <ToolbarBtn onClick={() => formatText('justifyCenter')} icon={AlignCenter} tooltip="Center" />
            <ToolbarBtn onClick={() => formatText('justifyRight')} icon={AlignRight} tooltip="Right" />
          </div>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1 flex-shrink-0" />

          <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <ToolbarBtn onClick={() => formatText('insertUnorderedList')} icon={List} tooltip="Bullet List" />
            <ToolbarBtn onClick={() => formatText('insertOrderedList')} icon={ListOrdered} tooltip="Numbered List" />
          </div>

          <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1 flex-shrink-0" />

          {/* Text Size & Color - Simplified for mobile */}
          <div className="flex items-center gap-2 px-2">
            <div className="relative">
              <select
                className="w-24 pl-2 pr-6 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                onChange={(e) => formatText('formatBlock', e.target.value)}
              >
                <option value="p">Normal</option>
                <option value="h2">Title</option>
                <option value="h3">Subtitle</option>
                <option value="blockquote">Quote</option>
                <option value="pre">Code</option>
              </select>
            </div>
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer overflow-hidden">
              <Palette size={18} className="text-indigo-500" />
              <input
                type="color"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => formatText('foreColor', e.target.value)}
                title="Text Color"
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-[200px] p-6 text-lg leading-relaxed text-gray-700 dark:text-gray-200 outline-none max-h-[500px] overflow-y-auto"
          onInput={(e) => {
            if (e.target instanceof HTMLElement) {
              onChange(e.target.innerHTML);
              // Removed selection/range restoration loop which caused jumping cursors
            }
          }}
          spellCheck="true"
          placeholder="Start writing your story..."
        />

        {/* Footer info */}
        <div className="px-4 py-2 text-xs text-gray-400 dark:text-gray-500 text-right border-t border-gray-50 dark:border-gray-800">
          {editorRef.current?.innerText.trim().length > 0
            ? `${editorRef.current?.innerText.trim().split(/\s+/).length} words`
            : '0 words'}
        </div>

        {/* Resize Overlay */}
        <ImageResizer selectedImg={selectedImg} editorRef={editorRef} onChange={onChange} />
      </div>

      {/* Widget / Quick Insert Bar */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        <button
          onClick={insertImage}
          type="button"
          className="flex-1 min-w-[140px] flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Image className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Add Image</span>
        </button>

        <button
          onClick={insertLink}
          type="button"
          className="flex-1 min-w-[140px] flex flex-col items-center justify-center gap-2 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border-2 border-dashed border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Link className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Link URL</span>
        </button>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div >
  );
}


const ImageResizer = ({ selectedImg, editorRef, onChange }) => {
  const [position, setPosition] = useState(null);
  const [size, setSize] = useState(null);

  useEffect(() => {
    if (!selectedImg || !editorRef.current) return;

    const updateOverlay = () => {
      if (!selectedImg.isConnected) {
        // Image deleted
        return;
      }
      const imgRect = selectedImg.getBoundingClientRect();
      const editorRect = editorRef.current.getBoundingClientRect();

      // Calculate relative position inside the scrollable editor
      // Since the overlay is sibling to the editor content div (which scrolls),
      // and the parent (group relative) does NOT scroll,
      // we position relative to the PARENT. 
      // Wait, editorRef IS the scrollable div.
      // We'll place Resizer inside editorRef's PARENT.

      setPosition({
        top: imgRect.top - editorRect.top + editorRef.current.scrollTop,
        left: imgRect.left - editorRect.left + editorRef.current.scrollLeft,
        width: imgRect.width,
        height: imgRect.height
      });
      setSize({ w: imgRect.width, h: imgRect.height });
    };

    updateOverlay();
    // Poll for movement/layout changes
    const interval = setInterval(updateOverlay, 50);
    window.addEventListener('resize', updateOverlay);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateOverlay);
    };
  }, [selectedImg, editorRef]);

  const handleMouseDown = (e, direction) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.w;
    const startHeight = size.h;
    const aspectRatio = startWidth / startHeight;

    const handleMouseMove = (moveEvent) => {
      moveEvent.preventDefault();
      const deltaX = moveEvent.clientX - startX;
      // Simply using width for scaling to keep aspect ratio
      const newWidth = startWidth + deltaX * (direction.includes('r') ? 1 : -1);
      const newHeight = newWidth / aspectRatio;

      if (newWidth > 50) {
        selectedImg.style.width = `${newWidth}px`;
        selectedImg.style.height = `${newHeight}px`; // Explicit height to maintain aspect ratio
        // Trigger change to save
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (onChange && editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (!selectedImg || !position) return null;

  // Handles styling
  const handleStyle = "absolute w-3 h-3 bg-indigo-600 border border-white rounded-full shadow-md z-50 pointer-events-auto transform -translate-x-1/2 -translate-y-1/2";

  return (
    <div
      className="absolute border-2 border-indigo-500 z-40 pointer-events-none"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        height: position.height
      }}
    >
      {/* Top-Left */}
      <div className={`${handleStyle} cursor-nw-resize`} style={{ top: 0, left: 0 }} onMouseDown={(e) => handleMouseDown(e, 'nw')} />
      {/* Top-Right */}
      <div className={`${handleStyle} cursor-ne-resize`} style={{ top: 0, right: '-12px', left: 'auto' }} onMouseDown={(e) => handleMouseDown(e, 'ne')} />
      {/* Bottom-Left */}
      <div className={`${handleStyle} cursor-sw-resize`} style={{ bottom: '-12px', left: 0, top: 'auto' }} onMouseDown={(e) => handleMouseDown(e, 'sw')} />
      {/* Bottom-Right */}
      <div className={`${handleStyle} cursor-se-resize`} style={{ bottom: '-12px', right: '-12px', left: 'auto', top: 'auto' }} onMouseDown={(e) => handleMouseDown(e, 'se')} />
    </div>
  );
};
