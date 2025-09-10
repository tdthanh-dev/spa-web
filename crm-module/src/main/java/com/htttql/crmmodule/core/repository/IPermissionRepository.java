package com.htttql.crmmodule.core.repository;

import com.htttql.crmmodule.core.entity.Permission;
import com.htttql.crmmodule.common.enums.PermissionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Permission entity
 */
@Repository
public interface IPermissionRepository extends JpaRepository<Permission, Long> {

    Optional<Permission> findByCode(String code);

    List<Permission> findByPermissionType(PermissionType permissionType);

    List<Permission> findByResourceType(String resourceType);

    @Query("SELECT p FROM Permission p WHERE p.resourceType = :resourceType AND p.action = :action")
    Optional<Permission> findByResourceTypeAndAction(@Param("resourceType") String resourceType,
            @Param("action") String action);

    List<Permission> findByIsSystemPermission(Boolean isSystemPermission);

    @Query("SELECT p FROM Permission p WHERE p.resourceType IN :resourceTypes")
    List<Permission> findByResourceTypes(@Param("resourceTypes") List<String> resourceTypes);
}
