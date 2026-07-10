package com.example.auro.service;

 
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.auro.dto.VentureResponse;
import com.example.auro.entity.Venture;
import com.example.auro.repository.VentureRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VentureService {

    private final VentureRepository ventureRepository;
    private final FileStorageService fileStorageService;

    public List<VentureResponse> getAllVentures() {
        return ventureRepository.findAll()
                .stream()
                .map(VentureResponse::fromEntity)
                .toList();
    }

    public VentureResponse getVentureById(Long id) {
        Venture venture = ventureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venture not found"));

        return VentureResponse.fromEntity(venture);
    }

    public VentureResponse createVenture(
            String name,
            String location,
            String type,
            String description,
            String amenities,
            MultipartFile posterImage,
            List<MultipartFile> galleryImages,
            String createdBy
    ) {
        if (posterImage == null || posterImage.isEmpty()) {
            throw new RuntimeException("Poster image is required");
        }

        String posterUrl = fileStorageService.saveFile(posterImage, "ventures/posters");

        List<String> galleryUrls = saveGalleryImages(galleryImages);

        Venture venture = Venture.builder()
                .name(name)
                .location(location)
                .type(type)
                .description(description)
                .amenities(amenities)
                .posterImageUrl(posterUrl)
                .galleryImageUrls(galleryUrls)
                .createdBy(createdBy)
                .build();

        Venture saved = ventureRepository.save(venture);

        return VentureResponse.fromEntity(saved);
    }

    public VentureResponse updateVenture(
            Long id,
            String name,
            String location,
            String type,
            String description,
            String amenities,
            MultipartFile posterImage,
            List<MultipartFile> galleryImages,
            List<String> existingGalleryImages
    ) {
        Venture venture = ventureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venture not found"));

        venture.setName(name);
        venture.setLocation(location);
        venture.setType(type);
        venture.setDescription(description);
        venture.setAmenities(amenities);

        if (posterImage != null && !posterImage.isEmpty()) {
            String posterUrl = fileStorageService.saveFile(posterImage, "ventures/posters");
            venture.setPosterImageUrl(posterUrl);
        }

        List<String> finalGallery = new ArrayList<>();

        if (existingGalleryImages != null) {
            finalGallery.addAll(existingGalleryImages);
        } else if (venture.getGalleryImageUrls() != null) {
            finalGallery.addAll(venture.getGalleryImageUrls());
        }

        finalGallery.addAll(saveGalleryImages(galleryImages));

        venture.setGalleryImageUrls(finalGallery);

        Venture saved = ventureRepository.save(venture);

        return VentureResponse.fromEntity(saved);
    }

    public void deleteVenture(Long id) {
        if (!ventureRepository.existsById(id)) {
            throw new RuntimeException("Venture not found");
        }

        ventureRepository.deleteById(id);
    }

    private List<String> saveGalleryImages(List<MultipartFile> galleryImages) {
        List<String> galleryUrls = new ArrayList<>();

        if (galleryImages == null || galleryImages.isEmpty()) {
            return galleryUrls;
        }

        for (MultipartFile file : galleryImages) {
            if (file != null && !file.isEmpty()) {
                String imageUrl = fileStorageService.saveFile(file, "ventures/gallery");
                galleryUrls.add(imageUrl);
            }
        }

        return galleryUrls;
    }
}
