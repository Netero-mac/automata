import { neon } from '@neondatabase/serverless';

// Verifica se a URL do banco foi carregada corretamente
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não está definida no arquivo .env');
}

// Instancia a conexão serverless com o Neon
export const sql = neon(process.env.DATABASE_URL);