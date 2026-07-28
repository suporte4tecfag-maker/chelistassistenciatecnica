// Uso: node scripts/gerar-hash-senha.js "minhaSenha123"
// Copie o hash gerado e cole na coluna "password_hash" da aba Usuarios, na mesma linha do usuario.
const bcrypt = require('bcryptjs');

const senha = process.argv[2];
if (!senha) {
  console.log('Uso: node scripts/gerar-hash-senha.js "minhaSenha123"');
  process.exit(1);
}

bcrypt.hash(senha, 10).then((hash) => {
  console.log('\nHash gerado (cole na coluna password_hash da planilha):\n');
  console.log(hash);
  console.log('');
});
