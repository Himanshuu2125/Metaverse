// Updated SocketManager.jsx
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Quaternion } from 'three';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || (import.meta.env.MODE === 'production' ? window.location.origin : 'http://localhost:3000');

export default function SocketManager({
  user,
  setDisconnected,
  activePlayerRef,
  orbiterRef, // Added prop
  setOtherPlayers,
  otherPlayers,
  basePlayerMesh,
  setIncomingRequest,
  onSocketReady,
  onInteractionStarted,
  onInteractionEnded,
  setRequestStatus,
  // Friend system callbacks
  onFriendsList,
  onFriendRequestsList,
  onFriendRequestReceived,
  onFriendRequestSent,
  onFriendAdded,
  onFriendRequestAccepted,
  onAlreadyFriends,
  // Friend chat callbacks
  onFriendChatOpened,
  onFriendMessageReceived,
  onFriendChatHistory
}) {
  const socket = useRef(null);
  const lastPlayerStateSent = useRef({});
  const { camera } = useThree(); // Access camera for teleport

  useEffect(() => {
    const initSocket = async () => {
      // ... (auth logic)
      let token = null;
      if (user) {
        try {
          token = await user.getIdToken();
        } catch (e) {
          console.error("Error getting token:", e);
        }
      }

      socket.current = io(SERVER_URL, {
        auth: { token }
      });

      socket.current.on('connect', () => {
        console.log('Connected to server:', socket.current.id);
        if (onSocketReady) onSocketReady(socket.current);
      });

      // Handle initial position from server (Persistence Check)
      socket.current.on('initialPosition', (posData) => {
        console.log('[CLIENT] Received initial position:', posData.coords);
        if (activePlayerRef?.current && orbiterRef?.current && camera) {
          const { x, y, z } = posData.coords;

          // 1. Update Player Mesh
          activePlayerRef.current.position.set(x, y, z);

          // 2. Update Orbiter (starts slightly higher)
          // Default offset in ActivePlayer was 0.6 higher (1.6 vs 1.0)?
          // Let's assume Orbiter follows player (handled by movement script frame-by-frame),
          // but for teleport we must set it.
          // ActivePlayerMovement adds delta to both.
          // If we hard set player to X, we should hard set orbiter to X + offset.
          // In ActivePlayer.jsx: orbiter default (0, 1.6, 0), player default usually (0, 0, 0) or (0, 1, 0) if grounded.
          // Let's respect the received Y but ensure we don't clip floor.

          orbiterRef.current.position.set(x, y + 0.6, z); // Approx offset

          // 3. Update Camera
          // Camera is relative to Orbiter usually? No, ActivePlayerMovement adds delta to camera.position.
          // This implies Camera is detached or loosely coupled.
          // We should teleport camera to be behind the player.
          // A simple strategy: maintain current relative offset?
          // Or just snap to behind player.
          camera.position.set(x, y + 2, z + 5); // Basic reset
          camera.lookAt(x, y, z);
        }
      });

      // ... (disconnect logic)
      socket.current.on('disconnect', (reason) => {
        console.log(`[CLIENT] Disconnected: ${reason}`);
        if (reason === 'io server disconnect') {
          if (setDisconnected) {
            setDisconnected(true);
          } else {
            window.location.reload();
          }
        }
      });

      // Server Full handler
      socket.current.on('serverFull', ({ message }) => {
        console.warn('[CLIENT] connection denied:', message);
        if (setDisconnected) setDisconnected(message);
      });

      // Rate limit exceeded handler
      socket.current.on('rateLimitExceeded', ({ event, message }) => {
        console.warn(`[RATE_LIMIT] ${message || 'You are doing that too fast. Please slow down.'}`);
        // The message will appear in console - could be extended to show toast in UI
      });

      // Connection error handler
      socket.current.on('connect_error', (error) => {
        console.error('[CLIENT] Connection error:', error.message);
        // Could show a toast notification here if needed
      });

      // Interaction Events
      socket.current.on('incomingRequest', (request) => {
        console.log('[CLIENT] Incoming request:', request);
        if (setIncomingRequest) setIncomingRequest(request);
      });

      socket.current.on('interactionStarted', ({ withId, type, initiator }) => {
        console.log(`[CLIENT] Interaction started with ${withId} (${type}), initiator: ${initiator}`);

        if (onInteractionStarted) {
          onInteractionStarted({ withId, type, initiator });
        }

        if (setIncomingRequest) setIncomingRequest(null); // Clear notification
      });

      socket.current.on('requestDeclined', (data) => {
        console.log('[CLIENT] Request declined');
        const reason = data?.reason || 'Player declined your request.';

        if (setRequestStatus) {
          setRequestStatus(data?.reason === 'Player is busy' ? 'busy' : 'declined');
          // Clear status after 3 seconds
          setTimeout(() => setRequestStatus(null), 3000);
        } else {
          alert(reason);
        }
      });

      socket.current.on('interactionEnded', () => {
        console.log('[CLIENT] Interaction ended');
        if (onInteractionEnded) {
          onInteractionEnded();
        } else if (onInteractionStarted) {
          onInteractionStarted(null);
        }
      });

      // Friend System Events
      socket.current.on('friendsList', (friendsList) => {
        console.log('[CLIENT] Received friends list:', friendsList);
        if (onFriendsList) onFriendsList(friendsList);
      });

      socket.current.on('friendRequestsList', (requests) => {
        console.log('[CLIENT] Received friend requests list:', requests);
        if (onFriendRequestsList) onFriendRequestsList(requests);
      });

      socket.current.on('friendRequestReceived', (request) => {
        console.log('[CLIENT] Friend request received from:', request.fromName);
        if (onFriendRequestReceived) onFriendRequestReceived(request);
      });

      socket.current.on('friendRequestSent', (data) => {
        console.log('[CLIENT] Friend request sent to:', data.targetUid);
        if (onFriendRequestSent) onFriendRequestSent(data.targetUid);
      });

      socket.current.on('friendAdded', (friend) => {
        console.log('[CLIENT] New friend added:', friend.name);
        if (onFriendAdded) onFriendAdded(friend);
      });

      socket.current.on('friendRequestAccepted', (data) => {
        console.log('[CLIENT] Friend request accepted by:', data.name);
        if (onFriendRequestAccepted) onFriendRequestAccepted(data);
      });

      socket.current.on('alreadyFriends', (data) => {
        console.log('[CLIENT] Already friends with:', data.uid);
        if (onAlreadyFriends) onAlreadyFriends(data.uid);
      });

      // Friend Chat Events
      socket.current.on('friendChatOpened', (data) => {
        console.log('[CLIENT] Friend chat opened with:', data.friendUid, 'messages:', data.messages?.length);
        if (onFriendChatOpened) onFriendChatOpened(data);
      });

      socket.current.on('friendMessageReceived', (messageData) => {
        console.log('[CLIENT] Friend message received from:', messageData.senderName);
        if (onFriendMessageReceived) onFriendMessageReceived(messageData);
      });

      socket.current.on('friendChatHistory', (data) => {
        console.log('[CLIENT] Friend chat history received:', data.messages?.length);
        if (onFriendChatHistory) onFriendChatHistory(data);
      });

      // Initialize any existing players (only once per player)
      socket.current.on('currentPlayers', (players) => {
        setOtherPlayers(prev => {
          const updated = { ...prev };
          players.forEach(player => {
            if (player.id !== socket.current.id && !updated[player.id]) {
              updated[player.id] = {
                ...player,
                coords: new Vector3(player.coords.x, player.coords.y, player.coords.z),
                quaternion: new Quaternion(
                  player.quaternion.x,
                  player.quaternion.y,
                  player.quaternion.z,
                  player.quaternion.w
                ),
                gltfMesh: basePlayerMesh.clone(),
                canTalk: player.canTalk || false,
                isDupCheck: true // Marker to debug if needed
              };
            }
          });
          // Remove any players that are NOT in the new list (server authoritative sync)
          // validIds is Set of IDs from server
          const validIds = new Set(players.map(p => p.id));
          Object.keys(updated).forEach(key => {
            if (!validIds.has(key)) {
              delete updated[key];
            }
          });

          return updated;
        });
      });

      // Handle new player joins (initialize only)
      socket.current.on('newPlayer', (player) => {
        if (player.id === socket.current.id) return;
        setOtherPlayers(prev => {
          if (prev[player.id]) return prev;
          return {
            ...prev,
            [player.id]: {
              ...player,
              coords: new Vector3(player.coords.x, player.coords.y, player.coords.z),
              quaternion: new Quaternion(
                player.quaternion.x,
                player.quaternion.y,
                player.quaternion.z,
                player.quaternion.w
              ),
              gltfMesh: basePlayerMesh.clone(),
              canTalk: player.canTalk || false
            }
          };
        });
      });

      // Handle movements (update only coords & quaternion)
      socket.current.on('playerMoved', (playerData) => {
        setOtherPlayers(prev => {
          if (!prev[playerData.id] || playerData.id === socket.current.id) return prev;
          return {
            ...prev,
            [playerData.id]: {
              ...prev[playerData.id],
              coords: new Vector3(
                playerData.coords.x,
                playerData.coords.y,
                playerData.coords.z
              ),
              quaternion: new Quaternion(
                playerData.quaternion.x,
                playerData.quaternion.y,
                playerData.quaternion.z,
                playerData.quaternion.w
              )
            }
          };
        });
      });

      // Handle disconnects
      socket.current.on('playerDisconnected', (playerId) => {
        setOtherPlayers(prev => {
          const copy = { ...prev };
          delete copy[playerId];
          return copy;
        });
        console.log(`[CLIENT] Player disconnected: ${playerId}`);
      });
    };

    initSocket();

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, [user, setOtherPlayers, basePlayerMesh]);

  // Emit updates when active player moves
  useFrame(() => {
    if (socket.current && socket.current.connected && activePlayerRef.current) {
      const pos = activePlayerRef.current.position;
      const quat = activePlayerRef.current.quaternion;
      const last = lastPlayerStateSent.current;

      const posChanged = !last.position || !pos.equals(last.position);
      const quatChanged = !last.quaternion || !quat.equals(last.quaternion);

      if (posChanged || quatChanged) {
        socket.current.emit('playerUpdate', {
          coords: { x: pos.x, y: pos.y, z: pos.z },
          quaternion: { x: quat.x, y: quat.y, z: quat.z, w: quat.w }
        });
        lastPlayerStateSent.current = { position: pos.clone(), quaternion: quat.clone() };
      }
    }
  });

  return null;
}
