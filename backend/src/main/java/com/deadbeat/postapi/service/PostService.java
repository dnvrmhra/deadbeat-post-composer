package com.deadbeat.postapi.service;

import com.deadbeat.postapi.dto.PostRequestDto;
import com.deadbeat.postapi.model.Post;

import java.util.List;

/**
 * Experiment 2.1.1 — Service Layer Interface
 *
 * Defines the business operations contract.
 * Programming to an interface rather than implementation allows:
 *  - Easy mocking in unit tests
 *  - Multiple implementations (e.g. PostServiceImpl vs MockPostService)
 *  - Clear separation between API contract and business logic
 */
public interface PostService {

    List<Post> getAllPosts();

    Post getPostById(Long id);

    Post createPost(PostRequestDto dto);

    Post updatePost(Long id, PostRequestDto dto);

    void deletePost(Long id);

    List<Post> getPostsByPlatform(String platform);
}
