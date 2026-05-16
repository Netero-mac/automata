'use client';

import { useMemo, useEffect } from 'react';
import ReactFlow, { Background, Controls, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';

import DatabaseNode from '@/components/canvas/DatabaseNode';

export default function Home() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const nodeTypes = useMemo(() => ({ databaseTable: DatabaseNode }), []);

  useEffect(() => {
    async function loadDatabaseSchema() {
      try {
        const response = await fetch('/api/schema');
        const data = await response.json();
        
        if (data.success) {
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do Neon:", error);
      }
    }

    loadDatabaseSchema();
  }, [setNodes, setEdges]);

  return (
    <main className="flex h-screen w-full">
      {/* Sidebar (Mantida igual) */}
      <aside className="w-64 bg-[#13161a] border-r border-[#1e2329] flex flex-col z-10 shadow-xl">
        <div className="p-4 flex items-center gap-3 border-b border-[#1e2329]">
          <div className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
            A
          </div>
          <h1 className="text-lg font-semibold tracking-wide text-gray-200">Automata</h1>
        </div>
        
        <nav className="p-4 flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-500 tracking-wider mb-2">NAVEGAÇÃO</span>
          <button className="text-left text-sm text-emerald-500 bg-emerald-500/10 px-3 py-2 rounded-md transition-colors border border-emerald-500/20">
             Projetos
          </button>
        </nav>
      </aside>

      {/* Área do Canvas - React Flow */}
      <section className="flex-1 relative bg-[#0d0f12]">
        <div className="absolute inset-0">
          <ReactFlow 
            nodes={nodes} 
            edges={edges}
            nodeTypes={nodeTypes} // Passa os tipos de nós para o motor
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView 
            className="dark"
          >
            <Background color="#2a3039" gap={16} size={1} />
            <Controls className="bg-[#1e2329] border-[#2a3039] fill-gray-300" />
          </ReactFlow>
        </div>
      </section>
    </main>
  );
}