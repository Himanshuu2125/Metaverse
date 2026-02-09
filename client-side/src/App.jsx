import { useState, useEffect } from 'react'
import Landing from './Landing'
import Metaverse from './Metaverse'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import DisconnectedModal from './components/DisconnectedModal'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [disconnected, setDisconnected] = useState(false)
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        const displayName = currentUser.displayName;
        // Check if user needs to complete profile
        // 1. New Email Link users have no displayName (null/empty)
        // 2. Google users have real names with spaces (e.g., "John Doe")
        // We want a single-word username for the metaverse
        const hasValidUsername = displayName && !displayName.includes(' ') && displayName.length > 0;

        if (!hasValidUsername) {
          console.log('[AUTH] User needs profile completion, displayName:', displayName);
          setNeedsProfileCompletion(true);
        } else {
          setNeedsProfileCompletion(false);
        }
      } else {
        setNeedsProfileCompletion(false);
      }

      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleReload = () => {
    window.location.reload()
  }

  const handleProfileComplete = () => {
    setNeedsProfileCompletion(false);
  }

  if (loading) {
    return <div className="text-white flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <>
      {disconnected && <DisconnectedModal onReload={handleReload} message={disconnected} />}
      {!user || needsProfileCompletion ? (
        <Landing
          googleUser={needsProfileCompletion ? user : null}
          onProfileComplete={handleProfileComplete}
        />
      ) : (
        <Metaverse user={user} setDisconnected={setDisconnected} />
      )}
    </>
  )
}
