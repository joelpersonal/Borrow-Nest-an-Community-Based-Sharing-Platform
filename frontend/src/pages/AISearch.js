import React, { useState } from 'react';
import axios from 'axios';
import ItemCard from '../components/ItemCard';

const AISearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [aiType, setAiType] = useState('');
  const [aiModel, setAiModel] = useState('');

  const exampleQueries = [
    "I need a drill for 2 days",
    "Any camera available nearby?",
    "Show me tools for home repair",
    "Looking for cooking equipment",
    "Need sports gear for weekend",
    "Books about programming"
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await axios.post('/search', { query });
      setResults(response.data.items);
      setAiResponse(response.data.message);
      setIsFallback(response.data.searchType !== 'ai');
      setAiType(response.data.searchType || 'unknown');
      setAiModel(response.data.model || 'Unknown');
    } catch (error) {
      console.error('Search error:', error);
      setAiResponse('Sorry, search failed. Please try again.');
      setResults([]);
      setIsFallback(true);
      setAiType('error');
      setAiModel('Error');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (exampleQuery) => {
    setQuery(exampleQuery);
  };

  return (
    <div className="container">
      {/* AI Search Header */}
      <section className="ai-search-header">
        <div className="text-center mb-20">
          <h1 className="ai-title">AI-Powered Search</h1>
          <p className="ai-subtitle">
            Find items using natural language with our offline AI assistant powered by Ollama
          </p>
        </div>

        {/* Search Form */}
        <div className="ai-search-form">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask me anything... e.g., 'I need a drill for 2 days'"
                className="ai-search-input"
                disabled={loading}
              />
              <button 
                type="submit" 
                disabled={loading || !query.trim()}
                className="btn btn-primary search-btn"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Example Queries */}
          {!hasSearched && (
            <div className="example-queries">
              <p className="example-label">Try these examples:</p>
              <div className="example-buttons">
                {exampleQueries.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="example-btn"
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* AI Response */}
      {aiResponse && (
        <section className="ai-response-section">
          <div className="ai-response-card">
            <div className="ai-response-header">
              <h3>
                {aiType === 'ollama' && 'Ollama AI (Local LLM)'}
                {aiType === 'built-in' && 'Built-in Smart AI'}
                {aiType === 'basic' && 'Basic Search'}
                {aiType === 'error' && 'Search Error'}
                {!aiType && 'AI Assistant'}
              </h3>
              <p className="ai-model-info">
                Model: {aiModel}
                {aiType === 'ollama' && ' • 100% Free & Offline'}
                {aiType === 'built-in' && ' • Always Free & Fast'}
                {aiType === 'basic' && ' • Fallback Mode'}
              </p>
              {isFallback && aiType !== 'built-in' && (
                <p className="fallback-notice">
                  {aiType === 'basic' ? 'Using basic text search.' : 'Ollama AI not available, using smart fallback.'}
                </p>
              )}
            </div>
            <div className="ai-response-content">
              <p>{aiResponse}</p>
            </div>
          </div>
        </section>
      )}

      {/* Search Results */}
      {hasSearched && (
        <section className="search-results-section">
          <div className="results-header">
            <h2>Search Results ({results.length} items found)</h2>
          </div>

          {results.length === 0 ? (
            <div className="no-results">
              <div className="no-results-content">
                <h3>No items found</h3>
                <p>Try rephrasing your search or browse all available items.</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="btn btn-outline"
                >
                  Browse All Items
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-3">
              {results.map(item => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* AI Info Section */}
      {!hasSearched && (
        <section className="ai-info-section">
          <div className="ai-info-grid">
            <div className="info-card">
              <h3>Offline AI</h3>
              <p>Powered by Ollama running locally on your machine. No data sent to external servers.</p>
            </div>
            <div className="info-card">
              <h3>Smart Search</h3>
              <p>Understands natural language queries and finds relevant items based on context.</p>
            </div>
            <div className="info-card">
              <h3>Fast Results</h3>
              <p>Get instant results without internet dependency once Ollama is set up.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default AISearch;