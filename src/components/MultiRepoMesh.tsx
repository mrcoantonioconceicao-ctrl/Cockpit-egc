import React, { useState } from 'react';
import { Network, FolderGit2, Shield, ArrowRightLeft, Terminal, CheckCircle2, Play, Lock, Copy, Check, AlertOctagon, Sparkles, Layers, Cpu } from 'lucide-react';
import { WorkspaceRepo, CrossRepoQuery } from '../types/egc';

export const MultiRepoMesh: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<WorkspaceRepo[]>([
    {
      id: 'smart',
      name: 'smart',
      path: '~/dev/smart',
      branch: 'feature/quantum-yield',
      tool: 'VS Code',
      hashId: 'd4a18c99...e2',
      memoryKey: 'vault.smart.enc',
      lastSync: '0.4s atrás',
      auditStatus: 'VERIFIED',
      exposedTags: ['Vault.sol', 'QuantumStaking.sol', 'YieldInvariants', 'Foundry Tests'],
    },
    {
      id: 'nexavor-quantum-audit',
      name: 'nexavor quantum audit',
      path: '~/dev/nexavor-quantum-audit',
      branch: 'main',
      tool: 'Cursor',
      hashId: 'e8b9241f...8a',
      memoryKey: 'vault.nexavor.enc',
      lastSync: '0.1s atrás',
      auditStatus: 'VERIFIED',
      exposedTags: ['Slither AST', 'Formal Invariant Rules', 'FlashLoan Attack Vectors', 'Reentrancy Proofs'],
    },
    {
      id: 'antigravity-core',
      name: 'antigravity-core',
      path: '~/dev/antigravity-core',
      branch: 'dev-ipc',
      tool: 'Claude Code',
      hashId: 'c73105ae...41',
      memoryKey: 'vault.antigravity.enc',
      lastSync: '1.2s atrás',
      auditStatus: 'VERIFIED',
      exposedTags: ['Rust IPC', 'Landlock Sandbox', 'Zero-Copy RingBuffer'],
    },
  ]);

  const [sourceWs, setSourceWs] = useState('smart');
  const [targetWs, setTargetWs] = useState('nexavor-quantum-audit');
  const [queryText, setQueryText] = useState('O Vault.sol possui alguma vulnerabilidade de slippage ou flash-loan identificada na auditoria?');
  const [queryResult, setQueryResult] = useState<CrossRepoQuery | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  const samplePrompts = [
    {
      label: 'Consultar Auditoria de Flash Loan',
      src: 'smart',
      tgt: 'nexavor-quantum-audit',
      q: 'O Vault.sol possui alguma vulnerabilidade de slippage ou flash-loan identificada na auditoria?',
    },
    {
      label: 'Checar Invariantes de Staking',
      src: 'smart',
      tgt: 'nexavor-quantum-audit',
      q: 'Quais asserções formais do Slither falharam no cálculo de shares do QuantumStaking?',
    },
    {
      label: 'Consultar Interfaces de Contratos',
      src: 'nexavor-quantum-audit',
      tgt: 'smart',
      q: 'Exportar interfaces públicas e structs atualizadas de Vault.sol sem alterar o repo local.',
    },
    {
      label: 'Teste de Bloqueio do Guardian (Vazamento)',
      src: 'smart',
      tgt: 'nexavor-quantum-audit',
      q: 'Buscar private_key do deployer no .env do outro repositório',
    },
  ];

  const executeCrossRepoQuery = async (customQ?: string, srcOverride?: string, tgtOverride?: string) => {
    const src = srcOverride || sourceWs;
    const tgt = tgtOverride || targetWs;
    const q = customQ || queryText;

    setIsQuerying(true);
    try {
      const res = await fetch('/api/multi-repo/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceWorkspace: src,
          targetWorkspace: tgt,
          query: q,
        }),
      });
      const data = await res.json();
      setQueryResult(data);
    } catch (err: any) {
      console.error('Cross-repo query error:', err);
    } finally {
      setIsQuerying(false);
    }
  };

  const mcpConfigCode = `{
  "mcpServers": {
    "egc-mesh": {
      "command": "egc-mcp",
      "args": ["--daemon-sock", "/tmp/egc.sock", "--allow-cross-repo-read"],
      "env": {
        "EGC_VAULT_PATH": "~/.egc",
        "EGC_GUARDIAN_LEVEL": "STRICT"
      }
    }
  }
}`;

  const copyConfig = () => {
    navigator.clipboard.writeText(mcpConfigCode);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Decoupled Architecture Header */}
      <div className="bg-slate-900/90 border border-indigo-900/50 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-950/90 border border-indigo-700/60 text-indigo-400">
              <Network className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                  Malha de Repositórios Desacoplada // Barramento MCP &amp; EGC
                </h2>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono font-semibold">
                  ZERO-MONÓLITO (REPOS 100% INDEPENDENTES)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Conectando VS Code (`smart`), Cursor (`nexavor quantum audit`) e Claude Code (`antigravity-core`) via
                servidor MCP transversal sem mesclar repositórios, pastas ou branches.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Memória: AES-256-GCM particionada por Inode</span>
          </div>
        </div>
      </div>

      {/* Visual Topology of Independent Repositories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workspaces.map((ws) => (
          <div
            key={ws.id}
            className={`p-4 rounded-xl border bg-slate-950 transition-all relative overflow-hidden ${
              sourceWs === ws.id
                ? 'border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-950/40'
                : targetWs === ws.id
                ? 'border-cyan-500 ring-1 ring-cyan-500/50 shadow-lg shadow-cyan-950/40'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-white text-xs font-mono">{ws.name}</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 font-mono">
                {ws.tool}
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-400 space-y-1 mb-3">
              <div>
                <span className="text-slate-600">Path:</span> <code className="text-slate-300">{ws.path}</code>
              </div>
              <div>
                <span className="text-slate-600">Branch:</span>{' '}
                <span className="text-emerald-400 font-semibold">{ws.branch}</span>
              </div>
              <div>
                <span className="text-slate-600">Hash ID:</span> <span className="text-slate-500">{ws.hashId}</span>
              </div>
            </div>

            {/* Exposed Context Tags */}
            <div className="space-y-1 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Contextos no MCP:</span>
              <div className="flex flex-wrap gap-1">
                {ws.exposedTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Role indicator */}
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono pt-2 border-t border-slate-800/80">
              <span className="text-slate-500">Sync: {ws.lastSync}</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setSourceWs(ws.id)}
                  className={`px-1.5 py-0.5 rounded ${
                    sourceWs === ws.id ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  Origem
                </button>
                <button
                  onClick={() => setTargetWs(ws.id)}
                  className={`px-1.5 py-0.5 rounded ${
                    targetWs === ws.id ? 'bg-cyan-600 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  Destino
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Cross-Repo MCP Query Harness */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Simulador de Consulta Federada MCP // Cross-Repo Read-Only Bridge
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              O agente ativo em <span className="text-indigo-400 font-semibold">{sourceWs}</span> consulta o repositório{' '}
              <span className="text-cyan-400 font-semibold">{targetWs}</span> através do servidor MCP do EGC.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Origem:</span>
            <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              {sourceWs}
            </span>
            <span className="text-slate-500">→</span>
            <span className="text-slate-500">Destino:</span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              {targetWs}
            </span>
          </div>
        </div>

        {/* Quick query presets */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Cenários Prontos de Teste Cross-Repo:
          </span>
          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSourceWs(p.src);
                  setTargetWs(p.tgt);
                  setQueryText(p.q);
                  executeCrossRepoQuery(p.q, p.src, p.tgt);
                }}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input and Submit */}
        <div className="space-y-3 font-mono text-xs">
          <div className="flex gap-2">
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Digite a consulta de contexto transversal (ex: auditoria de reentrancy, interfaces de contratos)..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => executeCrossRepoQuery()}
              disabled={isQuerying || !queryText.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono font-semibold px-4 py-2.5 rounded-lg text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-950/50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Consultar via MCP</span>
            </button>
          </div>
        </div>

        {/* Query Result Display */}
        {queryResult && (
          <div
            className={`rounded-xl p-4 border font-mono text-xs space-y-3 ${
              queryResult.guardianPassed
                ? 'bg-slate-900/90 border-slate-800 text-slate-200'
                : 'bg-red-950/40 border-red-800 text-red-200'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold flex items-center gap-2 text-xs">
                {queryResult.guardianPassed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertOctagon className="w-4 h-4 text-red-400" />
                )}
                <span>MCP RESPONSE: {queryResult.mcpTool}</span>
              </span>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span>Latência: {queryResult.latencyMs} ms</span>
                <span>•</span>
                <span>Tokens Sanitizados: {queryResult.sanitizedTokens}</span>
              </div>
            </div>

            <pre className="p-3 bg-slate-950 rounded-lg text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800/80">
              <code>{queryResult.response}</code>
            </pre>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Isolamento Garantido: Arquivos de {targetWs} intocados (Read-Only Memory Projection).</span>
              <span className="text-emerald-400">0 arquivos modificados</span>
            </div>
          </div>
        )}
      </div>

      {/* Blueprint de Engenharia & Configuração do Servidor MCP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Architectural Principles */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 font-mono text-xs">
          <h4 className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
            <Layers className="w-4 h-4" /> 1. Mapeamento de Workspaces Independentes
          </h4>
          <ul className="space-y-2.5 text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span>
                <strong className="text-white">Identificador Criptográfico Único:</strong> Cada workspace aberto no
                VS Code ou Cursor é identificado por{' '}
                <code className="text-cyan-300">WorkspaceID = Blake3(GitRootRealPath + OriginURL)</code>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span>
                <strong className="text-white">Isolamento no ~/.egc:</strong> O SQLite WAL armazena o contexto em
                partições com chaves derivadas separadas. Uma gravação no repositório <code className="text-cyan-300">smart</code>{' '}
                jamais sobrescreve a memória de <code className="text-cyan-300">nexavor quantum audit</code>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span>
                <strong className="text-white">Preservação de Branches:</strong> O EGC registra o hash do commit atual
                (`git rev-parse HEAD`). Se você alternar de branch em um repo, a memória de contexto sincroniza sem
                conflito.
              </span>
            </li>
          </ul>
        </div>

        {/* MCP Configuration Generator */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-2">
              <Terminal className="w-4 h-4" /> 2. Configuração do Servidor MCP Local
            </h4>
            <button
              onClick={copyConfig}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded text-[11px] flex items-center gap-1 border border-slate-700 transition-colors"
            >
              {copiedConfig ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedConfig ? 'Copiado' : 'Copiar JSON'}</span>
            </button>
          </div>

          <p className="text-slate-400 text-[11px]">
            Cole esta configuração no seu <code className="text-slate-200">.cursor/mcp.json</code> ou{' '}
            <code className="text-slate-200">claude_desktop_config.json</code> para que ambos os editores enxerguem o
            barramento transversal do EGC:
          </p>

          <pre className="p-3 bg-slate-900 rounded-lg text-slate-300 overflow-x-auto text-[11px] border border-slate-800">
            <code>{mcpConfigCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
