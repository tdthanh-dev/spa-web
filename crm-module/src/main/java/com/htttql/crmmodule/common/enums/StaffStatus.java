package com.htttql.crmmodule.common.enums;

import lombok.Getter;

@Getter
public enum StaffStatus {
    ACTIVE("Active"),
    INACTIVE("Inactive"),
    SUSPENDED("Suspended");

    private final String description;

    StaffStatus(String description) {
        this.description = description;
    }
}
