package com.example.auro.service;

import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.auro.dto.ManagerOptionResponse;
import com.example.auro.dto.ManagerTaskResponse;
import com.example.auro.entity.Employee;
import com.example.auro.entity.ManagerTask;
import com.example.auro.entity.UserAccount;
import com.example.auro.repository.EmployeeRepository;
import com.example.auro.repository.ManagerTaskRepository;
import com.example.auro.repository.UserRepository;
import com.example.auro.security.UserPrincipal;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ManagerTaskService {

    private final ManagerTaskRepository managerTaskRepository;
    private final EmployeeRepository employeeRepository;
    private final ManagerTaskFileStorageService fileStorageService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private static final List<String> MANAGER_ROLES = List.of(
            "Sales Manager",
            "Marketing Manager",
            "CRM Manager",
            "Accounts Manager",
            "HR Manager"
    );

    public List<ManagerOptionResponse> getAssignableManagers() {
        return employeeRepository.findAll()
                .stream()
                .filter(employee -> MANAGER_ROLES.contains(employee.getRole()))
                .filter(employee -> !"Inactive".equalsIgnoreCase(employee.getStatus()))
                .map(ManagerOptionResponse::fromEntity)
                .toList();
    }

    public ManagerTaskResponse createTask(
            String title,
            Long assigneeId,
            String due,
            MultipartFile pdf,
            Authentication authentication
    ) {
        Employee assignee = employeeRepository.findById(assigneeId)
                .orElseThrow(() -> new RuntimeException("Selected manager not found"));

        validateManager(assignee);

        ManagerTaskFileStorageService.StoredPdf storedPdf =
                fileStorageService.savePdf(pdf);

        ManagerTask task = ManagerTask.builder()
                .title(title)
                .assigneeId(assignee.getId())
                .assigneeEmployeeId(assignee.getEmployeeId())
                .assignee(assignee.getName())
                .assigneeUsername(assignee.getUsername())
                .assigneeRole(assignee.getRole())
                .department(assignee.getDepartment())
                .due(parseDate(due))
                .status("Assigned")
                .assignedBy(authentication.getName())
                .assignedByRole(getLoggedInRole(authentication))
                .pdfName(storedPdf.getOriginalName())
                .pdfContentType(storedPdf.getContentType())
                .pdfSize(storedPdf.getSize())
                .pdfStoragePath(storedPdf.getStoragePath())
                .build();

        ManagerTask saved = managerTaskRepository.save(task);

        saved.setTaskCode("MTASK" + String.format("%05d", saved.getId()));

        saved = managerTaskRepository.save(saved);

        notificationService.notifyRole(
                assignee.getRole(),
                "Assigned Work",
                "New work assigned by leadership",
                title.trim() + " has been assigned to you by " + getLoggedInRole(authentication) + ".",
                "MANAGER_TASK",
                String.valueOf(saved.getId())
        );

        return ManagerTaskResponse.fromEntity(saved);
    }

    public List<ManagerTaskResponse> getAllTasks() {
        return managerTaskRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(ManagerTaskResponse::fromEntity)
                .toList();
    }

    public List<ManagerTaskResponse> getMyTasks(Authentication authentication) {
        TaskUserIdentity currentUser = resolveCurrentUser(authentication);
        return managerTaskRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(task -> isTaskOwnedByUser(task, currentUser))
                .map(ManagerTaskResponse::fromEntity)
                .toList();
    }

    public ManagerTaskResponse getTaskById(Long id, Authentication authentication) {
        ManagerTask task = findTask(id);

        checkViewAccess(task, authentication);

        return ManagerTaskResponse.fromEntity(task);
    }

    public ManagerTaskResponse updateTask(
            Long id,
            String title,
            Long assigneeId,
            String due,
            MultipartFile pdf,
            Authentication authentication
    ) {
        ManagerTask task = findTask(id);

        Employee assignee = employeeRepository.findById(assigneeId)
                .orElseThrow(() -> new RuntimeException("Selected manager not found"));

        validateManager(assignee);

        task.setTitle(title);
        task.setAssigneeId(assignee.getId());
        task.setAssigneeEmployeeId(assignee.getEmployeeId());
        task.setAssignee(assignee.getName());
        task.setAssigneeUsername(assignee.getUsername());
        task.setAssigneeRole(assignee.getRole());
        task.setDepartment(assignee.getDepartment());
        task.setDue(parseDate(due));

        if (pdf != null && !pdf.isEmpty()) {
            ManagerTaskFileStorageService.StoredPdf storedPdf =
                    fileStorageService.savePdf(pdf);

            task.setPdfName(storedPdf.getOriginalName());
            task.setPdfContentType(storedPdf.getContentType());
            task.setPdfSize(storedPdf.getSize());
            task.setPdfStoragePath(storedPdf.getStoragePath());
        }

        ManagerTask saved = managerTaskRepository.save(task);

        return ManagerTaskResponse.fromEntity(saved);
    }

    public ManagerTaskResponse updateStatus(
            Long id,
            String status,
            Authentication authentication
    ) {
        ManagerTask task = findTask(id);

        checkViewAccess(task, authentication);

        if (
                !"Assigned".equalsIgnoreCase(status) &&
                !"In Progress".equalsIgnoreCase(status) &&
                !"Submitted".equalsIgnoreCase(status) &&
                !"Completed".equalsIgnoreCase(status) &&
                !"Closed".equalsIgnoreCase(status)
        ) {
            throw new RuntimeException("Allowed statuses: Assigned, In Progress, Submitted, Completed, Closed");
        }

        task.setStatus(status);

        ManagerTask saved = managerTaskRepository.save(task);

        notificationService.notifyRoles(
                List.of("Managing Director", "Operational Head"),
                "Work Update",
                "Manager updated assigned work",
                task.getAssignee() + " updated " + task.getTitle() + " to " + status + ".",
                "MANAGER_TASK",
                String.valueOf(saved.getId())
        );

        return ManagerTaskResponse.fromEntity(saved);
    }

    public void deleteTask(Long id) {
        ManagerTask task = findTask(id);
        managerTaskRepository.delete(task);
    }

    public Resource getTaskPdf(Long id, Authentication authentication) {
        ManagerTask task = findTask(id);

        checkViewAccess(task, authentication);

        try {
            return new UrlResource(Path.of(task.getPdfStoragePath()).toUri());
        } catch (Exception e) {
            throw new RuntimeException("Unable to read task PDF");
        }
    }

    public ManagerTask getTaskPdfInfo(Long id, Authentication authentication) {
        ManagerTask task = findTask(id);

        checkViewAccess(task, authentication);

        return task;
    }

    private ManagerTask findTask(Long id) {
        return managerTaskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    private void validateManager(Employee employee) {
        if (!MANAGER_ROLES.contains(employee.getRole())) {
            throw new RuntimeException("Task can be assigned only to department managers");
        }

        if ("Inactive".equalsIgnoreCase(employee.getStatus())) {
            throw new RuntimeException("Cannot assign task to inactive manager");
        }
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return LocalDate.parse(value);
    }

    private String getLoggedInRole(Authentication authentication) {
        return authentication.getAuthorities()
                .stream()
                .findFirst()
                .map(auth -> auth.getAuthority().replace("ROLE_", "").replace("_", " "))
                .orElse("Leadership");
    }

    private void checkViewAccess(ManagerTask task, Authentication authentication) {
        if (isLeadership(authentication)) {
            return;
        }

        TaskUserIdentity currentUser = resolveCurrentUser(authentication);
        if (isTaskOwnedByUser(task, currentUser)) {
            return;
        }

        throw new AccessDeniedException("You cannot access this task");
    }

    private TaskUserIdentity resolveCurrentUser(Authentication authentication) {
        if (authentication == null) {
            throw new AccessDeniedException("You cannot access this task");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            return TaskUserIdentity.fromUserAccount(userPrincipal.getUser());
        }
        if (principal instanceof UserAccount userAccount) {
            return TaskUserIdentity.fromUserAccount(userAccount);
        }
        if (principal instanceof Employee employee) {
            return TaskUserIdentity.fromEmployee(employee);
        }

        String principalName = authentication.getName();
        if (principalName == null || principalName.isBlank()) {
            throw new AccessDeniedException("You cannot access this task");
        }

        try {
            UserAccount userAccount = userRepository.findById(Long.parseLong(principalName))
                    .orElse(null);
            if (userAccount != null) {
                return TaskUserIdentity.fromUserAccount(userAccount);
            }
        } catch (NumberFormatException ignored) {
        }

        UserAccount userAccount = userRepository.findByLoginIdentifier(principalName)
                .orElse(null);
        if (userAccount != null) {
            return TaskUserIdentity.fromUserAccount(userAccount);
        }

        Employee employee = employeeRepository.findByLoginIdentifier(principalName)
                .orElse(null);
        if (employee != null) {
            return TaskUserIdentity.fromEmployee(employee);
        }

        throw new AccessDeniedException("You cannot access this task");
    }

    private boolean isTaskOwnedByUser(ManagerTask task, TaskUserIdentity user) {
        if (task.getAssigneeId() != null && user.id() != null && task.getAssigneeId().equals(user.id())) {
            return true;
        }
        if (matchesIgnoreCase(task.getAssigneeEmployeeId(), user.employeeId())) {
            return true;
        }
        if (matchesIgnoreCase(task.getAssigneeUsername(), user.username())) {
            return true;
        }
        if (matchesIgnoreCase(task.getAssigneeUsername(), user.email())) {
            return true;
        }
        return matchesIgnoreCase(task.getAssignee(), user.fullName());
    }

    private boolean matchesIgnoreCase(String left, String right) {
        return left != null && right != null && left.trim().equalsIgnoreCase(right.trim());
    }

    private boolean isLeadership(Authentication authentication) {
        return authentication.getAuthorities()
                .stream()
                .anyMatch(auth ->
                        auth.getAuthority().equals("ROLE_MANAGING_DIRECTOR") ||
                        auth.getAuthority().equals("ROLE_OPERATION_HEAD") ||
                        auth.getAuthority().equals("ROLE_ADMIN") ||
                        auth.getAuthority().equals("ROLE_SUPER_ADMIN")
                );
    }

    private record TaskUserIdentity(
            Long id,
            String employeeId,
            String username,
            String email,
            String fullName
    ) {
        private static TaskUserIdentity fromEmployee(Employee employee) {
            return new TaskUserIdentity(
                    employee.getId(),
                    employee.getEmployeeId(),
                    employee.getUsername(),
                    employee.getEmail(),
                    employee.getName()
            );
        }

        private static TaskUserIdentity fromUserAccount(UserAccount userAccount) {
            return new TaskUserIdentity(
                    userAccount.getId(),
                    userAccount.getEmployeeId(),
                    userAccount.getUsername(),
                    userAccount.getEmail(),
                    userAccount.getFullName()
            );
        }
    }
}
