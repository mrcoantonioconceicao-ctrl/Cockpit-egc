import React, { useState } from 'react';
import { Header } from './components/Header';
import { SparringStudio } from './components/SparringStudio';
import { MultiRepoMesh } from './components/MultiRepoMesh';
import { MultiplatformNode } from './components/MultiplatformNode';
import { PillarsOverview } from './components/PillarsOverview';
import { MilestonePlanner } from './components/MilestonePlanner';
import { CodeArtifacts } from './components/CodeArtifacts';
import { Terminal, Shield, Zap, Cpu, Server, GitMerge } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'sparring' | 'multirepo' | 'platform' | 'pillars' | 'milestones' | 'artifacts'>('platform');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Top Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {activeTab === 'sparring' && <SparringStudio />}
        {activeTab === 'multirepo' && <MultiRepoMesh />}
        {activeTab === 'platform' && <MultiplatformNode />}
        {activeTab === 'pillars' && <PillarsOverview />}
        {activeTab === 'milestones' && <MilestonePlanner />}
        {activeTab === 'artifacts' && <CodeArtifacts />}
      </main>

      {/* Footer System Telemetry */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 px-4 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>EGC Local Runtime Daemon // PID 49821</span>
            <span className="text-slate-700">|</span>
            <span>AES-256-GCM Hardware Acceleration: ENABLED</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>LOCAL DAEMON HOST // SHA-256 ISOLATED</span>
            <span className="text-slate-700">|</span>
            <span className="text-cyan-400">RFC-001 DRAFT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
