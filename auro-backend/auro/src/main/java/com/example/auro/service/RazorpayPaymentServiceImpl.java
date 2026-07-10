package com.example.auro.service;

import com.example.auro.dto.CreateOrderRequestDto;
import com.example.auro.dto.CreateOrderResponseDto;
import com.example.auro.dto.VerifyPaymentRequestDto;
import com.example.auro.dto.VerifyPaymentResponseDto;
import com.example.auro.entity.PaymentStatus;
import com.example.auro.entity.PaymentTransaction;
import com.example.auro.repository.PaymentTransactionRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RazorpayPaymentServiceImpl implements RazorpayPaymentService {

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    @Value("${razorpay.currency:INR}")
    private String currency;

    private final PaymentTransactionRepository paymentRepository;
    private final NotificationService notificationService;

    public RazorpayPaymentServiceImpl(PaymentTransactionRepository paymentRepository, NotificationService notificationService) {
        this.paymentRepository = paymentRepository;
        this.notificationService = notificationService;
    }

    @Override
    public CreateOrderResponseDto createOrder(CreateOrderRequestDto request) throws Exception {
        validateCreateOrder(request);
        requireRazorpayConfiguration();

        int amountInPaise = request.getAmount()
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .intValueExact();

        RazorpayClient razorpayClient = new RazorpayClient(keyId, keySecret);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", currency);
        orderRequest.put("receipt", "AUR-" + System.currentTimeMillis());
        orderRequest.put("payment_capture", 1);

        Order order = razorpayClient.orders.create(orderRequest);

        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setBookingId(request.getBookingId());
        transaction.setPropertyId(request.getPropertyId());
        transaction.setVentureId(request.getVentureId());
        transaction.setCustomerName(request.getCustomerName());
        transaction.setPhone(request.getPhone());
        transaction.setEmail(request.getEmail());
        transaction.setAmount(request.getAmount());
        transaction.setCurrency(currency);
        transaction.setRazorpayOrderId(order.get("id"));
        transaction.setStatus(PaymentStatus.CREATED);

        PaymentTransaction saved = paymentRepository.save(transaction);

        return new CreateOrderResponseDto(
                saved.getId(),
                keyId,
                saved.getRazorpayOrderId(),
                saved.getAmount(),
                amountInPaise,
                saved.getCurrency(),
                saved.getCustomerName(),
                saved.getPhone(),
                saved.getEmail()
        );
    }

    @Override
    public VerifyPaymentResponseDto verifyPayment(VerifyPaymentRequestDto request) throws Exception {
        requireRazorpayConfiguration();

        PaymentTransaction transaction = paymentRepository
                .findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new RuntimeException("Payment order not found"));

        boolean valid = verifySignature(
                transaction.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (!valid) {
            transaction.setStatus(PaymentStatus.FAILED);
            transaction.setRazorpayPaymentId(request.getRazorpayPaymentId());
            transaction.setRazorpaySignature(request.getRazorpaySignature());
            paymentRepository.save(transaction);

            return new VerifyPaymentResponseDto(
                    false,
                    "Payment signature verification failed",
                    transaction.getId(),
                    transaction.getStatus().name(),
                    request.getRazorpayPaymentId()
            );
        }

        transaction.setStatus(PaymentStatus.PAID);
        transaction.setRazorpayPaymentId(request.getRazorpayPaymentId());
        transaction.setRazorpaySignature(request.getRazorpaySignature());
        transaction.setPaidAt(LocalDateTime.now());
        paymentRepository.save(transaction);

        notificationService.notifyRoles(
                java.util.List.of("Managing Director", "Operational Head"),
                "Payment",
                "Customer payment received",
                transaction.getCustomerName() + " completed a payment of " + transaction.getAmount() + ".",
                "PAYMENT",
                String.valueOf(transaction.getId())
        );
        notificationService.notifyCustomerByPhone(
                transaction.getPhone(),
                "Payment",
                "Payment verified successfully",
                "Your payment of " + transaction.getAmount() + " was verified successfully.",
                "PAYMENT",
                String.valueOf(transaction.getId())
        );

        return new VerifyPaymentResponseDto(
                true,
                "Payment verified successfully",
                transaction.getId(),
                transaction.getStatus().name(),
                transaction.getRazorpayPaymentId()
        );
    }

    private boolean verifySignature(
            String orderId,
            String paymentId,
            String actualSignature
    ) throws Exception {
        String payload = orderId + "|" + paymentId;

        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec =
                new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");

        mac.init(secretKeySpec);

        byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        String expectedSignature = HexFormat.of().formatHex(digest);

        return expectedSignature.equals(actualSignature);
    }

    private void validateCreateOrder(CreateOrderRequestDto request) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Valid amount is required");
        }

        if (request.getCustomerName() == null || request.getCustomerName().trim().isEmpty()) {
            throw new RuntimeException("Customer name is required");
        }

        if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            throw new RuntimeException("Phone is required");
        }
    }

    private void requireRazorpayConfiguration() {
        if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()) {
            throw new RuntimeException("Razorpay is not configured. Set razorpay.key-id and razorpay.key-secret.");
        }
    }
}
