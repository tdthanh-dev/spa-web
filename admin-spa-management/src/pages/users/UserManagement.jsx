// filepath: admin-spa-management/src/pages/users/UserManagement.jsx
import React, { useMemo, useState } from 'react';
import { useUserManagement } from '@/hooks';
import { formatDateTimeVN } from '@/utils/dateUtils';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'ACTIVE', label: 'Hoạt động' },
  { value: 'INACTIVE', label: 'Tạm ngưng' },
  { value: 'LOCKED', label: 'Khóa' },
];

const SORTABLE_COLUMNS = [
  { key: 'fullName', label: 'Tên đầy đủ' },
  { key: 'username', label: 'Tên đăng nhập' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'SĐT' },
  { key: 'role', label: 'Vai trò' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'createdAt', label: 'Ngày tạo' },
];

const UserManagement = () => {
  const {
    users,
    roles,
    loading,
    error,
    fetchUsers,
    getRoleStyle,
    getStatusStyle,
  } = useUserManagement();

  // UI state
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState({ key: 'createdAt', dir: 'desc' });

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);

  // Derived lists
  const roleOptions = useMemo(
    () => [{ name: 'ALL', displayName: 'Tất cả' }, ...roles.map(r => ({
      name: r.name || r.roleName,
      displayName: r.displayName || r.name || r.roleName
    }))],
    [roles]
  );

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    const list = (users || []).filter(u => {
      const roleName = u.roleName || u.role?.name || u.role?.roleName || '';
      const status = u.status || 'ACTIVE';
      const matchText = !text
        || (u.fullName || '').toLowerCase().includes(text)
        || (u.username || '').toLowerCase().includes(text)
        || (u.email || '').toLowerCase().includes(text)
        || (u.phone || '').toLowerCase().includes(text);
      const matchRole = roleFilter === 'ALL' || roleName === roleFilter;
      const matchStatus = statusFilter === 'ALL' || status === statusFilter;
      return matchText && matchRole && matchStatus;
    });

    const sorted = [...list].sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1;
      const ak = sort.key;
      const roleA = a.roleName || a.role?.name || a.role?.roleName || '';
      const roleB = b.roleName || b.role?.name || b.role?.roleName || '';
      const valA =
        ak === 'role' ? roleA :
        ak === 'status' ? (a.status || '') :
        ak === 'createdAt' ? (a.createdAt || '') :
        (a[ak] || '');
      const valB =
        ak === 'role' ? roleB :
        ak === 'status' ? (b.status || '') :
        ak === 'createdAt' ? (b.createdAt || '') :
        (b[ak] || '');
      // Date compare for createdAt
      if (ak === 'createdAt') {
        const ta = valA ? new Date(valA).getTime() : 0;
        const tb = valB ? new Date(valB).getTime() : 0;
        return (ta - tb) * dir;
      }
      return String(valA).localeCompare(String(valB)) * dir;
    });

    return sorted;
  }, [users, query, roleFilter, statusFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const paginated = useMemo(() => {
    const start = currentPage * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const onSort = (key) => {
    setSort(prev => {
      if (prev.key === key) {
        return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      }
      return { key, dir: 'asc' };
    });
  };

  const SortIcon = ({ colKey }) => {
    if (sort.key !== colKey) return <span className="opacity-40">↕</span>;
    return sort.dir === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  // Action handlers (nối API sau)
  const handleCreateSubmit = (payload) => {
    // TODO: call staffUsersApi.create(payload)
    console.log('Create user payload:', payload);
    setShowCreate(false);
    fetchUsers();
  };
  const handleEditSubmit = (payload) => {
    // TODO: call staffUsersApi.update(payload)
    console.log('Edit user payload:', payload);
    setEditUser(null);
    fetchUsers();
  };
  const handleDelete = (user) => {
    // TODO: call staffUsersApi.delete(user.id)
    console.log('Delete user:', user);
  };
  const handleToggleStatus = (user) => {
    // TODO: call staffUsersApi.toggleStatus(user.id)
    console.log('Toggle status:', user);
  };

  // Loading / Error
  if (loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center">
        <div className="h-12 w-12 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">Đang tải danh sách nhân viên...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">👥 Quản lý Nhân viên</h1>
          <p className="text-sm text-gray-500">Quản trị tài khoản và vai trò nhân sự</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
            title="Tải lại dữ liệu"
          >
            🔄 Tải lại
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700"
          >
            ➕ Thêm nhân viên mới
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-start gap-2">
          <span>⚠️</span>
          <div className="space-y-2">
            <p>{error}</p>
            <button
              onClick={fetchUsers}
              className="px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-5">
          <label className="text-sm text-gray-600">Tìm kiếm</label>
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            placeholder="Tên, username, email, SĐT…"
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
        <div className="md:col-span-3">
          <label className="text-sm text-gray-600">Vai trò</label>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            {roleOptions.map(r => (
              <option key={r.name} value={r.name}>{r.displayName}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-gray-600">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-gray-600">Mỗi trang</label>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
            className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Role statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map(role => {
          const rName = role.name || role.roleName;
          const roleStyle = getRoleStyle(rName);
          const count = users.filter(u => (u.roleName || u.role?.name || u.role?.roleName) === rName).length;
          return (
            <div key={rName} className="bg-white rounded-xl shadow p-4">
              <div className="flex items-center justify-between">
                <span
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{ background: roleStyle.background, color: roleStyle.color }}
                >
                  {roleStyle.label}
                </span>
                <span className="text-sm text-gray-500">{role.displayName || rName}</span>
              </div>
              <div className="mt-3 text-2xl font-bold text-gray-900">{count} người</div>
              {role.description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{role.description}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        {paginated.length === 0 ? (
          <div className="p-10 text-center text-gray-500">Không có dữ liệu phù hợp</div>
        ) : (
          <table className="min-w-full text-sm text-left">
            <thead className="bg-pink-50">
              <tr className="text-gray-700">
                <th className="px-4 py-3">#</th>
                {SORTABLE_COLUMNS.map(col => (
                  <th
                    key={col.key}
                    className="px-4 py-3 font-semibold cursor-pointer select-none"
                    onClick={() => onSort(col.key)}
                    title={`Sắp xếp theo ${col.label}`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{col.label}</span>
                      <SortIcon colKey={col.key} />
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((u, idx) => {
                const roleName = u.roleName || u.role?.name || u.role?.roleName || 'ADMIN';
                const status = u.status || 'ACTIVE';
                const r = getRoleStyle(roleName);
                const s = getStatusStyle(status);

                return (
                  <tr key={u.staffId || u.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{currentPage * pageSize + idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{u.fullName || u.name}</td>
                    <td className="px-4 py-3">{u.username || '—'}</td>
                    <td className="px-4 py-3">{u.email || '—'}</td>
                    <td className="px-4 py-3">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ background: r.background, color: r.color }}
                        title={roleName}
                      >
                        {r.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ background: s.background, color: s.color }}
                        title={status}
                      >
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">{u.createdAt ? formatDateTimeVN(u.createdAt) : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                          title="Xem nhanh"
                          onClick={() => setEditUser({ ...u, __viewOnly: true })}
                        >
                          👁️
                        </button>
                        <button
                          className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                          title="Chỉnh sửa"
                          onClick={() => setEditUser(u)}
                        >
                          ✏️
                        </button>
                        <button
                          className="px-2 py-1 rounded bg-yellow-100 hover:bg-yellow-200"
                          title="Khóa/Tạm ngưng"
                          onClick={() => handleToggleStatus(u)}
                        >
                          🔒
                        </button>
                        <button
                          className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                          title="Xóa"
                          onClick={() => handleDelete(u)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4">
        <button
          className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={currentPage === 0}
        >
          ← Trang trước
        </button>
        <span className="text-sm">
          Trang <strong>{currentPage + 1}</strong> / {totalPages} • {filtered.length} mục
        </span>
        <button
          className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50"
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={currentPage >= totalPages - 1}
        >
          Trang sau →
        </button>
      </div>

      {/* Modals */}
      {showCreate && (
        <UserModal
          title="Thêm nhân viên mới"
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreateSubmit}
          roles={roleOptions.filter(r => r.name !== 'ALL')}
        />
      )}
      {editUser && (
        <UserModal
          title={editUser.__viewOnly ? 'Xem nhanh nhân viên' : 'Chỉnh sửa nhân viên'}
          onClose={() => setEditUser(null)}
          onSubmit={handleEditSubmit}
          roles={roleOptions.filter(r => r.name !== 'ALL')}
          defaultValue={editUser}
          readOnly={!!editUser.__viewOnly}
        />
      )}
    </div>
  );
};

/** Modal tạo/sửa user (UI + validate cơ bản) */
const UserModal = ({ title, onClose, onSubmit, roles, defaultValue, readOnly }) => {
  const [form, setForm] = useState({
    fullName: defaultValue?.fullName || defaultValue?.name || '',
    username: defaultValue?.username || '',
    email: defaultValue?.email || '',
    phone: defaultValue?.phone || '',
    roleName: defaultValue?.roleName || defaultValue?.role?.name || roles?.[0]?.name || 'ADMIN',
    status: defaultValue?.status || 'ACTIVE',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.fullName || form.fullName.trim().length < 2) e.fullName = 'Tên tối thiểu 2 ký tự';
    if (!form.username || form.username.trim().length < 3) e.username = 'Username tối thiểu 3 ký tự';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ';
    if (form.phone && !/^\d{9,11}$/.test(form.phone)) e.phone = 'SĐT 9–11 chữ số';
    if (!form.roleName) e.roleName = 'Chọn vai trò';
    if (!form.status) e.status = 'Chọn trạng thái';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (readOnly) return onClose();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <form onSubmit={submit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Họ tên"
            required
            value={form.fullName}
            onChange={(v) => setForm({ ...form, fullName: v })}
            error={errors.fullName}
            readOnly={readOnly}
          />
          <Field
            label="Username"
            required
            value={form.username}
            onChange={(v) => setForm({ ...form, username: v })}
            error={errors.username}
            readOnly={readOnly}
          />
          <Field
            label="Email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            error={errors.email}
            readOnly={readOnly}
          />
          <Field
            label="Số điện thoại"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
            error={errors.phone}
            readOnly={readOnly}
          />
          <FieldSelect
            label="Vai trò"
            required
            value={form.roleName}
            onChange={(v) => setForm({ ...form, roleName: v })}
            options={roles.map(r => ({ value: r.name, label: r.displayName || r.name }))}
            error={errors.roleName}
            readOnly={readOnly}
          />
          <FieldSelect
            label="Trạng thái"
            required
            value={form.status}
            onChange={(v) => setForm({ ...form, status: v })}
            options={STATUS_OPTIONS.filter(o => o.value !== 'ALL').map(o => ({ value: o.value, label: o.label }))}
            error={errors.status}
            readOnly={readOnly}
          />
        </form>

        {/* Footer */}
        <div className="p-5 border-t flex items-center justify-end gap-2">
          <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200" onClick={onClose}>
            Hủy
          </button>
          {!readOnly && (
            <button className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700" onClick={submit}>
              Lưu
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, error, required, readOnly }) => (
  <div className="space-y-1">
    <label className="text-sm text-gray-600">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${error ? 'border-red-300 bg-red-50' : ''} ${readOnly ? 'bg-gray-50 text-gray-600 pointer-events-none' : ''}`}
      placeholder={label}
    />
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

const FieldSelect = ({ label, value, onChange, options, error, required, readOnly }) => (
  <div className="space-y-1">
    <label className="text-sm text-gray-600">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${error ? 'border-red-300 bg-red-50' : ''} ${readOnly ? 'bg-gray-50 text-gray-600 pointer-events-none' : ''}`}
      disabled={readOnly}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

export default UserManagement;
