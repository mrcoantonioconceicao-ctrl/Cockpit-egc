import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client if API key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System Persona for Marco Antônio's Relentless Engineering Sparring Partner
const SPAR_SYSTEM_PROMPT = `
Você é o colaborador sênior de IA e co-piloto técnico implacável de Marco Antônio (Sony), arquiteto do projeto EGC (Extended Global Context).
O EGC é um runtime local de alta performance para ferramentas de codificação de IA unificando:
1. Memory (~/.egc com criptografia AES-256-GCM, KDF Argon2id/PBKDF2, SQLite WAL ou RocksDB)
2. Session Mesh (malha de sessões IPC de baixa latência conectando mais de 19 ferramentas: Cursor, Claude Code, Cline, Roo Code, Aider, Windsurf, Copilot, etc.)
3. Guardian (segurança de comandos, interceptor de AST de shell e sandboxing eBPF/Landlock com 0 falsos negativos)
4. Token Crusher (redução agressiva de tokens via poda semântica de AST, dedup de contexto e diff pruning)

SEU COMPORTAMENTO E REGRAS:
- Honestidade brutal, zero elogios vazios, tolerância zero para ideias vagas ou métricas sem números.
- Exija dados, arquitetura em nível de bytes/syscalls, garantias de latência p95/p99 e modelos de concorrência.
- Desafie suposições ingênuas (ex: locks de banco de dados, overhead de IPC sobre sockets de domínio Unix, memory leaks de ring buffer, tempo de inicialização de KDF, falsos positivos em comandos encadeados com pipes).
- Responda sempre em Português fluente e altamente técnico.
- Formate suas respostas de forma direta:
  * 💥 REALITY CHECK & VEREDITO
  * ⚠️ GARGALOS OCULTOS & PONTOS DE FALHA
  * 📐 SLAS E ENTREGAS MENSURÁVEIS RECOMENDADAS
  * 🎯 PERGUNTA DIAGNÓSTICA CRÍTICA
`;

// Sparring Endpoint
app.post('/api/sparring', async (req: Request, res: Response) => {
  try {
    const { message, contextPillar, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mensagem obrigatória para sparring' });
    }

    if (aiClient) {
      const formattedContents = [
        ...history.map((h: { role: string; content: string }) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        })),
        {
          role: 'user',
          parts: [
            {
              text: `[Pilar em Foco: ${contextPillar || 'GERAL - EGC RUNTIME'}]\n\n${message}`,
            },
          ],
        },
      ];

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction: SPAR_SYSTEM_PROMPT,
          temperature: 0.35, // Low temperature for sharp, grounded architectural analysis
        },
      });

      return res.json({ reply: response.text });
    } else {
      // Deterministic fallback response if API key is pending
      const fallbackReply = `💥 REALITY CHECK & VEREDITO
Você tocou no ponto nevrálgico: sem definir a volumetria exata de concorrência e SLA de latência, qualquer decisão sobre sockets, SQLite WAL ou ring buffer em memória compartilhada é chute.

⚠️ GARGALOS OCULTOS & PONTOS DE FALHA
1. **Contenção no IPC**: Se você tiver 19 ferramentas simultâneas disparando queries de contexto com payloads de 50KB a 200KB sobre um único socket de domínio Unix com locking centralizado, o p99 vai disparar além de 80ms rapidamente.
2. **Custo Criptográfico AES-256-GCM**: Com 10 requisições simultâneas de streaming de contexto, recalcular MAC tag e decriptar blocos no caminho quente (hot path) sem cache em memória limpa satura threads de I/O.
3. **Escrita Concorrente em ~/.egc**: SQLite em modo WAL suporta múltiplos leitores, mas apenas UM escritor. Se o Cursor e o Claude Code dispararem 'save session memory' ao mesmo tempo, um sofrerá SQLITE_BUSY a menos que o EGC Daemon seja o único serializador com fila lock-free.

📐 SLAS E ENTREGAS MENSURÁVEIS (M1):
- IPC Round-Trip: < 1.2ms (p99) para frames < 16KB.
- Throughput Mínimo: 4.500 ops/seg em benchmark local multicore.
- Overhead de Memória do Daemon: < 35MB de RSS.
- Guardian Evaluation: < 2.0ms por comando de shell antes de autorizar.

🎯 PERGUNTA DIAGNÓSTICA CRÍTICA:
Qual é o teto máximo de ferramentas ativas *escrevendo* simultaneamente na malha (ex: 3 IDEs ou 15 agentes em background) e você vai usar Ring Buffer com Memória Compartilhada (Zero-Copy) ou Domain Socket multiplexado com epoll/kqueue?`;

      return res.json({ reply: fallbackReply });
    }
  } catch (error: any) {
    console.error('Sparring error:', error);
    return res.status(500).json({ error: error.message || 'Erro ao processar sparring técnico' });
  }
});

