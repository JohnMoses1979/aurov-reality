package com.example.auro.dto;

 
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
public class PdfFileResponse {

    private String name;

    private String type;

    private String size;

    private String url;
}
