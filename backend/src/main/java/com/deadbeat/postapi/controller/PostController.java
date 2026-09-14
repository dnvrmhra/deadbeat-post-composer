package com.deadbeat.postapi.controller;

import com.deadbeat.postapi.dto.ApiResponse;
import com.deadbeat.postapi.dto.PostRequestDto;
import com.deadbeat.postapi.model.Post;
import com.deadbeat.postapi.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Experiment 2.1.1 — Controller Layer (REST API)
 *
 * Handles all inbound HTTP requests for the /api/posts resource.
 * Delegates business logic entirely to PostService — the controller
 * is intentionally thin (no business logic here).
 *
 * REST design applied:
 *  GET    /api/posts          → list all posts
 *  GET    /api/posts/{id}     → get single post
 *  GET    /api/posts?platform → filter by platform
 *  POST   /api/posts          → create new post
 *  PUT    /api/posts/{id}     → full update
 *  DELETE /api/posts/{id}     → delete
 *
 * @Valid triggers Bean Validation on the @RequestBody before the method executes.
 * If validation fails, MethodArgumentNotValidException is thrown and caught by
 * GlobalExceptionHandler — the controller never needs a try/catch.
 *
 * All responses are wrapped in ApiResponse<T> for consistency (Experiment 2.1.1).
 */
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Slf4j
public class PostController {

    private final PostService postService;

    /**
     * GET /api/posts
     * GET /api/posts?platform=Twitter
     *
     * Returns all posts, optionally filtered by platform.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Post>>> getAllPosts(
            @RequestParam(required = false) String platform) {

        List<Post> posts = (platform != null && !platform.isBlank())
                ? postService.getPostsByPlatform(platform)
                : postService.getAllPosts();

        return ResponseEntity.ok(
                ApiResponse.success("Posts retrieved successfully", posts));
    }

    /**
     * GET /api/posts/{id}
     *
     * Returns a single post by ID.
     * Throws PostNotFoundException (→ 404) if not found.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Post>> getPostById(@PathVariable Long id) {
        Post post = postService.getPostById(id);
        return ResponseEntity.ok(
                ApiResponse.success("Post retrieved successfully", post));
    }

    /**
     * POST /api/posts
     *
     * Creates a new post. @Valid triggers Bean Validation on the request body.
     * Returns HTTP 201 Created with the persisted post in the response body.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Post>> createPost(
            @Valid @RequestBody PostRequestDto dto) {

        Post created = postService.createPost(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Post created successfully", created));
    }

    /**
     * PUT /api/posts/{id}
     *
     * Replaces all fields of an existing post.
     * Returns HTTP 200 with the updated post.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Post>> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostRequestDto dto) {

        Post updated = postService.updatePost(id, dto);
        return ResponseEntity.ok(
                ApiResponse.success("Post updated successfully", updated));
    }

    /**
     * DELETE /api/posts/{id}
     *
     * Deletes a post by ID.
     * Returns HTTP 204 No Content on success.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success("Post deleted successfully"));
    }
}
