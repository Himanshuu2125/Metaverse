import React, { useState, useEffect } from 'react';
import './SettingsPanel.css';

const SettingsPanel = ({ isOpen, onClose, user }) => {
    // Initialize sensitivity from localStorage or default to 1.0 (standard sensitivity)
    const [sensitivity, setSensitivity] = useState(() => {
        const saved = localStorage.getItem('mouseSensitivity');
        return saved ? parseFloat(saved) : 1.0;
    });

    // Save sensitivity when it changes
    const handleSensitivityChange = (e) => {
        const newValue = parseFloat(e.target.value);
        setSensitivity(newValue);
        localStorage.setItem('mouseSensitivity', newValue);

        // Dispatch custom event if other components need to react immediately
        window.dispatchEvent(new CustomEvent('sensitivityChanged', { detail: newValue }));
    };

    if (!isOpen) return null;

    return (
        <div className={`settings-overlay ${isOpen ? 'open' : ''}`} onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className="settings-panel">
                <button className="close-btn" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>

                <div className="settings-header">
                    <h2>Settings</h2>
                </div>

                {/* Profile Section */}
                <div className="settings-section">
                    <div className="section-title">
                        <i className="fas fa-user-circle"></i>
                        Profile Details
                    </div>
                    <div className="profile-card">
                        <div className="profile-avatar">
                            {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                        </div>
                        <div className="profile-details">
                            <h3>{user?.displayName || 'User'}</h3>
                            <p>{user?.email || 'No email linked'}</p>
                            <p style={{ fontSize: '0.8rem', marginTop: '5px', color: '#666' }}>
                                Member since: {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="settings-section">
                    <div className="section-title">
                        <i className="fas fa-gamepad"></i>
                        Controls
                    </div>
                    <div className="control-group">
                        <div className="control-header">
                            <span className="control-label">Mouse Sensitivity</span>
                            <span className="control-value">{sensitivity.toFixed(1)}x</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="2.0"
                            step="0.1"
                            value={sensitivity}
                            onChange={handleSensitivityChange}
                            className="range-slider"
                        />
                    </div>
                </div>

                <div className="settings-footer">
                    Metaverse Client v1.0.0
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
