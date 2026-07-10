package com.example.auro.dto;

 
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerVerifyOtpRequest {
    private String name;
    private String email;
    private String mobile;
    private String password;
    private String otp;
}
