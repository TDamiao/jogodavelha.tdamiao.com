<div align="center">
  <br />
  <p>
    <a href="https://jogodavelha.tdamiao.com"><img src="https://raw.githubusercontent.com/TDamiao/jogodavelha.tdamiao.com/main/public/placeholder.svg" width="200" alt="jogo da velha logo" /></a>
  </p>
  <br />
  <p>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License MIT" /></a>
  </p>
</div>

# Jogo da Velha Online

**Jogue agora: [jogodavelha.tdamiao.com](https://jogodavelha.tdamiao.com)**

O Jogo da Velha Online é uma aplicação web moderna e de código aberto que reinventa o clássico jogo da velha. Construído com as tecnologias mais recentes, como React, TypeScript e Vite, este projeto oferece uma experiência de jogo multiplayer em tempo real, diretamente no seu navegador.

## ✨ Funcionalidades

-   **Multiplayer em Tempo Real:** Jogue com amigos enviando um simples link de convite.
-   **Estatísticas de Jogo:** Acompanhe seu desempenho com estatísticas de vitórias, derrotas e empates.
-   **Design Responsivo:** Jogue em qualquer dispositivo, seja no desktop, tablet ou smartphone.
-   **Interface Moderna:** Uma interface limpa e agradável construída com [Shadcn/ui](https://ui.shadcn.com/) e [Tailwind CSS](https://tailwindcss.com/).

## 🚀 Tecnologias Utilizadas

-   **[React](https://reactjs.org/)** - Biblioteca para construção de interfaces de usuário.
-   **[TypeScript](https://www.typescriptlang.org/)** - Superset de JavaScript que adiciona tipagem estática.
-   **[Vite](https://vitejs.dev/)** - Ferramenta de build extremamente rápida para desenvolvimento web moderno.
-   **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utility-first para estilização.
-   **[Shadcn/ui](https://ui.shadcn.com/)** - Coleção de componentes de UI reusáveis.

## 📂 Estrutura do Projeto

O projeto é organizado da seguinte forma:

```
/
├── public/                # Arquivos estáticos
├── src/
│   ├── components/        # Componentes React
│   │   ├── ui/            # Componentes do Shadcn/ui
│   │   └── *.tsx          # Componentes principais da aplicação
│   ├── hooks/             # Hooks customizados
│   ├── lib/               # Funções utilitárias
│   ├── pages/             # Páginas da aplicação
│   ├── types/             # Tipos e interfaces TypeScript
│   └── utils/             # Utilitários gerais
├── .gitignore
├── index.html
├── package.json
├── README.md
└── ...
```

## 🏁 Como Começar

Para executar o projeto localmente, siga os passos abaixo:

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/TDamiao/jogodavelha.tdamiao.com.git
    cd jogodavelha.tdamiao.com
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento:**

    ```bash
    npm run dev
    ```

    A aplicação estará disponível em `http://localhost:5173`.

## Redis e keep-alive

Copie as variáveis de `.env.example` para `.env.local`. O navegador acessa somente as
funções serverless em `/api`; as credenciais do Redis ficam disponíveis exclusivamente
no servidor.

O comando abaixo atualiza a chave `system:keep-alive` no Upstash:

```bash
npm run redis:keep-alive
```

O workflow `.github/workflows/redis-keep-alive.yml` executa esse comando nos dias 1, 11,
21 e 31 de cada mês. Cadastre `UPSTASH_REDIS_REST_URL` e
`UPSTASH_REDIS_REST_TOKEN` como secrets do repositório no GitHub para habilitá-lo.

No projeto da Vercel, cadastre também `UPSTASH_REDIS_REST_URL` e
`UPSTASH_REDIS_REST_TOKEN` em **Settings > Environment Variables**. Essas variáveis da
Vercel alimentam a API e são diferentes dos repository secrets usados pelo GitHub Actions.

Para executar aplicação e API localmente, use `vercel dev`. O comando `npm run dev`
executa apenas o frontend Vite.

## 🤝 Como Contribuir

Contribuições da comunidade são muito bem-vindas! Se você tem alguma ideia para melhorar o projeto, encontrou um bug ou quer adicionar uma nova funcionalidade, sinta-se à vontade para:

-   Abrir uma [Issue](https://github.com/TDamiao/jogodavelha.tdamiao.com/issues) para discutir suas ideias.
-   Enviar um [Pull Request](https://github.com/TDamiao/jogodavelha.tdamiao.com/pulls) com suas alterações.

**Passos para contribuir:**

1.  Faça um **fork** do projeto.
2.  Crie uma nova **branch** (`git checkout -b feature/sua-feature`).
3.  Faça o **commit** das suas alterações (`git commit -m 'feat: Adiciona sua feature'`).
4.  Faça o **push** para a sua branch (`git push origin feature/sua-feature`).
5.  Abra um **Pull Request**.

## 📄 Licença

Este projeto é distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Feito com ❤️ por [Thiago Damião](httpsf://github.com/TDamiao)
