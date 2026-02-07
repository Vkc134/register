import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard, FileText } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="layout">
            <nav style={{
                padding: '1rem 2rem',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--color-surface-translucent)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--color-primary)' }}>
                    <User size={24} />
                    <span>Candidate Tracker</span>
                </div>

                {user && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        {user.role === 'admin' ? (
                            <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--color-text-main)' }}>
                                <LayoutDashboard size={18} />
                                Dashboard
                            </Link>
                        ) : (
                            <Link to="/user" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--color-text-main)' }}>
                                <FileText size={18} />
                                My Application
                            </Link>
                        )}

                        <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                )}
            </nav>

            <main className="container animate-fade-in" style={{ marginTop: '2rem' }}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
