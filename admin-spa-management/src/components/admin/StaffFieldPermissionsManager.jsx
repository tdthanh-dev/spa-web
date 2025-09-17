
import React, { useEffect, useMemo, useState } from 'react'
import staffUsersApi from '@/services/staffUsersApi'
import staffFieldPermissionsApi from '@/services/staffFieldPermissionsApi'
import { PERMISSION_LEVEL_MAP, STAFF_FIELD_PERMISSIONS_MAP, PERMISSION_CATEGORIES } from '@/config/constants'
import { LoadingSpinner, EmptyState } from '@/components/common/CommonComponents'

const PermissionLevelSelect = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-primary-200 rounded-lg px-2 py-1 text-sm"
    >
      <option value="NO">{PERMISSION_LEVEL_MAP.NO.label}</option>
      <option value="VIEW">{PERMISSION_LEVEL_MAP.VIEW.label}</option>
      <option value="EDIT">{PERMISSION_LEVEL_MAP.EDIT.label}</option>
    </select>
  )
}

const CategoryCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl border border-primary-100 shadow-sm p-4">
    <div className="flex items-center gap-2 mb-3">
      <span className="text-lg">{icon}</span>
      <h3 className="text-black-800 font-semibold">{title}</h3>
    </div>
    <div className="space-y-2">
      {children}
    </div>
  </div>
)

const FieldRow = ({ label, description, value, onChange }) => (
  <div className="flex items-center justify-between gap-3 py-2">
    <div>
      <div className="text-sm text-black-800 font-medium">{label}</div>
      <div className="text-xs text-black-500">{description}</div>
    </div>
    <PermissionLevelSelect value={value} onChange={onChange} />
  </div>
)

const StaffFieldPermissionsManager = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [staffList, setStaffList] = useState([])
  const [selectedStaffId, setSelectedStaffId] = useState(null)
  const [permissions, setPermissions] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        const staffResp = await staffUsersApi.getStaffUsers({ size: 100 })
        const content = staffResp?.content || staffResp?.data || []
        setStaffList(content)
        if (content.length > 0) {
          setSelectedStaffId(content[0].staffId)
        }
      } catch (e) {
        setError('Không tải được danh sách nhân viên')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    const loadPermissions = async () => {
      if (!selectedStaffId) return
      try {
        setLoading(true)
        const data = await staffFieldPermissionsApi.getPermissions(selectedStaffId)
        setPermissions(data)
      } catch (e) {
        // BE will auto-create now; but just in case, try create then get
        try {
          await staffFieldPermissionsApi.createPermissions(selectedStaffId)
          const data = await staffFieldPermissionsApi.getPermissions(selectedStaffId)
          setPermissions(data)
        } catch (err) {
          setError('Không tải được quyền của nhân viên')
        }
      } finally {
        setLoading(false)
      }
    }
    loadPermissions()
  }, [selectedStaffId])

  const categorized = useMemo(() => {
    if (!permissions) return {}
    const result = {}
    Object.entries(permissions).forEach(([key, val]) => {
      if (key === 'staffId') return
      const meta = STAFF_FIELD_PERMISSIONS_MAP[key]
      if (!meta) return
      const category = meta.category
      if (!result[category]) result[category] = []
      result[category].push({ key, value: val, meta })
    })
    return result
  }, [permissions])

  const handleChange = (field, value) => {
    setPermissions((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!selectedStaffId || !permissions) return
    setSaving(true)
    try {
      await staffFieldPermissionsApi.updatePermissions(selectedStaffId, permissions)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner text="Đang tải quyền truy cập..." />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-black-900 text-xl font-semibold">Quản lý quyền trường</h2>
          <span className="text-sm text-black-500">Chọn nhân viên để cấu hình</span>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="border border-primary-200 rounded-lg px-3 py-2 text-sm min-w-[240px]"
            value={selectedStaffId || ''}
            onChange={(e) => setSelectedStaffId(Number(e.target.value))}
          >
            {staffList.map((s) => (
              <option key={s.staffId} value={s.staffId}>
                {s.fullName} - {s.position}
              </option>
            ))}
          </select>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded-lg text-white text-sm ${saving ? 'bg-primary-300' : 'bg-primary-600 hover:bg-primary-700'}`}
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      {!permissions ? (
        <EmptyState title="Chưa có dữ liệu quyền" description="Hãy chọn một nhân viên để cấu hình quyền." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(PERMISSION_CATEGORIES).map(([catKey, cat]) => (
            <CategoryCard key={catKey} title={cat.label} icon={cat.icon}>
              {(categorized[catKey] || []).map(({ key, value, meta }) => (
                <FieldRow
                  key={key}
                  label={meta.label}
                  description={meta.description}
                  value={value}
                  onChange={(v) => handleChange(key, v)}
                />
              ))}
            </CategoryCard>
          ))}
        </div>
      )}
    </div>
  )
}

export default StaffFieldPermissionsManager
