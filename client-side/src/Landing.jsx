import React, { useEffect, useRef, useState } from 'react';
import './Landing.css';
import { auth } from './firebase';
import { signInWithCustomToken, updateProfile, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// Convert Firebase error codes to user-friendly messages
const getAuthErrorMessage = (error) => {
    const errorCode = error.code || '';
    const errorMessages = {
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/user-disabled': 'This account has been disabled. Please contact support.',
        'auth/user-not-found': 'No account found with this email. Please sign up first.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-credential': 'Invalid credentials.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/operation-not-allowed': 'This sign-in method is not enabled.',
        'auth/popup-closed-by-user': 'Sign-in was cancelled.',
        'auth/invalid-custom-token': 'The authentication token is invalid. Please try again.',
    };
    return errorMessages[errorCode] || 'An unexpected error occurred. Please check, and try again.';
};

const Landing = ({ googleUser: googleUserProp, onProfileComplete }) => {
    // Auth State
    const [authOpen, setAuthOpen] = useState(false); // Unified Modal
    const [otpOpen, setOtpOpen] = useState(false);
    const [profileCompleteOpen, setProfileCompleteOpen] = useState(false);

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // We treat the passed prop as a 'pending' user (either from Google or specialized flow)
    const [pendingUser, setPendingUser] = useState(null);

    const googleProvider = new GoogleAuthProvider();
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

    useEffect(() => {
        if (googleUserProp) {
            setPendingUser(googleUserProp);
            setProfileCompleteOpen(true);
        }
    }, [googleUserProp]);

    // Step 1: Request OTP
    const handleRequestOtp = async () => {
        setError('');
        if (!email) {
            setError('Email is required');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${serverUrl}/api/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (data.success) {
                setAuthOpen(false);
                setOtpOpen(true);
                if (data.message && data.message.includes('console')) {
                    console.info("Check server console for OTP");
                }
            } else {
                setError(data.error || 'Failed to send OTP');
            }
        } catch (err) {
            console.error('OTP Request Error:', err);
            setError('Failed to connect to server. Ensure backend is running.');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify OTP and Sign In
    const handleVerifyOtp = async () => {
        setError('');
        setIsLoading(true);
        console.log('[OTP] Verifying code:', otp);

        try {
            // Verify OTP on Backend -> Get Custom Token
            const response = await fetch(`${serverUrl}/api/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            const data = await response.json();
            console.log('[OTP] Server response:', data);

            if (!data.success) {
                setError(data.error || 'Invalid OTP');
                setIsLoading(false);
                return;
            }

            // Sign In with that token
            console.log('[OTP] Signing in with custom token...');
            await signInWithCustomToken(auth, data.token);
            console.log('[OTP] Sign in successful');

            // If successful, App.jsx will detect user.
            // If the user doesn't have a username, App.jsx will keep Landing mounted 
            // and pass the user prop, triggering the Profile Completion modal.

            // We can close OTP modal now.
            setOtpOpen(false);

            // Ensure auth modal is closed too
            setAuthOpen(false);

            // Reset loading state to prevent "Saving..." stuck on Profile Modal
            setIsLoading(false);

        } catch (err) {
            console.error('[OTP] Process Error:', err);
            setError(getAuthErrorMessage(err));
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setIsLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
            // App.jsx will handle the rest (redirect or profile completion)
            setAuthOpen(false);
            setIsLoading(false);
        } catch (err) {
            setError(getAuthErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileComplete = async () => {
        setError('');
        if (!username.trim()) {
            setError('Username is required');
            return;
        }
        setIsLoading(true);
        console.log('[PROFILE] Starting profile completion for:', username);

        try {
            if (pendingUser || auth.currentUser) {
                const targetUser = pendingUser || auth.currentUser;
                console.log('[PROFILE] Updating profile for user:', targetUser.email);

                await updateProfile(targetUser, { displayName: username });
                console.log('[PROFILE] Update successful');

                // Force sync user state
                await targetUser.reload();
                console.log('[PROFILE] User reloaded');

                setProfileCompleteOpen(false);
                setPendingUser(null);

                if (onProfileComplete) {
                    onProfileComplete();
                }

                // Force reload page to ensure fresh state
                setTimeout(() => {
                    window.location.reload();
                }, 100);
            } else {
                console.error('[PROFILE] No user found to update');
                setError('No user found');
                setIsLoading(false);
            }
        } catch (err) {
            console.error('[PROFILE] Error:', err);
            setError(getAuthErrorMessage(err));
            setIsLoading(false);
        }
    };

    const handleCancelProfileComplete = async () => {
        try {
            await signOut(auth);
            setPendingUser(null);
            setProfileCompleteOpen(false);
            setUsername('');
            setError('');
        } catch (err) {
            console.error('Error signing out:', err);
        }
    };

    const vantaRef = useRef(null);
    const [vantaEffect, setVantaEffect] = useState(null);
    const particlesContainerRef = useRef(null);

    // Initialize Vanta.js
    useEffect(() => {
        if (!vantaEffect && window.VANTA) {
            setVantaEffect(
                window.VANTA.NET({
                    el: vantaRef.current,
                    mouseControls: true, touchControls: true, gyroControls: false,
                    minHeight: 200.00, minWidth: 200.00, scale: 1.00, scaleMobile: 1.00,
                    color: 0x0088ff, backgroundColor: 0x0c0d15, points: 12.00, maxDistance: 25.00, spacing: 20.00,
                    showDots: false, rotationSpeed: 0.5, zoom: 1.5
                })
            );
        }
        return () => { if (vantaEffect) vantaEffect.destroy(); };
    }, [vantaEffect]);

    // Create Particles
    useEffect(() => {
        const container = particlesContainerRef.current;
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < 15; i++) {
            const meteor = document.createElement('div');
            meteor.classList.add('particle');
            const size = Math.random() * 4 + 2;
            const color = `hsl(${Math.random() * 60 + 300}, 100%, 70%)`;
            meteor.style.cssText = `width:${size}px;height:${size * 2}px;left:${Math.random() * 100}%;top:${Math.random() * 100}%;background:linear-gradient(to right, transparent, ${color});border-radius:50% 0 0 50%;transform:rotate(${Math.random() * 360}deg);animation:meteor-fall ${3 + Math.random() * 5}s ${Math.random() * 10}s infinite linear;`;
            container.appendChild(meteor);
        }
    }, []);

    const handleCardMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        card.style.transform = `rotateY(${(e.clientX - rect.left - rect.width / 2) / 20}deg) rotateX(${(rect.height / 2 - (e.clientY - rect.top)) / 20}deg)`;
    };

    return (
        <div className="min-h-screen relative font-sans text-white">
            <div className="particles" ref={particlesContainerRef}></div>
            <div ref={vantaRef} className="vanta-bg"></div>

            <main className="container mx-auto px-4 md:px-10 py-16 z-10 relative">
                <section className="text-center max-w-4xl mx-auto py-20">
                    <h2 className="text-5xl md:text-7xl font-bold mb-6 orbitron glow">
                        The Next <span className="gradient-text">Evolution</span> of Reality
                    </h2>
                    <p className="text-xl md:text-2xl text-blue-200 mb-12">
                        Step into a world without boundaries. Explore, create, and connect in our revolutionary metaverse.
                    </p>

                    <div className="flex flex-wrap justify-center gap-6 mt-12">
                        <button onClick={() => setAuthOpen(true)} className="btn-neon text-xl px-10 py-4 font-bold orbitron">
                            <i className="fas fa-rocket mr-2"></i> Enter Metaverse
                        </button>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-20">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold orbitron mb-4">
                            Experience The <span className="gradient-text">Future</span>
                        </h2>
                        <p className="text-xl text-blue-300 max-w-2xl mx-auto">
                            Discover limitless worlds where imagination becomes reality
                        </p>
                    </div>

                    <div className="metaverse-grid">
                        <div className="holographic-card floating floating-1" onMouseMove={handleCardMouseMove} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                            <div className="p-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center mb-5"><i className="fas fa-globe-americas text-2xl text-white"></i></div>
                                <h3 className="text-2xl font-bold orbitron mb-3">Infinite Worlds</h3>
                                <p className="text-blue-200">Explore endless user-created dimensions with unique rules and environments.</p>
                            </div>
                        </div>
                        <div className="holographic-card floating floating-2" onMouseMove={handleCardMouseMove} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                            <div className="p-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center mb-5"><i className="fas fa-shopping-bag text-2xl text-white"></i></div>
                                <h3 className="text-2xl font-bold orbitron mb-3">Digital Economy</h3>
                                <p className="text-blue-200">Buy, sell and trade digital assets secured by blockchain technology.</p>
                            </div>
                        </div>
                        <div className="holographic-card floating floating-3" onMouseMove={handleCardMouseMove} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                            <div className="p-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-green-500 rounded-lg flex items-center justify-center mb-5"><i className="fas fa-users text-2xl text-white"></i></div>
                                <h3 className="text-2xl font-bold orbitron mb-3">Social Hubs</h3>
                                <p className="text-blue-200">Connect with friends in stunning virtual spaces designed for interaction.</p>
                            </div>
                        </div>
                        <div className="holographic-card floating floating-1" onMouseMove={handleCardMouseMove} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                            <div className="p-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-red-500 rounded-lg flex items-center justify-center mb-5"><i className="fas fa-paint-brush text-2xl text-white"></i></div>
                                <h3 className="text-2xl font-bold orbitron mb-3">Creator Tools</h3>
                                <p className="text-blue-200">Build your own worlds with our intuitive drag-and-drop creation suite.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 border-t border-blue-900 z-10 relative">
                    <div className="container mx-auto px-4 md:px-10">
                        <div className="flex flex-col md:flex-row justify-between">
                            <div className="mb-8 md:mb-0">
                                <div className="flex items-center mb-6">
                                    <h1 className="text-3xl font-bold orbitron gradient-text">METAVERSE</h1>
                                </div>
                                <p className="text-blue-300 max-w-xs">The next frontier of digital experiences.</p>
                            </div>
                            <div className="flex space-x-4 mt-4 md:mt-0">
                                <p className="text-blue-400">&copy; 2025 Metaverse. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>

            {/* Auth Modal (Login/Signup) */}
            {authOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
                    <div className="neon-box max-w-md w-full p-8 rounded-2xl relative">
                        <button onClick={() => setAuthOpen(false)} className="absolute top-4 right-4 text-2xl text-blue-300 hover:text-cyan-300"><i className="fas fa-times"></i></button>
                        <h3 className="text-3xl font-bold orbitron mb-2 text-center">Welcome</h3>
                        <p className="text-center text-blue-300 mb-8">Enter your email to continue</p>
                        <div className="space-y-5">
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field w-full" placeholder="Email Address" autoFocus />
                            <button onClick={handleRequestOtp} disabled={isLoading} className="btn-neon w-full py-3 font-semibold">{isLoading ? 'Sending Code...' : 'Send Login Code'}</button>
                            <div className="flex items-center gap-4 my-4"><div className="flex-1 h-px bg-blue-800"></div><span className="text-blue-400 text-sm">or</span><div className="flex-1 h-px bg-blue-800"></div></div>
                            <button onClick={handleGoogleSignIn} disabled={isLoading} className="w-full py-3 font-semibold rounded-lg border border-blue-500 bg-transparent hover:bg-blue-900/30 transition-all flex items-center justify-center gap-3">Continue with Google</button>
                        </div>
                    </div>
                </div>
            )}

            {/* OTP Modal */}
            {otpOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
                    <div className="neon-box max-w-sm w-full p-8 rounded-2xl relative">
                        <button onClick={() => setOtpOpen(false)} className="absolute top-4 right-4 text-2xl text-blue-300 hover:text-cyan-300"><i className="fas fa-times"></i></button>
                        <h3 className="text-2xl font-bold orbitron mb-4 text-center">Verification</h3>
                        <p className="text-center text-blue-300 mb-6 text-sm">Enter the 6-digit code sent to <br /><span className="text-white">{email}</span></p>
                        <div className="space-y-5">
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                className="input-field w-full text-center text-2xl tracking-widest"
                                placeholder="000000"
                                autoFocus
                            />
                            <button onClick={handleVerifyOtp} disabled={isLoading} className="btn-neon w-full py-3 font-semibold">
                                {isLoading ? 'Verifying...' : 'Verify & Enter'}
                            </button>
                            <button onClick={() => { setOtpOpen(false); setAuthOpen(true); }} className="w-full text-blue-400 text-sm hover:underline">Change Email</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Completion Modal */}
            {profileCompleteOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
                    <div className="neon-box max-w-md w-full p-8 rounded-2xl relative">
                        <h3 className="text-3xl font-bold orbitron mb-2 text-center gradient-text">Almost There!</h3>
                        <p className="text-center text-blue-300 mb-8">Choose your username for the metaverse</p>

                        <div className="space-y-5">
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                            {(pendingUser || auth.currentUser) && (
                                <div className="flex items-center gap-3 p-3 bg-blue-900/30 rounded-lg border border-blue-800">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                        <i className="fas fa-user text-white"></i>
                                    </div>
                                    <div>
                                        <p className="text-white text-sm">{pendingUser ? pendingUser.email : auth.currentUser?.email}</p>
                                        <p className="text-blue-400 text-xs">Signed in</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input-field w-full"
                                    placeholder="Choose your username"
                                    autoFocus
                                />
                                <p className="text-blue-400 text-xs mt-2">This will be displayed to other players</p>
                            </div>

                            <button
                                onClick={handleProfileComplete}
                                disabled={isLoading || !username.trim()}
                                className="btn-neon w-full py-3 font-semibold disabled:opacity-50"
                            >
                                {isLoading ? 'Saving...' : 'Enter the Metaverse'}
                            </button>
                            <button onClick={handleCancelProfileComplete} className="w-full py-2 text-blue-400 hover:text-cyan-300 text-sm transition-colors">Use a different account</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Landing;
