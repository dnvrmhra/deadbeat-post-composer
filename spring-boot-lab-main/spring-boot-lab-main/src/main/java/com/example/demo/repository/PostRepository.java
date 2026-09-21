package com.example.demo.repository;

import com.example.demo.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Experiment 2.1.1 — Data Access Layer
 *
 * Spring Data JPA generates all SQL automatically.
 * Custom query: find by platform name (case-insensitive) for the calendar filter.
 */
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    // Used by GET /api/posts/platform/{platform}
    List<Post> findByPlatformIgnoreCase(String platform);
}