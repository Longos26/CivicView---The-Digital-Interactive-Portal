
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Type, Image as ImageIcon, Link, X, Scaling } from 'lucide-react';
import PropTypes from 'prop-types';

export default function CanvasEditor({ onChange, initialContent }) {
    // Parse initial content if it exists and looks like JSON, otherwise start empty
    const getInitialElements = () => {
        try {
            if (!initialContent) return [];
            const parsed = JSON.parse(initialContent);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    };

    const [elements, setElements] = useState(getInitialElements());
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    // Update parent whenever elements change
    const updateElements = (newElements) => {
        setElements(newElements);
        onChange(JSON.stringify(newElements));
    };

    const addElement = (type, extraData = {}) => {
        const id = Date.now().toString();
        const newElement = {
            id,
            type,
            x: 50,
            y: 50,
            content: '',
            width: type === 'image' ? 300 : type === 'button' ? 150 : 200,
            height: type === 'image' ? 'auto' : 'auto',
            ...extraData,
        };
        updateElements([...elements, newElement]);
    };

    const updateElement = (id, updates) => {
        const newElements = elements.map(el => el.id === id ? { ...el, ...updates } : el);
        updateElements(newElements);
    };

    const removeElement = (id) => {
        updateElements(elements.filter(el => el.id !== id));
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
                addElement('image', { content: data.url, width: 300, height: 'auto' });
            } else {
                alert('Image upload failed');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error - check console');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAddButton = () => {
        const label = prompt("Button Label:", "Click Me");
        const url = prompt("Button URL:", "https://");
        if (label && url) {
            addElement('button', { content: label, url: url, width: 160 });
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-x-auto">
                <button
                    onClick={() => addElement('text', { content: 'Double click to edit' })}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-colors font-medium whitespace-nowrap"
                >
                    <Type size={18} /> Add Text
                </button>
                <button
                    onClick={handleAddButton}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 transition-colors font-medium whitespace-nowrap"
                >
                    <Link size={18} /> Add Button
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-xl hover:bg-pink-100 transition-colors font-medium whitespace-nowrap"
                >
                    <ImageIcon size={18} /> Add Image
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={handleImageUpload}
                />
            </div>

            {/* Canvas Area */}
            <div
                ref={canvasRef}
                className="relative w-full h-[600px] bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden"
            >
                <div className="absolute top-4 left-4 text-xs text-gray-400 pointer-events-none z-0">
                    Canvas Board (Drag to move, Drag corner to resize)
                </div>

                {elements.map((el) => (
                    <DraggableElement
                        key={el.id}
                        element={el}
                        onUpdate={updateElement}
                        onRemove={removeElement}
                        containerRef={canvasRef}
                    />
                ))}

                {elements.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
                        <p>Select a widget above to start creating</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const DraggableElement = ({ element, onUpdate, onRemove, containerRef }) => {
    const [isResizing, setIsResizing] = useState(false);
    const elementRef = useRef(null);

    // Resize handler
    const handleMouseDown = (e) => {
        e.stopPropagation(); // Prevent drag start
        setIsResizing(true);

        const startX = e.clientX;
        const startWidth = element.width || (element.type === 'image' ? 300 : 200);

        const onMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            let newWidth = Math.max(50, startWidth + deltaX);
            onUpdate(element.id, { width: newWidth });
        };

        const onMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    return (
        <motion.div
            ref={elementRef}
            drag={!isResizing} // Disable drag when resizing
            dragMomentum={false}
            dragConstraints={containerRef}
            initial={{ x: element.x, y: element.y }}
            onDragEnd={() => {
                if (elementRef.current && containerRef.current) {
                    const elRect = elementRef.current.getBoundingClientRect();
                    const containerRect = containerRef.current.getBoundingClientRect();

                    const relativeX = elRect.left - containerRect.left;
                    const relativeY = elRect.top - containerRect.top;

                    // We also need to account for any border on the container if it affects visual placing?
                    // getBoundingClientRect includes border. 
                    // inside relative container, absolute is relative to padding box.
                    // If container has border-2 (2px), content starts at 2px.
                    // relativeX will include that 2px border if we just subtract Rects.
                    // If we want 'left: X', and container has border, 'left: 0' puts it at start of padding box.
                    // elRect.left is screen coordinate. containerRect.left is screen coordinate of outer edge.
                    // So relativeX = (elRect.left - containerRect.left).
                    // If container has 2px border, and el is at left:0, elRect.left will be containerRect.left + 2.
                    // So we should subtract the approximate border/padding delta or just trust relative values?
                    // Actually, if we just save this raw diff, and renderer sets 'left: relativeX', 
                    // Rendered element will be placed at relativeX from padding box.
                    // If Rendered container has same border, it's fine.
                    // CanvasEditor has `border-2`. CanvasRenderer has no border specified in this update (I removed p-4).
                    // So we probably want to subract the border width (~2px) if we want pure inner coordinates, or just accept the offset.
                    // Let's settle for the raw difference for now, it's much more accurate than delta drifting.

                    onUpdate(element.id, { x: relativeX, y: relativeY });
                }
            }}
            className="absolute cursor-move group touch-none"
            style={{
                position: 'absolute',
                width: element.width || 'auto',
            }}
        >
            {/* Controls */}
            <div className="absolute -top-6 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-gray-800 rounded-full shadow p-1 z-50">
                <button onClick={() => onRemove(element.id)} className="text-red-500 hover:bg-red-50 rounded-full p-1">
                    <X size={12} />
                </button>
            </div>

            {/* Widget Content */}
            <div className="relative border-2 border-transparent hover:border-indigo-300 dark:hover:border-indigo-700 rounded-xl transition-colors">
                {element.type === 'text' && (
                    <div
                        contentEditable
                        suppressContentEditableWarning
                        className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-xl outline-none shadow-sm text-gray-800 dark:text-gray-200"
                        style={{ width: '100%', minHeight: '40px' }}
                        onBlur={(e) => onUpdate(element.id, { content: e.target.innerText })}
                    >
                        {element.content}
                    </div>
                )}

                {element.type === 'button' && (
                    <div className="p-2" style={{ width: '100%' }}>
                        <a
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold shadow-lg hover:bg-indigo-700 transition w-full text-center truncate"
                        >
                            {element.content}
                        </a>
                    </div>

                )}

                {element.type === 'image' && (
                    <div className="relative group/image">
                        <img
                            src={element.content}
                            alt="uploaded"
                            className="rounded-2xl shadow-md pointer-events-none select-none w-full h-auto"
                        />
                    </div>
                )}

                {/* Resize Handle - visible on hover or active */}
                <div
                    className="absolute -bottom-2 -right-2 w-6 h-6 bg-white dark:bg-gray-700 shadow rounded-full flex items-center justify-center cursor-nwse-resize opacity-0 group-hover:opacity-100 z-10"
                    onMouseDown={handleMouseDown}
                >
                    <Scaling size={12} className="text-gray-500" />
                </div>
            </div>
        </motion.div>
    );
};

CanvasEditor.propTypes = {
    onChange: PropTypes.func.isRequired,
    initialContent: PropTypes.string
};
