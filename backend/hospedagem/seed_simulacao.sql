-- ============================================================
-- Simulacao de dados — Sistema de Hospedagem (Maraú/BA)
-- 5 clientes | 15 residencias | 15 quartos | 15 alugueis | 15 pagamentos
-- Login dos clientes: cliente1..cliente5  /  senha: senha123
-- IDs na faixa 1000+ para nao colidir com dados existentes.
-- ============================================================

USE hospedagem;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------- CLIENTES ----------
INSERT INTO clientes (id, nome, sobrenome, cpf, email, telefone, endereco, cep, data_nascimento) VALUES (1001, 'Ana', 'Souza', '111.111.111-11', 'ana.souza@email.com', '(73) 98801-0001', 'Rua das Flores, 10', '45520-000', '1990-03-12');
INSERT INTO clientes (id, nome, sobrenome, cpf, email, telefone, endereco, cep, data_nascimento) VALUES (1002, 'Bruno', 'Lima', '222.222.222-22', 'bruno.lima@email.com', '(73) 98801-0002', 'Av. Beira Mar, 200', '45520-000', '1985-07-25');
INSERT INTO clientes (id, nome, sobrenome, cpf, email, telefone, endereco, cep, data_nascimento) VALUES (1003, 'Carla', 'Mendes', '333.333.333-33', 'carla.mendes@email.com', '(73) 98801-0003', 'Rua do Sol, 55', '45520-000', '1992-11-03');
INSERT INTO clientes (id, nome, sobrenome, cpf, email, telefone, endereco, cep, data_nascimento) VALUES (1004, 'Diego', 'Alves', '444.444.444-44', 'diego.alves@email.com', '(73) 98801-0004', 'Travessa da Praia, 8', '45520-000', '1988-01-19');
INSERT INTO clientes (id, nome, sobrenome, cpf, email, telefone, endereco, cep, data_nascimento) VALUES (1005, 'Elaine', 'Rocha', '555.555.555-55', 'elaine.rocha@email.com', '(73) 98801-0005', 'Rua Verde, 32', '45520-000', '1995-09-30');

-- ---------- USUARIOS (login ROLE_CLIENTE) ----------
INSERT INTO usuarios (id, username, password, role, cliente_id) VALUES (1001, 'cliente1', '$2b$10$vSy/LAaTc5C4F0G1PEEF3.uWRhkuP5366hWzBpcrrK/d0LOkEAiRu', 'ROLE_CLIENTE', 1001);
INSERT INTO usuarios (id, username, password, role, cliente_id) VALUES (1002, 'cliente2', '$2b$10$vSy/LAaTc5C4F0G1PEEF3.uWRhkuP5366hWzBpcrrK/d0LOkEAiRu', 'ROLE_CLIENTE', 1002);
INSERT INTO usuarios (id, username, password, role, cliente_id) VALUES (1003, 'cliente3', '$2b$10$vSy/LAaTc5C4F0G1PEEF3.uWRhkuP5366hWzBpcrrK/d0LOkEAiRu', 'ROLE_CLIENTE', 1003);
INSERT INTO usuarios (id, username, password, role, cliente_id) VALUES (1004, 'cliente4', '$2b$10$vSy/LAaTc5C4F0G1PEEF3.uWRhkuP5366hWzBpcrrK/d0LOkEAiRu', 'ROLE_CLIENTE', 1004);
INSERT INTO usuarios (id, username, password, role, cliente_id) VALUES (1005, 'cliente5', '$2b$10$vSy/LAaTc5C4F0G1PEEF3.uWRhkuP5366hWzBpcrrK/d0LOkEAiRu', 'ROLE_CLIENTE', 1005);

-- ---------- RESIDENCIAS ----------
INSERT INTO residencias (id, endereco, numero, bairro, cep, telefone, email) VALUES (1001, 'Rua da Praia', '100', 'Barra Grande', '45520-000', '(73) 3258-1001', 'res1001@hosp.com');
INSERT INTO residencias (id, endereco, numero, bairro, cep, telefone, email) VALUES (1002, 'Alameda dos Coqueiros', '101', 'Taipus de Fora', '45520-000', '(73) 3258-1002', 'res1002@hosp.com');
INSERT INTO residencias (id, endereco, numero, bairro, cep, telefone, email) VALUES (1003, 'Estrada do Farol', '102', 'Saquaira', '45520-000', '(73) 3258-1003', 'res1003@hosp.com');
INSERT INTO residencias (id, endereco, numero, bairro, cep, telefone, email) VALUES (1004, 'Rua da Praia', '110', 'Taipus de Fora', '45520-000', '(73) 3258-1004', 'res1004@hosp.com');
INSERT INTO residencias (id, endereco, numero, bairro, cep, telefone, email) VALUES (1005, 'Alameda dos Coqueiros', '111', 'Saquaira', '45520-000', '(73) 3258-1005', 'res1005@hosp.com');
INSERT INTO residencias (id, endereco, numero, bairro, cep, telefone, email) VALUES (1006, 'Estrada do Farol', '112', 'Campinho', '45520-000', '(73) 3258-1006', 'res1006@hosp.com');
INSERT INTO residencias (id, endereco, numero, bairro, cep, telefone, email) VALUES (1007, 'Rua da Praia', '120', 'Saquaira', '45520-000', '(73) 3258-1007', 'res1007@hosp.com');
INSERT INTO residencias (id, endereco, numero, bairro, cep, telefone, email) VALUES (1008, 'Alameda dos Coqueiros', '121', 'Campinho', '45520-000', '(73) 3258-1008', 'res1008@hosp.com');
INSERT INTO residencias (id, endereco, numero, bairro, cep, telefone, email) VALUES (1009, 'Estrada do Farol', '122', 'Ponta do Muta', '45520-000', '(73) 3258-1009', 'res1009@hosp.com');
INSERT INTO residencias (id, endereco, numero, bairro, cep, telefone, email) VALUES (1010, 'Rua da Praia', '130', 'Campinho', '45520-000', '(73) 3258-1010', 'res1010@hosp.com');
INSERT INTO residencias (id, endereco, numero, bairro, cep, telefone, email) VALUES (1011, 'Alameda dos Coqueiros', '131', 'Ponta do Muta', '45520-000', '(73) 3258-1011', 'res1011@hosp.com');
INSERT INTO residencias (id, endereco, numero, bairro, cep, telefone, email) VALUES (1012, 'Estrada do Farol', '132', 'Barra Grande', '45520-000', '(73) 3258-1012', 'res1012@hosp.com');
INSERT INTO residencias (id, endereco, numero, bairro, cep, telefone, email) VALUES (1013, 'Rua da Praia', '140', 'Ponta do Muta', '45520-000', '(73) 3258-1013', 'res1013@hosp.com');
INSERT INTO residencias (id, endereco, numero, bairro, cep, telefone, email) VALUES (1014, 'Alameda dos Coqueiros', '141', 'Barra Grande', '45520-000', '(73) 3258-1014', 'res1014@hosp.com');
INSERT INTO residencias (id, endereco, numero, bairro, cep, telefone, email) VALUES (1015, 'Estrada do Farol', '142', 'Taipus de Fora', '45520-000', '(73) 3258-1015', 'res1015@hosp.com');

