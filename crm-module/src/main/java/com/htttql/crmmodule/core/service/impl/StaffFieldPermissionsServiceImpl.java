package com.htttql.crmmodule.core.service.impl;

import com.htttql.crmmodule.common.enums.PermissionLevel;
import com.htttql.crmmodule.common.exception.ResourceNotFoundException;
import com.htttql.crmmodule.core.dto.StaffFieldPermissions;
import com.htttql.crmmodule.core.entity.StaffFieldPermissionsEntity;
import com.htttql.crmmodule.core.repository.IStaffFieldPermissionsRepository;
import com.htttql.crmmodule.core.service.IStaffFieldPermissionsService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StaffFieldPermissionsServiceImpl implements IStaffFieldPermissionsService {

    private final IStaffFieldPermissionsRepository repository;

    @Override
    @Transactional(readOnly = true)
    public StaffFieldPermissions getByStaffId(Long staffId) {
        if (staffId == null) return null;
        return repository.findByStaffId(staffId)
                .map(this::toDto)
                .orElse(null);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public StaffFieldPermissions create(Long staffId) {
        if (repository.existsByStaffId(staffId)) {
            throw new IllegalArgumentException("Permissions already exist for staff ID: " + staffId);
        }

        StaffFieldPermissionsEntity entity = StaffFieldPermissionsEntity.builder()
                .staffId(staffId)
                .customerName(PermissionLevel.EDIT)
                .customerPhone(PermissionLevel.EDIT)
                .customerEmail(PermissionLevel.EDIT)
                .customerDob(PermissionLevel.EDIT)
                .customerGender(PermissionLevel.EDIT)
                .customerAddress(PermissionLevel.EDIT)
                .customerNotes(PermissionLevel.EDIT)
                .customerTotalSpent(PermissionLevel.EDIT)
                .customerTotalPoints(PermissionLevel.EDIT)
                .customerTier(PermissionLevel.EDIT)
                .customerVipStatus(PermissionLevel.EDIT)
                .appointmentView(PermissionLevel.EDIT)
                .appointmentCreate(PermissionLevel.EDIT)
                .appointmentUpdate(PermissionLevel.EDIT)
                .appointmentCancel(PermissionLevel.EDIT)
                .invoiceView(PermissionLevel.EDIT)
                .invoiceCreate(PermissionLevel.EDIT)
                .invoiceUpdate(PermissionLevel.EDIT)
                .historyView(PermissionLevel.EDIT)
                .historyExport(PermissionLevel.EDIT)
                .build();

        return toDto(repository.save(entity));
    }

    @Override
    @Transactional
    public StaffFieldPermissions update(Long staffId, StaffFieldPermissions permissions) {
        StaffFieldPermissionsEntity entity = repository.findByStaffId(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Permissions not found for staff ID: " + staffId));

        entity.setCustomerName(permissions.getCustomerName());
        entity.setCustomerPhone(permissions.getCustomerPhone());
        entity.setCustomerEmail(permissions.getCustomerEmail());
        entity.setCustomerDob(permissions.getCustomerDob());
        entity.setCustomerGender(permissions.getCustomerGender());
        entity.setCustomerAddress(permissions.getCustomerAddress());
        entity.setCustomerNotes(permissions.getCustomerNotes());
        entity.setCustomerTotalSpent(permissions.getCustomerTotalSpent());
        entity.setCustomerTotalPoints(permissions.getCustomerTotalPoints());
        entity.setCustomerTier(permissions.getCustomerTier());
        entity.setCustomerVipStatus(permissions.getCustomerVipStatus());
        entity.setAppointmentView(permissions.getAppointmentView());
        entity.setAppointmentCreate(permissions.getAppointmentCreate());
        entity.setAppointmentUpdate(permissions.getAppointmentUpdate());
        entity.setAppointmentCancel(permissions.getAppointmentCancel());
        entity.setInvoiceView(permissions.getInvoiceView());
        entity.setInvoiceCreate(permissions.getInvoiceCreate());
        entity.setInvoiceUpdate(permissions.getInvoiceUpdate());
        entity.setHistoryView(permissions.getHistoryView());
        entity.setHistoryExport(permissions.getHistoryExport());

        return toDto(repository.save(entity));
    }

    private StaffFieldPermissions toDto(StaffFieldPermissionsEntity entity) {
        return StaffFieldPermissions.builder()
                .staffId(entity.getStaffId())
                .customerName(entity.getCustomerName())
                .customerPhone(entity.getCustomerPhone())
                .customerEmail(entity.getCustomerEmail())
                .customerDob(entity.getCustomerDob())
                .customerGender(entity.getCustomerGender())
                .customerAddress(entity.getCustomerAddress())
                .customerNotes(entity.getCustomerNotes())
                .customerTotalSpent(entity.getCustomerTotalSpent())
                .customerTotalPoints(entity.getCustomerTotalPoints()) // nếu field tên khác, giữ nguyên theo entity của bạn
                .customerTier(entity.getCustomerTier())
                .customerVipStatus(entity.getCustomerVipStatus())
                .appointmentView(entity.getAppointmentView())
                .appointmentCreate(entity.getAppointmentCreate())
                .appointmentUpdate(entity.getAppointmentUpdate())
                .appointmentCancel(entity.getAppointmentCancel())
                .invoiceView(entity.getInvoiceView())
                .invoiceCreate(entity.getInvoiceCreate())
                .invoiceUpdate(entity.getInvoiceUpdate())
                .historyView(entity.getHistoryView())
                .historyExport(entity.getHistoryExport())
                .build();
    }


}
