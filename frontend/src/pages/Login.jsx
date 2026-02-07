import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCircle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

const Login = () => {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (isLogin) {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                // Check role from context or result to navigate
                // Since state update might be async, we can rely on what we just got
                // But simplified:
                const user = JSON.parse(localStorage.getItem('app_user'));
                if (user?.role === 'admin') navigate('/admin');
                else navigate('/user');
            } else {
                setError(result.message);
            }
        } else {
            const result = await register(formData.email, formData.password, 'candidate');
            if (result.success) {
                alert("Registration successful! Please login.");
                setIsLogin(true);
                setFormData({ email: '', password: '' });
            } else {
                setError(result.message);
            }
        }
        setLoading(false);
    };

    return (
        <div className="auth-layout">
            <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p style={{ marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
                    {isLogin ? 'Enter your credentials to access your account' : 'Register to submit your application'}
                </p>

                {error && <div style={{ color: 'var(--color-danger)', marginBottom: '1rem', padding: '0.5rem', background: '#fee2e2', borderRadius: '4px' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <label className="label">Email Address</label>
                        <input
                            type="email"
                            className="input"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="name@example.com"
                        />
                    </div>
                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <label className="label">Password</label>
                        <input
                            type="password"
                            className="input"
                            required
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}
                    >
                        {isLogin ? 'Register' : 'Login'}
                    </button>
                </div>

                {isLogin && (
                    <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {/* Admin Demo text removed */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
