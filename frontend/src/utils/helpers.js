import { format, isValid, parseISO } from 'date-fns';

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return isValid(d) ? format(d, 'MMM d, yyyy') : '—';
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'Done') return false;
  const d = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return isValid(d) && d < new Date();
};

export const statusColor = (status) => {
  switch (status) {
    case 'Todo':        return 'badge-todo';
    case 'In Progress': return 'badge-inprogress';
    case 'Done':        return 'badge-done';
    default:            return 'badge-todo';
  }
};

export const roleColor = (role) => {
  return role === 'ADMIN' ? 'badge-admin' : 'badge-member';
};

export const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export const truncate = (str = '', len = 80) =>
  str.length > len ? str.slice(0, len) + '…' : str;

export const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong';
