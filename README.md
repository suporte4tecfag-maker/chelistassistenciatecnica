# Tecfag - Checklist de Visita Técnica

App instalável (PWA) com login, painel de relatórios arquivados no Google Sheets, e
hospedagem no Vercel. **Sem Google Cloud Console, sem conta de serviço, sem chave** -
tudo fica dentro do próprio Google Sheets, usando o Apps Script que já vem junto.

- **Frontend**: `public/index.html` (checklist + painel), funciona como PWA (pode ser
  instalado no Android/iOS/desktop).
- **Backend**: funções serverless em `/api`, rodando no Vercel.
- **Banco de dados**: uma planilha do Google Sheets (duas abas: `Usuarios` e `Relatorios`),
  acessada através de um pequeno script (Apps Script) publicado dentro da própria planilha.
- **E-mail**: por padrão abre o app de e-mail do celular já preenchido (botão "E-mail").
  Envio automático pelo servidor é opcional (via Resend), veja o passo 5.

---

## 1. Criar a planilha no Google Sheets

1. Crie uma planilha nova no Google Sheets.
2. Renomeie a primeira aba para `Usuarios` e coloque este cabeçalho na linha 1:
   ```
   username | senha | nome | papel
   ```
3. Crie uma segunda aba chamada `Relatorios` com este cabeçalho na linha 1:
   ```
   id | criado_em | tecnico | cliente | equipamento | status | pendencias | payload_json
   ```

## 2. Publicar o Apps Script (o "backend" dentro da planilha)

1. Na planilha, vá em **Extensões > Apps Script**. Abre um editor de código numa aba nova.
2. Apague o conteúdo padrão (`function myFunction() {}`) e cole todo o conteúdo do
   arquivo `apps-script/Code.gs` deste projeto.
3. Logo no topo do código colado, troque:
   ```js
   var SECRET = 'TROQUE-POR-UMA-STRING-BEM-ALEATORIA';
   ```
   por uma string só sua (qualquer sequência de letras/números que só você conhece).
   Guarde esse valor - você vai usar de novo no passo 4.
4. Clique em **Salvar** (ícone de disquete).
5. Clique em **Implantar > Nova implantação**.
6. No tipo, escolha **App da Web**. Configure:
   - **Executar como**: Eu (sua conta)
   - **Quem pode acessar**: Qualquer pessoa
7. Clique em **Implantar**. Na primeira vez, o Google vai pedir autorização - autorize
   com a mesma conta dona da planilha.
8. Copie a **URL do app da Web** que aparece (algo como
   `https://script.google.com/macros/s/AKfycb.../exec`). Guarde essa URL - você vai
   usar no passo 4.

> Sempre que você editar o código do Apps Script depois, precisa fazer
> **Implantar > Gerenciar implantações > editar (ícone de lápis) > Nova versão > Implantar**
> pra que a mudança valha - só salvar o código não atualiza a versão publicada.

## 3. Cadastrar os primeiros usuários

Sem script, sem terminal: abra a aba `Usuarios` da planilha e preencha uma linha por
pessoa, direto nas células:

| username | senha | nome | papel |
|---|---|---|---|
| joao | umaSenhaQualquer | João Silva | tecnico |

- `username`: o que a pessoa digita pra entrar (sem espaço, sem acento de preferência).
- `senha`: a senha dela, em texto normal.
- `nome`: nome que aparece no topo do app ("Olá, João").
- `papel`: hoje só informativo (ex: `tecnico`, `admin`).

Repita para cada pessoa da equipe. Pra trocar a senha de alguém, é só editar a célula
`senha` da linha dela.

**Sobre segurança:** as senhas ficam em texto simples na planilha, visíveis pra quem
tiver acesso de edição a ela. Pra uma ferramenta interna, com a planilha restrita à
equipe, isso costuma ser aceitável - só evite compartilhar a planilha com mais gente
do que precisa ter acesso ao painel.

## 4. Configurar as variáveis de ambiente no Vercel

No painel do Vercel (**Project Settings > Environment Variables**), adicione:

