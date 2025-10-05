# Jogo da Velha

Aplicação web do clássico jogo da velha construída com React, TypeScript e Vite.
Agora o projeto também acompanha um wrapper Android nativo pronto para publicação
na Play Store, com pontos de integração para anúncios do Google AdMob (banner fixo
e intersticial entre partidas).

## Desenvolvimento

```sh
npm install
npm run dev
```

## Tecnologias

- React
- TypeScript
- Vite
- Tailwind CSS
- Android (Kotlin + WebView)
- Google Mobile Ads SDK

## Multijogador

O modo multijogador funciona utilizando apenas o navegador, sem necessidade de banco de dados.
Compartilhe o link da sala com um amigo para jogar online.

## Build para Android

### Pré-requisitos

- Node 18+
- Java 17 e Android Studio (ou Android SDK + Gradle 8.5)
- Conta Google AdMob para criar IDs próprios (substitua os IDs de teste antes de publicar)

### Passo a passo

1. Gere os assets web:

   ```sh
   npm install
   npm run build:android
   ```

   O script gera a build de produção do Vite e copia os arquivos estáticos para
   `android/app/src/main/assets/web`.

2. Abra a pasta `android/` no Android Studio. A IDE baixará as dependências e
   criará o gradle wrapper automaticamente (caso ainda não exista no repositório).

3. Os IDs de anúncio oficiais já estão configurados em
   `android/app/src/main/res/values/strings.xml`:

   ```xml
   <string name="admob_app_id">ca-app-pub-3962525960228971~8235282158</string>
   <string name="admob_banner_unit_id">ca-app-pub-3962525960228971/7301474434</string>
   <string name="admob_interstitial_unit_id">ca-app-pub-3962525960228971/2512289987</string>
   ```

   Caso precise trocar por outros blocos, atualize estes valores antes de gerar
   a versão de release.

4. Ajuste as informações de versão/assinatura em `android/app/build.gradle.kts`
   conforme as exigências de publicação (versionCode, versionName e assinatura
   com o keystore de produção).

5. Gere o bundle de release:

   ```sh
   ./gradlew bundleRelease
   ```

   O arquivo `.aab` estará em `android/app/build/outputs/bundle/release/` e pode
   ser enviado para a Play Store.

### Integração com anúncios

- A interface JavaScript exposta (`window.Android`) é chamada automaticamente
  quando uma partida termina ou uma nova partida começa, permitindo exibir um
  intersticial entre jogos e manter o banner fixo no rodapé.
- Todas as chamadas são encapsuladas em `src/components/GameScreen.tsx`, então é
  possível customizar a lógica de monetização sem impactar o restante do jogo.

### Conformidade Play Store

- O projeto utiliza o SDK oficial do Google Mobile Ads (versão 23.1.0) e segue
  as recomendações de inicialização e uso de IDs de teste durante o
  desenvolvimento.
- A aplicação suporta somente HTTPS dentro do WebView e mantém o histórico de
  partidas localmente, sem coletar dados sensíveis.
- Os ícones adaptativos e recursos obrigatórios já estão incluídos, bastando
  substituir as artes antes da publicação.
