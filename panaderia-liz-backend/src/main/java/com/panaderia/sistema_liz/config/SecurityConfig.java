package com.panaderia.sistema_liz.config;

import com.panaderia.sistema_liz.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 1. Endpoint público para autenticación y login (Libre de interceptores)
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // Permite pre-flights de CORS desde
                                                                                // Angular

                        // 2. Consulta de productos/categorías (Punto de Venta) - Compatible con
                        // "ADMIN", "CAJERO" o "ROLE_ADMIN"
                        .requestMatchers(HttpMethod.GET, "/api/productos/**", "/api/categorias/**")
                        .hasAnyAuthority("ADMIN", "CAJERO", "ROLE_ADMIN", "ROLE_CAJERO")

                        // 3. Modificación del Catálogo (Crear, Editar, Eliminar)
                        .requestMatchers(HttpMethod.POST, "/api/productos/**", "/api/categorias/**")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/productos/**", "/api/categorias/**")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/productos/**", "/api/categorias/**")
                        .hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                        // 4. Registro e Historial de Ventas
                        .requestMatchers("/api/ventas/**")
                        .hasAnyAuthority("ADMIN", "CAJERO", "ROLE_ADMIN", "ROLE_CAJERO")

                        // Cualquier otra petición requiere token
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // 👇 AGREGAMOS 'rol-usuario' y otras cabeceras comunes a la lista permitida
        config.setAllowedHeaders(
                List.of("Authorization", "Content-Type", "X-User-Rol", "rol-usuario", "Rol-Usuario", "Accept"));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}