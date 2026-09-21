package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * JPA Entity — maps directly to the frontend CalendarPage / Composer data model.
 *
 * Field mapping:
 *   platform    -> Twitter | Instagram | LinkedIn | Facebook
 *   content     -> post body text (hashtags, mentions, etc.)
 *   scheduledAt -> ISO-8601 datetime from the custom DateTimePicker
 *   status      -> scheduled | published | draft
 *   createdAt   -> server-assigned creation timestamp
 */
@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String platform;

    @Column(length = 2200)
    private String content;

    private LocalDateTime scheduledAt;

    private String status;

    private LocalDateTime createdAt;

    public Post() {}

    public Post(String platform, String content, LocalDateTime scheduledAt, String status) {
        this.platform    = platform;
        this.content     = content;
        this.scheduledAt = scheduledAt;
        this.status      = status != null ? status : "scheduled";
        this.createdAt   = LocalDateTime.now();
    }

    // Getters
    public Long          getId()          { return id; }
    public String        getPlatform()    { return platform; }
    public String        getContent()     { return content; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public String        getStatus()      { return status; }
    public LocalDateTime getCreatedAt()   { return createdAt; }

    // Setters
    public void setPlatform(String platform)       { this.platform    = platform; }
    public void setContent(String content)         { this.content     = content; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public void setStatus(String status)           { this.status      = status; }
}