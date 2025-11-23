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
      <div className="card-header">
        <h1 className="card-title">Generate Flashcards</h1>
        <p className="card-subtitle">Upload educational content to automatically generate AI-powered flashcards</p>
      </div>
      
      <div className="upload-container">
        <div className="upload-modes">
          <button 
            className={`upload-mode-button ${inputMode === 'file' ? 'active' : ''}`}
            onClick={() => setInputMode('file')}
            type="button"
          >
            📄 Upload PDF Document
          </button>
          <button 
            className={`upload-mode-button ${inputMode === 'text' ? 'active' : ''}`}
            onClick={() => setInputMode('text')}
            type="button"
          >
            ✏️ Enter Text Content
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
              <span className="upload-icon">📄</span>
              <div className="upload-text">
                {file ? file.name : 'Drop your PDF document here or click to browse'}
              </div>
              <div className="upload-hint">
                Supports PDF files up to 16MB • Academic papers, textbooks, lecture notes
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
                className="text-input"
                style={{ marginBottom: 'var(--space-4)' }}
              />
              <textarea
                className="text-input text-area"
                placeholder="Paste your educational content here... Lecture notes, study materials, or any learning content (minimum 50 characters)"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
              <div style={{ 
                color: 'var(--gray-500)', 
                fontSize: 'var(--font-size-sm)', 
                marginTop: 'var(--space-2)',
                marginBottom: 'var(--space-4)'
              }}>
                Characters: {text.length} / 50 minimum
              </div>
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <button 
            type="submit" 
            className="primary-button"
            disabled={loading || (inputMode === 'file' && !file) || (inputMode === 'text' && text.length < 50)}
          >
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <span className="loading-text">Processing content and generating flashcards...</span>
              </div>
            ) : (
              'Generate Flashcards'
            )}
          </button>
        </form>

        <div className="analysis-section" style={{ marginTop: 'var(--space-8)' }}>
          <div className="section-header">
            <span className="section-icon">ℹ️</span>
            <h3 className="section-title" style={{ fontSize: 'var(--font-size-lg)' }}>How It Works</h3>
          </div>
          <ol style={{ 
            color: 'var(--gray-700)', 
            lineHeight: '1.7', 
            paddingLeft: 'var(--space-6)',
            fontSize: 'var(--font-size-base)'
          }}>
            <li style={{ marginBottom: 'var(--space-2)' }}>Upload a PDF document or enter educational text content</li>
            <li style={{ marginBottom: 'var(--space-2)' }}>AI analyzes content and extracts key terms and concepts</li>
            <li style={{ marginBottom: 'var(--space-2)' }}>Intelligent questions are generated for each important term</li>
            <li style={{ marginBottom: 'var(--space-2)' }}>Study using our interactive flashcard interface</li>
            <li style={{ marginBottom: 'var(--space-2)' }}>Track your understanding and get personalized recommendations</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default UploadAndGenerate;
