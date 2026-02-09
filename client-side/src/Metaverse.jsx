// Metaverse.jsx
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useLoader } from '@react-three/fiber';
import ActivePlayer from './active_player/ActivePlayer';
import NonPlayers from './non_players/NonPlayers';
import OtherPlayers from './other_players/OtherPlayers';
import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import { useState, useRef, useEffect } from 'react';
import { Vector3, Euler, Quaternion } from 'three';
import SocketManager from './funcs/SocketManager'; // Import the new SocketManager
import SideMenu from './components/SideMenu';
import SettingsPanel from './components/SettingsPanel';

import InteractionMenu from './components/InteractionMenu';
import RequestNotification from './components/RequestNotification';

import ChatOverlay from './components/ChatOverlay';
import CallInterface from './components/CallInterface';
import FriendRequestsPanel from './components/FriendRequestsPanel';
import FriendsPanel from './components/FriendsPanel';

export default function Metaverse({ user, setDisconnected }) {
    // ... existing refs and state
    const isLocked = useRef(false);
    const [keys, setKeys] = useState({
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false,
    });
    // otherPlayers state will now be managed by SocketManager
    const [otherPlayers, setOtherPlayers] = useState({});

    // Interaction State
    const [showInteractionMenu, setShowInteractionMenu] = useState(false);
    const [interactionTarget, setInteractionTarget] = useState(null);
    const [incomingRequest, setIncomingRequest] = useState(null); // { requesterId, requesterName, type }

    // Active Communication State
    const [activeInteraction, setActiveInteraction] = useState(null); // { type: 'chat'|'call', targetId, targetName }
    const [requestStatus, setRequestStatus] = useState(null); // 'waiting', 'declined', 'busy'

    // Friend System State
    const [friends, setFriends] = useState([]); // [{ uid, name }]
    const [friendRequests, setFriendRequests] = useState([]); // [{ fromUid, fromName }]
    const [sentFriendRequests, setSentFriendRequests] = useState(new Set()); // Set of uids
    const [showFriendRequestsPanel, setShowFriendRequestsPanel] = useState(false);
    const [showFriendsPanel, setShowFriendsPanel] = useState(false);
    const [showSettingsPanel, setShowSettingsPanel] = useState(false);

    // Use ref to access latest otherPlayers in event listener without re-binding
    const otherPlayersRef = useRef(otherPlayers);
    useEffect(() => {
        otherPlayersRef.current = otherPlayers;
    }, [otherPlayers]);

    // Use ref to access latest friends in event handlers without stale closure
    const friendsRef = useRef(friends);
    useEffect(() => {
        friendsRef.current = friends;
    }, [friends]);

    // Check local interactable ID state
    const [interactablePlayerId, setInteractablePlayerId] = useState(null);
    const interactablePlayerIdRef = useRef(null);

    // Sync ref for event listener
    useEffect(() => {
        interactablePlayerIdRef.current = interactablePlayerId;
    }, [interactablePlayerId]);

    // Handle E key for interaction
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'KeyE') {
                const targetId = interactablePlayerIdRef.current;


                if (targetId && otherPlayersRef.current[targetId]) {
                    // Prevent opening menu if already interacting
                    if (activeInteraction) {

                        return;
                    }

                    setInteractionTarget({ id: targetId, ...otherPlayersRef.current[targetId] });
                    setShowInteractionMenu(true);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeInteraction]); // Added activeInteraction dependency to ensure latest state

    const socketRef = useRef(null); // Ref to hold socket instance

    // Handlers for callbacks (connected to SocketManager)
    const handleSocketReady = (socket) => {
        socketRef.current = socket;
    };

    const handleInteractionAction = (type, targetId) => {

        if (socketRef.current) {
            socketRef.current.emit('requestInteraction', { targetId, type });
            setRequestStatus('waiting');
            // Auto-clear waiting after 30s
            setTimeout(() => setRequestStatus((prev) => prev === 'waiting' ? null : prev), 30000);
        }
        setShowInteractionMenu(false);
    };

    const handleAcceptRequest = () => {

        if (socketRef.current && incomingRequest) {
            socketRef.current.emit('respondToRequest', { requesterId: incomingRequest.requesterId, accepted: true });
        }
        setIncomingRequest(null);
    };

    const handleDeclineRequest = () => {

        if (socketRef.current && incomingRequest) {
            socketRef.current.emit('respondToRequest', { requesterId: incomingRequest.requesterId, accepted: false });
        }
        setIncomingRequest(null);
    };

    const handleInteractionStarted = ({ withId, type, initiator }) => {
        const targetPlayer = otherPlayersRef.current[withId];
        const targetName = targetPlayer ? targetPlayer.name : 'Unknown';
        const targetUid = targetPlayer?.uid;



        // Check if target is already a friend - if so, use friend chat mode for chat interactions
        const isFriendWithTarget = targetUid && friendsRef.current.some(f => f.uid === targetUid);

        if (type === 'chat' && isFriendWithTarget) {
            // Convert to friend chat mode

            socketRef.current?.emit('openFriendChat', { friendUid: targetUid });
            setActiveInteraction({
                type: 'friendChat',
                targetId: withId,
                targetName,
                friendUid: targetUid,
                initiator,
                messages: []
            });
        } else {
            setActiveInteraction({ type, targetId: withId, targetName, initiator });
        }
        setRequestStatus(null); // Clear any pending status
    };

    const handleInteractionEnded = () => {

        // Mark as ended to trigger UI transition in ChatOverlay
        setActiveInteraction(prev => prev ? { ...prev, isEnded: true } : null);
    };

    //Friend System Handlers
    const handleSendFriendRequest = (targetUid) => {
        if (!socketRef.current || !targetUid) return;

        socketRef.current.emit('sendFriendRequest', { targetUid });
        setSentFriendRequests(prev => new Set([...prev, targetUid]));
    };

    const handleAcceptFriendRequest = (requesterUid) => {
        if (!socketRef.current) return;

        socketRef.current.emit('respondToFriendRequest', { requesterUid, accepted: true });
        setFriendRequests(prev => prev.filter(req => req.fromUid !== requesterUid));
    };

    const handleDeclineFriendRequest = (requesterUid) => {
        if (!socketRef.current) return;

        socketRef.current.emit('respondToFriendRequest', { requesterUid, accepted: false });
        setFriendRequests(prev => prev.filter(req => req.fromUid !== requesterUid));
    };

    const handleFriendsList = (friendsList) => {

        setFriends(friendsList);
    };

    const handleFriendRequestsList = (requests) => {

        setFriendRequests(requests);
    };

    const handleFriendRequestReceived = (request) => {

        setFriendRequests(prev => {
            // Check if request already exists
            if (prev.some(r => r.fromUid === request.fromUid)) return prev;
            return [...prev, request];
        });
    };

    const handleFriendRequestSent = (targetUid) => {

        setSentFriendRequests(prev => new Set([...prev, targetUid]));
    };

    const handleFriendAdded = (friend) => {

        // Add to friends list
        setFriends(prev => {
            if (prev.some(f => f.uid === friend.uid)) return prev;
            return [...prev, friend];
        });
        // Remove from sent requests
        setSentFriendRequests(prev => {
            const newSet = new Set(prev);
            newSet.delete(friend.uid);
            return newSet;
        });
        // Remove from pending requests if exists
        setFriendRequests(prev => prev.filter(req => req.fromUid !== friend.uid));
    };

    const handleAlreadyFriends = (uid) => {

        // Remove from sent requests if it was there
        setSentFriendRequests(prev => {
            const newSet = new Set(prev);
            newSet.delete(uid);
            return newSet;
        });
    };

    // Handlers for initiating chat/call with friends
    const handleChatWithFriend = (friendUid, friendName) => {
        // Find friend's socket ID from otherPlayers (use ref to avoid stale closure)
        const currentOtherPlayers = otherPlayersRef.current;
        const friendSocketId = Object.keys(currentOtherPlayers).find(
            socketId => currentOtherPlayers[socketId].uid === friendUid
        );



        // Directly open friend chat (no request needed)
        if (socketRef.current) {
            socketRef.current.emit('openFriendChat', { friendUid });
        }

        // Set active friend chat state
        setActiveInteraction({
            type: 'friendChat',
            targetId: friendSocketId || friendUid, // Use UID if offline
            targetName: friendName,
            friendUid: friendUid,
            messages: [] // Will be populated by socket event
        });

        setShowFriendsPanel(false); // Close panel
    };

    const handleCallWithFriend = (friendUid, friendName) => {
        // Find friend's socket ID from otherPlayers (use ref to avoid stale closure)
        const currentOtherPlayers = otherPlayersRef.current;
        const friendSocketId = Object.keys(currentOtherPlayers).find(
            socketId => currentOtherPlayers[socketId].uid === friendUid
        );

        if (!friendSocketId) {

            setRequestStatus('offline');
            setTimeout(() => setRequestStatus(null), 3000);
            return;
        }


        if (socketRef.current) {
            socketRef.current.emit('requestInteraction', {
                targetId: friendSocketId,
                type: 'call'
            });
            setRequestStatus('waiting');
        }
        setShowFriendsPanel(false); // Close panel
    };

    // Friend Chat Handlers
    const handleFriendChatOpened = (data) => {

        // Update active interaction with chat history
        setActiveInteraction(prev => {
            if (prev?.friendUid === data.friendUid) {
                return { ...prev, messages: data.messages || [] };
            }
            return prev;
        });
    };

    const handleFriendMessageReceived = (messageData) => {

        // Append message to active chat
        setActiveInteraction(prev => {
            if (prev?.type === 'friendChat' && prev?.friendUid) {
                const myUid = user?.uid;
                // Message is for this active chat if it's from the friend OR from me (sent to this friend)
                if (messageData.sender === prev.friendUid || messageData.sender === myUid) {
                    return {
                        ...prev,
                        messages: [...(prev.messages || []), messageData]
                    };
                }
            }
            return prev;
        });
    };

    const handleSendFriendMessage = (message) => {
        if (!socketRef.current || !activeInteraction?.friendUid) return;


        socketRef.current.emit('sendFriendMessage', {
            friendUid: activeInteraction.friendUid,
            message: message
        });
    };


    const basePlayerMesh = useLoader(GLTFLoader, '/player.glb').scene;
    // activeplayerMeshGLTF will be managed by ActivePlayer itself, if needed for local rendering
    const activeplayerMeshGLTF = useRef(basePlayerMesh.clone());

    const activePlayerRef = useRef();
    const orbiterRef = useRef();
    const isGrounded = useRef(true);
    const velocity = useRef(new Vector3(0, 0, 0));
    const gravity = 0.01;
    const jumpForce = 0.18;
    const moveSpeed = 0.15;

    return (
        <>
            <SideMenu
                friendRequests={friendRequests}
                friends={friends}
                onToggleFriendRequests={() => setShowFriendRequestsPanel(!showFriendRequestsPanel)}
                onToggleFriends={() => setShowFriendsPanel(!showFriendsPanel)}
                onToggleSettings={() => setShowSettingsPanel(true)}
            />

            <SettingsPanel
                isOpen={showSettingsPanel}
                onClose={() => setShowSettingsPanel(false)}
                user={user}
            />

            {/* Request Status UI */}
            {requestStatus && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0, 0, 0, 0.7)',
                    padding: '10px 20px',
                    borderRadius: '20px',
                    color: 'white',
                    zIndex: 3000,
                    border: '1px solid cyan',
                    fontFamily: 'monospace'
                }}>
                    {requestStatus === 'waiting' && "Request Sent... Waiting for response"}
                    {requestStatus === 'declined' && "Request Declined"}
                    {requestStatus === 'busy' && "Player is Busy"}
                    {requestStatus === 'offline' && "Friend is not online"}
                </div>
            )}

            {/* Friends Panel */}
            {showFriendsPanel && (
                <FriendsPanel
                    friends={friends}
                    otherPlayers={otherPlayers}
                    onChat={handleChatWithFriend}
                    onCall={handleCallWithFriend}
                    onClose={() => setShowFriendsPanel(false)}
                />
            )}

            {/* Friend Requests Panel */}
            {showFriendRequestsPanel && (
                <FriendRequestsPanel
                    friendRequests={friendRequests}
                    onAccept={handleAcceptFriendRequest}
                    onDecline={handleDeclineFriendRequest}
                    onClose={() => setShowFriendRequestsPanel(false)}
                />
            )}

            {/* Communication Overlays */}
            {activeInteraction?.type === 'chat' && (
                <ChatOverlay
                    socket={socketRef.current}
                    targetPlayer={{ id: activeInteraction.targetId, name: activeInteraction.targetName, uid: otherPlayers[activeInteraction.targetId]?.uid }}
                    user={user}
                    isEnded={activeInteraction.isEnded}
                    onClose={() => setActiveInteraction(null)}
                    friends={friends}
                    sentFriendRequests={sentFriendRequests}
                    onSendFriendRequest={handleSendFriendRequest}
                />
            )}

            {/* Friend Chat Overlay */}
            {activeInteraction?.type === 'friendChat' && (
                <ChatOverlay
                    socket={socketRef.current}
                    targetPlayer={{ id: activeInteraction.targetId, name: activeInteraction.targetName, uid: activeInteraction.friendUid }}
                    user={user}
                    isEnded={false}
                    onClose={() => setActiveInteraction(null)}
                    isFriendChat={true}
                    chatHistory={activeInteraction.messages || []}
                    onSendFriendMessage={handleSendFriendMessage}
                    friends={friends}
                    sentFriendRequests={sentFriendRequests}
                    onSendFriendRequest={handleSendFriendRequest}
                />
            )}

            {activeInteraction?.type === 'call' && (
                <CallInterface
                    socket={socketRef.current}
                    targetPlayer={{ id: activeInteraction.targetId, name: activeInteraction.targetName, uid: otherPlayers[activeInteraction.targetId]?.uid }}
                    user={user}
                    isEnded={activeInteraction.isEnded}
                    isInitiator={activeInteraction.initiator}
                    onClose={() => setActiveInteraction(null)}
                    friends={friends}
                    sentFriendRequests={sentFriendRequests}
                    onSendFriendRequest={handleSendFriendRequest}
                />
            )}

            {showInteractionMenu && (
                <InteractionMenu
                    targetPlayer={interactionTarget}
                    onClose={() => setShowInteractionMenu(false)}
                    onAction={handleInteractionAction}
                />
            )}
            {incomingRequest && (
                <RequestNotification
                    request={incomingRequest}
                    onAccept={handleAcceptRequest}
                    onDecline={handleDeclineRequest}
                />
            )}
            <Canvas
                style={{ height: '100vh', width: '100vw', background: '#87CEEB' }}
                camera={{ position: [0, 0, 0], fov: 75 }}
            >
                <SocketManager
                    user={user}
                    setDisconnected={setDisconnected}
                    activePlayerRef={activePlayerRef}
                    orbiterRef={orbiterRef}
                    setOtherPlayers={setOtherPlayers}
                    otherPlayers={otherPlayers}
                    basePlayerMesh={basePlayerMesh}
                    setIncomingRequest={setIncomingRequest}
                    onSocketReady={handleSocketReady}
                    onInteractionStarted={handleInteractionStarted}
                    onInteractionEnded={handleInteractionEnded}
                    setRequestStatus={setRequestStatus}
                    onFriendsList={handleFriendsList}
                    onFriendRequestsList={handleFriendRequestsList}
                    onFriendRequestReceived={handleFriendRequestReceived}
                    onFriendRequestSent={handleFriendRequestSent}
                    onFriendAdded={handleFriendAdded}
                    onFriendRequestAccepted={handleFriendAdded}
                    onAlreadyFriends={handleAlreadyFriends}
                    onFriendChatOpened={handleFriendChatOpened}
                    onFriendMessageReceived={handleFriendMessageReceived}
                    onFriendChatHistory={handleFriendChatOpened}
                />

                <ActivePlayer
                    activePlayerRef={activePlayerRef}
                    gravity={gravity}
                    isLocked={isLocked}
                    gltf={activeplayerMeshGLTF}
                    orbiterRef={orbiterRef}
                    keys={keys}
                    setKeys={setKeys}
                    isGrounded={isGrounded}
                    velocity={velocity}
                    jumpForce={jumpForce}
                    moveSpeed={moveSpeed}
                    setOtherPlayers={setOtherPlayers}
                    otherPlayers={otherPlayers}
                    setInteractablePlayerId={setInteractablePlayerId}
                />
                {/* OtherPlayers no longer needs basePlayerMesh prop directly */}
                <OtherPlayers
                    otherPlayers={otherPlayers}
                    interactablePlayerId={interactablePlayerId}
                />
                <NonPlayers />
                <Stats />
            </Canvas>
        </>
    );
}
