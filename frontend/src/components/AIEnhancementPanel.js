import React, { useState } from 'react';

const AIEnhancementPanel = ({ 
  flashcard, 
  isVisible, 
  onClose,
  onSummarize,
  onTranslate 
}) => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [translation, setTranslation] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [summaryMethod, setSummaryMethod] = useState('lexrank');
  const [error, setError] = useState('');

  const supportedLanguages = {
    'es': 'Spanish',
    'fr': 'French', 
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese (Simplified)',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'bn': 'Bengali'
  };

  const handleSummarize = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: flashcard.context || flashcard.answer,
          method: summaryMethod,
          sentence_count: 2
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
        onSummarize(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Summarization failed');
      }
    } catch (error) {
      setError('Network error during summarization');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: flashcard.answer,
          target_language: selectedLanguage,
          preserve_technical_terms: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTranslation(data.translated_text);
        onTranslate(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Translation failed');
      }
    } catch (error) {
      setError('Network error during translation');
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="ai-enhancement-panel">
      <div className="enhancement-header">
        <div className="section-header">
          <span className="section-icon">🤖</span>
          <h3 className="section-title">AI Enhancement Tools</h3>
        </div>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>

      <div className="enhancement-content">
        {/* Summarization Section */}
        <div className="enhancement-section">
          <div className="enhancement-section-header">
            <span className="enhancement-icon">📋</span>
            <h4 className="enhancement-title">Summarize Content</h4>
          </div>
          
          <div className="enhancement-controls">
            <select 
              value={summaryMethod} 
              onChange={(e) => setSummaryMethod(e.target.value)}
              className="text-input"
              style={{ marginBottom: 'var(--space-3)' }}
            >
              <option value="lexrank">LexRank (Recommended)</option>
              <option value="textrank">TextRank</option>
              <option value="lsa">LSA</option>
            </select>
            
            <button 
              className="primary-button"
              onClick={handleSummarize}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Summarizing...' : 'Generate Summary'}
            </button>
          </div>

          {summary && (
            <div className="enhancement-result">
              <div className="result-label">Summary:</div>
              <div className="result-content">{summary}</div>
            </div>
          )}
        </div>

        {/* Translation Section */}
        <div className="enhancement-section">
          <div className="enhancement-section-header">
            <span className="enhancement-icon">🌐</span>
            <h4 className="enhancement-title">Translate Content</h4>
          </div>
          
          <div className="enhancement-controls">
            <select 
              value={selectedLanguage} 
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="text-input"
              style={{ marginBottom: 'var(--space-3)' }}
            >
              {Object.entries(supportedLanguages).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
            
            <button 
              className="primary-button"
              onClick={handleTranslate}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Translating...' : `Translate to ${supportedLanguages[selectedLanguage]}`}
            </button>
          </div>

          {translation && (
            <div className="enhancement-result">
              <div className="result-label">Translation ({supportedLanguages[selectedLanguage]}):</div>
              <div className="result-content">{translation}</div>
            </div>
          )}
        </div>

        {/* Difficulty Information */}
        {flashcard.difficulty_level && (
          <div className="enhancement-section">
            <div className="enhancement-section-header">
              <span className="enhancement-icon">📊</span>
              <h4 className="enhancement-title">Content Analysis</h4>
            </div>
            
            <div className="difficulty-indicator">
              <span className="difficulty-label">Difficulty Level:</span>
              <span className={`difficulty-badge difficulty-${flashcard.difficulty_level}`}>
                {flashcard.difficulty_level.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="alert alert-error">{error}</div>
        )}
      </div>
    </div>
  );
};

export default AIEnhancementPanel;
