import { Handle, Position } from 'reactflow';
import { Database, Key } from 'lucide-react';

interface ColumnData {
  name: string;
  type: string;
  isPrimary?: boolean;
}

interface DatabaseNodeProps {
  data: {
    label: string;
    colorAccent?: string;
    columns: ColumnData[];
  };
}

// Função para deixar os tipos do Postgres mais curtos e bonitos
function formatDataType(type: string) {
  if (type.includes('timestamp')) return 'timestamp';
  if (type.includes('character varying')) return 'varchar';
  if (type.includes('integer')) return 'int';
  if (type.includes('numeric')) return 'numeric';
  return type;
}

export default function DatabaseNode({ data }: DatabaseNodeProps) {
  const accentColor = data.colorAccent || '#10b981';

  return (
    <div className="bg-[#13161a] border border-[#1e2329] rounded-lg shadow-2xl w-64 font-sans overflow-hidden">
      <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />
      
      <div className="bg-[#181b21] px-3 py-3 border-b border-[#1e2329] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Database size={14} style={{ color: accentColor }} />
          <span className="font-bold text-sm text-gray-200">{data.label}</span>
        </div>
        <span className="text-[10px] text-gray-500 font-mono bg-[#1e2329] px-1.5 py-0.5 rounded">
          {data.columns?.length || 0} cols
        </span>
      </div>

      <div className="p-2 flex flex-col gap-1 w-full">
        {data.columns?.map((col) => (
          <div key={col.name} className="flex justify-between items-center px-1 py-1 relative group hover:bg-[#1e2329] rounded transition-colors w-full">
            
            <Handle 
              type="target" 
              position={Position.Left} 
              id={`target-${col.name}`} 
              className="w-2 h-2 bg-gray-500 border-none opacity-0 group-hover:opacity-100 transition-opacity -ml-3" 
            />
            
            {/* Lado esquerdo da linha (Ícone + Nome) */}
            <div className="flex gap-2 items-center flex-1 min-w-0">
              {col.isPrimary ? (
                <Key size={12} className="text-yellow-500 shrink-0" />
              ) : (
                <div className="w-3 shrink-0" />
              )}
              <span className="text-xs text-gray-300 font-mono truncate" title={col.name}>
                {col.name}
              </span>
            </div>
            
            {/* Lado direito da linha (Tipo do dado) */}
            <span 
              className="text-[10px] text-gray-500 font-mono truncate text-right ml-2 max-w-20" 
              title={col.type}
            >
              {formatDataType(col.type)}
            </span>

            <Handle 
              type="source" 
              position={Position.Right} 
              id={`source-${col.name}`} 
              className="w-2 h-2 bg-gray-500 border-none opacity-0 group-hover:opacity-100 transition-opacity -mr-3" 
            />
          </div>
        ))}
      </div>
    </div>
  );
}