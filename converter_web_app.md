---
description: Como converter um site web em aplicativo Android e iOS (Capacitor)
---

# Fluxo de Conversão Web para Mobile (Capacitor)

Siga este passo a passo para transformar qualquer projeto web (HTML, CSS e JS) puro, ou com framework, em um aplicativo mobile nativo utilizando o Capacitor.

### 1. Inicializar o projeto (caso não tenha o package.json)
Se o projeto não tiver um arquivo `package.json`, inicie o NPM:
```powershell
// turbo
npm init -y
```

### 2. Instalar o Capacitor
Instale as bibliotecas base e a interface de linha de comando (CLI) do Capacitor:
```powershell
// turbo
npm install @capacitor/core
npm install -D @capacitor/cli
```

### 3. Configurar o Capacitor
Inicialize a configuração no seu projeto Web (será perguntado o Nome do App, o ID do pacote e o diretório Web — geralmente `www` ou `dist`):
```powershell
npx cap init
```

### 4. Instalar e Adicionar Plataformas (Android / iOS)
Baixe as dependências das plataformas desejadas:
```powershell
// turbo
npm install @capacitor/android @capacitor/ios
```

Adicione as plataformas ao projeto:
```powershell
npx cap add android
npx cap add ios
```

### 5. Sincronizar o Código Web
O Capacitor vai pegar os seus arquivos HTML, CSS e JS presentes na pasta principal (ex: `www`) e mandar para os pacotes nativos (Android e iOS).
*Sempre rode estes comandos após alterar o visual/código do seu site!*

```powershell
// turbo-all
npx cap copy
npx cap sync
```

### 6. Abrir os Projetos e Compilar
Agora, para gerar literalmente o seu `.apk` (Android) ou `.ipa` (iOS), você abrirá os códigos gerados no Android Studio ou Xcode e os compilará nativamente.

**Para Android (requer Android Studio):**
```powershell
npx cap open android
```
No Android Studio: Acesse `Build > Build Bundle(s) / APK(s) > Build APK(s)`.

**Para iOS (requer macOS e Xcode):**
```bash
npx cap open ios
```
No Xcode: Assine o app com a sua conta Apple e clique no botão de "Play" para simular, ou mude para "Any iOS Device" e vá em `Product > Archive` para preparar a publicação na App Store.
