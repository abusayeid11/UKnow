from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import PyPDF2
import re
from collections import Counter
import random

# Initialize Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///uknow.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize extensions
db = SQLAlchemy(app)
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'], 
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization'])

# Create upload directory
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load spaCy model (optional - will use fallback if not available)
try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
    print("spaCy model loaded successfully")
except (ImportError, OSError):
    print("spaCy not available, using fallback NLP methods")
    nlp = None

# Database Models
class FlashcardSet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    flashcards = db.relationship('Flashcard', backref='flashcard_set', lazy=True, cascade='all, delete-orphan')

class Flashcard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    term = db.Column(db.String(200), nullable=False)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    context = db.Column(db.Text)
    set_id = db.Column(db.Integer, db.ForeignKey('flashcard_set.id'), nullable=False)
    performance_records = db.relationship('PerformanceRecord', backref='flashcard', lazy=True)

class PerformanceRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    flashcard_id = db.Column(db.Integer, db.ForeignKey('flashcard.id'), nullable=False)
    user_id = db.Column(db.String(100), nullable=False)  # Session ID or user identifier
    status = db.Column(db.String(20), nullable=False)  # 'correct' or 'incorrect'
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# NLP Core Functions
def extract_text_from_pdf(file_path):
    """Extract text from PDF file using PyPDF2"""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""

def extract_key_terms(text):
    """Extract key terms and their contexts using spaCy NER and noun phrases"""
    if not nlp:
        # Fallback method without spaCy
        return extract_key_terms_fallback(text)
    
    doc = nlp(text)
    terms_with_context = {}
    
    # Extract named entities
    for ent in doc.ents:
        if ent.label_ in ['PERSON', 'ORG', 'GPE', 'EVENT', 'WORK_OF_ART', 'LAW', 'LANGUAGE']:
            # Get sentence context
            sentence = ent.sent.text.strip()
            if len(ent.text) > 2 and len(sentence) > 10:
                terms_with_context[ent.text] = sentence
    
    # Extract important noun phrases
    for chunk in doc.noun_chunks:
        if len(chunk.text.split()) >= 2 and len(chunk.text) <= 50:
            # Filter out common/generic phrases
            if not any(word in chunk.text.lower() for word in ['this', 'that', 'these', 'those', 'some', 'many', 'few']):
                sentence = chunk.sent.text.strip()
                if len(sentence) > 10:
                    terms_with_context[chunk.text] = sentence
    
    return terms_with_context

def extract_key_terms_fallback(text):
    """Fallback method for key term extraction without spaCy"""
    sentences = text.split('.')
    terms_with_context = {}
    
    # Simple pattern matching for capitalized terms and phrases
    for sentence in sentences:
        sentence = sentence.strip()
        if len(sentence) < 10:
            continue
            
        # Find capitalized words/phrases (potential proper nouns)
        words = sentence.split()
        for i, word in enumerate(words):
            if word[0].isupper() and len(word) > 2:
                # Check if it's part of a multi-word proper noun
                term = word
                j = i + 1
                while j < len(words) and j < i + 4 and words[j][0].isupper():
                    term += " " + words[j]
                    j += 1
                
                if len(term) > 2 and not term.lower() in ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']:
                    terms_with_context[term] = sentence
    
    return terms_with_context

def generate_question(term, context):
    """Generate a question for the flashcard based on term and context"""
    question_templates = [
        f"What is {term}?",
        f"Define {term}.",
        f"Explain the concept of {term}.",
        f"What do you know about {term}?",
        f"Describe {term}.",
        f"What is the significance of {term}?",
        f"How would you explain {term}?",
    ]
    
    # Choose template based on term characteristics
    if any(word in term.lower() for word in ['theory', 'principle', 'law', 'rule']):
        question = f"Explain the {term}."
    elif any(word in term.lower() for word in ['process', 'method', 'technique']):
        question = f"Describe the {term}."
    elif len(term.split()) == 1 and term[0].isupper():
        question = f"Who or what is {term}?"
    else:
        question = random.choice(question_templates)
    
    return question

