import React from 'react';

export default function FriendRequestsPanel({ friendRequests, onAccept, onDecline, onClose }) {
    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '350px',
            maxHeight: '500px',
            background: 'rgba(0, 0, 0, 0.95)',
            border: '2px solid cyan',
            boxShadow: '0 0 20px cyan',
            borderRadius: '15px',
            zIndex: 3000,
            fontFamily: 'monospace',
            color: 'cyan',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                padding: '15px',
                background: 'rgba(0, 255, 255, 0.1)',
                borderBottom: '1px solid cyan',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTopLeftRadius: '13px',
                borderTopRightRadius: '13px'
            }}>
                <div>
                    <i className="fas fa-user-plus" style={{ marginRight: '10px' }}></i>
                    <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Friend Requests</span>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        color: 'cyan',
                        border: '1px solid cyan',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>

            {/* Requests List */}
            <div style={{
                flex: 1,
                padding: '15px',
                overflowY: 'auto',
                minHeight: '200px',
                maxHeight: '400px'
            }}>
                {friendRequests.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#666',
                        fontStyle: 'italic'
                    }}>
                        <i className="fas fa-inbox" style={{ fontSize: '40px', marginBottom: '15px', display: 'block' }}></i>
                        No pending friend requests
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {friendRequests.map((request, index) => (
                            <div key={index} style={{
                                background: 'rgba(0, 255, 255, 0.05)',
                                border: '1px solid rgba(0, 255, 255, 0.3)',
                                borderRadius: '10px',
                                padding: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.3s',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '35px',
                                        height: '35px',
                                        borderRadius: '50%',
                                        background: 'rgba(0, 255, 255, 0.2)',
                                        border: '2px solid cyan',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <i className="fas fa-user-astronaut" style={{ fontSize: '16px' }}></i>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                                            {request.fromName}
                                        </div>
                                        <div style={{ fontSize: '10px', opacity: 0.6 }}>
                                            wants to be your friend
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => onAccept(request.fromUid)}
                                        style={{
                                            background: 'rgba(0, 255, 0, 0.2)',
                                            color: '#00ff00',
                                            border: '1px solid #00ff00',
                                            padding: '6px 12px',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'rgba(0, 255, 0, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'rgba(0, 255, 0, 0.2)';
                                        }}
                                    >
                                        <i className="fas fa-check"></i>
                                    </button>
                                    <button
                                        onClick={() => onDecline(request.fromUid)}
                                        style={{
                                            background: 'rgba(255, 0, 0, 0.2)',
                                            color: '#ff6666',
                                            border: '1px solid #ff6666',
                                            padding: '6px 12px',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'rgba(255, 0, 0, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'rgba(255, 0, 0, 0.2)';
                                        }}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
