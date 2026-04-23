import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        remember: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', {
                username: formData.username,
                password: formData.password
            });

            const { token, user } = response.data;

            // Store token and user data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Redirect based on role
            if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'general_admin') {
                navigate('/admin');
            } else if (user.role === 'hospital') {
                navigate('/hospital');
            } else if (user.role === 'wordmain') {
                navigate('/ward');
            } else if (user.role === 'doctor') {
                navigate('/doctor');
            } else if (user.role === 'nurse') {
                navigate('/nurse');
            } else {
                // Add paths for other roles later
                navigate('/');
                alert(`Logged in as ${user.role}. Interface not built yet.`);
            }

        } catch (err) {
            console.error("Login error", err);
            setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Left side: Hero/Brand Area */}
            <div className="login-left">
                <div className="system-status">
                    <span className="status-indicator"></span>
                    System Online
                </div>

                <div className="brand-section">
                    <div className="brand-icon">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2v20M2 12h20" strokeWidth="3" stroke="currentColor" />
                            <path d="M5 5l14 14M19 5L5 19" strokeWidth="1" stroke="rgba(255,255,255,0.4)" />
                        </svg>
                    </div>
                    <h1 className="brand-title">Dengue<br />Monitoring System</h1>
                    <p className="brand-subtitle">
                        Secure access to global epidemiological data, patient tracking, and outbreak analytics for healthcare professionals.
                    </p>
                </div>
            </div>

            {/* Right side: Login Form */}
            <div className="login-right">
                <div className="login-card">
                    <div className="form-header">
                        <h2 className="form-title">Staff Login</h2>
                        <p className="form-subtitle">Welcome back. Please enter your credentials.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="alert-message alert-error" style={{ marginBottom: '1rem' }}>
                                {error}
                            </div>
                        )}
                        <div className="form-group">
                            <label className="form-label" htmlFor="username">Username</label>
                            <div className="form-input-wrapper">
                                <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    className="form-input"
                                    placeholder="e.g. jdoe@hospital.org"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Password</label>
                            <div className="form-input-wrapper">
                                <svg className="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={formData.remember}
                                    onChange={handleChange}
                                />
                                Remember me
                            </label>
                            <a href="#" className="forgot-password">Forgot password?</a>
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In'}
                            {!loading && (
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
