import React, { useState, useEffect } from 'react';
import FlashcardStudy from './FlashcardStudy';

const StudyAndAnalyze = ({ setId, userId, onViewChange }) => {
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (setId) {
      fetchFlashcardSet();
    }
  }, [setId]);

  const fetchFlashcardSet = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`http://localhost:5000/api/flashcard_sets/${setId}`);
      
      if (response.ok) {
        const data = await response.json();
        setFlashcardSet(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load flashcard set.');
      }
    } catch (error) {
      setError('Network error. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handlePerformanceRecord = async (flashcardId, status) => {
    try {
      const response = await fetch('http://localhost:5000/api/record_performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flashcard_id: flashcardId,
          user_id: userId,
          status: status
        }),
      });

      if (!response.ok) {
        console.error('Failed to record performance');
      }
    } catch (error) {
      console.error('Error recording performance:', error);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!setId) {
    return (
      <div className="card">
        <div className="empty-state">
          <h2>No flashcard set selected</h2>
          <p>Please upload a document or select an existing flashcard set to start studying.</p>
          <button 
            className="upload-button"
            onClick={() => onViewChange('upload')}
          >
            📤 Go to Upload
          </button>
        </div>
      </div>
    );
  }

  if (!flashcardSet || !flashcardSet.flashcards || flashcardSet.flashcards.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <h2>No flashcards available</h2>
          <p>This flashcard set appears to be empty.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="section-title">{flashcardSet.title}</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
        {flashcardSet.count} flashcards • Study mode
      </p>
      
      <FlashcardStudy 
        flashcards={flashcardSet.flashcards}
        onPerformanceRecord={handlePerformanceRecord}
        userId={userId}
      />
      
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button 
          className="nav-control"
          onClick={() => onViewChange('analysis')}
        >
          📊 View Performance Analysis
        </button>
      </div>
    </div>
  );
};

export default StudyAndAnalyze;
