import React, { useState, useEffect } from 'react';

const FlashcardStudy = ({ flashcards, onPerformanceRecord, userId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studySession, setStudySession] = useState({
    correct: 0,
    incorrect: 0,
    completed: []
  });

  const currentCard = flashcards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleResponse = async (status) => {
    if (!currentCard) return;

    // Record performance
    await onPerformanceRecord(currentCard.id, status);
    
    // Update study session stats
    setStudySession(prev => ({
      ...prev,
      [status]: prev[status] + 1,
      completed: [...prev.completed, { cardId: currentCard.id, status }]
    }));

    // Move to next card
    moveToNext();
  };

  const moveToNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // Study session complete
      alert(`Study session complete!\nCorrect: ${studySession.correct + (isFlipped ? 1 : 0)}\nNeed Work: ${studySession.incorrect}`);
    }
  };

  const moveToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudySession({
      correct: 0,
      incorrect: 0,
      completed: []
    });
  };

  const progressPercentage = ((currentIndex + 1) / flashcards.length) * 100;
  const isLastCard = currentIndex === flashcards.length - 1;
  const isFirstCard = currentIndex === 0;

  if (!currentCard) {
    return (
      <div className="empty-state">
        <h3>Study session complete! 🎉</h3>
        <div className="stats-card" style={{ margin: '2rem 0' }}>
          <div className="stats-number" style={{ color: '#4CAF50' }}>
            {studySession.correct}
          </div>
          <div className="stats-label">Correct Answers</div>
          
          <div className="stats-number" style={{ color: '#f44336', marginTop: '1rem' }}>
            {studySession.incorrect}
          </div>
          <div className="stats-label">Need More Work</div>
        </div>
        
        <button className="upload-button" onClick={resetSession}>
          🔄 Study Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Progress Bar */}
      <div className="study-progress">
        <div>Card {currentIndex + 1} of {flashcards.length}</div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          <span style={{ color: '#4CAF50' }}>✓ {studySession.correct}</span>
          <span style={{ color: '#f44336' }}>✗ {studySession.incorrect}</span>
        </div>
      </div>

      {/* Flashcard */}
      <div 
        className={`flashcard ${isFlipped ? 'flipped' : ''}`}
        onClick={handleFlip}
      >
        <div className="flashcard-content">
          {!isFlipped ? (
            <>
              <div className="flashcard-term">{currentCard.term}</div>
              <div className="flashcard-question">{currentCard.question}</div>
              <div className="flip-hint">Click to reveal answer</div>
            </>
          ) : (
            <>
              <div className="flashcard-term">{currentCard.term}</div>
              <div className="flashcard-answer">{currentCard.answer}</div>
              {currentCard.context && currentCard.context !== currentCard.answer && (
                <div style={{ 
                  marginTop: '1rem', 
                  fontSize: '0.9rem', 
                  opacity: 0.8,
                  fontStyle: 'italic'
                }}>
                  Context: {currentCard.context.substring(0, 200)}...
                </div>
              )}
              <div className="flip-hint">Click to see question</div>
            </>
          )}
        </div>
      </div>

      {/* Study Controls - Only show when answer is revealed */}
      {isFlipped && (
        <div className="study-controls">
          <button 
            className="control-button incorrect-button"
            onClick={() => handleResponse('incorrect')}
          >
            ❌ Need Work
          </button>
          <button 
            className="control-button correct-button"
            onClick={() => handleResponse('correct')}
          >
            ✅ Got It!
          </button>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="study-navigation">
        <button 
          className="nav-control"
          onClick={moveToPrevious}
          disabled={isFirstCard}
        >
          ← Previous
        </button>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="nav-control"
            onClick={handleFlip}
          >
            {isFlipped ? '🔄 Show Question' : '👁️ Show Answer'}
          </button>
          
          {!isLastCard && (
            <button 
              className="nav-control"
              onClick={moveToNext}
            >
              Skip →
            </button>
          )}
        </div>
        
        <button 
          className="nav-control"
          onClick={resetSession}
          style={{ background: 'rgba(244, 67, 54, 0.1)', borderColor: '#f44336', color: '#f44336' }}
        >
          🔄 Restart
        </button>
      </div>

      {/* Quick Stats */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '2rem', 
        marginTop: '2rem',
        padding: '1rem',
        background: '#f8f9fa',
        borderRadius: '10px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4CAF50' }}>
            {studySession.correct}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Correct</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f44336' }}>
            {studySession.incorrect}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Need Work</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
            {Math.round(progressPercentage)}%
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>Progress</div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardStudy;
