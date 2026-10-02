import React, { useState } from 'react';
import { Send, AlertTriangle, ShieldCheck, Zap, Terminal, CornerDownLeft, Sparkles, RefreshCw, Flame, CheckCircle2 } from 'lucide-react';
import { SparringMessage } from '../types/egc';

export const SparringStudio: React.FC = () => {
  const [messages, setMessages] = useState<SparringMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `💥 PROTOCOLO DE SPARRING ATIVADO: SONY & SENIOR COPILOT
Operação iniciada sob código rígido de engenharia: tolerância zero para ideias vagas, checagem implacável de realidade e foco estrito em métricas mensuráveis de produção.

Para tirar o EGC do papel e blindar a arquitetura contra gargalos de concorrência e vazamentos de contexto, respondi sua sondagem:

"Entendido. Qual é a carga esperada de requisições simultâneas e qual a latência máxima?"

Sem esses dois números gravados em pedra (ex: 20 req/s @ p99 < 2ms), qualquer escolha entre SQLite WAL, RocksDB, Domain Sockets ou Ring Buffer em Memória Compartilhada é puramente teórica e arriscada.

Como você projeta o envelope operacional dessas 19 ferramentas?`,
      timestamp: '17:30',
      pillar: 'general',
    },
  ]);

  const [input, setInput] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<'general' | 'memory' | 'mesh' | 'guardian' | 'crusher'>('general');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    {
      label: 'Carga & Latência',
      text: 'Projetamos até 12 ferramentas simultâneas, rajadas de 25 req/s e latência máxima tolerada de 3ms no IPC para não travar o autocomplete.',
      pillar: 'mesh' as const,
    },
    {
      label: 'Locking do SQLite WAL',
      text: 'No Pilar Memory (~/.egc), como evitar erro SQLITE_BUSY se o Cursor e o Claude Code tentarem gravar checkpoints de contexto no mesmo milissegundo?',
      pillar: 'memory' as const,
    },
    {
      label: 'Evasão do Guardian',
      text: 'Como o Guardian impede bypass de comandos ofuscados (ex: echo "cm0gLXJmIC8=" | base64 -d | sh) sem causar falso positivo em deploys legítimos?',
      pillar: 'guardian' as const,
    },
    {
      label: 'Token Crusher AST',
      text: 'Como o Token Crusher garante 70% de redução de tokens de AST em projetos TypeScript monorepo sem amputar definições de tipos compartilhadas?',
      pillar: 'crusher' as const,
    },
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: SparringMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pillar: selectedPillar,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/sparring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          contextPillar: selectedPillar.toUpperCase(),
          history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const assistantMsg: SparringMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Erro ao obter resposta do parceiro de sparring.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pillar: selectedPillar,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ FALHA DE COMUNICAÇÃO NO SPARRING: ${err.message}. Verifique a saúde do daemon.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          pillar: selectedPillar,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sparring Banner & Rules of Engagement */}
      <div className="bg-slate-900/90 border border-red-900/40 rounded-xl p-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-950/80 border border-red-700/60 text-red-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Sparring Studio Técnico // Modo Implacável
                </h2>
                <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded font-mono font-semibold">
                  ZERO TOLERÂNCIA A IDEIAS VAGAS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Aqui desafiamos premissas frágeis, eliminamos métricas de vaidade e exigimos dados de concorrência,
                SLAs em milissegundos e código à prova de falhas.
              </p>
            </div>
          </div>

          {/* Pillar Selector Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {(['general', 'memory', 'mesh', 'guardian', 'crusher'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPillar(p)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedPillar === p
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p === 'general' ? 'Geral' : p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[560px]">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    msg.role === 'user' ? 'text-indigo-400' : 'text-red-400'
                  }`}
                >
                  {msg.role === 'user' ? 'Marco Antônio (Sony)' : 'Senior Co-Pilot (Sparring Partner)'}
                </span>
              </div>

              <div
                className={`max-w-[90%] md:max-w-[82%] rounded-xl p-4 border leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-indigo-950/40 text-indigo-100 border-indigo-700/50 shadow-md shadow-indigo-950/30'
                    : 'bg-slate-900/95 text-slate-200 border-slate-800 shadow-md shadow-black/40'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-red-400 p-3 bg-red-950/20 border border-red-900/30 rounded-lg animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
              <span>Analisando premissas, calculando gargalos de concorrência e estressando limites...</span>
            </div>
          )}
        </div>

        {/* Quick Question Injectors */}
        <div className="bg-slate-900/80 px-4 py-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
          <span className="text-slate-500 whitespace-nowrap flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Sparring Probes:
          </span>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedPillar(q.pillar);
                handleSend(q.text);
              }}
              className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-700/60 text-slate-300 whitespace-nowrap transition-colors flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
              {q.label}
            </button>
          ))}
        </div>

        {/* Interactive Input Form */}
        <div className="p-3 bg-slate-900 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Insira sua premissa arquitetural, métricas propostas ou responda à pergunta diagnóstica..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500/70 focus:ring-1 focus:ring-red-500/50"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-red-950/50"
            >
              <span>Submeter</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
