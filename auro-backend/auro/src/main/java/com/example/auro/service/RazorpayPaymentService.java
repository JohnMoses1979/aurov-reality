package com.example.auro.service;

 
import com.example.auro.dto.CreateOrderRequestDto;
import com.example.auro.dto.CreateOrderResponseDto;
import com.example.auro.dto.VerifyPaymentRequestDto;
import com.example.auro.dto.VerifyPaymentResponseDto;

public interface RazorpayPaymentService {

    CreateOrderResponseDto createOrder(CreateOrderRequestDto request) throws Exception;

    VerifyPaymentResponseDto verifyPayment(VerifyPaymentRequestDto request) throws Exception;
}
