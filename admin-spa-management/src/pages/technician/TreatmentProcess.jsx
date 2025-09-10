import React, { useState, useEffect } from 'react';
import { appointmentsAPI, spaCustomersAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { formatDateTimeVN } from '@/utils/dateUtils';
import './TreatmentProcess.css';

const TreatmentProcess = () => {
  const { user } = useAuth();
  const [currentTreatment, setCurrentTreatment] = useState(null);
  const [upcomingTreatments, setUpcomingTreatments] = useState([]);
  const [completedTreatments, setCompletedTreatments] = useState([]);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [treatmentNotes, setTreatmentNotes] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadTreatmentData();
    }
  }, [user?.id]);

  const loadTreatmentData = async () => {
    try {
      setLoading(true);

      // Get all appointments for this technician
      const response = await appointmentsAPI.getAll(0, 50);
      const allAppointments = response.data?.success ? response.data.data.content || [] : [];

      // Filter appointments for this technician
      const technicianAppointments = allAppointments.filter(apt => apt.technicianId === user.id);

      // Separate by status
      const current = technicianAppointments.find(apt => apt.status === 'IN_PROGRESS');
      const upcoming = technicianAppointments.filter(apt =>
        ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN'].includes(apt.status)
      );
      const completed = technicianAppointments.filter(apt => apt.status === 'COMPLETED');

      setCurrentTreatment(current || null);
      setUpcomingTreatments(upcoming.slice(0, 10)); // Show next 10
      setCompletedTreatments(completed.slice(0, 20)); // Show last 20

    } catch (error) {
      console.error('Error loading treatment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTreatment = async (appointmentId) => {
    try {
      await appointmentsAPI.updateStatus(appointmentId, 'IN_PROGRESS');
      await loadTreatmentData();
    } catch (error) {
      console.error('Error starting treatment:', error);
      alert('Có lỗi khi bắt đầu điều trị');
    }
  };

  const handleCompleteTreatment = async (appointmentId, notes) => {
    try {
      // First update appointment status
      await appointmentsAPI.updateStatus(appointmentId, 'COMPLETED');

      // TODO: Save treatment notes to technician notes API
      if (notes) {
        // This would save to technician notes service
        console.log('Saving treatment notes:', notes);
      }

      setSelectedTreatment(null);
      setTreatmentNotes('');
      await loadTreatmentData();

      alert('Điều trị hoàn thành thành công!');
    } catch (error) {
      console.error('Error completing treatment:', error);
      alert('Có lỗi khi hoàn thành điều trị');
    }
  };

  const handleCancelTreatment = async (appointmentId, reason) => {
    try {
      await appointmentsAPI.updateStatus(appointmentId, 'CANCELLED');
      await loadTreatmentData();
    } catch (error) {
      console.error('Error cancelling treatment:', error);
      alert('Có lỗi khi hủy điều trị');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'SCHEDULED': { class: 'scheduled', label: 'Đã lên lịch', color: '#fbbf24' },
      'CONFIRMED': { class: 'confirmed', label: 'Đã xác nhận', color: '#3b82f6' },
      'CHECKED_IN': { class: 'checked-in', label: 'Đã check-in', color: '#10b981' },
      'IN_PROGRESS': { class: 'in-progress', label: 'Đang điều trị', color: '#8b5cf6' },
      'COMPLETED': { class: 'completed', label: 'Hoàn thành', color: '#10b981' },
      'CANCELLED': { class: 'cancelled', label: 'Đã hủy', color: '#ef4444' }
    };
    return statusMap[status] || statusMap.SCHEDULED;
  };

  if (loading) {
    return (
      <div className="treatment-process">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu điều trị...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="treatment-process">
      <div className="header">
        <h1>🩺 Quá trình điều trị</h1>
        <p>Quản lý các buổi điều trị và ghi chú kỹ thuật</p>
      </div>

      {/* Current Treatment */}
      {currentTreatment && (
        <div className="current-treatment-section">
          <h2>🔄 Đang điều trị</h2>
          <div className="current-treatment-card">
            <div className="treatment-header">
              <div className="patient-info">
                <h3>{currentTreatment.customerName}</h3>
                <p>{currentTreatment.serviceName}</p>
                <p className="treatment-time">
                  Bắt đầu: {formatDateTimeVN(currentTreatment.startAt)}
                </p>
              </div>
              <div className="treatment-status">
                <span className={`status-badge ${getStatusBadge(currentTreatment.status).class}`}>
                  {getStatusBadge(currentTreatment.status).label}
                </span>
              </div>
            </div>

            <div className="treatment-actions">
              <button
                className="action-btn complete"
                onClick={() => setSelectedTreatment(currentTreatment)}
              >
                ✅ Hoàn thành điều trị
              </button>
              <button
                className="action-btn pause"
                onClick={() => handleCancelTreatment(currentTreatment.id, 'Paused by technician')}
              >
                ⏸️ Tạm dừng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Treatment Completion Modal */}
      {selectedTreatment && (
        <div className="modal-overlay" onClick={() => setSelectedTreatment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Hoàn thành điều trị</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedTreatment(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="treatment-summary">
                <h3>{selectedTreatment.customerName}</h3>
                <p><strong>Dịch vụ:</strong> {selectedTreatment.serviceName}</p>
                <p><strong>Thời gian:</strong> {formatDateTimeVN(selectedTreatment.startAt)}</p>
              </div>

              <div className="treatment-notes">
                <label htmlFor="treatment-notes">Ghi chú điều trị:</label>
                <textarea
                  id="treatment-notes"
                  value={treatmentNotes}
                  onChange={(e) => setTreatmentNotes(e.target.value)}
                  placeholder="Ghi chú về quá trình điều trị, kỹ thuật sử dụng, sản phẩm đã dùng..."
                  rows={6}
                />
              </div>

              <div className="treatment-checklist">
                <h4>Danh sách kiểm tra:</h4>
                <div className="checklist-items">
                  <label className="checklist-item">
                    <input type="checkbox" /> Tư vấn trước điều trị
                  </label>
                  <label className="checklist-item">
                    <input type="checkbox" /> Kiểm tra da và chống chỉ định
                  </label>
                  <label className="checklist-item">
                    <input type="checkbox" /> Vệ sinh và chuẩn bị dụng cụ
                  </label>
                  <label className="checklist-item">
                    <input type="checkbox" /> Thực hiện kỹ thuật đúng quy trình
                  </label>
                  <label className="checklist-item">
                    <input type="checkbox" /> Hướng dẫn chăm sóc sau điều trị
                  </label>
                  <label className="checklist-item">
                    <input type="checkbox" /> Lên lịch retouch (nếu cần)
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setSelectedTreatment(null)}
              >
                Hủy
              </button>
              <button
                className="btn-primary"
                onClick={() => handleCompleteTreatment(selectedTreatment.id, treatmentNotes)}
              >
                ✅ Hoàn thành
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="treatment-content">
        {/* Upcoming Treatments */}
        <div className="upcoming-treatments">
          <h2>📅 Lịch điều trị sắp tới ({upcomingTreatments.length})</h2>

          <div className="treatments-list">
            {upcomingTreatments.length === 0 ? (
              <div className="no-treatments">
                <div className="no-data-icon">📅</div>
                <p>Không có lịch điều trị nào sắp tới</p>
              </div>
            ) : (
              upcomingTreatments.map(treatment => {
                const statusInfo = getStatusBadge(treatment.status);
                return (
                  <div key={treatment.id} className="treatment-card upcoming">
                    <div className="treatment-time">
                      {formatDateTimeVN(treatment.startAt)}
                    </div>

                    <div className="treatment-info">
                      <div className="patient-name">{treatment.customerName}</div>
                      <div className="service-name">{treatment.serviceName}</div>
                      <div className="treatment-duration">⏱️ 60 phút</div>
                    </div>

                    <div className="treatment-status">
                      <span className={`status-badge ${statusInfo.class}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="treatment-actions">
                      {treatment.status === 'CHECKED_IN' && (
                        <button
                          className="action-btn start"
                          onClick={() => handleStartTreatment(treatment.id)}
                        >
                          ▶️ Bắt đầu
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Completed Treatments */}
        <div className="completed-treatments">
          <h2>✅ Lịch sử điều trị ({completedTreatments.length})</h2>

          <div className="treatments-list">
            {completedTreatments.length === 0 ? (
              <div className="no-treatments">
                <div className="no-data-icon">✅</div>
                <p>Chưa có lịch điều trị nào hoàn thành</p>
              </div>
            ) : (
              completedTreatments.map(treatment => {
                const statusInfo = getStatusBadge(treatment.status);
                return (
                  <div key={treatment.id} className="treatment-card completed">
                    <div className="treatment-time">
                      {formatDateTimeVN(treatment.startAt)}
                    </div>

                    <div className="treatment-info">
                      <div className="patient-name">{treatment.customerName}</div>
                      <div className="service-name">{treatment.serviceName}</div>
                      <div className="completion-note">Hoàn thành thành công</div>
                    </div>

                    <div className="treatment-status">
                      <span className={`status-badge ${statusInfo.class}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="treatment-actions">
                      <button className="action-btn view">👁️ Chi tiết</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="treatment-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{upcomingTreatments.length}</div>
            <div className="stat-label">Lịch sắp tới</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{currentTreatment ? 1 : 0}</div>
            <div className="stat-label">Đang điều trị</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{completedTreatments.length}</div>
            <div className="stat-label">Hoàn thành</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">4.8</div>
            <div className="stat-label">Đánh giá TB</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreatmentProcess;
