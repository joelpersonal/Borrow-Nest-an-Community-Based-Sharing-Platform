import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ItemCard from '../components/ItemCard';

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Electronics', 'Tools', 'Books', 'Sports', 'Kitchen', 'Garden', 'Other'];

  useEffect(() => {
    fetchItems();
  }, [searchTerm, selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchItems = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const response = await axios.get('/items', { params });
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-pattern"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>🌟</span>
              <span>Community Sharing Platform</span>
            </div>
            <h1 className="hero-title">
              Welcome to <span className="gradient-text">Borrow Nest</span>
            </h1>
            <p className="hero-subtitle">
              Share, borrow, and build community through sustainable item sharing. 
              Connect with neighbors, reduce waste, and save money together.
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">{items.length}+</div>
                <div className="stat-label">Items Available</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-label">Free to Use</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">AI</div>
                <div className="stat-label">Powered Search</div>
              </div>
            </div>
            <div className="hero-actions">
              <Link to="/ai-search" className="btn btn-primary btn-lg">
                <span>🤖</span>
                Try AI Search
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg">
                <span>🚀</span>
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI-Powered Search</h3>
              <p>Find items using natural language. Ask "I need a drill for 2 days" and get smart results.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>100% Free & Private</h3>
              <p>No hidden costs, no data tracking. Your privacy is protected with local AI processing.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌱</div>
              <h3>Sustainable Sharing</h3>
              <p>Reduce waste and save money by sharing items with your community members.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="search-section">
        <div className="container">
          <div className="search-header">
            <h2 className="section-title">Discover Available Items</h2>
            <p className="section-subtitle">Browse through community items or use our smart search</p>
          </div>
          
          <div className="search-container">
            <div className="search-box">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search for items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input search-input"
                />
              </div>
            </div>
            <div className="filter-box">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select category-select"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'All' ? '📂 All Categories' : `📁 ${category}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Items Grid */}
      <section className="items-section">
        <div className="container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading amazing items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No items found</h3>
              <p>Be the first to add an item to the community!</p>
              <Link to="/register" className="btn btn-primary">
                <span>✨</span>
                Get Started
              </Link>
            </div>
          ) : (
            <>
              <div className="items-header">
                <h3>Found {items.length} item{items.length !== 1 ? 's' : ''}</h3>
                <Link to="/ai-search" className="btn btn-outline">
                  <span>🤖</span>
                  Try AI Search
                </Link>
              </div>
              <div className="grid grid-3">
                {items.map(item => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;