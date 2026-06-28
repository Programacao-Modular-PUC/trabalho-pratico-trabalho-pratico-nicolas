package br.pucminas.hospedagem.config;

import br.pucminas.hospedagem.model.Cliente;
import br.pucminas.hospedagem.model.Usuario;
import br.pucminas.hospedagem.repository.ClienteRepository;
import br.pucminas.hospedagem.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository repository;
    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (repository.count() > 0) return;

        // Admin sem vínculo com Cliente
        repository.save(new Usuario(null, "admin", passwordEncoder.encode("admin123"), "ROLE_ADMIN"));

        // Cliente de teste com entidade Cliente vinculada
        Cliente clienteTeste = new Cliente();
        clienteTeste.setNome("Cliente");
        clienteTeste.setSobrenome("Teste");
        clienteTeste.setCpf("000.000.000-00");
        clienteTeste.setEmail("cliente@teste.com");
        clienteTeste.setTelefone("(73) 99999-9999");
        clienteTeste.setEndereco("Rua Teste, 1 — Centro");
        clienteTeste = clienteRepository.save(clienteTeste);

        Usuario usuarioCliente = new Usuario(null, "cliente", passwordEncoder.encode("cliente123"), "ROLE_CLIENTE");
        usuarioCliente.setClienteId(clienteTeste.getId());
        repository.save(usuarioCliente);

        log.info("Usuários padrão criados: admin/admin123 | cliente/cliente123");
    }
}
