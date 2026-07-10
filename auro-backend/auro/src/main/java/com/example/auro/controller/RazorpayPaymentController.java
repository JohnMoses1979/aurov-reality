package com.example.auro.controller;

 
import com.example.auro.dto.CreateOrderRequestDto;
import com.example.auro.dto.CreateOrderResponseDto;
import com.example.auro.dto.VerifyPaymentRequestDto;
import com.example.auro.dto.VerifyPaymentResponseDto;
import com.example.auro.service.RazorpayPaymentService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments/razorpay")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
})
public class RazorpayPaymentController {

    private final RazorpayPaymentService razorpayPaymentService;

    public RazorpayPaymentController(RazorpayPaymentService razorpayPaymentService) {
        this.razorpayPaymentService = razorpayPaymentService;
    }

    @PostMapping("/create-order")
    public CreateOrderResponseDto createOrder(
            @RequestBody CreateOrderRequestDto request
    ) throws Exception {
        return razorpayPaymentService.createOrder(request);
    }

    @PostMapping("/verify")
    public VerifyPaymentResponseDto verifyPayment(
            @RequestBody VerifyPaymentRequestDto request
    ) throws Exception {
        return razorpayPaymentService.verifyPayment(request);
    }
}
