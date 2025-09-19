package com.htttql.crmmodule.lead.service.impl;

import com.htttql.crmmodule.common.enums.AppointmentStatus;
import com.htttql.crmmodule.common.exception.ResourceNotFoundException;
import com.htttql.crmmodule.core.repository.ICustomerRepository;
import com.htttql.crmmodule.core.repository.IStaffUserRepository;
import com.htttql.crmmodule.lead.dto.AppointmentRequest;
import com.htttql.crmmodule.lead.dto.AppointmentResponse;
import com.htttql.crmmodule.lead.entity.Appointment;
import com.htttql.crmmodule.lead.entity.Lead;
import com.htttql.crmmodule.lead.repository.IAppointmentRepository;
import com.htttql.crmmodule.lead.repository.ILeadRepository;
import com.htttql.crmmodule.lead.service.IAppointmentService;
import com.htttql.crmmodule.service.entity.SpaService;
import com.htttql.crmmodule.service.repository.IServiceRepository;
import com.htttql.crmmodule.core.entity.Customer;
import com.htttql.crmmodule.core.entity.StaffUser;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements IAppointmentService {

    private final IAppointmentRepository appointmentRepository;
    private final ILeadRepository leadRepository;
    private final ICustomerRepository customerRepository;
    private final IServiceRepository serviceRepository;
    private final IStaffUserRepository staffUserRepository;

    // 👉 Mapper nội bộ
    private AppointmentResponse toResponse(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setApptId(appointment.getApptId());

        if (appointment.getCustomer() != null) {
            Customer c = appointment.getCustomer();
            response.setCustomerId(c.getCustomerId());
            response.setCustomerName(c.getFullName());
        } else if (appointment.getLead() != null) {
            Lead l = appointment.getLead();
            response.setCustomerId(l.getCustomerId()); // có thể null
            response.setCustomerName(l.getFullName());
        } else {
            response.setCustomerName("Unknown Customer");
        }

        SpaService s = appointment.getService();
        if (s != null) {
            response.setServiceId(s.getServiceId());
            response.setServiceName(s.getName());
        }

        StaffUser tech = appointment.getTechnician();
        if (tech != null) {
            response.setTechnicianId(tech.getStaffId());
            response.setTechnicianName(tech.getFullName());
        }

        StaffUser recep = appointment.getReceptionist();
        if (recep != null) {
            response.setReceptionistId(recep.getStaffId());
            response.setReceptionistName(recep.getFullName());
        }

        response.setStartAt(appointment.getStartAt());
        response.setEndAt(appointment.getEndAt());
        response.setStatus(appointment.getStatus());
        response.setNote(appointment.getNote());

        return response;
    }

    @Override
    public Page<AppointmentResponse> getAllAppointments(Pageable pageable) {
        return appointmentRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    public AppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        return toResponse(appointment);
    }

    @Override
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        if (request.getLeadId() == null && request.getCustomerId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Either leadId or customerId is required");
        }
        if (request.getLeadId() != null && request.getCustomerId() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Specify either leadId or customerId, not both");
        }
        if (request.getReceptionistId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "receptionistId is required");
        }

        Appointment appointment = Appointment.builder()
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .status(request.getStatus() != null ? request.getStatus() : AppointmentStatus.SCHEDULED)
                .note(request.getNotes())
                .build();

        if (request.getLeadId() != null) {
            var lead = leadRepository.findById(request.getLeadId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + request.getLeadId()));
            appointment.setLead(lead);
        } else {
            var customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));
            appointment.setCustomer(customer);
        }

        var service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + request.getServiceId()));
        appointment.setService(service);

        if (request.getTechnicianId() != null) {
            var tech = staffUserRepository.findById(request.getTechnicianId())
                    .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + request.getTechnicianId()));
            appointment.setTechnician(tech);
        }

        var recep = staffUserRepository.findById(request.getReceptionistId())
                .orElseThrow(() -> new ResourceNotFoundException("Receptionist not found with id: " + request.getReceptionistId()));
        appointment.setReceptionist(recep);

        return toResponse(appointmentRepository.save(appointment));
    }

    @Override
    public AppointmentResponse updateAppointment(Long id, AppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        if (request.getLeadId() != null && request.getCustomerId() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Specify either leadId or customerId, not both");
        }
        if (request.getLeadId() != null) {
            var lead = leadRepository.findById(request.getLeadId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + request.getLeadId()));
            appointment.setLead(lead);
            appointment.setCustomer(null);
        } else if (request.getCustomerId() != null) {
            var customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));
            appointment.setCustomer(customer);
            appointment.setLead(null);
        }

        var service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + request.getServiceId()));
        appointment.setService(service);

        appointment.setStartAt(request.getStartAt());
        appointment.setEndAt(request.getEndAt());
        appointment.setStatus(request.getStatus() != null ? request.getStatus() : appointment.getStatus());
        appointment.setNote(request.getNotes());

        if (request.getTechnicianId() != null) {
            var tech = staffUserRepository.findById(request.getTechnicianId())
                    .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + request.getTechnicianId()));
            appointment.setTechnician(tech);
        }

        if (request.getReceptionistId() != null) {
            var recep = staffUserRepository.findById(request.getReceptionistId())
                    .orElseThrow(() -> new ResourceNotFoundException("Receptionist not found with id: " + request.getReceptionistId()));
            appointment.setReceptionist(recep);
        }

        return toResponse(appointmentRepository.save(appointment));
    }

    @Override
    public void deleteAppointment(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Appointment not found with id: " + id);
        }
        appointmentRepository.deleteById(id);
    }

    @Override
    public AppointmentResponse updateAppointmentStatus(Long id, String status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        AppointmentStatus appointmentStatus = AppointmentStatus.valueOf(status.toUpperCase());
        appointment.setStatus(appointmentStatus);

        return toResponse(appointmentRepository.save(appointment));
    }

    @Override
    public Page<AppointmentResponse> getTodayAppointments(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime todayEnd = todayStart.plusDays(1).minusNanos(1);

        return appointmentRepository.findByStartAtBetween(todayStart, todayEnd, pageable).map(this::toResponse);
    }

    @Override
    public Page<AppointmentResponse> getAppointmentsByDateRange(String startDate, String endDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return appointmentRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    public Page<AppointmentResponse> getTechnicianAppointments(Long technicianId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return appointmentRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    public Page<AppointmentResponse> getCustomerAppointments(Long customerId, int page, int size) {
        customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        Pageable pageable = PageRequest.of(page, size);
        List<Appointment> appointments = appointmentRepository.findByCustomer_CustomerId(customerId);

        int start = page * size;
        int end = Math.min(start + size, appointments.size());
        List<Appointment> pageContent = appointments.subList(start, end);

        return new PageImpl<>(pageContent, pageable, appointments.size()).map(this::toResponse);
    }
}
