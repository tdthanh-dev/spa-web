package com.htttql.crmmodule.core.service;

import com.htttql.crmmodule.common.enums.PermissionScope;
import com.htttql.crmmodule.common.enums.PermissionType;
import com.htttql.crmmodule.core.dto.FieldPermissionDTO;
import com.htttql.crmmodule.core.dto.FieldPermissionSummaryDTO;
import com.htttql.crmmodule.core.dto.GrantFieldPermissionRequest;
import com.htttql.crmmodule.core.dto.GrantPermissionRequest;
import com.htttql.crmmodule.core.dto.PermissionDTO;
import com.htttql.crmmodule.core.dto.PermissionRequest;
import com.htttql.crmmodule.core.dto.StaffPermissionSummaryDTO;
import com.htttql.crmmodule.core.dto.UserPermissionDTO;
import com.htttql.crmmodule.core.entity.*;
import com.htttql.crmmodule.core.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Implementation of PermissionService for managing user permissions
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements IPermissionService {

    private final IPermissionRepository permissionRepository;
    private final IUserPermissionRepository userPermissionRepository;
    private final IFieldPermissionRepository fieldPermissionRepository;
    private final IStaffUserRepository staffUserRepository;
    private final ICustomerRepository customerRepository;
    private final PermissionMapperService permissionMapperService;

    @Override
    @Transactional
    public Permission createPermission(Permission permission) {
        if (permissionRepository.findByCode(permission.getCode()).isPresent()) {
            throw new RuntimeException("Permission with code " + permission.getCode() + " already exists");
        }
        return permissionRepository.save(permission);
    }

    @Override
    @Transactional
    public Permission updatePermission(Long permissionId, Permission permission) {
        Permission existing = getPermissionById(permissionId);
        existing.setName(permission.getName());
        existing.setDescription(permission.getDescription());
        existing.setResourceType(permission.getResourceType());
        existing.setAction(permission.getAction());
        return permissionRepository.save(existing);
    }

    @Override
    @Transactional
    public void deletePermission(Long permissionId) {
        Permission permission = getPermissionById(permissionId);
        if (permission.getIsSystemPermission()) {
            throw new RuntimeException("Cannot delete system permission");
        }
        permissionRepository.delete(permission);
    }

    @Override
    @Transactional(readOnly = true)
    public Permission getPermissionById(Long permissionId) {
        return permissionRepository.findById(permissionId)
                .orElseThrow(() -> new RuntimeException("Permission not found with id: " + permissionId));
    }

    @Override
    @Transactional(readOnly = true)
    public Permission getPermissionByCode(String code) {
        return permissionRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Permission not found with code: " + code));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Permission> getPermissionsByType(PermissionType permissionType) {
        return permissionRepository.findByPermissionType(permissionType);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Permission> getPermissionsByResourceType(String resourceType) {
        return permissionRepository.findByResourceType(resourceType);
    }

    @Override
    @Transactional
    public UserPermission grantPermission(Long staffId, Long permissionId, Long customerId,
            Long grantedByStaffId, LocalDateTime expiresAt, String notes) {
        StaffUser staffUser = staffUserRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff user not found: " + staffId));
        Permission permission = getPermissionById(permissionId);
        Customer customer = null;
        if (customerId != null) {
            customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found: " + customerId));
        }

        // Check if permission already exists
        Optional<UserPermission> existing = userPermissionRepository
                .findByStaffUserAndPermissionAndCustomerId(staffUser, permission, customerId);

        if (existing.isPresent()) {
            UserPermission userPermission = existing.get();
            userPermission.setIsActive(true);
            userPermission.setExpiresAt(expiresAt);
            userPermission.setGrantedByStaffId(grantedByStaffId);
            userPermission.setGrantedAt(LocalDateTime.now());
            userPermission.setNotes(notes);
            return userPermissionRepository.save(userPermission);
        }

        UserPermission userPermission = UserPermission.builder()
                .staffUser(staffUser)
                .permission(permission)
                .customer(customer)
                .isActive(true)
                .grantedByStaffId(grantedByStaffId)
                .grantedAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .notes(notes)
                .build();

        return userPermissionRepository.save(userPermission);
    }

    @Override
    @Transactional
    public UserPermission grantPermission(Long staffId, Long permissionId, Long grantedByStaffId) {
        return grantPermission(staffId, permissionId, null, grantedByStaffId, null, null);
    }

    @Override
    @Transactional
    public void revokePermission(Long userPermissionId) {
        UserPermission userPermission = userPermissionRepository.findById(userPermissionId)
                .orElseThrow(() -> new RuntimeException("User permission not found: " + userPermissionId));
        userPermission.setIsActive(false);
        userPermissionRepository.save(userPermission);
    }

    @Override
    @Transactional
    public void revokeAllPermissionsForStaff(Long staffId) {
        List<UserPermission> permissions = userPermissionRepository
                .findActivePermissionsByStaffId(staffId);
        permissions.forEach(p -> p.setIsActive(false));
        userPermissionRepository.saveAll(permissions);
    }

    @Override
    @Transactional
    public void revokePermissionForStaffAndCustomer(Long staffId, Long customerId) {
        List<UserPermission> permissions = userPermissionRepository
                .findActivePermissionsByStaffId(staffId);
        permissions.stream()
                .filter(p -> p.getCustomer() != null && p.getCustomer().getCustomerId().equals(customerId))
                .forEach(p -> p.setIsActive(false));
        userPermissionRepository.saveAll(permissions);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserPermission> getPermissionsForStaff(Long staffId) {
        StaffUser staffUser = staffUserRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff user not found: " + staffId));
        return userPermissionRepository.findByStaffUser(staffUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserPermission> getActivePermissionsForStaff(Long staffId) {
        return userPermissionRepository.findActivePermissionsByStaffId(staffId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserPermission> getPermissionsForStaffAndResource(Long staffId, String resourceType) {
        return userPermissionRepository.findActivePermissionsByStaffIdAndResourceType(staffId, resourceType);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasPermission(Long staffId, String resourceType, String action, Long customerId) {
        return userPermissionRepository.hasPermission(staffId, resourceType, action, customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasPermission(Long staffId, String resourceType, String action) {
        return userPermissionRepository.hasPermission(staffId, resourceType, action, null);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canViewCustomerBasic(Long staffId, Long customerId) {
        return hasPermission(staffId, "CUSTOMER", "READ_BASIC", customerId) ||
                hasPermission(staffId, "CUSTOMER", "READ", customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canViewCustomerDetails(Long staffId, Long customerId) {
        return hasPermission(staffId, "CUSTOMER", "READ_DETAILS", customerId) ||
                hasPermission(staffId, "CUSTOMER", "READ", customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canManageCustomer(Long staffId, Long customerId) {
        return hasPermission(staffId, "CUSTOMER", "WRITE", customerId) ||
                hasPermission(staffId, "CUSTOMER", "UPDATE", customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canManageAppointments(Long staffId, Long customerId) {
        return hasPermission(staffId, "APPOINTMENT", "WRITE", customerId) ||
                hasPermission(staffId, "APPOINTMENT", "MANAGE", customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canManageInvoices(Long staffId, Long customerId) {
        return hasPermission(staffId, "INVOICE", "WRITE", customerId) ||
                hasPermission(staffId, "INVOICE", "MANAGE", customerId);
    }

    @Override
    @Transactional
    public void grantPermissionsToStaff(Long staffId, List<Long> permissionIds, Long grantedByStaffId) {
        for (Long permissionId : permissionIds) {
            grantPermission(staffId, permissionId, grantedByStaffId);
        }
    }

    @Override
    @Transactional
    public void grantCustomerSpecificPermissions(Long staffId, List<Long> customerIds,
            List<Long> permissionIds, Long grantedByStaffId) {
        for (Long customerId : customerIds) {
            for (Long permissionId : permissionIds) {
                grantPermission(staffId, permissionId, customerId, grantedByStaffId, null, null);
            }
        }
    }

    @Override
    @Transactional
    public void initializeSystemPermissions() {
        // Create basic customer permissions
        createSystemPermission("VIEW_CUSTOMER_BASIC", "Xem thông tin cơ bản khách hàng",
                PermissionType.VIEW_CUSTOMER_BASIC, "CUSTOMER", "READ_BASIC");
        createSystemPermission("VIEW_CUSTOMER_DETAILS", "Xem thông tin chi tiết khách hàng",
                PermissionType.VIEW_CUSTOMER_DETAILS, "CUSTOMER", "READ_DETAILS");
        createSystemPermission("VIEW_CUSTOMER_FINANCIAL", "Xem thông tin tài chính khách hàng",
                PermissionType.VIEW_CUSTOMER_FINANCIAL, "CUSTOMER", "READ_FINANCIAL");
        createSystemPermission("VIEW_CUSTOMER_HISTORY", "Xem lịch sử khách hàng",
                PermissionType.VIEW_CUSTOMER_HISTORY, "CUSTOMER", "READ_HISTORY");

        // Create management permissions
        createSystemPermission("CREATE_CUSTOMER", "Tạo khách hàng mới",
                PermissionType.CREATE_CUSTOMER, "CUSTOMER", "CREATE");
        createSystemPermission("UPDATE_CUSTOMER_BASIC", "Cập nhật thông tin cơ bản",
                PermissionType.UPDATE_CUSTOMER_BASIC, "CUSTOMER", "UPDATE_BASIC");
        createSystemPermission("UPDATE_CUSTOMER_DETAILS", "Cập nhật thông tin chi tiết",
                PermissionType.UPDATE_CUSTOMER_DETAILS, "CUSTOMER", "UPDATE_DETAILS");
        createSystemPermission("DELETE_CUSTOMER", "Xóa khách hàng",
                PermissionType.DELETE_CUSTOMER, "CUSTOMER", "DELETE");

        // Appointment permissions
        createSystemPermission("VIEW_APPOINTMENTS", "Xem lịch hẹn",
                PermissionType.VIEW_APPOINTMENTS, "APPOINTMENT", "READ");
        createSystemPermission("MANAGE_APPOINTMENTS", "Quản lý lịch hẹn",
                PermissionType.MANAGE_APPOINTMENTS, "APPOINTMENT", "MANAGE");

        // Invoice permissions
        createSystemPermission("VIEW_INVOICES", "Xem hóa đơn",
                PermissionType.VIEW_INVOICES, "INVOICE", "READ");
        createSystemPermission("MANAGE_INVOICES", "Quản lý hóa đơn",
                PermissionType.MANAGE_INVOICES, "INVOICE", "MANAGE");

        log.info("System permissions initialized successfully");
    }

    private void createSystemPermission(String code, String name, PermissionType permissionType,
            String resourceType, String action) {
        if (permissionRepository.findByCode(code).isEmpty()) {
            Permission permission = Permission.builder()
                    .code(code)
                    .name(name)
                    .permissionType(permissionType)
                    .resourceType(resourceType)
                    .action(action)
                    .isSystemPermission(true)
                    .description("System permission: " + name)
                    .build();
            permissionRepository.save(permission);
            log.info("Created system permission: {}", code);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Permission> getDefaultPermissionsForRole(String roleCode) {
        switch (roleCode.toUpperCase()) {
            case "MANAGER":
                return permissionRepository.findAll(); // Admin has all permissions
            case "RECEPTIONIST":
                return permissionRepository.findByResourceTypes(
                        List.of("CUSTOMER", "APPOINTMENT", "INVOICE"));
            case "TECHNICIAN":
                return permissionRepository.findByResourceTypes(
                        List.of("CUSTOMER", "APPOINTMENT"));
            default:
                return List.of();
        }
    }

    @Override
    @Transactional
    public void ensureAdminHasAllPermissions(Long adminStaffId) {
        List<Permission> allPermissions = permissionRepository.findAll();
        for (Permission permission : allPermissions) {
            if (userPermissionRepository.findByStaffUserAndPermissionAndCustomerId(
                    staffUserRepository.findById(adminStaffId).orElse(null),
                    permission, null).isEmpty()) {
                grantPermission(adminStaffId, permission.getPermissionId(), adminStaffId);
            }
        }
    }

    // ========== FIELD-LEVEL PERMISSION IMPLEMENTATIONS ==========

    @Override
    @Transactional
    public FieldPermission grantFieldPermission(Long staffId, PermissionScope permissionScope, Long customerId,
            Long grantedByStaffId, LocalDateTime expiresAt, String notes) {
        StaffUser staffUser = staffUserRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff user not found: " + staffId));
        Customer customer = null;
        if (customerId != null) {
            customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Customer not found: " + customerId));
        }

        // Check if permission already exists
        Optional<FieldPermission> existing = fieldPermissionRepository
                .findByStaffUserAndPermissionScopeAndCustomerId(staffUser, permissionScope, customerId);

        if (existing.isPresent()) {
            FieldPermission fieldPermission = existing.get();
            fieldPermission.setIsGranted(true);
            fieldPermission.setExpiresAt(expiresAt);
            fieldPermission.setGrantedByStaffId(grantedByStaffId);
            fieldPermission.setGrantedAt(LocalDateTime.now());
            fieldPermission.setNotes(notes);
            return fieldPermissionRepository.save(fieldPermission);
        }

        FieldPermission fieldPermission = FieldPermission.builder()
                .staffUser(staffUser)
                .permissionScope(permissionScope)
                .customer(customer)
                .isGranted(true)
                .grantedByStaffId(grantedByStaffId)
                .grantedAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .notes(notes)
                .build();

        return fieldPermissionRepository.save(fieldPermission);
    }

    @Override
    @Transactional
    public FieldPermission grantFieldPermission(Long staffId, PermissionScope permissionScope, Long grantedByStaffId) {
        return grantFieldPermission(staffId, permissionScope, null, grantedByStaffId, null, null);
    }

    @Override
    @Transactional
    public void revokeFieldPermission(Long fieldPermissionId) {
        FieldPermission fieldPermission = fieldPermissionRepository.findById(fieldPermissionId)
                .orElseThrow(() -> new RuntimeException("Field permission not found: " + fieldPermissionId));
        fieldPermission.setIsGranted(false);
        fieldPermissionRepository.save(fieldPermission);
    }

    @Override
    @Transactional
    public void revokeFieldPermission(Long staffId, PermissionScope permissionScope, Long customerId) {
        Optional<FieldPermission> fieldPermission = fieldPermissionRepository
                .findByStaffUserAndPermissionScopeAndCustomerId(
                        staffUserRepository.findById(staffId).orElse(null), permissionScope, customerId);
        fieldPermission.ifPresent(fp -> {
            fp.setIsGranted(false);
            fieldPermissionRepository.save(fp);
        });
    }

    @Override
    @Transactional
    public void revokeAllFieldPermissionsForStaff(Long staffId) {
        List<FieldPermission> permissions = fieldPermissionRepository
                .findActiveFieldPermissionsByStaffId(staffId);
        permissions.forEach(p -> p.setIsGranted(false));
        fieldPermissionRepository.saveAll(permissions);
    }

    @Override
    @Transactional
    public void revokeFieldPermissionsForCustomer(Long staffId, Long customerId) {
        List<FieldPermission> permissions = fieldPermissionRepository
                .findByStaffIdAndCustomerId(staffId, customerId);
        permissions.forEach(p -> p.setIsGranted(false));
        fieldPermissionRepository.saveAll(permissions);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FieldPermission> getFieldPermissionsForStaff(Long staffId) {
        StaffUser staffUser = staffUserRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff user not found: " + staffId));
        return fieldPermissionRepository.findByStaffUser(staffUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FieldPermission> getActiveFieldPermissionsForStaff(Long staffId) {
        return fieldPermissionRepository.findActiveFieldPermissionsByStaffId(staffId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FieldPermission> getFieldPermissionsForStaffAndCustomer(Long staffId, Long customerId) {
        return fieldPermissionRepository.findByStaffIdAndCustomerId(staffId, customerId);
    }

    // ========== FIELD-LEVEL PERMISSION CHECKING ==========

    @Override
    @Transactional(readOnly = true)
    public boolean canReadCustomerField(Long staffId, String fieldName, Long customerId) {
        PermissionScope scope = getPermissionScopeForFieldRead(fieldName);
        if (scope == null)
            return false;
        return fieldPermissionRepository.hasFieldPermission(staffId, scope, customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canWriteCustomerField(Long staffId, String fieldName, Long customerId) {
        PermissionScope scope = getPermissionScopeForFieldWrite(fieldName);
        if (scope == null)
            return false;
        return fieldPermissionRepository.hasFieldPermission(staffId, scope, customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canReadCustomerName(Long staffId, Long customerId) {
        return fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.CUSTOMER_NAME_READ, customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canWriteCustomerName(Long staffId, Long customerId) {
        return fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.CUSTOMER_NAME_WRITE, customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canReadCustomerPhone(Long staffId, Long customerId) {
        return fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.CUSTOMER_PHONE_READ, customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canWriteCustomerPhone(Long staffId, Long customerId) {
        return fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.CUSTOMER_PHONE_WRITE, customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canReadCustomerEmail(Long staffId, Long customerId) {
        return fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.CUSTOMER_EMAIL_READ, customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canWriteCustomerEmail(Long staffId, Long customerId) {
        return fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.CUSTOMER_EMAIL_WRITE, customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canReadCustomerAddress(Long staffId, Long customerId) {
        return fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.CUSTOMER_ADDRESS_READ, customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canWriteCustomerAddress(Long staffId, Long customerId) {
        return fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.CUSTOMER_ADDRESS_WRITE,
                customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canReadCustomerDOB(Long staffId, Long customerId) {
        return fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.CUSTOMER_DOB_READ, customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canWriteCustomerDOB(Long staffId, Long customerId) {
        return fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.CUSTOMER_DOB_WRITE, customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canReadCustomerNotes(Long staffId, Long customerId) {
        return fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.CUSTOMER_NOTES_READ, customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canWriteCustomerNotes(Long staffId, Long customerId) {
        return fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.CUSTOMER_NOTES_WRITE, customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canViewCustomerFinancial(Long staffId, Long customerId) {
        return fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.CUSTOMER_TOTAL_SPENT_READ,
                customerId) ||
                fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.CUSTOMER_TOTAL_POINTS_READ,
                        customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canManageCustomerAppointments(Long staffId, Long customerId) {
        return fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.APPOINTMENT_VIEW, customerId) ||
                fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.APPOINTMENT_CREATE, customerId) ||
                fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.APPOINTMENT_UPDATE, customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canManageCustomerInvoices(Long staffId, Long customerId) {
        return fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.INVOICE_VIEW, customerId) ||
                fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.INVOICE_CREATE, customerId) ||
                fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.INVOICE_UPDATE, customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canViewCustomerHistory(Long staffId, Long customerId) {
        return fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.HISTORY_VIEW, customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canExportCustomerData(Long staffId, Long customerId) {
        return fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.HISTORY_EXPORT, customerId) ||
                fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.BULK_EXPORT, customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canDeleteCustomer(Long staffId, Long customerId) {
        return fieldPermissionRepository.hasFieldPermission(staffId, PermissionScope.CUSTOMER_DELETE, customerId);
    }

    // ========== BULK FIELD PERMISSION OPERATIONS ==========

    @Override
    @Transactional
    public void grantFieldPermissionsToStaff(Long staffId, List<PermissionScope> permissionScopes,
            Long grantedByStaffId) {
        for (PermissionScope scope : permissionScopes) {
            grantFieldPermission(staffId, scope, grantedByStaffId);
        }
    }

    @Override
    @Transactional
    public void grantCustomerFieldPermissions(Long staffId, Long customerId, List<PermissionScope> permissionScopes,
            Long grantedByStaffId) {
        for (PermissionScope scope : permissionScopes) {
            grantFieldPermission(staffId, scope, customerId, grantedByStaffId, null, null);
        }
    }

    @Override
    @Transactional
    public void grantFieldPermissionsToMultipleCustomers(Long staffId, List<Long> customerIds,
            List<PermissionScope> permissionScopes, Long grantedByStaffId) {
        for (Long customerId : customerIds) {
            for (PermissionScope scope : permissionScopes) {
                grantFieldPermission(staffId, scope, customerId, grantedByStaffId, null, null);
            }
        }
    }

    // ========== FIELD PERMISSION UTILITIES ==========

    @Override
    @Transactional(readOnly = true)
    public List<PermissionScope> getAllGrantedScopesForStaff(Long staffId) {
        return fieldPermissionRepository.findGrantedScopesByStaffId(staffId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getReadableFieldsForCustomer(Long staffId, Long customerId) {
        List<PermissionScope> scopes = fieldPermissionRepository.findGrantedScopesByStaffId(staffId);
        return scopes.stream()
                .filter(scope -> scope.name().endsWith("_READ"))
                .filter(scope -> fieldPermissionRepository.hasFieldPermission(staffId, scope, customerId))
                .map(this::getFieldNameFromScope)
                .distinct()
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getWritableFieldsForCustomer(Long staffId, Long customerId) {
        List<PermissionScope> scopes = fieldPermissionRepository.findGrantedScopesByStaffId(staffId);
        return scopes.stream()
                .filter(scope -> scope.name().endsWith("_WRITE"))
                .filter(scope -> fieldPermissionRepository.hasFieldPermission(staffId, scope, customerId))
                .map(this::getFieldNameFromScope)
                .distinct()
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasAnyFieldPermissionForCustomer(Long staffId, Long customerId) {
        List<FieldPermission> permissions = fieldPermissionRepository.findActiveFieldPermissionsByStaffId(staffId);
        return permissions.stream().anyMatch(fp -> fp.appliesToCustomer(customerId));
    }

    // ========== HELPER METHODS ==========

    private PermissionScope getPermissionScopeForFieldRead(String fieldName) {
        switch (fieldName.toLowerCase()) {
            case "name":
                return PermissionScope.CUSTOMER_NAME_READ;
            case "phone":
                return PermissionScope.CUSTOMER_PHONE_READ;
            case "email":
                return PermissionScope.CUSTOMER_EMAIL_READ;
            case "address":
                return PermissionScope.CUSTOMER_ADDRESS_READ;
            case "dob":
                return PermissionScope.CUSTOMER_DOB_READ;
            case "notes":
                return PermissionScope.CUSTOMER_NOTES_READ;
            case "gender":
                return PermissionScope.CUSTOMER_GENDER_READ;
            default:
                return null;
        }
    }

    private PermissionScope getPermissionScopeForFieldWrite(String fieldName) {
        switch (fieldName.toLowerCase()) {
            case "name":
                return PermissionScope.CUSTOMER_NAME_WRITE;
            case "phone":
                return PermissionScope.CUSTOMER_PHONE_WRITE;
            case "email":
                return PermissionScope.CUSTOMER_EMAIL_WRITE;
            case "address":
                return PermissionScope.CUSTOMER_ADDRESS_WRITE;
            case "dob":
                return PermissionScope.CUSTOMER_DOB_WRITE;
            case "notes":
                return PermissionScope.CUSTOMER_NOTES_WRITE;
            case "gender":
                return PermissionScope.CUSTOMER_GENDER_WRITE;
            default:
                return null;
        }
    }

    private String getFieldNameFromScope(PermissionScope scope) {
        String scopeName = scope.name().toLowerCase();
        if (scopeName.startsWith("customer_")) {
            return scopeName.replace("customer_", "").replace("_read", "").replace("_write", "");
        }
        return scopeName;
    }

    // ========== FIELD PERMISSION INITIALIZATION ==========

    @Override
    @Transactional
    public void initializeDefaultFieldPermissions() {
        // This method can be used to create default field permissions for roles
        log.info("Default field permissions initialization completed");
    }

    @Override
    @Transactional
    public void ensureAdminHasAllFieldPermissions(Long adminStaffId) {
        // Grant all field permissions to admin
        for (PermissionScope scope : PermissionScope.values()) {
            if (fieldPermissionRepository.findByStaffUserAndPermissionScopeAndCustomerId(
                    staffUserRepository.findById(adminStaffId).orElse(null), scope, null).isEmpty()) {
                grantFieldPermission(adminStaffId, scope, adminStaffId);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public FieldPermissionSummaryDTO createFieldPermissionSummary(Long staffId, Long customerId) {
        FieldPermissionSummaryDTO summary = FieldPermissionSummaryDTO.builder()
                .staffId(staffId)
                .customerId(customerId)
                // Customer field permissions
                .canReadName(canReadCustomerName(staffId, customerId))
                .canWriteName(canWriteCustomerName(staffId, customerId))
                .canReadPhone(canReadCustomerPhone(staffId, customerId))
                .canWritePhone(canWriteCustomerPhone(staffId, customerId))
                .canReadEmail(canReadCustomerEmail(staffId, customerId))
                .canWriteEmail(canWriteCustomerEmail(staffId, customerId))
                .canReadAddress(canReadCustomerAddress(staffId, customerId))
                .canWriteAddress(canWriteCustomerAddress(staffId, customerId))
                .canReadDOB(canReadCustomerDOB(staffId, customerId))
                .canWriteDOB(canWriteCustomerDOB(staffId, customerId))
                .canReadNotes(canReadCustomerNotes(staffId, customerId))
                .canWriteNotes(canWriteCustomerNotes(staffId, customerId))
                // Financial permissions
                .canReadTotalSpent(canViewCustomerFinancial(staffId, customerId))
                // Action permissions
                .canViewAppointments(canManageCustomerAppointments(staffId, customerId))
                .canViewInvoices(canManageCustomerInvoices(staffId, customerId))
                .canViewHistory(canViewCustomerHistory(staffId, customerId))
                .canExportData(canExportCustomerData(staffId, customerId))
                .canDeleteCustomer(canDeleteCustomer(staffId, customerId))
                .build();

        // Calculate computed fields
        summary.setReadableFields(getReadableFieldsForCustomer(staffId, customerId));
        summary.setWritableFields(getWritableFieldsForCustomer(staffId, customerId));
        summary.setReadableFieldsCount(summary.getReadableFields().size());
        summary.setWritableFieldsCount(summary.getWritableFields().size());
        summary.setTotalPermissions(summary.getReadableFieldsCount() + summary.getWritableFieldsCount());
        summary.calculatePermissionLevel();

        return summary;
    }

    @Override
    @Transactional(readOnly = true)
    public StaffPermissionSummaryDTO createStaffPermissionSummary(Long staffId, Long customerId) {
        boolean canViewCustomerBasic = canViewCustomerBasic(staffId, customerId);
        boolean canViewCustomerDetails = canViewCustomerDetails(staffId, customerId);
        boolean canViewCustomerFinancial = canViewCustomerFinancial(staffId, customerId);
        boolean canViewCustomerHistory = canViewCustomerHistory(staffId, customerId);
        boolean canManageCustomer = canManageCustomer(staffId, customerId);
        boolean canManageAppointments = canManageAppointments(staffId, customerId);
        boolean canManageInvoices = canManageInvoices(staffId, customerId);

        return StaffPermissionSummaryDTO.builder()
                .staffId(staffId)
                .customerId(customerId)
                .canReadName(canViewCustomerBasic)
                .canReadPhone(canViewCustomerDetails)
                .canReadTotalSpent(canViewCustomerFinancial)
                .canReadTotalPoints(canViewCustomerFinancial)
                .canViewHistory(canViewCustomerHistory)
                .canWriteName(canManageCustomer)
                .canWritePhone(canManageCustomer)
                .canViewAppointments(canManageAppointments)
                .canCreateAppointments(canManageAppointments)
                .canViewInvoices(canManageInvoices)
                .canCreateInvoices(canManageInvoices)
                .build();
    }

    @Override
    @Transactional
    public PermissionDTO createPermission(PermissionRequest request) {
        Permission permission = Permission.builder()
                .code(request.getCode().toUpperCase())
                .name(request.getName())
                .permissionType(request.getPermissionType())
                .description(request.getDescription())
                .resourceType(request.getResourceType())
                .action(request.getAction())
                .isSystemPermission(false)
                .build();

        Permission savedPermission = createPermission(permission);
        return permissionMapperService.mapToPermissionDTO(savedPermission);
    }

    @Override
    @Transactional
    public PermissionDTO updatePermission(Long permissionId, PermissionRequest request) {
        // Build permission entity from request
        Permission permission = Permission.builder()
                .name(request.getName())
                .permissionType(request.getPermissionType())
                .description(request.getDescription())
                .resourceType(request.getResourceType())
                .action(request.getAction())
                .build();

        // Update permission using existing method
        Permission existing = getPermissionById(permissionId);
        existing.setName(permission.getName());
        existing.setDescription(permission.getDescription());
        existing.setResourceType(permission.getResourceType());
        existing.setAction(permission.getAction());
        Permission updatedPermission = permissionRepository.save(existing);

        // Convert to DTO using mapper service
        return permissionMapperService.mapToPermissionDTO(updatedPermission);
    }

    @Override
    @Transactional
    public List<UserPermissionDTO> grantPermissionsWithLogic(GrantPermissionRequest request) {
        List<UserPermission> userPermissions;

        if (request.getCustomerIds() != null && !request.getCustomerIds().isEmpty()) {
            // Grant customer-specific permissions
            grantCustomerSpecificPermissions(
                    request.getStaffId(),
                    request.getCustomerIds(),
                    request.getPermissionIds(),
                    1L // TODO: Get from security context
            );
            userPermissions = getPermissionsForStaff(request.getStaffId());
        } else {
            // Grant general permissions
            grantPermissionsToStaff(
                    request.getStaffId(),
                    request.getPermissionIds(),
                    1L // TODO: Get from security context
            );
            userPermissions = getPermissionsForStaff(request.getStaffId());
        }

        return permissionMapperService.mapToUserPermissionDTOs(userPermissions);
    }

    @Override
    @Transactional
    public List<FieldPermissionDTO> grantFieldPermissionsWithLogic(GrantFieldPermissionRequest request) {
        List<FieldPermission> fieldPermissions;

        if (request.getCustomerIds() != null && !request.getCustomerIds().isEmpty()) {
            // Grant customer-specific field permissions
            grantFieldPermissionsToMultipleCustomers(
                    request.getStaffId(),
                    request.getCustomerIds(),
                    request.getPermissionScopes(),
                    1L // TODO: Get from security context
            );
            fieldPermissions = getFieldPermissionsForStaff(request.getStaffId());
        } else {
            // Grant general field permissions
            grantFieldPermissionsToStaff(
                    request.getStaffId(),
                    request.getPermissionScopes(),
                    1L // TODO: Get from security context
            );
            fieldPermissions = getFieldPermissionsForStaff(request.getStaffId());
        }

        return permissionMapperService.mapToFieldPermissionDTOs(fieldPermissions);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Map<String, Boolean> createFieldPermissionMap(Long staffId, String fieldName, Long customerId) {
        boolean canRead = canReadCustomerField(staffId, fieldName, customerId);
        boolean canWrite = canWriteCustomerField(staffId, fieldName, customerId);

        java.util.Map<String, Boolean> result = new java.util.HashMap<>();
        result.put("canRead", canRead);
        result.put("canWrite", canWrite);
        result.put("hasAnyPermission", canRead || canWrite);

        return result;
    }
}
