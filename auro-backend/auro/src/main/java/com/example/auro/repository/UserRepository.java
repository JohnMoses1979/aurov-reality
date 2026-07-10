package com.example.auro.repository;

import com.example.auro.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserAccount, Long> {

    Optional<UserAccount> findByUsername(String username);

    Optional<UserAccount> findByEmail(String email);

    Optional<UserAccount> findByMobile(String mobile);

    @Query("""
        select u from UserAccount u
        where lower(u.email) = lower(:identifier)
           or lower(u.username) = lower(:identifier)
           or lower(u.employeeId) = lower(:identifier)
           or u.mobile = :identifier
    """)
    Optional<UserAccount> findByLoginIdentifier(@Param("identifier") String identifier);

    boolean existsByUsername(String username);

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmployeeIdIgnoreCase(String employeeId);

    boolean existsByMobile(String mobile);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    boolean existsByUsernameIgnoreCaseAndIdNot(String username, Long id);

    boolean existsByEmployeeIdIgnoreCaseAndIdNot(String employeeId, Long id);

    boolean existsByMobileAndIdNot(String mobile, Long id);

    List<UserAccount> findAllByOrderByCreatedAtDesc();

    List<UserAccount> findByDepartmentOrderByCreatedAtDesc(String department);

    List<UserAccount> findByRoleIgnoreCaseAndActiveTrue(String role);
}
