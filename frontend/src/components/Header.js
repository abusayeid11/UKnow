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
      <h1>UKnow</h1>
      <p>AI-Enhanced Educational Flashcard Generator</p>
      
      <nav className="nav">
        <button 
          className={`nav-button ${getActiveView() === 'upload' ? 'active' : ''}`}
          onClick={() => handleViewChange('upload')}
        >
          <span>�</span> Upload & Generate
        </button>
        <button 
          className={`nav-button ${getActiveView() === 'study' ? 'active' : ''}`}
          onClick={() => handleViewChange('study')}
        >
          <span>🎓</span> Study Session
        </button>
        <button 
          className={`nav-button ${getActiveView() === 'analysis' ? 'active' : ''}`}
          onClick={() => handleViewChange('analysis')}
        >
          <span>📊</span> Performance Analysis
        </button>
      </nav>

      {flashcardSets.length > 0 && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          <select 
            onChange={(e) => onSetSelected(parseInt(e.target.value))}
            className="text-input"
            style={{
              maxWidth: '400px',
              color: 'var(--gray-800)'
            }}
          >
            <option value="">Select a flashcard set...</option>
            {flashcardSets.map(set => (
              <option key={set.id} value={set.id}>
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
