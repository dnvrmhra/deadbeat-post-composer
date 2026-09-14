package com.deadbeat.postapi.service;

import com.deadbeat.postapi.dto.PostRequestDto;
import com.deadbeat.postapi.exception.BusinessRuleException;
import com.deadbeat.postapi.exception.PostNotFoundException;
import com.deadbeat.postapi.model.Post;
import com.deadbeat.postapi.model.Post.PostStatus;
import com.deadbeat.postapi.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Experiment 2.1.1 — Service Layer Implementation
 *
 * Contains all business logic. The controller delegates to this class;
 * this class delegates data access to PostRepository.
 *
 * Key design points:
 *  @Service        — registers as a Spring-managed bean
 *  @Transactional  — wraps write operations in a DB transaction
 *  @Slf4j          — injects a Logger for structured logging (Experiment 2.1.2)
 *  @RequiredArgsConstructor — Lombok generates constructor injection for final fields
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Post> getAllPosts() {
        log.debug("Fetching all posts");
        return postRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Post getPostById(Long id) {
        log.debug("Fetching post with id={}", id);
        return postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
    }

    @Override
    @Transactional
    public Post createPost(PostRequestDto dto) {
        log.debug("Creating post for platform={}", dto.getPlatform());

        if (dto.getScheduledAt().isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException(
                "Cannot schedule a post in the past. Provide a future scheduledAt time.");
        }

        Post post = Post.builder()
                .platform(dto.getPlatform())
                .content(dto.getContent())
                .scheduledAt(dto.getScheduledAt())
                .status(dto.getStatus() != null ? dto.getStatus() : PostStatus.DRAFT)
                .build();

        Post saved = postRepository.save(post);
        log.info("Post created with id={} platform={}", saved.getId(), saved.getPlatform());
        return saved;
    }

    @Override
    @Transactional
    public Post updatePost(Long id, PostRequestDto dto) {
        log.debug("Updating post id={}", id);

        Post existing = postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));

        if (existing.getStatus() == PostStatus.PUBLISHED) {
            throw new BusinessRuleException(
                "Cannot edit a post that has already been published.");
        }

        existing.setPlatform(dto.getPlatform());
        existing.setContent(dto.getContent());
        existing.setScheduledAt(dto.getScheduledAt());
        if (dto.getStatus() != null) {
            existing.setStatus(dto.getStatus());
        }

        Post updated = postRepository.save(existing);
        log.info("Post updated id={}", updated.getId());
        return updated;
    }

    @Override
    @Transactional
    public void deletePost(Long id) {
        log.debug("Deleting post id={}", id);
        if (!postRepository.existsById(id)) {
            throw new PostNotFoundException(id);
        }
        postRepository.deleteById(id);
        log.info("Post deleted id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Post> getPostsByPlatform(String platform) {
        log.debug("Fetching posts for platform={}", platform);
        return postRepository.findByPlatform(platform);
    }
}