| Variável | O que é |
|---|---|
| `APPS_SCRIPT_URL` | a URL do app da Web que você copiou no passo 2.8 |
| `APPS_SCRIPT_SECRET` | a mesma string que você colocou em `SECRET` no Code.gs (passo 2.3) |
| `JWT_SECRET` | uma string aleatória e secreta, diferente da anterior (ex: gerar em generate-secret.vercel.app/32) |
| `RESEND_API_KEY` | opcional, só se quiser envio automático de e-mail (passo 6) |
| `EMAIL_FROM` | opcional, remetente do e-mail automático |

Depois de adicionar, vá em **Deployments > (⋯) no último deploy > Redeploy** - variáveis
novas só valem a partir do próximo deploy.

## 5. Deploy no Vercel

Opção A - pelo site (mais simples):
1. Suba esta pasta para um repositório no GitHub.
2. Em [vercel.com](https://vercel.com), clique em **Add New > Project** e importe o
   repositório.
3. Nas configurações do projeto, adicione as variáveis de ambiente do passo 4.
4. Clique em **Deploy**.

Opção B - pela CLI:
```bash
npm install -g vercel
vercel login
vercel
# depois de configurar as env vars no dashboard ou via `vercel env add`:
vercel --prod
```

Depois do deploy, o Vercel te dá uma URL tipo `https://tecfag-checklist.vercel.app`.

## 6. (Opcional) Envio automático de e-mail

Sem configurar nada, o botão **E-mail** sempre abre o app de e-mail do celular com o
resumo já preenchido, e o técnico só confirma o envio - isso já funciona sem
nenhuma configuração extra.

Se preferir que o próprio servidor dispare o e-mail automaticamente (sem depender do
app de e-mail do celular), crie uma conta grátis em [resend.com](https://resend.com),
gere uma API key e configure `RESEND_API_KEY` e `EMAIL_FROM` nas variáveis de ambiente.
O endpoint `/api/send-email` já está pronto para isso; só falta conectar um botão do
front-end a ele (hoje ele existe no backend mas o botão "E-mail" usa o método mailto).

## 7. Instalar o app no Android

Depois do deploy, abra a URL no Chrome do Android. O botão **Instalar app** aparece
no topo quando o navegador detecta que o app pode ser instalado (critérios do Chrome:
HTTPS, manifest válido, service worker registrado - tudo isso já está configurado).
Também dá pra instalar pelo menu do Chrome (⋮ > Adicionar à tela inicial).

## Estrutura do projeto

```
public/
  index.html       -> app (checklist + painel + login)
  manifest.json    -> configuração do PWA
  sw.js            -> service worker (funcionamento offline básico)
  icons/           -> ícones do app (gerados a partir da logo Tecfag)
api/
  login.js         -> POST /api/login
  logout.js        -> POST /api/logout
  me.js            -> GET /api/me (checa sessão ativa)
  reports.js       -> GET/POST /api/reports (listar/gravar relatórios)
  send-email.js    -> POST /api/send-email (opcional, via Resend)
lib/
  auth.js          -> assinatura/verificação do login (JWT em cookie httpOnly)
  sheets.js        -> fala com o Apps Script (passo 2) pra ler/gravar na planilha
apps-script/
  Code.gs          -> cole este código dentro da planilha (Extensões > Apps Script)
```

## Limitações a ter em mente

- O Google Sheets como banco funciona bem para o volume de uma equipe técnica (dezenas
  a poucas centenas de relatórios). Se o volume crescer muito, vale migrar para um
  banco de verdade (Postgres/Supabase) no futuro - a estrutura de `/api` já fica pronta
  pra essa troca, só mudando `lib/sheets.js`.
- As senhas ficam em texto simples na planilha (veja o aviso no passo 3). Pra trocar a
  senha de alguém, edite direto a célula na aba `Usuarios`.
- A proteção do Apps Script é a string `APPS_SCRIPT_SECRET` - trate ela como uma senha:
  não deixe pública em nenhum lugar (repositório público, print de tela, etc).
- As assinaturas ficam gravadas como imagem (base64) dentro do `payload_json` de cada
  relatório - isso deixa cada célula da planilha razoavelmente pesada, mas funciona
  bem para o volume esperado.
