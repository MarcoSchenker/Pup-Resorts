import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { isAuthenticated } from "../../utils/auth";
import Sidebar from "../Sidebar";

type Props = { children: React.ReactNode };

export default function PrivateRoute({ children }: Props) {
    const location = useLocation();

    if (!isAuthenticated()) {
        return <Navigate to="/" replace state={{ from: location }} />;
    }

    return (
        <div style={{ display: "flex", height: "100%" }}>
            <Sidebar />
            <div style={{ flexGrow: 1, overflow: "auto", padding: '48px 24px' }}>
                {children}
            </div>
        </div>
    );
}
