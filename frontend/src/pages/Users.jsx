import { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatDate, getInitials, roleColor } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

import UserForm from '../components/users/UserForm';

export default function Users() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/api/users')
      .then((r) => setUsers(r.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Users</h2>
          <p className="page-subtitle">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Create User
        </button>
      </div>

      <div className="filters-bar">
        <input
          className="form-input filter-search"
          placeholder="🔍 Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar user-avatar-sm">{getInitials(u.name)}</div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td className="text-muted">{u.email}</td>
                  <td>
                    <span className={`badge ${roleColor(u.role)}`}>{u.role}</span>
                  </td>
                  <td className="text-muted">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state"><p>No users match your search.</p></div>
          )}
        </div>
      )}

      {showModal && (
        <UserForm 
          onSuccess={() => { setShowModal(false); fetchUsers(); }} 
          onCancel={() => setShowModal(false)} 
        />
      )}
    </div>
  );
}
