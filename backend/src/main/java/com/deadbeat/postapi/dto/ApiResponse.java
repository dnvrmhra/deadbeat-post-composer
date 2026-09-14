package com.deadbeat.postapi.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Experiment 2.1.1 — Standardized API Response Wrapper
 *
 * All endpoints return this envelope so the frontend always receives
 * a predictable structure regardless of success or failure.
 *
 * Structure:
 * {
 *   "success": true,
 *   "message": "Post created successfully",
 *   "data": { ... },
 *   "timestamp": "2026-09-13T19:00:00"
 * }
 *
 * @JsonInclude(NON_NULL) — null fields (e.g. data on errors) are omitted
 * from the JSON output to keep responses clean.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }
}
