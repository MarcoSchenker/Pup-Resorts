import React from "react";
import { Navigate } from "react-router-dom";

import { getAccessToken } from "../../utils/auth";

type Props = { children: React.ReactNode };

export default function PublicRoute({ children }: Props) {
    const isLoggedIn = !!getAccessToken();
    return isLoggedIn ? <Navigate to="/home" replace /> : children;
}
