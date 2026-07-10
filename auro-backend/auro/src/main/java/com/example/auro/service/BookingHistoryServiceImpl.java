package com.example.auro.service;

import com.example.auro.dto.BookingHistoryResponseDto;
import com.example.auro.entity.PropertyReservation;
import com.example.auro.repository.PropertyReservationRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class BookingHistoryServiceImpl implements BookingHistoryService {

    private final PropertyReservationRepository reservationRepository;

    public BookingHistoryServiceImpl(PropertyReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    @Override
    public List<BookingHistoryResponseDto> getAllBookings() {
        return reservationRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(PropertyReservation::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toDto)
                .toList();
    }

    @Override
    public List<BookingHistoryResponseDto> getBookingsByPhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return getAllBookings();
        }

        String query = phone.trim();
        return reservationRepository.findAll()
                .stream()
                .filter(item -> item.getPhone() != null && item.getPhone().equalsIgnoreCase(query))
                .sorted(Comparator.comparing(PropertyReservation::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toDto)
                .toList();
    }

    private BookingHistoryResponseDto toDto(PropertyReservation booking) {
        return new BookingHistoryResponseDto(
                booking.getBookingCode() != null ? booking.getBookingCode() : "BOOK" + String.format("%05d", booking.getId()),
                booking.getId(),
                booking.getCustomer(),
                booking.getPhone(),
                "Property Reservation",
                booking.getVenture(),
                booking.getProperty(),
                booking.getAmount(),
                null,
                booking.getNotes(),
                booking.getStatus(),
                booking.getCreatedAt()
        );
    }
}
