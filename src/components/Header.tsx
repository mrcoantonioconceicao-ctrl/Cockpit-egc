import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Zap, Cpu, Server, Activity, Database, GitMerge, Network, Smartphone, Menu, X, Layers, Cloud } from 'lucide-react';

interface HeaderProps {
  activeTab: 'sparring' | 'multirepo' | 'platform' | 'pillars' | 'milestones' | 'artifacts' | 'sync';
  setActiveTab: (tab: 'sparring' | 'multirepo' | 'platform' | 'pillars' | 'milestones' | 'artifacts' | 'sync') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const navItems = [
    {
      id: 'sparring' as const,
      label: 'Sparring Studio',
      shortLabel: 'Sparring',
      desc: 'Reality check, estresse de limites e SLAs',
      icon: Activity,
      color: 'text-red-400',
      activeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
    },
    {
      id: 'multirepo' as const,
      label: 'Multi-Repo MCP Mesh',
      shortLabel: 'Multi-Repo',
      desc: 'Isolamento de smart & nexavor via MCP',
      icon: Network,
      color: 'text-indigo-400',
      activeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    },
    {
      id: 'platform' as const,
      label: 'Multiplataforma (Mobile)',
      shortLabel: 'Mobile Node',
      desc: 'Controle remoto celular/PC via mTLS',
      icon: Smartphone,
      color: 'text-cyan-400',
      activeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    },
    {
      id: 'pillars' as const,
      label: '4 Pilares Arquiteturais',
      shortLabel: '4 Pilares',
      desc: 'Memory, Mesh, Guardian, Token Crusher',
      icon: Cpu,
      color: 'text-indigo-400',
      activeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    },
    {
      id: 'milestones' as const,
      label: 'Marco M1 & Calculadora SLA',
      shortLabel: 'SLA & M1',
      desc: 'Critérios de aceite e simulador de carga',
      icon: Zap,
      color: 'text-cyan-400',
      activeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    },
    {
      id: 'artifacts' as const,
      label: 'RFC-001 & Rust Daemon',
      shortLabel: 'RFC-001',
      desc: 'Código fonte pronto para produção',
      icon: Database,
      color: 'text-emerald-400',
      activeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      id: 'sync' as const,
      label: 'Google Drive Sync & Integrity',
      shortLabel: 'Drive Sync',
      desc: 'Polling de backup e integridade de arquivos SHA-256',
      icon: Cloud,
      color: 'text-cyan-400',
      activeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    },
  ];

  const currentTab = navItems.find((item) => item.id === activeTab) || navItems[0];

  return (
    <>
      <header className="bg-slate-950 border-b border-slate-800 text-slate-200 sticky top-0 z-40">
        {/* Top Technical Status Bar */}
        <div className="bg-slate-900/90 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-mono border-b border-slate-800/80 flex items-center justify-between gap-2 text-slate-400">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              DAEMON: ONLINE
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="hidden sm:flex items-center gap-1 text-slate-300 whitespace-nowrap">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              /tmp/egc.sock
            </span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-300 whitespace-nowrap">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              AES-256-GCM
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1 text-slate-300 text-[10px] sm:text-xs whitespace-nowrap">
              <GitMerge className="w-3 h-3 text-amber-400" />
              19 Tools Linked
            </span>
            <span className="text-slate-600">|</span>
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono text-[10px] sm:text-xs whitespace-nowrap border border-slate-700">
              SYS: POSIX/x86_64
            </span>
          </div>
        </div>

        {/* Main Nav Header */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          {/* Brand & Left Triggers */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Mobile Hamburger Drawer Trigger Button */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Abrir menu de navegação"
              className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
            >
              <Menu className="w-5 h-5 text-cyan-400" />
            </button>

            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-indigo-600 via-cyan-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-950/50 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[6px] sm:rounded-[7px] flex items-center justify-center">
                <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-white font-mono">
                  EGC RUNTIME
                </h1>
                <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                  v0.4.2
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate max-w-[190px] sm:max-w-none">
                Extended Global Context Architecture Engine
              </p>
            </div>
          </div>

          {/* Active Tab Badge (Visible on Mobile to maintain immediate context) */}
          <div className="lg:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono">
            <currentTab.icon className={`w-3.5 h-3.5 ${currentTab.color}`} />
            <span className="text-white font-medium truncate max-w-[110px]">{currentTab.shortLabel}</span>
          </div>

          {/* Desktop Navigation Tabs (Hidden on Mobile/Tablet < lg) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? `${item.activeBg} border shadow-sm font-semibold`
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                  <span>{item.shortLabel}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Slide-Over Drawer Overlay (Backdrop) */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300 lg:hidden ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-Over Drawer Panel (Left-hand side) */}
      <aside
        className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-slate-950 border-r border-slate-800 z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menu Lateral de Navegação"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center">
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                EGC Cockpit Menu
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Selecione o Módulo Ativo
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Fechar menu"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 font-mono text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsDrawerOpen(false);
                }}
                className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 transition-all min-h-[52px] ${
                  isActive
                    ? 'bg-slate-900 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-slate-950 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div
                  className={`p-2 rounded-lg mt-0.5 ${
                    isActive ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-xs truncate ${isActive ? 'text-white' : 'text-slate-200'}`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0 ml-2"></span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Drawer Footer Telemetry */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/50 text-[10px] font-mono text-slate-500 space-y-1">
          <div className="flex justify-between">
            <span>Daemon IPC:</span>
            <span className="text-emerald-400 font-bold">ONLINE (/tmp/egc.sock)</span>
          </div>
          <div className="flex justify-between">
            <span>Cifra de Memória:</span>
            <span className="text-cyan-400">AES-256-GCM</span>
          </div>
          <div className="flex justify-between">
            <span>Sessões Vinculadas:</span>
            <span className="text-slate-300">19 AI IDE Tools</span>
          </div>
        </div>
      </aside>
    </>
  );
};
