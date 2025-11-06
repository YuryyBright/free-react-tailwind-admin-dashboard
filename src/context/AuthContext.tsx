import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("jwtToken")
  );
  const navigate = useNavigate();

  // якщо токен зник — редірект на /signin
  useEffect(() => {
    if (!token) {
      localStorage.removeItem("jwtToken");
    } else {
      localStorage.setItem("jwtToken", token);
    }
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("jwtToken", newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("jwtToken");
    navigate("/signin");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
