import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserToken } from '../store/useUserToken';
import { jwtDecode } from 'jwt-decode';
import AuthService from '../CustomHooks/ApiServices/AuthService';
import { ToastContainer } from 'react-toastify';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        console.error('Error caught by boundary:', error);
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);

        // If it's a toggle-related error, try to recover gracefully
        if (error instanceof TypeError && error.message.includes('toggle')) {
            console.warn('Toggle-related error detected, attempting recovery...');
            // Don't redirect, just log and try to recover
            return;
        }

        // For other auth-related errors, redirect to login
        if (error instanceof TypeError && error.message.includes('Cannot read properties of undefined')) {
            console.warn('Auth-related error detected, redirecting to login...');
        }
    }

    render() {
        if (this.state.hasError) {
            // For toggle errors, try to render children anyway (recovery attempt)
            if (this.state.error instanceof TypeError && this.state.error.message.includes('toggle')) {
                console.warn('Attempting to recover from toggle error...');
                // Reset error state and try to render children
                this.setState({ hasError: false, error: null });
                return this.props.children;
            }

            // Handle other TypeError specifically
            if (this.state.error instanceof TypeError &&
                this.state.error.message.includes('Cannot read properties of undefined')) {
                return <Navigate to="/login" replace />;
            }

            // For other errors, redirect to dashboard
            return <Navigate to="/cudashboard" replace />;
        }

        return this.props.children;
    }
}

const ProtectedRoute = ({ component: Component }) => {
    const token = useUserToken();

    const isTokenValid = (token) => {
        if (!token) return false;
        try {
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            return decodedToken.exp > currentTime;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    };

    useEffect(() => {
        const handleInvalidToken = async () => {
            if (!token || !isTokenValid(token)) {
                // console.log('Invalid or expired token - redirecting to login');
                AuthService.logout();
            }
        };
        handleInvalidToken();
    }, [token]);

    if (!token || !isTokenValid(token)) {
        return <Navigate to="/login" replace />;
    }

    return (
        <ErrorBoundary>
            <Component />
        </ErrorBoundary>
    );
};

export default ProtectedRoute;