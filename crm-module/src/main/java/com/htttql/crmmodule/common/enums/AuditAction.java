package com.htttql.crmmodule.common.enums;

import lombok.Getter;

@Getter
public enum AuditAction {
    CREATE("Create"),
    UPDATE("Update"),
    DELETE("Delete"),
    STATUS_CHANGE("Status change"),
    LOGIN("Login");

    private final String description;

    AuditAction(String description) {
        this.description = description;
    }
}
