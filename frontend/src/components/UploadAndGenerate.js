import React, { useState } from 'react';

const UploadAndGenerate = ({ onSetGenerated, userId }) => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inputMode, setInputMode] = useState('file'); // 'file' or 'text'
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a PDF file.');
      setFile(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please drop a PDF file.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (inputMode === 'file' && !file) {
      setError('Please select a PDF file.');
      return;
    }
    
    if (inputMode === 'text' && !text.trim()) {
      setError('Please enter some text.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      
      if (inputMode === 'file') {
        formData.append('file', file);
      } else {
        formData.append('text', text);
        formData.append('title', title || 'Text-based Flashcard Set');
      }

      const response = await fetch('http://localhost:5000/api/upload_and_generate', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Successfully generated ${data.count} flashcards!`);
        onSetGenerated(data.set_id);
        
        // Reset form
        setFile(null);
        setText('');
        setTitle('');
        
        // Reset file input
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
        
      } else {
        setError(data.error || 'Failed to generate flashcards.');
      }
    } catch (error) {
      setError('Network error. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="upload-container">
        <h2 className="section-title">Generate Flashcards</h2>
        
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button 
            className={`nav-button ${inputMode === 'file' ? 'active' : ''}`}
            onClick={() => setInputMode('file')}
            type="button"
          >
            📄 Upload PDF
          </button>
          <button 
            className={`nav-button ${inputMode === 'text' ? 'active' : ''}`}
            onClick={() => setInputMode('text')}
            type="button"
          >
            ✏️ Enter Text
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {inputMode === 'file' ? (
            <div 
              className={`upload-area ${dragOver ? 'dragover' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <div className="upload-icon">📄</div>
              <div className="upload-text">
                {file ? file.name : 'Drop your PDF here or click to browse'}
              </div>
              <div style={{ color: '#999', fontSize: '0.9rem' }}>
                Supports PDF files up to 10MB
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="file-input"
              />
            </div>
          ) : (
            <div>
              <input
                type="text"
                placeholder="Enter a title for your flashcard set (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  marginBottom: '1rem'
                }}
              />
              <textarea
                className="text-input-area"
                placeholder="Paste your educational content here... (minimum 50 characters)"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
              <div style={{ color: '#999', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Characters: {text.length} / 50 minimum
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button 
            type="submit" 
            className="upload-button"
            disabled={loading || (inputMode === 'file' && !file) || (inputMode === 'text' && text.length < 50)}
          >
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <span>Generating flashcards...</span>
              </div>
            ) : (
              '🚀 Generate Flashcards'
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '10px' }}>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>How it works:</h3>
          <ol style={{ color: '#666', lineHeight: '1.6', paddingLeft: '1.5rem' }}>
            <li>Upload a PDF document or enter text content</li>
            <li>Our AI extracts key terms and concepts</li>
            <li>Smart questions are generated for each term</li>
            <li>Study the flashcards and track your progress</li>
            <li>Get personalized feedback on your performance</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default UploadAndGenerate;
