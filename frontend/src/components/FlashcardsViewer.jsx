import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const FlashcardsViewer = ({ flashcardSet, onClose }) => {
    const [currentCard, setCurrentCard] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    const nextCard = () => {
        if (currentCard < flashcardSet.cards.length - 1) {
            setCurrentCard(currentCard + 1);
            setShowAnswer(false);
        }
    };

    const prevCard = () => {
        if (currentCard > 0) {
            setCurrentCard(currentCard - 1);
            setShowAnswer(false);
        }
    };

    const toggleAnswer = () => {
        setShowAnswer(!showAnswer);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{flashcardSet.title}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {flashcardSet.subject} • {flashcardSet.topic} • {flashcardSet.difficulty}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="text-center mb-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Card {currentCard + 1} of {flashcardSet.cards.length}
                        </span>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8 mb-6 min-h-[300px] flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-xl font-medium text-gray-900 dark:text-white mb-4">
                                {!showAnswer ? 'Question:' : 'Answer:'}
                            </p>
                            <div className="text-lg text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {!showAnswer ? flashcardSet.cards[currentCard].front.replace(/\*\*(.*?)\*\*/g, '$1') : flashcardSet.cards[currentCard].back.replace(/\*\*(.*?)\*\*/g, '$1')}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center space-x-4 mb-6">
                        <button
                            onClick={prevCard}
                            disabled={currentCard === 0}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 inline mr-1" />
                            Previous
                        </button>

                        <button
                            onClick={toggleAnswer}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            {showAnswer ? 'Hide Answer' : 'Show Answer'}
                        </button>

                        <button
                            onClick={nextCard}
                            disabled={currentCard === flashcardSet.cards.length - 1}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                            <ChevronRight className="w-4 h-4 inline ml-1" />
                        </button>
                    </div>

                    {flashcardSet.cards[currentCard].hint && (
                        <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Hint:</strong> {flashcardSet.cards[currentCard].hint}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FlashcardsViewer;