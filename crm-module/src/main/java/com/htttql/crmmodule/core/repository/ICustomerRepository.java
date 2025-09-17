package com.htttql.crmmodule.core.repository;

import com.htttql.crmmodule.core.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ICustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByPhone(String phone);

    Optional<Customer> findByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);

    @Query("SELECT c FROM Customer c WHERE " +
            "(:search IS NULL OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR c.phone LIKE CONCAT('%', :search, '%') " +
            "OR LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    java.util.List<Customer> searchCustomers(@Param("search") String search);

    /**
     * Count customers created on specific date
     */
    @Query("SELECT COUNT(c) FROM Customer c WHERE DATE(c.createdAt) = :date")
    long countByCreatedDate(@Param("date") LocalDate date);

    /**
     * Count customers created within date range
     */
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.createdAt BETWEEN :start AND :end")
    long countByCreatedDateBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Count customers by tier code
     */
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.tier.code = :tierCode")
    long countByTierCode(@Param("tierCode") String tierCode);

    /**
     * Count customers without tier
     */
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.tier IS NULL")
    long countByTierIsNull();
}
