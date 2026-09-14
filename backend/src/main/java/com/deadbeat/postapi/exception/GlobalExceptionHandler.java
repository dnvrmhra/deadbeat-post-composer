package com.deadbeat.postapi.exception;

import com.deadbeat.postapi.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Experiment 2.1.2 — Global Exception Handler
 *
 * @RestControllerAdvice is a combination of @ControllerAdvice + @ResponseBody.
 * It intercepts exceptions thrown anywhere in the Controller layer and converts
 * them into structured ErrorResponse objects — eliminating per-controller
 * try/catch blocks and ensuring a consistent error format for the frontend.
 *
 * Handled scenarios:
 *  1. PostNotFoundException      → 404 Not Found
 *  2. BusinessRuleException      → 400 Bad Request
 *  3. MethodArgumentNotValidException → 400 with field-level errors (Bean Validation)
 *  4. Generic Exception          → 500 Internal Server Error (safety net)
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Retrieves the correlation ID from MDC (set by CorrelationIdFilter).
     * Included in every error response for request tracing.
     */
    private String getCorrelationId() {
        return MDC.get("correlationId");
    }

    /**
     * Handler 1: Post not found — HTTP 404
     */
    @ExceptionHandler(PostNotFoundException.class)
    public ResponseEntity<ErrorResponse> handlePostNotFound(
            PostNotFoundException ex,
            HttpServletRequest request) {

        log.warn("[{}] Post not found: id={}", getCorrelationId(), ex.getPostId());

        ErrorResponse body = ErrorResponse.builder()
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .correlationId(getCorrelationId())
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    /**
     * Handler 2: Business rule violation — HTTP 400
     */
    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ErrorResponse> handleBusinessRule(
            BusinessRuleException ex,
            HttpServletRequest request) {

        log.warn("[{}] Business rule violation: {}", getCorrelationId(), ex.getMessage());

        ErrorResponse body = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .correlationId(getCorrelationId())
                .build();

        return ResponseEntity.badRequest().body(body);
    }

    /**
     * Handler 3: Bean Validation failure (@Valid on request body) — HTTP 400
     *
     * Collects all field-level constraint violations and returns them
     * in the fieldErrors map so the frontend can highlight specific inputs.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String field = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            fieldErrors.put(field, message);
        });

        log.warn("[{}] Validation failed on {} — fields: {}",
                getCorrelationId(), request.getRequestURI(), fieldErrors);

        ErrorResponse body = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Failed")
                .message("One or more fields failed validation. See 'fieldErrors' for details.")
                .path(request.getRequestURI())
                .correlationId(getCorrelationId())
                .fieldErrors(fieldErrors)
                .build();

        return ResponseEntity.badRequest().body(body);
    }

    /**
     * Handler 4: Safety-net for any unhandled exception — HTTP 500
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(
            Exception ex,
            HttpServletRequest request) {

        log.error("[{}] Unhandled exception on {}: {}",
                getCorrelationId(), request.getRequestURI(), ex.getMessage(), ex);

        ErrorResponse body = ErrorResponse.builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message("An unexpected error occurred. Reference correlationId for debugging.")
                .path(request.getRequestURI())
                .correlationId(getCorrelationId())
                .build();

        return ResponseEntity.internalServerError().body(body);
    }
}
