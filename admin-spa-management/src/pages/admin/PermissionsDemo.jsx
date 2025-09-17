import React from 'react';
import { usePermissionsDemo } from '@/hooks/usePermissionsDemo';
import { STAFF_FIELD_PERMISSIONS_MAP, PERMISSION_LEVEL_MAP, PERMISSION_CATEGORIES } from '@/config/constants';


const PermissionsDemo = ({ user }) => {
  const {
    // Data
    permissions,
    fieldPermissions,
    staffFieldPermissions,
    categorizedPermissions,
    hasStaffPermissions,
    loading,
    error,

    // State
    selectedStaffId,
    selectedCustomerId,
    selectedPermissionLevel,
    setSelectedStaffId,
    setSelectedCustomerId,
    setSelectedPermissionLevel,

    // Old system functions
    fetchPermissions,
    handleCheckPermission,
    handleGrantFieldPermission,
    initializeSystemPermissions,
    initializeDefaultFieldPermissions,

    // New system functions
    loadStaffFieldPermissions,
    handleUpdateFieldPermission,
    handleSetRoleDefaults
  } = usePermissionsDemo();

  if (loading && permissions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu quyền hạn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <span className="mr-3">🎯</span>
            Demo Field Permissions
          </h1>
          <p className="mt-2 text-gray-600">Test các tính năng phân quyền chi tiết theo trường dữ liệu</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Permission Testing Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🧪</span>
            Test Quyền Hạn
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Staff ID:</label>
                <input
                  type="number"
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  placeholder="Nhập Staff ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer ID:</label>
                <input
                  type="number"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  placeholder="Nhập Customer ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              onClick={handleCheckPermission}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang kiểm tra...
                </>
              ) : (
                <>
                  <span className="mr-2">🔍</span>
                  Kiểm tra Quyền
                </>
              )}
            </button>
          </div>
        </div>

        {/* Field Permissions Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🔐</span>
            Legacy Field Permissions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(PERMISSION_SCOPE_MAP || {}).map(([scope, info]) => (
              <div key={scope} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 mb-1">{info.label}</h3>
                  <p className="text-sm text-gray-600">Category: {info.category}</p>
                </div>
                <button
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleGrantFieldPermission(scope, user)}
                  disabled={loading || !selectedStaffId || !selectedCustomerId}
                >
                  Cấp Quyền
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* New Staff Field Permissions Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🆕</span>
            Staff Field Permissions (New System)
          </h2>

          {/* Permission Level Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Permission Level:</label>
            <select
              value={selectedPermissionLevel}
              onChange={(e) => setSelectedPermissionLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(PERMISSION_LEVEL_MAP).map(([level, info]) => (
                <option key={level} value={level}>{info.label}</option>
              ))}
            </select>
          </div>

          {/* Role Quick Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Set Role Defaults</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSetRoleDefaults('ADMIN')}
                disabled={loading || !selectedStaffId}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50"
              >
                Admin Defaults
              </button>
              <button
                onClick={() => handleSetRoleDefaults('TECHNICIAN')}
                disabled={loading || !selectedStaffId}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50"
              >
                Technician Defaults
              </button>
              <button
                onClick={() => handleSetRoleDefaults('RECEPTIONIST')}
                disabled={loading || !selectedStaffId}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 disabled:opacity-50"
              >
                Receptionist Defaults
              </button>
            </div>
          </div>

          {/* Staff Field Permissions by Category */}
          {hasStaffPermissions && (
            <div className="space-y-6">
              {Object.entries(categorizedPermissions).map(([categoryKey, category]) => (
                <div key={categoryKey} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <span className="mr-2 text-lg">{category.icon}</span>
                    {category.label}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(category.fields).map(([fieldName, field]) => (
                      <div key={fieldName} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{field.label}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            PERMISSION_LEVEL_MAP[field.level]?.color || 'bg-gray-100 text-gray-800'
                          }`}>
                            {PERMISSION_LEVEL_MAP[field.level]?.label || field.level}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">{field.description}</p>
                        <div className="flex gap-1">
                          {Object.entries(PERMISSION_LEVEL_MAP).map(([level, levelInfo]) => (
                            <button
                              key={level}
                              onClick={() => handleUpdateFieldPermission(fieldName, level)}
                              disabled={loading || !selectedStaffId}
                              className={`px-2 py-1 text-xs rounded transition-colors duration-200 disabled:opacity-50 ${
                                field.level === level
                                  ? `${levelInfo.color} font-medium`
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load Button for Staff Permissions */}
          {!hasStaffPermissions && selectedStaffId && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No staff field permissions found for Staff ID {selectedStaffId}</p>
              <button
                onClick={() => loadStaffFieldPermissions(selectedStaffId)}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Load/Create Permissions
              </button>
            </div>
          )}
        </div>

        {/* Permissions List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📋</span>
            Danh sách Quyền Hạn
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">System Permissions</h3>
              <p className="text-3xl font-bold text-blue-600">{permissions.length}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Field Permissions</h3>
              <p className="text-3xl font-bold text-purple-600">{fieldPermissions.length}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">⚡</span>
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center"
              onClick={initializeSystemPermissions}
              disabled={loading}
            >
              <span className="mr-2">🔧</span>
              Khởi tạo System Permissions
            </button>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center"
              onClick={initializeDefaultFieldPermissions}
              disabled={loading}
            >
              <span className="mr-2">🔐</span>
              Khởi tạo Field Permissions
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center"
              onClick={fetchPermissions}
              disabled={loading}
            >
              <span className="mr-2">🔄</span>
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsDemo;
