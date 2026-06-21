package br.pucminas.hospedagem.service;

import br.pucminas.hospedagem.exception.NegocioException;
import br.pucminas.hospedagem.model.Cliente;
import br.pucminas.hospedagem.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository repository;

    public List<Cliente> listar() {
        return repository.findAll();
    }

    public Cliente buscarPorId(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new NegocioException("Cliente não encontrado: " + id));
    }

    @Transactional
    public Cliente salvar(Cliente cliente) {
        repository.findByCpf(cliente.getCpf()).ifPresent(c -> {
            throw new NegocioException("CPF já cadastrado: " + cliente.getCpf());
        });
        return repository.save(cliente);
    }

    @Transactional
    public Cliente atualizar(Long id, Cliente dados) {
        Cliente existente = buscarPorId(id);
        existente.setNome(dados.getNome());
        existente.setEndereco(dados.getEndereco());
        existente.setTelefone(dados.getTelefone());
        existente.setEmail(dados.getEmail());
        return repository.save(existente);
    }

    @Transactional
    public void deletar(Long id) {
        buscarPorId(id);
        repository.deleteById(id);
    }
}
