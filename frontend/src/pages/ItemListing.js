import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ItemListing = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    pricePerDay: 0,
    rateType: 'day',
    isGeneral: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const categories = ['Electronics', 'Tools', 'Books', 'Sports', 'Kitchen', 'Garden', 'Other'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('pricePerDay', formData.pricePerDay);
      data.append('rateType', formData.rateType);
      data.append('isGeneral', formData.isGeneral);
      if (imageFile) {
        data.append('image', imageFile);
      }

      await axios.post('/items', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Item added successfully!');
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Error adding item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-sm">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Add New Item</h2>
          <p>Share an item with your community</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Item Visibility</label>
            <div style={{ display: 'flex', gap: '15px', padding: '10px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="isGeneral" 
                  checked={formData.isGeneral === false} 
                  onChange={() => setFormData({...formData, isGeneral: false})} 
                />
                My Community
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="isGeneral" 
                  checked={formData.isGeneral === true} 
                  onChange={() => setFormData({...formData, isGeneral: true})} 
                />
                General (Local 2km Radius)
              </label>
            </div>
            {formData.isGeneral === false && !user?.activeCommunity && (
              <small style={{ color: '#d32f2f', display: 'block' }}>⚠️ You must select a community in your dashboard to post a community-only item.</small>
            )}
            {formData.isGeneral === true && (!user?.location || !user?.location.coordinates || user?.location.coordinates.length < 2) && (
              <small style={{ color: '#d32f2f', display: 'block' }}>⚠️ You must share your location on your Dashboard first to post a general item.</small>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Item Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Electric Drill, Camera, Cookbook"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Product Image (Optional)</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="form-input"
              style={{ padding: '0.4rem' }}
            />
            <small>Upload a photo to make your item stand out!</small>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your item, its condition, and any special instructions..."
              className="form-textarea"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select"
              required
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Price (Optional)</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹</span>
              <input
                type="number"
                name="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="0"
                className="form-input"
                style={{ flex: 1 }}
              />
              <select
                name="rateType"
                value={formData.rateType}
                onChange={handleChange}
                className="form-select"
                style={{ flex: 1 }}
              >
                <option value="hour">per hour</option>
                <option value="day">per day</option>
              </select>
            </div>
            <small>Leave as 0 for free borrowing</small>
          </div>

          <div className="form-actions">
            <button 
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Adding Item...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

};

export default ItemListing;