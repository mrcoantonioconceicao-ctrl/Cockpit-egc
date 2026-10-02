import React, { useState, useMemo } from 'react';
import { Target, CheckSquare, Gauge, AlertCircle, ArrowUpRight, TrendingUp, Sliders, ShieldCheck, Zap } from 'lucide-react';
import { SlaCalculation } from '../types/egc';

export const MilestonePlanner: React.FC = () => {
  // Concurrency & Operational Envelope State
  const [concurrentTools, setConcurrentTools] = useState(8);
  const [requestsPerSec, setRequestsPerSec] = useState(10);
  const [avgPayloadKb, setAvgPayloadKb] = useState(32);
  const [ipcType, setIpcType] = useState<'unix_socket' | 'shared_memory' | 'localhost_http'>('unix_socket');

  // Strict Deliverables Checklist for Milestone 1 (M1)
  const [tasks, setTasks] = useState([
    {
      id: 'm1-1',
      title: 'M1.1: Daemon Local Assíncrono (egcd) em Rust/Tokio',
      sla: 'p99 < 1.2ms (ping-pong IPC para frames < 16KB) e throughput >= 8.000 ops/s',
      status: 'PRONTO_PARA_EXECUCAO',
      metric: '< 1.2ms p99',
      category: 'IPC / Core Runtime',
    },
    {
      id: 'm1-2',
      title: 'M1.2: Cofre Criptografado ~/.egc com AES-256-GCM + Argon2id',
      sla: 'Bootstrap de KDF em < 180ms; Decriptação de checkpoint em < 350µs',
      status: 'PRONTO_PARA_EXECUCAO',
      metric: '< 350µs decriptação',
      category: 'Memory Vault',
    },
    {
      id: 'm1-3',
      title: 'M1.3: Interceptor Guardian v0.1 com Regras AST de Shell',
      sla: '0 Falsos Negativos nos top 25 vetores de risco; Avaliação < 1.5ms',
      status: 'PRONTO_PARA_EXECUCAO',
      metric: '0 FN / < 1.5ms',
      category: 'Security',
    },
    {
      id: 'm1-4',
      title: 'M1.4: Motor Inicial do Token Crusher (AST Parser)',
      sla: 'Redução mínima mensurável de >= 50% de tokens em buffers de código sem quebra de sintaxe',
      status: 'PRONTO_PARA_EXECUCAO',
      metric: '>= 50% redução',
      category: 'Token Crusher',
    },
    {
      id: 'm1-5',
      title: 'M1.5: Suíte de Testes de Concorrência & Carga (Chaos Harness)',
      sla: 'Simular 19 ferramentas simultâneas disparando 100.000 requests sem corrupção ou deadlock',
      status: 'PRONTO_PARA_EXECUCAO',
      metric: '100k requests / 0 deadlocks',
      category: 'Benchmarking',
    },
  ]);

  // Real-time SLA & Capacity Math
  const calculation = useMemo<SlaCalculation>(() => {
    const totalOpsPerSec = concurrentTools * requestsPerSec;
    const totalThroughputMbPerSec = (totalOpsPerSec * avgPayloadKb) / 1024;

    let baseLatencyP50 = 0.35;
    let baseLatencyP99 = 1.1;

    if (ipcType === 'shared_memory') {
      baseLatencyP50 = 0.08;
      baseLatencyP99 = 0.45;
    } else if (ipcType === 'localhost_http') {
      baseLatencyP50 = 1.8;
      baseLatencyP99 = 5.2;
    }

    // Load scaling penalty
    const congestionFactor = Math.max(1, totalOpsPerSec / 150);
    const estimatedP50Ms = Math.round(baseLatencyP50 * congestionFactor * 100) / 100;
    const estimatedP99Ms = Math.round(baseLatencyP99 * Math.pow(congestionFactor, 1.3) * 100) / 100;

    // SQLite WAL write contention diagnosis
    let walContentionRisk: 'LOW' | 'MODERATE' | 'CRITICAL' = 'LOW';
    if (totalOpsPerSec > 250) {
      walContentionRisk = 'CRITICAL';
    } else if (totalOpsPerSec > 80) {
      walContentionRisk = 'MODERATE';
    }

    const recommendedRingBufferMb = Math.max(16, Math.ceil((totalThroughputMbPerSec * 4) / 16) * 16);
    const cpuOverheadPercent = Math.min(100, Math.round(totalOpsPerSec * 0.12 * (avgPayloadKb / 32)));

    return {
      concurrentTools,
      requestsPerSec,
      avgPayloadKb,
      ipcType,
      totalThroughputMbPerSec: Math.round(totalThroughputMbPerSec * 100) / 100,
      estimatedP50Ms,
      estimatedP99Ms,
      walContentionRisk,
      recommendedRingBufferMb,
      cpuOverheadPercent,
    };
  }, [concurrentTools, requestsPerSec, avgPayloadKb, ipcType]);

  return (
    <div className="space-y-6">
      {/* Target Milestone Header */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white font-mono">
                MARCO TÉCNICO M1 // CORE DAEMON &amp; ENTREGAS ESTRITAMENTE MENSURÁVEIS
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Plano de batalha sem enrolação: cada entrega possui um número rígido de aceitação. Se não bater a métrica,
              não vai para produção.
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
            PRAZO DE VALIDAÇÃO: 7 DIAS
          </span>
        </div>

        {/* Deliverables Table */}
        <div className="space-y-3 font-mono text-xs">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">{task.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                    {task.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  <strong className="text-cyan-400">Critério de Aceite:</strong> {task.sla}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase">Métrica Rígida</div>
                  <div className="text-xs font-bold text-emerald-400">{task.metric}</div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-400"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Concurrency & SLA Calculator */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Calculadora de Carga Operacional &amp; Garantia de Latência (SLA Simulator)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Responde à Sondagem de Concorrência</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-5 font-mono text-xs">
            {/* Slider 1: Concurrent Tools */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-300 font-semibold">Ferramentas de IA Concorrentes no Host:</span>
                <span className="text-indigo-400 font-bold">{concurrentTools} ferramentas ativas</span>
              </div>
              <input
                type="range"
                min={1}
                max={24}
                value={concurrentTools}
                onChange={(e) => setConcurrentTools(Number(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-900 rounded-lg cursor-pointer h-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1 (Monolítico)</span>
                <span>12 (Cursor + Claude + Cline + Aider)</span>
                <span>24 (Cluster Local)</span>
              </div>
            </div>

            {/* Slider 2: Requests per Second */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-300 font-semibold">Requisições por Segundo (por Ferramenta):</span>
                <span className="text-cyan-400 font-bold">{requestsPerSec} req/s</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={requestsPerSec}
                onChange={(e) => setRequestsPerSec(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-900 rounded-lg cursor-pointer h-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1 req/s (Manual)</span>
                <span>15 req/s (Streaming Autocomplete)</span>
                <span>50 req/s (Autonomous Loops)</span>
              </div>
            </div>

            {/* Slider 3: Average Payload */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-300 font-semibold">Payload Médio de Contexto:</span>
                <span className="text-emerald-400 font-bold">{avgPayloadKb} KB</span>
              </div>
              <input
                type="range"
                min={4}
                max={256}
                step={4}
                value={avgPayloadKb}
                onChange={(e) => setAvgPayloadKb(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-900 rounded-lg cursor-pointer h-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>4 KB (Pequeno diff)</span>
                <span>64 KB (Snapshot de arquivo)</span>
                <span>256 KB (Dump de Projeto)</span>
              </div>
            </div>

            {/* IPC Architecture Selector */}
            <div className="space-y-2 pt-2">
              <span className="text-slate-300 font-semibold block">Mecanismo de Transporte IPC:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'unix_socket' as const, label: 'Unix Domain Socket', desc: 'AF_UNIX stream' },
                  { id: 'shared_memory' as const, label: 'Shared Memory', desc: 'RingBuffer Zero-Copy' },
                  { id: 'localhost_http' as const, label: 'Localhost HTTP', desc: 'gRPC / REST' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setIpcType(t.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      ipcType === t.id
                        ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-[11px] text-white">{t.label}</div>
                    <div className="text-[10px] text-slate-500">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Computed Output Telemetry */}
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 font-mono text-xs space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Projeção de Performance em Tempo Real
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Vazão Total de Dados</span>
                <span className="text-base font-bold text-cyan-400">
                  {calculation.totalThroughputMbPerSec} MB/s
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  ({concurrentTools * requestsPerSec} ops/segundo)
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Latência IPC p99 Projetada</span>
                <span
                  className={`text-base font-bold ${
                    calculation.estimatedP99Ms <= 1.5
                      ? 'text-emerald-400'
                      : calculation.estimatedP99Ms <= 3.0
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {calculation.estimatedP99Ms} ms
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  (p50: {calculation.estimatedP50Ms} ms)
                </span>
              </div>
            </div>

            {/* Diagnostic Alert Box */}
            <div
              className={`p-3.5 rounded-lg border text-[11px] leading-relaxed ${
                calculation.walContentionRisk === 'CRITICAL'
                  ? 'bg-red-950/40 border-red-800 text-red-200'
                  : calculation.walContentionRisk === 'MODERATE'
                  ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                  : 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 mb-1 text-xs">
                <AlertCircle className="w-4 h-4" />
                Veredito de Engenharia: Risco de Contenção de Lock ({calculation.walContentionRisk})
              </div>
              {calculation.walContentionRisk === 'CRITICAL' && (
                <p>
                  Com {concurrentTools * requestsPerSec} writes/segundo, o SQLite WAL sofrerá contenção severa
                  (SQLITE_BUSY). <strong>Ação Obrigatória:</strong> Implementar buffer de escrita unificado no Daemon em
                  Rust com flush assíncrono em lotes a cada 50ms.
                </p>
              )}
              {calculation.walContentionRisk === 'MODERATE' && (
                <p>
                  Carga moderada. Recomenda-se configurar <code className="text-amber-300">busy_timeout = 5000ms</code>{' '}
                  no SQLite e habilitar <code className="text-amber-300">mmap_size</code> de 128MB.
                </p>
              )}
              {calculation.walContentionRisk === 'LOW' && (
                <p>
                  Envelope operacional estável. O SQLite em modo WAL e o socket Unix operarão folgados com p99 &lt;
                  1.2ms.
                </p>
              )}
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-800 pt-3">
              <div className="flex justify-between">
                <span>Dimensionamento Recomendado do RingBuffer:</span>
                <span className="text-white font-bold">{calculation.recommendedRingBufferMb} MB</span>
              </div>
              <div className="flex justify-between">
                <span>Carga Estimada de CPU para AES-256-GCM:</span>
                <span className="text-white font-bold">~{calculation.cpuOverheadPercent}% de 1 Core</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
