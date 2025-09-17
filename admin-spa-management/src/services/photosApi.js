// filepath: src/services/photosApi.js
import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/config/constants';

export const photosApi = {
  /**
   * Upload multiple photos for a case
   * Backend endpoint: POST /api/photos/upload/multiple
   * Query parameters: caseId, type (BEFORE/AFTER)
   * Form fields: photoFiles[], note (optional)
   */
  async uploadPhotos(caseId, files, note = '', type = 'BEFORE') {
    const formData = new FormData();
    files.forEach((f) => formData.append('photoFiles', f));
    if (note) formData.append('note', note);
    // type is passed as query parameter, not form field

    const res = await apiClient.post(
      `${API_ENDPOINTS.PHOTOS}/upload/multiple?caseId=${caseId}&type=${encodeURIComponent(type)}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    // Backend returns ApiResponse format, so we need to extract data
    return res?.data?.data ?? res?.data ?? [];
  },

  /**
   * Get photos by case ID
   * Backend endpoint: GET /api/photos/case/{caseId}
   * Note: This method expects caseId, not customerId
   */
  async getPhotosByCase(caseId) {
    const res = await apiClient.get(`${API_ENDPOINTS.PHOTOS}/case/${caseId}`);
    return res?.data?.data ?? res?.data ?? [];
  },

  /**
   * Get photos by customer - DEPRECATED
   * This method is kept for backward compatibility but should not be used
   * Use getPhotosByCase(caseId) instead
   */
  async getPhotosByCustomer(customerId) {
    console.warn('getPhotosByCustomer() is deprecated. Use getPhotosByCase(caseId) instead.');
    console.warn('Note: customerId !== caseId. You need to pass the correct caseId.');

    // For now, try to use customerId as caseId (this might not work correctly)
    // TODO: Remove this method and update all callers to use getPhotosByCase
    return this.getPhotosByCase(customerId);
  },

  /**
   * Delete photo by ID
   * Backend endpoint: DELETE /api/photos/{photoId}
   */
  async deletePhoto(photoId) {
    const res = await apiClient.delete(`${API_ENDPOINTS.PHOTOS}/${photoId}`);
    return res?.data?.data ?? res?.data ?? true;
  },
};

export default photosApi;