def generate_answer_from_context(term, context):
    """Extract or generate an answer from the context"""
    # Simple approach: use the sentence containing the term as the answer
    sentences = context.split('.')
    
    for sentence in sentences:
        if term.lower() in sentence.lower() and len(sentence.strip()) > 10:
            return sentence.strip()
    
    # Fallback: return the context itself if term not found in individual sentences
    return context.strip()

# API Endpoints
@app.route('/api/upload_and_generate', methods=['POST'])
def upload_and_generate():
    try:
        print("Received upload request")  # Debug logging
        
        # Check if file is provided
        if 'file' not in request.files and 'text' not in request.form:
            return jsonify({'error': 'No file or text provided'}), 400
        
        text = ""
        title = "Untitled Flashcard Set"
        
        # Handle file upload
        if 'file' in request.files and request.files['file'].filename:
            file = request.files['file']
            if file.filename.endswith('.pdf'):
                filename = file.filename
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                text = extract_text_from_pdf(filepath)
                title = filename.replace('.pdf', '')
                # Clean up uploaded file
                os.remove(filepath)
            else:
                return jsonify({'error': 'Only PDF files are supported'}), 400
        
        # Handle raw text input
        elif 'text' in request.form:
            text = request.form['text']
            title = request.form.get('title', 'Text-based Flashcard Set')
        
        if not text or len(text.strip()) < 50:
            return jsonify({'error': 'Insufficient text content for flashcard generation'}), 400
        
        # Extract key terms and contexts
        terms_with_context = extract_key_terms(text)
        
        if not terms_with_context:
            return jsonify({'error': 'No suitable terms found for flashcard generation'}), 400
        
        # Create flashcard set
        flashcard_set = FlashcardSet(title=title)
        db.session.add(flashcard_set)
        db.session.commit()
        
        # Generate flashcards
        flashcards_data = []
        for term, context in list(terms_with_context.items())[:20]:  # Limit to 20 cards
            question = generate_question(term, context)
            answer = generate_answer_from_context(term, context)
            
            flashcard = Flashcard(
                term=term,
                question=question,
                answer=answer,
                context=context,
                set_id=flashcard_set.id
            )
            db.session.add(flashcard)
            
            flashcards_data.append({
                'id': None,  # Will be set after commit
                'term': term,
                'question': question,
                'answer': answer,
                'context': context
            })
        
        db.session.commit()
        
        # Update flashcard IDs
        flashcards = Flashcard.query.filter_by(set_id=flashcard_set.id).all()
        for i, flashcard in enumerate(flashcards):
            flashcards_data[i]['id'] = flashcard.id
        
        return jsonify({
            'set_id': flashcard_set.id,
            'title': title,
            'flashcards': flashcards_data,
            'count': len(flashcards_data)
        })
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/record_performance', methods=['POST'])
def record_performance():
    try:
        data = request.json
        flashcard_id = data.get('flashcard_id')
        user_id = data.get('user_id', 'anonymous')
        status = data.get('status')  # 'correct' or 'incorrect'
        
        if not flashcard_id or status not in ['correct', 'incorrect']:
            return jsonify({'error': 'Invalid data provided'}), 400
        
        # Check if flashcard exists
        flashcard = Flashcard.query.get(flashcard_id)
        if not flashcard:
            return jsonify({'error': 'Flashcard not found'}), 404
        
        # Record performance
        performance_record = PerformanceRecord(
            flashcard_id=flashcard_id,
            user_id=user_id,
            status=status
        )
        db.session.add(performance_record)
        db.session.commit()
        
        return jsonify({'message': 'Performance recorded successfully'})
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/get_analysis', methods=['GET'])
def get_analysis():
    try:
        user_id = request.args.get('user_id', 'anonymous')
        set_id = request.args.get('set_id')
        
        # Base query for performance records
        query = PerformanceRecord.query.filter_by(user_id=user_id)
        
        if set_id:
            # Filter by flashcard set
            flashcard_ids = [f.id for f in Flashcard.query.filter_by(set_id=set_id).all()]
            query = query.filter(PerformanceRecord.flashcard_id.in_(flashcard_ids))
        
        records = query.all()
        
        if not records:
            return jsonify({
                'total_attempts': 0,
                'correct_count': 0,
                'incorrect_count': 0,
                'accuracy': 0,
                'strengths': [],
                'weaknesses': [],
                'term_analysis': {}
            })
        
        # Calculate overall statistics
        total_attempts = len(records)
        correct_count = sum(1 for r in records if r.status == 'correct')
        incorrect_count = total_attempts - correct_count
        accuracy = (correct_count / total_attempts) * 100 if total_attempts > 0 else 0
        
        # Analyze performance by term
        term_stats = {}
        for record in records:
            flashcard = Flashcard.query.get(record.flashcard_id)
            if flashcard:
                term = flashcard.term
                if term not in term_stats:
                    term_stats[term] = {'correct': 0, 'incorrect': 0, 'flashcard_id': flashcard.id}
                term_stats[term][record.status] += 1
        
        # Calculate term-level statistics
        term_analysis = {}
        strengths = []
        weaknesses = []
        
        for term, stats in term_stats.items():
            total = stats['correct'] + stats['incorrect']
            term_accuracy = (stats['correct'] / total) * 100 if total > 0 else 0
            
            term_analysis[term] = {
                'correct': stats['correct'],
                'incorrect': stats['incorrect'],
                'total': total,
                'accuracy': term_accuracy,
                'flashcard_id': stats['flashcard_id']
            }
            
            # Identify strengths (>80% accuracy with at least 2 attempts)
            if term_accuracy >= 80 and total >= 2:
                strengths.append({
                    'term': term,
                    'accuracy': term_accuracy,
                    'attempts': total
                })
            
            # Identify weaknesses (<60% accuracy with at least 2 attempts)
            elif term_accuracy < 60 and total >= 2:
                weaknesses.append({
                    'term': term,
                    'accuracy': term_accuracy,
                    'attempts': total
                })
        
        # Sort strengths and weaknesses
        strengths.sort(key=lambda x: x['accuracy'], reverse=True)
        weaknesses.sort(key=lambda x: x['accuracy'])
        
        return jsonify({
            'total_attempts': total_attempts,
            'correct_count': correct_count,
            'incorrect_count': incorrect_count,
            'accuracy': round(accuracy, 2),
            'strengths': strengths[:5],  # Top 5 strengths
            'weaknesses': weaknesses[:5],  # Top 5 weaknesses
            'term_analysis': term_analysis
        })
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/flashcard_sets', methods=['GET'])
def get_flashcard_sets():
    """Get all flashcard sets"""
    try:
        sets = FlashcardSet.query.order_by(FlashcardSet.created_at.desc()).all()
        sets_data = []
        
        for set_obj in sets:
            flashcard_count = len(set_obj.flashcards)
            sets_data.append({
                'id': set_obj.id,
                'title': set_obj.title,
                'created_at': set_obj.created_at.isoformat(),
                'flashcard_count': flashcard_count
            })
        
        return jsonify(sets_data)
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/flashcard_sets/<int:set_id>', methods=['GET'])
def get_flashcard_set(set_id):
    """Get a specific flashcard set with its flashcards"""
    try:
        flashcard_set = FlashcardSet.query.get(set_id)
        if not flashcard_set:
            return jsonify({'error': 'Flashcard set not found'}), 404
        
        flashcards_data = []
        for flashcard in flashcard_set.flashcards:
            flashcards_data.append({
                'id': flashcard.id,
                'term': flashcard.term,
                'question': flashcard.question,
                'answer': flashcard.answer,
                'context': flashcard.context
            })
        
        return jsonify({
            'id': flashcard_set.id,
            'title': flashcard_set.title,
            'created_at': flashcard_set.created_at.isoformat(),
            'flashcards': flashcards_data,
            'count': len(flashcards_data)
        })
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

# API Endpoints
@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({'status': 'OK', 'message': 'UKnow backend is running!'})

# Initialize database
def create_tables():
    db.create_all()

if __name__ == '__main__':
    print("Starting UKnow backend server...")
    try:
        with app.app_context():
            db.create_all()
            print("Database initialized successfully")
        print("Server starting on http://localhost:5000")
        app.run(debug=True, port=5000, host='0.0.0.0')
    except Exception as e:
        print(f"Failed to start server: {e}")
        input("Press Enter to exit...")
