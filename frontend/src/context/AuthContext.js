/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useState, useEffect } from "react";
import jwt_decode from "jwt-decode";
import axios from "axios";
import { useHistory } from "react-router-dom";

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  let [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null
  );
  let [user, setUser] = useState(() =>
    localStorage.getItem("authTokens")
      ? jwt_decode(localStorage.getItem("authTokens"))
      : null
  );
  let [loading, setLoading] = useState(true);

  let history = useHistory();

  let loginUser = async (e) => {
    e.preventDefault();
    let data = await axios.post(
      "http://127.0.0.1:8000/api/token/",
      { username: e.target.username.value, password: e.target.password.value },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log(data.data.access);
    if (data.status === 200) {
      setAuthTokens(data.data);
      setUser(jwt_decode(data.data.access));
      localStorage.setItem("authTokens", JSON.stringify(data.data));
      history.push("/");
    } else {
      alert("Suspicious!!! Yaarraa Nee??");
    }
  };
  let logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    history.push("/login");
  };

  let updateToken = async () => {
    console.log("Updated Refresh token");
    let data = await axios.post(
      "http://127.0.0.1:8000/api/token/refresh/",
      { 'refresh': authTokens?.refresh },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (data.status === 200) {
      setAuthTokens(data.data);
      setUser(jwt_decode(data.data.access));
      localStorage.setItem("authTokens", JSON.stringify(data.data));
    } else {
      logoutUser();
    } 
    if (loading) {
      setLoading(false);
    }
  };
  let contextData = {
    user: user,
    loginUser: loginUser,
    logoutUser: logoutUser,
    authTokens: authTokens,
  };

  useEffect(() => {
    if (loading) {
      updateToken();
    }
    let fourMins = 1000 * 60 * 4;
    let interval = setInterval(() => {
      if (authTokens) {
        updateToken();
      } else {
        console.log("No tokens");
      }
    }, fourMins);
    return () => clearInterval(interval);
  }, [authTokens, loading]);

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};
