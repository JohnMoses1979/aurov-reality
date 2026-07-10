package com.example.auro.service;

import com.example.auro.dto.ComplaintAttachmentDto;
import com.example.auro.dto.ComplaintHistoryDto;
import com.example.auro.dto.ComplaintResponseDto;
import com.example.auro.entity.AppUser;
import com.example.auro.entity.Complaint;
import com.example.auro.entity.ComplaintAttachment;
import com.example.auro.entity.ComplaintPriority;
import com.example.auro.entity.ComplaintStatus;
import com.example.auro.entity.ComplaintStatusHistory;
import com.example.auro.entity.ComplaintTarget;
import com.example.auro.repository.AppUserRepository;
import com.example.auro.repository.ComplaintAttachmentRepository;
import com.example.auro.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class ComplaintServiceImpl {

    private static final DateTimeFormatter DISPLAY_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    @Value("${app.upload.complaint-dir:uploads/complaints}")
    private String complaintUploadDir;

    private final ComplaintRepository complaintRepository;
    private final ComplaintAttachmentRepository attachmentRepository;
    private final AppUserRepository userRepository;

    public ComplaintServiceImpl(
            ComplaintRepository complaintRepository,
            ComplaintAttachmentRepository attachmentRepository,
            AppUserRepository userRepository
    ) {
        this.complaintRepository = complaintRepository;
        this.attachmentRepository = attachmentRepository;
        this.userRepository = userRepository;
    }

    public List<ComplaintResponseDto> getVisibleComplaints(String email) {
        AppUser user = getUser(email);

        List<Complaint> complaints;

        if (isLeadership(user)) {
            complaints = complaintRepository.findAllByOrderByCreatedAtDesc();
        } else if (isManager(user)) {
            complaints = complaintRepository.findByDepartmentOrderByCreatedAtDesc(getDepartment(user));
        } else {
            complaints = complaintRepository.findByEmployeeIdOrderByCreatedAtDesc(getEmployeeId(user));
        }

        return complaints.stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public ComplaintResponseDto raiseComplaint(
            String email,
            String target,
            String subject,
            String description,
            String priority,
            List<MultipartFile> attachments
    ) {
        AppUser user = getUser(email);

        if (isLeadership(user)) {
            throw new RuntimeException("Leadership users cannot raise complaints from this screen");
        }

        validateComplaint(subject, description, attachments);

        ComplaintTarget parsedTarget = parseTarget(target, user);

        Complaint complaint = new Complaint();
        complaint.setEmployeeId(getEmployeeId(user));
        complaint.setEmployeeName(getName(user));
        complaint.setEmployeeRole(getRoleLabel(user));
        complaint.setDepartment(getDepartment(user));
        complaint.setTarget(parsedTarget.name());
        complaint.setTargetLabel(getTargetLabel(parsedTarget));
        complaint.setSubject(subject.trim());
        complaint.setDescription(description.trim());
        complaint.setPriority(formatPriority(parsePriority(priority)));
        complaint.setStatus(formatStatus(ComplaintStatus.PENDING));

        Complaint saved = complaintRepository.save(complaint);
        saved.setComplaintCode("CMP-" + saved.getId());

        ComplaintStatusHistory history = new ComplaintStatusHistory();
        history.setComplaint(saved);
        history.setStatus(formatStatus(ComplaintStatus.PENDING));
        history.setNote("Complaint created");
        history.setUpdatedBy(getName(user));
        history.setUpdatedByRole(getRoleLabel(user));

        saved.getStatusHistory().add(history);

        if (attachments != null) {
            for (MultipartFile file : attachments) {
                if (file != null && !file.isEmpty()) {
                    saved.getAttachments().add(storeAttachment(saved, file));
                }
            }
        }

        Complaint finalSaved = complaintRepository.save(saved);
        return toDto(finalSaved);
    }

    @Transactional
    public ComplaintResponseDto updateStatus(
            String email,
            Long complaintId,
            String status,
            String note
    ) {
        AppUser user = getUser(email);

        if (!isLeadership(user) && !isManager(user)) {
            throw new RuntimeException("You are not allowed to update complaint status");
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        if (isManager(user) && !getDepartment(user).equalsIgnoreCase(complaint.getDepartment())) {
            throw new RuntimeException("You can update only your department complaints");
        }

        ComplaintStatus complaintStatus = parseStatus(status);

        String cleanNote = note == null ? "" : note.trim();

        complaint.setStatus(formatStatus(complaintStatus));
        complaint.setRemarks(cleanNote);

        if (complaintStatus == ComplaintStatus.RESOLVED || complaintStatus == ComplaintStatus.CLOSED) {
            complaint.setResolutionNotes(cleanNote);
        }

        ComplaintStatusHistory history = new ComplaintStatusHistory();
        history.setComplaint(complaint);
        history.setStatus(formatStatus(complaintStatus));
        history.setNote(
                cleanNote.isBlank()
                        ? formatStatus(complaintStatus) + " by " + getRoleLabel(user)
                        : cleanNote
        );
        history.setUpdatedBy(getName(user));
        history.setUpdatedByRole(getRoleLabel(user));

        complaint.getStatusHistory().add(history);

        Complaint saved = complaintRepository.save(complaint);
        return toDto(saved);
    }

    public Resource getAttachmentResource(
            String email,
            Long complaintId,
            Long attachmentId
    ) {
        AppUser user = getUser(email);

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        if (!canSeeComplaint(user, complaint)) {
            throw new RuntimeException("You are not allowed to access this attachment");
        }

        ComplaintAttachment attachment = attachmentRepository
                .findByIdAndComplaintId(attachmentId, complaintId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
        Path path = Path.of(attachment.getFilePath()).normalize();
        try {
            Resource resource = new UrlResource(path.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("Attachment file not found");
            }

            return resource;
        } catch (Exception error) {
            throw new RuntimeException("Unable to read attachment file", error);
        }
    }

    public String getAttachmentName(Long complaintId, Long attachmentId) {
        return attachmentRepository.findByIdAndComplaintId(attachmentId, complaintId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"))
                .getName();
    }

    public String getAttachmentContentType(Long complaintId, Long attachmentId) {
        String contentType = attachmentRepository.findByIdAndComplaintId(attachmentId, complaintId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"))
                .getContentType();

        return isBlank(contentType) ? "application/octet-stream" : contentType;
    }

    private ComplaintAttachment storeAttachment(Complaint complaint, MultipartFile file) {
        try {
            Files.createDirectories(Path.of(complaintUploadDir));

            String originalName = StringUtils.cleanPath(
                    file.getOriginalFilename() == null
                            ? "attachment"
                            : file.getOriginalFilename()
            );

            String extension = getExtension(originalName);
            String storageName = UUID.randomUUID() + extension;

            Path target = Path.of(complaintUploadDir).resolve(storageName).normalize();
            file.transferTo(target);

            ComplaintAttachment attachment = new ComplaintAttachment();
            attachment.setComplaint(complaint);
            attachment.setName(originalName);
            attachment.setContentType(file.getContentType());
            attachment.setSizeBytes(file.getSize());
            attachment.setFilePath(target.toString());

            return attachment;
        } catch (Exception error) {
            throw new RuntimeException("Unable to save attachment");
        }
    }

    private void validateComplaint(
            String subject,
            String description,
            List<MultipartFile> attachments
    ) {
        if (isBlank(subject)) {
            throw new RuntimeException("Complaint subject is required");
        }

        if (isBlank(description)) {
            throw new RuntimeException("Complaint description is required");
        }

        if (attachments == null) {
            return;
        }

        for (MultipartFile file : attachments) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            String name = file.getOriginalFilename() == null
                    ? ""
                    : file.getOriginalFilename().toLowerCase(Locale.ROOT);

            String type = file.getContentType() == null
                    ? ""
                    : file.getContentType().toLowerCase(Locale.ROOT);

            boolean valid =
                    type.equals("application/pdf") ||
                    type.equals("image/jpeg") ||
                    type.equals("image/png") ||
                    type.equals("image/webp") ||
                    name.endsWith(".pdf") ||
                    name.endsWith(".jpg") ||
                    name.endsWith(".jpeg") ||
                    name.endsWith(".png") ||
                    name.endsWith(".webp");

            if (!valid) {
                throw new RuntimeException("Only PDF, JPG, JPEG, PNG, and WEBP files are allowed");
            }
        }
    }

    private boolean canSeeComplaint(AppUser user, Complaint complaint) {
        if (isLeadership(user)) {
            return true;
        }

        if (isManager(user)) {
            return getDepartment(user).equalsIgnoreCase(complaint.getDepartment());
        }

        return getEmployeeId(user).equalsIgnoreCase(complaint.getEmployeeId());
    }

    private ComplaintResponseDto toDto(Complaint complaint) {
        return new ComplaintResponseDto(
                complaint.getComplaintCode() != null
                        ? complaint.getComplaintCode()
                        : "CMP-" + complaint.getId(),
                complaint.getId(),
                complaint.getEmployeeId(),
                complaint.getEmployeeName(),
                complaint.getEmployeeRole(),
                complaint.getDepartment(),
                complaint.getTarget() == null ? "" : complaint.getTarget(),
                complaint.getTargetLabel(),
                complaint.getTargetLabel(),
                complaint.getSubject(),
                complaint.getDescription(),
                formatPriority(parsePriority(complaint.getPriority())),
                formatStatus(parseStatus(complaint.getStatus())),
                complaint.getRemarks(),
                complaint.getResolutionNotes(),
                complaint.getCreatedAt() == null ? "-" : complaint.getCreatedAt().format(DISPLAY_FORMAT),
                complaint.getCreatedAt() == null ? "" : complaint.getCreatedAt().toString(),
                safeAttachments(complaint).stream().map(this::toAttachmentDto).toList(),
                safeHistory(complaint).stream().map(this::toHistoryDto).toList()
        );
    }

    private List<ComplaintAttachment> safeAttachments(Complaint complaint) {
        return complaint.getAttachments() == null
                ? new ArrayList<>()
                : complaint.getAttachments();
    }

    private List<ComplaintStatusHistory> safeHistory(Complaint complaint) {
        return complaint.getStatusHistory() == null
                ? new ArrayList<>()
                : complaint.getStatusHistory();
    }

    private ComplaintAttachmentDto toAttachmentDto(ComplaintAttachment attachment) {
        return new ComplaintAttachmentDto(
                attachment.getId(),
                attachment.getName(),
                attachment.getContentType(),
                attachment.getSizeBytes()
        );
    }

    private ComplaintHistoryDto toHistoryDto(ComplaintStatusHistory history) {
        return new ComplaintHistoryDto(
                history.getStatus(),
                history.getNote(),
                history.getNote(),
                history.getUpdatedBy(),
                history.getUpdatedByRole(),
                history.getCreatedAt() == null
                        ? "-"
                        : history.getCreatedAt().format(DISPLAY_FORMAT)
        );
    }

    private AppUser getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged-in user not found"));
    }

    private ComplaintTarget parseTarget(String value, AppUser user) {
        if (isBlank(value)) {
            return isExecutive(user)
                    ? ComplaintTarget.MANAGER
                    : ComplaintTarget.LEADERSHIP;
        }

        if (value.equalsIgnoreCase("Manager")) {
            return ComplaintTarget.MANAGER;
        }

        return ComplaintTarget.LEADERSHIP;
    }

    private ComplaintPriority parsePriority(String value) {
        if (isBlank(value)) {
            return ComplaintPriority.MEDIUM;
        }

        return switch (value.trim().toUpperCase(Locale.ROOT)) {
            case "HIGH" -> ComplaintPriority.HIGH;
            case "LOW" -> ComplaintPriority.LOW;
            default -> ComplaintPriority.MEDIUM;
        };
    }

    private ComplaintStatus parseStatus(String value) {
        if (isBlank(value)) {
            return ComplaintStatus.PENDING;
        }

        String cleaned = value.trim().replace(" ", "_").toUpperCase(Locale.ROOT);

        return switch (cleaned) {
            case "IN_PROGRESS" -> ComplaintStatus.IN_PROGRESS;
            case "RESOLVED" -> ComplaintStatus.RESOLVED;
            case "CLOSED" -> ComplaintStatus.CLOSED;
            default -> ComplaintStatus.PENDING;
        };
    }

    private String getTargetLabel(ComplaintTarget target) {
        if (target == ComplaintTarget.MANAGER) {
            return "Manager";
        }

        return "Operational Head & Managing Director";
    }

    private String formatStatus(ComplaintStatus status) {
        if (status == ComplaintStatus.IN_PROGRESS) return "In Progress";
        if (status == ComplaintStatus.RESOLVED) return "Resolved";
        if (status == ComplaintStatus.CLOSED) return "Closed";
        return "Pending";
    }

    private String formatPriority(ComplaintPriority priority) {
        if (priority == ComplaintPriority.HIGH) return "High";
        if (priority == ComplaintPriority.LOW) return "Low";
        return "Medium";
    }

    private boolean isLeadership(AppUser user) {
        String role = normalizeRole(getRoleLabel(user));
        return role.equals("MANAGING_DIRECTOR") || role.equals("OPERATIONS_HEAD");
    }

    private boolean isManager(AppUser user) {
        String role = normalizeRole(getRoleLabel(user));
        return role.contains("MANAGER") && !isLeadership(user);
    }

    private boolean isExecutive(AppUser user) {
        String role = normalizeRole(getRoleLabel(user));
        return role.contains("EXECUTIVE");
    }

    private String normalizeRole(String role) {
        return role == null
                ? ""
                : role.trim().replace(" ", "_").toUpperCase(Locale.ROOT);
    }

    private String getEmployeeId(AppUser user) {
        return user.getEmployeeId() != null
                ? user.getEmployeeId()
                : String.valueOf(user.getId());
    }

    private String getName(AppUser user) {
        return user.getName() != null
                ? user.getName()
                : getRoleLabel(user);
    }

    private String getRoleLabel(AppUser user) {
        return String.valueOf(user.getRole()).replace("_", " ");
    }

    private String getDepartment(AppUser user) {
        if (user.getDepartment() != null && !user.getDepartment().isBlank()) {
            return user.getDepartment();
        }

        String role = getRoleLabel(user).toLowerCase(Locale.ROOT);

        if (role.contains("sales")) return "Sales";
        if (role.contains("marketing")) return "Marketing";
        if (role.contains("crm")) return "CRM";
        if (role.contains("account")) return "Accounts";
        if (role.contains("hr")) return "HR";

        return "General";
    }

    private String getExtension(String fileName) {
        int dot = fileName.lastIndexOf('.');
        return dot >= 0 ? fileName.substring(dot) : "";
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}






