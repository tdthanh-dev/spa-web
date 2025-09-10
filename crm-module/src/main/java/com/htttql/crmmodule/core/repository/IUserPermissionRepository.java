package com.htttql.crmmodule.core.repository;

import com.htttql.crmmodule.core.entity.Permission;
import com.htttql.crmmodule.core.entity.StaffUser;
import com.htttql.crmmodule.core.entity.UserPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for UserPermission entity
 */
@Repository
public interface IUserPermissionRepository extends JpaRepository<UserPermission, Long> {

    List<UserPermission> findByStaffUser(StaffUser staffUser);

    List<UserPermission> findByStaffUserAndIsActive(StaffUser staffUser, Boolean isActive);

    List<UserPermission> findByPermission(Permission permission);

    List<UserPermission> findByStaffUserAndPermission(StaffUser staffUser, Permission permission);

    @Query("SELECT up FROM UserPermission up WHERE up.staffUser = :staffUser " +
            "AND up.permission = :permission AND (up.customer.customerId = :customerId OR :customerId IS NULL)")
    Optional<UserPermission> findByStaffUserAndPermissionAndCustomerId(@Param("staffUser") StaffUser staffUser,
            @Param("permission") Permission permission,
            @Param("customerId") Long customerId);

    @Query("SELECT up FROM UserPermission up WHERE up.staffUser.staffId = :staffId " +
            "AND up.isActive = true AND (up.expiresAt IS NULL OR up.expiresAt > CURRENT_TIMESTAMP)")
    List<UserPermission> findActivePermissionsByStaffId(@Param("staffId") Long staffId);

    @Query("SELECT up FROM UserPermission up WHERE up.staffUser.staffId = :staffId " +
            "AND up.permission.resourceType = :resourceType AND up.isActive = true " +
            "AND (up.expiresAt IS NULL OR up.expiresAt > CURRENT_TIMESTAMP)")
    List<UserPermission> findActivePermissionsByStaffIdAndResourceType(@Param("staffId") Long staffId,
            @Param("resourceType") String resourceType);

    @Query("SELECT up FROM UserPermission up WHERE up.staffUser.staffId = :staffId " +
            "AND up.permission.resourceType = :resourceType AND up.permission.action = :action " +
            "AND up.isActive = true AND (up.expiresAt IS NULL OR up.expiresAt > CURRENT_TIMESTAMP) " +
            "AND (up.customer IS NULL OR up.customer.customerId = :customerId)")
    List<UserPermission> findPermissionsForResourceAction(@Param("staffId") Long staffId,
            @Param("resourceType") String resourceType,
            @Param("action") String action,
            @Param("customerId") Long customerId);

    @Query("SELECT COUNT(up) > 0 FROM UserPermission up WHERE up.staffUser.staffId = :staffId " +
            "AND up.permission.resourceType = :resourceType AND up.permission.action = :action " +
            "AND up.isActive = true AND (up.expiresAt IS NULL OR up.expiresAt > CURRENT_TIMESTAMP) " +
            "AND (up.customer IS NULL OR up.customer.customerId = :customerId)")
    boolean hasPermission(@Param("staffId") Long staffId,
            @Param("resourceType") String resourceType,
            @Param("action") String action,
            @Param("customerId") Long customerId);

    List<UserPermission> findByGrantedByStaffId(Long grantedByStaffId);
}
