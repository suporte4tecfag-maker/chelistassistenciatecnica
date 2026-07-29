# Tecfag - Checklist de Visita T\u00e9cnica

App instal\u00e1vel (PWA) com login de verdade, painel de relat\u00f3rios arquivados no Google
Sheets, e hospedagem no Vercel.

- **Frontend**: `public/index.html` (checklist + painel), funciona como PWA (pode ser
  instalado no Android/iOS/desktop).
- **Backend**: fun\u00e7\u00f5es serverless em `/api`, rodando no Vercel.
- **Banco de dados**: uma planilha do Google Sheets (duas abas: `Usuarios` e `Relatorios`).
- **E-mail**: por padr\u00e3o abre o app de e-mail do celular j\u00e1 preenchido (bot\u00e3o "E-mail").
  Envio autom\u00e1tico pelo servidor \u00e9 opcional (via Resend), veja o passo 6.

---

## 1. Criar a planilha no Google Sheets

1. Crie uma planilha nova no Google Sheets.
2. Renomeie a primeira aba para `Usuarios` e coloque este cabe\u00e7alho na linha 1:
   ```
   username | senha | nome | papel
   ```
3. Crie uma segunda aba chamada `Relatorios` com este cabe\u00e7alho na linha 1:
   ```
   id | criado_em | tecnico | cliente | equipamento | status | pendencias | payload_json
   ```
4. Pegue o **ID da planilha** na URL, o trecho entre `/d/` e `/edit`:
   `https://docs.google.com/spreadsheets/d/ESTE_TRECHO_AQUI/edit`

## 2. Criar a conta de servi\u00e7o do Google (acesso ao Sheets pela API)

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/) e crie um projeto
   (ou use um existente).
2. Em **APIs e servi\u00e7os > Biblioteca**, ative a **Google Sheets API**.
3. Em **APIs e servi\u00e7os > Credenciais**, clique em **Criar credenciais > Conta de
   servi\u00e7o**. D\u00ea um nome (ex: `tecfag-checklist`) e conclua.
4. Abra a conta de servi\u00e7o criada, aba **Chaves**, clique em **Adicionar chave > Criar
   nova chave > JSON**. Um arquivo `.json` ser\u00e1 baixado.
5. No arquivo JSON baixado, voc\u00ea vai usar dois campos:
   - `client_email` -> vai virar `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` -> vai virar `GOOGLE_PRIVATE_KEY`
6. **Compartilhe a planilha** (bot\u00e3o Compartilhar, no Google Sheets) com o e-mail da
   conta de servi\u00e7o (`client_email`), dando permiss\u00e3o de **Editor**.

## 3. Cadastrar os primeiros usu\u00e1rios

Sem script, sem terminal: abra a aba `Usuarios` da planilha e preencha uma linha por
pessoa, direto nas c\u00e9lulas:

| username | senha | nome | papel |
|---|---|---|---|
| joao | umaSenhaQualquer | Jo\u00e3o Silva | tecnico |

- `username`: o que a pessoa digita pra entrar (sem espa\u00e7o, sem acento de prefer\u00eancia).
- `senha`: a senha dela, em texto normal.
- `nome`: nome que aparece no topo do app ("Ol\u00e1, Jo\u00e3o").
- `papel`: hoje s\u00f3 informativo (ex: `tecnico`, `admin`).

Repita para cada pessoa da equipe. Pra trocar a senha de algu\u00e9m, \u00e9 s\u00f3 editar a c\u00e9lula
`senha` da linha dela.

**Sobre seguran\u00e7a:** as senhas ficam em texto simples na planilha, vis\u00edveis pra quem
tiver acesso de edi\u00e7\u00e3o a ela. Pra uma ferramenta interna, com a planilha restrita \u00e0
equipe, isso costuma ser aceit\u00e1vel - s\u00f3 evite compartilhar a planilha com mais gente
do que precisa ter acesso ao painel.

## 4. Configurar as vari\u00e1veis de ambiente

Copie `.env.example` para `.env` (uso local) e/ou configure as mesmas vari\u00e1veis no
painel do Vercel (**Project Settings > Environment Variables**):

| Vari\u00e1vel | O que \u00e9 |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `client_email` do JSON da conta de servi\u00e7o |
| `GOOGLE_PRIVATE_KEY` | `private_key` do JSON (mantenha as quebras de linha `\n`) |
| `GOOGLE_SHEET_ID` | ID da planilha (passo 1.4) |
| `JWT_SECRET` | uma string aleat\u00f3ria e secreta (ex: gerar em generate-secret.vercel.app/32) |
| `RESEND_API_KEY` | opcional, s\u00f3 se quiser envio autom\u00e1tico de e-mail (passo 6) |
| `EMAIL_FROM` | opcional, remetente do e-mail autom\u00e1tico |

