import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bankDetails: {
      upiId: user?.bankDetails?.upiId || '',
      accountNumber: user?.bankDetails?.accountNumber || '',
      ifscCode: user?.bankDetails?.ifscCode || '',
      bankName: user?.bankDetails?.bankName || ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBankChange = (e) => {
    setFormData({
      ...formData,
      bankDetails: {
        ...formData.bankDetails,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const res = await updateProfile(formData);
    if (res.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setMessage({ type: 'error', text: res.message });
    }
    setLoading(false);
  };

  if (!user) return <div className="container py-5">Please login to view your profile.</div>;

  const getUserInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  return (
    <div className="container profile-container py-5">
      <div className="max-w-900 mx-auto">
        <div className="profile-header-card">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-large">
              {getUserInitials(user.name)}
            </div>
          </div>
          <div className="profile-header-info">
            <h1>{user.name}</h1>
            <div className="member-since">Member since {new Date(user.createdAt).getFullYear()}</div>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-sidebar">
            <div className="stats-card">
              <h3 className="mb-3" style={{fontSize: '1.2rem'}}>Account Stats</h3>
              <div className="stat-item">
                <div className="stat-val">{user.communities?.length || 0}</div>
                <div className="stat-lab">Communities Joined</div>
              </div>
              <hr style={{margin: '15px 0', opacity: 0.1}} />
              <div className="stat-item">
                <div className="stat-val">Active</div>
                <div className="stat-lab">Account Status</div>
              </div>
            </div>

            <div className="card text-center p-4">
              <p className="text-secondary small mb-0">Your profile is visible only to members of your communities.</p>
            </div>
          </div>

          <div className="profile-main-content">
            <div className="section-head">
              <h2 className="mb-0" style={{fontSize: '1.75rem'}}>Personal Information</h2>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="btn btn-outline btn-sm">
                  Edit Details
                </button>
              )}
            </div>

            {message.text && (
              <div className={`${message.type}-message mb-4`}>
                {message.text}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address (Read-only)</label>
                  <input
                    type="email"
                    className="form-input"
                    value={user.email}
                    disabled
                    style={{backgroundColor: '#f8f9fa', cursor: 'not-allowed'}}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-input"
                    placeholder="e.g., +1 234 567 890"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea
                    name="address"
                    className="form-input"
                    rows="4"
                    placeholder="Enter your full address..."
                    value={formData.address}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="section-head mt-4">
                  <h3 className="mb-3" style={{fontSize: '1.4rem'}}>Bank & Payment Details</h3>
                </div>

                <div className="form-group">
                  <label className="form-label">UPI ID</label>
                  <input
                    type="text"
                    name="upiId"
                    className="form-input"
                    placeholder="e.g., yourname@bank"
                    value={formData.bankDetails?.upiId}
                    onChange={handleBankChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    className="form-input"
                    placeholder="e.g., State Bank of India"
                    value={formData.bankDetails?.bankName}
                    onChange={handleBankChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Account Number</label>
                  <input
                    type="password"
                    name="accountNumber"
                    className="form-input"
                    placeholder="Enter account number"
                    value={formData.bankDetails?.accountNumber}
                    onChange={handleBankChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">IFSC Code</label>
                  <input
                    type="text"
                    name="ifscCode"
                    className="form-input"
                    placeholder="e.g., SBIN0001234"
                    value={formData.bankDetails?.ifscCode}
                    onChange={handleBankChange}
                  />
                </div>
                <div className="d-flex gap-3 mt-5">
                  <button type="submit" className="btn btn-primary" disabled={loading} style={{minWidth: '150px'}}>
                    {loading ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user.name,
                        phone: user.phone || '',
                        address: user.address || '',
                        bankDetails: {
                          upiId: user?.bankDetails?.upiId || '',
                          accountNumber: user?.bankDetails?.accountNumber || '',
                          ifscCode: user?.bankDetails?.ifscCode || '',
                          bankName: user?.bankDetails?.bankName || ''
                        }
                      });
                    }} 
                    className="btn btn-outline"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-data">
                <div className="profile-field">
                  <div className="field-label">
                    <span className="field-icon">👤</span> FULL NAME
                  </div>
                  <div className="field-value">{user.name}</div>
                </div>

                <div className="profile-field">
                  <div className="field-label">
                    <span className="field-icon">📧</span> EMAIL ADDRESS
                  </div>
                  <div className="field-value">{user.email}</div>
                </div>

                <div className="profile-field">
                  <div className="field-label">
                    <span className="field-icon">📱</span> MOBILE NUMBER
                  </div>
                  <div className="field-value">
                    {user.phone || <span className="empty">Not provided yet</span>}
                  </div>
                </div>

                <div className="profile-field">
                  <div className="field-label">
                    <span className="field-icon">📍</span> FULL ADDRESS
                  </div>
                  <div className="field-value" style={{whiteSpace: 'pre-wrap'}}>
                    {user.address || <span className="empty">Not provided yet</span>}
                  </div>
                </div>

                <div className="section-head mt-4">
                  <h3 className="mb-3" style={{fontSize: '1.4rem'}}>Bank & Payment Details</h3>
                </div>

                <div className="profile-field">
                  <div className="field-label">
                    <span className="field-icon">💳</span> UPI ID
                  </div>
                  <div className="field-value">
                    {user.bankDetails?.upiId || <span className="empty">Not provided yet</span>}
                  </div>
                </div>

                <div className="profile-field">
                  <div className="field-label">
                    <span className="field-icon">🏦</span> BANK DETAILS
                  </div>
                  <div className="field-value">
                    {user.bankDetails?.bankName ? (
                      <>
                        <div><strong>Bank:</strong> {user.bankDetails.bankName}</div>
                        <div><strong>IFSC:</strong> {user.bankDetails.ifscCode}</div>
                        <div><strong>A/C:</strong> {user.bankDetails.accountNumber ? '••••' + user.bankDetails.accountNumber.slice(-4) : ''}</div>
                      </>
                    ) : (
                      <span className="empty">Not provided yet</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
