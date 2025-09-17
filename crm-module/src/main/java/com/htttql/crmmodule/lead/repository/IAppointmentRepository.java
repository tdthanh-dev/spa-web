package com.htttql.crmmodule.lead.repository;

import com.htttql.crmmodule.lead.entity.Appointment;
import com.htttql.crmmodule.common.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for Appointment entity
 */
@Repository
public interface IAppointmentRepository extends JpaRepository<Appointment, Long> {

    /**
     * Find appointments by customer ID
     */
    List<Appointment> findByCustomer_CustomerId(Long customerId);

    /**
     * Find appointments by status
     */
    List<Appointment> findByStatus(AppointmentStatus status);

    /**
     * Find appointments by service ID
     */
    List<Appointment> findByService_ServiceId(Long serviceId);

    /**
     * Find appointments for today
     */
    Page<Appointment> findByStartAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    /**
     * Count appointments by date range
     */
    @Query("SELECT COUNT(a) FROM Appointment a WHERE DATE(a.startAt) = :date")
    long countByDate(@Param("date") LocalDate date);

    /**
     * Count appointments by date range and status
     */
    @Query("SELECT COUNT(a) FROM Appointment a WHERE DATE(a.startAt) = :date AND a.status = :status")
    long countByDateAndStatus(@Param("date") LocalDate date, @Param("status") AppointmentStatus status);

    /**
     * Count appointments by date range
     */
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.startAt BETWEEN :start AND :end")
    long countByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Count appointments by status
     */
    long countByStatus(AppointmentStatus status);

    /**
     * Count customers with multiple appointments (returning customers)
     */
    @Query("SELECT COUNT(DISTINCT a.customer) FROM Appointment a WHERE " +
           "(SELECT COUNT(a2) FROM Appointment a2 WHERE a2.customer = a.customer) > 1")
    long countReturningCustomers();

    /**
     * Count active customers within date range
     */
    @Query("SELECT COUNT(DISTINCT a.customer) FROM Appointment a WHERE a.startAt BETWEEN :start AND :end")
    long countActiveCustomersInDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * Count appointments by service ID
     */
    long countByService_ServiceId(Long serviceId);

    /**
     * Count appointments by date range and status
     */
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.startAt BETWEEN :start AND :end AND a.status = :status")
    long countByDateRangeAndStatus(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end, @Param("status") AppointmentStatus status);
}
