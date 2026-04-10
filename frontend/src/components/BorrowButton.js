import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

const BorrowButton = ({ item }) => {
  const [showModal, setShowModal] = useState(false);
  const [borrowDuration, setBorrowDuration] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isHourly = item.rateType === 'hour';
  const durationUnit = isHourly ? 'hours' : 'days';

  const handleBorrowRequest = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/borrow', {
        itemId: item._id,
        borrowDuration: parseInt(borrowDuration),
        durationType: durationUnit,
        message
      });

      alert('Borrow request sent successfully!');
      setShowModal(false);
      setBorrowDuration(1);
      setMessage('');
    } catch (error) {
      alert(error.response?.data?.message || 'Error sending request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="btn btn-primary"
      >
        Request to Borrow
      </button>

      {showModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <h3>Request to Borrow</h3>
                <p className="modal-item-name">"{item.title}"</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleBorrowRequest} className="borrow-form">
              <div className="form-group">
                <label className="form-label">
                  Number of {isHourly ? 'Hours' : 'Days'}
                </label>
                <input
                  type="number"
                  min="1"
                  max={isHourly ? "72" : "30"}
                  value={borrowDuration}
                  onChange={(e) => setBorrowDuration(e.target.value)}
                  className="form-input"
                  required
                />
                <small className="form-hint">Maximum {isHourly ? '72 hours' : '30 days'}</small>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell the owner why you need this item and when you'll return it..."
                  className="form-textarea"
                  rows="4"
                />
                <small className="form-hint">A friendly message increases your chances!</small>
              </div>

              <div className="borrow-summary">
                <div className="summary-item">
                  <span className="summary-label">Item:</span>
                  <span className="summary-value">{item.title}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Duration:</span>
                  <span className="summary-value">{borrowDuration} {durationUnit}</span>
                </div>
                {item.pricePerDay > 0 && (
                  <div className="summary-item">
                    <span className="summary-label">Total Cost:</span>
                    <span className="summary-value">₹{(item.pricePerDay * borrowDuration).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className={`btn btn-primary ${loading ? 'loading' : ''}`}
                >
                  {loading ? 'Sending Request...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default BorrowButton;