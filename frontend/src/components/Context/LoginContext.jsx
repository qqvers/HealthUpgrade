import React, { createContext, useContext, useState, useEffect } from "react";

export const LoginContext = createContext(null);

export function useLogin() {
  return useContext(LoginContext);
}

export const LoginProvider = ({ children }) => {
  const [jwtToken, setJwtToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    const expirationTime = localStorage.getItem("expirationTime");
    if (token && expirationTime) {
      const currentTime = new Date().getTime();
      if (currentTime < expirationTime) {
        setJwtToken(token);
        setLogoutTimer(expirationTime - currentTime);
      } else {
        logout();
      }
    }
  }, []);

  const setLogoutTimer = (delay) => {
    setTimeout(() => {
      logout();
    }, delay);
  };

  const updateToken = (token) => {
    const expirationTime = new Date().getTime() + 30 * 60000;
    localStorage.setItem("jwtToken", token);
    localStorage.setItem("expirationTime", expirationTime);
    setJwtToken(token);
    setLogoutTimer(60000 * 30);
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("expirationTime");
    localStorage.removeItem("products");
    setJwtToken(null);
  };

  const contextValue = {
    jwtToken,
    isLoggedIn: !!jwtToken,
    updateToken,
    logout,
  };

  return (
    <LoginContext.Provider value={contextValue}>
      {children}
    </LoginContext.Provider>
  );
};
