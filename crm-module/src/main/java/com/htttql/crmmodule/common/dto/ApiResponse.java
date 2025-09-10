package com.htttql.crmmodule.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

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

    // Pagination metadata - only included when data is paginated
    private PaginationMeta pagination;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

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

    public static <T> ApiResponse<Page<T>> success(Page<T> pageData) {
        return ApiResponse.<Page<T>>builder()
                .success(true)
                .data(pageData)
                .pagination(PaginationMeta.from(pageData))
                .build();
    }

    public static <T> ApiResponse<Page<T>> success(Page<T> pageData, String message) {
        return ApiResponse.<Page<T>>builder()
                .success(true)
                .data(pageData)
                .message(message)
                .pagination(PaginationMeta.from(pageData))
                .build();
    }

    public static <T> ApiResponse<List<T>> success(List<T> listData, String message) {
        return ApiResponse.<List<T>>builder()
                .success(true)
                .data(listData)
                .message(message)
                .build();
    }

    public static ApiResponse<Void> success(String message) {
        return ApiResponse.<Void>builder()
                .success(true)
                .data(null)
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

    /**
     * Pagination metadata
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PaginationMeta {
        private int currentPage;
        private int totalPages;
        private long totalElements;
        private int pageSize;
        private boolean hasNext;
        private boolean hasPrevious;
        private boolean isFirst;
        private boolean isLast;
        private int numberOfElements;

        public static <T> PaginationMeta from(Page<T> page) {
            return PaginationMeta.builder()
                    .currentPage(page.getNumber())
                    .totalPages(page.getTotalPages())
                    .totalElements(page.getTotalElements())
                    .pageSize(page.getSize())
                    .hasNext(page.hasNext())
                    .hasPrevious(page.hasPrevious())
                    .isFirst(page.isFirst())
                    .isLast(page.isLast())
                    .numberOfElements(page.getNumberOfElements())
                    .build();
        }
    }
}
