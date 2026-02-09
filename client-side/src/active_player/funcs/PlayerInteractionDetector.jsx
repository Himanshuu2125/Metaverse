// PlayerInteractionDetector.jsx
import React, { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Raycaster, Vector2 } from 'three';

/**
 * PlayerInteractionDetector component.
 * This component uses useFrame to continuously cast a ray from the center of the screen
 * and detect the closest player within a specified distance, setting their canTalk property to true
 * in the otherPlayers object state.
 *
 * @param {object} props
 * @param {Record<string, {
 *     id: string,
 *     name: string,
 *     coords: THREE.Vector3,
 *     rotation: THREE.Euler,
 *     gltfMesh: THREE.Object3D,
 *     canTalk: boolean
 * }>} otherPlayers - An object keyed by player ID.
 * @param {function} setOtherPlayers - Setter for otherPlayers state (should replace the entire object).
 * @param {number} [detectionDistance=10] - Max distance for interaction.
 */
function PlayerInteractionDetector({ otherPlayers, setOtherPlayers, setInteractablePlayerId, detectionDistance = 10 }) {
    const { camera } = useThree();
    const raycaster = useRef(new Raycaster());
    const mouse = useRef(new Vector2(0, 0));

    // Keep track of last ID to avoid redundant state updates
    const lastInteractableId = useRef(null);

    useFrame(() => {
        raycaster.current.setFromCamera(mouse.current, camera);

        if (otherPlayers) {
            const playersArray = Object.values(otherPlayers);
            const interactableMeshes = [];
            playersArray.forEach(player => {
                if (player.gltfMesh) {
                    player.gltfMesh.traverse(child => {
                        if (child.isMesh) {
                            interactableMeshes.push(child);
                        }
                    });
                }
            });

            let newClosestId = null;

            if (interactableMeshes.length > 0) {
                const intersects = raycaster.current.intersectObjects(interactableMeshes, true);
                let closestDistance = Infinity;

                for (const intersect of intersects) {
                    let obj = intersect.object;
                    let foundPlayerId = null;

                    while (obj) {
                        for (const [id, player] of Object.entries(otherPlayers)) {
                            if (player.gltfMesh === obj) {
                                foundPlayerId = id;
                                break;
                            }
                        }
                        if (foundPlayerId) break;
                        obj = obj.parent;
                    }

                    if (foundPlayerId) {
                        if (intersect.distance <= detectionDistance && intersect.distance < closestDistance) {
                            closestDistance = intersect.distance;
                            newClosestId = foundPlayerId;
                        }
                    }
                }

                if (newClosestId) {
                    // console.log(`[DEBUG] Raycast hit ${newClosestId}`);
                }
            }

            // Only update state if ID changed
            if (newClosestId !== lastInteractableId.current) {
                console.log(`[INTERACTION] Changed target: ${lastInteractableId.current} -> ${newClosestId}`);
                lastInteractableId.current = newClosestId;
                if (setInteractablePlayerId) {
                    setInteractablePlayerId(newClosestId);
                }
            }
        }
    });

    return null;
}

export default PlayerInteractionDetector;
