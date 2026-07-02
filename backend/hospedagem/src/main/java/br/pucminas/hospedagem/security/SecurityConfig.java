package br.pucminas.hospedagem.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpStatus;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Login e registro públicos
                .requestMatchers("/auth/**").permitAll()

                // ----- Acessível a qualquer usuário autenticado (ADMIN ou CLIENTE) -----
                // Catálogo de quartos (galeria + detalhe do cliente)
                .requestMatchers(HttpMethod.GET, "/quartos", "/quartos/*").authenticated()
                // Próprios dados do cliente ("Minha Conta")
                .requestMatchers(HttpMethod.GET, "/clientes/me").authenticated()
                .requestMatchers(HttpMethod.PUT, "/clientes/me").authenticated()
                // Próprios aluguéis do cliente (ownership checado no controller)
                .requestMatchers(HttpMethod.GET, "/alugueis/cliente/**", "/alugueis/*").authenticated()
                .requestMatchers(HttpMethod.POST, "/alugueis/**").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/alugueis/**").authenticated()
                // Cliente paga o próprio aluguel no checkout (ownership checado no controller)
                .requestMatchers(HttpMethod.PATCH, "/pagamentos/*/pagar").authenticated()

                // ----- Todo o resto exige ADMIN -----
                // (listagem de clientes, pagamentos, residências, históricos administrativos, etc.)
                .anyRequest().hasRole("ADMIN")
            )
            // Sem token / token inválido → 401 (não 403), alinhado ao tratamento do frontend
            .exceptionHandling(e -> e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
            .userDetailsService(userDetailsService)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
