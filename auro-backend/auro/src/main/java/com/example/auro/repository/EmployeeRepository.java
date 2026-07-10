package com.example.auro.repository;

import com.example.auro.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByUsernameIgnoreCase(String username);

    Optional<Employee> findByEmailIgnoreCase(String email);

    Optional<Employee> findByMobileNumber(String mobileNumber);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByUsername(String username);

    boolean existsByUsernameIgnoreCase(String username);

    Optional<Employee> findByUsername(String username);

    List<Employee> findByDepartmentIgnoreCase(String department);

    List<Employee> findByDepartmentIgnoreCaseAndRoleContainingIgnoreCase(
            String department,
            String roleKeyword
    );

    List<Employee> findByDepartmentAndStatusNotOrderByNameAsc(String department, String status);

    @Query("""
        select e from Employee e
        where lower(e.email) = lower(:identifier)
           or lower(e.username) = lower(:identifier)
           or e.mobileNumber = :identifier
    """)
    Optional<Employee> findByLoginIdentifier(String identifier);
}
