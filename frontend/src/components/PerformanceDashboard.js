import React, { useState, useEffect } from 'react';

const PerformanceDashboard = ({ setId, userId }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalysis();
  }, [setId, userId]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams({ user_id: userId });
      if (setId) {
        params.append('set_id', setId);
      }
      
      const response = await fetch(`http://localhost:5000/api/get_analysis?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load performance analysis.');
      }
    } catch (error) {
      setError('Network error. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading performance analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error-message">{error}</div>
        <button className="upload-button" onClick={fetchAnalysis}>
          🔄 Retry
        </button>
      </div>
    );
  }

  if (!analysis || analysis.total_attempts === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <h2>📊 Performance Analysis</h2>
          <p>No study data available yet. Start studying flashcards to see your progress!</p>
          <div style={{ marginTop: '2rem' }}>
            <p style={{ color: '#666' }}>
              Your performance analysis will show:
            </p>
            <ul style={{ 
              textAlign: 'left', 
              color: '#666', 
              marginTop: '1rem',
              display: 'inline-block'
            }}>
              <li>Overall accuracy and progress</li>
              <li>Terms you've mastered (Strengths)</li>
              <li>Terms that need more work (Weaknesses)</li>
              <li>Personalized study recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return '#4CAF50'; // Green
    if (accuracy >= 60) return '#FF9800'; // Orange
    return '#f44336'; // Red
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    if (analysis.accuracy < 60) {
      recommendations.push("📚 Consider reviewing the source material before continuing");
      recommendations.push("🔄 Try studying the same flashcards multiple times");
    } else if (analysis.accuracy < 80) {
      recommendations.push("⚡ You're making good progress! Focus on your weak areas");
      recommendations.push("📝 Try explaining concepts in your own words");
    } else {
      recommendations.push("🎉 Excellent work! You're mastering the material");
      recommendations.push("🚀 Consider moving on to more advanced topics");
    }

    if (analysis.weaknesses.length > 0) {
      recommendations.push(`🎯 Focus extra attention on: ${analysis.weaknesses.slice(0, 3).map(w => w.term).join(', ')}`);
    }

    return recommendations;
  };

  return (
    <div className="card">
      <h2 className="section-title">📊 Performance Analysis</h2>
      
      {/* Overall Statistics */}
      <div className="dashboard-grid">
        <div className="stats-card">
          <div className="stats-number">{analysis.total_attempts}</div>
          <div className="stats-label">Total Attempts</div>
        </div>
        
        <div className="stats-card">
          <div 
            className="stats-number" 
            style={{ color: getAccuracyColor(analysis.accuracy) }}
          >
            {analysis.accuracy}%
          </div>
          <div className="stats-label">Overall Accuracy</div>
        </div>
        
        <div className="stats-card">
          <div className="stats-number" style={{ color: '#4CAF50' }}>
            {analysis.correct_count}
          </div>
          <div className="stats-label">Correct Answers</div>
        </div>
        
        <div className="stats-card">
          <div className="stats-number" style={{ color: '#f44336' }}>
            {analysis.incorrect_count}
          </div>
          <div className="stats-label">Need More Work</div>
        </div>
      </div>

      {/* Strengths Section */}
      {analysis.strengths.length > 0 && (
        <div>
          <h3 className="section-title" style={{ color: '#4CAF50', fontSize: '1.4rem' }}>
            💪 Your Strengths
          </h3>
          <div className="stats-card">
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              Terms you've mastered with high accuracy:
            </p>
            <ul className="term-list">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="term-item">
                  <span className="term-name">{strength.term}</span>
                  <span className="term-accuracy high">
                    {Math.round(strength.accuracy)}% ({strength.attempts} attempts)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Weaknesses Section */}
      {analysis.weaknesses.length > 0 && (
        <div>
          <h3 className="section-title" style={{ color: '#f44336', fontSize: '1.4rem' }}>
            🎯 Areas for Improvement
          </h3>
          <div className="stats-card">
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              Terms that need more attention:
            </p>
            <ul className="term-list">
              {analysis.weaknesses.map((weakness, index) => (
                <li key={index} className="term-item">
                  <span className="term-name">{weakness.term}</span>
                  <span className="term-accuracy low">
                    {Math.round(weakness.accuracy)}% ({weakness.attempts} attempts)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Personalized Recommendations */}
      <div>
        <h3 className="section-title" style={{ color: '#667eea', fontSize: '1.4rem' }}>
          💡 Personalized Recommendations
        </h3>
        <div className="stats-card">
          <ul style={{ 
            listStyle: 'none', 
            padding: 0,
            textAlign: 'left'
          }}>
            {getRecommendations().map((recommendation, index) => (
              <li key={index} style={{ 
                padding: '0.75rem 0',
                borderBottom: index < getRecommendations().length - 1 ? '1px solid #eee' : 'none',
                color: '#555'
              }}>
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed Term Analysis */}
      {Object.keys(analysis.term_analysis).length > 0 && (
        <div>
          <h3 className="section-title" style={{ fontSize: '1.4rem' }}>
            📈 Detailed Term Analysis
          </h3>
          <div className="stats-card">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9rem'
              }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Term</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Attempts</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Correct</th>
                    <th style={{ padding: '1rem', textAlign: 'center' }}>Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(analysis.term_analysis)
                    .sort(([,a], [,b]) => b.total - a.total)
                    .map(([term, stats]) => (
                    <tr key={term} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '0.75rem', fontWeight: '500' }}>
                        {term}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        {stats.total}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center', color: '#4CAF50' }}>
                        {stats.correct}
                      </td>
                      <td style={{ 
                        padding: '0.75rem', 
                        textAlign: 'center',
                        color: getAccuracyColor(stats.accuracy),
                        fontWeight: '600'
                      }}>
                        {Math.round(stats.accuracy)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '1rem', 
        marginTop: '2rem',
        flexWrap: 'wrap'
      }}>
        <button 
          className="upload-button"
          onClick={fetchAnalysis}
        >
          🔄 Refresh Analysis
        </button>
        
        {analysis.weaknesses.length > 0 && (
          <button 
            className="nav-control"
            style={{ 
              background: 'rgba(244, 67, 54, 0.1)', 
              borderColor: '#f44336', 
              color: '#f44336' 
            }}
            onClick={() => {
              // This would ideally filter flashcards to show only weak areas
              alert('Focus study mode coming soon! For now, review the terms listed in "Areas for Improvement".');
            }}
          >
            🎯 Focus on Weak Areas
          </button>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;
