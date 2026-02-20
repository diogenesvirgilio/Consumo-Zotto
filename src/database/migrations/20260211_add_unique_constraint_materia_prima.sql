-- Adicionei uma constraint para previnir duplicidade dos nomes.
ALTER TABLE public.materia_prima
ADD CONSTRAINT materia_prima_nome_unique UNIQUE (nome);
