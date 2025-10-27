import React from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Download, Copy } from 'lucide-react';

const NotesViewer = ({ note, onClose }) => {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(note.content);
        // Could add a toast notification here
    };

    const downloadNotes = () => {
        const blob = new Blob([note.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${note.title}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{note.title}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {note.subject} • {note.topic} • {note.difficulty}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={copyToClipboard}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            title="Copy to clipboard"
                        >
                            <Copy className="w-5 h-5" />
                        </button>
                        <button
                            onClick={downloadNotes}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            title="Download as markdown"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown
                            components={{
                                h1: ({ children }) => <h1 className="text-gray-900 dark:text-white" style={{ fontSize: '1.8em', fontWeight: 'bold', margin: '0.5em 0' }}>{children}</h1>,
                                h2: ({ children }) => <h2 className="text-gray-800 dark:text-gray-100" style={{ fontSize: '1.5em', fontWeight: 'bold', margin: '0.4em 0' }}>{children}</h2>,
                                h3: ({ children }) => <h3 className="text-gray-700 dark:text-gray-200" style={{ fontSize: '1.2em', fontWeight: 'bold', margin: '0.3em 0' }}>{children}</h3>,
                                p: ({ children }) => <p className="text-gray-700 dark:text-gray-300" style={{ margin: '0.5em 0', lineHeight: '1.6' }}>{children}</p>,
                                ul: ({ children }) => <ul className="text-gray-700 dark:text-gray-300" style={{ margin: '0.5em 0', paddingLeft: '1.5em' }}>{children}</ul>,
                                ol: ({ children }) => <ol className="text-gray-700 dark:text-gray-300" style={{ margin: '0.5em 0', paddingLeft: '1.5em' }}>{children}</ol>,
                                li: ({ children }) => <li className="text-gray-700 dark:text-gray-300" style={{ margin: '0.2em 0' }}>{children}</li>,
                                strong: ({ children }) => <strong className="text-gray-900 dark:text-white font-bold">{children}</strong>,
                                em: ({ children }) => <em className="text-gray-600 dark:text-gray-400 italic">{children}</em>,
                                code: ({ children }) => <code className="bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 px-2 py-1 rounded text-sm font-medium font-mono">{children}</code>,
                                pre: ({ children }) => <pre className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-4 rounded-lg overflow-auto my-2 border border-gray-200 dark:border-gray-700">{children}</pre>,
                                blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-gray-600 dark:text-gray-400 italic pl-4 my-2">{children}</blockquote>,
                            }}
                        >
                            {note.content}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotesViewer;
