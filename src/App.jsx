import React, { useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  } from "react-router-dom";
import "./App.css";
import Login from "./user/Login";
import Setpassword from "./user/Setpassword";
import Forgotpassword from "./user/Forgotpassword";
import Userlayout from "./layouts/Userlayout";
import "./styles/customStyles.css";
import "react-toastify/dist/ReactToastify.css";
import useLanguageStore from "./store/languageStore";
import ErrorPage from "./pages/ErrorPage";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./styles/AgGrid.css"
import "./index.css";
import ProtectedRoute from "./Security/ProtectedRoute";
import useUserTokenStore from "./store/useUserToken";
import { jwtDecode } from "jwt-decode";
import AuthService from "./CustomHooks/ApiServices/AuthService";
import DisplayPage from './pages/ZonalDisplay/DisplayPage';

function App() {
  const { initializeLanguage } = useLanguageStore();
  const { token } = useUserTokenStore();

  useEffect(() => {
    initializeLanguage();
  }, [initializeLanguage]);

  useEffect(() => {
    const checkTokenExpiration = () => {
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          if (decodedToken.exp <= currentTime) {
            AuthService.logout();
          }
        } catch (error) {
          console.error('Token validation error:', error);
          AuthService.logout();
        }
      }
    };

    checkTokenExpiration();
    const tokenCheckInterval = setInterval(checkTokenExpiration, 60000); // Check every minute

    return () => clearInterval(tokenCheckInterval);
  }, [token]);

  return (
    <>
    <style>
        {`
          .Toastify__toast-container {
            margin-top: 40px !important;
          }
        `}
      </style>
      <Router className="">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/setpassword" element={<Setpassword />} />
          <Route path="/forgotpassword" element={<Forgotpassword />} />
          <Route path="/server-error" element={<ErrorPage />} />
          <Route path="/zonal-display" element={<DisplayPage />} />
          <Route path="/*" element={<ProtectedRoute component={Userlayout} />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
