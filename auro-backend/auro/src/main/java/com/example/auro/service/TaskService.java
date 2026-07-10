package com.example.auro.service;

import com.example.auro.dto.TaskResponse;
import com.example.auro.entity.PdfTask;
import com.example.auro.entity.PdfTaskStatus;
import com.example.auro.entity.TaskEntity;
import com.example.auro.entity.UserAccount;
import com.example.auro.repository.PdfTaskRepository;
import com.example.auro.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TaskService {

    private static final String SALES_MANAGER_ROLE = "Sales Manager";

    private final TaskRepository taskRepository;
    private final PdfTaskRepository pdfTaskRepository;
    private final NotificationService notificationService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public List<TaskResponse> myTasks(UserAccount user) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        Map<String, TaskResponse> unique = new LinkedHashMap<>();

        if (user.getId() != null) {
            taskRepository.findByAssigneeIdIgnoreCase(String.valueOf(user.getId()))
                    .forEach(task -> unique.put(task.getId(), TaskResponse.from(task)));

            pdfTaskRepository.findByAssigneeId(user.getId())
                    .forEach(task -> unique.put(resolvePdfTaskKey(task), TaskResponse.from(task, SALES_MANAGER_ROLE)));
        }

        if (user.getEmployeeId() != null) {
            taskRepository.findByAssigneeEmployeeIdIgnoreCase(user.getEmployeeId())
                    .forEach(task -> unique.put(task.getId(), TaskResponse.from(task)));

            pdfTaskRepository.findByAssigneeEmployeeIdIgnoreCase(user.getEmployeeId())
                    .forEach(task -> unique.put(resolvePdfTaskKey(task), TaskResponse.from(task, SALES_MANAGER_ROLE)));
        }

        if (user.getUsername() != null) {
            taskRepository.findByAssigneeUsernameIgnoreCase(user.getUsername())
                    .forEach(task -> unique.put(task.getId(), TaskResponse.from(task)));
        }

        if (user.getEmail() != null) {
            taskRepository.findByAssigneeEmailIgnoreCase(user.getEmail())
                    .forEach(task -> unique.put(task.getId(), TaskResponse.from(task)));
        }

        return unique.values()
                .stream()
                .sorted(
                        Comparator.comparing(
                                TaskResponse::updatedAt,
                                Comparator.nullsLast(Comparator.reverseOrder())
                        )
                )
                .toList();
    }

    public TaskResponse updateStatus(String taskId, String status, UserAccount user) {
        if (!List.of("Pending", "In Progress", "Submitted", "Completed").contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid task status");
        }

        PdfTask pdfTask = findPdfTaskForUser(taskId, user);

        if (pdfTask != null) {
            pdfTask.setStatus(mapPdfStatus(status));
            PdfTask saved = pdfTaskRepository.save(pdfTask);
            notifyManagerForPdfTask(saved, user, "Task Status", saved.getTitle() + " was updated to " + status + ".");
            return TaskResponse.from(saved, SALES_MANAGER_ROLE);
        }

        TaskEntity task = getTaskForUser(taskId, user);
        task.setStatus(status);

        TaskEntity saved = taskRepository.save(task);
        notifyManagerForTask(saved, user, "Task Status", saved.getTitle() + " was updated to " + status + ".");
        return TaskResponse.from(saved);
    }

    public TaskResponse uploadTaskPdf(
            String taskId,
            String kind,
            MultipartFile file,
            UserAccount user
    ) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PDF file is required");
        }

        String originalName = file.getOriginalFilename() == null
                ? "task.pdf"
                : file.getOriginalFilename();

        if (!originalName.toLowerCase().endsWith(".pdf")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF files are allowed");
        }

        try {
            PdfTask pdfTask = findPdfTaskForUser(taskId, user);

            if (pdfTask != null) {
                return uploadPdfTaskFile(pdfTask, kind, file, originalName, user);
            }

            TaskEntity task = getTaskForUser(taskId, user);
            Path folder = Path.of(uploadDir, taskId);
            Files.createDirectories(folder);

            String safeName = kind + "-" + System.currentTimeMillis() + "-"
                    + originalName.replaceAll("[^a-zA-Z0-9._-]", "_");

            Path target = folder.resolve(safeName);

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            if ("update".equalsIgnoreCase(kind)) {
                task.setUpdatePdfName(originalName);
                task.setUpdatePdfPath(target.toString());
                task.setUpdatePdfType(file.getContentType());
                task.setStatus("Submitted");
            } else if ("completion".equalsIgnoreCase(kind)) {
                task.setCompletionPdfName(originalName);
                task.setCompletionPdfPath(target.toString());
                task.setCompletionPdfType(file.getContentType());
                task.setStatus("Completed");
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid upload type");
            }

            TaskEntity saved = taskRepository.save(task);
            notifyManagerForTask(saved, user, "Task File", saved.getTitle() + " has a new " + normalizedKind(kind) + " PDF upload.");
            return TaskResponse.from(saved);
        } catch (ResponseStatusException error) {
            throw error;
        } catch (Exception error) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to upload PDF"
            );
        }
    }

    public DownloadFile getDownloadFile(String taskId, String kind, UserAccount user) {
        PdfTask pdfTask = findPdfTaskForUser(taskId, user);

        if (pdfTask != null) {
            return getPdfTaskDownloadFile(pdfTask, kind);
        }

        TaskEntity task = getTaskForUser(taskId, user);

        String path;
        String fileName;
        String contentType;

        switch (kind.toLowerCase()) {
            case "assignment" -> {
                path = task.getAssignmentPdfPath();
                fileName = task.getPdfName();
                contentType = task.getAssignmentPdfType();
            }
            case "update" -> {
                path = task.getUpdatePdfPath();
                fileName = task.getUpdatePdfName();
                contentType = task.getUpdatePdfType();
            }
            case "completion" -> {
                path = task.getCompletionPdfPath();
                fileName = task.getCompletionPdfName();
                contentType = task.getCompletionPdfType();
            }
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid PDF type");
        }

        if (path == null || path.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "PDF not uploaded");
        }

        FileSystemResource resource = new FileSystemResource(path);

        if (!resource.exists()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "PDF file not found");
        }

        return new DownloadFile(
                resource,
                fileName == null || fileName.isBlank() ? "task.pdf" : fileName,
                contentType == null || contentType.isBlank() ? "application/pdf" : contentType
        );
    }

    private TaskEntity getTaskForUser(String taskId, UserAccount user) {
        TaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        if (!taskBelongsToUser(task, user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access this task");
        }

        return task;
    }

    private boolean taskBelongsToUser(TaskEntity task, UserAccount user) {
        Set<String> userKeys = new HashSet<>();

        addKey(userKeys, user.getId() == null ? null : String.valueOf(user.getId()));
        addKey(userKeys, user.getEmployeeId());
        addKey(userKeys, user.getUsername());
        addKey(userKeys, user.getEmail());
        addKey(userKeys, user.displayName());

        return contains(userKeys, task.getAssigneeId())
                || contains(userKeys, task.getAssigneeEmployeeId())
                || contains(userKeys, task.getAssigneeUsername())
                || contains(userKeys, task.getAssigneeEmail())
                || contains(userKeys, task.getAssignee());
    }

    private void addKey(Set<String> keys, String value) {
        if (value != null && !value.isBlank()) {
            keys.add(value.trim().toLowerCase());
        }
    }

    private boolean contains(Set<String> keys, String value) {
        return value != null && keys.contains(value.trim().toLowerCase());
    }

    public record DownloadFile(
            FileSystemResource resource,
            String fileName,
            String contentType
    ) {
    }

    public List<TaskResponse> myTaskUpdates(UserAccount user) {
        return myTasks(user);
    }

    private TaskResponse uploadPdfTaskFile(
            PdfTask task,
            String kind,
            MultipartFile file,
            String originalName,
            UserAccount user
    ) throws Exception {
        String normalizedKind = kind == null ? "" : kind.trim().toLowerCase();
        Path folder = Path.of(uploadDir, "sales-tasks", String.valueOf(task.getId()));
        Files.createDirectories(folder);

        String safeName = normalizedKind + "-" + System.currentTimeMillis() + "-"
                + originalName.replaceAll("[^a-zA-Z0-9._-]", "_");

        Path target = folder.resolve(safeName);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        if ("update".equals(normalizedKind)) {
            task.setUpdatePdfName(originalName);
            task.setUpdatePdfPath(target.toString());
            task.setStatus(PdfTaskStatus.SUBMITTED);
        } else if ("completion".equals(normalizedKind)) {
            task.setCompletionPdfName(originalName);
            task.setCompletionPdfPath(target.toString());
            task.setStatus(PdfTaskStatus.COMPLETED);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid upload type");
        }

        PdfTask saved = pdfTaskRepository.save(task);
        notifyManagerForPdfTask(saved, user, "Task File", saved.getTitle() + " has a new " + normalizedKind(kind) + " PDF upload.");
        return TaskResponse.from(saved, SALES_MANAGER_ROLE);
    }

    private DownloadFile getPdfTaskDownloadFile(PdfTask task, String kind) {
        String normalizedKind = kind == null ? "" : kind.trim().toLowerCase();
        String path;
        String fileName;

        switch (normalizedKind) {
            case "assignment" -> {
                path = task.getPdfPath();
                fileName = task.getPdfName();
            }
            case "update" -> {
                path = task.getUpdatePdfPath();
                fileName = task.getUpdatePdfName();
            }
            case "completion" -> {
                path = task.getCompletionPdfPath();
                fileName = task.getCompletionPdfName();
            }
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid PDF type");
        }

        if (path == null || path.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "PDF not uploaded");
        }

        FileSystemResource resource = new FileSystemResource(path);

        if (!resource.exists()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "PDF file not found");
        }

        return new DownloadFile(
                resource,
                fileName == null || fileName.isBlank() ? "task.pdf" : fileName,
                "application/pdf"
        );
    }

    private PdfTask findPdfTaskForUser(String taskId, UserAccount user) {
        if (taskId == null || taskId.isBlank() || user == null) {
            return null;
        }

        PdfTask task = pdfTaskRepository.findByTaskCodeIgnoreCase(taskId).orElse(null);

        if (task == null && taskId.matches("\\d+")) {
            task = pdfTaskRepository.findById(Long.valueOf(taskId)).orElse(null);
        }

        if (task == null) {
            return null;
        }

        if (!pdfTaskBelongsToUser(task, user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access this task");
        }

        return task;
    }

    private boolean pdfTaskBelongsToUser(PdfTask task, UserAccount user) {
        Set<String> userKeys = new HashSet<>();

        addKey(userKeys, user.getId() == null ? null : String.valueOf(user.getId()));
        addKey(userKeys, user.getEmployeeId());
        addKey(userKeys, user.getUsername());
        addKey(userKeys, user.getEmail());
        addKey(userKeys, user.displayName());

        return contains(userKeys, task.getAssigneeId() == null ? null : String.valueOf(task.getAssigneeId()))
                || contains(userKeys, task.getAssigneeEmployeeId())
                || contains(userKeys, task.getAssignee());
    }

    private String resolvePdfTaskKey(PdfTask task) {
        return task.getTaskCode() != null ? task.getTaskCode() : "TASK-" + task.getId();
    }

    private PdfTaskStatus mapPdfStatus(String status) {
        return switch (status) {
            case "Pending" -> PdfTaskStatus.ASSIGNED;
            case "In Progress" -> PdfTaskStatus.IN_PROGRESS;
            case "Submitted" -> PdfTaskStatus.SUBMITTED;
            case "Completed" -> PdfTaskStatus.COMPLETED;
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid task status");
        };
    }

    private void notifyManagerForTask(TaskEntity task, UserAccount user, String type, String message) {
        notificationService.notifyRole(
                managerRoleForDepartment(task.getDepartment(), task.getAssignedBy()),
                type,
                "Executive updated task",
                displayName(user) + " updated " + message,
                "TASK",
                task.getId()
        );
    }

    private void notifyManagerForPdfTask(PdfTask task, UserAccount user, String type, String message) {
        String managerRole = task.getAssignedByRole() == null || task.getAssignedByRole().isBlank()
                ? managerRoleForDepartment(task.getDepartment(), null)
                : task.getAssignedByRole();
        notificationService.notifyRole(
                managerRole,
                type,
                "Executive updated task",
                displayName(user) + " updated " + message,
                "PDF_TASK",
                String.valueOf(task.getId())
        );
    }

    private String managerRoleForDepartment(String department, String fallback) {
        if (fallback != null && fallback.toLowerCase().contains("manager")) {
            return fallback;
        }
        if (department == null || department.isBlank()) {
            return SALES_MANAGER_ROLE;
        }
        return department.trim() + " Manager";
    }

    private String displayName(UserAccount user) {
        if (user == null) {
            return "Executive";
        }
        return user.displayName() == null || user.displayName().isBlank() ? "Executive" : user.displayName();
    }

    private String normalizedKind(String kind) {
        if (kind == null || kind.isBlank()) {
            return "task";
        }
        return kind.trim().toLowerCase();
    }
}
