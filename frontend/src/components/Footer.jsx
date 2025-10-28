import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Star } from 'lucide-react';

const Footer = () => {
  const { isDark } = useTheme();
  const [name, setName] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !feedback.trim()) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Get existing feedbacks from localStorage
      const existingFeedbacks = JSON.parse(localStorage.getItem('userFeedbacks') || '[]');

      // Create new feedback object
      const newFeedback = {
        id: Date.now(),
        name: name.trim(),
        quote: feedback.trim(),
        rating: rating,
        role: 'Student', // Default role
        image: '👤' // Default avatar
      };

      // Add to existing feedbacks
      existingFeedbacks.push(newFeedback);

      // Save back to localStorage
      localStorage.setItem('userFeedbacks', JSON.stringify(existingFeedbacks));

      setMessage('Thank you for your feedback!');
      setMessageType('success');
      setName('');
      setFeedback('');
      setRating(5);

    } catch (error) {
      setMessage('Failed to submit feedback. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className={`bg-gradient-to-r ${isDark ? 'from-gray-900 to-gray-800' : 'from-white to-white'} ${isDark ? 'text-white' : 'text-gray-900'} py-12 mt-auto`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              StudyBuddy AI
            </h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm leading-relaxed`}>
              Your intelligent study companion powered by <b>cutting-edge AI technology</b>. <br />
              Transform your learning experience with personalized notes and smart quizzes.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className={`${isDark ? 'text-gray-300' : 'text-gray-600'} hover:text-blue-400 transition-colors duration-200`}>Home</a></li>
              <li><a href="/resources" className={`${isDark ? 'text-gray-300' : 'text-gray-600'} hover:text-blue-400 transition-colors duration-200`}>Resources</a></li>

              <li><a href="/login" className={`${isDark ? 'text-gray-300' : 'text-gray-600'} hover:text-blue-400 transition-colors duration-200`}>Login</a></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>Connect With Us</h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>studybuddy@gmail.com</p>
          </div>

          {/* Feedback */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>Share Feedback</h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm mb-4`}>Help us improve StudyBuddy AI</p>
            <form onSubmit={handleFeedbackSubmit} className="flex flex-col space-y-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500'} border focus:outline-none focus:border-blue-400 transition-colors duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Your feedback"
                rows="3"
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500'} border focus:outline-none focus:border-blue-400 transition-colors duration-200 resize-none ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <div className="flex items-center space-x-2">
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-sm`}>Rating:</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      disabled={isLoading}
                      className={`focus:outline-none ${isLoading ? 'cursor-not-allowed' : ''}`}
                    >
                      <Star
                        className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-400'} ${isLoading ? 'opacity-50' : 'hover:text-yellow-400'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {isLoading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
            {message && (
              <p className={`text-sm mt-2 ${messageType === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                {message}
              </p>
            )}
          </div>
        </div>



        {/* Copyright */}
        <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-300'} mt-8 pt-8 text-center`}>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
            © 2025 StudyBuddy AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
