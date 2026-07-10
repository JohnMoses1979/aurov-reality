package com.example.auro.service;

 
import com.example.auro.entity.Booking;
import com.example.auro.entity.BookingStatus;
import com.example.auro.repository.BookingRepository;
import com.example.auro.entity.CustomerLead;
import com.example.auro.repository.CustomerLeadRepository;
import com.example.auro.dto.SalesLeadRecordDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class SalesLeadsServiceImpl implements SalesLeadsService {

    private final CustomerLeadRepository leadRepository;
    private final BookingRepository bookingRepository;

    public SalesLeadsServiceImpl(
            CustomerLeadRepository leadRepository,
            BookingRepository bookingRepository
    ) {
        this.leadRepository = leadRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    public List<SalesLeadRecordDto> getLeadsAndBookings() {
        List<SalesLeadRecordDto> records = new ArrayList<>();

        records.addAll(
                leadRepository.findAllByOrderByCreatedAtDesc()
                        .stream()
                        .map(this::fromLead)
                        .toList()
        );

        records.addAll(
                bookingRepository.findAllByOrderByCreatedAtDesc()
                        .stream()
                        .map(this::fromBooking)
                        .toList()
        );

        return records.stream()
                .sorted(
                        Comparator.comparing(
                                SalesLeadRecordDto::createdAt,
                                Comparator.nullsLast(Comparator.reverseOrder())
                        )
                )
                .toList();
    }

    @Override
    @Transactional
    public SalesLeadRecordDto updateLeadStatus(Long leadId, String status) {
        CustomerLead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new RuntimeException("Lead not found"));

        lead.setStatus(cleanLeadStatus(status));

        CustomerLead saved = leadRepository.save(lead);

        return fromLead(saved);
    }

    @Override
    @Transactional
    public SalesLeadRecordDto updateBookingStatus(Long bookingId, String status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(toBookingStatus(status));

        Booking saved = bookingRepository.save(booking);

        return fromBooking(saved);
    }

    private SalesLeadRecordDto fromLead(CustomerLead lead) {
        String leadCode = lead.getLeadCode() != null
                ? lead.getLeadCode()
                : "LD-" + lead.getId();

        String leadType = lead.getLeadType() == null || lead.getLeadType().isBlank()
                ? "Lead"
                : lead.getLeadType();

        return new SalesLeadRecordDto(
                leadCode,
                lead.getId(),
                "Lead",
                lead.getCustomerName(),
                lead.getCustomerName(),
                lead.getCustomerName(),
                lead.getPhone(),
                lead.getPhone(),
                lead.getEmail(),
                leadType,
                leadType,
                null,
                lead.getPropertyName(),
                lead.getVentureName(),
                lead.getVentureName(),
                lead.getStatus() == null ? "New" : lead.getStatus(),
                lead.getCreatedAt()
        );
    }

    private SalesLeadRecordDto fromBooking(Booking booking) {
        String bookingCode = booking.getBookingCode() != null
                ? booking.getBookingCode()
                : "BK-" + booking.getId();

        return new SalesLeadRecordDto(
                bookingCode,
                booking.getId(),
                "Booking",
                booking.getCustomerName(),
                booking.getCustomerName(),
                booking.getCustomerName(),
                booking.getPhone(),
                booking.getPhone(),
                null,
                booking.getPaymentMode() == null ? "Booking" : booking.getPaymentMode(),
                "Reservation",
                null,
                booking.getPropertyName(),
                booking.getVentureName(),
                booking.getVentureName(),
                formatBookingStatus(booking.getStatus() == null ? "Pending" : booking.getStatus()),
                booking.getCreatedAt()
        );
    }

    private String cleanLeadStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return "New";
        }

        String value = status.trim();

        if (value.equalsIgnoreCase("followup") || value.equalsIgnoreCase("follow up")) {
            return "Follow-up";
        }

        if (value.equalsIgnoreCase("converted")) {
            return "Converted";
        }

        if (value.equalsIgnoreCase("new")) {
            return "New";
        }

        return value;
    }

    private BookingStatus toBookingStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return BookingStatus.PENDING;
        }

        String value = status.trim().toUpperCase(Locale.ROOT);

        if (value.equals("CONFIRMED") || value.equals("APPROVED")) {
            return BookingStatus.APPROVED;
        }

        if (value.equals("REJECTED")) {
            return BookingStatus.REJECTED;
        }

        if (value.equals("CANCELLED") || value.equals("CANCELED")) {
            return BookingStatus.CANCELLED;
        }

        return BookingStatus.PENDING;
    }

    private String formatBookingStatus(String status) {
        if (status.equalsIgnoreCase("APPROVED")) {
            return "Confirmed";
        }

        return formatSimple(status);
    }

    private String formatSimple(String value) {
        if (value == null || value.isBlank()) {
            return "New";
        }

        String cleaned = value.replace("_", " ").toLowerCase(Locale.ROOT);

        return cleaned.substring(0, 1).toUpperCase() + cleaned.substring(1);
    }
}

