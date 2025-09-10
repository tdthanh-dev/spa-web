package com.htttql.crmmodule.service.controller;

import com.htttql.crmmodule.common.dto.ApiResponse;
import com.htttql.crmmodule.common.enums.PhotoType;
import com.htttql.crmmodule.service.dto.CasePhotoResponse;
import com.htttql.crmmodule.service.service.ICasePhotoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * Simple REST Controller for CasePhoto management
 */
@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Case Photo Management", description = "Simple APIs for managing before/after photos")
public class CasePhotoController {

    private final ICasePhotoService casePhotoService;
    private static final String UPLOAD_BASE_PATH = "uploads";

    @PostMapping("/upload")
    @Operation(summary = "Upload a new photo", description = "Upload a before or after photo for a customer case")
    @PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<CasePhotoResponse>> uploadPhoto(
            @RequestParam("caseId") Long caseId,
            @RequestParam("type") PhotoType type,
            @RequestParam(value = "note", required = false) String note,
            @RequestParam("photoFile") MultipartFile photoFile) {

        log.info("Uploading single photo for case ID: {}, type: {}", caseId, type);

        CasePhotoResponse photo = casePhotoService.uploadPhoto(caseId, type, note, photoFile);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(photo, "Photo uploaded successfully"));
    }

    @PostMapping("/upload/multiple")
    @Operation(summary = "Upload multiple photos", description = "Upload multiple before or after photos for a customer case")
    @PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<List<CasePhotoResponse>>> uploadMultiplePhotos(
            @RequestParam("caseId") Long caseId,
            @RequestParam("type") PhotoType type,
            @RequestParam(value = "note", required = false) String note,
            @RequestParam("photoFiles") MultipartFile[] photoFiles) {

        log.info("Uploading {} photos for case ID: {}, type: {}", photoFiles.length, caseId, type);

        List<CasePhotoResponse> photos = casePhotoService.uploadMultiplePhotos(caseId, type, note, photoFiles);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(photos, photos.size() + " photos uploaded successfully"));
    }

    @GetMapping("/case/{caseId}")
    @Operation(summary = "Get all photos for a case", description = "Retrieve all photos for a specific case")
    @PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<List<CasePhotoResponse>>> getPhotosByCaseId(
            @PathVariable Long caseId) {

        List<CasePhotoResponse> photos = casePhotoService.getPhotosByCaseId(caseId);
        return ResponseEntity.ok(ApiResponse.success(photos, "Photos retrieved successfully"));
    }

    @GetMapping("/case/{caseId}/type/{type}")
    @Operation(summary = "Get photos by case ID and type", description = "Retrieve photos by type (BEFORE or AFTER)")
    @PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<List<CasePhotoResponse>>> getPhotosByCaseIdAndType(
            @PathVariable Long caseId,
            @PathVariable PhotoType type) {

        List<CasePhotoResponse> photos = casePhotoService.getPhotosByCaseIdAndType(caseId, type);
        return ResponseEntity.ok(ApiResponse.success(photos, "Photos retrieved successfully"));
    }

    @GetMapping("/{photoId}")
    @Operation(summary = "Get photo by ID", description = "Retrieve a specific photo by its ID")
    @PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<CasePhotoResponse>> getPhotoById(
            @PathVariable Long photoId) {

        CasePhotoResponse photo = casePhotoService.getPhotoById(photoId);
        return ResponseEntity.ok(ApiResponse.success(photo, "Photo retrieved successfully"));
    }

    @GetMapping("/download/{customerId}/{filename}")
    @Operation(summary = "Download photo file", description = "Download the actual photo file from customer-specific directory")
    @PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST', 'TECHNICIAN')")
    public ResponseEntity<ByteArrayResource> downloadPhotoFile(
            @PathVariable Long customerId,
            @PathVariable String filename) {

        try {
            // Validate filename để tránh path traversal attack
            if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
                log.warn("Invalid filename attempt: {}", filename);
                return ResponseEntity.badRequest().build();
            }

            // Read file from customer-specific directory
            Path filePath = Paths.get(UPLOAD_BASE_PATH, customerId.toString(), filename);

            if (!Files.exists(filePath)) {
                log.warn("File not found: {}", filePath);
                return ResponseEntity.notFound().build();
            }

            byte[] fileContent = Files.readAllBytes(filePath);
            ByteArrayResource resource = new ByteArrayResource(fileContent);

            // Determine content type based on file extension
            String contentType = getContentTypeFromFilename(filename);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (IOException e) {
            log.error("Error reading photo file: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    private String getContentTypeFromFilename(String filename) {
        String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        return switch (extension) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            default -> "application/octet-stream";
        };
    }

    @DeleteMapping("/{photoId}")
    @Operation(summary = "Delete photo", description = "Delete a photo and its associated file")
    @PreAuthorize("hasAnyRole('MANAGER', 'RECEPTIONIST', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<Void>> deletePhoto(
            @PathVariable Long photoId) {

        casePhotoService.deletePhoto(photoId);
        return ResponseEntity.ok(ApiResponse.success("Photo deleted successfully"));
    }
}
