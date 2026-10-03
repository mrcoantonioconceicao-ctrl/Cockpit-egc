import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Cloud, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  HardDrive, 
  Lock, 
  Clock, 
  Check, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  ArrowUpRight, 
  Sliders, 
  Radio, 
  FileText, 
  FolderCheck,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { DriveSyncState, VaultSyncFile } from '../types/egc';

export const GoogleDriveSyncEngine: React.FC = () => {
  const [syncState, setSyncState] = useState<DriveSyncState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isForceSyncing, setIsForceSyncing] = useState(false);
  const [forceSyncNotification, setForceSyncNotification] = useState<string | null>(null);
  const [autoPoll, setAutoPoll] = useState(true);
  const [pollIntervalSec, setPollIntervalSec] = useState(5);
  const [pollCountdown, setPollCountdown] = useState(5);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'files' | 'activity' | 'settings'>('files');
  const [simulatedTamperId, setSimulatedTamperId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Consulta o daemon backend
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/sync/drive-status');
      if (res.ok) {
        const data: DriveSyncState = await res.json();
        setSyncState(data);
      }
    } catch (e) {
      console.error('Falha ao comunicar com o daemon:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling automático
  useEffect(() => {
    fetchStatus();

    if (!autoPoll) return;

    setPollCountdown(pollIntervalSec);
    const countdownInterval = setInterval(() => {
      setPollCountdown((prev) => (prev <= 1 ? pollIntervalSec : prev - 1));
    }, 1000);

    pollTimerRef.current = setInterval(() => {
      fetchStatus();
    }, pollIntervalSec * 1000);

    return () => {
      clearInterval(countdownInterval);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [autoPoll, pollIntervalSec, fetchStatus]);

  // Disparo manual de backup
  const handleTriggerBackup = async () => {
    setIsTriggering(true);
    try {
      const res = await fetch('/api/sync/trigger-backup', { method: 'POST' });
      if (res.ok) {
        await fetchStatus();
      }
    } catch (e) {
      console.error('Erro ao disparar backup:', e);
    } finally {
      setIsTriggering(false);
    }
  };

  // Disparo de auditoria de integridade
  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/sync/verify-integrity', { method: 'POST' });
      if (res.ok) {
        setSimulatedTamperId(null);
        await fetchStatus();
      }
    } catch (e) {
      console.error('Erro ao auditar integridade:', e);
    } finally {
      setIsVerifying(false);
    }
  };

  // Forçar sincronização imediata através do daemon EGC
  const handleForceSync = async () => {
    setIsForceSyncing(true);
    setForceSyncNotification(null);
    try {
      const res = await fetch('/api/sync/force-sync', { method: 'POST' });
      if (res.ok) {
        setSimulatedTamperId(null);
        await fetchStatus();
        setForceSyncNotification('Sincronização forçada concluída com sucesso! Todos os 5 cofres foram atualizados e verificados imediatamente pelo daemon.');
        setTimeout(() => setForceSyncNotification(null), 4000);
      }
    } catch (e) {
      console.error('Erro ao forçar sincronização:', e);
    } finally {
      setIsForceSyncing(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSec < 10) return 'agora mesmo';
      if (diffSec < 60) return `há ${diffSec}s`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `há ${diffMin} min`;
      const diffHours = Math.floor(diffMin / 60);
      return `há ${diffHours} h`;
    } catch {
      return isoString;
    }
  };

  const filesList = (syncState?.files || []).map((file) => {
    if (simulatedTamperId === file.id) {
      return {
        ...file,
        remoteSha256: 'deadbeef84029183019384729103847291038472910384729103847291038472',
        integrityStatus: 'MISMATCH' as const,
      };
    }
    return file;
  }).filter((f) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return f.name.toLowerCase().includes(q) || f.workspace.toLowerCase().includes(q);
  });

  const hasMismatch = filesList.some((f) => f.integrityStatus === 'MISMATCH');
  const isSyncing = syncState?.status === 'SYNCING' || isTriggering;
  const isAuditing = syncState?.status === 'VERIFYING_HASHES' || isVerifying;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header Limpo e Ações Principais */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Cloud className="w-5 h-5 text-cyan-400" />
            <span>Google Drive Sync &amp; Integridade</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Backup em nuvem com criptografia de ponta a ponta (AES-256-GCM) e auditoria de hashes SHA-256
          </p>
        </div>

        {/* Controles de Ação com excelente contraste e espaçamento */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleForceSync}
            disabled={isForceSyncing || isSyncing || isAuditing}
            className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-amber-950/40 disabled:opacity-50"
            title="Dispara o daemon EGC para atualizar e sincronizar todos os arquivos imediatamente"
          >
            <Zap className={`w-3.5 h-3.5 ${isForceSyncing ? 'animate-bounce' : 'fill-current'}`} />
            <span>{isForceSyncing ? 'Forçando Sync...' : 'Force Sync'}</span>
          </button>

          <button
            onClick={handleVerifyIntegrity}
            disabled={isAuditing || isSyncing || isForceSyncing}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <ShieldCheck className={`w-4 h-4 text-emerald-400 ${isAuditing ? 'animate-pulse' : ''}`} />
            <span>{isAuditing ? 'Auditando Hashes...' : 'Auditar Hashes'}</span>
          </button>

          <button
            onClick={handleTriggerBackup}
            disabled={isSyncing || isAuditing || isForceSyncing}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm shadow-indigo-950/40 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
          </button>
        </div>
      </div>

      {/* Notificação de Sucesso do Force Sync */}
      {forceSyncNotification && (
        <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl text-xs text-amber-200 flex items-center justify-between gap-2 transition-all animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 fill-current" />
            <span className="font-medium">{forceSyncNotification}</span>
          </div>
          <button
            onClick={() => setForceSyncNotification(null)}
            className="text-amber-400 hover:text-amber-200 text-sm font-bold px-2 py-0.5 rounded hover:bg-amber-900/40"
          >
            &times;
          </button>
        </div>
      )}

      {/* 2. Banner de Status Central (Claro, Reafirmador e sem poluição visual) */}
      <div className={`rounded-xl border p-5 transition-all ${
        hasMismatch
          ? 'bg-red-950/30 border-red-800/80 text-red-200'
          : isSyncing
          ? 'bg-indigo-950/20 border-indigo-800/60 text-indigo-200'
          : 'bg-slate-900/60 border-slate-800 text-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              hasMismatch 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {hasMismatch ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">
                  {hasMismatch 
                    ? 'Atenção: Inconsistência de Hash Detectada em Nuvem' 
                    : isSyncing
                    ? 'Sincronização em Andamento com o Google Drive...'
                    : 'Todos os 5 Cofres Estão 100% Sincronizados e Seguros'}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {hasMismatch
                  ? 'O hash de um dos arquivos na nuvem não confere com o cofre local. O EGC bloqueou restaurações automáticas.'
                  : 'Os checksums SHA-256 locais e remotos conferem bit a bit. Zero corrupção de dados.'}
              </p>
            </div>
          </div>

          {/* Indicador de Polling Discreto */}
          <div className="flex items-center gap-3 self-start md:self-center text-xs text-slate-400 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${autoPoll ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              <span>{autoPoll ? `Atualizando a cada ${pollIntervalSec}s` : 'Atualização pausada'}</span>
            </div>
            {autoPoll && (
              <span className="text-[11px] text-slate-500 font-mono">({pollCountdown}s)</span>
            )}
          </div>
        </div>

        {/* 3. Métricas Essenciais em Formato Limpo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-slate-800/60 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] mb-0.5">Último Backup Concluído</span>
            <strong className="text-white text-sm">
              {syncState ? formatRelativeTime(syncState.lastSuccessfulBackupTimestamp) : '--'}
            </strong>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] mb-0.5">Integridade dos Arquivos</span>
            <strong className={`text-sm ${hasMismatch ? 'text-red-400' : 'text-emerald-400'}`}>
              {hasMismatch ? '4 de 5 Verificados' : '100% (5/5 Verificados)'}
            </strong>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] mb-0.5">Armazenamento em Nuvem</span>
            <strong className="text-white text-sm">
              {syncState?.totalSizeMb} MB <span className="text-slate-400 font-normal text-xs">(5 arquivos)</span>
            </strong>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] mb-0.5">Pasta de Destino</span>
            <span className="text-slate-300 text-xs truncate block" title={syncState?.remoteDriveFolder}>
              EGC_Encrypted_Backups
            </span>
          </div>
        </div>
      </div>

      {/* 4. Navegação por Abas Limpas */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveView('files')}
            className={`pb-2 transition-all relative ${
              activeView === 'files'
                ? 'text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Arquivos do Cofre ({filesList.length})</span>
            {activeView === 'files' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveView('activity')}
            className={`pb-2 transition-all relative ${
              activeView === 'activity'
                ? 'text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Histórico de Atividades</span>
            {activeView === 'activity' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveView('settings')}
            className={`pb-2 transition-all relative ${
              activeView === 'settings'
                ? 'text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Configurações &amp; Simulação</span>
            {activeView === 'settings' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>
        </div>

        {activeView === 'files' && (
          <div className="hidden sm:block">
            <input
              type="text"
              placeholder="Filtrar por nome ou workspace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-700 w-56"
            />
          </div>
        )}
      </div>

      {/* 5. Visualização: Lista Limpa de Arquivos e Integridade */}
      {activeView === 'files' && (
        <div className="space-y-3">
          {filesList.map((file) => {
            const isMatch = file.localSha256 === file.remoteSha256;
            const isExpanded = expandedFileId === file.id;

            return (
              <div
                key={file.id}
                className={`rounded-xl border transition-all ${
                  isMatch
                    ? 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700/80'
                    : 'bg-red-950/20 border-red-800/80'
                }`}
              >
                {/* Linha Principal (Legível de Imediato) */}
                <div 
                  onClick={() => setExpandedFileId(isExpanded ? null : file.id)}
                  className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isMatch ? 'bg-slate-800/60 text-slate-300' : 'bg-red-900/40 text-red-300'
                    }`}>
                      <FileText className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white truncate">
                          {file.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ({file.workspace})
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 block truncate">
                        {file.vaultPath}
                      </span>
                    </div>
                  </div>

                  {/* Informações Resumidas e Status */}
                  <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                    <div className="text-right text-xs text-slate-400">
                      <div className="text-slate-300 font-medium">{formatBytes(file.sizeBytes)}</div>
                      <div className="text-[11px] text-slate-500">{formatRelativeTime(file.lastBackupTimestamp)}</div>
                    </div>

                    <div className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 ${
                      isMatch
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                        : 'bg-red-950 text-red-300 border border-red-700'
                    }`}>
                      {isMatch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                      <span>{isMatch ? 'Íntegro' : 'Hash Divergente'}</span>
                    </div>

                    <button 
                      aria-label="Expandir detalhes"
                      className="text-slate-400 hover:text-white p-1"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Gaveta de Detalhes do Hash (Abre com 1 clique) */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 text-xs space-y-3 bg-slate-950/40 rounded-b-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {/* Hash Local */}
                      <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Checksum SHA-256 Local (Disco):</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(file.localSha256, `${file.id}-local`);
                            }}
                            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                          >
                            {copiedHash === `${file.id}-local` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedHash === `${file.id}-local` ? 'Copiado' : 'Copiar'}</span>
                          </button>
                        </div>
                        <code className="text-slate-300 font-mono text-[11px] break-all select-all block">
                          {file.localSha256}
                        </code>
                      </div>

                      {/* Hash Remoto */}
                      <div className={`p-3 rounded-lg border ${
                        isMatch 
                          ? 'bg-slate-900/80 border-slate-800' 
                          : 'bg-red-950/40 border-red-800 text-red-200'
                      }`}>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span className={isMatch ? '' : 'text-red-300 font-medium'}>
                            Checksum SHA-256 Remoto (Google Drive):
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(file.remoteSha256, `${file.id}-remote`);
                            }}
                            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                          >
                            {copiedHash === `${file.id}-remote` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedHash === `${file.id}-remote` ? 'Copiado' : 'Copiar'}</span>
                          </button>
                        </div>
                        <code className={`font-mono text-[11px] break-all select-all block ${isMatch ? 'text-slate-300' : 'text-red-300'}`}>
                          {file.remoteSha256}
                        </code>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                      <span>Criptografia: AES-256-GCM com autenticação AAD vinculada ao workspace • {file.chunkCount} blocos</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleForceSync();
                        }}
                        disabled={isForceSyncing || isSyncing}
                        className="self-start sm:self-auto text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        <Zap className="w-3 h-3 fill-current" />
                        <span>Force Sync neste cofre</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Visualização: Histórico de Atividades Limpo */}
      {activeView === 'activity' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 divide-y divide-slate-800/80 text-xs">
          {(syncState?.activityLogs || []).map((log) => (
            <div key={log.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                log.level === 'SUCCESS' ? 'bg-emerald-400' :
                log.level === 'WARN' ? 'bg-amber-400' :
                log.level === 'ERROR' ? 'bg-red-400' : 'bg-slate-400'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 leading-relaxed">{log.message}</p>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 7. Visualização: Configurações de Frequência & Simulação */}
      {activeView === 'settings' && (
        <div className="space-y-4">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-white">Frequência de Polling do Daemon</h3>
            <p className="text-slate-400">
              Configure a periodicidade com que o painel consulta o daemon local para validar o estado do cofre.
            </p>

            <div className="flex items-center gap-3">
              {[3, 5, 10, 30].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setPollIntervalSec(sec)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    pollIntervalSec === sec
                      ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  A cada {sec} segundos
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Simulação de Segurança: Detecção de Adulteração em Nuvem</span>
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Permite testar como o EGC se comporta se um arquivo armazenado no Google Drive for alterado ou corrompido.
              Ao ativar, o checksum remoto é alterado artificialmente e o EGC deve sinalizar o alerta imediatamente.
            </p>

            <button
              onClick={() => {
                if (simulatedTamperId) {
                  setSimulatedTamperId(null);
                } else {
                  setSimulatedTamperId('vf-smart');
                  setActiveView('files');
                }
              }}
              className={`px-3.5 py-2 rounded-lg border font-medium text-xs transition-colors flex items-center gap-1.5 ${
                simulatedTamperId
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {simulatedTamperId ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{simulatedTamperId ? 'Remover Simulação (Restaurar Estado Válido)' : 'Simular Divergência no smart-quantum-yield.vault'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
