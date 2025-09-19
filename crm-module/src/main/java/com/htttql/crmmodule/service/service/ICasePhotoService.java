package com.htttql.crmmodule.service.service;

import com.htttql.crmmodule.common.enums.PhotoType;
import com.htttql.crmmodule.service.dto.CasePhotoResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ICasePhotoService {
    CasePhotoResponse uploadPhoto(Long caseId, PhotoType type, String note, MultipartFile file);
    List<CasePhotoResponse> uploadMultiplePhotos(Long caseId, PhotoType type, String note, MultipartFile[] files);

    List<CasePhotoResponse> getPhotosByCaseId(Long caseId);
    List<CasePhotoResponse> getPhotosByCaseIdAndType(Long caseId, PhotoType type);
    CasePhotoResponse getPhotoById(Long photoId);

    void deletePhoto(Long photoId);
}
