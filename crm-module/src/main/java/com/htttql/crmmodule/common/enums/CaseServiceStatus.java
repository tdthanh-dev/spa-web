package com.htttql.crmmodule.common.enums;

import lombok.Getter;

@Getter
public enum CaseServiceStatus {
    PLANNED("Planned"),
    IN_PROGRESS("In progress"),
    DONE("Done"),
    CANCELLED("Cancelled");

    private final String description;

    CaseServiceStatus(String description) {
        this.description = description;
    }
}
