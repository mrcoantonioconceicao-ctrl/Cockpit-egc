import React, { useState } from 'react';
import { Network, FolderGit2, Shield, ArrowRightLeft, Terminal, CheckCircle2, Play, Lock, Copy, Check, AlertOctagon, Sparkles, Layers, Cpu, GitGraph, Zap, AlertTriangle, Activity, Code2 } from 'lucide-react';
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
  const [simulatingSave, setSimulatingSave] = useState(false);
  const [attackScenario, setAttackScenario] = useState<'clean' | 'cei_reentrancy' | 'unchecked_call' | 'tainted_delegatecall'>('clean');
  const [astAuditResult, setAstAuditResult] = useState<{
    contractName: string;
    parseTimeMs: number;
    indexTimeMs: number;
    auditTimeMs: number;
    totalTimeMs: number;
    slaPassed: boolean;
    scenario: 'clean' | 'cei_reentrancy' | 'unchecked_call' | 'tainted_delegatecall';
    violations: Array<{
      functionName: string;
      opcodeSequence: string;
      vulnerabilityType: string;
      severity: string;
      message: string;
      remediation: string;
    }>;
    nodesIndexed: number;
    edgesIndexed: number;
    opcodesAnalyzed: string[];
  }>({
    contractName: 'smart/contracts/Vault.sol',
    parseTimeMs: 0.38,
    indexTimeMs: 0.59,
    auditTimeMs: 0.22,
    totalTimeMs: 1.19,
    slaPassed: true,
    scenario: 'clean',
    violations: [],
    nodesIndexed: 54,
    edgesIndexed: 72,
    opcodesAnalyzed: ['SLOAD [0x00]', 'SSTORE [0x04]', 'CALL [msg.sender]', 'TLOAD [0x99]', 'TSTORE [0x99]'],
  });

  const runFileSaveSimulation = (scenario: 'clean' | 'cei_reentrancy' | 'unchecked_call' | 'tainted_delegatecall') => {
    setAttackScenario(scenario);
    setSimulatingSave(true);

    setTimeout(() => {
      const parse = +(0.32 + Math.random() * 0.14).toFixed(2);
      const index = +(0.48 + Math.random() * 0.16).toFixed(2);
      const audit = +(0.18 + Math.random() * 0.08).toFixed(2);
      const total = +(parse + index + audit).toFixed(2);

      let violations: any[] = [];
      let opcodes: string[] = ['SLOAD [0x00]', 'SSTORE [0x04]', 'CALL [msg.sender]', 'TLOAD [0x99]', 'TSTORE [0x99]'];

      if (scenario === 'cei_reentrancy') {
        opcodes = ['SLOAD [0x00]', 'CALL [msg.sender.call{value}]', 'SSTORE [balances[msg.sender]]'];
        violations = [
          {
            functionName: 'Vault.sol::withdraw(uint256)',
            opcodeSequence: 'CALL (seq: 0) ──EXEC_BEFORE──> SSTORE (seq: 1, slot: 0x04)',
            vulnerabilityType: 'CRITICAL_REENTRANCY_CEI_VIOLATION',
            severity: 'CRITICAL',
            message: 'Chamada externa de baixo nível CALL executada ANTES da instrução de mutação de estado SSTORE no slot 0x04 sem guard nonReentrant.',
            remediation: 'Mova a instrução SSTORE para antes da instrução CALL ou aplique o modifier nonReentrant via TSTORE/TLOAD.',
          },
        ];
      } else if (scenario === 'unchecked_call') {
        opcodes = ['SLOAD [0x02]', 'CALL [recipient.call{value: amt}("")]', 'POP [discard bool return]'];
        violations = [
          {
            functionName: 'Vault.sol::emergencySweep(address)',
            opcodeSequence: 'CALL (seq: 1) ──OUTPUT_DROPPED──> POP (sem ISZERO / JUMPI)',
            vulnerabilityType: 'UNCHECKED_LOW_LEVEL_CALL',
            severity: 'HIGH',
            message: 'A instrução CALL foi invocada sem checagem do retorno booleano. Se o recipient falhar, a transação continuará com perda silenciosa.',
            remediation: 'Capture a tupla `(bool success, ) = target.call(...)` e force `require(success, "CALL_FAILED")`.',
          },
        ];
      } else if (scenario === 'tainted_delegatecall') {
        opcodes = ['MLOAD [calldata.impl]', 'DELEGATECALL [target: tainted]', 'SSTORE [overwrites proxy storage]'];
        violations = [
          {
            functionName: 'Vault.sol::executeModule(address,bytes)',
            opcodeSequence: 'CALLLOAD (param: impl) ──TAINT_FLOW──> DELEGATECALL (target)',
            vulnerabilityType: 'ARBITRARY_DELEGATECALL_HIJACK',
            severity: 'CRITICAL',
            message: 'A instrução DELEGATECALL recebe endereço de destino controlado por entrada externa sem whitelist de storage.',
            remediation: 'Restrinja o endereço alvo a um mapping verificado em SLOAD ou remova o delegatecall arbitrário.',
          },
        ];
      }

      setAstAuditResult({
        contractName: 'smart/contracts/Vault.sol',
        parseTimeMs: parse,
        indexTimeMs: index,
        auditTimeMs: audit,
        totalTimeMs: total,
        slaPassed: total < 2.0,
        scenario,
        violations,
        nodesIndexed: 54,
        edgesIndexed: 72,
        opcodesAnalyzed: opcodes,
      });
      setSimulatingSave(false);
    }, 280);
  };

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

      {/* NOVO: Motor AST Profundo & Validador Determinístico de Reentrancy (< 2ms) */}
      <div className="bg-slate-950 border border-indigo-900/60 rounded-xl p-6 shadow-xl space-y-5 font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <GitGraph className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Motor AST Profundo &amp; Validador de Reentrancy (SLA &lt; 2ms)
              </h3>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-semibold">
                DETERMINÍSTICO (0 TOKENS)
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Acionado automaticamente a cada evento <code className="text-slate-200">on_file_save</code> via socket Unix.
              Desce até opcodes (<code className="text-cyan-300">OP_CALL</code>, <code className="text-cyan-300">OP_SSTORE</code>) e valida o padrão CEI sem LLMs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-semibold">Cenário de Teste:</span>
            <button
              onClick={() => runFileSaveSimulation('clean')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all border ${
                attackScenario === 'clean'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600 shadow'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              1. Seguro (Conforme)
            </button>

            <button
              onClick={() => runFileSaveSimulation('cei_reentrancy')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all border ${
                attackScenario === 'cei_reentrancy'
                  ? 'bg-red-950 text-red-300 border-red-600 shadow'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              2. Reentrancy (CALL → SSTORE)
            </button>

            <button
              onClick={() => runFileSaveSimulation('unchecked_call')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all border ${
                attackScenario === 'unchecked_call'
                  ? 'bg-amber-950 text-amber-300 border-amber-600 shadow'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              3. Unchecked Return (CALL Drop)
            </button>

            <button
              onClick={() => runFileSaveSimulation('tainted_delegatecall')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all border ${
                attackScenario === 'tainted_delegatecall'
                  ? 'bg-purple-950 text-purple-300 border-purple-600 shadow'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              4. Tainted DELEGATECALL
            </button>

            <button
              onClick={() => runFileSaveSimulation(attackScenario)}
              disabled={simulatingSave}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold px-3 py-1 rounded text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-950/50 ml-auto"
            >
              <Zap className={`w-3 h-3 fill-current ${simulatingSave ? 'animate-bounce' : ''}`} />
              <span>{simulatingSave ? 'Reanalisando...' : 'Reexecutar on_file_save'}</span>
            </button>
          </div>
        </div>

        {/* Métricas de Latência do Pipeline (< 2ms SLA) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">1. Parse tree-sitter &amp; Yul</span>
            <strong className="text-white text-sm font-semibold">{astAuditResult.parseTimeMs} ms</strong>
            <span className="text-[10px] text-slate-400 block">Decomposição de Opcodes</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase block">2. Inserção SQLite WAL</span>
            <strong className="text-white text-sm font-semibold">{astAuditResult.indexTimeMs} ms</strong>
            <span className="text-[10px] text-slate-400 block">{astAuditResult.nodesIndexed} nós / {astAuditResult.edgesIndexed} arestas</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase block">3. Query Baixo Nível</span>
            <strong className="text-white text-sm font-semibold">{astAuditResult.auditTimeMs} ms</strong>
            <span className="text-[10px] text-slate-400 block">EVM instructions lookup</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Latência Total (SLA &lt; 2ms)</span>
            <div className="flex items-center gap-1.5">
              <strong className={`text-sm font-bold ${astAuditResult.totalTimeMs < 2.0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {astAuditResult.totalTimeMs} ms
              </strong>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                astAuditResult.totalTimeMs < 2.0 ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
              }`}>
                {astAuditResult.totalTimeMs < 2.0 ? 'SLA OK' : 'SLA ESTOURADO'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block">Target: p99 &lt; 2.0ms</span>
          </div>
        </div>

        {/* Diagnóstico da AST: Seguro vs Violação */}
        {astAuditResult.violations.length === 0 ? (
          <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/80 rounded-xl text-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>Instruções EVM 100% Conformes &amp; Seguras</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                  0 RISCOS DETECTADOS
                </span>
              </div>
              <p className="text-slate-300 text-xs mt-1">
                Todas as chamadas externas (<code className="text-emerald-300">CALL</code>) ocorrem estritamente APÓS a gravação de storage (<code className="text-emerald-300">SSTORE</code>), retornos booleanos são verificados com <code className="text-emerald-300">ISZERO/JUMPI</code> e os alvos de <code className="text-emerald-300">DELEGATECALL</code> são restritos a storage local imutável.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-red-950/40 border border-red-700 rounded-xl text-red-200 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-red-100 flex items-center gap-2">
                  <span>{astAuditResult.violations[0].vulnerabilityType}</span>
                  <span className="text-[10px] bg-red-900 text-red-200 px-2 py-0.5 rounded font-bold">
                    BLOQUEIO DE BUILD
                  </span>
                </div>
                <p className="text-xs text-red-300 mt-1">
                  {astAuditResult.violations[0].message}
                </p>
              </div>
            </div>

            <div className="bg-slate-950/90 p-3 rounded-lg border border-red-900/60 font-mono text-[11px] text-slate-300 space-y-1.5">
              <div className="text-slate-400 text-[10px] uppercase">Sequência de Opcodes no CFG:</div>
              <div className="text-red-400 font-semibold">{astAuditResult.violations[0].opcodeSequence}</div>
              <div className="text-slate-400 text-[10px] uppercase pt-1">Correção Recomendada:</div>
              <div className="text-emerald-300">{astAuditResult.violations[0].remediation}</div>
            </div>
          </div>
        )}

        {/* Visualização da Cadeia de Instruções Extraídas */}
        <div className="border border-slate-800/80 rounded-lg p-3 bg-slate-900/30 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              Micro-Opcodes Identificados em <strong className="text-slate-200">{astAuditResult.contractName}</strong>
            </span>
            <span className="text-[10px] text-slate-500">tree-sitter-solidity + Yul IR</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            {astAuditResult.opcodesAnalyzed.map((op, idx) => (
              <React.Fragment key={idx}>
                <span className={`px-2 py-0.5 rounded border font-mono font-semibold ${
                  op.includes('CALL') && attackScenario !== 'clean'
                    ? 'bg-red-950 text-red-300 border-red-700'
                    : op.includes('DELEGATECALL')
                    ? 'bg-purple-950 text-purple-300 border-purple-700'
                    : op.includes('SSTORE')
                    ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                    : op.includes('TSTORE') || op.includes('TLOAD')
                    ? 'bg-amber-950 text-amber-300 border-amber-700'
                    : 'bg-slate-900 text-slate-300 border-slate-800'
                }`}>
                  {op}
                </span>
                {idx < astAuditResult.opcodesAnalyzed.length - 1 && (
                  <span className="text-slate-600 text-xs">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
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
