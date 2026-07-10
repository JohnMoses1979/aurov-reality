package com.example.auro.repository;

import com.example.auro.entity.Property;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByVenture_Id(Long ventureId);

    long countByStatusIgnoreCase(String status);

    List<Property> findByStatusNotIgnoreCase(String status);

    List<Property> findByVenture_IdAndStatusNotIgnoreCase(Long ventureId, String status);

    long countByVenture_IdAndStatusIgnoreCase(Long ventureId, String status);

    long countByVenture_IdAndStatusIn(Long ventureId, List<String> statuses);

    long countByVenture_Id(Long ventureId);
}