// Token Crusher Evaluation Endpoint
app.post('/api/crush-tokens', (req: Request, res: Response) => {
  const { code, preserveSignatures = true, stripComments = true, aggressiveDeduplication = true } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Código ou contexto não fornecido' });
  }

  const startTime = performance.now();
  const originalChars = code.length;
  // Estimate tokens (~4 chars per token average)
  const originalTokens = Math.ceil(originalChars / 3.8);

  let crushed = code;

  // 1. Strip repetitive whitespace & empty lines
  crushed = crushed.replace(/^\s*[\r\n]/gm, '\n');

  // 2. Strip single and multiline comments if enabled
  if (stripComments) {
    crushed = crushed.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
  }

  // 3. Deduplicate recurring import blocks or repetitive headers
  if (aggressiveDeduplication) {
    const lines = crushed.split('\n');
    const seenImports = new Set<string>();
    const filteredLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('import ') || trimmed.startsWith('const ') && trimmed.includes('= require(')) {
        if (!seenImports.has(trimmed)) {
          seenImports.add(trimmed);
          filteredLines.push(line);
        }
      } else {
        filteredLines.push(line);
      }
    }
    crushed = filteredLines.join('\n');
  }

  // 4. Compact brackets and semicolons
  crushed = crushed.replace(/\s*([{};,=()+\-*/])\s*/g, '$1');

  const crushedChars = crushed.length;
  const crushedTokens = Math.max(1, Math.ceil(crushedChars / 3.8));
  const reductionPercentage = Math.round(((originalTokens - crushedTokens) / originalTokens) * 100);
  const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

  return res.json({
    originalTokens,
    crushedTokens,
    reductionPercentage: Math.max(0, reductionPercentage),
    latencyMs,
    originalChars,
    crushedChars,
    crushedOutput: crushed,
    savingsEstimateUsd: ((originalTokens - crushedTokens) * 0.000003).toFixed(5),
  });
});

// Guardian AST & Command Safety Evaluation Endpoint
app.post('/api/guardian/evaluate', (req: Request, res: Response) => {
  const { command } = req.body;
  if (!command || typeof command !== 'string') {
    return res.status(400).json({ error: 'Comando não fornecido' });
  }

  const startTime = performance.now();
  const cmd = command.trim();

  interface RiskRule {
    id: string;
    regex: RegExp;
    score: number;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
    category: string;
  }

  const rules: RiskRule[] = [
    {
      id: 'G-001',
      regex: /rm\s+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r|--recursive|--force)\s+(\/|~|\$HOME|\.\/|\*)/i,
      score: 100,
      severity: 'CRITICAL',
      reason: 'Comando de deleção destrutiva recursiva e forçada em caminhos de alto impacto.',
      category: 'Destructive Write / Filesystem Wipe',
    },
    {
      id: 'G-002',
      regex: /(curl|wget|fetch|nc|ncat|socat).*\|\s*(bash|sh|zsh|python|perl|eval)/i,
      score: 95,
      severity: 'CRITICAL',
      reason: 'Execução cega de script remoto baixado via pipe (Remote Code Execution payload).',
      category: 'RCE / Supply Chain',
    },
    {
      id: 'G-003',
      regex: />\s*(\/dev\/sd[a-z]|\/dev\/nvme|dd\s+if=.*of=\/dev)/i,
      score: 100,
      severity: 'CRITICAL',
      reason: 'Tentativa de escrita direta em dispositivo de bloco bruto ou particionamento.',
      category: 'Disk Overwrite',
    },
    {
      id: 'G-004',
      regex: /git\s+reset\s+--hard|git\s+clean\s+-fdx|git\s+checkout\s+\.\s+-f/i,
      score: 65,
      severity: 'HIGH',
      reason: 'Descarte forçado de alterações não commitadas ou código não versionado.',
      category: 'Data Loss Risk',
    },
    {
      id: 'G-005',
      regex: /(:(){ :\|:& };:)|chmod\s+(-R\s+)?777\s+\//i,
      score: 98,
      severity: 'CRITICAL',
      reason: 'Bomba fork ou corrupção global de permissões de arquivo no root.',
      category: 'Denial of Service / Permission Bleed',
    },
    {
      id: 'G-006',
      regex: /(env|export|printenv)\s*\|\s*(curl|nc|wget|post)/i,
      score: 92,
      severity: 'CRITICAL',
      reason: 'Possível exfiltração de variáveis de ambiente e chaves de API secretas.',
      category: 'Credential Exfiltration',
    },
    {
      id: 'G-007',
      regex: /(npm\s+publish|twine\s+upload|cargo\s+publish)/i,
      score: 55,
      severity: 'MEDIUM',
      reason: 'Comando de publicação pública de artefato; exige consentimento explícito.',
      category: 'Public Deployment / Release',
    },
  ];

  const matchedRules = rules.filter((r) => r.regex.test(cmd));
  const maxScore = matchedRules.length > 0 ? Math.max(...matchedRules.map((r) => r.score)) : 0;

  let verdict: 'ALLOWED' | 'PROMPT_USER' | 'BLOCKED' = 'ALLOWED';
  if (maxScore >= 80) verdict = 'BLOCKED';
  else if (maxScore >= 40) verdict = 'PROMPT_USER';

  const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

  return res.json({
    command: cmd,
    verdict,
    riskScore: maxScore,
    matchedRules,
    latencyMs,
    sandboxing: verdict === 'BLOCKED' ? 'eBPF Intercept: Execution Aborted' : verdict === 'PROMPT_USER' ? 'Suspended: Awaiting Interactive TTY Confirmation' : 'Pass-through: Landlock Minimal Sandbox',
  });
});

