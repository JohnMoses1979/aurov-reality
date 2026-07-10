package com.example.auro.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewSubmittedWorkRequest {

    /*
     * Allowed values:
     * Approved
     * Rejected
     * Reviewed
     * Closed
     */
    @NotBlank(message = "Status is required.")
    private String status;

    private String remarks;
}