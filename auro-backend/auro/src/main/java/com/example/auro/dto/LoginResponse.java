package com.example.auro.dto;

 
public class LoginResponse {
    private String token;
    private String tokenType = "Bearer";
    private long expiresInMs;
    private String homePath;
    private UserResponse user;

    public LoginResponse(String token, long expiresInMs, String homePath, UserResponse user) {
        this.token = token;
        this.expiresInMs = expiresInMs;
        this.homePath = homePath;
        this.user = user;
    }

    public String getToken() { return token; }
    public String getTokenType() { return tokenType; }
    public long getExpiresInMs() { return expiresInMs; }
    public String getHomePath() { return homePath; }
    public UserResponse getUser() { return user; }
}

