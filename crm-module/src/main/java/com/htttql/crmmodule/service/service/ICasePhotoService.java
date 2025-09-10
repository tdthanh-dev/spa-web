package com.htttql.crmmodule.service.service;

import com.htttql.crmmodule.service.dto.CasePhotoResponse;
import com.htttql.crmmodule.common.enums.PhotoType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Simple service interface for CasePhoto
 */
public interface ICasePhotoService {

    /**
     * Upload a new photo
     */
    CasePhotoResponse uploadPhoto(Long caseId, PhotoType type, String note, MultipartFile file);

    /**
     * Upload multiple photos
     */
    List<CasePhotoResponse> uploadMultiplePhotos(Long caseId, PhotoType type, String note, MultipartFile[] files);

    /**
     * Get photos by case ID
     */
    List<CasePhotoResponse> getPhotosByCaseId(Long caseId);

    /**
     * Get photos by case ID and type
     */
    List<CasePhotoResponse> getPhotosByCaseIdAndType(Long caseId, PhotoType type);

    /**
     * Get photo by ID
     */
    CasePhotoResponse getPhotoById(Long photoId);

    /**
     * Delete a photo
     */
    void deletePhoto(Long photoId);
}
