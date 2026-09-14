package com.deadbeat.postapi.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Experiment 2.1.1 — Domain Model / Entity
 *
 * Represents a social media post resource in the system.
 * Bean Validation annotations (@NotBlank, @NotNull, @Size) enforce
 * data integrity at both the persistence and HTTP request layer.
 */
@Entity
@Table(name = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The platform this post targets (e.g. "Twitter", "Instagram").
     * @NotBlank — must not be null or empty/whitespace.
     * @Size      — platform name must be between 2 and 30 characters.
     */
    @NotBlank(message = "Platform must not be blank")
    @Size(min = 2, max = 30, message = "Platform name must be between 2 and 30 characters")
    @Column(nullable = false)
    private String platform;

    /**
     * The post body / caption content.
     * @NotBlank — content must not be empty.
     * @Size      — enforces maximum length across platforms (63,206 chars = Facebook max).
     */
    @NotBlank(message = "Content must not be blank")
    @Size(min = 1, max = 63206, message = "Content must be between 1 and 63,206 characters")
    @Column(nullable = false, length = 63206)
    private String content;

    /**
     * ISO-8601 datetime when the post is scheduled to publish.
     * @NotNull — a scheduled time must always be present.
     */
    @NotNull(message = "Scheduled time must not be null")
    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    /**
     * Current status of the post (DRAFT, SCHEDULED, PUBLISHED).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PostStatus status = PostStatus.DRAFT;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum PostStatus {
        DRAFT, SCHEDULED, PUBLISHED
    }
}