**Aten\u00e7\u00e3o ao colar a `GOOGLE_PRIVATE_KEY` no Vercel:** cole o valor exatamente como
est\u00e1 no JSON, incluindo os `\n` literais e as linhas `-----BEGIN PRIVATE KEY-----` /
`-----END PRIVATE KEY-----`.

## 5. Deploy no Vercel

Op\u00e7\u00e3o A - pelo site (mais simples):
1. Suba esta pasta para um reposit\u00f3rio no GitHub.
2. Em [vercel.com](https://vercel.com), clique em **Add New > Project** e importe o
   reposit\u00f3rio.
3. Nas configura\u00e7\u00f5es do projeto, adicione as vari\u00e1veis de ambiente do passo 4.
4. Clique em **Deploy**.

Op\u00e7\u00e3o B - pela CLI:
```bash
npm install -g vercel
vercel login
vercel
# depois de configurar as env vars no dashboard ou via `vercel env add`:
vercel --prod
```

Depois do deploy, o Vercel te d\u00e1 uma URL tipo `https://tecfag-checklist.vercel.app`.

## 6. (Opcional) Envio autom\u00e1tico de e-mail

Sem configurar nada, o bot\u00e3o **E-mail** sempre abre o app de e-mail do celular com o
resumo j\u00e1 preenchido, e o t\u00e9cnico s\u00f3 confirma o envio - isso j\u00e1 funciona sem
nenhuma configura\u00e7\u00e3o extra.

Se preferir que o pr\u00f3prio servidor dispare o e-mail automaticamente (sem depender do
app de e-mail do celular), crie uma conta gr\u00e1tis em [resend.com](https://resend.com),
gere uma API key e configure `RESEND_API_KEY` e `EMAIL_FROM` nas vari\u00e1veis de ambiente.
O endpoint `/api/send-email` j\u00e1 est\u00e1 pronto para isso; s\u00f3 falta conectar um bot\u00e3o do
front-end a ele (hoje ele existe no backend mas o bot\u00e3o "E-mail" usa o m\u00e9todo mailto).

## 7. Instalar o app no Android

Depois do deploy, abra a URL no Chrome do Android. O bot\u00e3o **Instalar app** aparece
no topo quando o navegador detecta que o app pode ser instalado (crit\u00e9rios do Chrome:
HTTPS, manifest v\u00e1lido, service worker registrado - tudo isso j\u00e1 est\u00e1 configurado).
Tamb\u00e9m d\u00e1 pra instalar pelo menu do Chrome (\u22ee > Adicionar \u00e0 tela inicial).

## Estrutura do projeto

```
public/
  index.html      -> app (checklist + painel + login)
  manifest.json    -> configura\u00e7\u00e3o do PWA
  sw.js            -> service worker (funcionamento offline b\u00e1sico)
  icons/           -> \u00edcones do app (gerados a partir da logo Tecfag)
api/
  login.js         -> POST /api/login
  logout.js        -> POST /api/logout
  me.js            -> GET /api/me (checa sess\u00e3o ativa)
  reports.js        -> GET/POST /api/reports (listar/gravar relat\u00f3rios)
  send-email.js     -> POST /api/send-email (opcional, via Resend)
lib/
  auth.js          -> assinatura/verifica\u00e7\u00e3o do login (JWT em cookie httpOnly)
  sheets.js        -> leitura/escrita no Google Sheets
```

## Limita\u00e7\u00f5es a ter em mente

- O Google Sheets como banco funciona bem para o volume de uma equipe t\u00e9cnica (dezenas
  a poucas centenas de relat\u00f3rios). Se o volume crescer muito, vale migrar para um
  banco de verdade (Postgres/Supabase) no futuro - a estrutura de `/api` j\u00e1 fica pronta
  pra essa troca, s\u00f3 mudando `lib/sheets.js`.
- As senhas ficam em texto simples na planilha (veja o aviso no passo 3). Pra trocar a
  senha de algu\u00e9m, edite direto a c\u00e9lula na aba `Usuarios`.
- As assinaturas ficam gravadas como imagem (base64) dentro do `payload_json` de cada
  relat\u00f3rio - isso deixa cada c\u00e9lula da planilha razoavelmente pesada, mas funciona
  bem para o volume esperado.
