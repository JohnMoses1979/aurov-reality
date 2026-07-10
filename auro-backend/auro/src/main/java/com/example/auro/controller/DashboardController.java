package com.example.auro.controller;

import com.example.auro.entity.Booking;
import com.example.auro.entity.BookingType;
import com.example.auro.entity.Complaint;
import com.example.auro.entity.PdfTask;
import com.example.auro.entity.PdfTaskStatus;
import com.example.auro.entity.Property;
import com.example.auro.entity.SiteVisit;
import com.example.auro.entity.SubmittedWork;
import com.example.auro.repository.BookingRepository;
import com.example.auro.repository.ComplaintRepository;
import com.example.auro.repository.LeadRepository;
import com.example.auro.repository.PdfTaskRepository;
import com.example.auro.repository.PropertyRepository;
import com.example.auro.repository.SiteVisitRepository;
import com.example.auro.repository.SubmittedWorkRepository;
import com.example.auro.repository.UserRepository;
import com.example.auro.repository.VentureRepository;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
})
public class DashboardController {

    private final VentureRepository ventureRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final SubmittedWorkRepository submittedWorkRepository;
    private final BookingRepository bookingRepository;
    private final LeadRepository leadRepository;
    private final ComplaintRepository complaintRepository;
    private final PdfTaskRepository pdfTaskRepository;
    private final SiteVisitRepository siteVisitRepository;

    public DashboardController(
            VentureRepository ventureRepository,
            PropertyRepository propertyRepository,
            UserRepository userRepository,
            SubmittedWorkRepository submittedWorkRepository,
            BookingRepository bookingRepository,
            LeadRepository leadRepository,
            ComplaintRepository complaintRepository,
            PdfTaskRepository pdfTaskRepository,
            SiteVisitRepository siteVisitRepository
    ) {
        this.ventureRepository = ventureRepository;
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
        this.submittedWorkRepository = submittedWorkRepository;
        this.bookingRepository = bookingRepository;
        this.leadRepository = leadRepository;
        this.complaintRepository = complaintRepository;
        this.pdfTaskRepository = pdfTaskRepository;
        this.siteVisitRepository = siteVisitRepository;
    }

