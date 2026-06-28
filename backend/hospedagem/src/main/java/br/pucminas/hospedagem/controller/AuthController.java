package br.pucminas.hospedagem.controller;

import br.pucminas.hospedagem.dto.LoginRequest;
import br.pucminas.hospedagem.dto.LoginResponse;
import br.pucminas.hospedagem.dto.RegistroRequest;
import br.pucminas.hospedagem.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/registro")
    public LoginResponse registrar(@Valid @RequestBody RegistroRequest request) {
        return authService.registrar(request);
    }
}
