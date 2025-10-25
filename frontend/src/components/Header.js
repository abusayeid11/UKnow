import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = ({ flashcardSets, onSetSelected }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveView = () => {
    if (location.pathname === '/upload') return 'upload';
    if (location.pathname === '/study') return 'study';
    if (location.pathname === '/analysis') return 'analysis';
    return 'upload';
  };

  const handleViewChange = (view) => {
    navigate(`/${view}`);
  };

  return (
    <header className="header">
      <h1>🧠 UKnow</h1>
      <p>AI-Enhanced Educational Flashcard Generator</p>
      
      <nav className="nav">
        <button 
          className={`nav-button ${getActiveView() === 'upload' ? 'active' : ''}`}
          onClick={() => handleViewChange('upload')}
        >
          📤 Upload & Generate
        </button>
        <button 
          className={`nav-button ${getActiveView() === 'study' ? 'active' : ''}`}
          onClick={() => handleViewChange('study')}
        >
          📚 Study
        </button>
        <button 
          className={`nav-button ${getActiveView() === 'analysis' ? 'active' : ''}`}
          onClick={() => handleViewChange('analysis')}
        >
          📊 Analysis
        </button>
      </nav>

      {flashcardSets.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <select 
            onChange={(e) => onSetSelected(parseInt(e.target.value))}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '0.5rem',
              borderRadius: '10px',
              marginRight: '1rem'
            }}
          >
            <option value="">Select a flashcard set...</option>
            {flashcardSets.map(set => (
              <option key={set.id} value={set.id} style={{ color: 'black' }}>
                {set.title} ({set.flashcard_count} cards)
              </option>
            ))}
          </select>
        </div>
      )}
    </header>
  );
};

export default Header;
