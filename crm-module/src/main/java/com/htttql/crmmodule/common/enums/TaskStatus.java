package com.htttql.crmmodule.common.enums;

import lombok.Getter;

@Getter
public enum TaskStatus {
    OPEN("Open"),
    DONE("Done"),
    CANCELLED("Cancelled");

    private final String description;

    TaskStatus(String description) {
        this.description = description;
    }
}
