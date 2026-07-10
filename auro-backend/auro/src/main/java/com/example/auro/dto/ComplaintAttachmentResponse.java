package com.example.auro.dto;

import com.example.auro.entity.ComplaintAttachment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintAttachmentResponse {

    private String id;

    private String name;

    private String type;

    private String size;

    public static ComplaintAttachmentResponse fromEntity(
            ComplaintAttachment attachment
    ) {
        return ComplaintAttachmentResponse.builder()
                .id(String.valueOf(attachment.getId()))
                .name(attachment.getName())
                .type(attachment.getContentType())
                .size(attachment.getSizeBytes() == null ? null : Math.round(attachment.getSizeBytes() / 1024.0) + " KB")
                .build();
    }
}
