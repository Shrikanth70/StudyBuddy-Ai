import React, { useState } from 'react';
import { X, Play, Clock, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuizViewer = ({ quiz, onClose }) => {
    const navigate = useNavigate();

    const startQuiz = () => {
        // Navigate to quiz environment with the quiz data
        navigate('/quiz-environment', { state: { quiz } });
        onClose();
    };

    const getDifficultyColor = (difficulty) => {
        const colors = {
            easy: 'text-green-600 bg-green-100',
            medium: 'text-yellow-600 bg-yellow-100',
            hard: 'text-red-600 bg-red-100'
        };
        return colors[difficulty] || 'text-gray-600 bg-gray-100';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.title}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {quiz.subject} • {quiz.difficulty}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                            {quiz.difficulty}
                        </span>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            {quiz.description || 'No description provided'}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Target className="w-5 h-5 mr-2" />
                            <span>{quiz.questions?.length || 0} questions</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Clock className="w-5 h-5 mr-2" />
                            <span>{quiz.timeLimit || 0} minutes</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Questions Preview</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {quiz.questions?.slice(0, 5).map((question, index) => (
                                <div key={index} className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                    <strong>Q{index + 1}:</strong> {question.question.substring(0, 60)}...
                                </div>
                            ))}
                            {quiz.questions?.length > 5 && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                    ... and {quiz.questions.length - 5} more questions
                                </div>
                            )}
                        </div>
                    </div>

                    {/* <div className="flex justify-center">
                        <button
                            onClick={startQuiz}
                            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                        >
                            <Play className="w-5 h-5 mr-2" />
                            Start Quiz
                        </button>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default QuizViewer;
