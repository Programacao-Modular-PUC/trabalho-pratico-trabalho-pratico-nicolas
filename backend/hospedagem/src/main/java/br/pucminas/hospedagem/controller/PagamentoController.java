package br.pucminas.hospedagem.controller;

import br.pucminas.hospedagem.dto.PageResponse;
import br.pucminas.hospedagem.exception.NegocioException;
import br.pucminas.hospedagem.model.Pagamento;
import br.pucminas.hospedagem.model.Usuario;
import br.pucminas.hospedagem.service.PagamentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pagamentos")
@RequiredArgsConstructor
public class PagamentoController {

    private final PagamentoService service;

    @GetMapping
    public PageResponse<Pagamento> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return service.listar(PageRequest.of(page, size));
    }

    @GetMapping("/{id}")
    public Pagamento buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    // Checkout do cliente: paga o próprio aluguel escolhendo a forma (PIX, CARTAO, DINHEIRO)
    @PatchMapping("/{id}/pagar")
    public Pagamento pagar(@PathVariable Long id, @RequestParam String forma,
                           @AuthenticationPrincipal Usuario usuario) {
        if ("ROLE_CLIENTE".equals(usuario.getRole())) {
            Pagamento p = service.buscarPorId(id);
            Long dono = (p.getAluguel() != null && p.getAluguel().getCliente() != null)
                ? p.getAluguel().getCliente().getId() : null;
            if (dono == null || !dono.equals(usuario.getClienteId())) {
                throw new NegocioException("Você só pode pagar os seus próprios aluguéis.");
            }
        }
        return service.pagar(id, forma);
    }
}
