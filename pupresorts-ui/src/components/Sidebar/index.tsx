import "./index.css";

import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";

import {getUserData} from "../../api/api";
import {IconBooking} from "../../assets/IconBooking.tsx";
import {IconDog} from "../../assets/IconDog.tsx";
import {IconHome} from "../../assets/IconHome.tsx";
import {IconLeft} from "../../assets/IconLeft.tsx";
import {IconRight} from "../../assets/IconRight.tsx";
import logoBig from "../../assets/logobig.png";
import logoSmall from "../../assets/LogoSmall.png";
import {clearAccessToken} from "../../utils/auth.ts";
import ProfileButton from "../Profile-Button";

interface NavButtonProps {
    path: string;
    icon: React.ReactNode;
    label: string;
    compressed: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ path, icon, label, compressed }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = location.pathname === path;

    return (
        <button
            className={`sidebar-btn ${isActive ? "active" : ""}`}
            onClick={() => navigate(path)}
        >
            {icon}
            {!compressed && <span className={`label ${isActive ? "active-label" : ""}`}>{label}</span>}
        </button>
    );
};

const Sidebar: React.FC = () => {
    const [compressed, setCompressed] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        clearAccessToken();
        navigate("/login", { replace: true });
    };

    const handleProfileClick = () => {
        navigate("/edit_user");
    };

    const [user, setUser] = useState<{name: string; lastName: string; email: string;} | null>(null);

    const fetchUserData = async () => {
        try {
            const userData = await getUserData();
            setUser(userData);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        const onUserUpdated = () => fetchUserData();
        window.addEventListener("user-updated", onUserUpdated);
        return () => window.removeEventListener("user-updated", onUserUpdated);
    }, []);

    const initials = user
        ? user.name.charAt(0).toUpperCase() + (user.lastName?.charAt(0)?.toUpperCase() || '')
        : ''

    return (
        <div className={`sidebar-general-div ${compressed ? "compressed" : "default"}`}>
            <div className={`sidebar-container ${compressed ? "compressed" : "default"}`}>
                {/* Header */}
                <div className="sidebar-header" onClick={() => navigate("/home")}>
                    <img
                        src={compressed ? logoSmall : logoBig}
                        alt="PupResorts"
                        className="sidebar-logo"
                    />
                </div>

                {/* Nav */}
                <div className="sidebar-nav">
                    <NavButton path="/home" icon={<IconHome/>} label="Inicio" compressed={compressed}/>
                    <NavButton path="/my_dogs" icon={<IconDog/>} label="Mis perros" compressed={compressed}/>
                    <NavButton path="/my_bookings" icon={<IconBooking/>} label="Mis reservas" compressed={compressed}/>
                </div>

                {/* Footer */}
                <div className="sidebar-footer">
                    <ProfileButton
                        variant={compressed ? "compressed" : "default"}
                        userName={user?.name}
                        userInitials={initials}
                        onInitialsClick={handleProfileClick}
                        onClick={handleLogout}
                    />
                </div>
            </div>

            {/* Toggle */}
            <div className="sidebar-toggle">
                <button
                    onClick={() => setCompressed(!compressed)}
                    className="toggle-btn"
                >
                    {compressed ? (
                        <IconRight/>
                    ) : (
                        <IconLeft/>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;

