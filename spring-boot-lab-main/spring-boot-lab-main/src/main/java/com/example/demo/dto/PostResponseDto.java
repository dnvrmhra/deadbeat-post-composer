package com.example.demo.dto;

import java.time.LocalDateTime;

/**
 * Experiment 2.1.1 — Response DTO
 *
 * Matches the Event shape used by CalendarPage.tsx:
 *   id          -> post ID
 *   platform    -> Twitter | Instagram | LinkedIn | Facebook
 *   content     -> post body text
 *   scheduledAt -> ISO-8601 datetime (used by calendar to place events)
 *   status      -> scheduled | published | draft
 *   createdAt   -> server-assigned creation timestamp
 */
public class PostResponseDto {

    private Long          id;
    private String        platform;
    private String        content;
    private LocalDateTime scheduledAt;
    private String        status;
    private LocalDateTime createdAt;

    public PostResponseDto(
        Long id,
        String platform,
        String content,
        LocalDateTime scheduledAt,
        String status,
        LocalDateTime createdAt
    ) {
        this.id          = id;
        this.platform    = platform;
        this.content     = content;
        this.scheduledAt = scheduledAt;
        this.status      = status;
        this.createdAt   = createdAt;
    }

    // Getters
    public Long          getId()          { return id; }
    public String        getPlatform()    { return platform; }
    public String        getContent()     { return content; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public String        getStatus()      { return status; }
    public LocalDateTime getCreatedAt()   { return createdAt; }
}