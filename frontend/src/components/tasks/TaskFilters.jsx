const STATUS_OPTIONS = ['', 'Todo', 'In Progress', 'Done'];

export default function TaskFilters({ filters, onChange }) {
  return (
    <div className="filters-bar">
      <input
        className="form-input filter-search"
        placeholder="🔍 Search tasks…"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value, page: 1 })}
      />
      <select
        className="form-select"
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value, page: 1 })}
      >
        <option value="">All Statuses</option>
        {STATUS_OPTIONS.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
}
