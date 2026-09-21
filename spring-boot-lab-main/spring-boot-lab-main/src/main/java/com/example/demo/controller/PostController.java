package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.PostRequestDto;
import com.example.demo.dto.PostResponseDto;
import com.example.demo.service.PostService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Experiment 2.1.1 — REST Controller
 *
 * Endpoints aligned with the CalendarPage / Composer data flow:
 *
 *   POST   /api/posts                       Create a scheduled post
 *   GET    /api/posts                       Get all scheduled posts (calendar grid)
 *   GET    /api/posts/{id}                  Get single post (event detail)
 *   GET    /api/posts/platform/{platform}   Filter calendar by platform tab
 *   PUT    /api/posts/{id}                  Update post (drag-and-drop rescheduling)
 *   DELETE /api/posts/{id}                  Delete post (delete button in calendar modal)
 */
@RestController
@RequestMapping("/api/posts")
public class PostController {

    private static final Logger log = LoggerFactory.getLogger(PostController.class);
    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    // Create a new scheduled post (from Composer or CalendarPage modal)
    @PostMapping
    public ResponseEntity<ApiResponse<PostResponseDto>> createPost(
            @Valid @RequestBody PostRequestDto dto) {
        log.info("Creating post: platform={} scheduledAt={}", dto.getPlatform(), dto.getScheduledAt());
        PostResponseDto created = postService.createPost(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Post scheduled successfully", created));
    }

    // Fetch all posts — used to populate the calendar grid
    @GetMapping
    public ResponseEntity<ApiResponse<List<PostResponseDto>>> getAllPosts() {
        log.info("Fetching all posts");
        List<PostResponseDto> posts = postService.getAllPosts();
        return ResponseEntity.ok(ApiResponse.success("Posts retrieved successfully", posts));
    }

    // Fetch a single post — used when clicking an event in the calendar
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponseDto>> getPostById(
            @PathVariable Long id) {
        log.info("Fetching post id={}", id);
        PostResponseDto post = postService.getPostById(id);
        return ResponseEntity.ok(ApiResponse.success("Post retrieved successfully", post));
    }

    // Filter posts by platform — matches the platform filter tabs in CalendarPage
    @GetMapping("/platform/{platform}")
    public ResponseEntity<ApiResponse<List<PostResponseDto>>> getPostsByPlatform(
            @PathVariable String platform) {
        log.info("Fetching posts for platform={}", platform);
        List<PostResponseDto> posts = postService.getPostsByPlatform(platform);
        return ResponseEntity.ok(ApiResponse.success("Posts retrieved for platform: " + platform, posts));
    }

    // Update a post — used when drag-and-dropping to a new date in CalendarPage
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponseDto>> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostRequestDto dto) {
        log.info("Updating post id={}", id);
        PostResponseDto updated = postService.updatePost(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Post updated successfully", updated));
    }

    // Delete a post — used by the delete button in the CalendarPage modal
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable Long id) {
        log.info("Deleting post id={}", id);
        postService.deletePost(id);
        return ResponseEntity.ok(ApiResponse.success("Post deleted successfully", null));
    }
}