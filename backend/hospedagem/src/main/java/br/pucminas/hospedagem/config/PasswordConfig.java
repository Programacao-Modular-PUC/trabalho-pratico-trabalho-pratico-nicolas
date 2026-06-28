package br.pucminas.hospedagem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Define o PasswordEncoder em uma configuração separada do SecurityConfig.
 * Isso evita o ciclo de dependências:
 *   SecurityConfig -> JwtAuthFilter -> AuthService -> PasswordEncoder (SecurityConfig).
 */
@Configuration
public class PasswordConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
