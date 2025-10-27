import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import GroupChannelDetail from "./components/GroupChannelDetail";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import ChatInterface from "./components/ChatInterface";
import ResourcesPage from "./components/ResourcesPage";
import ProfilePage from "./components/ProfilePage";
import Flashcards from "./components/Flashcards";
import QuizMaker from "./components/QuizMaker";
import QuizList from "./components/QuizList";
import QuizTaker from "./components/QuizTaker";
import QuizEnvironment from "./components/QuizEnvironment";
import NotesGenerator from "./components/NotesGenerator";
import History from "./pages/History";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";

import Layout from "./components/Layout";

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <Layout>
            <Routes>
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
              <Route path="/channels/:id/details" element={<ProtectedRoute><GroupChannelDetail /></ProtectedRoute>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/chat" element={<ProtectedRoute><ChatInterface /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/quiz-maker" element={<ProtectedRoute><QuizMaker /></ProtectedRoute>} />
              <Route path="/quizzes" element={<ProtectedRoute><QuizList /></ProtectedRoute>} />
              <Route path="/quiz/:id" element={<ProtectedRoute><QuizTakerWrapper /></ProtectedRoute>} />
              <Route path="/quiz-environment" element={<ProtectedRoute><QuizEnvironment /></ProtectedRoute>} />
              <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
              <Route path="/notes" element={<ProtectedRoute><NotesGenerator /></ProtectedRoute>} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

// Wrapper component to fetch quiz data
const QuizTakerWrapper = () => {
  const [quiz, setQuiz] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const quizId = window.location.pathname.split('/').pop();

  React.useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/quizzes/${quizId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setQuiz(data.quiz);
        } else {
          setError('Failed to load quiz');
        }
      } catch (err) {
        setError('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.href = '/quizzes'}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  return <QuizTaker quiz={quiz} onBack={() => window.location.href = '/quizzes'} />;
};

export default App;
