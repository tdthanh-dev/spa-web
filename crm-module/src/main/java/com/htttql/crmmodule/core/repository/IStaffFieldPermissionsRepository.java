package com.htttql.crmmodule.core.repository;

import com.htttql.crmmodule.core.entity.StaffFieldPermissionsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for StaffFieldPermissionsEntity
 */
@Repository
public interface IStaffFieldPermissionsRepository extends JpaRepository<StaffFieldPermissionsEntity, Long> {

    /**
     * Find permissions by staff ID
     */
    Optional<StaffFieldPermissionsEntity> findByStaffId(Long staffId);

    /**
     * Check if permissions exist for staff ID
     */
    boolean existsByStaffId(Long staffId);
}