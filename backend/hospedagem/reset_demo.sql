-- ============================================================
-- RESET do banco para apresentação (estado limpo + usuários padrão)
-- Depois deste script, rode: seed_simulacao.sql e seed_imagens.sql
-- Não precisa reiniciar o backend (o schema já existe).
-- ============================================================
USE hospedagem;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE pagamentos;
TRUNCATE TABLE alugueis;
TRUNCATE TABLE quarto_imagens;
TRUNCATE TABLE quarto_familia_camas;
TRUNCATE TABLE quartos_individual;
TRUNCATE TABLE quartos_casal;
TRUNCATE TABLE quartos_familia;
TRUNCATE TABLE quartos;
TRUNCATE TABLE residencias;
TRUNCATE TABLE clientes;
TRUNCATE TABLE usuarios;

-- Usuários padrão (mesmos que o DataInitializer cria)
INSERT INTO clientes (id, nome, sobrenome, cpf, email, telefone, endereco)
VALUES (1, 'Cliente', 'Teste', '000.000.000-00', 'cliente@teste.com', '(73) 99999-9999', 'Rua Teste, 1 - Centro');

INSERT INTO usuarios (username, password, role, cliente_id)
VALUES ('admin', '$2b$10$zq05/Uah/abZ3UDntQylKu5Jl.uKj1kNURvTs9/QckH50kWW4doSy', 'ROLE_ADMIN', NULL);

INSERT INTO usuarios (username, password, role, cliente_id)
VALUES ('cliente', '$2b$10$kWOtStjE1KjIJ0RzafQWuO2GUgkVs7YxCkjMbAdHEsG5k0IOKPv1S', 'ROLE_CLIENTE', 1);

SET FOREIGN_KEY_CHECKS = 1;
