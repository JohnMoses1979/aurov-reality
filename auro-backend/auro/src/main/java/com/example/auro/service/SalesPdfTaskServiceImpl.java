package com.example.auro.service;

import com.example.auro.dto.PdfTaskAssigneeDto;
import com.example.auro.dto.PdfTaskResponseDto;
import com.example.auro.entity.Employee;
import com.example.auro.entity.PdfTask;
import com.example.auro.entity.PdfTaskStatus;
import com.example.auro.repository.EmployeeRepository;
import com.example.auro.repository.PdfTaskRepository;
import com.example.auro.repository.UserRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import com.example.auro.entity.UserAccount;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SalesPdfTaskServiceImpl implements SalesPdfTaskService {

    private static final String ROLE = "Sales Manager";
    private static final String DEPARTMENT = "Sales";

    @Value("${app.upload.pdf-task-dir:uploads/pdf-tasks}")
    private String uploadDir;

    private final EmployeeRepository employeeRepository;
    private final PdfTaskRepository pdfTaskRepository;
    private final UserRepository userRepository;

    public SalesPdfTaskServiceImpl(
            EmployeeRepository employeeRepository,
            PdfTaskRepository pdfTaskRepository,
            UserRepository userRepository
    ) {
        this.employeeRepository = employeeRepository;
        this.pdfTaskRepository = pdfTaskRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<PdfTaskAssigneeDto> getSalesExecutives(String managerUsername) {
        return employeeRepository
                .findByDepartmentAndStatusNotOrderByNameAsc(DEPARTMENT, "Inactive")
                .stream()
                .filter(this::isExecutiveRole)
                .map(this::toAssigneeDto)
                .toList();
    }

    @Override
    public List<PdfTaskResponseDto> getSalesManagerTasks(String managerUsername) {
        return findVisibleTasks()
                .stream()
                .map(this::toTaskDto)
                .toList();
    }

    @Override
    public Map<String, Object> dashboard(String managerUsername) {
        List<PdfTaskResponseDto> tasks = getSalesManagerTasks(managerUsername);
        List<PdfTaskAssigneeDto> executives = getSalesExecutives(managerUsername);

        long assigned = tasks.stream().filter(task -> "Assigned".equalsIgnoreCase(task.status())).count();
        long inProgress = tasks.stream().filter(task -> "In Progress".equalsIgnoreCase(task.status())).count();
        long submitted = tasks.stream().filter(task -> "Submitted".equalsIgnoreCase(task.status())).count();
        long approved = tasks.stream().filter(task -> "Approved".equalsIgnoreCase(task.status())).count();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("executives", executives.size());
        summary.put("tasks", tasks.size());
        summary.put("assigned", assigned);
        summary.put("inProgress", inProgress);
        summary.put("submitted", submitted);
        summary.put("approved", approved);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("summary", summary);
        response.put("executives", executives);
        response.put("tasks", tasks);
        return response;
    }

    @Override
    @Transactional
    public PdfTaskResponseDto assignPdfTask(
            String title,
            Long assigneeId,
            LocalDate due,
            MultipartFile file,
            String managerUsername
    ) {
        validate(title, assigneeId, file);

        Employee assignee = employeeRepository.findById(assigneeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Executive not found"));

        if (!DEPARTMENT.equalsIgnoreCase(assignee.getDepartment())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selected employee is not from Sales department"
            );
        }

        if (!isExecutiveRole(assignee)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selected employee is not an executive"
            );
        }

        StoredPdf storedPdf = savePdf(file, "Assignment.pdf");

        PdfTask task = new PdfTask();
        task.setTitle(title.trim());
        task.setDepartment(DEPARTMENT);
        task.setAssignedById(parseManagerId(managerUsername));
        task.setAssignedByRole(ROLE);
        task.setAssigneeId(resolveAssigneeUserId(assignee));
        task.setAssignee(assignee.getName());
        task.setAssigneeEmployeeId(assignee.getEmployeeId());
        task.setDue(due);
        task.setPdfName(storedPdf.originalName());
        task.setPdfContentType(storedPdf.contentType());
        task.setPdfStorageName(storedPdf.storageName());
        task.setPdfPath(storedPdf.path().toString());
        task.setStatus(PdfTaskStatus.ASSIGNED);

        PdfTask saved = pdfTaskRepository.save(task);
        saved.setTaskCode("SPDF-" + saved.getId());

        return toTaskDto(pdfTaskRepository.save(saved));
    }

    @Override
    @Transactional
    public PdfTaskResponseDto assignPdfTask(Map<String, Object> request, String managerUsername) {
        String title = stringValue(request.get("title"));
        Long assigneeId = longValue(request.get("assigneeId"));
        LocalDate due = parseDate(request.get("due"));

        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "PDF file is required for this endpoint. Please submit multipart/form-data with the file attached."
        );
    }

    @Override
    public Resource getPdfResource(Long taskId) {
        PdfTask task = pdfTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));
        String pdfPath = task.getPdfPath();
        if (pdfPath == null || pdfPath.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "PDF file not found");
        }
        Path path = Path.of(pdfPath).normalize();
        try {
            Resource resource = new UrlResource(path.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "PDF file not found");
            }

            return resource;
        } catch (ResponseStatusException error) {
            throw error;
        } catch (Exception error) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to read file", error);
        }
    }

    @Override
    public String getOriginalPdfName(Long taskId) {
        PdfTask task = pdfTaskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        return task.getPdfName() == null ? "Assignment.pdf" : task.getPdfName();
    }

    private List<PdfTask> findVisibleTasks() {
        return pdfTaskRepository
                .findByDepartmentOrAssignedByRoleOrderByCreatedAtDesc(DEPARTMENT, ROLE)
                .stream()
                .filter(task -> DEPARTMENT.equalsIgnoreCase(task.getDepartment())
                        || ROLE.equalsIgnoreCase(task.getAssignedByRole()))
                .toList();
    }

    private void validate(String title, Long assigneeId, MultipartFile file) {
        if (title == null || title.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Task title is required");
        }

        if (assigneeId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Executive is required");
        }

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PDF file is required");
        }

        String originalName = file.getOriginalFilename();
        String contentType = file.getContentType();

        boolean validExtension = originalName != null
                && originalName.toLowerCase(Locale.ROOT).endsWith(".pdf");

        boolean validContentType = contentType == null
                || "application/pdf".equalsIgnoreCase(contentType)
                || "application/octet-stream".equalsIgnoreCase(contentType);

        if (!validExtension || !validContentType) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF files are allowed");
        }
    }

    private Long parseManagerId(String managerUsername) {
        if (managerUsername == null || managerUsername.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Manager authentication is required");
        }

        try {
            return Long.valueOf(managerUsername.trim());
        } catch (NumberFormatException error) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid manager identity", error);
        }
    }

    private Long resolveAssigneeUserId(Employee employee) {
        return findLinkedUserAccount(employee)
                .map(UserAccount::getId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Selected executive is not linked to a login account"
                ));
    }

    private Optional<UserAccount> findLinkedUserAccount(Employee employee) {
        if (employee.getEmployeeId() != null && !employee.getEmployeeId().isBlank()) {
            Optional<UserAccount> byEmployeeId = userRepository.findByLoginIdentifier(employee.getEmployeeId());
            if (byEmployeeId.isPresent()) {
                return byEmployeeId;
            }
        }

        if (employee.getEmail() != null && !employee.getEmail().isBlank()) {
            Optional<UserAccount> byEmail = userRepository.findByLoginIdentifier(employee.getEmail());
            if (byEmail.isPresent()) {
                return byEmail;
            }
        }

        if (employee.getUsername() != null && !employee.getUsername().isBlank()) {
            Optional<UserAccount> byUsername = userRepository.findByLoginIdentifier(employee.getUsername());
            if (byUsername.isPresent()) {
                return byUsername;
            }
        }

        if (employee.getMobileNumber() != null && !employee.getMobileNumber().isBlank()) {
            return userRepository.findByLoginIdentifier(employee.getMobileNumber());
        }

        return Optional.empty();
    }

    private StoredPdf savePdf(MultipartFile file, String fallbackName) {
        try {
            Path root = Path.of(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(root);

            String originalName = StringUtils.cleanPath(
                    file.getOriginalFilename() == null
                            ? fallbackName
                            : file.getOriginalFilename()
            );

            String storageName = UUID.randomUUID() + ".pdf";
            Path target = root.resolve(storageName).normalize();

            file.transferTo(target);

            return new StoredPdf(
                    originalName,
                    file.getContentType(),
                    storageName,
                    target
            );
        } catch (Exception error) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to save PDF file", error);
        }
    }

    private boolean isExecutiveRole(Employee employee) {
        if (employee.getRole() == null) {
            return false;
        }

        String role = employee.getRole()
                .replace("_", " ")
                .trim()
                .toLowerCase(Locale.ROOT);

        return role.contains("executive");
    }

    private PdfTaskAssigneeDto toAssigneeDto(Employee employee) {
        return new PdfTaskAssigneeDto(
                employee.getId(),
                employee.getEmployeeId(),
                employee.getName(),
                employee.getDepartment(),
                employee.getRole(),
                employee.getStatus()
        );
    }

    private PdfTaskResponseDto toTaskDto(PdfTask task) {
        return new PdfTaskResponseDto(
                task.getTaskCode() != null ? task.getTaskCode() : "SPDF-" + task.getId(),
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

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private Long longValue(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return null;
        }
        try {
            return Long.valueOf(String.valueOf(value).trim());
        } catch (NumberFormatException error) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Executive is required");
        }
    }

    private LocalDate parseDate(Object value) {
        String text = stringValue(value);
        if (text.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(text);
        } catch (Exception error) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Due date must be in YYYY-MM-DD format");
        }
    }

    private record StoredPdf(
            String originalName,
            String contentType,
            String storageName,
            Path path
    ) {
    }
}

