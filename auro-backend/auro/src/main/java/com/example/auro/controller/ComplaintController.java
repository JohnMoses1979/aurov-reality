package com.example.auro.controller;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.auro.dto.ComplaintResponse;
import com.example.auro.dto.ComplaintStatusUpdateRequest;
import com.example.auro.entity.ComplaintAttachment;
import com.example.auro.service.ComplaintService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService service;

    @PostMapping(value = "/employee", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ComplaintResponse createEmployeeComplaint(
            @RequestParam("target") String target,
            @RequestParam("subject") String subject,
            @RequestParam("description") String description,
            @RequestParam("priority") String priority,
            @RequestParam("department") String department,
            @RequestParam(value = "employeeId", required = false) String employeeId,
            @RequestParam(value = "employeeName", required = false) String employeeName,
            @RequestParam(value = "employeeRole", required = false) String employeeRole,
            @RequestPart(value = "attachments", required = false) List<MultipartFile> attachments,
            Authentication authentication
    ) {
        return service.createEmployeeComplaint(
                target,
                subject,
                description,
                priority,
                department,
                employeeId,
                employeeName,
                employeeRole,
                attachments,
                authentication
        );
    }

    @PostMapping(value = "/customer", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ComplaintResponse createCustomerComplaint(
            @RequestParam("customerName") String customerName,
            @RequestParam("customerPhone") String customerPhone,
            @RequestParam(value = "customerEmail", required = false) String customerEmail,
            @RequestParam("subject") String subject,
            @RequestParam("description") String description,
            @RequestParam(value = "priority", defaultValue = "Medium") String priority,
            @RequestPart(value = "attachments", required = false) List<MultipartFile> attachments
    ) {
        return service.createCustomerComplaint(
                customerName,
                customerPhone,
                customerEmail,
                subject,
                description,
                priority,
                attachments
        );
    }

    @GetMapping
    public List<ComplaintResponse> getAll(
            @RequestParam(value = "department", required = false) String department,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "employeeId", required = false) String employeeId,
            @RequestParam(value = "employeeName", required = false) String employeeName,
            @RequestParam(value = "fromDate", required = false) String fromDate,
            @RequestParam(value = "toDate", required = false) String toDate,
            @RequestParam(value = "search", required = false) String search,
            Authentication authentication
    ) {
        return service.getAll(
                department,
                status,
                employeeId,
                employeeName,
                fromDate,
                toDate,
                search,
                authentication
        );
    }

    @GetMapping("/{id}")
    public ComplaintResponse getById(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        return service.getById(id, authentication);
    }

    @PatchMapping("/{id}/status")
    public ComplaintResponse updateStatus(
            @PathVariable("id") Long id,
            @RequestBody ComplaintStatusUpdateRequest request,
            Authentication authentication
    ) {
        return service.updateStatus(id, request, authentication);
    }

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        service.delete(id, authentication);
    }

    @GetMapping("/{complaintId}/attachments/{attachmentId}")
    public ResponseEntity<Resource> getAttachment(
            @PathVariable("complaintId") Long complaintId,
            @PathVariable("attachmentId") String attachmentId,
            Authentication authentication
    ) {
        Resource resource = service.getAttachment(
                complaintId,
                attachmentId,
                authentication
        );

        ComplaintAttachment info = service.getAttachmentInfo(
                complaintId,
                attachmentId
        );

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;

        if (info.getContentType() != null) {
            mediaType = MediaType.parseMediaType(info.getContentType());
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + info.getName() + "\""
                )
                .body(resource);
    }
}
