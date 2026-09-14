package com.deadbeat.postapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Experiment 2.1.2 — Custom Exception: Resource Not Found
 *
 * Thrown by the service layer when a requested Post does not exist.
 * @ResponseStatus causes Spring to return HTTP 404 if this bubbles
 * up without being caught by GlobalExceptionHandler.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class PostNotFoundException extends RuntimeException {

    private final Long postId;

    public PostNotFoundException(Long postId) {
        super("Post with id " + postId + " not found");
        this.postId = postId;
    }

    public Long getPostId() {
        return postId;
    }
}
