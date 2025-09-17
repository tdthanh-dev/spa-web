// filepath: admin-spa-management/src/pages/dashboards/TechnicianDashboard.jsx

import React from 'react';
import { formatDateTimeVN } from '@/utils/dateUtils';
import { useTechnicianDashboard } from '@/hooks/useTechnicianDashboard';
import { useNavigate } from 'react-router-dom';

/**
 * Technician Dashboard Component
 * UI component for technician dashboard - logic separated to custom hook
 * Styled with Tailwind CSS for modern, responsive design
 */
const TechnicianDashboard = ({ user }) => {
  const navigate = useNavigate();

  // Use custom hook for all business logic
  const {
    data,
    fetchDashboardData,
    handleUpdateAppointmentStatus,
    getStatusStyle,
    nextAppointment,
    performanceStats,
    recentWork,
    hasCurrentTreatment,
    hasTodayAppointments,
    hasMyAppointments
  } = useTechnicianDashboard(user);

  if (data.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎨 Technician Dashboard</h1>
        <p className="text-gray-600">Lịch làm việc cá nhân và quy trình điều trị</p>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{performanceStats.todayTotal}</div>
          <div className="text-sm text-gray-600">Lịch hẹn hôm nay</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{performanceStats.todayCompleted}</div>
          <div className="text-sm text-gray-600">Đã hoàn thành</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{performanceStats.currentTreatment}</div>
          <div className="text-sm text-gray-600">Đang điều trị</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-indigo-600 mb-2">{performanceStats.totalAppointments}</div>
          <div className="text-sm text-gray-600">Tổng lịch hẹn</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Current Treatment */}
        {hasCurrentTreatment && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🩺</span>
              Đang điều trị
            </h2>

            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
              <div className="mb-4">
                <h3 className="font-medium text-gray-900">{data.currentTreatment.customerName}</h3>
                <p className="text-gray-600">{data.currentTreatment.serviceName}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Bắt đầu: {data.currentTreatment.formattedTime}
                </p>
              </div>

              <button
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                onClick={() => handleUpdateAppointmentStatus(data.currentTreatment.id, 'COMPLETED')}
              >
                ✅ Hoàn thành
              </button>
            </div>
          </div>
        )}

        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📅</span>
            Lịch hôm nay ({data.todayAppointments.length})
          </h2>

          <div className="space-y-3">
            {!hasTodayAppointments ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📅</div>
                <p>Không có lịch hẹn nào hôm nay</p>
              </div>
            ) : (
              data.todayAppointments.map(appointment => {
                const statusStyle = getStatusStyle(appointment.status);
                return (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">{appointment.formattedTime}</div>
                        <div className="font-medium text-gray-900">{appointment.customerName}</div>
                        <div className="text-sm text-gray-600">{appointment.serviceName}</div>
                        {appointment.customerNotes && (
                          <div className="text-xs text-gray-500 mt-1">{appointment.customerNotes}</div>
                        )}
                      </div>
                      <div className="text-right">
                         <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mb-2`}
                               style={{ backgroundColor: statusStyle.background, color: statusStyle.color }}>
                           {statusStyle.label}
                         </span>
                        {(appointment.status === 'CONFIRMED' || appointment.status === 'CHECKED_IN') && (
                          <button
                            className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
                            onClick={() => handleUpdateAppointmentStatus(appointment.id, 'IN_PROGRESS')}
                          >
                            ▶️ {appointment.status === 'CHECKED_IN' ? 'Bắt đầu điều trị' : 'Bắt đầu'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Next Appointment */}
        {nextAppointment && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">⏭️</span>
            Lịch hẹn tiếp theo
          </h2>
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="mb-4">
                <h3 className="font-medium text-gray-900">{nextAppointment.customerName}</h3>
                <p className="text-gray-600">{nextAppointment.serviceName}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>🕐 {nextAppointment.formattedTime}</span>
                  <span>⏱️ {nextAppointment.formattedDuration || '60 phút'}</span>
                </div>
              </div>

              <div className="border-t border-blue-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Ghi chú chuẩn bị:</h4>
                <p className="text-sm text-gray-600">
                  {nextAppointment.customerNotes || 'Không có ghi chú đặc biệt'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Performance Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🏆</span>
            Hiệu suất của tôi
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Hoàn thành hôm nay:</span>
              <span className="font-medium text-gray-900">
                {performanceStats.todayCompleted}/{performanceStats.todayTotal}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Tổng lịch hẹn:</span>
              <span className="font-medium text-gray-900">{performanceStats.totalAppointments}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Tỷ lệ hoàn thành:</span>
              <span className="font-medium text-green-600">{performanceStats.completionRate}%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Đánh giá trung bình:</span>
              <span className="font-medium text-yellow-600">⭐ {performanceStats.averageRating}/5</span>
            </div>
          </div>
        </div>

        {/* Quick Tools */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🛠️</span>
            Công cụ nhanh
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 border border-blue-200"
              onClick={() => navigate('/technician/photos')}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">📷</div>
                <div className="text-sm font-medium text-blue-700">Tải ảnh lên</div>
              </div>
            </button>
            <button
              className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 border border-green-200"
              onClick={() => navigate('/technician/treatments')}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">📝</div>
                <div className="text-sm font-medium text-green-700">Ghi chú điều trị</div>
              </div>
            </button>
            <button
              className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 border border-purple-200"
              onClick={() => navigate('/technician/appointments')}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">📅</div>
                <div className="text-sm font-medium text-purple-700">Xem tất cả lịch hẹn</div>
              </div>
            </button>
            <button
              className="flex items-center justify-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors duration-200 border border-indigo-200"
              onClick={() => {
                console.log('🔄 Navigating to technician customer list');
                navigate('/technician/customer-list');
              }}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">👤</div>
                <div className="text-sm font-medium text-indigo-700">Xem khách hàng</div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Work */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📋</span>
            Công việc gần đây
          </h2>

          <div className="space-y-3">
            {recentWork && recentWork.length > 0 ? (
              recentWork.map((work, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{work.customerName}</div>
                    <div className="text-sm text-gray-600">{work.serviceName}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDateTimeVN(work.completedAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      {work.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {work.duration} phút
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📋</div>
                <div>Chưa có công việc gần đây</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {data.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <span className="text-red-800 font-medium">{data.error}</span>
            </div>
            <button
              onClick={fetchDashboardData}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
