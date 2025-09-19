package com.htttql.crmmodule.service.controller;

import com.htttql.crmmodule.common.dto.ApiResponse;
import com.htttql.crmmodule.common.enums.PhotoType;
import com.htttql.crmmodule.common.exception.ResourceNotFoundException;
import com.htttql.crmmodule.service.dto.CasePhotoResponse;
import com.htttql.crmmodule.service.entity.CasePhoto;
import com.htttql.crmmodule.service.repository.ICasePhotoRepository;
import com.htttql.crmmodule.service.service.ICasePhotoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
@Tag(name = "Case Photo Management (MVP)")
public class CasePhotoController {

    private final ICasePhotoService casePhotoService;
    private final ICasePhotoRepository casePhotoRepository;

    @Value("${app.upload.dir:./data/uploads}")
    private String uploadBasePath;

    // ---------- Upload ----------
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a new photo")
    @PreAuthorize("hasAnyRole('MANAGER','RECEPTIONIST','TECHNICIAN')")
    public ResponseEntity<ApiResponse<CasePhotoResponse>> uploadPhoto(
            @RequestParam("caseId") Long caseId,
            @RequestParam("type") PhotoType type,
            @RequestParam(value = "note", required = false) String note,
            @RequestParam("photoFile") MultipartFile photoFile) {

        CasePhotoResponse photo = casePhotoService.uploadPhoto(caseId, type, note, photoFile);
        return ResponseEntity.status(201).body(ApiResponse.success(photo, "Photo uploaded"));
    }

    @PostMapping(value = "/upload/multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload multiple photos")
    @PreAuthorize("hasAnyRole('MANAGER','RECEPTIONIST','TECHNICIAN')")
    public ResponseEntity<ApiResponse<List<CasePhotoResponse>>> uploadMultiplePhotos(
            @RequestParam("caseId") Long caseId,
            @RequestParam("type") PhotoType type,
            @RequestParam(value = "note", required = false) String note,
            @RequestParam("photoFiles") MultipartFile[] photoFiles) {

        List<CasePhotoResponse> photos = casePhotoService.uploadMultiplePhotos(caseId, type, note, photoFiles);
        return ResponseEntity.status(201).body(ApiResponse.success(photos, photos.size() + " photos uploaded"));
    }

    // ---------- Query ----------
    @GetMapping("/case/{caseId}")
    @Operation(summary = "Get all photos for a case")
    @PreAuthorize("hasAnyRole('MANAGER','RECEPTIONIST','TECHNICIAN')")
    public ResponseEntity<ApiResponse<List<CasePhotoResponse>>> getPhotosByCaseId(@PathVariable Long caseId) {
        return ResponseEntity.ok(ApiResponse.success(casePhotoService.getPhotosByCaseId(caseId), "OK"));
    }

    @GetMapping("/case/{caseId}/type/{type}")
    @Operation(summary = "Get photos by case ID and type")
    @PreAuthorize("hasAnyRole('MANAGER','RECEPTIONIST','TECHNICIAN')")
    public ResponseEntity<ApiResponse<List<CasePhotoResponse>>> getPhotosByCaseIdAndType(
            @PathVariable Long caseId,
            @PathVariable PhotoType type) {
        return ResponseEntity.ok(ApiResponse.success(casePhotoService.getPhotosByCaseIdAndType(caseId, type), "OK"));
    }

    @GetMapping("/{photoId}")
    @Operation(summary = "Get photo by ID (metadata)")
    @PreAuthorize("hasAnyRole('MANAGER','RECEPTIONIST','TECHNICIAN')")
    public ResponseEntity<ApiResponse<CasePhotoResponse>> getPhotoById(@PathVariable Long photoId) {
        return ResponseEntity.ok(ApiResponse.success(casePhotoService.getPhotoById(photoId), "OK"));
    }

    // ---------- Download by photoId (stream) ----------
    @GetMapping("/download/{photoId}")
    @Operation(summary = "Download photo file by photoId")
    @PreAuthorize("hasAnyRole('MANAGER','RECEPTIONIST','TECHNICIAN')")
    public ResponseEntity<?> downloadPhoto(@PathVariable Long photoId) {
        CasePhoto p = casePhotoRepository.findById(photoId)
                .orElseThrow(() -> new ResourceNotFoundException("Photo not found: " + photoId));

        try {
            Path base = Paths.get(uploadBasePath).toAbsolutePath().normalize();
            Path target = base.resolve(p.getStoragePath()).normalize();
            if (!target.startsWith(base)) return ResponseEntity.status(403).body("Forbidden path");

            if (!Files.exists(target) || !Files.isRegularFile(target)) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(target);
            if (contentType == null) contentType = p.getMimeType();

            long length = Files.size(target);
            var resource = new InputStreamResource(Files.newInputStream(target));

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + p.getFileName() + "\"")
                    .header(HttpHeaders.CACHE_CONTROL, "private, max-age=31536000, immutable")
                    .contentType(MediaType.parseMediaType(contentType))
                    .contentLength(length)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("IO error");
        }
    }

    // ---------- Delete ----------
    @DeleteMapping("/{photoId}")
    @Operation(summary = "Delete photo by ID")
    @PreAuthorize("hasAnyRole('MANAGER','RECEPTIONIST','TECHNICIAN')")
    public ResponseEntity<ApiResponse<Void>> deletePhoto(@PathVariable Long photoId) {
        casePhotoService.deletePhoto(photoId);
        return ResponseEntity.ok(ApiResponse.success("Photo deleted"));
    }
}
