# UKnow - AI-Enhanced Educational Flashcard Generator

## Overview
UKnow is a complete educational flashcard application that uses AI to generate smart flashcards from PDF documents or text content. It features personalized performance tracking and provides intelligent feedback to help students focus on areas that need improvement.

## Features
- 🚀 **PDF & Text Processing**: Upload PDF documents or paste text to generate flashcards
- 🧠 **AI-Powered Generation**: Uses NLP (spaCy) to extract key terms and generate questions
- 📚 **Interactive Study Mode**: Flip cards with intuitive study interface
- 📊 **Performance Tracking**: Track correct/incorrect answers with detailed analytics
- 💡 **Personalized Feedback**: Get recommendations based on your study patterns
- 🎯 **Strength & Weakness Analysis**: Identify mastered topics and areas needing work

## Technology Stack
- **Backend**: Python Flask, SQLite, spaCy NLP, PyPDF2
- **Frontend**: React 18, React Router, Modern CSS
- **Database**: SQLite with Flask-SQLAlchemy

## Installation & Setup

### Prerequisites
- Python 3.7+
- Node.js 14+
- npm or yarn

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # macOS/Linux
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Download spaCy model:
   ```bash
   python -m spacy download en_core_web_sm
   ```

5. Run the Flask server:
   ```bash
   python app.py
   ```
   Server will start on http://localhost:5000

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   Application will open on http://localhost:3000

## Usage Guide

### 1. Generate Flashcards
- **Upload PDF**: Click "Upload PDF" and select a PDF document
- **Enter Text**: Switch to "Enter Text" mode and paste educational content
- Click "Generate Flashcards" to create your study set

### 2. Study Mode
- Click through flashcards using the flip interface
- Mark each card as "Got It!" (correct) or "Need Work" (incorrect)
- Track your progress with the real-time progress bar

### 3. Performance Analysis
- View detailed statistics on your study performance
- See your strengths (mastered terms) and weaknesses (needs improvement)
- Get personalized recommendations for effective studying

## API Endpoints

### POST /api/upload_and_generate
Generate flashcards from uploaded PDF or text
- **Input**: FormData with 'file' (PDF) or 'text' field
- **Output**: Flashcard set with generated questions

### POST /api/record_performance
Record study performance for a flashcard
- **Input**: `{flashcard_id, user_id, status}` (status: 'correct'/'incorrect')
- **Output**: Success confirmation

### GET /api/get_analysis
Get performance analysis for a user
- **Parameters**: user_id, set_id (optional)
- **Output**: Detailed performance statistics and recommendations

### GET /api/flashcard_sets
List all available flashcard sets
- **Output**: Array of flashcard sets with metadata

### GET /api/flashcard_sets/{id}
Get specific flashcard set with all cards
- **Output**: Complete flashcard set data

## Project Structure
```
UKnow/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   └── uploads/           # Temporary PDF storage
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   ├── UploadAndGenerate.js
│   │   │   ├── StudyAndAnalyze.js
│   │   │   ├── FlashcardStudy.js
│   │   │   └── PerformanceDashboard.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Database Schema
- **FlashcardSet**: Stores flashcard collections
- **Flashcard**: Individual flashcards with terms, questions, answers
- **PerformanceRecord**: Tracks user study performance

## Development Notes
- CORS is configured for localhost:3000
- Database is created automatically on first run
- File uploads are temporarily stored and cleaned up
- User sessions are tracked via localStorage-generated IDs

## Future Enhancements
- User authentication and accounts
- Spaced repetition algorithm
- Export/import functionality
- Multi-language support
- Mobile app version
- Collaborative study sets

## Contributing
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License
Educational use - please customize for your needs!
