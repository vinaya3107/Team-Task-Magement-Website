import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../utils/helpers';

const navItems = [
  { to: '/dashboard', icon: '⬛', label: 'Dashboard' },
  { to: '/projects',  icon: '📁', label: 'Projects' },
  { to: '/tasks',     icon: '✅', label: 'Tasks' },
];

const adminItems = [
  { to: '/users', icon: '👥', label: 'Users' },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">⚡</span>
        <span className="logo-text">TaskFlow</span>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-label">MAIN</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <p className="nav-section-label" style={{ marginTop: '1.5rem' }}>ADMIN</p>
            {adminItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-avatar">{getInitials(user?.name)}</div>
        <div className="user-info">
          <p className="user-name">{user?.name}</p>
          <p className="user-role">{user?.role}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">⬅</button>
      </div>
    </aside>
  );
}