    @GetMapping("/md")
    @PreAuthorize("hasAnyAuthority('Managing Director', 'Operational Head')")
    public Map<String, Object> getManagingDirectorDashboard(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date
    ) {
        LocalDate selectedDate = date == null ? LocalDate.now() : date;

        List<Property> properties = propertyRepository.findAll();
        List<SubmittedWork> submittedWorks = submittedWorkRepository.findAll();
        List<Complaint> complaints = complaintRepository.findAll();
        List<SiteVisit> siteVisits = siteVisitRepository.findAllByOrderByCreatedAtDesc();

        BigDecimal totalRevenue = properties.stream()
                .filter(p -> equalsIgnoreCase(p.getStatus(), "Sold"))
                .map(Property::getPrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long salesCount = properties.stream()
                .filter(p -> equalsIgnoreCase(p.getStatus(), "Sold"))
                .count();

        long pendingReviews = submittedWorks.stream()
                .map(SubmittedWork::getStatus)
                .filter(Objects::nonNull)
                .filter(status -> status.equalsIgnoreCase("Submitted") || status.equalsIgnoreCase("Reviewed"))
                .count();

        long approvedWorks = submittedWorks.stream()
                .map(SubmittedWork::getStatus)
                .filter(Objects::nonNull)
                .filter(status -> status.equalsIgnoreCase("Approved"))
                .count();

        long rejectedWorks = submittedWorks.stream()
                .map(SubmittedWork::getStatus)
                .filter(Objects::nonNull)
                .filter(status -> status.equalsIgnoreCase("Rejected"))
                .count();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("ventures", ventureRepository.count());
        summary.put("properties", propertyRepository.count());
        summary.put("employees", userRepository.count());
        summary.put("revenue", totalRevenue);
        summary.put("salesCount", salesCount);
        summary.put("submittedWorks", submittedWorks.size());
        summary.put("pendingReviews", pendingReviews);
        summary.put("approvedWorks", approvedWorks);
        summary.put("rejectedWorks", rejectedWorks);

        List<Map<String, Object>> propertyStatus = List.of(
                Map.of("name", "Available", "value", propertyRepository.countByStatusIgnoreCase("Available")),
                Map.of("name", "Reserved", "value", propertyRepository.countByStatusIgnoreCase("Reserved")),
                Map.of("name", "Sold", "value", propertyRepository.countByStatusIgnoreCase("Sold")),
                Map.of("name", "Blocked", "value", propertyRepository.countByStatusIgnoreCase("Blocked"))
        );

        List<Map<String, Object>> bookingOverview = buildBookingOverview(siteVisits);
        List<Booking> selectedBookings = bookingRepository.findByActivityDate(selectedDate);
        List<SiteVisit> selectedSiteVisits = siteVisits.stream()
                .filter(visit -> selectedDate.equals(visit.getVisitDate()))
                .toList();

        Map<String, Object> calendar = new LinkedHashMap<>();
        calendar.put("submitted", submittedWorks.stream()
                .filter(work -> selectedDate.equals(work.getSubmissionDate()))
                .map(this::toSubmittedWorkSummary)
                .toList());
        calendar.put("bookings", selectedBookings);
        calendar.put("complaints", complaints.stream()
                .filter(complaint -> complaint.getCreatedAt() != null)
                .filter(complaint -> selectedDate.equals(complaint.getCreatedAt().toLocalDate()))
                .map(this::toComplaintSummary)
                .toList());
        calendar.put("demoRequests", selectedBookings.stream()
                .filter(b -> b.getType() == BookingType.DEMO)
                .toList());
        calendar.put("siteVisits", selectedSiteVisits.stream().map(this::toSiteVisitSummary).toList());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("summary", summary);
        response.put("propertyStatus", propertyStatus);
        response.put("bookingOverview", bookingOverview);
        response.put("calendar", calendar);
        response.put("latestSubmittedWorks", submittedWorks.stream()
                .filter(work -> work.getCreatedAt() != null)
                .sorted(Comparator.comparing(SubmittedWork::getCreatedAt).reversed())
                .limit(8)
                .map(this::toSubmittedWorkSummary)
                .toList());
        response.put("totalLeads", leadRepository.count());
        response.put("salesTaskUpdates", buildSalesTaskUpdates());

        return response;
    }

    @GetMapping("/md/sales-task-updates/{taskId}/files/{fileType}")
    @PreAuthorize("hasAnyAuthority('Managing Director', 'Operational Head')")
    public ResponseEntity<Resource> downloadLeadershipSalesTaskFile(
            @PathVariable Long taskId,
            @PathVariable String fileType
    ) throws IOException {
        PdfTask task = pdfTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!isSalesTask(task)) {
            throw new RuntimeException("Task not available for leadership dashboard");
        }

        Resource resource = getTaskFileResource(task, fileType);
        String fileName = getTaskFileName(task, fileType);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }

    private List<Map<String, Object>> buildBookingOverview(List<SiteVisit> siteVisits) {
        List<Booking> bookings = bookingRepository.findAll();
        List<Map<String, Object>> overview = new ArrayList<>();
        YearMonth currentMonth = YearMonth.now();

        for (int i = 5; i >= 0; i--) {
            YearMonth month = currentMonth.minusMonths(i);

            long demo = countByMonthAndType(bookings, month, BookingType.DEMO);
            long reservations = countByMonthAndType(bookings, month, BookingType.RESERVATION);
            long purchases = countByMonthAndType(bookings, month, BookingType.PURCHASE);
            long monthlySiteVisits = countSiteVisitsByMonth(siteVisits, month);

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("month", month.getMonth().name().substring(0, 3));
            item.put("demoBookings", demo);
            item.put("reservations", reservations);
            item.put("purchases", purchases);
            item.put("siteVisits", monthlySiteVisits);
            overview.add(item);
        }

        return overview;
    }

    private long countByMonthAndType(List<Booking> bookings, YearMonth month, BookingType type) {
        return bookings.stream()
                .filter(b -> b.getActivityDate() != null)
                .filter(b -> YearMonth.from(b.getActivityDate()).equals(month))
                .filter(b -> b.getType() == type)
                .count();
    }

    private long countSiteVisitsByMonth(List<SiteVisit> siteVisits, YearMonth month) {
        return siteVisits.stream()
                .filter(visit -> visit.getVisitDate() != null)
                .filter(visit -> YearMonth.from(visit.getVisitDate()).equals(month))
                .count();
    }

    private List<Map<String, Object>> buildSalesTaskUpdates() {
        return pdfTaskRepository.findByDepartmentOrAssignedByRoleOrderByCreatedAtDesc("Sales", "Sales Manager")
                .stream()
                .filter(this::isSalesTask)
                .filter(this::isVisibleLeadershipTaskUpdate)
                .limit(8)
                .map(this::toSalesTaskUpdateSummary)
                .toList();
    }

    private boolean isSalesTask(PdfTask task) {
        return task != null && (
                equalsIgnoreCase(task.getDepartment(), "Sales")
                        || equalsIgnoreCase(task.getAssignedByRole(), "Sales Manager")
        );
    }

    private boolean isVisibleLeadershipTaskUpdate(PdfTask task) {
        if (task.getUpdatePdfName() != null && !task.getUpdatePdfName().isBlank()) {
            return true;
        }
        if (task.getCompletionPdfName() != null && !task.getCompletionPdfName().isBlank()) {
            return true;
        }
        return task.getStatusEnum() != null && task.getStatusEnum() != PdfTaskStatus.ASSIGNED;
    }

