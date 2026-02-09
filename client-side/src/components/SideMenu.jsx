import React, { useState } from 'react';
import './SideMenu.css';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const SideMenu = ({ friendRequests = [], friends = [], onToggleFriendRequests, onToggleFriends, onToggleSettings }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {

        }
    };

    const menuItems = [
        {
            icon: 'fas fa-user-friends',
            label: 'Friends',
            badge: friends.length,
            onClick: onToggleFriends
        },
        {
            icon: 'fas fa-user-plus',
            label: 'Friend Requests',
            badge: friendRequests.length,
            onClick: onToggleFriendRequests
        },
        {
            icon: 'fas fa-cog',
            label: 'Settings',
            onClick: onToggleSettings
        },
    ];

    return (
        <div className="side-menu-container">
            {/* Toggle Button - always visible */}
            <button
                className={`menu-toggle-btn ${isOpen ? 'open' : ''}`}
                onClick={toggleMenu}
                aria-label="Toggle Menu"
            >
                <i className={`fas ${isOpen ? 'fa-angle-double-left' : 'fa-angle-double-right'}`}></i>
            </button>

            {/* Sidebar */}
            <div className={`side-menu ${isOpen ? 'open' : ''}`}>
                <div className="menu-header">
                    <h2 className="menu-title">METAVERSE</h2>
                </div>

                <ul className="menu-items">
                    {menuItems.map((item, index) => (
                        <li key={index} className="menu-item">
                            <button
                                className="menu-btn"
                                onClick={item.onClick}
                                style={{ position: 'relative' }}
                            >
                                <i className={item.icon}></i>
                                {item.label}
                                {item.badge > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        background: 'red',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '20px',
                                        height: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '11px',
                                        fontWeight: 'bold'
                                    }}>
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="menu-bottom">
                    <button className="menu-btn logout-btn" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                    <div className="menu-footer">
                        &copy; 2025 Metaverse
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SideMenu;
