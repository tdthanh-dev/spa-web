package com.htttql.crmmodule.core.repository;

import com.htttql.crmmodule.common.enums.PermissionScope;
import com.htttql.crmmodule.core.entity.FieldPermission;
import com.htttql.crmmodule.core.entity.StaffUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for FieldPermission entity
 */
@Repository
public interface IFieldPermissionRepository extends JpaRepository<FieldPermission, Long> {

    List<FieldPermission> findByStaffUser(StaffUser staffUser);

    List<FieldPermission> findByStaffUserAndIsGranted(StaffUser staffUser, Boolean isGranted);

    List<FieldPermission> findByPermissionScope(PermissionScope permissionScope);

    List<FieldPermission> findByStaffUserAndPermissionScope(StaffUser staffUser, PermissionScope permissionScope);

    @Query("SELECT fp FROM FieldPermission fp WHERE fp.staffUser = :staffUser " +
            "AND fp.permissionScope = :permissionScope AND (fp.customer.customerId = :customerId OR :customerId IS NULL)")
    Optional<FieldPermission> findByStaffUserAndPermissionScopeAndCustomerId(@Param("staffUser") StaffUser staffUser,
            @Param("permissionScope") PermissionScope permissionScope,
            @Param("customerId") Long customerId);

    @Query("SELECT fp FROM FieldPermission fp WHERE fp.staffUser.staffId = :staffId " +
            "AND fp.isGranted = true AND (fp.expiresAt IS NULL OR fp.expiresAt > CURRENT_TIMESTAMP)")
    List<FieldPermission> findActiveFieldPermissionsByStaffId(@Param("staffId") Long staffId);

    @Query("SELECT fp FROM FieldPermission fp WHERE fp.staffUser.staffId = :staffId " +
            "AND fp.permissionScope = :permissionScope AND fp.isGranted = true " +
            "AND (fp.expiresAt IS NULL OR fp.expiresAt > CURRENT_TIMESTAMP) " +
            "AND (fp.customer IS NULL OR fp.customer.customerId = :customerId)")
    List<FieldPermission> findFieldPermissionsForScope(@Param("staffId") Long staffId,
            @Param("permissionScope") PermissionScope permissionScope,
            @Param("customerId") Long customerId);

    @Query("SELECT COUNT(fp) > 0 FROM FieldPermission fp WHERE fp.staffUser.staffId = :staffId " +
            "AND fp.permissionScope = :permissionScope AND fp.isGranted = true " +
            "AND (fp.expiresAt IS NULL OR fp.expiresAt > CURRENT_TIMESTAMP) " +
            "AND (fp.customer IS NULL OR fp.customer.customerId = :customerId)")
    boolean hasFieldPermission(@Param("staffId") Long staffId,
            @Param("permissionScope") PermissionScope permissionScope,
            @Param("customerId") Long customerId);

    @Query("SELECT fp FROM FieldPermission fp WHERE fp.staffUser.staffId = :staffId " +
            "AND fp.permissionScope IN :permissionScopes AND fp.isGranted = true " +
            "AND (fp.expiresAt IS NULL OR fp.expiresAt > CURRENT_TIMESTAMP)")
    List<FieldPermission> findPermissionsByScopes(@Param("staffId") Long staffId,
            @Param("permissionScopes") List<PermissionScope> permissionScopes);

    @Query("SELECT DISTINCT fp.permissionScope FROM FieldPermission fp WHERE fp.staffUser.staffId = :staffId " +
            "AND fp.isGranted = true AND (fp.expiresAt IS NULL OR fp.expiresAt > CURRENT_TIMESTAMP)")
    List<PermissionScope> findGrantedScopesByStaffId(@Param("staffId") Long staffId);

    List<FieldPermission> findByGrantedByStaffId(Long grantedByStaffId);

    // Find permissions for a specific customer
    @Query("SELECT fp FROM FieldPermission fp WHERE fp.customer.customerId = :customerId")
    List<FieldPermission> findByCustomerId(@Param("customerId") Long customerId);

    // Bulk operations
    @Query("SELECT fp FROM FieldPermission fp WHERE fp.staffUser.staffId = :staffId AND fp.customer.customerId = :customerId")
    List<FieldPermission> findByStaffIdAndCustomerId(@Param("staffId") Long staffId,
            @Param("customerId") Long customerId);
}
