package com.example.auro.dto;

public class OtpResponse {
    private String message;
    private long expiresInSeconds;
    private String debugOtp;

    public OtpResponse(String message, long expiresInSeconds) {
        this(message, expiresInSeconds, null);
    }

    public OtpResponse(String message, long expiresInSeconds, String debugOtp) {
        this.message = message;
        this.expiresInSeconds = expiresInSeconds;
        this.debugOtp = debugOtp;
    }

    public String getMessage() { return message; }
    public long getExpiresInSeconds() { return expiresInSeconds; }
    public String getDebugOtp() { return debugOtp; }
}
