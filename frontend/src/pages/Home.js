import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';

const Home = () => {
  const { user, updateLocation } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Electronics', 'Tools', 'Books', 'Sports', 'Kitchen', 'Garden', 'Other'];

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [searchTerm, selectedCategory, user?.activeCommunity, user?.location]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { longitude, latitude } = position.coords;
        const res = await updateLocation(longitude, latitude);
        if (res.success) {
          alert('Location updated! You can now see local items nearby.');
          fetchItems();
        } else {
          alert(res.message);
        }
      },
      (error) => {
        alert('Unable to retrieve your location. Please ensure location access is allowed in your browser settings.');
      }
    );
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
              <span className="dot"></span>
              <span>A community of neighbors, sharing with heart.</span>
            </div>
            <h1 className="hero-title">
              Borrow what you need. <br />
              <span className="gradient-text">Share what you can.</span>
            </h1>
            <p className="hero-subtitle">
              We're bringing back the spirit of community. No hidden fees, no data harvesting—just local neighbors helping each other live more sustainably.
            </p>
            
            <div className="hero-actions">
              <Link to="/ai-search" className="btn btn-primary btn-lg">
                <span>Start Searching</span>
                <span className="btn-icon">→</span>
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                <span>Join the Nest</span>
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
              <div className="feature-visual">
                <div className="feature-circle"></div>
                <span className="feature-emoji">🤖</span>
              </div>
              <h3>Talk to our AI</h3>
              <p>Forget complex filters. Just tell us what you're looking for, like "I need something to cut wood this weekend," and we'll find the right tool.</p>
            </div>
            <div className="feature-card">
              <div className="feature-visual">
                <div className="feature-circle"></div>
                <span className="feature-emoji">🛡️</span>
              </div>
              <h3>Privacy by Design</h3>
              <p>Your data is yours. We use local processing and secure protocols to ensure your community interactions stay between you and your neighbors.</p>
            </div>
            <div className="feature-card">
              <div className="feature-visual">
                <div className="feature-circle"></div>
                <span className="feature-emoji">🌿</span>
              </div>
              <h3>Rooted in Earth</h3>
              <p>Every item borrowed is one less item manufactured. We're helping communities reduce their footprint, one shared drill at a time.</p>
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
                    {category === 'All' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {user && (!user.location || !user.location.coordinates || user.location.coordinates.length < 2) && (
            <div className="location-prompt" style={{ marginTop: '20px', background: '#e0f7fa', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #00acc1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, color: '#006064' }}>
                📍 <strong>Tip:</strong> Share your location to instantly discover available items within a 2km radius!
              </p>
              <button 
                onClick={handleShareLocation}
                className="btn btn-secondary btn-sm"
                style={{ backgroundColor: '#00acc1', color: 'white', border: 'none', whiteSpace: 'nowrap', marginLeft: '15px' }}
              >
                Share My Location
              </button>
            </div>
          )}
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
              <div className="empty-icon">🏠</div>
              <h3>No items found</h3>
              <p>Try sharing your location to see local items, or join a community!</p>
              {(!user || (!user.location || !user.location.coordinates || user.location.coordinates.length < 2)) && (
                <button onClick={handleShareLocation} className="btn btn-primary" style={{ marginTop: '10px' }}>
                  Share Location
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="items-header">
                <h3>Found {items.length} item{items.length !== 1 ? 's' : ''}</h3>
                <Link to="/ai-search" className="btn btn-outline">
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