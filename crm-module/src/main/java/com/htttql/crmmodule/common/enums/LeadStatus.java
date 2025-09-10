package com.htttql.crmmodule.common.enums;

import lombok.Getter;

@Getter
public enum LeadStatus {
    NEW("New lead"),
    IN_PROGRESS("In progress"),
    WON("Won - converted to customer"),
    LOST("Lost - did not convert");

    private final String description;

    LeadStatus(String description) {
        this.description = description;
    }
}
