package com.panaderia.sistema_liz.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}