# Monitor Eleitoral Brasil 2026 - Polymarket Odds

Painel em tempo real de probabilidades e cotações das eleições presidenciais e de governadores do Brasil com base nos livros de ordens públicos da Polymarket (Gamma & CLOB APIs).

---

## 🚀 Como publicar no GitHub Pages (Sem instalar nada!)

Este repositório já está **100% pré-compilado e pronto para uso direto** na pasta raiz (`/`), sem necessidade de Node.js, `npm install` ou comandos no terminal.

### Passo a Passo:

1. **Suba os arquivos para o seu repositório no GitHub** (via Git ou pelo botão de upload no navegador).
2. No seu repositório do GitHub, clique na aba **Settings** (Configurações).
3. No menu lateral esquerdo, clique em **Pages** (em *Code and automation*).
4. Em **Build and deployment** / **Source**, selecione:
   - **Branch:** `main` (ou `master`)
   - **Folder:** `/ (root)` *(pasta raiz)*
5. Clique em **Save**.
6. Aguarde 30 a 60 segundos. O GitHub exibirá a URL do seu site no topo:
   `https://<seu-usuario>.github.io/<nome-do-repositorio>/`

---

## ⚡ Recursos do Projeto

- **Presidente da República & Governadores de Todos os Estados (27 UFs)**: Alternância dinâmica com cotações e liquidez.
- **Gráficos Interativos**: Séries históricas de flutuação de preço (24h, 7d, 30d, tudo).
- **Sem Dependência de Servidor Backend**: Conexão direta às APIs públicas da Polymarket com CORS liberado.
- **Exportação CSV Oficial**: Download de planilhas com acentuação e formato brasileiro para o Excel.
- **Modo Escuro / Claro**: Interface responsiva e otimizada para computadores e celulares.

## Apuração TSE 2026 — Fonte Oficial

A aba de apuração de 2026 não utiliza resultados hardcoded nem estimativas fictícias. O servidor consulta a configuração oficial `ele-c.json` (EA11) do TSE para descobrir dinamicamente o código da eleição/turno e consome os arquivos de resultado unificado (`-u.json` / `-r.json`) da CDN oficial `resultados.tse.jus.br`.

Para a Zona Eleitoral do Exterior (`ZZ`), o cargo é Presidente e os candidatos e votos são exibidos somente quando constarem no arquivo oficial recebido da Justiça Eleitoral. Se a CDN estiver aguardando a abertura dos arquivos ou temporariamente indisponível, o painel permanece sem números inventados e informa claramente o status de aguardo ou indisponibilidade, sem realizar fallback para dados fictícios.

A camada conta com cache centralizado de 15 segundos e atualização automática (polling configurável entre 15s e 60s).
