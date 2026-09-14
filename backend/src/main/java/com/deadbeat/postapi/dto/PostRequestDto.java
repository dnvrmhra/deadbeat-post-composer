package com.deadbeat.postapi.dto;

import com.deadbeat.postapi.model.Post.PostStatus;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Experiment 2.1.1 — Request DTO
 *
 * Carries incoming POST/PUT request data.
 * Validation annotations here mirror the entity layer,
 * ensuring validation occurs before the data ever reaches the service.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostRequestDto {

    @NotBlank(message = "Platform must not be blank")
    @Size(min = 2, max = 30, message = "Platform name must be between 2 and 30 characters")
    private String platform;

    @NotBlank(message = "Content must not be blank")
    @Size(min = 1, max = 63206, message = "Content must be between 1 and 63,206 characters")
    private String content;

    @NotNull(message = "Scheduled time must not be null")
    private LocalDateTime scheduledAt;

    private PostStatus status;
}
