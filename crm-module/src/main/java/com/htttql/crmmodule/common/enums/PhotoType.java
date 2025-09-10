package com.htttql.crmmodule.common.enums;

import lombok.Getter;

@Getter
public enum PhotoType {
    BEFORE("Before service"),
    AFTER("After service");

    private final String description;

    PhotoType(String description) {
        this.description = description;
    }
}
