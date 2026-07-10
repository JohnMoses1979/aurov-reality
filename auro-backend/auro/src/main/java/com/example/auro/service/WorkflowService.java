package com.example.auro.service;

import com.example.auro.entity.Complaint;
import com.example.auro.entity.PdfTask;
import com.example.auro.entity.PdfTaskStatus;
import com.example.auro.entity.SubmittedWork;
import com.example.auro.entity.UserAccount;
import com.example.auro.exception.ApiException;
import com.example.auro.repository.ComplaintRepository;
import com.example.auro.repository.PdfTaskRepository;
import com.example.auro.repository.SubmittedWorkRepository;
import com.example.auro.repository.UserRepository;
import com.example.auro.util.RoleConstants;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class WorkflowService {
    private final PdfTaskRepository pdfTaskRepository;
    private final SubmittedWorkRepository submittedWorkRepository;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public WorkflowService(
            PdfTaskRepository pdfTaskRepository,
            SubmittedWorkRepository submittedWorkRepository,
            ComplaintRepository complaintRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper
    ) {
        this.pdfTaskRepository = pdfTaskRepository;
        this.submittedWorkRepository = submittedWorkRepository;
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> snapshot(UserAccount user) {
        return Map.of(
                "tasks", pdfTaskRepository.findAll().stream()
                        .filter(task -> taskVisible(task, user))
                        .map(this::taskResponse)
                        .toList(),
                "submittedWorks", submittedWorkRepository.findAll().stream()
                        .filter(work -> workVisible(work, user))
                        .map(this::workResponse)
                        .toList(),
                "complaints", complaintRepository.findAll().stream()
                        .filter(complaint -> complaintVisible(complaint, user))
                        .map(this::complaintResponse)
                        .toList()
        );
    }

    @Transactional
    public Map<String, Object> createTask(
            UserAccount manager,
            Long assigneeId,
            String title,
            String due,
            MultipartFile file
    ) {
        requireManager(manager);
        if (title == null || title.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Task title is required.");
        }
        requirePdf(file);

        UserAccount assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Executive not found."));

        if (!RoleConstants.isEmployeeRole(assignee.getRole()) || !assignee.getRole().endsWith("Executive")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Tasks can be assigned only to executives.");
        }
        if (!manager.getDepartment().equals(assignee.getDepartment())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Managers can assign only to executives in their department.");
        }

        PdfTask task = new PdfTask();
        task.setTitle(title.trim());
        task.setDepartment(assignee.getDepartment());
        task.setAssignedByRole(manager.getRole());
        task.setAssigneeId(assignee.getId());
        task.setAssigneeEmployeeId(assignee.getEmployeeId());
        task.setAssignee(displayName(assignee));
        task.setDue(parseDate(due));
        task.setStatus(PdfTaskStatus.ASSIGNED);
        fillTaskPdf(task, file);

        PdfTask saved = pdfTaskRepository.save(task);
        if (saved.getTaskCode() == null || saved.getTaskCode().isBlank()) {
            saved.setTaskCode("WF-" + saved.getId());
            saved = pdfTaskRepository.save(saved);
        }
        return taskResponse(saved);
    }

    @Transactional
    public Map<String, Object> updateTaskStatus(UserAccount user, Long taskId, String status) {
        PdfTask task = findTask(taskId);
        if (!taskVisible(task, user)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Task is not visible to this user.");
        }
        task.setStatus(parseTaskStatus(status));
        return taskResponse(pdfTaskRepository.save(task));
    }

    @Transactional
    public Map<String, Object> uploadTaskPdf(UserAccount executive, Long taskId, String kind, MultipartFile file) {
        requirePdf(file);
        PdfTask task = findTask(taskId);
        if (!isTaskOwnedBy(task, executive)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Executives can upload only to their own tasks.");
        }

        fillTaskPdf(task, file);
        if ("update".equalsIgnoreCase(kind)) {
            if (task.getStatusEnum() == PdfTaskStatus.ASSIGNED) {
                task.setStatus(PdfTaskStatus.IN_PROGRESS);
            }
        } else {
            task.setStatus(PdfTaskStatus.SUBMITTED);
        }

        return taskResponse(pdfTaskRepository.save(task));
    }

    @Transactional
    public Map<String, Object> reviewTask(UserAccount manager, Long taskId, String decision) {
        requireManager(manager);
        PdfTask task = findTask(taskId);
        if (!manager.getDepartment().equals(task.getDepartment())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Managers can review only their department tasks.");
        }

        PdfTaskStatus status = switch (decision == null ? "" : decision.trim().toLowerCase()) {
            case "approve" -> PdfTaskStatus.REVIEWED;
            case "close" -> PdfTaskStatus.COMPLETED;
            case "reject" -> PdfTaskStatus.REJECTED;
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid review decision.");
        };

        task.setStatus(status);
        return taskResponse(pdfTaskRepository.save(task));
    }

    @Transactional
    public Map<String, Object> submitWork(UserAccount manager, String title, String description, String submissionDate, MultipartFile file) {
        requireManager(manager);
        if (title == null || title.isBlank()) throw new ApiException(HttpStatus.BAD_REQUEST, "Work title is required.");
        if (description == null || description.isBlank()) throw new ApiException(HttpStatus.BAD_REQUEST, "Work description is required.");
        requirePdf(file);
        SubmittedWork work = new SubmittedWork();
        work.setManager(manager);
        work.setDepartment(manager.getDepartment());
        work.setTitle(title.trim());
        work.setDescription(description.trim());
        work.setSubmissionDate(parseDate(submissionDate));
        fillWork(work, file);
        return workResponse(submittedWorkRepository.save(work));
    }

    @Transactional
    public Map<String, Object> reviewSubmittedWork(UserAccount reviewer, Long id, String status, String remarks) {
        if (!RoleConstants.isSuperRole(reviewer.getRole())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only MD/OH can review submitted work.");
        }
        List<String> allowed = List.of("Submitted", "Reviewed", "Approved", "Rejected");
        if (!allowed.contains(status)) throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid submitted work status.");
        SubmittedWork work = submittedWorkRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Submitted work not found."));
        work.setStatus(status);
        work.setRemarks(remarks == null ? "" : remarks.trim());
        return workResponse(submittedWorkRepository.save(work));
    }

    @Transactional
    public Map<String, Object> raiseComplaint(UserAccount raisedBy, String subject, String description, String priority, String attachmentsJson) {
        if (!RoleConstants.isDepartmentManagerRole(raisedBy.getRole()) && !RoleConstants.isExecutiveRole(raisedBy.getRole())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only managers and executives can raise complaints.");
        }
        if (subject == null || subject.isBlank()) throw new ApiException(HttpStatus.BAD_REQUEST, "Complaint subject is required.");
        if (description == null || description.isBlank()) throw new ApiException(HttpStatus.BAD_REQUEST, "Complaint description is required.");
        Complaint complaint = new Complaint();
        complaint.setRaisedBy(raisedBy);
        complaint.setDepartment(raisedBy.getDepartment());
        complaint.setSubject(subject.trim());
        complaint.setDescription(description.trim());
        complaint.setPriority(priority == null || priority.isBlank() ? "Medium" : priority.trim());
        complaint.setTarget("Leadership");
        complaint.setAttachmentsJson(blankToJsonArray(attachmentsJson));
        complaint.setStatusHistoryJson(toJson(List.of(Map.of(
                "status", "Pending",
                "note", "Complaint submitted to Managing Director and Operational Head",
                "dateTime", stringify(LocalDateTime.now())
        ))));
        return complaintResponse(complaintRepository.save(complaint));
    }

    @Transactional
    public Map<String, Object> updateComplaintStatus(UserAccount reviewer, Long id, String status, String note) {
        List<String> allowed = List.of("Pending", "In Progress", "Resolved", "Closed");
        if (!allowed.contains(status)) throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid complaint status.");
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Complaint not found."));
        if (!complaintVisibleForReview(complaint, reviewer)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Complaint is not visible to this reviewer.");
        }
        String remarks = note == null ? "" : note.trim();
        complaint.setStatus(status);
        complaint.setRemarks(remarks);
        if ("Resolved".equals(status) || "Closed".equals(status)) {
            complaint.setResolutionNotes(remarks);
        }
        List<Map<String, Object>> history = readJsonList(complaint.getStatusHistoryJson());
        history.add(0, Map.of(
                "status", status,
                "note", remarks.isBlank() ? status + " by " + reviewer.getRole() : remarks,
                "dateTime", stringify(LocalDateTime.now())
        ));
        complaint.setStatusHistoryJson(toJson(history));
        return complaintResponse(complaintRepository.save(complaint));
    }

    private PdfTask findTask(Long id) {
        return pdfTaskRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Task not found."));
    }

    private void requireManager(UserAccount user) {
        if (!RoleConstants.isDepartmentManagerRole(user.getRole())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only department managers can perform this action.");
        }
    }

    private void requirePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new ApiException(HttpStatus.BAD_REQUEST, "PDF file is required.");
        String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        if (!"application/pdf".equalsIgnoreCase(file.getContentType()) && !name.toLowerCase().endsWith(".pdf")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only PDF files are allowed.");
        }
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) return null;
        return LocalDate.parse(value);
    }

    private PdfTaskStatus parseTaskStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Task status is required.");
        }
        String normalized = status.trim().toUpperCase().replace(' ', '_');
        return switch (normalized) {
            case "PENDING", "ASSIGNED" -> PdfTaskStatus.ASSIGNED;
            case "IN_PROGRESS" -> PdfTaskStatus.IN_PROGRESS;
            case "SUBMITTED" -> PdfTaskStatus.SUBMITTED;
            case "REVIEWED", "APPROVED" -> PdfTaskStatus.REVIEWED;
            case "COMPLETED", "CLOSED" -> PdfTaskStatus.COMPLETED;
            case "REJECTED" -> PdfTaskStatus.REJECTED;
            default -> throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid task status.");
        };
    }

    private void fillTaskPdf(PdfTask task, MultipartFile file) {
        task.setPdfName(fileName(file, "Task.pdf"));
        task.setPdfContentType(contentType(file));
        task.setPdfStorageName(UUID.randomUUID() + "-" + task.getPdfName());
        task.setPdfPath(task.getPdfStorageName());
    }

    private void fillWork(SubmittedWork work, MultipartFile file) {
        work.setFileName(fileName(file, "Submitted_Work.pdf"));
        work.setContentType(contentType(file));
        work.setFileSizeLabel(sizeLabel(file));
        work.setData(bytes(file));
    }

    private byte[] bytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException error) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unable to read PDF file.");
        }
    }

    private String contentType(MultipartFile file) {
        return file.getContentType() == null ? "application/pdf" : file.getContentType();
    }

    private String fileName(MultipartFile file, String fallback) {
        return file.getOriginalFilename() == null || file.getOriginalFilename().isBlank() ? fallback : file.getOriginalFilename();
    }

    private String sizeLabel(MultipartFile file) {
        return String.format("%.2f MB", Math.max(file.getSize() / 1024d / 1024d, 0.01d));
    }

    private String displayName(UserAccount user) {
        if (user.getFullName() != null && !user.getFullName().isBlank()) {
            return user.getFullName();
        }
        if (user.getUsername() != null && !user.getUsername().isBlank()) {
            return user.getUsername();
        }
        return user.getEmployeeId() == null ? "Employee" : user.getEmployeeId();
    }

    private boolean taskVisible(PdfTask task, UserAccount user) {
        if (RoleConstants.isSuperRole(user.getRole())) return true;
        if (RoleConstants.isDepartmentManagerRole(user.getRole())) {
            return user.getDepartment().equals(task.getDepartment()) || isTaskOwnedBy(task, user);
        }
        return isTaskOwnedBy(task, user);
    }

    private boolean isTaskOwnedBy(PdfTask task, UserAccount user) {
        if (task.getAssigneeId() != null && user != null && task.getAssigneeId().equals(user.getId())) {
            return true;
        }
        if (matchesIgnoreCase(task.getAssigneeEmployeeId(), user == null ? null : user.getEmployeeId())) {
            return true;
        }
        return matchesIgnoreCase(task.getAssignee(), user == null ? null : displayName(user));
    }

    private boolean matchesIgnoreCase(String left, String right) {
        return left != null && right != null && left.trim().equalsIgnoreCase(right.trim());
    }

    private boolean workVisible(SubmittedWork work, UserAccount user) {
        if (RoleConstants.isSuperRole(user.getRole())) return true;
        return RoleConstants.isDepartmentManagerRole(user.getRole()) && isSameUser(work.getManager(), user);
    }

    private boolean complaintVisible(Complaint complaint, UserAccount user) {
        if (RoleConstants.isSuperRole(user.getRole())) return true;
        if (RoleConstants.isDepartmentManagerRole(user.getRole())) {
            return user.getDepartment().equals(complaint.getDepartment()) || isSameUser(complaint.getRaisedBy(), user);
        }
        return isSameUser(complaint.getRaisedBy(), user);
    }

    private boolean complaintVisibleForReview(Complaint complaint, UserAccount user) {
        if (RoleConstants.isSuperRole(user.getRole())) return true;
        return RoleConstants.isDepartmentManagerRole(user.getRole()) && user.getDepartment().equals(complaint.getDepartment());
    }

    private boolean isSameUser(UserAccount a, UserAccount b) {
        return a != null && b != null && a.getId().equals(b.getId());
    }

    private Map<String, Object> taskResponse(PdfTask task) {
        Map<String, Object> response = new LinkedHashMap<>();
        UserAccount assignee = task.getAssigneeId() == null ? null : userRepository.findById(task.getAssigneeId()).orElse(null);
        response.put("id", String.valueOf(task.getId()));
        response.put("title", task.getTitle());
        response.put("taskCode", task.getTaskCode());
        response.put("assigneeId", task.getAssigneeId());
        response.put("assigneeEmployeeId", task.getAssigneeEmployeeId());
        response.put("assignee", task.getAssignee());
        response.put("assigneeEmail", assignee == null ? "" : assignee.getEmail());
        response.put("assigneeUsername", assignee == null ? "" : assignee.getUsername());
        response.put("department", task.getDepartment());
        response.put("assignedBy", task.getAssignedByRole());
        response.put("assignedByName", task.getAssignedByRole());
        response.put("pdfName", task.getPdfName());
        response.put("assignmentPdf", taskFileResponse(task));
        response.put("updatePdf", null);
        response.put("completionPdf", null);
        response.put("status", formatTaskStatus(task.getStatusEnum()));
        response.put("due", task.getDue() == null ? "" : task.getDue().toString());
        response.put("createdAt", stringify(task.getCreatedAt()));
        response.put("updatedAt", stringify(task.getCreatedAt()));
        response.put("submittedAt", "");
        response.put("reviewedAt", "");
        return response;
    }

    private Map<String, Object> taskFileResponse(PdfTask task) {
        if (task.getPdfName() == null || task.getPdfName().isBlank()) {
            return null;
        }
        return Map.of(
                "id", "task-" + task.getId(),
                "name", task.getPdfName(),
                "size", "",
                "type", task.getPdfContentType() == null ? "application/pdf" : task.getPdfContentType(),
                "dataUrl", task.getPdfPath() == null ? "" : task.getPdfPath(),
                "uploadedAt", stringify(task.getCreatedAt())
        );
    }

    private String formatTaskStatus(PdfTaskStatus status) {
        if (status == null) {
            return "Assigned";
        }
        return switch (status) {
            case ASSIGNED -> "Assigned";
            case IN_PROGRESS -> "In Progress";
            case SUBMITTED -> "Submitted";
            case REVIEWED, APPROVED -> "Reviewed";
            case COMPLETED, CLOSED -> "Completed";
            case REJECTED -> "Rejected";
        };
    }

    private Map<String, Object> workResponse(SubmittedWork work) {
        UserAccount manager = work.getManager();
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", String.valueOf(work.getId()));
        response.put("managerName", manager.getFullName());
        response.put("managerRole", manager.getRole());
        response.put("employeeId", manager.getEmployeeId());
        response.put("employeeEmail", manager.getEmail());
        response.put("department", work.getDepartment());
        response.put("title", work.getTitle());
        response.put("description", work.getDescription());
        response.put("submissionDate", work.getSubmissionDate() == null ? "" : work.getSubmissionDate().toString());
        response.put("submissionIso", stringify(work.getCreatedAt()));
        response.put("status", work.getStatus());
        response.put("remarks", work.getRemarks());
        response.put("pdf", fileResponse("submitted-work-" + work.getId(), work.getFileName(), work.getContentType(), work.getFileSizeLabel(), work.getData(), work.getCreatedAt()));
        response.put("createdAt", stringify(work.getCreatedAt()));
        response.put("createdIso", stringify(work.getCreatedAt()));
        response.put("updatedAt", stringify(work.getUpdatedAt()));
        response.put("statusHistory", List.of(Map.of("status", work.getStatus(), "remarks", work.getRemarks() == null ? "" : work.getRemarks(), "dateTime", stringify(work.getUpdatedAt()))));
        return response;
    }

    private Map<String, Object> complaintResponse(Complaint complaint) {
        UserAccount employee = complaint.getRaisedBy();
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", String.valueOf(complaint.getId()));
        response.put("employeeId", employee.getEmployeeId());
        response.put("employeeName", employee.getFullName());
        response.put("employeeRole", employee.getRole());
        response.put("from", employee.getFullName());
        response.put("fromEmployeeId", employee.getEmployeeId());
        response.put("fromEmail", employee.getEmail());
        response.put("fromUsername", employee.getUsername());
        response.put("department", complaint.getDepartment());
        response.put("role", employee.getRole());
        response.put("target", "Leadership");
        response.put("targetLabel", "Send to Operational Head & Managing Director");
        response.put("audience", List.of(RoleConstants.OPERATIONAL_HEAD, RoleConstants.MANAGING_DIRECTOR));
        response.put("subject", complaint.getSubject());
        response.put("description", complaint.getDescription());
        response.put("priority", complaint.getPriority());
        response.put("status", complaint.getStatus());
        response.put("attachments", readJsonList(complaint.getAttachmentsJson()));
        response.put("statusHistory", readJsonList(complaint.getStatusHistoryJson()));
        response.put("resolutionNotes", complaint.getResolutionNotes() == null ? "" : complaint.getResolutionNotes());
        response.put("remarks", complaint.getRemarks() == null ? "" : complaint.getRemarks());
        response.put("createdAt", stringify(complaint.getCreatedAt()));
        response.put("createdIso", stringify(complaint.getCreatedAt()));
        response.put("dateTime", stringify(complaint.getCreatedAt()));
        response.put("updatedAt", stringify(complaint.getUpdatedAt()));
        return response;
    }

    private Map<String, Object> fileResponse(String id, String name, String contentType, String size, byte[] data, LocalDateTime uploadedAt) {
        if (data == null || name == null) return null;
        String type = contentType == null ? "application/pdf" : contentType;
        return Map.of(
                "id", id,
                "name", name,
                "size", size == null ? "" : size,
                "type", type,
                "dataUrl", "data:" + type + ";base64," + Base64.getEncoder().encodeToString(data),
                "uploadedAt", stringify(uploadedAt)
        );
    }

    private String stringify(LocalDateTime value) {
        return value == null ? "" : value.toString();
    }

    private String blankToJsonArray(String value) {
        return value == null || value.isBlank() ? "[]" : value;
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException error) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unable to store complaint details.");
        }
    }

    private List<Map<String, Object>> readJsonList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
        } catch (JsonProcessingException error) {
            return List.of();
        }
    }
}


