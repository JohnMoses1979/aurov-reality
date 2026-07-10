package com.example.auro.controller;

import com.example.auro.dto.ProfileUpdateRequest;
import com.example.auro.dto.UserResponse;
import com.example.auro.security.UserPrincipal;
import com.example.auro.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal UserPrincipal principal) {
        return userService.me(requirePrincipal(principal).getId());
    }

    @PutMapping("/me/profile")
    public UserResponse updateProfile(@AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody ProfileUpdateRequest request) {
        return userService.updateProfile(requirePrincipal(principal).getId(), request);
    }

    private UserPrincipal requirePrincipal(UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required.");
        }
        return principal;
    }
}
