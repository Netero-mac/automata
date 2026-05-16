import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

export async function GET() {
  try {
    // Executa as queries de colunas e chaves estrangeiras em paralelo
    // Tipos esperados das linhas retornadas pelas queries
    type ColumnRow = {
      table_name: string;
      column_name: string;
      data_type: string;
      is_primary: boolean;
    };

    type ForeignKeyRow = {
      source_table: string;
      source_column: string;
      target_table: string;
      target_column: string;
    };

    const [columnsResult, foreignKeysResult] = (await Promise.all([
      // Query 1: Colunas e Chaves Primárias
      sql`
        SELECT 
          c.table_name, 
          c.column_name, 
          c.data_type,
          CASE WHEN tc.constraint_type = 'PRIMARY KEY' THEN true ELSE false END as is_primary
        FROM 
          information_schema.columns c
        LEFT JOIN 
          information_schema.key_column_usage kcu ON c.column_name = kcu.column_name AND c.table_name = kcu.table_name
        LEFT JOIN 
          information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name AND tc.constraint_type = 'PRIMARY KEY'
        WHERE 
          c.table_schema = 'public'
        ORDER BY 
          c.table_name, c.ordinal_position;
      `,
      // Query 2: Mapeamento de Chaves Estrangeiras (Relacionamentos)
      sql`
        SELECT
          tc.table_name AS source_table,
          kcu.column_name AS source_column,
          ccu.table_name AS target_table,
          ccu.column_name AS target_column
        FROM
          information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE 
          tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_schema = 'public';
      `
    ]) as [ColumnRow[], ForeignKeyRow[]]);

    // 1. Processar Tabelas e Colunas (Nodes)
    type Column = { name: string; type: string; isPrimary: boolean };
    type Table = { tableName: string; columns: Column[] };

    const tablesMap: Record<string, Table> = {};

    columnsResult.forEach((row) => {
      if (!tablesMap[row.table_name]) {
        tablesMap[row.table_name] = {
          tableName: row.table_name,
          columns: []
        };
      }

      // Evita duplicidade de colunas gerada pelos JOINS de restrições
      const colExists = tablesMap[row.table_name].columns.some((c: Column) => c.name === row.column_name);
      if (!colExists) {
        tablesMap[row.table_name].columns.push({
          name: row.column_name,
          type: row.data_type,
          isPrimary: row.is_primary
        });
      }
    });

    const nodes = Object.values(tablesMap).map((table, index) => ({
      id: `tabela-${table.tableName}`,
      type: 'databaseTable',
      position: { x: 150 + (index * 380), y: 150 }, // Organiza lado a lado no Canvas
      data: {
        label: table.tableName,
        colorAccent: index % 2 === 0 ? '#3b82f6' : '#10b981', 
        columns: table.columns
      }
    }));

    // 2. Processar Relacionamentos (Edges)
    const edges = foreignKeysResult.map((fk, index) => ({
      id: `edge-${index}`,
      source: `tabela-${fk.target_table}`,          // Tabela pai (origem da PK, ex: usuarios)
      sourceHandle: `source-${fk.target_column}`,   // Handle associado à coluna PK
      target: `tabela-${fk.source_table}`,          // Tabela filha (contém a FK, ex: pedidos)
      targetHandle: `target-${fk.source_column}`,   // Handle associado à coluna FK
      animated: true,                               // Linha tracejada em movimento
      style: { 
        stroke: '#4b5563', 
        strokeWidth: 2, 
        strokeDasharray: '4 4' 
      }
    }));

    return NextResponse.json({ success: true, nodes, edges });
  } catch (error) {
    console.error('Erro ao processar introspecção:', error);
    return NextResponse.json({ success: false, error: 'Falha ao buscar mapeamento do banco' }, { status: 500 });
  }
}