package com.htttql.crmmodule.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Standard API response wrapper
 *
 * @param <T> Type of data payload
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    @Builder.Default
    private boolean success = true;
    private String message;
    private T data;
    

    private String error;

    private Integer errorCode;

    private String path;

    // Static factory methods for convenience

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .build();
    }

    public static <T> ApiResponse<PageResponse<T>> success(PageResponse<T> pageData) {
        return ApiResponse.<PageResponse<T>>builder()
                .success(true)
                .data(pageData)
                .build();
    }

    public static <T> ApiResponse<PageResponse<T>> success(PageResponse<T> pageData, String message) {
        return ApiResponse.<PageResponse<T>>builder()
                .success(true)
                .data(pageData)
                .message(message)
                .build();
    }

    public static ApiResponse<Void> success(String message) {
        return ApiResponse.<Void>builder()
                .success(true)
                .message(message)
                .build();
    }

    public static <T> ApiResponse<T> error(String error) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(error)
                .build();
    }

    public static <T> ApiResponse<T> error(String error, Integer errorCode) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(error)
                .errorCode(errorCode)
                .build();
    }

    public static <T> ApiResponse<T> error(String error, Integer errorCode, String path) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(error)
                .errorCode(errorCode)
                .path(path)
                .build();
    }

}
