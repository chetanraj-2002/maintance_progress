package com.predictive.util;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/**
 * Lightweight role gate used by mutating controller endpoints.
 * Centralised here so the same check is applied everywhere.
 */
public final class RoleCheck {

    private RoleCheck() {
    }

    public static void requireAdmin(String role) {
        if (!"ADMIN".equalsIgnoreCase(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }
}
