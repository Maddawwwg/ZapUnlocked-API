# 🚀 ZapUnlocked-API 🎉📱💥

API profissional para automação de WhatsApp, focada em simplicidade e performance.

## 🛠️ Tecnologias

- **Node.js** ⚡  
- **Express** 🌐  
- **Baileys (Itsuki Fork)** 📲  

---

## 📦 Funcionalidades 🔥

- ✅ Conecta com WhatsApp Web via QR Code estável  
- 📩 Envio de mensagens de texto simples  
- 🔘 Envio de mensagens com botões customizáveis  
- 🔐 Protegido via **API Key** (Variável de Ambiente)  
- 🔄 Reconexão automática  
- 📁 Estrutura modular e organizada  

---

## ⚙️ Documentação da API

Para detalhes completos de todas as requisições, métodos, headers e corpos de mensagem, acesse:

👉 **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

---

## 🚀 Como Iniciar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure a variável de ambiente `API_KEY`.

3. Inicie o servidor:
   ```bash
   npm start
   ```

4. Acesse `/qr` para escanear o código e conectar seu WhatsApp.

---

## 🔐 Segurança

- Todas as requests (exceto status) exigem o header `x-api-key`.
- A sessão é armazenada localmente e pode ser limpa via `/qr/logout`.

---

**Divirta-se automatizando com a ZapUnlocked-API!** 😎📱🚀
