package com.example.auro.service;

 
import com.example.auro.entity.Employee;
import com.example.auro.repository.EmployeeRepository;
import com.example.auro.dto.TaskAssigneeDto;
import com.example.auro.dto.TaskResponseDto;
import com.example.auro.entity.PdfTask;
import com.example.auro.entity.PdfTaskStatus;
import com.example.auro.repository.PdfTaskRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class SalesTaskServiceImpl implements SalesTaskService {

    private static final String ROLE = "Sales Manager";
    private static final String DEPARTMENT = "Sales";

    @Value("${app.upload.sales-task-dir:uploads/sales-tasks}")
    private String uploadDir;

    private final EmployeeRepository employeeRepository;
    private final PdfTaskRepository pdfTaskRepository;

    public SalesTaskServiceImpl(
            EmployeeRepository employeeRepository,
            PdfTaskRepository pdfTaskRepository
    ) {
        this.employeeRepository = employeeRepository;
        this.pdfTaskRepository = pdfTaskRepository;
    }

    @Override
    public List<TaskAssigneeDto> getExecutives() {
        return employeeRepository
                .findByDepartmentAndStatusNotOrderByNameAsc(DEPARTMENT, "Inactive")
                .stream()
                .filter(this::isExecutiveRole)
                .map(this::toAssigneeDto)
                .toList();
    }

    @Override
    public List<TaskResponseDto> getTasks() {
        return pdfTaskRepository.findAll()
                .stream()
                .filter(task -> DEPARTMENT.equalsIgnoreCase(task.getDepartment()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toTaskDto)
                .toList();
    }

    @Override
    @Transactional
    public TaskResponseDto assignTask(
            String title,
            Long assigneeId,
            LocalDate due,
            MultipartFile file
    ) {
        validate(title, assigneeId, file);

        Employee employee = employeeRepository.findById(assigneeId)
                .orElseThrow(() -> new RuntimeException("Executive not found"));

        if (!DEPARTMENT.equalsIgnoreCase(employee.getDepartment())) {
            throw new RuntimeException("Selected employee is not from Sales department");
        }

        if (!isExecutiveRole(employee)) {
            throw new RuntimeException("Selected employee is not an executive");
        }

        StoredFile storedFile = saveFile(file);

        PdfTask task = new PdfTask();
        task.setTitle(title.trim());
        task.setDepartment(DEPARTMENT);
        task.setAssignedBy(ROLE);
        task.setAssigneeId(employee.getId());
        task.setAssignee(employee.getName());
        task.setAssigneeEmployeeId(employee.getEmployeeId());
        task.setDue(due);
        task.setPdfName(storedFile.originalName());
        task.setPdfContentType(storedFile.contentType());
        task.setPdfPath(storedFile.path().toString());
        task.setStatus(PdfTaskStatus.ASSIGNED);

        PdfTask saved = pdfTaskRepository.save(task);
        saved.setTaskCode("TASK-" + saved.getId());
        saved = pdfTaskRepository.save(saved);

        return toTaskDto(saved);
    }

    @Override
    public Resource getPdf(Long taskId) {
        PdfTask task = pdfTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        Path path = Path.of(task.getPdfPath()).normalize();
        try {
            Resource resource = new UrlResource(path.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("PDF not found");
            }

            return resource;
        } catch (Exception error) {
            throw new RuntimeException("Unable to read file", error);
        }
    }

    @Override
    public String getPdfName(Long taskId) {
        PdfTask task = pdfTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        return task.getPdfName() == null ? "Assignment.pdf" : task.getPdfName();
    }

    private void validate(String title, Long assigneeId, MultipartFile file) {
        if (title == null || title.trim().isEmpty()) {
            throw new RuntimeException("Task title is required");
        }

        if (assigneeId == null) {
            throw new RuntimeException("Executive is required");
        }

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("PDF file is required");
        }

        String originalName = file.getOriginalFilename();
        String contentType = file.getContentType();

        boolean validExtension =
                originalName != null &&
                originalName.toLowerCase(Locale.ROOT).endsWith(".pdf");

        boolean validContentType =
                contentType == null ||
                "application/pdf".equalsIgnoreCase(contentType) ||
                "application/octet-stream".equalsIgnoreCase(contentType);

        if (!validExtension || !validContentType) {
            throw new RuntimeException("Only PDF files are allowed");
        }
    }

    private StoredFile saveFile(MultipartFile file) {
        try {
            Files.createDirectories(Path.of(uploadDir));

            String originalName = StringUtils.cleanPath(
                    file.getOriginalFilename() == null
                            ? "Assignment.pdf"
                            : file.getOriginalFilename()
            );

            String storageName = UUID.randomUUID() + ".pdf";
            Path target = Path.of(uploadDir).resolve(storageName).normalize();

            file.transferTo(target);

            return new StoredFile(
                    originalName,
                    file.getContentType(),
                    target
            );
        } catch (Exception error) {
            throw new RuntimeException("Unable to save PDF file");
        }
    }

    private boolean isExecutiveRole(Employee employee) {
        if (employee.getRole() == null) {
            return false;
        }

        String role = employee.getRole()
                .replace("_", " ")
                .toLowerCase(Locale.ROOT);

        return role.contains("executive");
    }

    private TaskAssigneeDto toAssigneeDto(Employee employee) {
        return new TaskAssigneeDto(
                employee.getId(),
                employee.getEmployeeId(),
                employee.getName(),
                employee.getDepartment(),
                employee.getRole(),
                employee.getStatus()
        );
    }

    private TaskResponseDto toTaskDto(PdfTask task) {
        return new TaskResponseDto(
                task.getTaskCode() != null ? task.getTaskCode() : "TASK-" + task.getId(),
                task.getId(),
                task.getTitle(),
                task.getDepartment(),
                task.getAssignedByRole(),
                task.getAssigneeId(),
                task.getAssignee(),
                task.getAssigneeEmployeeId(),
                task.getDue(),
                formatStatus(task.getStatusEnum()),
                task.getPdfName(),
                task.getCreatedAt()
        );
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
            case APPROVED -> "Approved";
            case COMPLETED -> "Completed";
            case REJECTED -> "Rejected";
            case CLOSED -> "Closed";
        };
    }

    private record StoredFile(
            String originalName,
            String contentType,
            Path path
    ) {
    }
}