-- ---------- QUARTOS (tabela base) ----------
INSERT INTO quartos (id, valor_base, possui_ar_condicionado, possui_hidromassagem, residencia_id, tipo_quarto) VALUES (1001, 150.0, 1, 0, 1001, 'INDIVIDUAL');
INSERT INTO quartos (id, valor_base, possui_ar_condicionado, possui_hidromassagem, residencia_id, tipo_quarto) VALUES (1002, 200.0, 1, 1, 1002, 'CASAL');
INSERT INTO quartos (id, valor_base, possui_ar_condicionado, possui_hidromassagem, residencia_id, tipo_quarto) VALUES (1003, 180.0, 1, 0, 1003, 'FAMILIA');
INSERT INTO quartos (id, valor_base, possui_ar_condicionado, possui_hidromassagem, residencia_id, tipo_quarto) VALUES (1004, 150.0, 1, 0, 1004, 'INDIVIDUAL');
INSERT INTO quartos (id, valor_base, possui_ar_condicionado, possui_hidromassagem, residencia_id, tipo_quarto) VALUES (1005, 200.0, 1, 1, 1005, 'CASAL');
INSERT INTO quartos (id, valor_base, possui_ar_condicionado, possui_hidromassagem, residencia_id, tipo_quarto) VALUES (1006, 180.0, 1, 0, 1006, 'FAMILIA');
INSERT INTO quartos (id, valor_base, possui_ar_condicionado, possui_hidromassagem, residencia_id, tipo_quarto) VALUES (1007, 150.0, 1, 0, 1007, 'INDIVIDUAL');
INSERT INTO quartos (id, valor_base, possui_ar_condicionado, possui_hidromassagem, residencia_id, tipo_quarto) VALUES (1008, 200.0, 1, 1, 1008, 'CASAL');
INSERT INTO quartos (id, valor_base, possui_ar_condicionado, possui_hidromassagem, residencia_id, tipo_quarto) VALUES (1009, 180.0, 1, 0, 1009, 'FAMILIA');
INSERT INTO quartos (id, valor_base, possui_ar_condicionado, possui_hidromassagem, residencia_id, tipo_quarto) VALUES (1010, 150.0, 1, 0, 1010, 'INDIVIDUAL');
INSERT INTO quartos (id, valor_base, possui_ar_condicionado, possui_hidromassagem, residencia_id, tipo_quarto) VALUES (1011, 200.0, 1, 1, 1011, 'CASAL');
INSERT INTO quartos (id, valor_base, possui_ar_condicionado, possui_hidromassagem, residencia_id, tipo_quarto) VALUES (1012, 180.0, 1, 0, 1012, 'FAMILIA');
INSERT INTO quartos (id, valor_base, possui_ar_condicionado, possui_hidromassagem, residencia_id, tipo_quarto) VALUES (1013, 150.0, 1, 0, 1013, 'INDIVIDUAL');
INSERT INTO quartos (id, valor_base, possui_ar_condicionado, possui_hidromassagem, residencia_id, tipo_quarto) VALUES (1014, 200.0, 1, 1, 1014, 'CASAL');
INSERT INTO quartos (id, valor_base, possui_ar_condicionado, possui_hidromassagem, residencia_id, tipo_quarto) VALUES (1015, 180.0, 1, 0, 1015, 'FAMILIA');

-- ---------- QUARTOS INDIVIDUAL ----------
INSERT INTO quartos_individual (id, numero_camas, limite_hospedes) VALUES (1001, 2, 2);
INSERT INTO quartos_individual (id, numero_camas, limite_hospedes) VALUES (1004, 2, 2);
INSERT INTO quartos_individual (id, numero_camas, limite_hospedes) VALUES (1007, 2, 2);
INSERT INTO quartos_individual (id, numero_camas, limite_hospedes) VALUES (1010, 2, 2);
INSERT INTO quartos_individual (id, numero_camas, limite_hospedes) VALUES (1013, 2, 2);

-- ---------- QUARTOS CASAL ----------
INSERT INTO quartos_casal (id, tipo_cama, possui_berco) VALUES (1002, 'QUEEN', 1);
INSERT INTO quartos_casal (id, tipo_cama, possui_berco) VALUES (1005, 'QUEEN', 1);
INSERT INTO quartos_casal (id, tipo_cama, possui_berco) VALUES (1008, 'QUEEN', 1);
INSERT INTO quartos_casal (id, tipo_cama, possui_berco) VALUES (1011, 'QUEEN', 1);
INSERT INTO quartos_casal (id, tipo_cama, possui_berco) VALUES (1014, 'QUEEN', 1);

-- ---------- QUARTOS FAMILIA ----------
INSERT INTO quartos_familia (id, capacidade_maxima, quantidade_ambientes, numero_hospedes) VALUES (1003, 8, 3, 5);
INSERT INTO quartos_familia (id, capacidade_maxima, quantidade_ambientes, numero_hospedes) VALUES (1006, 8, 3, 5);
INSERT INTO quartos_familia (id, capacidade_maxima, quantidade_ambientes, numero_hospedes) VALUES (1009, 8, 3, 5);
INSERT INTO quartos_familia (id, capacidade_maxima, quantidade_ambientes, numero_hospedes) VALUES (1012, 8, 3, 5);
INSERT INTO quartos_familia (id, capacidade_maxima, quantidade_ambientes, numero_hospedes) VALUES (1015, 8, 3, 5);

