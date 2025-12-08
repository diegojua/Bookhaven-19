# Documentação do Projeto Bookhaven-19

## Visão Geral
O **Bookhaven-19** é uma aplicação web moderna para leitura e gerenciamento de livros digitais. O sistema permite que usuários façam upload de livros (PDF, EPUB, TXT), organizem sua biblioteca pessoal e leiam o conteúdo com uma experiência adaptável e confortável.

## Tecnologias Utilizadas

### Frontend
- **Framework:** React (com Vite)
- **Linguagem:** JavaScript (JSX)
- **Estilização:** Tailwind CSS
- **Componentes UI:** Shadcn/UI (baseado em Radix UI)
- **Bibliotecas Principais:**
  - `react-router-dom`: Navegação e rotas.
  - `axios`: Requisições HTTP.
  - `react-reader`: Renderização de arquivos EPUB.
  - `lucide-react`: Ícones.
  - `sonner`: Notificações (Toasts).

### Backend
- **Framework:** FastAPI (Python)
- **Banco de Dados:** Supabase (PostgreSQL)
- **Autenticação:** JWT (JSON Web Tokens) com `PyJWT` e `passlib` (bcrypt).
- **Processamento de Arquivos:**
  - `pypdf`: Extração de texto e imagens de arquivos PDF.
- **Servidor:** Uvicorn.

---

## Funcionalidades Implementadas

### 1. Autenticação e Usuários
- **Registro:** Criação de conta com email e senha únicos.
- **Login:** Autenticação segura retornando token JWT.
- **Persistência:** Sessão mantida via armazenamento local do token.

### 2. Gestão de Biblioteca
- **Upload de Livros:** Suporte para arquivos `.pdf`, `.epub` e `.txt`.
- **Listagem:** Visualização de capas, títulos e autores.
- **Metadados:** Armazenamento de informações como título, autor, categoria e tamanho do arquivo.

### 3. Leitor de Livros (Reader)
O leitor é o núcleo da aplicação e suporta múltiplos modos:

- **Modo PDF (Original):** Visualização do PDF original via `iframe` (nativo do navegador).
- **Modo EPUB:** Renderização interativa com paginação e capítulos via `react-reader`.
- **Modo Leitura Adaptativa (Novo):**
  - **Conversão Automática:** Extrai texto e imagens de arquivos PDF e TXT.
  - **Personalização:** Permite ajustar:
    - **Tema:** Claro, Sépia, Escuro.
    - **Fonte:** Merriweather, Georgia, Times New Roman, Inter, Roboto.
    - **Tamanho da Fonte:** Ajuste granular.
    - **Espaçamento entre Linhas.**
  - **Imagens:** Imagens contidas nos PDFs são extraídas e exibidas intercaladas com o texto.

### 4. Progresso e Marcadores
- **Progresso Automático:** Salva a última página lida e a porcentagem de conclusão.
- **Marcadores:** Permite adicionar notas e marcadores em páginas específicas.
- **Sincronização:** O progresso é salvo no banco de dados e sincronizado entre sessões.

---

## Estrutura da API (Backend)

### Autenticação
- `POST /api/auth/register`: Registrar novo usuário.
- `POST /api/auth/login`: Login e obtenção de token.
- `GET /api/auth/me`: Dados do usuário atual.

### Livros
- `GET /api/books`: Listar livros (públicos ou do usuário).
- `POST /api/books`: Upload de novo livro.
- `GET /api/books/{id}`: Detalhes de um livro.
- `DELETE /api/books/{id}`: Remover livro.
- **`GET /api/books/{id}/extract-text`**: Extrai conteúdo (texto e imagens base64) de PDFs e TXTs.

### Leitura
- `GET /api/reading/progress/{book_id}`: Obter progresso.
- `PUT /api/reading/progress/{book_id}`: Atualizar progresso.
- `GET /api/preferences`: Obter preferências de leitura do usuário.
- `PUT /api/preferences`: Atualizar preferências.

### Marcadores
- `POST /api/bookmarks`: Criar marcador.
- `GET /api/bookmarks/{book_id}`: Listar marcadores de um livro.

---

## Histórico de Alterações Recentes (Sessão Atual)

1.  **Correção de CORS:** Configuração do backend para aceitar requisições da porta `3000` (Dev) e `4173` (Preview).
2.  **Implementação da Extração de PDF:**
    - Adicionado endpoint `/extract-text` usando `pypdf`.
    - Lógica para extrair texto página a página.
    - **Atualização:** Adicionada extração de imagens (convertidas para Base64) para enriquecer o modo leitura.
3.  **Frontend - Modo Leitura:**
    - Criação do botão "Modo Leitura" / "Modo Original".
    - Ativação automática do modo texto para PDFs.
    - Renderização de imagens extraídas entre os blocos de texto.
    - Integração completa com o sistema de preferências (temas/fontes).
4.  **Correções de Bugs:**
    - Correção do erro `404` no endpoint de extração (movido para antes do roteador ser incluído).
    - Ajuste no modelo de dados `ReadingProgress` (campo `created_at` removido para compatibilidade com Supabase).

---

## Como Rodar o Projeto

### Backend
1.  Navegue até a pasta `backend`.
2.  Instale as dependências: `pip install -r requirements.txt`.
3.  Inicie o servidor:
    ```bash
    python server.py
    ```
    O servidor rodará em `http://localhost:8000`.

### Frontend
1.  Navegue até a pasta `frontend`.
2.  Instale as dependências: `npm install`.
3.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run start
    ```
    (Nota: O script `start` está configurado para rodar o `vite`, que é o modo de desenvolvimento).
    O app estará disponível em `http://localhost:3000`.
