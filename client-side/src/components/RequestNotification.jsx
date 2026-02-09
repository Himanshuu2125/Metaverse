import React from 'react';
import './RequestNotification.css';

const RequestNotification = ({ request, onAccept, onDecline }) => {
    // request object: { requesterId, requesterName, type: 'chat' | 'call' }
    if (!request) return null;

    const { requesterName, type } = request;
    const actionText = type === 'call' ? 'start a voice call' : 'chat';
    const icon = type === 'call' ? 'fa-phone-alt' : 'fa-comments';

    return (
        <div className="request-notification-container">
            <div className="request-notification">
                <div className="notification-content">
                    <h4 className="notification-title">Incoming Request</h4>
                    <p className="notification-message">
                        <strong>{requesterName}</strong> wants to {actionText} with you.
                    </p>
                </div>
                <div className="notification-actions">
                    <button className="action-btn accept-btn" onClick={onAccept}>
                        <i className={`fas ${icon} mr-2`}></i> Accept
                    </button>
                    <button className="action-btn decline-btn" onClick={onDecline}>
                        <i className="fas fa-times mr-2"></i> Decline
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequestNotification;
