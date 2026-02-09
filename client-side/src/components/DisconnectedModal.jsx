import React from 'react';
import './DisconnectedModal.css';

const DisconnectedModal = ({ onReload }) => {
    return (
        <div className="disconnected-overlay">
            <div className="modal-content">
                <div className="mb-6">
                    <i className="fas fa-exclamation-triangle text-5xl text-yellow-500 animate-pulse"></i>
                </div>
                <h2 className="modal-title orbitron-font">Disconnected</h2>
                <p className="modal-message">
                    {message || (
                        <>
                            You have been logged in from another location.<br />
                            Please reload to reconnect or sign in again.
                        </>
                    )}
                </p>
                <button onClick={onReload} className="btn-reload orbitron-font">
                    <i className="fas fa-sync-alt mr-2"></i> Reload
                </button>
            </div>
        </div>
    );
};

export default DisconnectedModal;
