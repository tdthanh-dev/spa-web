// filepath: admin-spa-management/src/pages/photos/PhotoGallery.jsx

import React, { useState, useEffect } from 'react';
import './PhotoGallery.css';

/**
 * Photo Gallery Component - For viewing and managing treatment photos
 * Technician can upload before/after photos for treatments
 */
const PhotoGallery = ({ userRole }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadCategory, setUploadCategory] = useState('before');

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setLoading(true);
    try {
      // TODO: Implement actual upload to backend /api/images/upload
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('category', uploadCategory);

      console.log('Uploading files:', selectedFiles);
      console.log('Category:', uploadCategory);
      
      // Simulate upload success
      setTimeout(() => {
        setUploadModal(false);
        setSelectedFiles([]);
        setLoading(false);
        alert('Upload thành công! (Demo - chưa connect backend)');
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setLoading(false);
      alert('Có lỗi khi upload. Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    // TODO: Fetch photos from API
    setPhotos(mockPhotos);
  }, []);

  return (
    <div className="photo-gallery">
      <div className="gallery-header">
        <h1>📷 Thư viện ảnh</h1>
        {userRole === 'TECHNICIAN' && (
          <button 
            className="btn btn-primary"
            onClick={() => setUploadModal(true)}
          >
            ⬆️ Upload ảnh
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button className="tab active">Tất cả</button>
        <button className="tab">Ảnh trước</button>
        <button className="tab">Ảnh sau</button>
        <button className="tab">Ảnh quá trình</button>
      </div>

      {/* Photo Grid */}
      <div className="photos-grid">
        {photos.map(photo => (
          <div key={photo.id} className="photo-card">
            <div className="photo-image">
              <img src={photo.url} alt={`${photo.category} - ${photo.customerName}`} />
              <div className="photo-overlay">
                <button className="view-btn">👁️ Xem</button>
                <button className="download-btn">⬇️ Tải</button>
              </div>
            </div>
            <div className="photo-info">
              <div className="photo-title">
                {photo.category === 'before' ? '📷 Trước' : 
                 photo.category === 'after' ? '📷 Sau' : '📷 Quá trình'}
              </div>
              <div className="customer-name">{photo.customerName}</div>
              <div className="service-name">{photo.serviceName}</div>
              <div className="upload-info">
                <span className="technician">{photo.technician}</span>
                <span className="upload-date">
                  {new Date(photo.uploadDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <div className="no-photos">
          <div className="no-photos-icon">📷</div>
          <p>Chưa có ảnh nào được upload</p>
          {userRole === 'TECHNICIAN' && (
            <button 
              className="upload-first-btn"
              onClick={() => setUploadModal(true)}
            >
              Upload ảnh đầu tiên
            </button>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {uploadModal && (
        <div className="modal-overlay" onClick={() => setUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📷 Upload ảnh điều trị</h2>
              <button className="modal-close" onClick={() => setUploadModal(false)}>✕</button>
            </div>
            
            <div className="upload-form">
              <div className="form-group">
                <label>Loại ảnh:</label>
                <select 
                  value={uploadCategory} 
                  onChange={(e) => setUploadCategory(e.target.value)}
                >
                  <option value="before">Ảnh trước điều trị</option>
                  <option value="after">Ảnh sau điều trị</option>
                  <option value="progress">Ảnh quá trình</option>
                </select>
              </div>

              <div className="form-group">
                <label>Chọn ảnh:</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="file-input"
                />
                {selectedFiles.length > 0 && (
                  <div className="selected-files">
                    <p>Đã chọn {selectedFiles.length} file(s):</p>
                    <ul>
                      {selectedFiles.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="upload-actions">
                <button 
                  type="button" 
                  onClick={() => setUploadModal(false)}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
                <button 
                  type="button"
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0 || loading}
                  className="btn btn-primary"
                >
                  {loading ? '⏳ Đang upload...' : '⬆️ Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
