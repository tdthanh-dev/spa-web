package com.htttql.crmmodule.audit.service;

import com.htttql.crmmodule.audit.dto.AuditLogResponse;
import com.htttql.crmmodule.audit.entity.AuditLog;
import com.htttql.crmmodule.audit.repository.IAuditLogRepository;
import com.htttql.crmmodule.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 * Implementation of Audit Service
 */
@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements IAuditService {

    private final IAuditLogRepository auditLogRepository;

    @Override
    public Page<AuditLogResponse> getAllAuditLogs(Pageable pageable) {
        Page<AuditLog> auditLogs = auditLogRepository.findAll(pageable);
        return auditLogs.map(this::mapToResponse);
    }

    @Override
    public AuditLogResponse getAuditLogById(Long id) {
        AuditLog auditLog = auditLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audit log not found with id: " + id));
        return mapToResponse(auditLog);
    }

    private AuditLogResponse mapToResponse(AuditLog auditLog) {
        return AuditLogResponse.builder()
                .auditId(auditLog.getAuditId())
                .actorId(auditLog.getActor() != null ? auditLog.getActor().getStaffId() : null)
                .actorName(auditLog.getActor() != null ? auditLog.getActor().getFullName() : null)
                .action(auditLog.getAction())
                .entityName(auditLog.getEntityName())
                .entityId(auditLog.getEntityId())
                .diff(auditLog.getOldValues() != null ? auditLog.getOldValues() : null)
                .createdAt(auditLog.getCreatedAt())
                .requestId(auditLog.getRequestId())
                .build();
    }
}
