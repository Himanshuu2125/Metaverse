import React, { useState, useEffect, useRef } from 'react';

export default function ChatOverlay({ socket, targetPlayer, onClose, user, isEnded, friends, sentFriendRequests, onSendFriendRequest, isFriendChat = false, chatHistory = [], onSendFriendMessage }) {
    const [messages, setMessages] = useState(isFriendChat ? chatHistory : []);
    const [input, setInput] = useState('');
    const [isVisible, setIsVisible] = useState(true); // For fade-out transition
    const messagesEndRef = useRef(null);

    // Check friendship status
    const isFriend = friends?.some(f => f.uid === targetPlayer?.uid);
    const requestSent = sentFriendRequests?.has(targetPlayer?.uid);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Update messages when chatHistory changes (for friend chat)
    useEffect(() => {
        if (isFriendChat && chatHistory) {
            setMessages(chatHistory);
        }
    }, [chatHistory, isFriendChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isEnded]);

    // Handle isEnded prop
    useEffect(() => {
        if (isEnded) {
            // Disable input or show message
            setInput(''); // Clear input

            // Start fade out after a short delay showing "Chat Ended"
            const timer = setTimeout(() => {
                setIsVisible(false); // Trigger CSS transition
                setTimeout(onClose, 500); // Wait for transition then unmount
            }, 2000); // Show "Chat Ended" for 2s

            return () => clearTimeout(timer);
        }
    }, [isEnded, onClose]);

    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (data) => {
            // data: { senderId, senderName, text, timestamp }
            setMessages(prev => [...prev, { ...data, isMe: false }]);
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [socket]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() || isEnded) return;

        if (isFriendChat) {
            // Friend chat mode - use onSendFriendMessage
            if (onSendFriendMessage) {
                onSendFriendMessage(input.trim());
                // Message will be added to state via socket event
            }
        } else {
            // Regular interaction chat
            if (!socket) return;

            const messageData = {
                targetId: targetPlayer.id,
                text: input,
                senderName: user.displayName || 'You',
                timestamp: Date.now()
            };

            // Emit to server
            socket.emit('send_message', messageData);

            // Add to local state immediately
            setMessages(prev => [...prev, { ...messageData, isMe: true }]);
        }

        setInput('');
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '320px',
            height: '400px',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid cyan',
            boxShadow: '0 0 15px cyan',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 2000,
            fontFamily: "'Courier New', Courier, monospace",
            color: 'cyan',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease'
        }}>
            {/* Header */}
            <div style={{
                padding: '10px',
                background: 'rgba(0, 255, 255, 0.1)',
                borderBottom: '1px solid cyan',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTopLeftRadius: '10px',
                borderTopRightRadius: '10px',
                gap: '10px'
            }}>
                <span style={{ fontWeight: 'bold' }}>Chat with {targetPlayer?.name || 'Unknown'}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => onSendFriendRequest?.(targetPlayer?.uid)}
                        disabled={isEnded || isFriend || requestSent}
                        style={{
                            background: isFriend ? 'rgba(0, 255, 0, 0.2)' : requestSent ? 'rgba(255, 255, 0, 0.2)' : 'rgba(0, 255, 255, 0.2)',
                            color: isFriend ? '#00ff00' : requestSent ? '#ffff00' : 'cyan',
                            border: `1px solid ${isFriend ? '#00ff00' : requestSent ? '#ffff00' : 'cyan'}`,
                            padding: '5px 10px',
                            borderRadius: '5px',
                            cursor: (isEnded || isFriend || requestSent) ? 'default' : 'pointer',
                            fontWeight: 'bold',
                            fontSize: '11px',
                            whiteSpace: 'nowrap'
                        }}
                        title={isFriend ? 'Already friends' : requestSent ? 'Friend request sent' : 'Send friend request'}
                    >
                        <i className={`fas ${isFriend ? 'fa-check' : 'fa-user-plus'}`} style={{ marginRight: '5px' }}></i>
                        {isFriend ? 'Friends' : requestSent ? 'Sent' : 'Add'}
                    </button>
                    <button
                        onClick={() => {
                            if (isFriendChat) {
                                // For friend chat, just close the overlay without ending interaction
                                onClose();
                            } else {
                                // For regular interaction, emit endInteraction
                                if (socket) socket.emit('endInteraction');
                            }
                        }}
                        disabled={isEnded}
                        style={{
                            background: isEnded ? 'gray' : (isFriendChat ? '#555' : 'red'),
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '5px',
                            cursor: isEnded ? 'default' : 'pointer',
                            fontWeight: 'bold',
                            fontSize: '12px'
                        }}
                    >
                        {isFriendChat ? 'Close Chat' : 'End Chat'}
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div style={{
                flex: 1,
                padding: '10px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                {messages.map((msg, index) => {
                    // For friend chat, determine if message is from current user by comparing sender UID
                    const isMyMessage = isFriendChat
                        ? (msg.sender === user?.uid)
                        : msg.isMe;
                    // Get message text (server sends 'message' for friend chat, 'text' for regular)
                    const messageText = msg.message || msg.text;
                    // Get sender name
                    const senderName = isMyMessage ? 'You' : msg.senderName;

                    return (
                        <div key={index} style={{
                            alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            padding: '8px',
                            borderRadius: '8px',
                            background: isMyMessage ? 'rgba(0, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                            border: isMyMessage ? '1px solid cyan' : '1px solid #555',
                        }}>
                            <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '2px' }}>
                                {senderName} • {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </div>
                            <div style={{ wordBreak: 'break-word' }}>
                                {messageText}
                            </div>
                        </div>
                    );
                })}

                {isEnded && (
                    <div style={{
                        alignSelf: 'center',
                        margin: '10px 0',
                        padding: '5px 15px',
                        borderRadius: '15px',
                        background: 'rgba(255, 0, 0, 0.3)',
                        border: '1px solid red',
                        color: '#ffaaaa',
                        fontSize: '12px',
                        fontStyle: 'italic',
                        animation: 'fadeIn 0.5s'
                    }}>
                        Chat Ended
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{
                padding: '10px',
                borderTop: '1px solid cyan',
                display: 'flex',
                gap: '8px',
                opacity: isEnded ? 0.5 : 1,
                pointerEvents: isEnded ? 'none' : 'auto'
            }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isEnded ? "Chat ended..." : "Type a message..."}
                    disabled={isEnded}
                    style={{
                        flex: 1,
                        background: 'rgba(0, 0, 0, 0.5)',
                        border: '1px solid #333',
                        color: 'white',
                        padding: '8px',
                        borderRadius: '5px',
                        outline: 'none'
                    }}
                />
                <button type="submit" disabled={isEnded} style={{
                    background: isEnded ? 'gray' : 'cyan',
                    color: 'black',
                    border: 'none',
                    padding: '8px 15px',
                    borderRadius: '5px',
                    cursor: isEnded ? 'default' : 'pointer',
                    fontWeight: 'bold'
                }}>
                    Send
                </button>
            </form>
        </div>
    );
}
