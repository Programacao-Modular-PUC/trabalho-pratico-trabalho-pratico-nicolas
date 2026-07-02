package br.pucminas.hospedagem;

import br.pucminas.hospedagem.dto.LoginRequest;
import br.pucminas.hospedagem.model.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Integração — Aluguéis e Segurança")
class AluguelIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    private String adminToken;
    private String clienteToken;
    private Long clienteId;

    @BeforeEach
    void setUp() throws Exception {
        adminToken   = obterToken("admin",   "admin123");
        clienteToken = obterToken("cliente", "cliente123");

        String loginJson = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new LoginRequest("cliente", "cliente123"))))
                .andReturn().getResponse().getContentAsString();
        clienteId = objectMapper.readTree(loginJson).get("clienteId").asLong();
    }

    // ----- Segurança -----

    @Test
    @DisplayName("Requisição sem token retorna 401")
    void semTokenRetorna401() throws Exception {
        mockMvc.perform(get("/alugueis"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("CLIENTE não pode criar quarto (403 — ADMIN only)")
    void clienteNaoPodeCriarQuarto() throws Exception {
        var quarto = new QuartoIndividual();
        quarto.setValorBase(100.0);
        quarto.setPossuiArCondicionado(false);
        quarto.setPossuiHidromassagem(false);
        quarto.setNumeroCamas(1);
        quarto.setLimiteHospedes(1);

        mockMvc.perform(post("/quartos/individual/1")
                .header("Authorization", "Bearer " + clienteToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(quarto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("ADMIN pode listar aluguéis paginados")
    void adminListaAlugueis() throws Exception {
        mockMvc.perform(get("/alugueis")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.totalPages").isNumber())
                .andExpect(jsonPath("$.page").value(0));
    }

    @Test
    @DisplayName("CLIENTE não pode criar aluguel para outro cliente")
    void clienteNaoPodeCriarAluguelParaOutro() throws Exception {
        long idAlheio = clienteId + 999;
        var dados = new Aluguel();

        mockMvc.perform(post("/alugueis/residencia/1/quarto/1/cliente/" + idAlheio)
                .header("Authorization", "Bearer " + clienteToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dados)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("CLIENTE não pode listar todos os clientes (403)")
    void clienteNaoListaClientes() throws Exception {
        mockMvc.perform(get("/clientes").header("Authorization", "Bearer " + clienteToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CLIENTE não pode listar todos os pagamentos (403)")
    void clienteNaoListaPagamentos() throws Exception {
        mockMvc.perform(get("/pagamentos").header("Authorization", "Bearer " + clienteToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CLIENTE não pode listar todas as residências (403)")
    void clienteNaoListaResidencias() throws Exception {
        mockMvc.perform(get("/residencias").header("Authorization", "Bearer " + clienteToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CLIENTE acessa o catálogo de quartos (200) e os próprios dados (200)")
    void clienteAcessaCatalogoEProprioPerfil() throws Exception {
        mockMvc.perform(get("/quartos").header("Authorization", "Bearer " + clienteToken))
                .andExpect(status().isOk());
        mockMvc.perform(get("/clientes/me").header("Authorization", "Bearer " + clienteToken))
                .andExpect(status().isOk());
    }

    // ----- Fluxo completo -----

    @Test
    @DisplayName("Fluxo completo: residência → quarto → aluguel → cancelar")
    void fluxoCompleto() throws Exception {

        // 1. Criar residência
        var residencia = new Residencia();
        residencia.setEndereco("Rua do Teste");
        residencia.setNumero("1");
        residencia.setBairro("Centro");
        residencia.setCep("45370-000");
        residencia.setTelefone("(73) 99999-9999");
        residencia.setEmail("teste@residencia.com");

        String resJson = mockMvc.perform(post("/residencias")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(residencia)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long residenciaId = objectMapper.readTree(resJson).get("id").asLong();

        // 2. Criar quarto individual
        var quarto = new QuartoIndividual();
        quarto.setValorBase(150.0);
        quarto.setPossuiArCondicionado(true);
        quarto.setPossuiHidromassagem(false);
        quarto.setNumeroCamas(1);
        quarto.setLimiteHospedes(1);

        String quartoJson = mockMvc.perform(post("/quartos/individual/" + residenciaId)
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(quarto)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long quartoId = objectMapper.readTree(quartoJson).get("id").asLong();

        // 3. Criar aluguel (cliente para si mesmo)
        var dados = new Aluguel();
        dados.setDataEntrada(LocalDateTime.now().plusDays(1).withHour(14).withMinute(0).withSecond(0).withNano(0));
        dados.setDataSaida(LocalDateTime.now().plusDays(3).withHour(11).withMinute(0).withSecond(0).withNano(0));

        String aluguelJson = mockMvc.perform(
                post("/alugueis/residencia/" + residenciaId + "/quarto/" + quartoId + "/cliente/" + clienteId)
                .header("Authorization", "Bearer " + clienteToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dados)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("ATIVO"))
                .andExpect(jsonPath("$.quantidadeDiarias").isNumber())
                .andExpect(jsonPath("$.valorFinal").isNumber())
                .andExpect(jsonPath("$.pagamento.status").value("PENDENTE"))
                .andReturn().getResponse().getContentAsString();

        Long aluguelId = objectMapper.readTree(aluguelJson).get("id").asLong();

        // 4. Pagamento aparece na listagem
        mockMvc.perform(get("/pagamentos")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());

        // 5. Cancelar aluguel
        mockMvc.perform(patch("/alugueis/" + aluguelId + "/cancelar")
                .header("Authorization", "Bearer " + clienteToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELADO"));
    }

    // ---- helpers ----

    private String obterToken(String username, String password) throws Exception {
        String response = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new LoginRequest(username, password))))
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("token").asText();
    }
}
