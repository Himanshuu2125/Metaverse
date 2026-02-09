import React from 'react';

export default function FriendsPanel({ friends, otherPlayers, onChat, onCall, onClose }) {
    // Check if friend is online by finding them in otherPlayers
    const isFriendOnline = (friendUid) => {
        return Object.values(otherPlayers).some(player => player.uid === friendUid);
    };

    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '380px',
            maxHeight: '550px',
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
                    <i className="fas fa-user-friends" style={{ marginRight: '10px' }}></i>
                    <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Friends</span>
                    <span style={{
                        marginLeft: '10px',
                        fontSize: '12px',
                        opacity: 0.7
                    }}>
                        ({friends.length})
                    </span>
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

            {/* Friends List */}
            <div style={{
                flex: 1,
                padding: '15px',
                overflowY: 'auto',
                minHeight: '200px',
                maxHeight: '450px'
            }}>
                {friends.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#666',
                        fontStyle: 'italic'
                    }}>
                        <i className="fas fa-user-friends" style={{ fontSize: '40px', marginBottom: '15px', display: 'block' }}></i>
                        No friends yet. Add friends during chat or voice calls!
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {friends.map((friend, index) => {
                            const isOnline = isFriendOnline(friend.uid);
                            return (
                                <div key={index} style={{
                                    background: 'rgba(0, 255, 255, 0.05)',
                                    border: `1px solid ${isOnline ? 'rgba(0, 255, 0, 0.5)' : 'rgba(0, 255, 255, 0.3)'}`,
                                    borderRadius: '10px',
                                    padding: '12px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.3s',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: isOnline ? 'rgba(0, 255, 0, 0.2)' : 'rgba(0, 255, 255, 0.2)',
                                            border: `2px solid ${isOnline ? '#00ff00' : 'cyan'}`,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            position: 'relative'
                                        }}>
                                            <i className="fas fa-user-astronaut" style={{ fontSize: '18px' }}></i>
                                            {/* Online indicator */}
                                            {isOnline && (
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: '0',
                                                    right: '0',
                                                    width: '12px',
                                                    height: '12px',
                                                    background: '#00ff00',
                                                    border: '2px solid rgba(0, 0, 0, 0.95)',
                                                    borderRadius: '50%'
                                                }}></div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontWeight: 'bold',
                                                fontSize: '14px',
                                                color: isOnline ? '#00ff00' : 'cyan'
                                            }}>
                                                {friend.name}
                                            </div>
                                            <div style={{
                                                fontSize: '10px',
                                                opacity: 0.6,
                                                marginTop: '2px'
                                            }}>
                                                {isOnline ? 'Online' : 'Offline'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => onChat(friend.uid, friend.name)}
                                            disabled={!isOnline}
                                            style={{
                                                background: isOnline ? 'rgba(0, 180, 255, 0.2)' : 'rgba(100, 100, 100, 0.2)',
                                                color: isOnline ? '#00b4ff' : '#666',
                                                border: `1px solid ${isOnline ? '#00b4ff' : '#666'}`,
                                                padding: '8px 12px',
                                                borderRadius: '5px',
                                                cursor: isOnline ? 'pointer' : 'not-allowed',
                                                fontSize: '14px',
                                                transition: 'all 0.2s',
                                                opacity: isOnline ? 1 : 0.5
                                            }}
                                            onMouseEnter={(e) => {
                                                if (isOnline) e.target.style.background = 'rgba(0, 180, 255, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (isOnline) e.target.style.background = 'rgba(0, 180, 255, 0.2)';
                                            }}
                                            title={isOnline ? 'Chat with friend' : 'Friend is offline'}
                                        >
                                            <i className="fas fa-comments"></i>
                                        </button>
                                        <button
                                            onClick={() => onCall(friend.uid, friend.name)}
                                            disabled={!isOnline}
                                            style={{
                                                background: isOnline ? 'rgba(0, 255, 100, 0.2)' : 'rgba(100, 100, 100, 0.2)',
                                                color: isOnline ? '#00ff64' : '#666',
                                                border: `1px solid ${isOnline ? '#00ff64' : '#666'}`,
                                                padding: '8px 12px',
                                                borderRadius: '5px',
                                                cursor: isOnline ? 'pointer' : 'not-allowed',
                                                fontSize: '14px',
                                                transition: 'all 0.2s',
                                                opacity: isOnline ? 1 : 0.5
                                            }}
                                            onMouseEnter={(e) => {
                                                if (isOnline) e.target.style.background = 'rgba(0, 255, 100, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (isOnline) e.target.style.background = 'rgba(0, 255, 100, 0.2)';
                                            }}
                                            title={isOnline ? 'Call friend' : 'Friend is offline'}
                                        >
                                            <i className="fas fa-phone-alt"></i>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
