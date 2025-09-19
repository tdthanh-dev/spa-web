package com.htttql.crmmodule.service.service;

import com.htttql.crmmodule.common.exception.ResourceNotFoundException;
import com.htttql.crmmodule.common.enums.PhotoType;
import com.htttql.crmmodule.core.entity.StaffUser;
import com.htttql.crmmodule.core.repository.IStaffUserRepository;
import com.htttql.crmmodule.service.dto.CasePhotoResponse;
import com.htttql.crmmodule.service.entity.CasePhoto;
import com.htttql.crmmodule.service.entity.CustomerCase;
import com.htttql.crmmodule.service.repository.ICasePhotoRepository;
import com.htttql.crmmodule.service.repository.ICustomerCaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CasePhotoServiceImpl implements ICasePhotoService {

    private final ICasePhotoRepository casePhotoRepository;
    private final ICustomerCaseRepository customerCaseRepository;
    private final IStaffUserRepository staffUserRepository;

    @Value("${app.upload.dir:./data/uploads}")
    private String uploadBasePath; // nên trỏ ra ngoài source

    @Value("${app.file.download-base:/api/photos}")
    private String fileDownloadBase; // để build URL: /api/photos/download/{id}

    private static final long MAX_SIZE = 10L * 1024 * 1024; // 10MB

    @Override
    public CasePhotoResponse uploadPhoto(Long caseId, PhotoType type, String note, MultipartFile file) {
        return uploadMultiplePhotos(caseId, type, note, new MultipartFile[]{file}).get(0);
    }

    @Override
    public List<CasePhotoResponse> uploadMultiplePhotos(Long caseId, PhotoType type, String note, MultipartFile[] files) {
        CustomerCase customerCase = customerCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case not found: " + caseId));

        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("Photo files cannot be empty");
        }

        StaffUser currentStaff = getCurrentStaff();
        List<Path> createdFiles = new ArrayList<>();
        List<CasePhotoResponse> responses = new ArrayList<>();

        try {
            for (MultipartFile f : files) {
                if (f == null || f.isEmpty()) continue;

                String mime = validateAndDetectMime(f);     // đảm bảo là ảnh thật
                String ext  = chooseExtensionFromMimeOrName(mime, f.getOriginalFilename());
                String relPath = savePhotoFile(f, customerCase.getCustomer().getCustomerId(), customerCase.getCaseId(), ext, createdFiles);

                String fileName = relPath.substring(relPath.lastIndexOf('/') + 1);
                long size = f.getSize();

                CasePhoto entity = CasePhoto.builder()
                        .customerCase(customerCase)
                        .type(type)
                        .storagePath(relPath)
                        .fileName(fileName)
                        .fileSize(size)
                        .mimeType(mime)
                        .takenAt(OffsetDateTime.now())
                        .takenBy(currentStaff)
                        .note(note)
                        .build();

                CasePhoto saved = casePhotoRepository.save(entity);
                responses.add(toDto(saved));
            }
            return responses;
        } catch (RuntimeException ex) {
            // rollback file nếu có lỗi
            for (Path p : createdFiles) {
                try { Files.deleteIfExists(p); } catch (IOException ignore) {}
            }
            throw ex;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<CasePhotoResponse> getPhotosByCaseId(Long caseId) {
        return casePhotoRepository.findByCustomerCase_CaseId(caseId)
                .stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CasePhotoResponse> getPhotosByCaseIdAndType(Long caseId, PhotoType type) {
        return casePhotoRepository.findByCustomerCase_CaseIdAndType(caseId, type)
                .stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CasePhotoResponse getPhotoById(Long photoId) {
        CasePhoto p = casePhotoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo not found: " + photoId));
        return toDto(p);
    }

    @Override
    public void deletePhoto(Long photoId) {
        CasePhoto p = casePhotoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo not found: " + photoId));

        final String rel = p.getStoragePath();
        casePhotoRepository.delete(p); // xoá DB trước

        // best-effort xoá file
        try {
            Path base = Paths.get(uploadBasePath).toAbsolutePath().normalize();
            Path target = base.resolve(rel).normalize();
            if (target.startsWith(base)) Files.deleteIfExists(target);
        } catch (IOException e) {
            log.warn("Failed to delete file for photo {}: {}", photoId, e.getMessage());
        }
    }

    // ---------- Helpers ----------

    private CasePhotoResponse toDto(CasePhoto cp) {
        String url = fileDownloadBase + "/download/" + cp.getPhotoId();
        return CasePhotoResponse.builder()
                .photoId(cp.getPhotoId())
                .caseId(cp.getCustomerCase().getCaseId())
                .type(cp.getType())
                .url(url)
                .takenAt(cp.getTakenAt())
                .takenByStaffId(cp.getTakenBy() != null ? cp.getTakenBy().getStaffId() : null)
                .takenByStaffName(cp.getTakenBy() != null ? cp.getTakenBy().getFullName() : null)
                .note(cp.getNote())
                .fileName(cp.getFileName())
                .fileSize(cp.getFileSize())
                .mimeType(cp.getMimeType())
                .storagePath(cp.getStoragePath())
                .build();
    }

    private String savePhotoFile(MultipartFile file, Long customerId, Long caseId, String extension,
                                 List<Path> createdFiles) {
        try {
            LocalDate now = LocalDate.now();
            Path base = Paths.get(uploadBasePath).toAbsolutePath().normalize();
            Path dir = base.resolve(customerId.toString())
                    .resolve(caseId.toString())
                    .resolve(String.format("%04d/%02d/%02d", now.getYear(), now.getMonthValue(), now.getDayOfMonth()))
                    .normalize();

            if (!dir.startsWith(base)) throw new SecurityException("Invalid storage path");
            Files.createDirectories(dir);

            String filename = UUID.randomUUID() + extension;
            Path temp = Files.createTempFile(dir, "up-", ".tmp");
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, temp, StandardCopyOption.REPLACE_EXISTING);
            }
            Path target = dir.resolve(filename);
            Files.move(temp, target, StandardCopyOption.ATOMIC_MOVE);

            createdFiles.add(target);
            return base.relativize(target).toString().replace("\\", "/");
        } catch (IOException e) {
            throw new RuntimeException("Error saving photo file", e);
        }
    }

    /** Đọc ảnh bằng ImageIO để chắc là ảnh thật + lấy/khớp MIME cơ bản */
    private String validateAndDetectMime(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Photo file is empty");
        if (file.getSize() > MAX_SIZE) throw new IllegalArgumentException("File exceeds 10MB");

        try (InputStream in = file.getInputStream()) {
            BufferedImage img = ImageIO.read(in);
            if (img == null) throw new IllegalArgumentException("Invalid image content");
        } catch (IOException e) {
            throw new IllegalArgumentException("Cannot read image", e);
        }

        String ct = Optional.ofNullable(file.getContentType()).orElse("").toLowerCase();
        // lớp bảo vệ phụ
        List<String> allowed = List.of("image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp");
        if (!allowed.contains(ct)) throw new IllegalArgumentException("Only JPEG/PNG/GIF/WebP are allowed");
        return "image/jpg".equals(ct) ? "image/jpeg" : ct;
    }

    private String chooseExtensionFromMimeOrName(String mime, String originalName) {
        if (mime == null) mime = "";
        switch (mime) {
            case "image/jpeg": return ".jpg";
            case "image/png":  return ".png";
            case "image/gif":  return ".gif";
            case "image/webp": return ".webp";
            default: break;
        }
        if (originalName != null && originalName.contains(".")) {
            String ext = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
            if (List.of(".jpg",".jpeg",".png",".gif",".webp").contains(ext)) return ".jpg".equals(ext)?".jpg":ext;
        }
        return ".jpg";
    }

    /** (tuỳ chọn) checksum nếu muốn chống trùng ảnh – chưa dùng đến */
    @SuppressWarnings("unused")
    private String sha256(Path path) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] all = Files.readAllBytes(path);
            byte[] out = md.digest(all);
            StringBuilder sb = new StringBuilder();
            for (byte b : out) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            return null;
        }
    }

    private StaffUser getCurrentStaff() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                log.debug("No authentication found or user not authenticated");
                return null;
            }

            Object principal = auth.getPrincipal();
            if (principal == null) {
                log.debug("Authentication principal is null");
                return null;
            }

            final String username;
            if (principal instanceof UserDetails ud) {
                username = ud.getUsername();
            } else if (principal instanceof String s && !"anonymousUser".equalsIgnoreCase(s)) {
                username = s;
            } else {
                username = null;
            }

            if (username == null || username.trim().isEmpty()) {
                log.debug("Username is null or empty");
                return null;
            }

            // Try to find staff by email first, then by phone
            return staffUserRepository.findByEmail(username)
                    .or(() -> staffUserRepository.findByPhone(username))
                    .orElseGet(() -> {
                        log.debug("StaffUser not found for username: {}", username);
                        return null;
                    });
        } catch (Exception e) {
            log.warn("Error resolving StaffUser: {}", e.getMessage(), e);
            return null;
        }
    }
}
