package com.example.auro.service;

import com.example.auro.dto.BookingDashboardResponse;
import com.example.auro.entity.PropertyReservation;
import com.example.auro.entity.SiteVisit;
import com.example.auro.repository.PropertyReservationRepository;
import com.example.auro.repository.SiteVisitRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookingDashboardService {

    private final SiteVisitRepository siteVisitRepository;
    private final PropertyReservationRepository reservationRepository;

    public List<BookingDashboardResponse> getAllBookings() {
        List<BookingDashboardResponse> bookings = new ArrayList<>();

        for (SiteVisit visit : siteVisitRepository.findAllByOrderByCreatedAtDesc()) {
            bookings.add(
                    BookingDashboardResponse.builder()
                            .id(visit.getId())
                            .code(visit.getVisitCode())
                            .type("Site Visit")
                            .customer(visit.getCustomerName())
                            .phone(visit.getPhone())
                            .email(visit.getEmail())
                            .property(visit.getPropertyName())
                            .venture(visit.getVentureName())
                            .date(visit.getVisitDate() == null ? null : visit.getVisitDate().toString())
                            .timeSlot(visit.getTimeSlot())
                            .amount(BigDecimal.ZERO)
                            .paid(BigDecimal.ZERO)
                            .status(visit.getStatus() == null ? "Pending" : visit.getStatus().name())
                            .build()
            );
        }

        for (PropertyReservation booking : reservationRepository.findAll()) {
            bookings.add(
                    BookingDashboardResponse.builder()
                            .id(booking.getId())
                            .code(booking.getBookingCode())
                            .type("Property Reservation")
                            .customer(booking.getCustomer())
                            .phone(booking.getPhone())
                            .email(booking.getEmail())
                            .property(booking.getProperty())
                            .venture(booking.getVenture())
                            .date(booking.getBookingDate() == null ? null : booking.getBookingDate().toString())
                            .amount(booking.getAmount())
                            .paid(booking.getPaid())
                            .status(booking.getStatus())
                            .build()
            );
        }

        bookings.sort(Comparator.comparing(BookingDashboardResponse::getDate, Comparator.nullsLast(String::compareTo)).reversed());
        return bookings;
    }
}
