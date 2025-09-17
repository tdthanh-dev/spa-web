package com.htttql.crmmodule.service.service;

import com.htttql.crmmodule.common.exception.ResourceNotFoundException;
import com.htttql.crmmodule.core.entity.StaffUser;
import com.htttql.crmmodule.core.repository.IStaffUserRepository;
import com.htttql.crmmodule.service.dto.CasePhotoResponse;
import com.htttql.crmmodule.service.entity.CasePhoto;
import com.htttql.crmmodule.service.entity.CustomerCase;
import com.htttql.crmmodule.common.enums.PhotoType;
import com.htttql.crmmodule.service.repository.ICasePhotoRepository;
import com.htttql.crmmodule.service.repository.ICustomerCaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CasePhotoServiceImpl implements ICasePhotoService {

    private final ICasePhotoRepository casePhotoRepository;
    private final ICustomerCaseRepository customerCaseRepository;
    private final IStaffUserRepository staffUserRepository;

    private static final String UPLOAD_BASE_PATH = "uploads";

    @Override
    public CasePhotoResponse uploadPhoto(Long caseId, PhotoType type, String note, MultipartFile file) {
        return uploadMultiplePhotos(caseId, type, note, new MultipartFile[]{file}).get(0);
    }

    @Override
    public List<CasePhotoResponse> uploadMultiplePhotos(Long caseId, PhotoType type, String note, MultipartFile[] files) {
        CustomerCase customerCase = customerCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found with ID: " + caseId));

        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("Photo files cannot be empty");
        }

        // 👇 Có thể là null (cho phép)
        StaffUser currentStaff = getCurrentStaff();

        List<CasePhotoResponse> savedPhotos = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) continue;

            validateFile(file);

            CasePhoto casePhoto = CasePhoto.builder()
                    .customerCase(customerCase)
                    .type(type)
                    .note(note)
                    .takenAt(LocalDateTime.now())
                    .takenBy(currentStaff) // 👈 có thể null
                    .isPublic(false)
                    .consentForMarketing(false)
                    .anonymized(false)
                    .build();

            String fileName = savePhotoFile(file, customerCase.getCustomer().getCustomerId());
            casePhoto.setFileName(fileName);
            casePhoto.setFileSize(file.getSize());
            casePhoto.setMimeType(file.getContentType());
            casePhoto.setFileUrl("/api/photos/download/" + customerCase.getCustomer().getCustomerId() + "/" + fileName);

            CasePhoto saved = casePhotoRepository.save(casePhoto);
            savedPhotos.add(convertToResponse(saved));
        }
        return savedPhotos;
    }

    @Override
    public List<CasePhotoResponse> getPhotosByCaseId(Long caseId) {
        return casePhotoRepository.findByCustomerCase_CaseId(caseId)
                .stream().map(this::convertToResponse).toList();
    }

    @Override
    public List<CasePhotoResponse> getPhotosByCaseIdAndType(Long caseId, PhotoType type) {
        return casePhotoRepository.findByCustomerCase_CaseIdAndType(caseId, type)
                .stream().map(this::convertToResponse).toList();
    }

    @Override
    public CasePhotoResponse getPhotoById(Long photoId) {
        CasePhoto p = casePhotoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo not found with ID: " + photoId));
        return convertToResponse(p);
    }

    @Override
    public void deletePhoto(Long photoId) {
        CasePhoto p = casePhotoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo not found with ID: " + photoId));
        Long customerId = p.getCustomerCase().getCustomer().getCustomerId();
        deletePhotoFile(p.getFileName(), customerId);
        casePhotoRepository.delete(p);
    }

    private CasePhotoResponse convertToResponse(CasePhoto cp) {
        return CasePhotoResponse.builder()
                .photoId(cp.getPhotoId())
                .caseId(cp.getCustomerCase().getCaseId())
                .type(cp.getType())
                .fileUrl(cp.getFileUrl())
                .takenAt(cp.getTakenAt())
                .takenByStaffId(cp.getTakenBy() != null ? cp.getTakenBy().getStaffId() : null)
                .takenByStaffName(cp.getTakenBy() != null ? cp.getTakenBy().getFullName() : null)
                .note(cp.getNote())
                .fileName(cp.getFileName())
                .fileSize(cp.getFileSize())
                .mimeType(cp.getMimeType())
                .isPrimary(cp.getIsPrimary())
                .isPublic(cp.getIsPublic())
                .consentForMarketing(cp.getConsentForMarketing())
                .anonymized(cp.getAnonymized())
                .deletionRequestedAt(cp.getDeletionRequestedAt())
                .createdAt(cp.getCreatedAt())
                .updatedAt(cp.getUpdatedAt())
                .build();
    }

    private String savePhotoFile(MultipartFile file, Long customerId) {
        try {
            Path dir = Paths.get(UPLOAD_BASE_PATH, customerId.toString());
            if (!Files.exists(dir)) Files.createDirectories(dir);

            String ext = getFileExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + ext;

            Files.copy(file.getInputStream(), dir.resolve(filename));
            return filename;
        } catch (IOException e) {
            throw new RuntimeException("Error saving photo file", e);
        }
    }

    private void deletePhotoFile(String filename, Long customerId) {
        try {
            Path p = Paths.get(UPLOAD_BASE_PATH, customerId.toString(), filename);
            if (Files.exists(p)) Files.delete(p);
        } catch (IOException e) {
            log.error("Error deleting photo file: {}", e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        long max = 10 * 1024 * 1024;
        if (file.getSize() > max) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of 10MB");
        }
        String ct = Optional.ofNullable(file.getContentType()).orElse("").toLowerCase();
        List<String> allowed = List.of("image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp");
        if (!allowed.contains(ct)) {
            throw new IllegalArgumentException("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed");
        }
    }

    private String getFileExtension(String name) {
        if (name == null) return ".jpg";
        int i = name.lastIndexOf(".");
        if (i < 0) return ".jpg";
        String ext = name.substring(i).toLowerCase();
        List<String> valid = List.of(".jpg", ".jpeg", ".png", ".gif", ".webp");
        return valid.contains(ext) ? ext : ".jpg";
    }

    /** Lấy StaffUser từ SecurityContext – có thể trả null (cho phép) */
    private StaffUser getCurrentStaff() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) return null;

            Object principal = auth.getPrincipal();

            if (principal instanceof UserDetails ud) {
                String username = ud.getUsername();
                return staffUserRepository.findByEmail(username)
                        .or(() -> staffUserRepository.findByPhone(username))
                        .orElse(null);
            }
            if (principal instanceof String s) {
                if ("anonymousUser".equalsIgnoreCase(s)) return null;
                return staffUserRepository.findByEmail(s)
                        .or(() -> staffUserRepository.findByPhone(s))
                        .orElse(null);
            }
            return null;
        } catch (Exception e) {
            log.warn("Cannot resolve StaffUser from SecurityContext: {}", e.getMessage());
            return null;
        }
    }
}
