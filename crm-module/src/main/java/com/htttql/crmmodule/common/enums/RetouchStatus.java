package com.htttql.crmmodule.common.enums;

import lombok.Getter;

@Getter
public enum RetouchStatus {
    PLANNED("Planned"),
    DONE("Done"),
    MISSED("Missed");

    private final String description;

    RetouchStatus(String description) {
        this.description = description;
    }
}
