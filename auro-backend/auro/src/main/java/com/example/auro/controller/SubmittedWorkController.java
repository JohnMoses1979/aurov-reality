package com.example.auro.controller;

import com.example.auro.dto.ReviewSubmittedWorkRequest;
import com.example.auro.dto.SubmittedWorkResponse;
import com.example.auro.entity.SubmittedWork;
import com.example.auro.service.SubmittedWorkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/submitted-works")
public class SubmittedWorkController {

    private final SubmittedWorkService service;

    /*
     * Manager submits completed work with PDF.
     *
     * POST /api/submitted-works
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('Sales Manager','Marketing Manager','CRM Manager','Accounts Manager','HR Manager')")
    public Map<String, Object> submitWork(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String department,
            @RequestParam(required = false) String submissionDate,
            @RequestParam("pdf") MultipartFile pdf,
            Authentication authentication
    ) {
        return service.submitWork(
                title,
                description,
                department,
                submissionDate,
                pdf,
                getLoggedInUsername(authentication)
        );
    }

    /*
     * Manager own submitted work history.
     *
     * GET /api/submitted-works/my
     */
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public List<Map<String, Object>> getMySubmittedWorks(Authentication authentication) {
        return service.getMySubmittedWorks(getLoggedInUsername(authentication));
    }

    /*
     * MD / OH submitted work list for new frontend.
     *
     * GET /api/submitted-works/leadership
     */
    @GetMapping("/leadership")
    @PreAuthorize("hasAnyAuthority('Managing Director','Operational Head','Operation Head','Admin','Super Admin')")
    public List<Map<String, Object>> getLeadershipSubmittedWorks(Authentication authentication) {
        return service.getLeadershipSubmittedWorks(getLoggedInUsername(authentication));
    }

    /*
     * Old leadership list with filters.
     *
     * GET /api/submitted-works
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('Managing Director','Operational Head','Operation Head','Admin','Super Admin')")
    public List<SubmittedWorkResponse> getAllWorks(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String manager,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String search
    ) {
        return service.getAllWorks(department, status, manager, date, search);
    }

    /*
     * Single submitted work details.
     *
     * GET /api/submitted-works/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public SubmittedWorkResponse getById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return service.getById(id, authentication);
    }

    /*
     * Manager updates submitted work.
     *
     * PUT /api/submitted-works/{id}
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('Sales Manager','Marketing Manager','CRM Manager','Accounts Manager','HR Manager')")
    public SubmittedWorkResponse updateWork(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String submissionDate,
            @RequestParam String department,
            @RequestParam(value = "pdf", required = false) MultipartFile pdf,
            Authentication authentication
    ) {
        return service.updateWork(
                id,
                title,
                description,
                submissionDate,
                department,
                pdf,
                authentication
        );
    }

    /*
     * MD / OH reviews submitted work.
     *
     * PATCH /api/submitted-works/{id}/review
     */
    @PatchMapping("/{id}/review")
    @PreAuthorize("hasAnyAuthority('Managing Director','Operational Head','Operation Head','Admin','Super Admin')")
    public Map<String, Object> reviewWork(
            @PathVariable Long id,
            @Valid @RequestBody ReviewSubmittedWorkRequest request,
            Authentication authentication
    ) {
        return service.reviewWork(
                id,
                request,
                getLoggedInUsername(authentication)
        );
    }

    /*
     * Delete submitted work.
     *
     * Managers can delete own work.
     * Leadership can delete any work.
     *
     * DELETE /api/submitted-works/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public void deleteWork(
            @PathVariable Long id,
            Authentication authentication
    ) {
        service.deleteWork(id, authentication);
    }

    /*
     * View / download submitted PDF.
     *
     * GET /api/submitted-works/{id}/pdf
     */
    @GetMapping("/{id}/pdf")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> viewPdf(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Resource resource = service.getPdfResource(id, authentication);
        SubmittedWork work = service.getPdfInfo(id, authentication);

        String filename = getPdfFileName(work);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + filename + "\""
                )
                .body(resource);
    }

    private String getLoggedInUsername(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthorized user.");
        }

        return authentication.getName();
    }

    private String getPdfFileName(SubmittedWork work) {
        if (work.getPdfName() != null && !work.getPdfName().isBlank()) {
            return work.getPdfName();
        }

        if (work.getPdfOriginalName() != null && !work.getPdfOriginalName().isBlank()) {
            return work.getPdfOriginalName();
        }

        if (work.getFileName() != null && !work.getFileName().isBlank()) {
            return work.getFileName();
        }

        return "submitted-work.pdf";
    }
}