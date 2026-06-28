package br.pucminas.hospedagem;

import br.pucminas.hospedagem.dto.LoginRequest;
import br.pucminas.hospedagem.dto.RegistroRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Integração — Auth")
class AuthIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    @DisplayName("Login com credenciais válidas retorna token e role")
    void loginValido() throws Exception {
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new LoginRequest("admin", "admin123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.role").value("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("Login com senha errada retorna 400")
    void loginSenhaErrada() throws Exception {
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new LoginRequest("admin", "senhaerrada"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Login com usuário inexistente retorna 400")
    void loginUsuarioInexistente() throws Exception {
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new LoginRequest("naoexiste", "qualquer"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Registro completo cria Cliente vinculado e retorna clienteId")
    void registroComDadosCompletos() throws Exception {
        var request = new RegistroRequest(
            "novocliente", "senha123",
            "Maria", "Souza",
            "987.654.321-00",
            "maria@email.com", "(73) 88888-8888",
            "Rua Nova, 456", "45370-000", "1995-05-20"
        );

        mockMvc.perform(post("/auth/registro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("ROLE_CLIENTE"))
                .andExpect(jsonPath("$.clienteId").isNumber());
    }

    @Test
    @DisplayName("Registro com username já existente retorna 400")
    void registroUsernameRepetido() throws Exception {
        var request = new RegistroRequest(
            "admin", "senha123",
            "Fake", "Admin",
            "111.111.111-11",
            "fake@email.com", "(73) 77777-7777",
            "Rua Fake, 1", "00000-000", "1990-01-01"
        );

        mockMvc.perform(post("/auth/registro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Registro com campos obrigatórios ausentes retorna 400")
    void registroCamposInvalidos() throws Exception {
        // username vazio e password ausente — @Valid deve rejeitar
        var request = new RegistroRequest(
            "", "123",   // username vazio, senha curta
            "", "",       // nome, sobrenome vazios
            "", "", "", "", "", ""
        );

        mockMvc.perform(post("/auth/registro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
