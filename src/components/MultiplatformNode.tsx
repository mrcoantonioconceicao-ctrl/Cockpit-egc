import React, { useState } from 'react';
import { Smartphone, Laptop, Monitor, Shield, Wifi, Zap, Lock, Battery, Terminal, AlertTriangle, CheckCircle2, Send, Radio, RefreshCw, Key, Power } from 'lucide-react';
import { DeviceProfile } from '../types/egc';

export const MultiplatformNode: React.FC = () => {
  const [activeDevice, setActiveDevice] = useState<'pc' | 'notebook' | 'mobile'>('mobile');
  const [mobilePrompt, setMobilePrompt] = useState('');
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [emergencyKilled, setEmergencyKilled] = useState(false);

  const devices: Record<'pc' | 'notebook' | 'mobile', DeviceProfile> = {
    pc: {
      id: 'pc',
      name: 'Workstation 4K (PC Principal)',
      type: 'Desktop Linux / POSIX',
      screenDesc: '3840x2160 (Alta Densidade, 4K Multi-Monitor)',
      networkType: 'Localhost (0ms)',
      bandwidthMode: 'Full Raw AST',
      activeRole: 'Heavy Compiling, Rust Daemons, Formal Audits',
      status: 'ONLINE',
    },
    notebook: {
      id: 'notebook',
      name: 'MacBook Pro / ThinkPad Movel',
      type: 'Notebook Portatil',
      screenDesc: '1920x1080 (Layout Adaptativo 2 Colunas)',
      networkType: 'Wi-Fi LAN (<1ms)',
      bandwidthMode: 'Standard',
      activeRole: 'Desenvolvimento Ativo, Pair Programming, Testes',
      status: 'ONLINE',
    },
    mobile: {
      id: 'mobile',
      name: 'Smartphone (iOS / Android)',
      type: 'Dispositivo Movel',
      screenDesc: '390x844 (Touch-First, Safe Area Insets, PWA)',
      networkType: 'Tailscale/5G (15-30ms)',
      bandwidthMode: 'Ultra-Crushed (90% compression)',
      activeRole: 'Monitoramento Remoto, Interrupcao de Emergencia, Prompts Rapidos',
      status: 'ONLINE',
    },
  };

  const handleMobileDispatch = (text?: string) => {
    const toSend = text || mobilePrompt;
    if (!toSend.trim()) return;

    setIsSending(true);
    setDispatchStatus(null);

    setTimeout(() => {
      setIsSending(false);
      setDispatchStatus(`Comando despachado com sucesso via Tailscale mTLS: "${toSend}". Agentes no PC notificados.`);
      if (!text) setMobilePrompt('');
    }, 450);
  };

  const triggerEmergencyKill = () => {
    setEmergencyKilled(true);
    setTimeout(() => setEmergencyKilled(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-cyan-900/50 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-950/90 border border-cyan-700/60 text-cyan-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                  Experiência Multiplataforma // PC, Notebook &amp; Mobile Mesh
                </h2>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono font-semibold">
                  TAILSCALE / WIREGUARD mTLS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Controle o EGC de qualquer dispositivo com layout adaptativo: terminal denso no PC, interface móvel
                otimizada para toque no celular, com criptografia Zero-Trust e zero portas públicas abertas.
              </p>
            </div>
          </div>

          {/* Device Viewport Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            {[
              { id: 'pc' as const, label: 'PC (Workstation)', icon: Monitor },
              { id: 'notebook' as const, label: 'Notebook', icon: Laptop },
              { id: 'mobile' as const, label: 'Mobile (Celular)', icon: Smartphone },
            ].map((d) => {
              const Icon = d.icon;
              return (
                <button
                  key={d.id}
                  onClick={() => setActiveDevice(d.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    activeDevice === d.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{d.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Device Viewport & Simulation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Device Profile Specs */}
        <div className="lg:col-span-5 space-y-4 font-mono text-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                {activeDevice === 'mobile' && <Smartphone className="w-4 h-4 text-cyan-400" />}
                {activeDevice === 'notebook' && <Laptop className="w-4 h-4 text-indigo-400" />}
                {activeDevice === 'pc' && <Monitor className="w-4 h-4 text-emerald-400" />}
                {devices[activeDevice].name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                {devices[activeDevice].status}
              </span>
            </div>

            <div className="space-y-2 text-slate-300 text-[11px]">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500">Resolução do Viewport:</span>
                <span className="text-white font-medium">{devices[activeDevice].screenDesc}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500">Tipo de Conexão:</span>
                <span className="text-cyan-400 font-medium">{devices[activeDevice].networkType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500">Compressão de Banda:</span>
                <span className="text-emerald-400 font-medium">{devices[activeDevice].bandwidthMode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-500">Papel Operacional:</span>
                <span className="text-slate-200 text-right">{devices[activeDevice].activeRole}</span>
              </div>
            </div>
          </div>

          {/* Remote Security Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 text-[11px]">
            <h4 className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-2">
              <Lock className="w-4 h-4" /> Arquitetura de Segurança Zero-Trust
            </h4>
            <p className="text-slate-300 leading-relaxed">
              O daemon do EGC <strong>jamais expõe portas públicas na internet</strong> (`0.0.0.0:80`). O acesso móvel
              ocorre via <strong>Tailscale / WireGuard</strong> sobre túnel criptografado ponto a ponto com chaves mTLS e
              autenticação biométrica (FaceID / WebAuthn) para ações críticas.
            </p>
          </div>
        </div>

        {/* Live Device Simulator Frame */}
        <div className="lg:col-span-7 flex justify-center">
          {activeDevice === 'mobile' ? (
            /* Smartphone Viewport Simulation (390px width) */
            <div className="w-full max-w-[390px] bg-slate-950 border-4 border-slate-800 rounded-[36px] shadow-2xl p-4 space-y-4 font-mono text-xs overflow-hidden relative ring-1 ring-slate-700">
              {/* Phone Status Bar */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-2 px-1">
                <span className="font-bold text-white">17:50</span>
                <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto border border-slate-800 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px]">5G</span>
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>

              {/* Mobile App Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-[11px]">
                    EGC
                  </div>
                  <div>
                    <div className="font-bold text-white text-[11px]">Sony Mobile Node</div>
                    <div className="text-[9px] text-emerald-400">Tailscale Encrypted (14ms)</div>
                  </div>
                </div>
                <button
                  onClick={triggerEmergencyKill}
                  className="p-1.5 rounded-lg bg-red-950 border border-red-800 text-red-400 hover:bg-red-900 transition-colors flex items-center gap-1 text-[10px] font-bold"
                >
                  <Power className="w-3.5 h-3.5" /> Stop
                </button>
              </div>

              {emergencyKilled && (
                <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-700 text-red-200 text-[10px] animate-pulse">
                  ⚠️ KILL SWITCH ACIONADO: Todas as execuções autônomas de IA nos repositórios locais foram congeladas.
                </div>
              )}

              {/* Compact Multi-Repo Cards on Mobile */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Repositórios Conectados</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-indigo-400 font-bold text-[11px]">smart</div>
                    <div className="text-[9px] text-slate-400">feature/quantum</div>
                    <div className="text-[9px] text-emerald-400 mt-1">● VS Code (Ativo)</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-cyan-400 font-bold text-[11px]">nexavor</div>
                    <div className="text-[9px] text-slate-400">main (Audit)</div>
                    <div className="text-[9px] text-emerald-400 mt-1">● Cursor (Ativo)</div>
                  </div>
                </div>
              </div>

              {/* Mobile Quick Action Prompts */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Ações Rápidas de Celular</span>
                <div className="space-y-1.5">
                  {[
                    'Travar commit em smart até auditoria aprovar',
                    'Consultar último achado de reentrancy no nexavor',
                    'Pedir ao Claude Code para rodar os testes Foundry',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleMobileDispatch(preset)}
                      className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 transition-colors flex items-center justify-between"
                    >
                      <span className="truncate pr-2">{preset}</span>
                      <Send className="w-3 h-3 text-cyan-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Touch Dispatch Input */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={mobilePrompt}
                    onChange={(e) => setMobilePrompt(e.target.value)}
                    placeholder="Instrução rápida via celular..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-[10px] font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => handleMobileDispatch()}
                    disabled={isSending || !mobilePrompt.trim()}
                    className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold px-3 py-2 rounded-lg text-[10px] flex items-center justify-center"
                  >
                    {isSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {dispatchStatus && (
                  <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800 text-cyan-300 text-[9px] leading-tight">
                    {dispatchStatus}
                  </div>
                )}
              </div>

              {/* Bottom Home Indicator */}
              <div className="w-28 h-1 bg-slate-700 rounded-full mx-auto pt-0.5"></div>
            </div>
          ) : (
            /* Workstation / Laptop Adaptive View */
            <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-white text-sm">
                    Layout Adaptativo de Tela Larga // {activeDevice === 'pc' ? 'Estação de Trabalho' : 'Notebook'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Buffer IPC: /tmp/egc.sock</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
                  <div className="text-white font-bold flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-400" /> Terminal de Concorrência
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Renderização em grade de alta densidade exibindo simultaneamente logs de AST, telemetria de
                    compilação Foundry e auditoria Slither sem necessidade de paginação.
                  </p>
                </div>

                <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
                  <div className="text-white font-bold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" /> Token Crusher em Modo Raw
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    No PC e Notebook com conexão local de fibra ou cabo, o Token Crusher prioriza máxima fidelidade
                    sintática com latência inferior a 0.5ms.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
