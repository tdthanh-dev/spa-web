package com.htttql.crmmodule.common.exception;

import com.htttql.crmmodule.common.dto.ApiResponse;
import com.htttql.crmmodule.lead.exception.LeadNotFoundException;
import com.htttql.crmmodule.lead.exception.LeadOperationException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Global exception handler
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(BadRequestException.class)
        public ResponseEntity<ApiResponse<Void>> handleBadRequestException(
                        BadRequestException ex, HttpServletRequest request) {
                log.error("Bad request: {}", ex.getMessage());
                return ResponseEntity.badRequest().body(
                                ApiResponse.<Void>builder()
                                                .success(false)
                                                .error(ex.getMessage())
                                                .errorCode(HttpStatus.BAD_REQUEST.value())
                                                .path(request.getRequestURI())
                                                .build());
        }

        @ExceptionHandler(UnauthorizedException.class)
        public ResponseEntity<ApiResponse<Void>> handleUnauthorizedException(
                        UnauthorizedException ex, HttpServletRequest request) {
                log.error("Unauthorized: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                                ApiResponse.<Void>builder()
                                                .success(false)
                                                .error(ex.getMessage())
                                                .errorCode(HttpStatus.UNAUTHORIZED.value())
                                                .path(request.getRequestURI())
                                                .build());
        }

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(
                        ResourceNotFoundException ex, HttpServletRequest request) {
                log.error("Resource not found: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                                ApiResponse.<Void>builder()
                                                .success(false)
                                                .error(ex.getMessage())
                                                .errorCode(HttpStatus.NOT_FOUND.value())
                                                .path(request.getRequestURI())
                                                .build());
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiResponse<ValidationErrorResponse>> handleValidationExceptions(
                        MethodArgumentNotValidException ex, HttpServletRequest request) {
                ValidationErrorResponse validationError = new ValidationErrorResponse();
                Map<String, String> fieldErrors = new HashMap<>();
                List<String> globalErrors = new ArrayList<>();

                ex.getBindingResult().getAllErrors().forEach((error) -> {
                        if (error instanceof FieldError) {
                                String fieldName = ((FieldError) error).getField();
                                String errorMessage = error.getDefaultMessage();
                                fieldErrors.put(fieldName, errorMessage);
                        } else {
                                globalErrors.add(error.getDefaultMessage());
                        }
                });

                validationError.setFieldErrors(fieldErrors);
                validationError.setGlobalErrors(globalErrors);

                log.error("Validation failed: {}", validationError);
                return ResponseEntity.badRequest().body(
                                ApiResponse.<ValidationErrorResponse>builder()
                                                .success(false)
                                                .error("Validation failed")
                                                .data(validationError)
                                                .errorCode(HttpStatus.BAD_REQUEST.value())
                                                .path(request.getRequestURI())
                                                .build());
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(
                        AccessDeniedException ex, HttpServletRequest request) {
                log.error("Access denied: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                                ApiResponse.<Void>builder()
                                                .success(false)
                                                .error("Access denied")
                                                .errorCode(HttpStatus.FORBIDDEN.value())
                                                .path(request.getRequestURI())
                                                .build());
        }

        @ExceptionHandler({ AuthenticationException.class, BadCredentialsException.class })
        public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(
                        Exception ex, HttpServletRequest request) {
                log.error("Authentication failed: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                                ApiResponse.<Void>builder()
                                                .success(false)
                                                .error("Authentication failed")
                                                .errorCode(HttpStatus.UNAUTHORIZED.value())
                                                .path(request.getRequestURI())
                                                .build());
        }

        @ExceptionHandler(LeadNotFoundException.class)
        public ResponseEntity<ApiResponse<Void>> handleLeadNotFoundException(
                        LeadNotFoundException ex, HttpServletRequest request) {
                log.error("Lead not found: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                                ApiResponse.<Void>builder()
                                                .success(false)
                                                .error(ex.getMessage())
                                                .errorCode(HttpStatus.NOT_FOUND.value())
                                                .path(request.getRequestURI())
                                                .build());
        }

        @ExceptionHandler(LeadOperationException.class)
        public ResponseEntity<ApiResponse<Void>> handleLeadOperationException(
                        LeadOperationException ex, HttpServletRequest request) {
                log.error("Lead operation failed: {}", ex.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                                ApiResponse.<Void>builder()
                                                .success(false)
                                                .error(ex.getMessage())
                                                .errorCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                                .path(request.getRequestURI())
                                                .build());
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiResponse<Void>> handleGlobalException(
                        Exception ex, HttpServletRequest request) {
                log.error("Unexpected error: ", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                                ApiResponse.<Void>builder()
                                                .success(false)
                                                .error("An unexpected error occurred")
                                                .errorCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                                .path(request.getRequestURI())
                                                .build());
        }
}
