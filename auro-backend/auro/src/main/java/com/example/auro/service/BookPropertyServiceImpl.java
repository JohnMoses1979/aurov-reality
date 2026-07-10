package com.example.auro.service;

import com.example.auro.dto.BookPropertyRequestDto;
import com.example.auro.dto.BookingOptionPropertyDto;
import com.example.auro.dto.BookingOptionVentureDto;
import com.example.auro.dto.BookingOptionsResponseDto;
import com.example.auro.dto.BookingResponseDto;
import com.example.auro.entity.Booking;
import com.example.auro.entity.BookingType;
import com.example.auro.entity.CustomerLead;
import com.example.auro.entity.Property;
import com.example.auro.entity.PropertyReservation;
import com.example.auro.entity.Venture;
import com.example.auro.repository.BookingRepository;
import com.example.auro.repository.CustomerLeadRepository;
import com.example.auro.repository.PropertyRepository;
import com.example.auro.repository.PropertyReservationRepository;
import com.example.auro.repository.VentureRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.StringJoiner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookPropertyServiceImpl implements BookPropertyService {

    private final VentureRepository ventureRepository;
    private final PropertyRepository propertyRepository;
    private final PropertyReservationRepository reservationRepository;
    private final BookingRepository bookingRepository;
    private final CustomerLeadRepository leadRepository;
    private final NotificationService notificationService;

    public BookPropertyServiceImpl(
            VentureRepository ventureRepository,
            PropertyRepository propertyRepository,
            PropertyReservationRepository reservationRepository,
            BookingRepository bookingRepository,
            CustomerLeadRepository leadRepository,
            NotificationService notificationService
    ) {
        this.ventureRepository = ventureRepository;
        this.propertyRepository = propertyRepository;
        this.reservationRepository = reservationRepository;
        this.bookingRepository = bookingRepository;
        this.leadRepository = leadRepository;
        this.notificationService = notificationService;
    }

    @Override
    public BookingOptionsResponseDto getBookingOptions() {
        List<BookingOptionVentureDto> ventures = ventureRepository.findAll()
                .stream()
                .map(v -> new BookingOptionVentureDto(v.getId(), v.getName()))
                .toList();

        List<BookingOptionPropertyDto> properties = propertyRepository.findByStatusNotIgnoreCase("Sold")
                .stream()
                .map(this::toPropertyOption)
                .toList();

        return new BookingOptionsResponseDto(ventures, properties);
    }

    @Override
    @Transactional
    public BookingResponseDto bookProperty(BookPropertyRequestDto request) {
        validateRequest(request);

        Venture venture = ventureRepository.findById(request.getVentureId())
                .orElseThrow(() -> new RuntimeException("Venture not found"));

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new RuntimeException("Property not found"));

        if (property.getVenture() == null || !property.getVenture().getId().equals(venture.getId())) {
            throw new RuntimeException("Selected property does not belong to selected venture");
        }

        if (equalsIgnoreCase(property.getStatus(), "Sold")) {
            throw new RuntimeException("This property is already sold");
        }

        String propertyName = property.getType() + " " + property.getNumber();
        String paymentMode = normalizePaymentMode(request.getPaymentMode());
        boolean paidOnline = isSuccessfulPayment(request);
        String notes = buildPaymentNotes(request, paymentMode);

        CustomerLead lead = new CustomerLead();
        lead.setLeadType("Property Reservation");
        lead.setCustomerName(request.getName().trim());
        lead.setPhone(request.getPhone().trim());
        lead.setVentureId(venture.getId());
        lead.setVentureName(venture.getName());
        lead.setPropertyId(property.getId());
        lead.setPropertyName(propertyName);
        lead.setAmount(request.getAmount());
        lead.setPaymentMode(paymentMode);
        lead.setMessage(notes);
        lead.setStatus(paidOnline ? "Paid" : "New");
        CustomerLead savedLead = leadRepository.save(lead);
        savedLead.setLeadCode("LD-" + savedLead.getId());
        leadRepository.save(savedLead);

        Booking booking = new Booking();
        booking.setCustomerName(request.getName().trim());
        booking.setPhone(request.getPhone().trim());
        booking.setPropertyTitle(propertyName);
        booking.setPropertyName(propertyName);
        booking.setVentureName(venture.getName());
        booking.setPaymentMode(paymentMode);
        booking.setStatus(paidOnline ? "APPROVED" : "PENDING");
        booking.setType(BookingType.PURCHASE);
        booking.setActivityDate(LocalDate.now());
        Booking savedBooking = bookingRepository.save(booking);
        savedBooking.setBookingCode("BK-" + savedBooking.getId());
        bookingRepository.save(savedBooking);

        PropertyReservation reservation = new PropertyReservation();
        reservation.setCustomer(request.getName().trim());
        reservation.setPhone(request.getPhone().trim());
        reservation.setEmail(null);
        reservation.setProperty(propertyName);
        reservation.setVenture(venture.getName());
        reservation.setAmount(request.getAmount());
        reservation.setPaid(paidOnline ? request.getAmount() : BigDecimal.ZERO);
        reservation.setBookingDate(LocalDate.now());
        reservation.setStatus(paidOnline ? "Confirmed" : "Pending");
        reservation.setNotes(notes);
        reservation.setCreatedBy(request.getName().trim());

        PropertyReservation saved = reservationRepository.save(reservation);
        saved.setBookingCode("BOOK" + String.format("%05d", saved.getId()));
        saved = reservationRepository.save(saved);

        property.setStatus("Reserved");
        propertyRepository.save(property);

        notificationService.notifyRoles(
                List.of("Managing Director", "Operational Head"),
                "Booking",
                "New customer property booking",
                saved.getCustomer() + " booked " + propertyName + " in " + venture.getName() + ".",
                "BOOKING",
                String.valueOf(saved.getId())
        );
        notificationService.notifyCustomerByPhone(
                saved.getPhone(),
                "Booking",
                "Property booking submitted",
                "Your booking for " + propertyName + " is now " + saved.getStatus() + ".",
                "BOOKING",
                String.valueOf(saved.getId())
        );

        return toBookingResponse(saved, venture.getId(), property.getId(), paymentMode, notes);
    }

    private void validateRequest(BookPropertyRequestDto request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new RuntimeException("Customer name is required");
        }

        if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            throw new RuntimeException("Mobile number is required");
        }

        if (request.getVentureId() == null) {
            throw new RuntimeException("Venture is required");
        }

        if (request.getPropertyId() == null) {
            throw new RuntimeException("Property is required");
        }

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Valid booking amount is required");
        }

        String paymentMode = normalizePaymentMode(request.getPaymentMode());
        if (paymentMode.isBlank()) {
            throw new RuntimeException("Payment mode is required");
        }

        switch (paymentMode) {
            case "UPI" -> {
                if (isBlank(request.getUpiId())) {
                    throw new RuntimeException("UPI ID is required");
                }
            }
            case "BANK TRANSFER" -> {
                if (isBlank(request.getBankName())) {
                    throw new RuntimeException("Bank name is required");
                }
                if (isBlank(request.getAccountHolderName())) {
                    throw new RuntimeException("Account holder name is required");
                }
            }
            case "CARD" -> {
                if (isBlank(request.getCardHolderName())) {
                    throw new RuntimeException("Card holder name is required");
                }
                if (isBlank(request.getCardLastFour()) || request.getCardLastFour().trim().length() != 4) {
                    throw new RuntimeException("Last 4 card digits are required");
                }
            }
            case "CASH" -> {
                if (isBlank(request.getCashReceiptNumber())) {
                    throw new RuntimeException("Cash receipt number is required");
                }
            }
            default -> throw new RuntimeException("Unsupported payment mode");
        }
    }

    private BookingOptionPropertyDto toPropertyOption(Property property) {
        return new BookingOptionPropertyDto(
                property.getId(),
                property.getVenture() == null ? null : property.getVenture().getId(),
                property.getType(),
                property.getNumber(),
                property.getArea(),
                property.getPrice(),
                property.getStatus()
        );
    }

    private BookingResponseDto toBookingResponse(
            PropertyReservation booking,
            Long ventureId,
            Long propertyId,
            String paymentMode,
            String notes
    ) {
        return new BookingResponseDto(
                booking.getBookingCode(),
                booking.getId(),
                booking.getCustomer(),
                booking.getPhone(),
                ventureId,
                booking.getVenture(),
                propertyId,
                booking.getProperty(),
                booking.getAmount(),
                paymentMode,
                notes,
                booking.getStatus(),
                booking.getCreatedAt()
        );
    }

    private String buildPaymentNotes(BookPropertyRequestDto request, String paymentMode) {
        StringJoiner joiner = new StringJoiner(System.lineSeparator());

        if (!isBlank(request.getRemarks())) {
            joiner.add("Remarks: " + request.getRemarks().trim());
        }

        joiner.add("Payment Mode: " + paymentMode);

        if (!isBlank(request.getUpiId())) {
            joiner.add("UPI ID: " + request.getUpiId().trim());
        }

        if (!isBlank(request.getBankName())) {
            joiner.add("Bank Name: " + request.getBankName().trim());
        }

        if (!isBlank(request.getAccountHolderName())) {
            joiner.add("Account Holder: " + request.getAccountHolderName().trim());
        }

        if (!isBlank(request.getTransferReference())) {
            joiner.add("Transfer Reference: " + request.getTransferReference().trim());
        }

        if (!isBlank(request.getCardHolderName())) {
            joiner.add("Card Holder: " + request.getCardHolderName().trim());
        }

        if (!isBlank(request.getCardLastFour())) {
            joiner.add("Card Last 4: " + request.getCardLastFour().trim());
        }

        if (!isBlank(request.getCashReceiptNumber())) {
            joiner.add("Cash Receipt Number: " + request.getCashReceiptNumber().trim());
        }

        if (!isBlank(request.getPaymentReference())) {
            joiner.add("Payment Reference: " + request.getPaymentReference().trim());
        }

        if (!isBlank(request.getPaymentStatus())) {
            joiner.add("Payment Status: " + request.getPaymentStatus().trim());
        }

        return joiner.toString();
    }

    private boolean isSuccessfulPayment(BookPropertyRequestDto request) {
        String status = request.getPaymentStatus();
        return status != null
                && ("paid".equalsIgnoreCase(status)
                || "success".equalsIgnoreCase(status)
                || "confirmed".equalsIgnoreCase(status));
    }

    private String normalizePaymentMode(String paymentMode) {
        return paymentMode == null ? "" : paymentMode.trim().toUpperCase(Locale.ROOT);
    }

    private boolean equalsIgnoreCase(String left, String right) {
        return left != null && left.equalsIgnoreCase(right);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}

