package com.deadbeat.postapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Experiment 2.1.2 — Custom Exception: Business Rule Violation
 *
 * Thrown when a request is syntactically valid (passes Bean Validation)
 * but violates a business rule — e.g. scheduling a post in the past.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}
