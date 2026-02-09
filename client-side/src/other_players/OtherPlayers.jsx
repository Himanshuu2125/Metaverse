import React, { useRef, useEffect, useState } from 'react';
import OtherPlayerMesh from "./components/OtherPlayerMesh";

export default function OtherPlayers({ otherPlayers, interactablePlayerId }) {
  // Render all active players directly
  return (
    <>
      {Object.entries(otherPlayers).map(([id, player]) => (
        <OtherPlayerMesh
          key={id}
          // specific ref is not strictly needed for the parent unless used elsewhere, 
          // but OtherPlayerMesh uses internal refs for logic.
          // We can just pass the data.
          // actually OtherPlayerMesh uses `ref` prop to attach to the primitive.
          // We can let it handle its own ref or pass one if needed. 
          // The previous code kept refs in `otherPlayersRefs`. 
          // Let's stick to simple props first.
          id={id}
          player={player}
          gltf={player.gltfMesh}
          name={player.name}
          canTalk={id === interactablePlayerId}
          position={player.coords}
          quaternion={player.quaternion}
        />
      ))}
    </>
  );
}
