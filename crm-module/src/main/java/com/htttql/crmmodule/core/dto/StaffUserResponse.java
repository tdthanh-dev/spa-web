package com.htttql.crmmodule.core.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.htttql.crmmodule.common.enums.StaffStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Staff User Response - Safe staff information
 * Personal contact info removed for privacy
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StaffUserResponse {

    private Long staffId;
    private String fullName;
    private String role;
    private StaffStatus status;

    // Display info only
    private String displayRole; // "Manager", "Technician", "Receptionist"
    private Boolean isActive;

    // Contact info (for admin/manager access)
    private String email;
    private String phone;
}
