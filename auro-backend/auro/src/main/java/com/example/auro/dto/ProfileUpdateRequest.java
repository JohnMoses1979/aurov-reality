package com.example.auro.dto;

import jakarta.validation.constraints.Pattern;

public class ProfileUpdateRequest {
    @Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must be 10 digits")
    private String mobile;

    private String mobileOtp;
    private String address;
    private String profilePhoto;

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getMobileOtp() { return mobileOtp; }
    public void setMobileOtp(String mobileOtp) { this.mobileOtp = mobileOtp; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
}
