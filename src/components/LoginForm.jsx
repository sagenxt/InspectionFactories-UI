import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { requestLocationPermission } from '../utils/location';

const LoginForm = ({ onLogin }) => {
    const { showSuccess, showError, showWarning } = useToast();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const checkLocationPermission = async () => {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            showError('Geolocation is not supported by your browser. Please use a modern browser.');
            return false;
        }

        // Try to check permission status using Permissions API first
        if (navigator.permissions && navigator.permissions.query) {
            try {
                const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });

                if (permissionStatus.state === 'denied') {
                    showError('Location permission is denied. Please enable location access in your browser settings to login.');
                    return false;
                }

                // If permission is 'prompt', show warning that they need to accept
                if (permissionStatus.state === 'prompt') {
                    showWarning('Location permission is required to login. Please allow location access when prompted.');
                }
            } catch (error) {
                console.warn('Permissions API not fully supported:', error);
                // Continue with direct location request if Permissions API fails
            }
        }

        // Always request location to verify we can actually get it
        // This ensures the permission prompt is shown if needed
        try {
            const coordinates = await requestLocationPermission();

            // Verify we actually got valid coordinates
            if (!coordinates || typeof coordinates.latitude !== 'number' || typeof coordinates.longitude !== 'number') {
                showError('Unable to retrieve valid location. Please ensure location services are enabled.');
                return false;
            }

            console.log('Location permission granted and verified:', coordinates);
            return true;
        } catch (error) {
            // Handle specific error cases
            const errorMessage = error.message || 'Location permission is required to login.';

            if (errorMessage.includes('denied')) {
                showError('Location access denied. You must grant location permission to login.');
            } else if (errorMessage.includes('unavailable')) {
                showError('Location services are unavailable. Please check your device settings.');
            } else if (errorMessage.includes('timeout')) {
                showError('Location request timed out. Please ensure GPS is enabled and try again.');
            } else {
                showError('Location permission is required to login. Please enable location access.');
            }

            console.error('Location permission error:', error);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Check location permission before login
            const hasLocationPermission = await checkLocationPermission();

            if (!hasLocationPermission) {
                setLoading(false);
                return;
            }

            const response = await authAPI.login(formData.email, formData.password);
            console.log('Login successful:', response);

            // Handle the API response structure
            if (response.token && response.user) {
                showSuccess('Login successful! Welcome back.');
                onLogin(response);
            } else {
                showError('Invalid response from server. Please try again.');
            }
        } catch (err) {
            showError('Login failed. Please check your credentials and try again.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Factory Inspection</h1>
                        <h2 className="text-2xl font-semibold text-blue-600 mb-4">System</h2>
                        <p className="text-gray-600">Please login to continue</p>

                        {/* Location Permission Notice */}
                        {/* <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center justify-center text-amber-800 text-sm">
                                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">Location access required for login</span>
                            </div>
                        </div> */}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                                placeholder="Enter your password"
                            />
                        </div>


                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Logging in...
                                </span>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