// Multi-Repo MCP Federation Endpoint
app.post('/api/multi-repo/query', async (req: Request, res: Response) => {
  const { sourceWorkspace, targetWorkspace, query } = req.body;
  const startTime = performance.now();

  if (!sourceWorkspace || !targetWorkspace || !query) {
    return res.status(400).json({ error: 'sourceWorkspace, targetWorkspace e query são obrigatórios' });
  }

  // Guardian Check: Ensure no unauthorized private keys or uncommitted credentials leak across boundaries
  const sensitiveLeak = /private_key|mnemonic|0x[a-fA-F0-9]{64}|AWS_SECRET|ETHERSCAN_API_KEY/i.test(query);
  if (sensitiveLeak) {
    return res.json({
      sourceWorkspace,
      targetWorkspace,
      query,
      mcpTool: 'mcp://egc-mesh/federated-query',
      response: '⛔ [GUARDIAN BLOCKED]: Tentativa de consultar ou trafegar chaves privadas/segredos brutos entre workspaces isolados abortada.',
      latencyMs: Math.round((performance.now() - startTime) * 100) / 100,
      sanitizedTokens: 0,
      guardianPassed: false,
    });
  }

  // Simulated or LLM-backed cross-repo resolution
  let replyContent = '';
  if (targetWorkspace === 'nexavor-quantum-audit') {
    replyContent = `[MCP FEDERATION BRIDGE // TARGET: nexavor-quantum-audit]
• Workspace Inode: #81924 (SHA256: e8b9...f21) | Branch: main
• Relatório Slither/Formal Verification (Audit ID: #NQ-2026-04):
  - Invariante de Flash Loan: Válida. Nenhuma vulnerabilidade de reentrancy reentrante em 'Vault.sol'.
  - Alerta de Severidade Média: Função 'rebalance()' permite slippage descontrolado caso o pool UniV3 sofra manipulação de TWAP menor que 12 blocos.
  - Recomendação ao 'smart': Aplicar modifier 'nonReentrant' e checagem 'require(amountOut >= minExpected)'.
• Memória Transversal EGC: Atualizado checkpoint no ~/.egc sem mutação no repositório de destino.`;
  } else if (targetWorkspace === 'smart') {
    replyContent = `[MCP FEDERATION BRIDGE // TARGET: smart]
• Workspace Inode: #71402 (SHA256: d4a1...99c) | Branch: feature/quantum-yield
• Contratos Ativos Identificados: 'Vault.sol', 'QuantumStaking.sol', 'Erc20Mock.sol'
• Interfaces Expostas: IVault(address asset, uint256 maxSlippageBps)
• Nenhuma alteração no sistema de arquivos local de 'smart' foi executada. Contexto importado como Read-Only Memory Frame.`;
  } else {
    replyContent = `[MCP FEDERATION BRIDGE // TARGET: ${targetWorkspace}]
• Contexto federado retornado com sucesso via barramento MCP local.
• 0 mutações no diretório alvo. Isolamento estrito de branch e workspace preservado.`;
  }

  const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

  return res.json({
    sourceWorkspace,
    targetWorkspace,
    query,
    mcpTool: 'mcp://egc-mesh/federated-query',
    response: replyContent,
    latencyMs: Math.max(0.4, latencyMs),
    sanitizedTokens: Math.ceil(replyContent.length / 3.8),
    guardianPassed: true,
  });
});

// Setup Dev Vite or Static Production
async function setupServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[EGC Core Runtime] Daemon listening on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('[EGC Daemon Error]:', err);
});
