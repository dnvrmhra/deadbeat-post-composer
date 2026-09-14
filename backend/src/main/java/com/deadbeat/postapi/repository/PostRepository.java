package com.deadbeat.postapi.repository;

import com.deadbeat.postapi.model.Post;
import com.deadbeat.postapi.model.Post.PostStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Experiment 2.1.1 — Repository Layer
 *
 * Extends JpaRepository which provides all standard CRUD operations out of the box:
 *   findAll(), findById(), save(), deleteById(), count(), existsById(), etc.
 *
 * Custom query methods follow Spring Data's method-naming convention —
 * Spring generates the SQL automatically from the method name.
 */
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    /** Fetch all posts for a given platform (case-sensitive). */
    List<Post> findByPlatform(String platform);

    /** Fetch all posts in a given status (DRAFT / SCHEDULED / PUBLISHED). */
    List<Post> findByStatus(PostStatus status);

    /** Fetch scheduled posts due before or at a given time — useful for a scheduler job. */
    List<Post> findByStatusAndScheduledAtBefore(PostStatus status, LocalDateTime dateTime);

    /** Check if any post with the given platform and status exists. */
    boolean existsByPlatformAndStatus(String platform, PostStatus status);
}
