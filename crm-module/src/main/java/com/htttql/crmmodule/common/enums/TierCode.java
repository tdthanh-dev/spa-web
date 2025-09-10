package com.htttql.crmmodule.common.enums;

import lombok.Getter;

@Getter
public enum TierCode {
    REGULAR("Regular", 0, 0),
    SILVER("Silver", 1000000, 100),
    GOLD("Gold", 5000000, 500),
    VIP("VIP", 10000000, 1000);

    private final String description;
    private final long minSpent;
    private final long minPoints;

    TierCode(String description, long minSpent, long minPoints) {
        this.description = description;
        this.minSpent = minSpent;
        this.minPoints = minPoints;
    }
}
