"""
Multi-Model Enhancement Module for UKnow
Implements AI-Powered Summarization and Neural Machine Translation
"""

import os
import re
import nltk
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lex_rank import LexRankSummarizer
from sumy.summarizers.lsa import LsaSummarizer
from sumy.summarizers.text_rank import TextRankSummarizer
from deep_translator import GoogleTranslator
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DeepLearningService:
    """
    Multi-Model Enhancement Module for AI-powered features
    """
    
    def __init__(self):
        self.summarizer = None
        self._initialize_nltk()
        
    def _initialize_nltk(self):
        """Download required NLTK data"""
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            logger.info("Downloading NLTK punkt tokenizer...")
            nltk.download('punkt', quiet=True)
            
        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            logger.info("Downloading NLTK stopwords...")
            nltk.download('stopwords', quiet=True)
    
    def summarize_text(self, text, sentence_count=3, method='lexrank'):
        """
        Extractive Text Summarization using multiple algorithms
        
        Args:
            text (str): Input text to summarize
            sentence_count (int): Number of sentences in summary
            method (str): Summarization method ('lexrank', 'lsa', 'textrank')
            
        Returns:
            str: Summarized text
        """
        try:
            if not text or len(text.strip()) < 50:
                return "Text too short to summarize effectively."
            
            # Clean and prepare text
            cleaned_text = self._clean_text_for_summary(text)
            
            # Parse text
            parser = PlaintextParser.from_string(cleaned_text, Tokenizer("english"))
            
            # Try different summarization methods with fallbacks
            summarizer = None
            summary = ""
            methods_to_try = []
            
            if method == 'lexrank':
                methods_to_try = ['lexrank', 'textrank', 'simple']
            elif method == 'lsa':
                methods_to_try = ['lsa', 'textrank', 'simple']
            elif method == 'textrank':
                methods_to_try = ['textrank', 'simple']
            else:
                methods_to_try = ['lexrank', 'textrank', 'simple']
            
            for method_name in methods_to_try:
                try:
                    if method_name == 'lexrank':
                        summarizer = LexRankSummarizer()
                    elif method_name == 'lsa':
                        summarizer = LsaSummarizer()
                    elif method_name == 'textrank':
                        summarizer = TextRankSummarizer()
                    elif method_name == 'simple':
                        # Simple extractive summarization fallback
                        return self._simple_extractive_summary(text, sentence_count)
                    
                    # Generate summary
                    summary_sentences = summarizer(parser.document, sentence_count)
                    summary = ' '.join([str(sentence) for sentence in summary_sentences])
                    break
                    
                except Exception as method_error:
                    logger.warning(f"Method {method_name} failed: {method_error}")
                    continue
            
            if not summary.strip():
                return "Unable to generate meaningful summary from the provided text."
                
            logger.info(f"Generated summary using {method}: {len(summary)} characters")
            return summary
            
        except Exception as e:
            logger.error(f"Summarization error: {e}")
            return f"Error generating summary: {str(e)}"
    
    def _clean_text_for_summary(self, text):
        """Clean text for better summarization"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove very short sentences (likely artifacts)
        sentences = text.split('.')
        sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
        
        return '. '.join(sentences)
    
    def translate_text(self, text, target_language='es', preserve_technical_terms=True):
        """
        Neural Machine Translation with technical term preservation
        
        Args:
            text (str): Text to translate
            target_language (str): Target language code (e.g., 'es', 'fr', 'de')
            preserve_technical_terms (bool): Whether to preserve technical terms
            
        Returns:
            dict: Translation result with metadata
        """
        try:
            if not text or len(text.strip()) == 0:
                return {
                    'translated_text': '',
                    'source_language': 'unknown',
                    'target_language': target_language,
                    'confidence': 0,
                    'error': 'Empty text provided'
                }
            
            # Technical terms glossary (preserve these during translation)
            technical_terms = self._extract_technical_terms(text) if preserve_technical_terms else []
            
            # Replace technical terms with placeholders
            text_with_placeholders, term_map = self._replace_technical_terms(text, technical_terms)
            
            # Perform translation using deep-translator
            translator = GoogleTranslator(source='auto', target=target_language)
            translated_text_raw = translator.translate(text_with_placeholders)
            
            # Restore technical terms
            translated_text = self._restore_technical_terms(translated_text_raw, term_map)
            
            return {
                'translated_text': translated_text,
                'source_language': 'auto',  # deep-translator auto-detects
                'target_language': target_language,
                'confidence': 0.85,  # Default confidence for Google Translate
                'preserved_terms': len(technical_terms),
                'error': None
            }
            
        except Exception as e:
            logger.error(f"Translation error: {e}")
            return {
                'translated_text': text,  # Return original on error
                'source_language': 'unknown',
                'target_language': target_language,
                'confidence': 0,
                'error': f"Translation failed: {str(e)}"
            }
    
    def _extract_technical_terms(self, text):
        """Extract technical terms that should be preserved during translation"""
        technical_patterns = [
            r'\b[A-Z]{2,}\b',  # Acronyms (CNN, API, etc.)
            r'\b\w*[A-Z]\w*[A-Z]\w*\b',  # CamelCase terms
            r'\b\w+\([^)]*\)\b',  # Terms with parentheses
            r'\b\d+\.\d+\b',  # Version numbers
            r'\b[a-zA-Z]+\d+[a-zA-Z]*\b',  # Mixed alphanumeric (HTML5, etc.)
        ]
        
        technical_terms = set()
        for pattern in technical_patterns:
            matches = re.findall(pattern, text)
            technical_terms.update(matches)
        
        # Filter out common words
        common_words = {'THE', 'AND', 'OR', 'BUT', 'IN', 'ON', 'AT', 'TO', 'FOR'}
        technical_terms = [term for term in technical_terms if term.upper() not in common_words]
        
        return list(technical_terms)[:20]  # Limit to 20 terms
    
    def _replace_technical_terms(self, text, technical_terms):
        """Replace technical terms with placeholders for translation"""
        term_map = {}
        text_with_placeholders = text
        
        for i, term in enumerate(technical_terms):
            placeholder = f"TECHTERM{i}PLACEHOLDER"
            term_map[placeholder] = term
            text_with_placeholders = text_with_placeholders.replace(term, placeholder)
        
        return text_with_placeholders, term_map
    
    def _restore_technical_terms(self, translated_text, term_map):
        """Restore technical terms from placeholders"""
        result = translated_text
        for placeholder, original_term in term_map.items():
            result = result.replace(placeholder, original_term)
        
        return result
    
    def get_supported_languages(self):
        """Get list of supported translation languages"""
        return {
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
        }
    
    def analyze_text_complexity(self, text):
        """
        Analyze text complexity for difficulty classification
        
        Args:
            text (str): Text to analyze
            
        Returns:
            dict: Complexity metrics
        """
        try:
            # Basic metrics
            word_count = len(text.split())
            sentence_count = len([s for s in text.split('.') if s.strip()])
            avg_words_per_sentence = word_count / max(sentence_count, 1)
            
            # Technical term density
            technical_terms = self._extract_technical_terms(text)
            technical_density = len(technical_terms) / max(word_count, 1)
            
            # Complexity classification
            if avg_words_per_sentence > 20 or technical_density > 0.1:
                difficulty = 'hard'
            elif avg_words_per_sentence > 15 or technical_density > 0.05:
                difficulty = 'medium'
            else:
                difficulty = 'easy'
            
            return {
                'word_count': word_count,
                'sentence_count': sentence_count,
                'avg_words_per_sentence': round(avg_words_per_sentence, 2),
                'technical_density': round(technical_density, 3),
                'difficulty_level': difficulty,
                'technical_terms_found': len(technical_terms)
            }
            
        except Exception as e:
            logger.error(f"Complexity analysis error: {e}")
            return {
                'word_count': 0,
                'difficulty_level': 'unknown',
                'error': str(e)
            }
    
    def _simple_extractive_summary(self, text, sentence_count=3):
        """
        Simple extractive summarization fallback that doesn't require NumPy
        Selects sentences based on keyword frequency and position
        """
        import re
        
        # Split into sentences
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
        
        if len(sentences) <= sentence_count:
            return text
        
        # Score sentences based on length and position (early sentences often important)
        scored_sentences = []
        for i, sentence in enumerate(sentences):
            # Position weight (earlier = higher score)
            position_weight = 1.0 - (i / len(sentences)) * 0.5
            
            # Length weight (prefer medium length sentences)
            length_weight = min(len(sentence) / 100, 1.0)
            
            # Keyword weight (count common academic/technical terms)
            keyword_weight = self._count_keywords(sentence) * 0.1
            
            total_score = position_weight + length_weight + keyword_weight
            scored_sentences.append((sentence, total_score))
        
        # Sort by score and take top sentences
        scored_sentences.sort(key=lambda x: x[1], reverse=True)
        top_sentences = [s[0] for s in scored_sentences[:sentence_count]]
        
        # Maintain original order
        summary_sentences = []
        for sentence in sentences:
            if sentence in top_sentences:
                summary_sentences.append(sentence)
        
        return '. '.join(summary_sentences) + '.'
    
    def _count_keywords(self, text):
        """Count academic/technical keywords in text"""
        keywords = ['data', 'analysis', 'system', 'method', 'result', 'study', 
                   'research', 'model', 'algorithm', 'neural', 'learning', 
                   'network', 'deep', 'machine', 'artificial', 'intelligence']
        
        text_lower = text.lower()
        return sum(1 for keyword in keywords if keyword in text_lower)

# Global instance
dl_service = DeepLearningService()
