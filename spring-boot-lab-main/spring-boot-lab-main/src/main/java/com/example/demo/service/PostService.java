package com.example.demo.service;

import com.example.demo.dto.PostRequestDto;
import com.example.demo.dto.PostResponseDto;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Post;
import com.example.demo.repository.PostRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Experiment 2.1.1 — Business Logic Layer
 *
 * Handles CRUD operations aligned with the CalendarPage / Composer model.
 * Validates scheduling rules (e.g. cannot schedule in the past).
 */
@Service
public class PostService {

    private static final Logger log = LoggerFactory.getLogger(PostService.class);
    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public PostResponseDto createPost(PostRequestDto dto) {
        log.debug("Creating post for platform={} scheduledAt={}", dto.getPlatform(), dto.getScheduledAt());

        if (dto.getScheduledAt() != null && dto.getScheduledAt().isBefore(LocalDateTime.now())) {
            log.warn("Attempted to schedule post in the past: {}", dto.getScheduledAt());
            throw new com.example.demo.exception.ResourceNotFoundException(
                "Cannot schedule a post in the past. Please pick a future date and time."
            );
        }

        String status = (dto.getStatus() != null && !dto.getStatus().isBlank())
            ? dto.getStatus()
            : "scheduled";

        Post post  = new Post(dto.getPlatform(), dto.getContent(), dto.getScheduledAt(), status);
        Post saved = postRepository.save(post);
        log.info("Post created: id={} platform={} scheduledAt={}", saved.getId(), saved.getPlatform(), saved.getScheduledAt());
        return mapToDto(saved);
    }

    public List<PostResponseDto> getAllPosts() {
        log.debug("Fetching all posts");
        return postRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<PostResponseDto> getPostsByPlatform(String platform) {
        log.debug("Fetching posts for platform={}", platform);
        return postRepository.findByPlatformIgnoreCase(platform).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PostResponseDto getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with ID: " + id));
        return mapToDto(post);
    }

    public PostResponseDto updatePost(Long id, PostRequestDto dto) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with ID: " + id));

        post.setPlatform(dto.getPlatform());
        post.setContent(dto.getContent());
        post.setScheduledAt(dto.getScheduledAt());
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            post.setStatus(dto.getStatus());
        }

        Post saved = postRepository.save(post);
        log.info("Post updated: id={}", saved.getId());
        return mapToDto(saved);
    }

    public void deletePost(Long id) {
        if (!postRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cannot delete. Post not found with ID: " + id);
        }
        postRepository.deleteById(id);
        log.info("Post deleted: id={}", id);
    }

    private PostResponseDto mapToDto(Post post) {
        return new PostResponseDto(
                post.getId(),
                post.getPlatform(),
                post.getContent(),
                post.getScheduledAt(),
                post.getStatus(),
                post.getCreatedAt());
    }
}