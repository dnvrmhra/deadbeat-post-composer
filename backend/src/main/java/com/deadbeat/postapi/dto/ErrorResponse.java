package com.deadbeat.postapi.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Experiment 2.1.2 — Structured Error Response
 *
 * Returned by GlobalExceptionHandler for all error scenarios.
 * Includes the correlation ID so the frontend can report it for debugging.
 *
 * Structure:
 * {
 *   "success": false,
 *   "status": 404,
 *   "error": "Not Found",
 *   "message": "Post with id 42 not found",
 *   "path": "/api/posts/42",
 *   "correlationId": "a3f7c1...",
 *   "fieldErrors": { "content": "must not be blank" },
 *   "timestamp": "2026-09-13T19:00:00"
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    @Builder.Default
    private boolean success = false;

    private int status;
    private String error;
    private String message;
    private String path;
    private String correlationId;

    /** Field-level validation errors from @Valid — key = field name, value = violation message */
    private Map<String, String> fieldErrors;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
