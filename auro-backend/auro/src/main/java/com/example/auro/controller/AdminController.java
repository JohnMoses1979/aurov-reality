package com.example.auro.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.auro.dto.CreateEmployeeRequest;
import com.example.auro.dto.UserResponse;
import com.example.auro.entity.EmployeeDocument;
import com.example.auro.security.UserPrincipal;
import com.example.auro.service.AuthService;
import com.example.auro.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyAuthority('Managing Director','Operational Head')")
public class AdminController {
    private final AuthService authService;
    private final UserService userService;

    public AdminController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping("/employees")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createEmployee(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateEmployeeRequest request
    ) {
        return authService.createEmployee(request, principal.getUser().getRole());
    }

    @PatchMapping("/employees/{id}/status")
    public UserResponse toggleEmployeeStatus(@PathVariable Long id) {
        return userService.toggleEmployeeStatus(id);
    }

    @DeleteMapping("/employees/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEmployee(@PathVariable Long id) {
        userService.deleteEmployee(id);
    }

    @GetMapping("/employees/{employeeId}/documents/{documentId}")
    public ResponseEntity<Void> viewEmployeeDocument(
            @PathVariable Long employeeId,
            @PathVariable Long documentId
    ) {
        EmployeeDocument document = userService.getEmployeeDocument(employeeId, documentId);
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, URI.create(document.getUrl()).toString())
                .build();
    }
}