-- ---------- CAMAS DOS QUARTOS FAMILIA ----------
INSERT INTO quarto_familia_camas (quarto_id, tipo_cama) VALUES (1003, 'CASAL'), (1003, 'SOLTEIRO');
INSERT INTO quarto_familia_camas (quarto_id, tipo_cama) VALUES (1006, 'CASAL'), (1006, 'SOLTEIRO');
INSERT INTO quarto_familia_camas (quarto_id, tipo_cama) VALUES (1009, 'CASAL'), (1009, 'SOLTEIRO');
INSERT INTO quarto_familia_camas (quarto_id, tipo_cama) VALUES (1012, 'CASAL'), (1012, 'SOLTEIRO');
INSERT INTO quarto_familia_camas (quarto_id, tipo_cama) VALUES (1015, 'CASAL'), (1015, 'SOLTEIRO');

-- ---------- ALUGUEIS ----------
INSERT INTO alugueis (id, residencia_id, quarto_id, cliente_id, data_entrada, data_saida, quantidade_diarias, valor_final, status) VALUES (1001, 1001, 1001, 1001, '2026-07-01 14:00:00', '2026-07-05 11:00:00', 4, 800.0, 'ATIVO');
INSERT INTO alugueis (id, residencia_id, quarto_id, cliente_id, data_entrada, data_saida, quantidade_diarias, valor_final, status) VALUES (1002, 1002, 1002, 1001, '2026-07-01 14:00:00', '2026-07-05 11:00:00', 4, 1300.0, 'ATIVO');
INSERT INTO alugueis (id, residencia_id, quarto_id, cliente_id, data_entrada, data_saida, quantidade_diarias, valor_final, status) VALUES (1003, 1003, 1003, 1001, '2026-07-01 14:00:00', '2026-07-05 11:00:00', 4, 1214.0, 'ATIVO');
INSERT INTO alugueis (id, residencia_id, quarto_id, cliente_id, data_entrada, data_saida, quantidade_diarias, valor_final, status) VALUES (1004, 1004, 1004, 1002, '2026-07-01 14:00:00', '2026-07-05 11:00:00', 4, 800.0, 'ATIVO');
INSERT INTO alugueis (id, residencia_id, quarto_id, cliente_id, data_entrada, data_saida, quantidade_diarias, valor_final, status) VALUES (1005, 1005, 1005, 1002, '2026-07-01 14:00:00', '2026-07-05 11:00:00', 4, 1300.0, 'ATIVO');
INSERT INTO alugueis (id, residencia_id, quarto_id, cliente_id, data_entrada, data_saida, quantidade_diarias, valor_final, status) VALUES (1006, 1006, 1006, 1002, '2026-07-01 14:00:00', '2026-07-05 11:00:00', 4, 1214.0, 'ATIVO');
INSERT INTO alugueis (id, residencia_id, quarto_id, cliente_id, data_entrada, data_saida, quantidade_diarias, valor_final, status) VALUES (1007, 1007, 1007, 1003, '2026-07-01 14:00:00', '2026-07-05 11:00:00', 4, 800.0, 'ATIVO');
INSERT INTO alugueis (id, residencia_id, quarto_id, cliente_id, data_entrada, data_saida, quantidade_diarias, valor_final, status) VALUES (1008, 1008, 1008, 1003, '2026-07-01 14:00:00', '2026-07-05 11:00:00', 4, 1300.0, 'ATIVO');
INSERT INTO alugueis (id, residencia_id, quarto_id, cliente_id, data_entrada, data_saida, quantidade_diarias, valor_final, status) VALUES (1009, 1009, 1009, 1003, '2026-07-01 14:00:00', '2026-07-05 11:00:00', 4, 1214.0, 'ATIVO');
INSERT INTO alugueis (id, residencia_id, quarto_id, cliente_id, data_entrada, data_saida, quantidade_diarias, valor_final, status) VALUES (1010, 1010, 1010, 1004, '2026-07-01 14:00:00', '2026-07-05 11:00:00', 4, 800.0, 'ATIVO');
INSERT INTO alugueis (id, residencia_id, quarto_id, cliente_id, data_entrada, data_saida, quantidade_diarias, valor_final, status) VALUES (1011, 1011, 1011, 1004, '2026-07-01 14:00:00', '2026-07-05 11:00:00', 4, 1300.0, 'ATIVO');
INSERT INTO alugueis (id, residencia_id, quarto_id, cliente_id, data_entrada, data_saida, quantidade_diarias, valor_final, status) VALUES (1012, 1012, 1012, 1004, '2026-07-01 14:00:00', '2026-07-05 11:00:00', 4, 1214.0, 'ATIVO');
INSERT INTO alugueis (id, residencia_id, quarto_id, cliente_id, data_entrada, data_saida, quantidade_diarias, valor_final, status) VALUES (1013, 1013, 1013, 1005, '2026-07-01 14:00:00', '2026-07-05 11:00:00', 4, 800.0, 'ATIVO');
INSERT INTO alugueis (id, residencia_id, quarto_id, cliente_id, data_entrada, data_saida, quantidade_diarias, valor_final, status) VALUES (1014, 1014, 1014, 1005, '2026-07-01 14:00:00', '2026-07-05 11:00:00', 4, 1300.0, 'ATIVO');
INSERT INTO alugueis (id, residencia_id, quarto_id, cliente_id, data_entrada, data_saida, quantidade_diarias, valor_final, status) VALUES (1015, 1015, 1015, 1005, '2026-07-01 14:00:00', '2026-07-05 11:00:00', 4, 1214.0, 'ATIVO');

