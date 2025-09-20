import { createContext, useState, useEffect } from "react";


export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);

    useEffect(() => {
        if (token) {
            // here we could decode token or fetch user details later
            setUser({ role: localStorage.getItem("role") || "patient" });
        } else {
            setUser(null);
        }
    }, [token]);

    const login = (jwtToken, role) => {
        setToken(jwtToken);
        localStorage.setItem("token", jwtToken);
        localStorage.setItem("role", role);
        setUser({ role });
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}