package com.example.auro.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.auro.dto.ProfileUpdateRequest;
import com.example.auro.dto.UserResponse;
import com.example.auro.entity.Employee;
import com.example.auro.entity.EmployeeDocument;
import com.example.auro.entity.UserAccount;
import com.example.auro.exception.ApiException;
import com.example.auro.repository.EmployeeRepository;
import com.example.auro.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final AuthService authService;
    private final EmployeeRepository employeeRepository;

    public UserService(UserRepository userRepository, AuthService authService, EmployeeRepository employeeRepository) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.employeeRepository = employeeRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse me(Long id) {
        UserAccount user = findUser(id);
        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    @Transactional
    public UserResponse updateProfile(Long id, ProfileUpdateRequest request) {
        UserAccount user = findUser(id);
        String nextMobile = request.getMobile() == null ? null : request.getMobile().trim();

        if (nextMobile != null && !nextMobile.equals(user.getMobile())) {
            userRepository.findByMobile(nextMobile).ifPresent(existing -> {
                if (!existing.getId().equals(user.getId())) {
                    throw new ApiException(HttpStatus.CONFLICT, "Mobile number already exists.");
                }
            });
            authService.requireProfileMobileOtp(nextMobile, request.getMobileOtp());
            user.setMobile(nextMobile);
        }

        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        if (request.getProfilePhoto() != null && !request.getProfilePhoto().isBlank()) {
            user.setProfilePhoto(request.getProfilePhoto());
        }

        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse toggleEmployeeStatus(Long id) {
        UserAccount user = findUser(id);
        user.setActive(!user.isActive());
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public void deleteEmployee(Long id) {
        UserAccount user = findUser(id);
        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public EmployeeDocument getEmployeeDocument(Long employeeId, Long documentId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Employee not found"));

        List<EmployeeDocument> documents = employee.getDocuments();
        if (documents == null || documents.isEmpty()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Employee document not found");
        }

        int index = Math.toIntExact(documentId);
        if (index < 0 || index >= documents.size()) {
            int oneBasedIndex = index - 1;
            if (oneBasedIndex < 0 || oneBasedIndex >= documents.size()) {
                throw new ApiException(HttpStatus.NOT_FOUND, "Employee document not found");
            }
            index = oneBasedIndex;
        }

        return documents.get(index);
    }

    private UserAccount findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
