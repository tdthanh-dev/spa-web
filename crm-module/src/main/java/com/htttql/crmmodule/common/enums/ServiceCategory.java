package com.htttql.crmmodule.common.enums;

import lombok.Getter;

@Getter
public enum ServiceCategory {
    LIP("Lip services"),
    BROW("Brow services"),
    OTHER("Other services");

    private final String description;

    ServiceCategory(String description) {
        this.description = description;
    }
}
