package br.pucminas.hospedagem.service;

import br.pucminas.hospedagem.dto.LoginRequest;
import br.pucminas.hospedagem.dto.LoginResponse;
import br.pucminas.hospedagem.dto.RegistroRequest;
import br.pucminas.hospedagem.exception.NegocioException;
import br.pucminas.hospedagem.model.Cliente;
import br.pucminas.hospedagem.model.Usuario;
import br.pucminas.hospedagem.repository.ClienteRepository;
import br.pucminas.hospedagem.repository.UsuarioRepository;
import br.pucminas.hospedagem.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final UsuarioRepository repository;
    private final ClienteRepository clienteRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return repository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + username));
    }

    public LoginResponse login(LoginRequest request) {
        Usuario user = repository.findByUsername(request.username())
                .orElseThrow(() -> new NegocioException("Usuário ou senha inválidos."));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new NegocioException("Usuário ou senha inválidos.");
        }

        String token = jwtService.gerarToken(user);
        return new LoginResponse(token, user.getUsername(), user.getRole(), user.getClienteId());
    }

    @Transactional
    public LoginResponse registrar(RegistroRequest request) {
        if (repository.findByUsername(request.username()).isPresent()) {
            throw new NegocioException("Nome de usuário já está em uso.");
        }
        if (clienteRepository.findByCpf(request.cpf()).isPresent()) {
            throw new NegocioException("CPF já cadastrado no sistema.");
        }

        Cliente cliente = new Cliente();
        cliente.setNome(request.nome());
        cliente.setSobrenome(request.sobrenome());
        cliente.setCpf(request.cpf());
        cliente.setEmail(request.email());
        cliente.setTelefone(request.telefone());
        cliente.setEndereco(request.endereco());
        cliente.setCep(request.cep());
        if (request.dataNascimento() != null && !request.dataNascimento().isBlank()) {
            cliente.setDataNascimento(LocalDate.parse(request.dataNascimento()));
        }
        cliente = clienteRepository.save(cliente);

        Usuario user = new Usuario(null, request.username(),
                passwordEncoder.encode(request.password()), "ROLE_CLIENTE");
        user.setClienteId(cliente.getId());
        repository.save(user);

        String token = jwtService.gerarToken(user);
        return new LoginResponse(token, user.getUsername(), user.getRole(), cliente.getId());
    }
}
