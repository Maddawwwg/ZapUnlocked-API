# 📖 Documentação da ZapUnlocked-API

Esta API permite o envio de mensagens e botões via WhatsApp, além do gerenciamento da sessão via QR Code.

## 🔐 Autenticação

Todas as rotas (exceto o status principal `/`) requerem a passagem da chave de API no header da requisição.

- **Header:** `x-api-key`
- **Valor:** Deve ser o mesmo definido na variável de ambiente `API_KEY`.

---

### Enviar Imagem (via URL)
`POST /send_image`

Envia uma imagem a partir de uma URL pública. A imagem é baixada temporariamente e removida logo após o envio.

```json
{
  "phone": "555185867410",
  "image_url": "https://exemplo.com/imagem.jpg",
  "caption": "Legenda opcional"
}
```

### Enviar Áudio (via URL)
`POST /send_audio`

Envia um áudio. Se for menor que 15MB, envia como áudio padrão (ou PTT). Se for maior, envia como documento.

**Body:**
```json
{
  "phone": "555185867410",
  "audio_url": "https://exemplo.com/audio.mp3",
  "ptt": true,
  "asDocument": false
}
```
- `ptt`: Se `true`, aparece como mensagem de voz (apenas para arquivos pequenos).
- `asDocument`: Força o envio como arquivo.

### Enviar Vídeo (via URL)
`POST /send_video`

Envia um vídeo. Se for menor que 15MB, envia como vídeo normal (com compressão). Se for maior, envia como documento (alta qualidade).

**Body:**
```json
{
  "phone": "555185867410",
  "video_url": "https://exemplo.com/video.mp4",
  "caption": "Legenda do vídeo",
  "gifPlayback": false,
  "ptv": false,
  "asDocument": false
}
```
- `gifPlayback`: Envia como um GIF (sem som).
- `ptv`: Envia como vídeo redondo (curto).
- `asDocument`: Força o envio como documento (2GB limit).

### Enviar Documento (via URL)
`POST /send_document`

Envia qualquer tipo de arquivo (PDF, DOCX, ZIP, etc). Limite de 400MB configurado na API (suporta até 2GB no protocolo).

**Body:**
```json
{
  "phone": "555185867410",
  "document_url": "https://exemplo.com/doc.pdf",
  "fileName": "nome_personalizado.pdf"
}
```

### Enviar Figurinha/Sticker (via URL)
`POST /send_sticker`

Converte uma imagem em figurinha WebP (512x512) com suporte a metadados e modos de redimensionamento.

**Body:**
```json
{
  "phone": "555185867410",
  "image_url": "https://exemplo.com/foto.jpg",
  "pack": "Meu Pack",
  "author": "Antigravity",
  "resizeMode": "blur",
  "blurIntensity": 30
}
```
- `pack`: Nome do pacote (opcional).
- `author`: Autor da figurinha (opcional).
- `resizeMode`: Modos disponíveis: `pad` (padrão), `transparent`, `stretch`, `cover`, `contain`, `blur`.
- `padColor`: Cor do fundo em modo `pad` (ex: `white`, `red`, `#FF0000`). Use `transparent` para sem fundo.
- `blurIntensity`: Intensidade do desfoque no modo `blur` (1 a 100).


---

## 🚀 Endpoints de Mensagens

### 1️⃣ Enviar Mensagem de Texto
Envia uma mensagem simples para um número de WhatsApp.

- **URL:** `/send`
- **Método:** `POST`
- **Autenticação:** Sim (Header `x-api-key`)
- **Body (JSON):**
```json
{
  "phone": "5511999999999",
  "message": "Sua mensagem aqui 💌",
  "quoted_id": "ID_DA_MENSAGEM_ANTERIOR" // Opcional: Para responder citando uma mensagem
}
```

### 2️⃣ Enviar Mensagem com Botão Customizado
Envia uma mensagem contendo um botão interativo.

- **URL:** `/send_wbuttons`
- **Método:** `POST`
- **Autenticação:** Sim (Header `x-api-key`)
- **Body (JSON):**
```json
{
  "phone": "5511999999999",
  "message": "Escolha uma opção:",
  "button_text": "Texto do Botão",
  "quoted_id": "ID_DA_MENSAGEM", // Opcional
  "reaction": "💖", // Opcional: Emoji para reagir ao clique
  "webhook": {
    "url": "https://meuservico.com/webhook",
    "method": "POST",
    "headers": {
      "x-api-key": "SUA_CHAVE",
      "Content-Type": "application/json"
    },
    "body": {
      "event": "button_click",
      "user": "{{from}}",
      "button": "{{text}}",
      "data": "valor_fixo"
    }
  }
}
```

### 3️⃣ Reagir a uma Mensagem
Envia um emoji de reação para uma mensagem específica através do ID.

- **URL:** `/send_reaction`
- **Método:** `POST`
- **Autenticação:** Sim
- **Body:**
```json
{
  "phone": "5511999999999",
  "messageId": "ABC123ID",
  "emoji": "🔥"
}
```


#### Placeholders Disponíveis no Body/Headers:
- `{{from}}`: Número de quem clicou (ex: `5511999999999`).
- `{{phone}}`: Número consultado (usado em buscas de histórico).
- `{{text}}`: Texto do botão ou metadados de busca.
- `{{requested}}`: Quantidade de mensagens solicitadas no histórico.
- `{{found}}`: Quantidade de mensagens encontradas no histórico.
- `{{timestamp}}`: Data/hora atual (ISO format).

---

## 📲 Endpoints de QR Code & Sessão

### 1️⃣ Página do QR Code (HTML)
Acessa a interface visual para escanear o QR Code no navegador.

- **URL:** `/qr`
- **Método:** `GET`
- **Autenticação:** Sim (Header `x-api-key`)

### 2️⃣ Imagem do QR Code (PNG)
Obtém apenas a imagem do QR Code em formato PNG.

- **URL:** `/qr/image`
- **Método:** `GET`
- **Autenticação:** Sim (Header `x-api-key`)

### 3️⃣ Logout (Apagar Sessão)
Desconecta o WhatsApp e remove os arquivos de sessão do servidor.

- **URL:** `/qr/logout`
- **Método:** `POST`
- **Autenticação:** Sim (Header `x-api-key`)

---

## 📊 Endpoints Gerais

### 1️⃣ Status da API
Verifica se o servidor e o WhatsApp estão online.

- **URL:** `/`
- **Método:** `GET`
- **Autenticação:** Não
- **Resposta:**
```json
{
  "status": "online",
  "whatsapp": "connected",
  "timestamp": "2026-01-13T01:47:07.000Z"
}
```

---

## 🛠️ Endpoints de Gerenciamento & Histórico

### 1️⃣ Buscar Histórico de Mensagens
Busca mensagens diretamente dos servidores do WhatsApp (sem salvar no disco).

- **URL:** `/management/fetch_messages`
- **Método:** `POST`
- **Body:**
```json
{
  "phone": "5511999999999",
  "limit": 50,
  "type": "received", // "sent", "received" ou "all"
  "webhook": { // Opcional
    "url": "https://meuservico.com/webhook",
    "method": "POST"
  }
}
```

### 2️⃣ Listar Contatos Recentes
Retorna os chats que tiveram atividade na sessão atual (InMemoryStore).

- **URL:** `/management/recent_contacts`
- **Método:** `POST`
- **Body:**
```json
{
  "limit": 100
}
```
