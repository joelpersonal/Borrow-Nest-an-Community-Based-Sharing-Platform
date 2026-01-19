import React from 'react';
import { useAuth } from '../context/AuthContext';
import BorrowButton from './BorrowButton';

const ItemCard = ({ item }) => {
  const { user } = useAuth();

  const getCategoryIcon = (category) => {
    const icons = {
      'Electronics': '📱',
      'Tools': '🔧',
      'Books': '📚',
      'Sports': '⚽',
      'Kitchen': '🍳',
      'Garden': '🌱',
      'Other': '📦'
    };
    return icons[category] || '📦';
  };

  const formatPrice = (price) => {
    return price > 0 ? `$${price}/day` : 'Free';
  };

  return (
    <div className="item-card">
      <div className="item-card-header">
        <div className="item-title-section">
          <h3 className="item-title">{item.title}</h3>
          <div className="item-category">
            <span className="category-icon">{getCategoryIcon(item.category)}</span>
            <span>{item.category}</span>
          </div>
        </div>
        <div className="item-price-tag">
          {formatPrice(item.pricePerDay)}
        </div>
      </div>
      
      <p className="item-description">{item.description}</p>
      
      <div className="item-details">
        <div className="item-owner">
          <span className="detail-icon">👤</span>
          <span><strong>Owner:</strong> {item.owner.name}</span>
        </div>
        <div className="item-availability">
          <span className={`availability-badge ${item.available ? 'available' : 'unavailable'}`}>
            <span>{item.available ? '✅' : '❌'}</span>
            <span>{item.available ? 'Available' : 'Not Available'}</span>
          </span>
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
            <p>Login to borrow this item</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemCard;