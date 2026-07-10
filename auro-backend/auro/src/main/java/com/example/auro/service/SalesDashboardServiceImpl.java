package com.example.auro.service;

import com.example.auro.dto.SalesDashboardActivityDto;
import com.example.auro.dto.SalesDashboardComplaintDto;
import com.example.auro.dto.SalesDashboardCustomerDto;
import com.example.auro.dto.SalesDashboardFileDto;
import com.example.auro.dto.SalesDashboardResponseDto;
import com.example.auro.dto.SalesDashboardStatsDto;
import com.example.auro.dto.SalesDashboardTaskDto;
import com.example.auro.dto.SalesExecutiveProgressDto;
import com.example.auro.entity.Booking;
import com.example.auro.entity.Complaint;
import com.example.auro.entity.CustomerLead;
import com.example.auro.entity.Employee;
import com.example.auro.entity.PdfTask;
import com.example.auro.entity.PdfTaskStatus;
import com.example.auro.repository.BookingRepository;
import com.example.auro.repository.ComplaintRepository;
import com.example.auro.repository.CustomerLeadRepository;
import com.example.auro.repository.EmployeeRepository;
import com.example.auro.repository.PdfTaskRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Path;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class SalesDashboardServiceImpl implements SalesDashboardService {

    private static final String DEPARTMENT = "Sales";
    private static final String ROLE = "Sales Manager";

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    private final EmployeeRepository employeeRepository;
    private final PdfTaskRepository taskRepository;
    private final CustomerLeadRepository leadRepository;
    private final BookingRepository bookingRepository;
    private final ComplaintRepository complaintRepository;

    public SalesDashboardServiceImpl(
            EmployeeRepository employeeRepository,
            PdfTaskRepository taskRepository,
            CustomerLeadRepository leadRepository,
            BookingRepository bookingRepository,
            ComplaintRepository complaintRepository
    ) {
        this.employeeRepository = employeeRepository;
        this.taskRepository = taskRepository;
        this.leadRepository = leadRepository;
        this.bookingRepository = bookingRepository;
        this.complaintRepository = complaintRepository;
    }

    @Override
    public SalesDashboardResponseDto getDashboard() {
        List<Employee> executives = employeeRepository
                .findByDepartmentAndStatusNotOrderByNameAsc(DEPARTMENT, "Inactive")
                .stream()
                .filter(this::isExecutive)
                .toList();

        List<PdfTask> tasks = taskRepository
                .findByDepartmentOrAssignedByOrderByCreatedAtDesc(DEPARTMENT, ROLE);

        List<PdfTask> submittedTasks = tasks.stream()
                .filter(task -> List.of(
                        PdfTaskStatus.SUBMITTED,
                        PdfTaskStatus.REVIEWED,
                        PdfTaskStatus.APPROVED,
                        PdfTaskStatus.COMPLETED,
                        PdfTaskStatus.REJECTED,
                        PdfTaskStatus.CLOSED
                ).contains(task.getStatusEnum()))
                .toList();

        List<PdfTask> completedTasks = tasks.stream()
                .filter(this::isCompleted)
                .toList();

        List<CustomerLead> leads = leadRepository.findAllByOrderByCreatedAtDesc();
        List<Booking> bookings = bookingRepository.findAllByOrderByCreatedAtDesc();
        List<Complaint> complaints = complaintRepository.findByDepartmentOrderByCreatedAtDesc(DEPARTMENT);

        long overallProgress = tasks.isEmpty()
                ? 0
                : Math.round((completedTasks.size() * 100.0) / tasks.size());

        SalesDashboardStatsDto stats = new SalesDashboardStatsDto(
                executives.size(),
                tasks.size(),
                submittedTasks.size(),
                completedTasks.size(),
                overallProgress
        );

        List<SalesExecutiveProgressDto> executiveDtos = executives.stream()
                .map(employee -> toExecutiveDto(employee, tasks))
                .toList();

        List<SalesDashboardTaskDto> submittedTaskDtos = submittedTasks.stream()
                .limit(6)
                .map(this::toTaskDto)
                .toList();

        List<SalesDashboardCustomerDto> customers = buildCustomers(leads, bookings);

        List<SalesDashboardComplaintDto> complaintDtos = complaints.stream()
                .limit(7)
                .map(this::toComplaintDto)
                .toList();

        List<SalesDashboardActivityDto> recentActivity =
                buildRecentActivity(tasks, complaints, leads);

        return new SalesDashboardResponseDto(
                stats,
                executiveDtos,
                submittedTaskDtos,
                recentActivity,
                customers,
                complaintDtos
        );
    }

    @Override
    @Transactional
    public SalesDashboardTaskDto reviewTask(Long taskId, String decision) {
        PdfTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        String value = decision == null ? "" : decision.trim().toLowerCase(Locale.ROOT);

        if (value.equals("approve") || value.equals("approved")) {
            task.setStatus(PdfTaskStatus.APPROVED);
        } else if (value.equals("reject") || value.equals("rejected")) {
            task.setStatus(PdfTaskStatus.REJECTED);
        } else {
            throw new RuntimeException("Invalid review decision");
        }

        PdfTask saved = taskRepository.save(task);
        return toTaskDto(saved);
    }

    @Override
    public Resource getTaskFile(Long taskId, String fileType) {
        PdfTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        String path = getFilePath(task, fileType);

        if (path == null || path.isBlank()) {
            throw new RuntimeException("File not available");
        }

        try {
            Resource resource = new UrlResource(Path.of(path).normalize().toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("File not found");
            }

            return resource;
        } catch (Exception error) {
            throw new RuntimeException("Unable to read file", error);
        }
    }

    @Override
    public String getTaskFileName(Long taskId, String fileType) {
        PdfTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        String type = normalizeFileType(fileType);

        if (type.equals("update")) {
            return task.getUpdatePdfName() == null ? "Update.pdf" : task.getUpdatePdfName();
        }

        if (type.equals("completion")) {
            return task.getCompletionPdfName() == null ? "Completion.pdf" : task.getCompletionPdfName();
        }

        return task.getPdfName() == null ? "Assignment.pdf" : task.getPdfName();
    }

    private List<SalesDashboardCustomerDto> buildCustomers(
            List<CustomerLead> leads,
            List<Booking> bookings
    ) {
        List<SalesDashboardCustomerDto> customers = new ArrayList<>();

        customers.addAll(
                leads.stream()
                        .map(lead -> new SalesDashboardCustomerDto(
                                lead.getLeadCode() != null ? lead.getLeadCode() : "LD-" + lead.getId(),
                                lead.getId(),
                                lead.getCustomerName(),
                                lead.getLeadType(),
                                lead.getPhone(),
                                lead.getEmail(),
                                lead.getStatus() == null ? "New" : lead.getStatus()
                        ))
                        .toList()
        );

        customers.addAll(
                bookings.stream()
                        .map(booking -> new SalesDashboardCustomerDto(
                                booking.getBookingCode() != null ? booking.getBookingCode() : "BK-" + booking.getId(),
                                booking.getId(),
                                booking.getCustomerName(),
                                booking.getPaymentMode() == null ? "Booking" : booking.getPaymentMode(),
                                booking.getPhone(),
                                "",
                                formatBookingStatus(booking.getStatus() == null ? "Pending" : booking.getStatus())
                        ))
                        .toList()
        );

        return customers.stream()
                .limit(8)
                .toList();
    }

    private List<SalesDashboardActivityDto> buildRecentActivity(
            List<PdfTask> tasks,
            List<Complaint> complaints,
            List<CustomerLead> leads
    ) {
        List<SalesDashboardActivityDto> activities = new ArrayList<>();

        activities.addAll(
                tasks.stream()
                        .map(task -> new SalesDashboardActivityDto(
                                task.getTaskCode() != null ? task.getTaskCode() : "TASK-" + task.getId(),
                                task.getTitle(),
                                task.getAssignee(),
                                formatTaskStatus(task.getStatusEnum()),
                                task.getCreatedAt() == null ? "-" : task.getCreatedAt().format(DATE_FORMAT),
                                "Task"
                        ))
                        .toList()
        );

        activities.addAll(
                complaints.stream()
                        .map(complaint -> new SalesDashboardActivityDto(
                                complaint.getComplaintCode() != null ? complaint.getComplaintCode() : "CMP-" + complaint.getId(),
                                complaint.getSubject(),
                                complaint.getEmployeeName(),
                                formatComplaintStatus(complaint.getStatus() == null ? "Pending" : complaint.getStatus()),
                                complaint.getCreatedAt() == null ? "-" : complaint.getCreatedAt().format(DATE_FORMAT),
                                "Complaint"
                        ))
                        .toList()
        );

        activities.addAll(
                leads.stream()
                        .map(lead -> new SalesDashboardActivityDto(
                                lead.getLeadCode() != null ? lead.getLeadCode() : "LD-" + lead.getId(),
                                lead.getCustomerName(),
                                lead.getPhone(),
                                lead.getStatus() == null ? "New" : lead.getStatus(),
                                lead.getCreatedAt() == null ? "-" : lead.getCreatedAt().format(DATE_FORMAT),
                                "Lead"
                        ))
                        .toList()
        );

        return activities.stream()
                .limit(8)
                .toList();
    }

    private SalesExecutiveProgressDto toExecutiveDto(
            Employee employee,
            List<PdfTask> tasks
    ) {
        List<PdfTask> assigned = tasks.stream()
                .filter(task -> taskBelongsTo(task, employee))
                .toList();

        long completed = assigned.stream()
                .filter(this::isCompleted)
                .count();

        long percent = assigned.isEmpty()
                ? 0
                : Math.round((completed * 100.0) / assigned.size());

        return new SalesExecutiveProgressDto(
                employee.getId(),
                employee.getEmployeeId(),
                employee.getName(),
                employee.getEmail(),
                employee.getEmail(),
                employee.getRole(),
                employee.getStatus() == null ? "Active" : employee.getStatus(),
                assigned.size(),
                completed,
                percent
        );
    }

    private SalesDashboardTaskDto toTaskDto(PdfTask task) {
        return new SalesDashboardTaskDto(
                task.getTaskCode() != null ? task.getTaskCode() : "TASK-" + task.getId(),
                task.getId(),
                task.getTitle(),
                task.getAssignee(),
                task.getAssigneeEmployeeId(),
                formatTaskStatus(task.getStatusEnum()),
                task.getCreatedAt() == null ? "-" : task.getCreatedAt().format(DATE_FORMAT),
                task.getUpdatePdfName() == null ? null : new SalesDashboardFileDto(task.getUpdatePdfName(), "update"),
                task.getCompletionPdfName() == null ? null : new SalesDashboardFileDto(task.getCompletionPdfName(), "completion"),
                task.getCreatedAt()
        );
    }

    private SalesDashboardComplaintDto toComplaintDto(Complaint complaint) {
        return new SalesDashboardComplaintDto(
                complaint.getComplaintCode() != null ? complaint.getComplaintCode() : "CMP-" + complaint.getId(),
                complaint.getId(),
                complaint.getSubject(),
                complaint.getEmployeeName(),
                complaint.getEmployeeId(),
                formatComplaintStatus(complaint.getStatus() == null ? "Pending" : complaint.getStatus())
        );
    }

    private boolean taskBelongsTo(PdfTask task, Employee employee) {
        return matches(task.getAssigneeId(), employee.getId())
                || matches(task.getAssigneeEmployeeId(), employee.getEmployeeId())
                || matches(task.getAssignee(), employee.getName())
                || matches(task.getAssignee(), employee.getEmail());
    }

    private boolean matches(Object left, Object right) {
        if (left == null || right == null) {
            return false;
        }

        return String.valueOf(left).trim().equalsIgnoreCase(String.valueOf(right).trim());
    }

    private boolean isExecutive(Employee employee) {
        if (employee.getRole() == null) {
            return false;
        }

        return employee.getRole().toLowerCase(Locale.ROOT).contains("executive");
    }

    private boolean isCompleted(PdfTask task) {
        return List.of(
                PdfTaskStatus.REVIEWED,
                PdfTaskStatus.APPROVED,
                PdfTaskStatus.COMPLETED,
                PdfTaskStatus.CLOSED
        ).contains(task.getStatusEnum());
    }

    private String getFilePath(PdfTask task, String fileType) {
        String type = normalizeFileType(fileType);

        if (type.equals("update")) {
            return task.getUpdatePdfPath();
        }

        if (type.equals("completion")) {
            return task.getCompletionPdfPath();
        }

        return task.getPdfPath();
    }

    private String normalizeFileType(String fileType) {
        if (fileType == null) {
            return "assignment";
        }

        String type = fileType.trim().toLowerCase(Locale.ROOT);

        if (type.equals("update") || type.equals("completion")) {
            return type;
        }

        return "assignment";
    }

    private String formatTaskStatus(PdfTaskStatus status) {
        if (status == null) return "Assigned";

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

    private String formatComplaintStatus(String status) {
        if (status == null || status.isBlank()) {
            return "Pending";
        }

        if (status.equalsIgnoreCase("IN_PROGRESS")) {
            return "In Progress";
        }

        return formatSimple(status);
    }

    private String formatBookingStatus(String status) {
        if (status == null || status.isBlank()) {
            return "Pending";
        }

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

