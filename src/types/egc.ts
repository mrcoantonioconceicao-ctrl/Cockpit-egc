export interface PillarInfo {
  id: 'memory' | 'mesh' | 'guardian' | 'crusher';
  name: string;
  subtitle: string;
  specSummary: string;
  techStack: string[];
  keyChallenges: string[];
  slas: { metric: string; target: string; unit: string }[];
}

export interface SparringMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  pillar?: 'memory' | 'mesh' | 'guardian' | 'crusher' | 'general';
}

export interface GuardianResult {
  command: string;
  verdict: 'ALLOWED' | 'PROMPT_USER' | 'BLOCKED';
  riskScore: number;
  matchedRules: {
    id: string;
    score: number;
    severity: string;
    reason: string;
    category: string;
  }[];
  latencyMs: number;
  sandboxing: string;
}

export interface TokenCrushResult {
  originalTokens: number;
  crushedTokens: number;
  reductionPercentage: number;
  latencyMs: number;
  originalChars: number;
  crushedChars: number;
  crushedOutput: string;
  savingsEstimateUsd: string;
}

export interface SlaCalculation {
  concurrentTools: number;
  requestsPerSec: number;
  avgPayloadKb: number;
  ipcType: 'unix_socket' | 'shared_memory' | 'localhost_http';
  totalThroughputMbPerSec: number;
  estimatedP50Ms: number;
  estimatedP99Ms: number;
  walContentionRisk: 'LOW' | 'MODERATE' | 'CRITICAL';
  recommendedRingBufferMb: number;
  cpuOverheadPercent: number;
}

export interface WorkspaceRepo {
  id: string;
  name: string;
  path: string;
  branch: string;
  tool: 'VS Code' | 'Cursor' | 'Antigravity' | 'Claude Code';
  hashId: string;
  memoryKey: string;
  lastSync: string;
  auditStatus: 'VERIFIED' | 'WARNINGS' | 'UNAUDITED';
  exposedTags: string[];
}

export interface CrossRepoQuery {
  sourceWorkspace: string;
  targetWorkspace: string;
  query: string;
  mcpTool: string;
  response: string;
  latencyMs: number;
  sanitizedTokens: number;
  guardianPassed: boolean;
}

export interface DeviceProfile {
  id: 'pc' | 'notebook' | 'mobile';
  name: string;
  type: string;
  screenDesc: string;
  networkType: 'Localhost (0ms)' | 'Wi-Fi LAN (<1ms)' | 'Tailscale/5G (15-30ms)';
  bandwidthMode: 'Full Raw AST' | 'Standard' | 'Ultra-Crushed (90% compression)';
  activeRole: string;
  status: 'ONLINE' | 'STANDBY';
}


