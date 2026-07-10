package com.example.auro.service;

 
import com.example.auro.entity.Booking;
import com.example.auro.entity.BookingStatus;
import com.example.auro.repository.BookingRepository;
import com.example.auro.entity.CustomerLead;
import com.example.auro.repository.CustomerLeadRepository;
import com.example.auro.dto.SalesCustomerActivityDto;
import com.example.auro.entity.SiteVisit;
import com.example.auro.repository.SiteVisitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class SalesCustomerActivityServiceImpl implements SalesCustomerActivityService {

    private final CustomerLeadRepository leadRepository;
    private final BookingRepository bookingRepository;
    private final SiteVisitRepository siteVisitRepository;

    public SalesCustomerActivityServiceImpl(
            CustomerLeadRepository leadRepository,
            BookingRepository bookingRepository,
            SiteVisitRepository siteVisitRepository
    ) {
        this.leadRepository = leadRepository;
        this.bookingRepository = bookingRepository;
        this.siteVisitRepository = siteVisitRepository;
    }

    @Override
    public List<SalesCustomerActivityDto> getCustomerActivity() {
        List<SalesCustomerActivityDto> records = new ArrayList<>();

        records.addAll(
                leadRepository.findAllByOrderByCreatedAtDesc()
                        .stream()
                        .map(this::fromLead)
                        .toList()
        );

        records.addAll(
                siteVisitRepository.findAllByOrderByCreatedAtDesc()
                        .stream()
                        .map(this::fromSiteVisit)
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
                                SalesCustomerActivityDto::createdAt,
                                Comparator.nullsLast(Comparator.reverseOrder())
                        )
                )
                .toList();
    }

    @Override
    @Transactional
    public SalesCustomerActivityDto updateLeadStatus(Long leadId, String status) {
        CustomerLead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new RuntimeException("Lead not found"));

        lead.setStatus(cleanStatus(status));
        CustomerLead saved = leadRepository.save(lead);

        return fromLead(saved);
    }

    @Override
    @Transactional
    public SalesCustomerActivityDto updateBookingStatus(Long bookingId, String status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(toBookingStatus(status));
        Booking saved = bookingRepository.save(booking);

        return fromBooking(saved);
    }

    private SalesCustomerActivityDto fromLead(CustomerLead lead) {
        return new SalesCustomerActivityDto(
                lead.getLeadCode() != null ? lead.getLeadCode() : "LD-" + lead.getId(),
                lead.getId(),
                "Lead",
                lead.getCustomerName(),
                lead.getCustomerName(),
                lead.getCustomerName(),
                lead.getPhone(),
                lead.getPhone(),
                lead.getEmail(),
                lead.getLeadType(),
                lead.getLeadType(),
                null,
                lead.getPropertyName(),
                lead.getVentureName(),
                lead.getVentureName(),
                lead.getStatus() == null ? "New" : lead.getStatus(),
                lead.getCreatedAt()
        );
    }

    private SalesCustomerActivityDto fromSiteVisit(SiteVisit visit) {
        LocalDateTime createdAt = visit.getCreatedAt();

        if (createdAt == null && visit.getVisitDate() != null) {
            createdAt = LocalDateTime.of(visit.getVisitDate(), LocalTime.MIN);
        }

        return new SalesCustomerActivityDto(
                visit.getVisitCode() != null ? visit.getVisitCode() : "SV-" + visit.getId(),
                visit.getId(),
                "Lead",
                visit.getCustomerName(),
                visit.getCustomerName(),
                visit.getCustomerName(),
                visit.getPhone(),
                visit.getPhone(),
                visit.getEmail(),
                "Site Visit",
                "Site Visit",
                null,
                visit.getPropertyName(),
                visit.getVentureName(),
                visit.getVentureName(),
                formatSiteVisitStatus(visit.getStatus() == null ? "Pending" : visit.getStatus().name()),
                createdAt
        );
    }

    private SalesCustomerActivityDto fromBooking(Booking booking) {
        return new SalesCustomerActivityDto(
                booking.getBookingCode() != null ? booking.getBookingCode() : "BK-" + booking.getId(),
                booking.getId(),
                "Booking",
                booking.getCustomerName(),
                booking.getCustomerName(),
                booking.getCustomerName(),
                booking.getPhone(),
                booking.getPhone(),
                null,
                booking.getPaymentMode(),
                "Reservation",
                null,
                booking.getPropertyName(),
                booking.getVentureName(),
                booking.getVentureName(),
                formatBookingStatus(booking.getStatus() == null ? "Pending" : booking.getStatus()),
                booking.getCreatedAt()
        );
    }

    private String cleanStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return "New";
        }

        return status.trim();
    }

    private BookingStatus toBookingStatus(String status) {
        if (status == null) {
            return BookingStatus.PENDING;
        }

        String value = status.trim().toUpperCase();

        if (value.equals("CONFIRMED")) {
            return BookingStatus.APPROVED;
        }

        if (value.equals("APPROVED")) {
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

        return formatStatus(status);
    }

    private String formatSiteVisitStatus(String status) {
        return formatStatus(status);
    }

    private String formatStatus(String status) {
        if (status == null || status.isBlank()) {
            return "New";
        }

        String cleaned = status.replace("_", " ").toLowerCase();
        return cleaned.substring(0, 1).toUpperCase() + cleaned.substring(1);
    }
}

