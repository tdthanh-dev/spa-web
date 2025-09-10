package com.htttql.crmmodule.common.enums;

import lombok.Getter;

@Getter
public enum TaskType {
    CALL("Phone call"),
    FOLLOW_UP("Follow up"),
    RETOUCH_REMINDER("Retouch reminder");

    private final String description;

    TaskType(String description) {
        this.description = description;
    }
}
