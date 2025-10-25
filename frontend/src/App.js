import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import UploadAndGenerate from './components/UploadAndGenerate';
import StudyAndAnalyze from './components/StudyAndAnalyze';
import PerformanceDashboard from './components/PerformanceDashboard';

function App() {
  const [currentView, setCurrentView] = useState('upload');
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [currentSetId, setCurrentSetId] = useState(null);
  const [userId] = useState(() => {
    // Generate or retrieve user ID from localStorage
    let id = localStorage.getItem('uknow_user_id');
    if (!id) {
      id = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('uknow_user_id', id);
    }
    return id;
  });

  useEffect(() => {
    fetchFlashcardSets();
  }, []);

  const fetchFlashcardSets = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/flashcard_sets');
      if (response.ok) {
        const sets = await response.json();
        setFlashcardSets(sets);
      }
    } catch (error) {
      console.error('Error fetching flashcard sets:', error);
    }
  };

  const handleSetGenerated = (setId) => {
    setCurrentSetId(setId);
    setCurrentView('study');
    fetchFlashcardSets(); // Refresh the sets list
  };

  const handleSetSelected = (setId) => {
    setCurrentSetId(setId);
    setCurrentView('study');
  };

  return (
    <Router>
      <div className="app-container">
        <Header 
          currentView={currentView}
          onViewChange={setCurrentView}
          flashcardSets={flashcardSets}
          onSetSelected={handleSetSelected}
        />
        
        <main className="main-content">
          <Routes>
            <Route 
              path="/upload" 
              element={
                <UploadAndGenerate 
                  onSetGenerated={handleSetGenerated}
                  userId={userId}
                />
              } 
            />
            <Route 
              path="/study" 
              element={
                <StudyAndAnalyze 
                  setId={currentSetId}
                  userId={userId}
                  onViewChange={setCurrentView}
                />
              } 
            />
            <Route 
              path="/analysis" 
              element={
                <PerformanceDashboard 
                  setId={currentSetId}
                  userId={userId}
                />
              } 
            />
            <Route path="/" element={<Navigate to="/upload" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
