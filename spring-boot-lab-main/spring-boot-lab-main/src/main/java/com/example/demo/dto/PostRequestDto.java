package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * Experiment 2.1.1 — Request DTO
 *
 * Mirrors the payload the CalendarPage / Composer frontend sends:
 *   platform    -> one of Twitter, Instagram, LinkedIn, Facebook
 *   content     -> post body (up to 2200 chars for Instagram)
 *   scheduledAt -> ISO-8601 datetime from the DateTimePicker
 *   status      -> optional, defaults to "scheduled" in service
 */
public class PostRequestDto {

    @NotBlank(message = "Platform is required")
    @Pattern(
        regexp = "Twitter|Instagram|LinkedIn|Facebook",
        message = "Platform must be one of: Twitter, Instagram, LinkedIn, Facebook"
    )
    private String platform;

    @NotBlank(message = "Content cannot be empty")
    @Size(max = 2200, message = "Content must not exceed 2200 characters")
    private String content;

    @NotNull(message = "Scheduled date and time is required")
    private LocalDateTime scheduledAt;

    // Optional — defaults to "scheduled" if not provided
    private String status;

    // Getters and Setters
    public String        getPlatform()    { return platform; }
    public void          setPlatform(String platform) { this.platform = platform; }

    public String        getContent()     { return content; }
    public void          setContent(String content)   { this.content = content; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void          setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public String        getStatus()      { return status; }
    public void          setStatus(String status)     { this.status = status; }
}