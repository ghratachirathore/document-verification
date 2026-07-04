import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, unwrap } from "../api/http";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("eduverify_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem("eduverify_token");
      localStorage.removeItem("eduverify_user");
      setUser(null);
    };
    window.addEventListener("eduverify:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("eduverify:unauthorized", handleUnauthorized);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("eduverify_token");
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((response) => {
        const nextUser = unwrap(response).user;
        setUser(nextUser);
        localStorage.setItem("eduverify_user", JSON.stringify(nextUser));
      })
      .catch(() => {
        localStorage.removeItem("eduverify_token");
        localStorage.removeItem("eduverify_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = unwrap(await api.post("/auth/login", { email, password }));
    localStorage.setItem("eduverify_token", data.token);
    localStorage.setItem("eduverify_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = unwrap(await api.post("/auth/register", payload));
    localStorage.setItem("eduverify_token", data.token);
    localStorage.setItem("eduverify_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Local logout must still succeed if the token is already expired.
    }
    localStorage.removeItem("eduverify_token");
    localStorage.removeItem("eduverify_user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
