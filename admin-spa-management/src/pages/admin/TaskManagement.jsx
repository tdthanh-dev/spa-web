import React, { useState, useEffect } from 'react';
import { tasksAPI, auditAPI } from '@/services/api';
import { formatDateTimeVN } from '@/utils/dateUtils';
import { useAuth } from '@/hooks/useAuth';
import './TaskManagement.css';

const TaskManagement = () => {
  const { userRole, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'tasks') {
        const tasksResponse = await tasksAPI.getAll(0, 50);
        setTasks(tasksResponse.data?.content || []);
      } else {
        const auditResponse = await auditAPI.getLogs(0, 50);
        setAuditLogs(auditResponse.data?.content || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      const statusData = {
        status: newStatus,
        reason: `Updated by ${userRole} at ${new Date().toISOString()}`
      };

      await tasksAPI.updateStatus(taskId, statusData);
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Có lỗi khi cập nhật trạng thái task');
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await tasksAPI.create(taskData);
      setShowCreateTask(false);
      loadData();
      alert('Tạo task thành công!');
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Có lỗi khi tạo task');
    }
  };

  const getTaskStatusBadge = (status) => {
    const statusMap = {
      'TODO': { class: 'todo', label: 'Chưa làm', color: '#6b7280' },
      'IN_PROGRESS': { class: 'in-progress', label: 'Đang làm', color: '#3b82f6' },
      'REVIEW': { class: 'review', label: 'Đang review', color: '#f59e0b' },
      'COMPLETED': { class: 'completed', label: 'Hoàn thành', color: '#10b981' },
      'CANCELLED': { class: 'cancelled', label: 'Đã hủy', color: '#ef4444' }
    };
    return statusMap[status] || statusMap.TODO;
  };

  const getAuditActionBadge = (action) => {
    const actionMap = {
      'CREATE': { class: 'create', label: 'Tạo mới', color: '#10b981' },
      'UPDATE': { class: 'update', label: 'Cập nhật', color: '#3b82f6' },
      'DELETE': { class: 'delete', label: 'Xóa', color: '#ef4444' },
      'LOGIN': { class: 'login', label: 'Đăng nhập', color: '#8b5cf6' },
      'LOGOUT': { class: 'logout', label: 'Đăng xuất', color: '#6b7280' }
    };
    return actionMap[action] || { class: 'unknown', label: action, color: '#6b7280' };
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm ||
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = !searchTerm ||
      log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const renderTasksTab = () => (
    <div className="tasks-section">
      <div className="section-header">
        <h3>📋 Quản lý nhiệm vụ</h3>
        {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
          <button
            className="create-btn"
            onClick={() => setShowCreateTask(true)}
          >
            ➕ Tạo nhiệm vụ
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="search-group">
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, mô tả, người thực hiện..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="TODO">Chưa làm</option>
            <option value="IN_PROGRESS">Đang làm</option>
            <option value="REVIEW">Đang review</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="tasks-grid">
        {filteredTasks.map(task => {
          const statusInfo = getTaskStatusBadge(task.status);
          return (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <div className="task-title">{task.title}</div>
                <div className="task-status">
                  <span className={`status-badge ${statusInfo.class}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              <div className="task-body">
                <div className="task-description">
                  {task.description || 'Không có mô tả'}
                </div>

                <div className="task-meta">
                  <div className="meta-item">
                    <span className="label">Người thực hiện:</span>
                    <span className="value">{task.assignedTo || 'Chưa phân công'}</span>
                  </div>

                  <div className="meta-item">
                    <span className="label">Người tạo:</span>
                    <span className="value">{task.createdBy || 'N/A'}</span>
                  </div>

                  <div className="meta-item">
                    <span className="label">Hạn hoàn thành:</span>
                    <span className="value">
                      {task.dueDate ? formatDateTimeVN(task.dueDate) : 'Không có hạn'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="task-footer">
                <div className="task-dates">
                  <div className="created-date">
                    Tạo: {formatDateTimeVN(task.createdAt)}
                  </div>
                  {task.updatedAt && task.updatedAt !== task.createdAt && (
                    <div className="updated-date">
                      Cập nhật: {formatDateTimeVN(task.updatedAt)}
                    </div>
                  )}
                </div>

                <div className="task-actions">
                  <button
                    className="view-btn"
                    onClick={() => setSelectedTask(task)}
                  >
                    👁️ Chi tiết
                  </button>

                  {(userRole === 'ADMIN' || userRole === 'MANAGER' || task.assignedTo === user?.name) && (
                    <>
                      {task.status === 'TODO' && (
                        <button
                          className="start-btn"
                          onClick={() => handleTaskStatusUpdate(task.id, 'IN_PROGRESS')}
                        >
                          ▶️ Bắt đầu
                        </button>
                      )}

                      {task.status === 'IN_PROGRESS' && (
                        <button
                          className="review-btn"
                          onClick={() => handleTaskStatusUpdate(task.id, 'REVIEW')}
                        >
                          👁️ Review
                        </button>
                      )}

                      {task.status === 'REVIEW' && (
                        <button
                          className="complete-btn"
                          onClick={() => handleTaskStatusUpdate(task.id, 'COMPLETED')}
                        >
                          ✅ Hoàn thành
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <div className="no-data">
          <div className="no-data-icon">📋</div>
          <p>Không tìm thấy nhiệm vụ nào</p>
        </div>
      )}
    </div>
  );

  const renderAuditTab = () => (
    <div className="audit-section">
      <div className="section-header">
        <h3>📊 Nhật ký hoạt động</h3>
        <div className="audit-actions">
          <button className="export-btn">📊 Xuất báo cáo</button>
        </div>
      </div>

      {/* Search */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên người dùng, hành động, đối tượng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Audit Logs Table */}
      <div className="audit-table">
        <table>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Người dùng</th>
              <th>Hành động</th>
              <th>Đối tượng</th>
              <th>Chi tiết</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {filteredAuditLogs.map(log => {
              const actionInfo = getAuditActionBadge(log.action);
              return (
                <tr key={log.id}>
                  <td>{formatDateTimeVN(log.timestamp)}</td>
                  <td>{log.userName}</td>
                  <td>
                    <span className={`action-badge ${actionInfo.class}`}>
                      {actionInfo.label}
                    </span>
                  </td>
                  <td>{log.entityType}</td>
                  <td>{log.details || 'N/A'}</td>
                  <td>{log.ipAddress || 'N/A'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredAuditLogs.length === 0 && (
        <div className="no-data">
          <div className="no-data-icon">📊</div>
          <p>Không tìm thấy nhật ký nào</p>
        </div>
      )}
    </div>
  );

  // Task Details Modal
  const renderTaskDetailsModal = () => {
    if (!selectedTask) return null;

    return (
      <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Chi tiết nhiệm vụ #{selectedTask.id}</h2>
            <button
              className="modal-close"
              onClick={() => setSelectedTask(null)}
            >
              ✕
            </button>
          </div>

          <div className="modal-body">
            <div className="task-details">
              <div className="detail-section">
                <h3>{selectedTask.title}</h3>
                <div className="status-section">
                  <span className={`status-badge ${getTaskStatusBadge(selectedTask.status).class}`}>
                    {getTaskStatusBadge(selectedTask.status).label}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h4>Mô tả</h4>
                <p>{selectedTask.description || 'Không có mô tả'}</p>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <label>Người thực hiện:</label>
                  <span>{selectedTask.assignedTo || 'Chưa phân công'}</span>
                </div>

                <div className="detail-item">
                  <label>Người tạo:</label>
                  <span>{selectedTask.createdBy || 'N/A'}</span>
                </div>

                <div className="detail-item">
                  <label>Hạn hoàn thành:</label>
                  <span>{selectedTask.dueDate ? formatDateTimeVN(selectedTask.dueDate) : 'Không có hạn'}</span>
                </div>

                <div className="detail-item">
                  <label>Độ ưu tiên:</label>
                  <span>{selectedTask.priority || 'Normal'}</span>
                </div>
              </div>

              {selectedTask.comments && selectedTask.comments.length > 0 && (
                <div className="detail-section">
                  <h4>Bình luận</h4>
                  <div className="comments-list">
                    {selectedTask.comments.map((comment, index) => (
                      <div key={index} className="comment">
                        <div className="comment-author">{comment.author}</div>
                        <div className="comment-content">{comment.content}</div>
                        <div className="comment-date">{formatDateTimeVN(comment.createdAt)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              className="btn-secondary"
              onClick={() => setSelectedTask(null)}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="task-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu nhiệm vụ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-management">
      <div className="header">
        <h1>📋 Quản lý nhiệm vụ & Nhật ký</h1>
        <p>Quản lý nhiệm vụ và theo dõi hoạt động hệ thống</p>
      </div>

      {/* Tab Navigation */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          📋 Nhiệm vụ
        </button>
        <button
          className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          📊 Nhật ký
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'tasks' && renderTasksTab()}
        {activeTab === 'audit' && renderAuditTab()}
      </div>

      {/* Modals */}
      {renderTaskDetailsModal()}
    </div>
  );
};

export default TaskManagement;
