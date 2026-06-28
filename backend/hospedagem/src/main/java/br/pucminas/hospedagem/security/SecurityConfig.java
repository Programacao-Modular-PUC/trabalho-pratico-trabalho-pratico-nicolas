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
                // Login público
                .requestMatchers("/auth/**").permitAll()
                // Qualquer GET é acessível para usuários autenticados
                .requestMatchers(HttpMethod.GET).authenticated()
                // Cliente pode realizar e cancelar aluguel
                .requestMatchers(HttpMethod.POST, "/alugueis/**").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/alugueis/**").authenticated()
                // Cliente paga o próprio aluguel no checkout (ownership checado no controller)
                .requestMatchers(HttpMethod.PATCH, "/pagamentos/*/pagar").authenticated()
                // Todo o resto exige ADMIN
                .anyRequest().hasRole("ADMIN")
            )
            // Sem token / token inválido → 401 (não 403), alinhado ao tratamento do frontend
            .exceptionHandling(e -> e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
            .userDetailsService(userDetailsService)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
