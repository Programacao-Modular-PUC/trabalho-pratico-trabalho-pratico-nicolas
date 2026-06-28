package br.pucminas.hospedagem.service;

import br.pucminas.hospedagem.dto.PageResponse;
import br.pucminas.hospedagem.exception.NegocioException;
import br.pucminas.hospedagem.model.Cliente;
import br.pucminas.hospedagem.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository repository;

    public PageResponse<Cliente> listar(Pageable pageable) {
        return PageResponse.of(repository.findAll(pageable));
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
        existente.setSobrenome(dados.getSobrenome());
        existente.setEndereco(dados.getEndereco());
        existente.setCep(dados.getCep());
        existente.setTelefone(dados.getTelefone());
        existente.setEmail(dados.getEmail());
        existente.setDataNascimento(dados.getDataNascimento());
        return repository.save(existente);
    }

    @Transactional
    public void deletar(Long id) {
        buscarPorId(id);
        repository.deleteById(id);
    }
}
