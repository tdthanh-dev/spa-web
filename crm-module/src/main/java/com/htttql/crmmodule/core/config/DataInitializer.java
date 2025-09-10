package com.htttql.crmmodule.core.config;

import com.htttql.crmmodule.core.entity.*;
import com.htttql.crmmodule.common.enums.PermissionType;
import com.htttql.crmmodule.core.repository.*;
import com.htttql.crmmodule.common.enums.StaffStatus;
import com.htttql.crmmodule.common.enums.TierCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Initialize sample data for development environment
 * Only runs when profile is not 'prod'
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Profile("!prod")
@Transactional
public class DataInitializer implements CommandLineRunner {

    private final IRoleRepository roleRepository;
    private final IPermissionRepository permissionRepository;
    private final IStaffUserRepository staffUserRepository;
    private final ITierRepository tierRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("Initializing sample data...");

        // Initialize roles
        initializeRoles();

        // Initialize permissions
        initializePermissions();

        // Initialize tiers
        initializeTiers();

        // Initialize staff users
        initializeStaffUsers();

        log.info("Sample data initialization completed!");
    }

    private void initializeRoles() {
        if (roleRepository.count() > 0) {
            log.info("Roles already exist, skipping initialization");
            return;
        }

        List<Role> roles = Arrays.asList(
                Role.builder()
                        .code("ADMIN")
                        .name("Administrator")
                        .description("Full system access with all permissions")
                        .build(),

                Role.builder()
                        .code("MANAGER")
                        .name("Manager")
                        .description("Management access to customer data and operations")
                        .build(),

                Role.builder()
                        .code("RECEPTIONIST")
                        .name("Receptionist")
                        .description("Front desk operations and customer service")
                        .build(),

                Role.builder()
                        .code("TECHNICIAN")
                        .name("Technician")
                        .description("Service technician with limited access")
                        .build());

        roleRepository.saveAll(roles);
        log.info("Created {} roles", roles.size());
    }

    private void initializePermissions() {
        if (permissionRepository.count() > 0) {
            log.info("Permissions already exist, skipping initialization");
            return;
        }

        List<Permission> permissions = Arrays.asList(
                // Customer permissions
                createPermission("CUSTOMER_READ", "View customer information",
                        PermissionType.VIEW_CUSTOMER_BASIC,
                        "CUSTOMER", "READ"),
                createPermission("CUSTOMER_WRITE", "Create and edit customer information",
                        PermissionType.UPDATE_CUSTOMER_BASIC, "CUSTOMER", "WRITE"),
                createPermission("CUSTOMER_FINANCIAL", "View customer financial information",
                        PermissionType.VIEW_CUSTOMER_FINANCIAL, "CUSTOMER", "READ_FINANCIAL"),
                createPermission("CUSTOMER_HISTORY", "View customer service history",
                        PermissionType.VIEW_CUSTOMER_HISTORY, "CUSTOMER", "READ_HISTORY"),

                // Appointment permissions
                createPermission("APPOINTMENT_READ", "View appointment information",
                        PermissionType.VIEW_APPOINTMENTS,
                        "APPOINTMENT", "READ"),
                createPermission("APPOINTMENT_WRITE", "Create and edit appointments",
                        PermissionType.MANAGE_APPOINTMENTS,
                        "APPOINTMENT", "WRITE"),
                createPermission("APPOINTMENT_MANAGE", "Manage customer appointments",
                        PermissionType.MANAGE_APPOINTMENTS, "APPOINTMENT", "MANAGE"),

                // Invoice permissions
                createPermission("INVOICE_READ", "View invoice information",
                        PermissionType.VIEW_INVOICES, "INVOICE",
                        "READ"),
                createPermission("INVOICE_WRITE", "Create and edit invoices",
                        PermissionType.MANAGE_INVOICES, "INVOICE",
                        "WRITE"),

                // Service permissions
                createPermission("SERVICE_READ", "View service information",
                        PermissionType.VIEW_CUSTOMER_DETAILS, "SERVICE",
                        "READ"),
                createPermission("SERVICE_WRITE", "Create and edit services",
                        PermissionType.UPDATE_CUSTOMER_DETAILS, "SERVICE",
                        "WRITE"));

        permissionRepository.saveAll(permissions);
        log.info("Created {} permissions", permissions.size());
    }

    private Permission createPermission(String code, String description, PermissionType permissionType,
            String resourceType, String action) {
        return Permission.builder()
                .code(code)
                .name(description.split(" ")[0] + " " + resourceType.toLowerCase())
                .description(description)
                .permissionType(permissionType)
                .resourceType(resourceType)
                .action(action)
                .isSystemPermission(true)
                .build();
    }

    private void initializeTiers() {
        if (tierRepository.count() > 0) {
            log.info("Tiers already exist, skipping initialization");
            return;
        }

        List<Tier> tiers = Arrays.asList(
                Tier.builder()
                        .code(TierCode.REGULAR)
                        .minSpent(BigDecimal.valueOf(TierCode.REGULAR.getMinSpent()))
                        .minPoints((int) TierCode.REGULAR.getMinPoints())
                        .benefits(createBenefitsMap("Basic service access"))
                        .build(),

                Tier.builder()
                        .code(TierCode.SILVER)
                        .minSpent(BigDecimal.valueOf(TierCode.SILVER.getMinSpent()))
                        .minPoints((int) TierCode.SILVER.getMinPoints())
                        .benefits(createBenefitsMap("5% discount", "Priority booking"))
                        .build(),

                Tier.builder()
                        .code(TierCode.GOLD)
                        .minSpent(BigDecimal.valueOf(TierCode.GOLD.getMinSpent()))
                        .minPoints((int) TierCode.GOLD.getMinPoints())
                        .benefits(createBenefitsMap("10% discount", "Priority booking",
                                "Free consultation"))
                        .build(),

                Tier.builder()
                        .code(TierCode.VIP)
                        .minSpent(BigDecimal.valueOf(TierCode.VIP.getMinSpent()))
                        .minPoints((int) TierCode.VIP.getMinPoints())
                        .benefits(createBenefitsMap("15% discount", "VIP priority",
                                "Free consultation",
                                "Exclusive services"))
                        .build());

        tierRepository.saveAll(tiers);
        log.info("Created {} tiers", tiers.size());
    }

    private Map<String, Object> createBenefitsMap(String... benefits) {
        Map<String, Object> benefitsMap = new HashMap<>();
        benefitsMap.put("description", String.join(", ", benefits));
        benefitsMap.put("items", Arrays.asList(benefits));
        return benefitsMap;
    }

    private void initializeStaffUsers() {
        if (staffUserRepository.count() > 0) {
            log.info("Staff users already exist, skipping initialization");
            return;
        }

        // Get roles
        Role adminRole = roleRepository.findByCode("ADMIN").orElseThrow();
        Role managerRole = roleRepository.findByCode("MANAGER").orElseThrow();
        Role receptionistRole = roleRepository.findByCode("RECEPTIONIST").orElseThrow();
        Role technicianRole = roleRepository.findByCode("TECHNICIAN").orElseThrow();

        List<StaffUser> staffUsers = Arrays.asList(
                StaffUser.builder()
                        .fullName("Trịnh Đình Thanh")
                        .phone("0123456789")
                        .email("tdthanh.dev2025@gmail.com")
                        .passwordHash(passwordEncoder.encode("admin123"))
                        .status(StaffStatus.ACTIVE)
                        .role(adminRole)
                        .build(),

                StaffUser.builder()
                        .fullName("Nguyễn Văn An")
                        .phone("0987654321")
                        .email("2251120247@ut.edu.vn")
                        .passwordHash(passwordEncoder.encode("manager123"))
                        .status(StaffStatus.ACTIVE)
                        .role(managerRole)
                        .build(),

                StaffUser.builder()
                        .fullName("Trần Thị Bình")
                        .phone("0123456788")
                        .email("trinhdinhthanhyahoo@gmail.com")
                        .passwordHash(passwordEncoder.encode("receptionist123"))
                        .status(StaffStatus.ACTIVE)
                        .role(receptionistRole)
                        .build(),

                StaffUser.builder()
                        .fullName("Lê Văn Cường")
                        .phone("0987654322")
                        .email("technician1@crm.com")
                        .passwordHash(passwordEncoder.encode("tech123"))
                        .status(StaffStatus.ACTIVE)
                        .role(technicianRole)
                        .build(),

                StaffUser.builder()
                        .fullName("Phạm Thị Dung")
                        .phone("0123456787")
                        .email("technician2@crm.com")
                        .passwordHash(passwordEncoder.encode("tech123"))
                        .status(StaffStatus.ACTIVE)
                        .role(technicianRole)
                        .build());

        staffUserRepository.saveAll(staffUsers);
        log.info("Created {} staff users", staffUsers.size());
    }
}