    private Map<String, Object> toSalesTaskUpdateSummary(PdfTask task) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", task.getTaskCode() == null ? "TASK-" + task.getId() : task.getTaskCode());
        response.put("taskId", task.getId());
        response.put("title", task.getTitle());
        response.put("assignee", task.getAssignee());
        response.put("assigneeEmployeeId", task.getAssigneeEmployeeId());
        response.put("status", formatTaskStatus(task.getStatusEnum()));
        response.put("pdfName", task.getPdfName());
        response.put("updatePdf", task.getUpdatePdfName() == null ? null : Map.of(
                "name", task.getUpdatePdfName(),
                "type", "update"
        ));
        response.put("completionPdf", task.getCompletionPdfName() == null ? null : Map.of(
                "name", task.getCompletionPdfName(),
                "type", "completion"
        ));
        return response;
    }

    private Map<String, Object> toSiteVisitSummary(SiteVisit visit) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", visit.getId());
        response.put("visitCode", visit.getVisitCode());
        response.put("customer", visit.getCustomerName());
        response.put("phone", visit.getPhone());
        response.put("email", visit.getEmail());
        response.put("venture", visit.getVentureName());
        response.put("property", visit.getPropertyName());
        response.put("date", visit.getVisitDate());
        response.put("timeSlot", visit.getTimeSlot());
        response.put("status", formatTaskStatusFromText(visit.getStatus() == null ? null : visit.getStatus().name(), "Pending"));
        response.put("createdAt", visit.getCreatedAt());
        return response;
    }

    private Resource getTaskFileResource(PdfTask task, String fileType) throws IOException {
        String filePath = getTaskFilePath(task, fileType);
        if (filePath == null || filePath.isBlank()) {
            throw new RuntimeException("File not available");
        }
        Resource resource = new UrlResource(Path.of(filePath).normalize().toUri());
        if (!resource.exists() || !resource.isReadable()) {
            throw new RuntimeException("File not found");
        }
        return resource;
    }

    private String getTaskFilePath(PdfTask task, String fileType) {
        String type = normalizeFileType(fileType);
        if (type.equals("update")) {
            return task.getUpdatePdfPath();
        }
        if (type.equals("completion")) {
            return task.getCompletionPdfPath();
        }
        return task.getPdfPath();
    }

    private String getTaskFileName(PdfTask task, String fileType) {
        String type = normalizeFileType(fileType);
        if (type.equals("update")) {
            return task.getUpdatePdfName() == null ? "Update.pdf" : task.getUpdatePdfName();
        }
        if (type.equals("completion")) {
            return task.getCompletionPdfName() == null ? "Completion.pdf" : task.getCompletionPdfName();
        }
        return task.getPdfName() == null ? "Assignment.pdf" : task.getPdfName();
    }

    private String normalizeFileType(String fileType) {
        if (fileType == null) {
            return "assignment";
        }
        String normalized = fileType.trim().toLowerCase(Locale.ROOT);
        if (normalized.equals("update") || normalized.equals("completion")) {
            return normalized;
        }
        return "assignment";
    }

    private boolean equalsIgnoreCase(String actual, String expected) {
        return actual != null && actual.equalsIgnoreCase(expected);
    }

    private Map<String, Object> toSubmittedWorkSummary(SubmittedWork work) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", work.getId());
        response.put("submissionCode", work.getSubmissionCode());
        response.put("title", work.getTitle());
        response.put("description", work.getDescription());
        response.put("department", work.getDepartment());
        response.put("employeeId", work.getEmployeeId());
        response.put("managerName", work.getManagerName());
        response.put("managerUsername", work.getManagerUsername());
        response.put("managerRole", work.getManagerRole());
        response.put("status", work.getStatus());
        response.put("remarks", work.getRemarks());
        response.put("reviewedBy", work.getReviewedBy());
        response.put("reviewedAt", work.getReviewedAt());
        response.put("submissionDate", work.getSubmissionDate());
        response.put("createdBy", work.getCreatedBy());
        response.put("createdAt", work.getCreatedAt());
        response.put("updatedAt", work.getUpdatedAt());
        response.put("fileName", work.getFileName());
        response.put("contentType", work.getContentType());
        response.put("fileSizeLabel", work.getFileSizeLabel());
        response.put("pdfOriginalName", work.getPdfOriginalName());
        response.put("pdfContentType", work.getPdfContentType());
        response.put("pdfSize", work.getPdfSize());
        response.put("hasAttachment", work.getData() != null && work.getData().length > 0);
        response.put("hasStoredPdf", work.getPdfStoragePath() != null && !work.getPdfStoragePath().isBlank());
        return response;
    }

    private Map<String, Object> toComplaintSummary(Complaint complaint) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", complaint.getId());
        response.put("complaintCode", complaint.getComplaintCode());
        response.put("sourceType", complaint.getSourceType());
        response.put("target", complaint.getTarget());
        response.put("targetLabel", complaint.getTargetLabel());
        response.put("department", complaint.getDepartment());
        response.put("employeeId", complaint.getEmployeeId());
        response.put("employeeName", complaint.getEmployeeName());
        response.put("employeeRole", complaint.getEmployeeRole());
        response.put("customerName", complaint.getCustomerName());
        response.put("customerPhone", complaint.getCustomerPhone());
        response.put("customerEmail", complaint.getCustomerEmail());
        response.put("priority", complaint.getPriority());
        response.put("subject", complaint.getSubject());
        response.put("description", complaint.getDescription());
        response.put("status", complaint.getStatus());
        response.put("remarks", complaint.getRemarks());
        response.put("resolutionNotes", complaint.getResolutionNotes());
        response.put("createdBy", complaint.getCreatedBy());
        response.put("createdAt", complaint.getCreatedAt());
        response.put("updatedAt", complaint.getUpdatedAt());
        response.put("attachmentsJson", complaint.getAttachmentsJson());
        response.put("statusHistoryJson", complaint.getStatusHistoryJson());
        return response;
    }

    private String formatTaskStatus(PdfTaskStatus status) {
        if (status == null) {
            return "Assigned";
        }
        return switch (status) {
            case ASSIGNED -> "Assigned";
            case IN_PROGRESS -> "In Progress";
            case SUBMITTED -> "Submitted";
            case REVIEWED -> "Reviewed";
            case APPROVED -> "Approved";
            case COMPLETED -> "Completed";
            case REJECTED -> "Rejected";
            case CLOSED -> "Closed";
        };
    }

    private String formatTaskStatusFromText(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        String cleaned = value.replace("_", " ").toLowerCase(Locale.ROOT);
        return cleaned.substring(0, 1).toUpperCase(Locale.ROOT) + cleaned.substring(1);
    }
}

