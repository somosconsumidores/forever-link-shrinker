# Deploy Guide - Minify URL no Netlify

## Pré-requisitos
- Conta no Netlify
- Domínio `minify-url.com` configurado
- Projeto conectado ao GitHub (recomendado)

## Fase 1: Deploy Inicial

### 1. Configurar no Netlify
1. Acesse [netlify.com](https://netlify.com) e faça login
2. Clique em "New site from Git"
3. Conecte seu repositório GitHub
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18` (em Environment variables: `NODE_VERSION = 18`)

### 2. Variáveis de Ambiente (se necessário)
No painel do Netlify, vá em Site Settings > Environment Variables e adicione:
- Nenhuma variável necessária (o projeto usa URLs dinâmicas)

## Fase 2: Configuração de Domínio

### 1. Domínio Personalizado
1. No Netlify, vá em Site Settings > Domain management
2. Clique em "Add custom domain"
3. Adicione `minify-url.com`
4. Configure DNS:
   ```
   Type: A Record
   Name: @
   Value: [IP do Netlify - será fornecido]
   
   Type: CNAME
   Name: www
   Value: [seu-site].netlify.app
   ```

### 2. SSL/HTTPS
- O Netlify configurará automaticamente o Let's Encrypt SSL
- Aguarde alguns minutos para ativação

## Fase 3: Configuração do Supabase

### 1. Atualizar URLs de Autenticação
No painel do Supabase, vá em Authentication > URL Configuration:

**Site URL**: `https://minify-url.com`

**Redirect URLs** (adicionar):
- `https://minify-url.com`
- `https://minify-url.com/auth`
- `https://minify-url.com/dashboard`
- `https://minify-url.com/**` (wildcard para todas as rotas)

### 2. Verificar CORS
No Supabase, verifique se o domínio está permitido em:
- API Settings > CORS origins

## Fase 4: Testes Finais

### Checklist de Testes:
- [ ] Site carrega em `https://minify-url.com`
- [ ] Criação de links encurtados funciona
- [ ] Redirecionamento de links curtos funciona
- [ ] Login/registro funciona
- [ ] Dashboard carrega corretamente
- [ ] Analytics funcionam
- [ ] QR codes são gerados
- [ ] Download de QR codes funciona

### URLs de Teste:
1. Criar um link curto: `https://minify-url.com`
2. Testar redirecionamento: `https://minify-url.com/[codigo-gerado]`
3. Ver analytics: `https://minify-url.com/analytics/[codigo-gerado]`

## Troubleshooting

### Problema: "Page Not Found" em links curtos
- Verificar se o arquivo `_redirects` está na pasta `public/`
- Verificar se o deploy incluiu o arquivo

### Problema: "Site URL não válido" no login
- Verificar configuração no Supabase Authentication > URL Configuration
- Aguardar alguns minutos para propagação

### Problema: CORS Error
- Adicionar domínio nas configurações CORS do Supabase
- Verificar se HTTPS está ativo

## Comandos Úteis

```bash
# Build local
npm run build

# Preview local
npm run preview

# Deploy manual (se necessário)
netlify deploy --prod --dir=dist
```