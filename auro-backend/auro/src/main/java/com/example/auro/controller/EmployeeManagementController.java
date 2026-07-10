package com.example.auro.controller;

 
import com.example.auro.dto.EmployeeManagementPageResponse;
import com.example.auro.dto.EmployeeRequest;
import com.example.auro.dto.EmployeeResponse;
import com.example.auro.entity.EmployeeDocument;
import com.example.auro.entity.UserAccount;
import com.example.auro.service.EmployeeManagementService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/employees/management")
public class EmployeeManagementController {

    private final EmployeeManagementService employeeManagementService;
    private final ObjectMapper objectMapper;

    @GetMapping
    public EmployeeManagementPageResponse getData(
            @AuthenticationPrincipal(expression = "user") UserAccount currentUser
    ) {
        return employeeManagementService.getData(currentUser);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public EmployeeResponse createMultipart(
            @RequestPart("employee") String employeeJson,
            @RequestPart(value = "documents", required = false) List<MultipartFile> documents,
            @AuthenticationPrincipal(expression = "user") UserAccount currentUser
    ) throws Exception {
        EmployeeRequest request = objectMapper.readValue(employeeJson, EmployeeRequest.class);

        return employeeManagementService.create(request, documents, currentUser);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public EmployeeResponse createJson(
            @RequestBody EmployeeRequest request,
            @AuthenticationPrincipal(expression = "user") UserAccount currentUser
    ) {
        return employeeManagementService.create(request, List.of(), currentUser);
    }

    @PutMapping(value = "/{employeeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public EmployeeResponse updateMultipart(
            @PathVariable Long employeeId,
            @RequestPart("employee") String employeeJson,
            @RequestPart(value = "documents", required = false) List<MultipartFile> documents,
            @AuthenticationPrincipal(expression = "user") UserAccount currentUser
    ) throws Exception {
        EmployeeRequest request = objectMapper.readValue(employeeJson, EmployeeRequest.class);

        return employeeManagementService.update(employeeId, request, documents, currentUser);
    }

    @PutMapping(value = "/{employeeId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public EmployeeResponse updateJson(
            @PathVariable Long employeeId,
            @RequestBody EmployeeRequest request,
            @AuthenticationPrincipal(expression = "user") UserAccount currentUser
    ) {
        return employeeManagementService.update(employeeId, request, List.of(), currentUser);
    }

    @PatchMapping("/{employeeId}/toggle-status")
    public void toggleStatus(
            @PathVariable Long employeeId,
            @AuthenticationPrincipal(expression = "user") UserAccount currentUser
    ) {
        employeeManagementService.toggleStatus(employeeId, currentUser);
    }

    @DeleteMapping("/{employeeId}")
    public void delete(
            @PathVariable Long employeeId,
            @AuthenticationPrincipal(expression = "user") UserAccount currentUser
    ) {
        employeeManagementService.delete(employeeId, currentUser);
    }

    @GetMapping("/{employeeId}/documents/{documentId}/preview")
    public ResponseEntity<Resource> previewDocument(
            @PathVariable Long employeeId,
            @PathVariable Long documentId
    ) {
        EmployeeDocument document = employeeManagementService.getDocument(employeeId, documentId);
        Resource resource = employeeManagementService.loadDocumentResource(document);

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;

        try {
            if (document.getType() != null) {
                mediaType = MediaType.parseMediaType(document.getType());
            }
        } catch (Exception ignored) {
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline()
                                .filename(document.getName(), StandardCharsets.UTF_8)
                                .build()
                                .toString()
                )
                .body(resource);
    }

    @GetMapping("/{employeeId}/documents/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long employeeId,
            @PathVariable Long documentId
    ) {
        EmployeeDocument document = employeeManagementService.getDocument(employeeId, documentId);
        Resource resource = employeeManagementService.loadDocumentResource(document);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(document.getName(), StandardCharsets.UTF_8)
                                .build()
                                .toString()
                )
                .body(resource);
    }
}