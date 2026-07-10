package com.example.auro.util;

import java.util.List;
import java.util.Map;

public final class RoleConstants {
    private RoleConstants() {}

    public static final String MANAGING_DIRECTOR = "Managing Director";
    public static final String OPERATIONAL_HEAD = "Operational Head";
    public static final String CUSTOMER = "Customer";

    public static final List<String> ROLES = List.of(
            MANAGING_DIRECTOR,
            OPERATIONAL_HEAD,
            "Sales Manager",
            "Sales Executive",
            "Marketing Manager",
            "Marketing Executive",
            "CRM Manager",
            "CRM Executive",
            "Accounts Manager",
            "Accounts Executive",
            "HR Manager",
            "HR Executive",
            CUSTOMER
    );

    public static final List<String> SUPER_ROLES = List.of(
            MANAGING_DIRECTOR,
            OPERATIONAL_HEAD
    );

    public static final List<String> DEPARTMENT_MANAGER_ROLES = List.of(
            "Sales Manager",
            "Marketing Manager",
            "CRM Manager",
            "Accounts Manager",
            "HR Manager"
    );

    public static final List<String> EXECUTIVE_ROLES = List.of(
            "Sales Executive",
            "Marketing Executive",
            "CRM Executive",
            "Accounts Executive",
            "HR Executive"
    );

    public static final List<String> EMPLOYEE_ROLES = List.of(
            "Sales Manager",
            "Sales Executive",
            "Marketing Manager",
            "Marketing Executive",
            "CRM Manager",
            "CRM Executive",
            "Accounts Manager",
            "Accounts Executive",
            "HR Manager",
            "HR Executive"
    );

    private static final Map<String, String> ROLE_BASE_PATHS = Map.ofEntries(
            Map.entry(MANAGING_DIRECTOR, "/md"),
            Map.entry(OPERATIONAL_HEAD, "/operational-head"),
            Map.entry("Sales Manager", "/sales-manager"),
            Map.entry("Sales Executive", "/sales-executive"),
            Map.entry("Marketing Manager", "/marketing-manager"),
            Map.entry("Marketing Executive", "/marketing-executive"),
            Map.entry("CRM Manager", "/crm-manager"),
            Map.entry("CRM Executive", "/crm-executive"),
            Map.entry("Accounts Manager", "/accounts-manager"),
            Map.entry("Accounts Executive", "/accounts-executive"),
            Map.entry("HR Manager", "/hr-manager"),
            Map.entry("HR Executive", "/hr-executive"),
            Map.entry(CUSTOMER, "/customer")
    );

    public static boolean isValidRole(String role) {
        return role != null && ROLES.contains(role);
    }

    public static boolean isSuperRole(String role) {
        return SUPER_ROLES.contains(role);
    }

    public static boolean isDepartmentManagerRole(String role) {
        return DEPARTMENT_MANAGER_ROLES.contains(role);
    }

    public static boolean isExecutiveRole(String role) {
        return EXECUTIVE_ROLES.contains(role);
    }

    public static boolean isEmployeeRole(String role) {
        return EMPLOYEE_ROLES.contains(role);
    }

    public static String getEmployeeIdPrefix(String role) {
        if (MANAGING_DIRECTOR.equals(role)) return "MD";
        if (OPERATIONAL_HEAD.equals(role)) return "OH";
        if ("Sales Manager".equals(role)) return "SM";
        if ("Sales Executive".equals(role)) return "SE";
        if ("Marketing Manager".equals(role)) return "MM";
        if ("Marketing Executive".equals(role)) return "ME";
        if ("CRM Manager".equals(role)) return "CM";
        if ("CRM Executive".equals(role)) return "CE";
        if ("Accounts Manager".equals(role)) return "AM";
        if ("Accounts Executive".equals(role)) return "AE";
        if ("HR Manager".equals(role)) return "HM";
        if ("HR Executive".equals(role)) return "HE";
        return "EMP";
    }

    public static String getDepartment(String role) {
        if (role == null) return CUSTOMER;
        if (role.contains("Sales")) return "Sales";
        if (role.contains("Marketing")) return "Marketing";
        if (role.contains("CRM")) return "CRM";
        if (role.contains("Accounts")) return "Accounts";
        if (role.contains("HR")) return "HR";
        if (role.contains("Operational")) return "Operations";
        if (role.contains("Managing")) return "Management";
        return CUSTOMER;
    }

    public static String getHomePath(String role) {
        String base = ROLE_BASE_PATHS.getOrDefault(role, "/login");
        return base + (CUSTOMER.equals(role) ? "/home" : "/dashboard");
    }
}
