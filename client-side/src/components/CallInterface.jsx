import React, { useState, useEffect, useRef } from 'react';

// Using functional component with standard WebRTC API
const CallInterface = ({ socket, targetPlayer, onClose, user, isEnded, isInitiator, friends, sentFriendRequests, onSendFriendRequest }) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [status, setStatus] = useState('Connecting...');
    const [isVisible, setIsVisible] = useState(true);
    const [duration, setDuration] = useState(0);

    const peerConnection = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    // Check friendship status
    const isFriend = friends?.some(f => f.uid === targetPlayer?.uid);
    const requestSent = sentFriendRequests?.has(targetPlayer?.uid);

    // Strict Sequential Signal Processing Queue
    const signalQueue = useRef([]);
    const isProcessing = useRef(false);
    const isMediaReady = useRef(false);

    // Configuration for ICE servers (STUN)
    const pcConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
        ]
    };

    useEffect(() => {
        if (!socket) return;

        let pc = new RTCPeerConnection(pcConfig);
        peerConnection.current = pc;
        let isEffectMounted = true;

        pc.onicecandidate = (event) => {
            if (event.candidate && isEffectMounted) {
                socket.emit('signal', {
                    targetId: targetPlayer.id,
                    signal: { type: 'candidate', candidate: event.candidate }
                });
            }
        };

        pc.ontrack = (event) => {
            console.log('[WEBRTC] Received remote track');
            if (isEffectMounted) {
                setRemoteStream(event.streams[0]);
                setStatus('Connected');
            }
        };

        pc.onconnectionstatechange = () => {
            console.log('[WEBRTC] Connection State:', pc.connectionState);
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'closed') {
                if (isEffectMounted && status === 'Connected') setStatus('Disconnected');
            }
        };


        // Function to process a single signal (must be awaited)
        const processSignal = async (signal) => {
            try {
                if (pc.signalingState === 'closed') return;

                if (signal.type === 'offer') {
                    console.log('[WEBRTC] Processing Offer');
                    // Check if we are ready for an offer or if we already have one (collision?)
                    // Simplified: just set remote
                    await pc.setRemoteDescription(new RTCSessionDescription(signal));

                    if (pc.signalingState !== 'closed') {
                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);

                        socket.emit('signal', {
                            targetId: targetPlayer.id,
                            signal: { type: 'answer', sdp: answer.sdp }
                        });
                    }
                } else if (signal.type === 'answer') {
                    console.log('[WEBRTC] Processing Answer');
                    await pc.setRemoteDescription(new RTCSessionDescription(signal));
                } else if (signal.type === 'candidate') {
                    // console.log('[WEBRTC] Processing Candidate');
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
                    } catch (e) {
                        console.error("Error adding ice candidate:", e);
                    }
                }
            } catch (err) {
                console.error('[WEBRTC] Signaling error during processing:', err);
                // Do not update status to error immediately, maybe retry or just log
            }
        };

        // Queue Processor Loop
        const processQueue = async () => {
            if (isProcessing.current) return;
            isProcessing.current = true;

            while (signalQueue.current.length > 0) {
                const signal = signalQueue.current.shift();
                await processSignal(signal);
            }

            isProcessing.current = false;
        };

        // Handle incoming signal event
        const handleSignal = ({ senderId, signal }) => {
            if (senderId !== targetPlayer.id || !isEffectMounted) return;

            // Always add to queue to maintain order
            signalQueue.current.push(signal);

            // Only start processing if media is ready
            if (isMediaReady.current) {
                processQueue();
            } else {
                console.log('[WEBRTC] Queued signal (media not ready):', signal.type);
            }
        };

        socket.on('signal', handleSignal);

        // Get User Media
        const startCall = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

                if (!isEffectMounted) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }

                setLocalStream(stream);
                if (status === 'Connecting...') setStatus('Calling...');

                // Add tracks safely
                if (pc.signalingState !== 'closed') {
                    stream.getTracks().forEach(track => {
                        try {
                            pc.addTrack(track, stream);
                        } catch (e) {
                            console.error("Error adding track:", e);
                        }
                    });

                    // Mark as ready
                    isMediaReady.current = true;

                    // Start processing queue (for incoming Offer/Answer/Candidates)
                    processQueue();

                    if (isInitiator) {
                        console.log('[WEBRTC] Creating offer (Initiator)');
                        try {
                            const offer = await pc.createOffer();
                            if (pc.signalingState !== 'closed') {
                                await pc.setLocalDescription(offer);
                                socket.emit('signal', {
                                    targetId: targetPlayer.id,
                                    signal: { type: 'offer', sdp: offer.sdp }
                                });
                            }
                        } catch (offerErr) {
                            console.error("Error creating offer:", offerErr);
                        }
                    }
                } else {
                    stream.getTracks().forEach(track => track.stop());
                }

            } catch (err) {
                console.error('[WEBRTC] Media error:', err);
                if (isEffectMounted) setStatus('Microphone access denied');
            }
        };

        startCall();

        return () => {
            isEffectMounted = false;
            socket.off('signal', handleSignal);
            if (peerConnection.current) {
                peerConnection.current.close();
            }
            // Cleanup media is handled by separate effect
        };
    }, []); // Run once on mount

    // Cleanup local stream when component unmounts
    useEffect(() => {
        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [localStream]);

    // Attach remote stream to audio element
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;

            // Explicit play call and handle promise
            const playPromise = remoteVideoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Audio play failed:", error);
                    // Add User Interaction Handler if needed (though usually fine in call flow)
                });
            }
        }
    }, [remoteStream]);


    // Timer logic
    useEffect(() => {
        let interval;
        if (status === 'Connected') {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status]);

    // Handle isEnded prop locally for transition
    useEffect(() => {
        if (isEnded) {
            setStatus('Call Ended');
            const timer = setTimeout(() => {
                setIsVisible(false); // Trigger CSS transition
                setTimeout(onClose, 500); // Wait for transition then unmount
            }, 2000); // Show "Call Ended" for 2s

            if (peerConnection.current) {
                peerConnection.current.close();
            }
            // Stop local stream immediately
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }

            return () => clearTimeout(timer);
        }
    }, [isEnded, onClose, localStream]);

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const handleEndCall = () => {
        if (socket) socket.emit('endInteraction');
        // Let server event trigger isEnded and closure
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '250px',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid cyan',
            boxShadow: '0 0 15px cyan',
            borderRadius: '15px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px',
            zIndex: 2000,
            color: 'cyan',
            fontFamily: 'monospace',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease'
        }}>
            {/* Hidden Audio Element */}
            <audio ref={remoteVideoRef} autoPlay playsInline />

            <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: status === 'Connected' ? 'rgba(0, 255, 255, 0.2)' : 'rgba(255, 0, 0, 0.2)',
                border: '2px solid cyan',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                animation: status === 'Connected' ? 'pulse 2s infinite' : 'none'
            }}>
                <i className="fas fa-user-astronaut" style={{ fontSize: '30px' }}></i>
            </div>

            <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 5px 0' }}>{targetPlayer?.name || 'Unknown'}</h3>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>
                    {status === 'Connected' ? formatTime(duration) : status}
                </span>
            </div>

            {/* Friend Request Button */}
            <button
                onClick={() => onSendFriendRequest?.(targetPlayer?.uid)}
                disabled={isEnded || isFriend || requestSent}
                style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: `1px solid ${isFriend ? '#00ff00' : requestSent ? '#ffff00' : 'cyan'}`,
                    background: isFriend ? 'rgba(0, 255, 0, 0.2)' : requestSent ? 'rgba(255, 255, 0, 0.2)' : 'rgba(0, 255, 255, 0.1)',
                    color: isFriend ? '#00ff00' : requestSent ? '#ffff00' : 'cyan',
                    cursor: (isEnded || isFriend || requestSent) ? 'default' : 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s'
                }}
                title={isFriend ? 'You are friends' : requestSent ? 'Friend request sent' : 'Send friend request'}
            >
                <i className={`fas ${isFriend ? 'fa-check' : 'fa-user-plus'}`} style={{ marginRight: '5px' }}></i>
                {isFriend ? 'Friend' : requestSent ? 'Request Sent' : 'Add Friend'}
            </button>

            <div style={{ display: 'flex', gap: '15px' }}>
                <button
                    onClick={toggleMute}
                    disabled={isEnded}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: 'none',
                        background: isMuted ? 'red' : 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        cursor: isEnded ? 'default' : 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        transition: 'background 0.3s'
                    }}
                >
                    <i className={`fas fa-microphone${isMuted ? '-slash' : ''}`}></i>
                </button>

                <button
                    onClick={handleEndCall}
                    disabled={isEnded}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: 'none',
                        background: isEnded ? 'gray' : 'red',
                        color: 'white',
                        cursor: isEnded ? 'default' : 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        transition: 'transform 0.2s'
                    }}
                >
                    <i className="fas fa-phone-slash"></i>
                </button>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(0, 255, 255, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(0, 255, 255, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(0, 255, 255, 0); }
                }
            `}</style>
        </div>
    );
};

export default CallInterface;
