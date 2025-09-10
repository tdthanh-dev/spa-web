package com.htttql.crmmodule.common.enums;

import lombok.Getter;

@Getter
public enum CaseStatus {
    INTAKE("Intake - initial assessment"),
    IN_PROGRESS("In progress"),
    DONE("Done"),
    FOLLOW_UP("Follow up required");

    private final String description;

    CaseStatus(String description) {
        this.description = description;
    }
}
