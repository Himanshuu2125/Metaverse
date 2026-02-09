import React from 'react';
import './InteractionMenu.css';

const InteractionMenu = ({ targetPlayer, onClose, onAction }) => {
    if (!targetPlayer) return null;

    return (
        <div className="interaction-menu-overlay">
            <div className="interaction-menu">
                <div className="interaction-header">
                    <h3>Interact with</h3>
                    <p>{targetPlayer.name || 'Unknown Player'}</p>
                </div>

                <div className="interaction-options">
                    <button
                        className="interaction-btn"
                        onClick={() => onAction('chat', targetPlayer.id)}
                    >
                        <i className="fas fa-comments"></i>
                        Remote Chat
                    </button>

                    <button
                        className="interaction-btn"
                        onClick={() => onAction('call', targetPlayer.id)}
                    >
                        <i className="fas fa-phone-alt"></i>
                        Voice Call
                    </button>

                    <button
                        className="interaction-btn cancel-btn"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InteractionMenu;
