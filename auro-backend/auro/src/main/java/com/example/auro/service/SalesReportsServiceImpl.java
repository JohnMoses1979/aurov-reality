package com.example.auro.service;

 
import com.example.auro.entity.Employee;
import com.example.auro.repository.EmployeeRepository;
import com.example.auro.dto.SalesExecutiveReportDto;
import com.example.auro.dto.SalesReportsResponseDto;
import com.example.auro.dto.SalesReportsStatsDto;
import com.example.auro.dto.SalesTaskReportDto;
import com.example.auro.entity.PdfTask;
import com.example.auro.entity.PdfTaskStatus;
import com.example.auro.repository.PdfTaskRepository;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class SalesReportsServiceImpl implements SalesReportsService {

    private static final String ROLE = "Sales Manager";
    private static final String DEPARTMENT = "Sales";

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    private final EmployeeRepository employeeRepository;
    private final PdfTaskRepository taskRepository;

    public SalesReportsServiceImpl(
            EmployeeRepository employeeRepository,
            PdfTaskRepository taskRepository
    ) {
        this.employeeRepository = employeeRepository;
        this.taskRepository = taskRepository;
    }

    @Override
    public SalesReportsResponseDto getReports() {
        List<Employee> executives = employeeRepository
                .findByDepartmentAndStatusNotOrderByNameAsc(DEPARTMENT, "Inactive")
                .stream()
                .filter(this::isExecutive)
                .toList();

        List<PdfTask> tasks = taskRepository
                .findByDepartmentOrAssignedByOrderByCreatedAtDesc(DEPARTMENT, ROLE);

        long completedCount = tasks.stream()
                .filter(this::isCompleted)
                .count();

        long overall = tasks.isEmpty()
                ? 0
                : Math.round((completedCount * 100.0) / tasks.size());

        SalesReportsStatsDto stats = new SalesReportsStatsDto(
                executives.size(),
                tasks.size(),
                completedCount,
                overall
        );

        List<SalesExecutiveReportDto> executiveDtos = executives.stream()
                .map(employee -> toExecutiveDto(employee, tasks))
                .toList();

        List<SalesTaskReportDto> taskDtos = tasks.stream()
                .map(this::toTaskDto)
                .toList();

        return new SalesReportsResponseDto(
                stats,
                executiveDtos,
                taskDtos
        );
    }

    private SalesExecutiveReportDto toExecutiveDto(
            Employee employee,
            List<PdfTask> tasks
    ) {
        List<PdfTask> assignedTasks = tasks.stream()
                .filter(task -> taskBelongsTo(task, employee))
                .toList();

        long completed = assignedTasks.stream()
                .filter(this::isCompleted)
                .count();

        long percent = assignedTasks.isEmpty()
                ? 0
                : Math.round((completed * 100.0) / assignedTasks.size());

        return new SalesExecutiveReportDto(
                employee.getId(),
                employee.getEmployeeId(),
                employee.getName(),
                employee.getEmail(),
                employee.getEmail(),
                employee.getRole(),
                employee.getStatus() == null ? "Active" : employee.getStatus(),
                assignedTasks.size(),
                completed,
                percent
        );
    }

    private SalesTaskReportDto toTaskDto(PdfTask task) {
        String updatedAt = "-";

        if (task.getCreatedAt() != null) {
            updatedAt = task.getCreatedAt().format(DATE_FORMAT);
        }

        return new SalesTaskReportDto(
                task.getTaskCode() != null ? task.getTaskCode() : "TASK-" + task.getId(),
                task.getId(),
                task.getTitle(),
                task.getAssignee(),
                task.getAssigneeEmployeeId(),
                task.getPdfName(),
                formatStatus(task.getStatusEnum()),
                updatedAt
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

        return String.valueOf(left)
                .trim()
                .equalsIgnoreCase(String.valueOf(right).trim());
    }

    private boolean isExecutive(Employee employee) {
        if (employee.getRole() == null) {
            return false;
        }

        return employee.getRole()
                .toLowerCase(Locale.ROOT)
                .contains("executive");
    }

    private boolean isCompleted(PdfTask task) {
        return List.of(
                PdfTaskStatus.COMPLETED,
                PdfTaskStatus.APPROVED,
                PdfTaskStatus.CLOSED
        ).contains(task.getStatusEnum());
    }

    private String formatStatus(PdfTaskStatus status) {
        if (status == null) {
            return "Assigned";
        }

        return switch (status) {
            case ASSIGNED -> "Assigned";
            case IN_PROGRESS -> "In Progress";
            case SUBMITTED -> "Submitted";
            case REVIEWED -> "Reviewed";
            case COMPLETED -> "Completed";
            case APPROVED -> "Approved";
            case REJECTED -> "Rejected";
            case CLOSED -> "Closed";
        };
    }
}



