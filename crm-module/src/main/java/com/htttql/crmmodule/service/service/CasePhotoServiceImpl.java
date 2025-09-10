package com.htttql.crmmodule.service.service;

import com.htttql.crmmodule.common.exception.ResourceNotFoundException;
import com.htttql.crmmodule.service.dto.CasePhotoResponse;
import com.htttql.crmmodule.service.entity.CasePhoto;
import com.htttql.crmmodule.service.entity.CustomerCase;
import com.htttql.crmmodule.common.enums.PhotoType;
import com.htttql.crmmodule.service.repository.ICasePhotoRepository;
import com.htttql.crmmodule.service.repository.ICustomerCaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CasePhotoServiceImpl implements ICasePhotoService {

    private final ICasePhotoRepository casePhotoRepository;
    private final ICustomerCaseRepository customerCaseRepository;

    private static final String UPLOAD_BASE_PATH = "uploads";

    @Override
    public CasePhotoResponse uploadPhoto(Long caseId, PhotoType type, String note, MultipartFile file) {
        return uploadMultiplePhotos(caseId, type, note, new MultipartFile[] { file }).get(0);
    }

    @Override
    public List<CasePhotoResponse> uploadMultiplePhotos(Long caseId, PhotoType type, String note,
            MultipartFile[] files) {
        CustomerCase customerCase = customerCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("Photo files cannot be empty");
        }

        List<CasePhotoResponse> savedPhotos = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue; // Skip empty files
            }

            validateFile(file);

            CasePhoto casePhoto = CasePhoto.builder()
                    .customerCase(customerCase)
                    .type(type)
                    .note(note)
                    .takenAt(LocalDateTime.now())
                    .isPublic(false)
                    .consentForMarketing(false)
                    .anonymized(false)
                    .build();

            String fileName = savePhotoFile(file, customerCase.getCustomer().getCustomerId());
            casePhoto.setFileName(fileName);
            casePhoto.setFileSize(file.getSize());
            casePhoto.setMimeType(file.getContentType());
            casePhoto.setFileUrl("/api/photos/download/" + customerCase.getCustomer().getCustomerId() + "/" + fileName);

            CasePhoto savedPhoto = casePhotoRepository.save(casePhoto);
            savedPhotos.add(convertToResponse(savedPhoto));
        }

        return savedPhotos;
    }

    @Override
    public List<CasePhotoResponse> getPhotosByCaseId(Long caseId) {
        List<CasePhoto> photos = casePhotoRepository.findByCustomerCase_CaseId(caseId);
        return photos.stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Override
    public List<CasePhotoResponse> getPhotosByCaseIdAndType(Long caseId, PhotoType type) {
        List<CasePhoto> photos = casePhotoRepository.findByCustomerCase_CaseIdAndType(caseId, type);
        return photos.stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Override
    public CasePhotoResponse getPhotoById(Long photoId) {
        CasePhoto casePhoto = casePhotoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo not found with ID: " + photoId));
        return convertToResponse(casePhoto);
    }

    @Override
    public void deletePhoto(Long photoId) {
        CasePhoto casePhoto = casePhotoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo not found with ID: " + photoId));

        Long customerId = casePhoto.getCustomerCase().getCustomer().getCustomerId();
        deletePhotoFile(casePhoto.getFileName(), customerId);
        casePhotoRepository.delete(casePhoto);
    }

    /**
     * Convert CasePhoto entity to CasePhotoResponse DTO
     */
    private CasePhotoResponse convertToResponse(CasePhoto casePhoto) {
        return CasePhotoResponse.builder()
                .photoId(casePhoto.getPhotoId())
                .caseId(casePhoto.getCustomerCase().getCaseId())
                .type(casePhoto.getType())
                .fileUrl(casePhoto.getFileUrl())
                .takenAt(casePhoto.getTakenAt())
                .takenByStaffId(casePhoto.getTakenBy().getStaffId())
                .takenByStaffName(casePhoto.getTakenBy().getFullName())
                .note(casePhoto.getNote())
                .fileName(casePhoto.getFileName())
                .fileSize(casePhoto.getFileSize())
                .mimeType(casePhoto.getMimeType())
                .isPrimary(casePhoto.getIsPrimary())
                .isPublic(casePhoto.getIsPublic())
                .consentForMarketing(casePhoto.getConsentForMarketing())
                .anonymized(casePhoto.getAnonymized())
                .deletionRequestedAt(casePhoto.getDeletionRequestedAt())
                .createdAt(casePhoto.getCreatedAt())
                .updatedAt(casePhoto.getUpdatedAt())
                .build();
    }

    private String savePhotoFile(MultipartFile file, Long customerId) {
        try {
            // Tạo thư mục theo ID khách hàng: uploads/{customerId}/
            Path customerUploadDir = Paths.get(UPLOAD_BASE_PATH, customerId.toString());
            if (!Files.exists(customerUploadDir)) {
                Files.createDirectories(customerUploadDir);
            }

            // Tạo filename với UUID: {uuid}.{extension}
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String filename = UUID.randomUUID().toString() + extension;

            Path filePath = customerUploadDir.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            log.info("Saved photo file: {} for customer: {}", filename, customerId);
            return filename;
        } catch (IOException e) {
            log.error("Error saving photo file for customer {}: {}", customerId, e.getMessage());
            throw new RuntimeException("Error saving photo file", e);
        }
    }

    private void validateFile(MultipartFile file) {
        // Kiểm tra kích thước file (max 10MB)
        long maxFileSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of 10MB");
        }

        // Kiểm tra loại file
        String contentType = file.getContentType();
        List<String> allowedTypes = Arrays.asList(
                "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp");

        if (contentType == null || !allowedTypes.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed");
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return ".jpg";
        }

        int lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex == -1) {
            return ".jpg";
        }

        String extension = filename.substring(lastDotIndex).toLowerCase();
        // Đảm bảo extension hợp lệ
        List<String> validExtensions = Arrays.asList(".jpg", ".jpeg", ".png", ".gif", ".webp");
        return validExtensions.contains(extension) ? extension : ".jpg";
    }

    private void deletePhotoFile(String filename, Long customerId) {
        try {
            Path filePath = Paths.get(UPLOAD_BASE_PATH, customerId.toString(), filename);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Deleted photo file: {} for customer: {}", filename, customerId);
            }
        } catch (IOException e) {
            log.error("Error deleting photo file: {}", e.getMessage());
        }
    }
}
