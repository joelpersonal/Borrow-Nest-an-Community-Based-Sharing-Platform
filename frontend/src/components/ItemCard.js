import React from 'react';
import { useAuth } from '../context/AuthContext';
import BorrowButton from './BorrowButton';

const ItemCard = ({ item }) => {
  const { user } = useAuth();

  const getCategoryIcon = (category) => {
    const icons = {
      'Electronics': 'ELEC',
      'Tools': 'TOOL',
      'Books': 'BOOK',
      'Sports': 'SPORT',
      'Kitchen': 'KITCHEN',
      'Garden': 'GARDEN',
      'Other': 'OTHER'
    };
    return icons[category] || 'OTHER';
  };

  const formatPrice = (price, rateType) => {
    return price > 0 ? `₹${price}/${rateType}` : 'Free';
  };

  return (
    <div className="item-card">
      {item.image && (
        <div className="item-image-container" style={{ width: '100%', height: '200px', overflow: 'hidden', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', marginBottom: '15px' }}>
          <img 
            src={`http://localhost:5000${item.image}`} 
            alt={item.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
      <div className="item-card-header">
        <div className="item-title-section">
          <h3 className="item-title">{item.title}</h3>
          <div className="item-category">
            {!item.image && <span className="category-emoji">📦</span>}
            <span>{item.category}</span>
            {item.isGeneral && (
              <span style={{ marginLeft: '8px', background: '#e0f7fa', color: '#00838f', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                🌍 Local
              </span>
            )}
          </div>
        </div>
        <div className="item-price-tag">
          {formatPrice(item.pricePerDay, item.rateType || 'day')}
        </div>
      </div>
      
      <p className="item-description">{item.description}</p>
      
      <div className="item-details">
        <div className="item-detail-row">
          <span className="detail-icon">👤</span>
          <span>Shared by <strong>{item.owner.name}</strong></span>
        </div>
        <div className="item-detail-row">
          <span className={`availability-dot ${item.available ? 'available' : 'unavailable'}`}></span>
          <span className="availability-text">{item.available ? 'Ready to borrow' : 'Currently away'}</span>
        </div>
      </div>

      {user && item.available && item.owner._id !== user.id && (
        <div className="item-actions">
          <BorrowButton item={item} />
        </div>
      )}

      {!user && item.available && (
        <div className="item-actions">
          <div className="login-prompt">
            <p>Sign in to borrow this item</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemCard;