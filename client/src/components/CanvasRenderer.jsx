
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

    return (
        <div className="relative w-full min-h-[600px] bg-slate-50 dark:bg-slate-900/20 rounded-3xl overflow-hidden shadow-inner">
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
                                    className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold shadow-lg hover:bg-indigo-700 transition transform hover:-translate-y-0.5 active:translate-y-0 w-full text-center truncate"
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
