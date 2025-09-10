package com.htttql.crmmodule.core.service;

import com.htttql.crmmodule.common.enums.PermissionScope;
import com.htttql.crmmodule.core.dto.*;
import com.htttql.crmmodule.core.entity.FieldPermission;
import com.htttql.crmmodule.core.entity.Permission;
import com.htttql.crmmodule.core.entity.UserPermission;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for mapping permission entities to DTOs
 */
@Slf4j
@Service
public class PermissionMapperService {

    /**
     * Map Permission entity to PermissionDTO
     */
    public PermissionDTO mapToPermissionDTO(Permission permission) {
        return PermissionDTO.builder()
                .permissionId(permission.getPermissionId())
                .code(permission.getCode())
                .name(permission.getName())
                .permissionType(permission.getPermissionType())
                .description(permission.getDescription())
                .isSystemPermission(permission.getIsSystemPermission())
                .resourceType(permission.getResourceType())
                .action(permission.getAction())
                .build();
    }

    /**
     * Map UserPermission entity to UserPermissionDTO
     */
    public UserPermissionDTO mapToUserPermissionDTO(UserPermission userPermission) {
        return UserPermissionDTO.builder()
                .userPermissionId(userPermission.getUserPermissionId())
                .staffId(userPermission.getStaffUser().getStaffId())
                .staffName(userPermission.getStaffUser().getFullName())
                .permissionId(userPermission.getPermission().getPermissionId())
                .permissionName(userPermission.getPermission().getName())
                .permissionCode(userPermission.getPermission().getCode())
                .customerId(userPermission.getCustomer() != null ? userPermission.getCustomer().getCustomerId() : null)
                .customerName(userPermission.getCustomer() != null ? userPermission.getCustomer().getFullName() : null)
                .isActive(userPermission.getIsActive())
                .grantedByStaffId(userPermission.getGrantedByStaffId())
                .grantedAt(userPermission.getGrantedAt())
                .expiresAt(userPermission.getExpiresAt())
                .notes(userPermission.getNotes())
                .build();
    }

    /**
     * Map FieldPermission entity to FieldPermissionDTO
     */
    public FieldPermissionDTO mapToFieldPermissionDTO(FieldPermission fieldPermission) {
        return FieldPermissionDTO.builder()
                .fieldPermissionId(fieldPermission.getFieldPermissionId())
                .staffId(fieldPermission.getStaffUser().getStaffId())
                .staffName(fieldPermission.getStaffUser().getFullName())
                .permissionScope(fieldPermission.getPermissionScope())
                .scopeDescription(getPermissionScopeDescription(fieldPermission.getPermissionScope()))
                .customerId(
                        fieldPermission.getCustomer() != null ? fieldPermission.getCustomer().getCustomerId() : null)
                .customerName(
                        fieldPermission.getCustomer() != null ? fieldPermission.getCustomer().getFullName() : null)
                .isGranted(fieldPermission.getIsGranted())
                .grantedByStaffId(fieldPermission.getGrantedByStaffId())
                .grantedAt(fieldPermission.getGrantedAt())
                .expiresAt(fieldPermission.getExpiresAt())
                .notes(fieldPermission.getNotes())
                .fieldName(fieldPermission.getFieldName())
                .actionType(fieldPermission.getActionType())
                .isExpired(fieldPermission.getExpiresAt() != null
                        && fieldPermission.getExpiresAt().isBefore(java.time.LocalDateTime.now()))
                .isActive(fieldPermission.isValid())
                .build();
    }

    /**
     * Map list of Permission entities to PermissionDTOs
     */
    public List<PermissionDTO> mapToPermissionDTOs(List<Permission> permissions) {
        return permissions.stream()
                .map(this::mapToPermissionDTO)
                .collect(Collectors.toList());
    }

    /**
     * Map list of UserPermission entities to UserPermissionDTOs
     */
    public List<UserPermissionDTO> mapToUserPermissionDTOs(List<UserPermission> userPermissions) {
        return userPermissions.stream()
                .map(this::mapToUserPermissionDTO)
                .collect(Collectors.toList());
    }

    /**
     * Map list of FieldPermission entities to FieldPermissionDTOs
     */
    public List<FieldPermissionDTO> mapToFieldPermissionDTOs(List<FieldPermission> fieldPermissions) {
        return fieldPermissions.stream()
                .map(this::mapToFieldPermissionDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get permission scope description
     */
    private String getPermissionScopeDescription(PermissionScope scope) {
        switch (scope) {
            case CUSTOMER_NAME_READ:
                return "Xem tên khách hàng";
            case CUSTOMER_NAME_WRITE:
                return "Sửa tên khách hàng";
            case CUSTOMER_PHONE_READ:
                return "Xem số điện thoại";
            case CUSTOMER_PHONE_WRITE:
                return "Sửa số điện thoại";
            case CUSTOMER_EMAIL_READ:
                return "Xem email";
            case CUSTOMER_EMAIL_WRITE:
                return "Sửa email";
            case CUSTOMER_ADDRESS_READ:
                return "Xem địa chỉ";
            case CUSTOMER_ADDRESS_WRITE:
                return "Sửa địa chỉ";
            case CUSTOMER_DOB_READ:
                return "Xem ngày sinh";
            case CUSTOMER_DOB_WRITE:
                return "Sửa ngày sinh";
            case CUSTOMER_NOTES_READ:
                return "Xem ghi chú";
            case CUSTOMER_NOTES_WRITE:
                return "Sửa ghi chú";
            case CUSTOMER_TOTAL_SPENT_READ:
                return "Xem tổng chi tiêu";
            case CUSTOMER_TOTAL_POINTS_READ:
                return "Xem điểm tích lũy";
            case APPOINTMENT_VIEW:
                return "Xem lịch hẹn";
            case APPOINTMENT_CREATE:
                return "Tạo lịch hẹn";
            case APPOINTMENT_UPDATE:
                return "Sửa lịch hẹn";
            case INVOICE_VIEW:
                return "Xem hóa đơn";
            case INVOICE_CREATE:
                return "Tạo hóa đơn";
            case HISTORY_VIEW:
                return "Xem lịch sử";
            case HISTORY_EXPORT:
                return "Xuất dữ liệu";
            case CUSTOMER_DELETE:
                return "Xóa khách hàng";
            default:
                return scope.name();
        }
    }
}
