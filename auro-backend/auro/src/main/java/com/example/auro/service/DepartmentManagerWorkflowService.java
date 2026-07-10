package com.example.auro.service;

import com.example.auro.dto.PdfCenterFileDto;
import com.example.auro.dto.PdfCenterTaskDto;
import com.example.auro.dto.PdfTaskAssigneeDto;
import com.example.auro.dto.PdfTaskResponseDto;
import com.example.auro.dto.SalesDashboardActivityDto;
import com.example.auro.dto.SalesDashboardComplaintDto;
import com.example.auro.dto.SalesDashboardFileDto;
import com.example.auro.dto.SalesDashboardResponseDto;
import com.example.auro.dto.SalesDashboardStatsDto;
import com.example.auro.dto.SalesDashboardTaskDto;
import com.example.auro.dto.SalesExecutiveProgressDto;
import com.example.auro.dto.SalesExecutiveReportDto;
import com.example.auro.dto.SalesReportsResponseDto;
import com.example.auro.dto.SalesReportsStatsDto;
import com.example.auro.dto.SalesTaskReportDto;
import com.example.auro.dto.SalesTaskUpdateDto;
import com.example.auro.dto.SalesTaskUpdateFileDto;
import com.example.auro.dto.SubmittedWorkPdfDto;
import com.example.auro.dto.SubmittedWorkResponseDto;
import com.example.auro.entity.AppUser;
import com.example.auro.entity.Complaint;
import com.example.auro.entity.Employee;
import com.example.auro.entity.PdfTask;
import com.example.auro.entity.PdfTaskStatus;
import com.example.auro.entity.SubmittedWork;
import com.example.auro.repository.AppUserRepository;
import com.example.auro.repository.ComplaintRepository;
import com.example.auro.repository.EmployeeRepository;
import com.example.auro.repository.PdfTaskRepository;
import com.example.auro.repository.SubmittedWorkRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DepartmentManagerWorkflowService {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    @Value("${app.upload.pdf-task-dir:uploads/pdf-tasks}")
    private String pdfTaskUploadDir;

    @Value("${app.upload.manager-work-dir:uploads/manager-work}")
    private String managerWorkUploadDir;

    private final EmployeeRepository employeeRepository;
    private final PdfTaskRepository pdfTaskRepository;
    private final ComplaintRepository complaintRepository;
    private final SubmittedWorkRepository submittedWorkRepository;
    private final AppUserRepository appUserRepository;
    private final NotificationService notificationService;

    public DepartmentManagerWorkflowService(
            EmployeeRepository employeeRepository,
            PdfTaskRepository pdfTaskRepository,
            ComplaintRepository complaintRepository,
            SubmittedWorkRepository submittedWorkRepository,
            AppUserRepository appUserRepository,
            NotificationService notificationService
    ) {
        this.employeeRepository = employeeRepository;
        this.pdfTaskRepository = pdfTaskRepository;
        this.complaintRepository = complaintRepository;
        this.submittedWorkRepository = submittedWorkRepository;
        this.appUserRepository = appUserRepository;
        this.notificationService = notificationService;
    }

    public SalesDashboardResponseDto getDashboard(String managerKey) {
        ManagerScope scope = requireScope(managerKey);
        List<Employee> executives = employeeRepository
                .findByDepartmentAndStatusNotOrderByNameAsc(scope.department(), "Inactive")
                .stream()
                .filter(this::isExecutive)
                .toList();
        List<PdfTask> tasks = getDepartmentTasks(scope);
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
        List<PdfTask> completedTasks = tasks.stream().filter(this::isCompleted).toList();
        List<Complaint> complaints = complaintRepository.findByDepartmentOrderByCreatedAtDesc(scope.department());
        long overallProgress = tasks.isEmpty() ? 0 : Math.round((completedTasks.size() * 100.0) / tasks.size());
        SalesDashboardStatsDto stats = new SalesDashboardStatsDto(
                executives.size(),
                tasks.size(),
                submittedTasks.size(),
                completedTasks.size(),
                overallProgress
        );
        return new SalesDashboardResponseDto(
                stats,
                executives.stream().map(employee -> toExecutiveDto(employee, tasks)).toList(),
                submittedTasks.stream().limit(6).map(this::toDashboardTaskDto).toList(),
                buildRecentActivity(tasks, complaints),
                List.of(),
                complaints.stream().limit(7).map(this::toComplaintDto).toList()
        );
    }

    @Transactional
    public SalesDashboardTaskDto reviewDashboardTask(String managerKey, Long taskId, String decision) {
        return toDashboardTaskDto(reviewTask(requireScope(managerKey), taskId, decision, false));
    }

    public Resource getDashboardTaskFile(String managerKey, Long taskId, String fileType) {
        return getTaskFileResource(findScopedTask(requireScope(managerKey), taskId), fileType);
    }

    public String getDashboardTaskFileName(String managerKey, Long taskId, String fileType) {
        return getTaskFileName(findScopedTask(requireScope(managerKey), taskId), fileType);
    }

    public List<PdfTaskAssigneeDto> getExecutives(String managerKey) {
        ManagerScope scope = requireScope(managerKey);
        return employeeRepository
                .findByDepartmentAndStatusNotOrderByNameAsc(scope.department(), "Inactive")
                .stream()
                .filter(this::isExecutive)
                .map(this::toAssigneeDto)
                .toList();
    }

    public List<PdfTaskResponseDto> getTasks(String managerKey) {
        return getDepartmentTasks(requireScope(managerKey)).stream().map(this::toPdfTaskDto).toList();
    }

    @Transactional
    public PdfTaskResponseDto assignTask(String managerKey, String title, Long assigneeId, LocalDate due, MultipartFile file) {
        ManagerScope scope = requireScope(managerKey);
        validateTaskAssignment(title, assigneeId, file);
        Employee assignee = employeeRepository.findById(assigneeId)
                .orElseThrow(() -> new RuntimeException("Executive not found"));
        if (!scope.department().equalsIgnoreCase(assignee.getDepartment())) {
            throw new RuntimeException("Selected employee is not from " + scope.department() + " department");
        }
        if (!isExecutive(assignee)) {
            throw new RuntimeException("Selected employee is not an executive");
        }
        StoredPdf storedPdf = savePdf(file, pdfTaskUploadDir, "Assignment.pdf");
        PdfTask task = new PdfTask();
        task.setTitle(title.trim());
        task.setDepartment(scope.department());
        task.setAssignedByRole(scope.role());
        task.setAssigneeId(assignee.getId());
        task.setAssignee(assignee.getName());
        task.setAssigneeEmployeeId(assignee.getEmployeeId());
        task.setDue(due);
        task.setPdfName(storedPdf.originalName());
        task.setPdfContentType(storedPdf.contentType());
        task.setPdfStorageName(storedPdf.storageName());
        task.setPdfPath(storedPdf.path().toString());
        task.setStatus(PdfTaskStatus.ASSIGNED);
        PdfTask saved = pdfTaskRepository.save(task);
        saved.setTaskCode(scope.taskCodePrefix() + saved.getId());
        saved = pdfTaskRepository.save(saved);

        notificationService.notifyUserByIdentifier(
                assignee.getEmployeeId(),
                "Assigned Task",
                "New task assigned by your manager",
                title.trim() + " has been assigned to you by " + scope.role() + ".",
                "PDF_TASK",
                String.valueOf(saved.getId())
        );

        return toPdfTaskDto(saved);
    }

    public Resource getAssignedTaskPdf(String managerKey, Long taskId) {
        return getTaskFileResource(findScopedTask(requireScope(managerKey), taskId), "assignment");
    }

    public String getAssignedTaskPdfName(String managerKey, Long taskId) {
        PdfTask task = findScopedTask(requireScope(managerKey), taskId);
        return task.getPdfName() == null ? "Assignment.pdf" : task.getPdfName();
    }

    public List<SalesTaskUpdateDto> getTaskUpdates(String managerKey) {
        return getDepartmentTasks(requireScope(managerKey)).stream()
                .filter(this::isVisibleTaskUpdate)
                .map(this::toTaskUpdateDto)
                .toList();
    }

    @Transactional
    public SalesTaskUpdateDto reviewTaskUpdate(String managerKey, Long taskId, String decision) {
        return toTaskUpdateDto(reviewTask(requireScope(managerKey), taskId, decision, true));
    }

    public Resource getTaskUpdateFile(String managerKey, Long taskId, String fileType) {
        return getTaskFileResource(findScopedTask(requireScope(managerKey), taskId), fileType);
    }

    public String getTaskUpdateFileName(String managerKey, Long taskId, String fileType) {
        return getTaskFileName(findScopedTask(requireScope(managerKey), taskId), fileType);
    }

    public List<PdfCenterTaskDto> getPdfCenterUpdates(String managerKey) {
        return getDepartmentTasks(requireScope(managerKey)).stream()
                .filter(this::isVisibleTaskUpdate)
                .map(this::toPdfCenterTaskDto)
                .toList();
    }

    @Transactional
    public PdfCenterTaskDto reviewPdfCenterTask(String managerKey, Long taskId, String decision) {
        return toPdfCenterTaskDto(reviewTask(requireScope(managerKey), taskId, decision, true));
    }

    public Resource getPdfCenterTaskFile(String managerKey, Long taskId, String fileType) {
        return getTaskFileResource(findScopedTask(requireScope(managerKey), taskId), fileType);
    }

    public String getPdfCenterTaskFileName(String managerKey, Long taskId, String fileType) {
        return getTaskFileName(findScopedTask(requireScope(managerKey), taskId), fileType);
    }

    public SalesReportsResponseDto getReports(String managerKey) {
        ManagerScope scope = requireScope(managerKey);
        List<Employee> executives = employeeRepository
                .findByDepartmentAndStatusNotOrderByNameAsc(scope.department(), "Inactive")
                .stream()
                .filter(this::isExecutive)
                .toList();
        List<PdfTask> tasks = getDepartmentTasks(scope);
        long completedCount = tasks.stream().filter(this::isCompleted).count();
        long overall = tasks.isEmpty() ? 0 : Math.round((completedCount * 100.0) / tasks.size());
        SalesReportsStatsDto stats = new SalesReportsStatsDto(
                executives.size(),
                tasks.size(),
                completedCount,
                overall
        );
        return new SalesReportsResponseDto(
                stats,
                executives.stream().map(employee -> toExecutiveReportDto(employee, tasks)).toList(),
                tasks.stream().map(this::toTaskReportDto).toList()
        );
    }

    public List<SubmittedWorkResponseDto> getMySubmissions(String managerKey) {
        ManagerScope scope = requireScope(managerKey);
        return submittedWorkRepository
                .findByManagerUsernameOrderByCreatedAtDesc(scope.user().getEmail())
                .stream()
                .filter(work -> scope.department().equalsIgnoreCase(work.getDepartment()))
                .map(this::toSubmittedWorkDto)
                .toList();
    }

    @Transactional
    public SubmittedWorkResponseDto submitWork(String managerKey, String title, String description, LocalDate submissionDate, MultipartFile file) {
        ManagerScope scope = requireScope(managerKey);
        AppUser user = scope.user();
        validateSubmittedWork(title, description, submissionDate, file);
        StoredPdf storedPdf = savePdf(file, managerWorkUploadDir, "SubmittedWork.pdf");
        SubmittedWork work = new SubmittedWork();
        work.setTitle(title.trim());
        work.setDescription(description.trim());
        work.setSubmissionDate(submissionDate);
        work.setDepartment(scope.department());
        work.setManagerName(user.getName() == null ? scope.role() : user.getName());
        work.setManagerUsername(user.getEmail());
        work.setManagerRole(scope.role());
        work.setEmployeeId(user.getEmployeeId());
        work.setPdfOriginalName(storedPdf.originalName());
        work.setPdfContentType(storedPdf.contentType());
        work.setPdfSize(storedPdf.size());
        work.setPdfStoragePath(storedPdf.path().toString());
        work.setCreatedBy(user.getEmail());
        work.setStatus("Submitted");
        SubmittedWork saved = submittedWorkRepository.save(work);
        saved.setSubmissionCode("SW-" + saved.getId());
        saved = submittedWorkRepository.save(saved);

        notificationService.notifyRoles(
                List.of("Managing Director", "Operational Head"),
                "Submitted Work",
                "New manager work submission",
                work.getManagerName() + " submitted " + work.getTitle() + " for review.",
                "SUBMITTED_WORK",
                String.valueOf(saved.getId())
        );

        return toSubmittedWorkDto(saved);
    }

    public Resource getSubmittedWorkPdf(String managerKey, Long workId) {
        ManagerScope scope = requireScope(managerKey);
        SubmittedWork work = submittedWorkRepository.findById(workId)
                .orElseThrow(() -> new RuntimeException("Submitted work not found"));
        if (!canAccessSubmittedWork(scope.user(), scope, work)) {
            throw new RuntimeException("You are not allowed to access this PDF");
        }
        try {
            Resource resource = new UrlResource(Path.of(work.getPdfStoragePath()).normalize().toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("PDF file not found");
            }
            return resource;
        } catch (Exception error) {
            throw new RuntimeException("Unable to read PDF file", error);
        }
    }

    public String getSubmittedWorkPdfName(String managerKey, Long workId) {
        requireScope(managerKey);
        SubmittedWork work = submittedWorkRepository.findById(workId)
                .orElseThrow(() -> new RuntimeException("Submitted work not found"));
        return work.getPdfOriginalName() == null ? "SubmittedWork.pdf" : work.getPdfOriginalName();
    }

    private ManagerScope requireScope(String managerKey) {
        AppUser user = getCurrentUser();
        ManagerScope scope = ManagerScope.fromKey(managerKey, user);
        String currentRole = normalizeRole(user.getRole());
        if (!currentRole.equalsIgnoreCase(normalizeRole(scope.role()))) {
            throw new RuntimeException("This route is not allowed for your manager role");
        }
        String currentDepartment = user.getDepartment() == null ? "" : user.getDepartment().trim();
        if (!currentDepartment.equalsIgnoreCase(scope.department())) {
            throw new RuntimeException("This route is not allowed for your department");
        }
        return scope;
    }

    private AppUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Logged-in user not found");
        }
        String principalName = authentication.getName();
        try {
            return appUserRepository.findById(Long.parseLong(principalName))
                    .orElseGet(() -> appUserRepository.findByEmail(principalName)
                            .orElseThrow(() -> new RuntimeException("Logged-in user not found")));
        } catch (NumberFormatException ex) {
            return appUserRepository.findByEmail(principalName)
                    .orElseThrow(() -> new RuntimeException("Logged-in user not found"));
        }
    }

    private List<PdfTask> getDepartmentTasks(ManagerScope scope) {
        return pdfTaskRepository
                .findByDepartmentOrAssignedByRoleOrderByCreatedAtDesc(scope.department(), scope.role())
                .stream()
                .filter(task -> scope.department().equalsIgnoreCase(task.getDepartment())
                        || scope.role().equalsIgnoreCase(task.getAssignedByRole()))
                .toList();
    }

    private PdfTask findScopedTask(ManagerScope scope, Long taskId) {
        PdfTask task = pdfTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        boolean visible = scope.department().equalsIgnoreCase(task.getDepartment())
                || scope.role().equalsIgnoreCase(task.getAssignedByRole());
        if (!visible) {
            throw new RuntimeException("Task not available for this department");
        }
        return task;
    }

    private PdfTask reviewTask(ManagerScope scope, Long taskId, String decision, boolean allowClose) {
        PdfTask task = findScopedTask(scope, taskId);
        String value = decision == null ? "" : decision.trim().toLowerCase(Locale.ROOT);
        if (value.equals("approve") || value.equals("approved")) {
            task.setStatus(PdfTaskStatus.APPROVED);
        } else if (value.equals("reject") || value.equals("rejected")) {
            task.setStatus(PdfTaskStatus.REJECTED);
        } else if (allowClose && (value.equals("close") || value.equals("closed"))) {
            task.setStatus(PdfTaskStatus.CLOSED);
        } else {
            throw new RuntimeException("Invalid review action");
        }

        PdfTask saved = pdfTaskRepository.save(task);
        notificationService.notifyUserId(
                saved.getAssigneeId(),
                "Task Review",
                "Manager reviewed your task update",
                saved.getTitle() + " was marked " + formatStatus(saved.getStatusEnum()) + " by " + scope.role() + ".",
                "PDF_TASK",
                String.valueOf(saved.getId())
        );
        return saved;
    }

    private Resource getTaskFileResource(PdfTask task, String fileType) {
        String filePath = getTaskFilePath(task, fileType);
        if (filePath == null || filePath.isBlank()) {
            throw new RuntimeException("File not available");
        }
        try {
            Resource resource = new UrlResource(Path.of(filePath).normalize().toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("File not found");
            }
            return resource;
        } catch (Exception error) {
            throw new RuntimeException("Unable to read file", error);
        }
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

    private String formatStatus(PdfTaskStatus status) {
        if (status == null) {
            return "Updated";
        }
        String value = status.name().toLowerCase(Locale.ROOT).replace("_", " ");
        return value.substring(0, 1).toUpperCase(Locale.ROOT) + value.substring(1);
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

    private void validateTaskAssignment(String title, Long assigneeId, MultipartFile file) {
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
        boolean validExtension = originalName != null && originalName.toLowerCase(Locale.ROOT).endsWith(".pdf");
        boolean validContentType = contentType == null
                || "application/pdf".equalsIgnoreCase(contentType)
                || "application/octet-stream".equalsIgnoreCase(contentType);
        if (!validExtension || !validContentType) {
            throw new RuntimeException("Only PDF files are allowed");
        }
    }

    private void validateSubmittedWork(String title, String description, LocalDate submissionDate, MultipartFile file) {
        if (title == null || title.trim().isEmpty()) {
            throw new RuntimeException("Work title is required");
        }
        if (description == null || description.trim().isEmpty()) {
            throw new RuntimeException("Work description is required");
        }
        if (submissionDate == null) {
            throw new RuntimeException("Submission date is required");
        }
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("PDF file is required");
        }
        String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
        String type = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!type.equals("application/pdf") && !name.endsWith(".pdf")) {
            throw new RuntimeException("Only PDF files are allowed");
        }
    }

    private StoredPdf savePdf(MultipartFile file, String uploadDir, String fallbackName) {
        try {
            Files.createDirectories(Path.of(uploadDir));
            String originalName = StringUtils.cleanPath(
                    file.getOriginalFilename() == null ? fallbackName : file.getOriginalFilename()
            );
            String storageName = UUID.randomUUID() + ".pdf";
            Path target = Path.of(uploadDir).resolve(storageName).normalize();
            file.transferTo(target);
            return new StoredPdf(originalName, file.getContentType(), storageName, file.getSize(), target);
        } catch (Exception error) {
            throw new RuntimeException("Unable to save PDF file");
        }
    }

    private boolean isExecutive(Employee employee) {
        return employee.getRole() != null
                && employee.getRole().replace("_", " ").toLowerCase(Locale.ROOT).contains("executive");
    }

    private boolean isCompleted(PdfTask task) {
        return List.of(
                PdfTaskStatus.REVIEWED,
                PdfTaskStatus.APPROVED,
                PdfTaskStatus.COMPLETED,
                PdfTaskStatus.CLOSED
        ).contains(task.getStatusEnum());
    }

    private boolean isVisibleTaskUpdate(PdfTask task) {
        if (task.getUpdatePdfName() != null && !task.getUpdatePdfName().isBlank()) {
            return true;
        }
        if (task.getCompletionPdfName() != null && !task.getCompletionPdfName().isBlank()) {
            return true;
        }
        return List.of(
                PdfTaskStatus.IN_PROGRESS,
                PdfTaskStatus.SUBMITTED,
                PdfTaskStatus.REVIEWED,
                PdfTaskStatus.COMPLETED,
                PdfTaskStatus.APPROVED,
                PdfTaskStatus.REJECTED,
                PdfTaskStatus.CLOSED
        ).contains(task.getStatusEnum());
    }

    private SalesExecutiveProgressDto toExecutiveDto(Employee employee, List<PdfTask> tasks) {
        List<PdfTask> assigned = tasks.stream().filter(task -> taskBelongsTo(task, employee)).toList();
        long completed = assigned.stream().filter(this::isCompleted).count();
        long percent = assigned.isEmpty() ? 0 : Math.round((completed * 100.0) / assigned.size());
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

    private SalesExecutiveReportDto toExecutiveReportDto(Employee employee, List<PdfTask> tasks) {
        List<PdfTask> assigned = tasks.stream().filter(task -> taskBelongsTo(task, employee)).toList();
        long completed = assigned.stream().filter(this::isCompleted).count();
        long percent = assigned.isEmpty() ? 0 : Math.round((completed * 100.0) / assigned.size());
        return new SalesExecutiveReportDto(
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

    private PdfTaskResponseDto toPdfTaskDto(PdfTask task) {
        return new PdfTaskResponseDto(
                task.getTaskCode() == null ? "TASK-" + task.getId() : task.getTaskCode(),
                task.getId(),
                task.getTitle(),
                task.getDepartment(),
                task.getAssignedByRole(),
                task.getAssigneeId(),
                task.getAssignee(),
                task.getAssigneeEmployeeId(),
                task.getDue(),
                formatTaskStatus(task.getStatusEnum()),
                task.getPdfName(),
                task.getCreatedAt()
        );
    }

    private SalesDashboardTaskDto toDashboardTaskDto(PdfTask task) {
        return new SalesDashboardTaskDto(
                task.getTaskCode() == null ? "TASK-" + task.getId() : task.getTaskCode(),
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

    private SalesTaskUpdateDto toTaskUpdateDto(PdfTask task) {
        return new SalesTaskUpdateDto(
                task.getTaskCode() == null ? "TASK-" + task.getId() : task.getTaskCode(),
                task.getId(),
                task.getTitle(),
                task.getAssignee(),
                task.getAssigneeEmployeeId(),
                formatTaskStatus(task.getStatusEnum()),
                task.getPdfName(),
                task.getUpdatePdfName() == null ? null : new SalesTaskUpdateFileDto(task.getUpdatePdfName(), "update"),
                task.getCompletionPdfName() == null ? null : new SalesTaskUpdateFileDto(task.getCompletionPdfName(), "completion")
        );
    }

    private PdfCenterTaskDto toPdfCenterTaskDto(PdfTask task) {
        return new PdfCenterTaskDto(
                task.getTaskCode() == null ? "TASK-" + task.getId() : task.getTaskCode(),
                task.getId(),
                task.getTitle(),
                task.getAssignee(),
                task.getAssigneeEmployeeId(),
                formatTaskStatus(task.getStatusEnum()),
                task.getPdfName(),
                task.getUpdatePdfName() == null ? null : new PdfCenterFileDto(task.getUpdatePdfName(), "update"),
                task.getCompletionPdfName() == null ? null : new PdfCenterFileDto(task.getCompletionPdfName(), "completion")
        );
    }

    private SalesTaskReportDto toTaskReportDto(PdfTask task) {
        String updatedAt = task.getCreatedAt() == null ? "-" : task.getCreatedAt().format(DATE_FORMAT);
        return new SalesTaskReportDto(
                task.getTaskCode() == null ? "TASK-" + task.getId() : task.getTaskCode(),
                task.getId(),
                task.getTitle(),
                task.getAssignee(),
                task.getAssigneeEmployeeId(),
                task.getPdfName(),
                formatTaskStatus(task.getStatusEnum()),
                updatedAt
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

    private List<SalesDashboardActivityDto> buildRecentActivity(List<PdfTask> tasks, List<Complaint> complaints) {
        List<SalesDashboardActivityDto> activities = new ArrayList<>();
        activities.addAll(tasks.stream().map(task -> new SalesDashboardActivityDto(
                task.getTaskCode() != null ? task.getTaskCode() : "TASK-" + task.getId(),
                task.getTitle(),
                task.getAssignee(),
                formatTaskStatus(task.getStatusEnum()),
                task.getCreatedAt() == null ? "-" : task.getCreatedAt().format(DATE_FORMAT),
                "Task"
        )).toList());
        activities.addAll(complaints.stream().map(complaint -> new SalesDashboardActivityDto(
                complaint.getComplaintCode() != null ? complaint.getComplaintCode() : "CMP-" + complaint.getId(),
                complaint.getSubject(),
                complaint.getEmployeeName(),
                formatComplaintStatus(complaint.getStatus() == null ? "Pending" : complaint.getStatus()),
                complaint.getCreatedAt() == null ? "-" : complaint.getCreatedAt().format(DATE_FORMAT),
                "Complaint"
        )).toList());
        return activities.stream().limit(8).toList();
    }

    private SubmittedWorkResponseDto toSubmittedWorkDto(SubmittedWork work) {
        return new SubmittedWorkResponseDto(
                work.getSubmissionCode() == null ? "SW-" + work.getId() : work.getSubmissionCode(),
                work.getId(),
                work.getTitle(),
                work.getDescription(),
                work.getSubmissionDate(),
                work.getDepartment(),
                work.getManagerName(),
                work.getManagerRole(),
                work.getEmployeeId(),
                work.getManagerUsername(),
                work.getPdfOriginalName() == null ? null : new SubmittedWorkPdfDto(work.getPdfOriginalName(), "pdf"),
                formatSimpleStatus(work.getStatus(), "Submitted"),
                work.getRemarks(),
                work.getCreatedAt()
        );
    }

    private boolean canAccessSubmittedWork(AppUser user, ManagerScope scope, SubmittedWork work) {
        String role = normalizeRole(user.getRole());
        if (role.equalsIgnoreCase("Managing Director") || role.equalsIgnoreCase("Operational Head") || role.equalsIgnoreCase("Operations Head")) {
            return true;
        }
        return user.getEmail() != null
                && user.getEmail().equalsIgnoreCase(work.getManagerUsername())
                && scope.department().equalsIgnoreCase(work.getDepartment());
    }

    private boolean taskBelongsTo(PdfTask task, Employee employee) {
        return matches(task.getAssigneeId(), employee.getId())
                || matches(task.getAssigneeEmployeeId(), employee.getEmployeeId())
                || matches(task.getAssignee(), employee.getName())
                || matches(task.getAssignee(), employee.getEmail());
    }

    private boolean matches(Object left, Object right) {
        return left != null
                && right != null
                && String.valueOf(left).trim().equalsIgnoreCase(String.valueOf(right).trim());
    }

    private String normalizeRole(String role) {
        return role == null ? "" : role.replace("_", " ").trim();
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

    private String formatComplaintStatus(String status) {
        if (status == null || status.isBlank()) {
            return "Pending";
        }
        if (status.equalsIgnoreCase("IN_PROGRESS")) {
            return "In Progress";
        }
        return formatSimpleStatus(status, "Pending");
    }

    private String formatSimpleStatus(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        String cleaned = value.replace("_", " ").toLowerCase(Locale.ROOT);
        return cleaned.substring(0, 1).toUpperCase(Locale.ROOT) + cleaned.substring(1);
    }

    private record StoredPdf(String originalName, String contentType, String storageName, long size, Path path) {}

    private record ManagerScope(String key, String role, String department, String taskCodePrefix, AppUser user) {
        private static ManagerScope fromKey(String managerKey, AppUser user) {
            String key = managerKey == null ? "" : managerKey.trim().toLowerCase(Locale.ROOT);
            return switch (key) {
                case "sales" -> new ManagerScope(key, "Sales Manager", "Sales", "SPDF-", user);
                case "marketing" -> new ManagerScope(key, "Marketing Manager", "Marketing", "MPDF-", user);
                case "crm" -> new ManagerScope(key, "CRM Manager", "CRM", "CRMPDF-", user);
                case "accounts" -> new ManagerScope(key, "Accounts Manager", "Accounts", "APDF-", user);
                case "hr" -> new ManagerScope(key, "HR Manager", "HR", "HRPDF-", user);
                default -> throw new RuntimeException("Unsupported manager route");
            };
        }
    }
}




