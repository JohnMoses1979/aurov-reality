package com.example.auro.dto;

import com.example.auro.entity.UserAccount;

public class UserResponse {
    private Long id;
    private String fullName;
    private String employeeId;
    private String username;
    private String email;
    private String mobile;
    private String role;
    private String department;
    private String address;
    private String profilePhoto;
    private boolean active;
    private String temporaryPassword;
    private String password;
    private Boolean credentialEmailSent;
    private String credentialEmailMessage;

    public static UserResponse from(UserAccount user) {
        return from(user, null, null, null);
    }

    public static UserResponse from(UserAccount user, String temporaryPassword) {
        return from(user, temporaryPassword, null, null);
    }

    public static UserResponse from(
            UserAccount user,
            String temporaryPassword,
            Boolean credentialEmailSent,
            String credentialEmailMessage
    ) {
        UserResponse response = new UserResponse();
        response.id = user.getId();
        response.fullName = user.getFullName();
        response.employeeId = user.getEmployeeId();
        response.username = user.getUsername();
        response.email = user.getEmail();
        response.mobile = user.getMobile();
        response.role = user.getRole();
        response.department = user.getDepartment();
        response.address = user.getAddress();
        response.profilePhoto = user.getProfilePhoto();
        response.active = user.isActive();
        response.temporaryPassword = temporaryPassword;
        response.password = temporaryPassword;
        response.credentialEmailSent = credentialEmailSent;
        response.credentialEmailMessage = credentialEmailMessage;
        return response;
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmployeeId() { return employeeId; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getMobile() { return mobile; }
    public String getRole() { return role; }
    public String getDepartment() { return department; }
    public String getAddress() { return address; }
    public String getProfilePhoto() { return profilePhoto; }
    public boolean isActive() { return active; }
    public String getTemporaryPassword() { return temporaryPassword; }
    public String getPassword() { return password; }
    public Boolean getCredentialEmailSent() { return credentialEmailSent; }
    public String getCredentialEmailMessage() { return credentialEmailMessage; }
}
