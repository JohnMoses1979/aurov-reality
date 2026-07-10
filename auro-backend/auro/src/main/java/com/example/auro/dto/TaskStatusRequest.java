package com.example.auro.dto;

 
import jakarta.validation.constraints.NotBlank;

public record TaskStatusRequest(
        @NotBlank String status
) {
}
