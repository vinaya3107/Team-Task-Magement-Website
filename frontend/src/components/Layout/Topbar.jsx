import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const routeNames = {
  '/dashboard': 'Dashboard',
  '/projects':  'Projects',
  '/tasks':     'Tasks',
  '/users':     'Users',
};

export default function Topbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const base = '/' + pathname.split('/')[1];
  const title = routeNames[base] || 'TaskFlow';

  return (
    <header className="topbar">
      <div>
        <h1 className="topbar-title">{title}</h1>
        <p className="topbar-subtitle">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <div className="topbar-right">
        <span className={`badge ${user?.role === 'ADMIN' ? 'badge-admin' : 'badge-member'}`}>
          {user?.role}
        </span>
        <span className="topbar-email">{user?.email}</span>
      </div>
    </header>
  );
}
