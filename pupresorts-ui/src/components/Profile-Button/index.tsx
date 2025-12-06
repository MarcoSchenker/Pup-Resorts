import './index.css';

import type { FunctionComponent } from 'react';

import { IconLogout } from "../../assets/IconLogout.tsx";

interface ProfileButtonProps {
    variant?: 'default' | 'compressed';
    userName?: string;
    userInitials?: string;
    onClick?: () => void;
    onInitialsClick?: () => void;
}

const ProfileButton: FunctionComponent<ProfileButtonProps> = ({
                                                                  variant = 'default',
                                                                  userName = '',
                                                                  userInitials = '',
                                                                  onClick,
                                                                  onInitialsClick,
                                                              }) => {
    const handleLogout = () => {
        if (onClick) {
            onClick();
        }
    };

    return (
        variant === "compressed" ? (
            <div className={`profile-button-container ${variant}`}>
                <button onClick={handleLogout} className="logout-btn">
                    <IconLogout size={25} color="var(--primary-500)" />
                </button>
                <div className="profile-button-initials-wrapper">
                    <p
                        onClick={onInitialsClick}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onInitialsClick && onInitialsClick(); }}
                        style={{ cursor: onInitialsClick ? "pointer" : undefined }}
                    >
                        {userInitials}
                    </p>
                </div>
            </div>
            ) : (
                <div className={'profile-button-container'}>
                    <div className="profile-button-initials-wrapper">
                        <p
                            onClick={onInitialsClick}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onInitialsClick && onInitialsClick(); }}
                            style={{ cursor: onInitialsClick ? "pointer" : undefined }}
                        >
                            {userInitials}
                        </p>
                    </div>

                    <p>{userName}</p>

                    <button onClick={handleLogout} className="logout-btn">
                        <IconLogout size={20} color="var(--primary-500)" />
                    </button>
                </div>
            )
    );
};

export default ProfileButton;