-- ---------- PAGAMENTOS ----------
INSERT INTO pagamentos (id, aluguel_id, valor_pago, data_pagamento, status) VALUES (1001, 1001, 800.0, NULL, 'PENDENTE');
INSERT INTO pagamentos (id, aluguel_id, valor_pago, data_pagamento, status) VALUES (1002, 1002, 1300.0, NULL, 'PENDENTE');
INSERT INTO pagamentos (id, aluguel_id, valor_pago, data_pagamento, status) VALUES (1003, 1003, 1214.0, '2026-07-01 10:00:00', 'CONFIRMADO');
INSERT INTO pagamentos (id, aluguel_id, valor_pago, data_pagamento, status) VALUES (1004, 1004, 800.0, NULL, 'PENDENTE');
INSERT INTO pagamentos (id, aluguel_id, valor_pago, data_pagamento, status) VALUES (1005, 1005, 1300.0, NULL, 'PENDENTE');
INSERT INTO pagamentos (id, aluguel_id, valor_pago, data_pagamento, status) VALUES (1006, 1006, 1214.0, '2026-07-01 10:00:00', 'CONFIRMADO');
INSERT INTO pagamentos (id, aluguel_id, valor_pago, data_pagamento, status) VALUES (1007, 1007, 800.0, NULL, 'PENDENTE');
INSERT INTO pagamentos (id, aluguel_id, valor_pago, data_pagamento, status) VALUES (1008, 1008, 1300.0, NULL, 'PENDENTE');
INSERT INTO pagamentos (id, aluguel_id, valor_pago, data_pagamento, status) VALUES (1009, 1009, 1214.0, '2026-07-01 10:00:00', 'CONFIRMADO');
INSERT INTO pagamentos (id, aluguel_id, valor_pago, data_pagamento, status) VALUES (1010, 1010, 800.0, NULL, 'PENDENTE');
INSERT INTO pagamentos (id, aluguel_id, valor_pago, data_pagamento, status) VALUES (1011, 1011, 1300.0, NULL, 'PENDENTE');
INSERT INTO pagamentos (id, aluguel_id, valor_pago, data_pagamento, status) VALUES (1012, 1012, 1214.0, '2026-07-01 10:00:00', 'CONFIRMADO');
INSERT INTO pagamentos (id, aluguel_id, valor_pago, data_pagamento, status) VALUES (1013, 1013, 800.0, NULL, 'PENDENTE');
INSERT INTO pagamentos (id, aluguel_id, valor_pago, data_pagamento, status) VALUES (1014, 1014, 1300.0, NULL, 'PENDENTE');
INSERT INTO pagamentos (id, aluguel_id, valor_pago, data_pagamento, status) VALUES (1015, 1015, 1214.0, '2026-07-01 10:00:00', 'CONFIRMADO');

SET FOREIGN_KEY_CHECKS = 1;
-- Fim da simulacao.
