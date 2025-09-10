package com.htttql.crmmodule.common.factory;

import com.htttql.crmmodule.lead.dto.AppointmentResponse;
import com.htttql.crmmodule.lead.entity.Appointment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Appointment Response Factory - Smart appointment data transformation
 * Processes appointment data for optimal display and workflow
 */
@Component
@RequiredArgsConstructor
public class AppointmentResponseFactory {

    /**
     * Create appointment response with processed display data
     */
    public AppointmentResponse createResponse(Appointment appointment) {
        return AppointmentResponse.builder()
                .apptId(appointment.getApptId())

                // Customer info - processed for display
                .customerId(appointment.getCustomer() != null ? appointment.getCustomer().getCustomerId() : null)
                .customerName(appointment.getCustomer() != null ? appointment.getCustomer().getFullName()
                        : "Unknown Customer")

                // Service info - processed for display
                .serviceId(appointment.getService() != null ? appointment.getService().getServiceId() : null)
                .serviceName(appointment.getService() != null ? appointment.getService().getName() : "Unknown Service")

                // Scheduling info
                .startAt(appointment.getStartAt())
                .endAt(appointment.getEndAt())
                .status(appointment.getStatus())

                // Technician info - display name only for privacy
                .technicianName(
                        appointment.getTechnician() != null ? appointment.getTechnician().getFullName() : "Unassigned")

                // Notes
                .note(appointment.getNote())

                .build();
    }

    /**
     * Create minimal appointment response for list views
     */
    public AppointmentResponse createMinimalResponse(Appointment appointment) {
        return AppointmentResponse.builder()
                .apptId(appointment.getApptId())
                .customerName(
                        appointment.getCustomer() != null ? maskCustomerName(appointment.getCustomer().getFullName())
                                : "Unknown")
                .serviceName(appointment.getService() != null ? appointment.getService().getName() : "Unknown Service")
                .startAt(appointment.getStartAt())
                .endAt(appointment.getEndAt())
                .status(appointment.getStatus())
                .technicianName(
                        appointment.getTechnician() != null ? appointment.getTechnician().getFullName() : "Unassigned")
                .build();
    }

    /**
     * Create customer-facing appointment response
     */
    public AppointmentResponse createCustomerResponse(Appointment appointment) {
        return AppointmentResponse.builder()
                .apptId(appointment.getApptId())
                .serviceName(appointment.getService() != null ? appointment.getService().getName() : "Unknown Service")
                .startAt(appointment.getStartAt())
                .endAt(appointment.getEndAt())
                .status(appointment.getStatus())
                .technicianName(appointment.getTechnician() != null
                        ? "Technician " + appointment.getTechnician().getFullName().substring(0, 1) + "."
                        : "TBD")
                .note(appointment.getNote())
                .build();
    }

    // Helper methods

    private String maskCustomerName(String fullName) {
        if (fullName == null || fullName.trim().isEmpty())
            return "Unknown";

        String[] parts = fullName.trim().split("\\s+");
        if (parts.length == 1) {
            return parts[0].substring(0, 1) + "***";
        }

        // Show first name + masked last name
        String firstName = parts[0];
        String lastName = parts[parts.length - 1];
        return firstName + " " + lastName.substring(0, 1) + "***";
    }
}
