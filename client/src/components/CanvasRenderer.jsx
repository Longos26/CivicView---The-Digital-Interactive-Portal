
import React from 'react';
import PropTypes from 'prop-types';

export default function CanvasRenderer({ content }) {
    let elements = [];
    try {
        elements = JSON.parse(content);
    } catch (e) {
        return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }

    if (!Array.isArray(elements)) {
        return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }

    // Calculate dynamic height based on elements
    const maxY = elements.reduce((max, el) => {
        // Safe parsing for height, defaulting to 200px if 'auto' or invalid
        let elHeight = 0;
        if (el.height && typeof el.height === 'string' && el.height !== 'auto') {
            elHeight = parseInt(el.height) || 0;
        } else if (typeof el.height === 'number') {
            elHeight = el.height;
        } else {
            // Fallback for 'auto' or missing height
            elHeight = el.type === 'image' ? 300 : 100;
        }

        const elBottom = (el.y || 0) + elHeight;
        return Math.max(max, elBottom);
    }, 400); // Minimum height

    const containerHeight = Math.max(600, maxY + 200); // 200px bottom padding

    return (
        <div
            className="relative w-full bg-slate-50 dark:bg-slate-900/20 rounded-3xl overflow-hidden shadow-inner transform transition-all"
            style={{ height: `${containerHeight}px` }}
        >
            {elements.map((el) => {
                return (
                    <div
                        key={el.id}
                        className="absolute"
                        style={{
                            top: 0,
                            left: 0,
                            width: el.width || 'auto',
                            transform: `translate(${el.x}px, ${el.y}px)`
                        }}
                    >
                        {el.type === 'text' && (
                            <div className="p-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur rounded-xl text-gray-800 dark:text-gray-200 shadow-sm break-words">
                                {el.content}
                            </div>
                        )}

                        {el.type === 'button' && (
                            <div className="p-2 w-full">
                                <a
                                    href={el.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center px-6 py-3 !bg-indigo-600 !text-white rounded-full font-semibold shadow-lg hover:!bg-indigo-700 transition transform hover:-translate-y-0.5 active:translate-y-0 w-full text-center truncate !no-underline"
                                >
                                    {el.content}
                                </a>
                            </div>
                        )}

                        {el.type === 'image' && (
                            <img
                                src={el.content}
                                alt="post content"
                                className="rounded-2xl shadow-md w-full h-auto"
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

CanvasRenderer.propTypes = {
    content: PropTypes.string.isRequired
};
