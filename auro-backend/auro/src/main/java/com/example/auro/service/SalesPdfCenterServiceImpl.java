package com.example.auro.service;

 
import com.example.auro.dto.PdfCenterFileDto;
import com.example.auro.dto.PdfCenterTaskDto;
import com.example.auro.entity.PdfTask;
import com.example.auro.entity.PdfTaskStatus;
import com.example.auro.repository.PdfTaskRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Path;
import java.util.List;
import java.util.Locale;

@Service
public class SalesPdfCenterServiceImpl implements SalesPdfCenterService {

    private static final String ROLE = "Sales Manager";
    private static final String DEPARTMENT = "Sales";

    private final PdfTaskRepository taskRepository;

    public SalesPdfCenterServiceImpl(PdfTaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    public List<PdfCenterTaskDto> getPdfUpdates() {
        return taskRepository
                .findByDepartmentOrAssignedByOrderByCreatedAtDesc(DEPARTMENT, ROLE)
                .stream()
                .filter(this::isVisibleInPdfCenter)
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional
    public PdfCenterTaskDto reviewTask(Long taskId, String decision) {
        PdfTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        String value = decision == null
                ? ""
                : decision.trim().toLowerCase(Locale.ROOT);

        if (value.equals("approve") || value.equals("approved")) {
            task.setStatus(PdfTaskStatus.APPROVED);
        } else if (value.equals("reject") || value.equals("rejected")) {
            task.setStatus(PdfTaskStatus.REJECTED);
        } else if (value.equals("close") || value.equals("closed")) {
            task.setStatus(PdfTaskStatus.CLOSED);
        } else {
            throw new RuntimeException("Invalid review action");
        }

        PdfTask saved = taskRepository.save(task);

        return toDto(saved);
    }

    @Override
    public Resource getTaskFile(Long taskId, String fileType) {
        PdfTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        String filePath = getFilePath(task, fileType);

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

    @Override
    public String getTaskFileName(Long taskId, String fileType) {
        PdfTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        String type = normalizeFileType(fileType);

        if (type.equals("update")) {
            return task.getUpdatePdfName() == null
                    ? "Update.pdf"
                    : task.getUpdatePdfName();
        }

        if (type.equals("completion")) {
            return task.getCompletionPdfName() == null
                    ? "Completion.pdf"
                    : task.getCompletionPdfName();
        }

        return task.getPdfName() == null
                ? "Assignment.pdf"
                : task.getPdfName();
    }

    private boolean isVisibleInPdfCenter(PdfTask task) {
        if (task.getUpdatePdfName() != null && !task.getUpdatePdfName().isBlank()) {
            return true;
        }

        if (task.getCompletionPdfName() != null && !task.getCompletionPdfName().isBlank()) {
            return true;
        }

        return List.of(
                PdfTaskStatus.COMPLETED,
                PdfTaskStatus.APPROVED,
                PdfTaskStatus.REJECTED,
                PdfTaskStatus.CLOSED
        ).contains(task.getStatusEnum());
    }

    private PdfCenterTaskDto toDto(PdfTask task) {
        return new PdfCenterTaskDto(
                task.getTaskCode() != null ? task.getTaskCode() : "TASK-" + task.getId(),
                task.getId(),
                task.getTitle(),
                task.getAssignee(),
                task.getAssigneeEmployeeId(),
                formatStatus(task.getStatusEnum()),
                task.getPdfName(),
                task.getUpdatePdfName() == null
                        ? null
                        : new PdfCenterFileDto(task.getUpdatePdfName(), "update"),
                task.getCompletionPdfName() == null
                        ? null
                        : new PdfCenterFileDto(task.getCompletionPdfName(), "completion")
        );
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







