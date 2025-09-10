// filepath: admin-spa-management/src/pages/services/ServiceManagement.jsx

import React, { useState, useEffect } from 'react';
import { servicesAPI } from '@/services/api';
import { formatDateTimeVN } from '@/utils/dateUtils';
import './ServiceManagement.css';

/**
 * Service Management Component - ADMIN only
 * CRUD interface for managing spa services
 */
const ServiceManagement = () => {
  const [data, setData] = useState({
    services: [],
    categories: [],
    totalElements: 0,
    loading: true,
    error: null
  });

  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    serviceName: '',
    description: '',
    category: '',
    price: '',
    promotionalPrice: '',
    durationMinutes: '',
    status: 'ACTIVE',
    notes: '',
    requiresConsultation: false
  });

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const fetchServices = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      const response = await servicesAPI.getAll(0, 50); // Get more services for management view
      
      if (response.data && response.data.success) {
        const servicesData = response.data.data;
        setData(prev => ({
          ...prev,
          services: servicesData.content || [],
          totalElements: servicesData.totalElements || 0,
          loading: false
        }));
      }

    } catch (error) {
      console.error('Error fetching services:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Không thể tải danh sách dịch vụ. Vui lòng thử lại.'
      }));
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await servicesAPI.getCategories();
      if (response.data && response.data.success) {
        setData(prev => ({
          ...prev,
          categories: response.data.data || []
        }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreateService = () => {
    setEditingService(null);
    setFormData({
      serviceName: '',
      description: '',
      category: '',
      price: '',
      promotionalPrice: '',
      durationMinutes: '',
      status: 'ACTIVE',
      notes: '',
      requiresConsultation: false
    });
    setShowModal(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setFormData({
      serviceName: service.serviceName || '',
      description: service.description || '',
      category: service.category || '',
      price: service.price || '',
      promotionalPrice: service.promotionalPrice || '',
      durationMinutes: service.durationMinutes || '',
      status: service.status || 'ACTIVE',
      notes: service.notes || '',
      requiresConsultation: service.requiresConsultation || false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        promotionalPrice: formData.promotionalPrice ? parseFloat(formData.promotionalPrice) : null,
        durationMinutes: formData.durationMinutes ? parseInt(formData.durationMinutes) : null
      };

      if (editingService) {
        await servicesAPI.update(editingService.id, submitData);
      } else {
        await servicesAPI.create(submitData);
      }

      setShowModal(false);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Có lỗi xảy ra khi lưu dịch vụ. Vui lòng thử lại.');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
      try {
        await servicesAPI.delete(serviceId);
        fetchServices();
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Có lỗi xảy ra khi xóa dịch vụ. Vui lòng thử lại.');
      }
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      ACTIVE: { background: '#dcfce7', color: '#166534', label: 'Hoạt động' },
      INACTIVE: { background: '#f3f4f6', color: '#6b7280', label: 'Tạm ngưng' },
      DISCONTINUED: { background: '#fee2e2', color: '#dc2626', label: 'Ngưng cung cấp' },
      COMING_SOON: { background: '#fef3c7', color: '#92400e', label: 'Sắp ra mắt' }
    };
    return styles[status] || styles.ACTIVE;
  };

  if (data.loading) {
    return (
      <div className="service-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách dịch vụ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="service-management">
      {/* Header */}
      <div className="management-header">
        <h1>💼 Quản lý Dịch vụ</h1>
        <button className="btn btn-primary" onClick={handleCreateService}>
          ➕ Thêm dịch vụ mới
        </button>
      </div>

      {/* Categories Overview */}
      <div className="categories-section">
        <h2>📊 Danh mục dịch vụ</h2>
        <div className="categories-grid">
          {data.categories.map((category) => (
            <div key={category.code} className="category-card">
              <div className="category-header">
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.displayName}</span>
              </div>
              <div className="category-count">{category.serviceCount} dịch vụ</div>
            </div>
          ))}
        </div>
      </div>

      {/* Services List */}
      <div className="services-section">
        <h2>📋 Danh sách dịch vụ ({data.totalElements})</h2>
        
        {data.error && (
          <div className="error-message">
            <span>⚠️</span>
            <span>{data.error}</span>
            <button onClick={fetchServices} className="retry-btn">Thử lại</button>
          </div>
        )}

        <div className="services-table-container">
          <table className="services-table">
            <thead>
              <tr>
                <th>Dịch vụ</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.services.map((service) => {
                const statusStyle = getStatusStyle(service.status);
                
                return (
                  <tr key={service.id}>
                    <td>
                      <div className="service-info">
                        <div className="service-name">{service.serviceName}</div>
                        <div className="service-description">{service.description}</div>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">
                        {service.categoryIcon} {service.categoryDisplayName}
                      </span>
                    </td>
                    <td>
                      <div className="price-info">
                        <div className="current-price">{service.formattedPrice}</div>
                        {service.hasPromotion && (
                          <div className="promo-price">
                            Khuyến mãi: {service.promotionalPrice?.toLocaleString('vi-VN')}đ
                            <span className="discount">(-{service.discountPercentage}%)</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{service.formattedDuration}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{
                          background: statusStyle.background,
                          color: statusStyle.color
                        }}
                      >
                        {statusStyle.label}
                      </span>
                    </td>
                    <td>{formatDateTimeVN(service.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn edit"
                          onClick={() => handleEditService(service)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDeleteService(service.id)}
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
        </div>
      </div>

      {/* Service Form Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="service-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Tên dịch vụ *</label>
                  <input
                    type="text"
                    value={formData.serviceName}
                    onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Danh mục *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {data.categories.map(cat => (
                      <option key={cat.code} value={cat.category}>
                        {cat.icon} {cat.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Giá (VNĐ) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Giá khuyến mãi (VNĐ)</label>
                  <input
                    type="number"
                    value={formData.promotionalPrice}
                    onChange={(e) => setFormData({...formData, promotionalPrice: e.target.value})}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Thời gian (phút)</label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({...formData, durationMinutes: e.target.value})}
                    min="15"
                    max="480"
                  />
                </div>

                <div className="form-group">
                  <label>Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Tạm ngưng</option>
                    <option value="COMING_SOON">Sắp ra mắt</option>
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label>Mô tả dịch vụ</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  placeholder="Mô tả chi tiết về dịch vụ..."
                />
              </div>

              <div className="form-group full-width">
                <label>Ghi chú</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="2"
                  placeholder="Ghi chú thêm..."
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.requiresConsultation}
                    onChange={(e) => setFormData({...formData, requiresConsultation: e.target.checked})}
                  />
                  Yêu cầu tư vấn trước khi thực hiện
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingService ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
