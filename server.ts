import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import type { AgencyTeamMember, ClientInvoiceRecord, Inquiry } from './src/types';
import {
  usernamesMatch,
  verifyStoredPasswordHash,
  signEdgeSessionToken,
  verifyEdgeSessionToken,
  sanitizeTeamMember,
} from './src/utils/teamCryptoEdge';
import { resolveMemberPermissions } from './src/utils/teamAuth';
import {
  mapCrmRowToInquiry,
  mapInquiryToCrmRow,
  mapInvoiceToRow,
  mapRowToInvoice,
} from './src/utils/supabaseRowMappers';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// If platform Secrets hold invalid placeholder strings, recover valid values from .env
const localEnvPath = path.resolve(__dirname, '.env');
if (fs.existsSync(localEnvPath)) {
  try {
    const parsedEnv = dotenv.parse(fs.readFileSync(localEnvPath, 'utf-8'));
    if (
      (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_URL.startsWith('https://')) &&
      parsedEnv.VITE_SUPABASE_URL?.startsWith('https://')
    ) {
      process.env.VITE_SUPABASE_URL = parsedEnv.VITE_SUPABASE_URL;
    }
    if (
      (!process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY.length < 30) &&
      parsedEnv.VITE_SUPABASE_ANON_KEY &&
      parsedEnv.VITE_SUPABASE_ANON_KEY.length >= 30
    ) {
      process.env.VITE_SUPABASE_ANON_KEY = parsedEnv.VITE_SUPABASE_ANON_KEY;
    }
  } catch {}
}

const app = express();
// AI Studio dev server must run strictly on port 3000
const port = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const DATA_STORE_PATH = path.resolve(__dirname, 'data-store.json');
const UPLOADS_DIR = path.resolve(__dirname, 'public', 'assets', 'uploads');
const INVOICES_UPLOADS_DIR = path.join(UPLOADS_DIR, 'invoices');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(INVOICES_UPLOADS_DIR)) {
  fs.mkdirSync(INVOICES_UPLOADS_DIR, { recursive: true });
}

// Serve invoice PDFs with explicit MIME and inline disposition
app.use(
  '/assets/uploads/invoices',
  (req, res, next) => {
    if (req.path.toLowerCase().endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
    next();
  },
  express.static(INVOICES_UPLOADS_DIR)
);

// Serve uploaded media directly in both dev and production
app.use('/assets/uploads', express.static(UPLOADS_DIR));

function offloadDataUrls<T>(input: T): { data: T; changed: boolean } {
  let changed = false;

  const walk = (val: any): any => {
    if (typeof val === 'string' && val.startsWith('data:')) {
      const match = val.match(/^data:(image|video)\/([a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (match && match[3].length > 2048) {
        try {
          let ext = match[2].toLowerCase().replace('jpeg', 'jpg').replace('svg+xml', 'svg');
          if (ext.includes('quicktime')) ext = 'mov';
          const buffer = Buffer.from(match[3], 'base64');
          const hash = crypto.createHash('sha1').update(buffer).digest('hex').slice(0, 16);
          const filename = `media-${hash}.${ext}`;
          const filePath = path.join(UPLOADS_DIR, filename);
          if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, buffer);
          }
          changed = true;
          return `/assets/uploads/${filename}`;
        } catch (err) {
          console.warn('Failed to offload data URL:', err);
          return val;
        }
      }
      return val;
    }
    if (Array.isArray(val)) {
      return val.map(walk);
    }
    if (val && typeof val === 'object') {
      const out: Record<string, any> = {};
      for (const key of Object.keys(val)) {
        out[key] = walk(val[key]);
      }
      return out;
    }
    return val;
  };

  return { data: walk(input), changed };
}

// Endpoint: Get persisted agency data (case studies, packages, etc.)
app.get('/api/agency-data', (_req, res) => {
  try {
    if (fs.existsSync(DATA_STORE_PATH)) {
      const content = fs.readFileSync(DATA_STORE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      const { data: cleaned, changed } = offloadDataUrls(parsed);
      if (changed) {
        try {
          fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(cleaned, null, 2), 'utf-8');
        } catch {}
      }
      return res.json(cleaned);
    }
  } catch (err) {
    console.warn('Error reading data-store.json:', err);
  }
  res.json(null);
});

// Endpoint: Save / update persisted agency data on the server
app.post('/api/agency-data', (req, res) => {
  try {
    let payload = req.body;
    if (!payload || !payload.caseStudies || !Array.isArray(payload.caseStudies)) {
      return res.status(400).json({ error: 'Invalid payload structure' });
    }
    // Safeguard canonical case studies: If existing store has canonical studies and incoming doesn't, preserve them
    if (fs.existsSync(DATA_STORE_PATH)) {
      try {
        const existing = JSON.parse(fs.readFileSync(DATA_STORE_PATH, 'utf-8'));
        const existingAgu = existing.caseStudies?.find((c: any) => c.id === 'cs-b2b-agu');
        if (existingAgu && !payload.caseStudies.some((c: any) => c.id === 'cs-b2b-agu')) {
          payload.caseStudies.splice(1, 0, existingAgu);
        }
        const existingPremium = existing.caseStudies?.find((c: any) => c.id === 'cs-b2b-premium');
        if (existingPremium && !payload.caseStudies.some((c: any) => c.id === 'cs-b2b-premium')) {
          payload.caseStudies.splice(2, 0, existingPremium);
        }
        const existingBp = existing.caseStudies?.find((c: any) => c.id === 'cs-b2b-business-partner');
        if (existingBp && !payload.caseStudies.some((c: any) => c.id === 'cs-b2b-business-partner')) {
          payload.caseStudies.splice(3, 0, existingBp);
        }
        const existingOverview = existing.caseStudies?.find((c: any) => c.id === 'cs-b2b-overview');
        if (existingOverview && !payload.caseStudies.some((c: any) => c.id === 'cs-b2b-overview')) {
          payload.caseStudies.splice(4, 0, existingOverview);
        }
        const existingOro = existing.caseStudies?.find((c: any) => c.id === 'cs-b2b-oro');
        if (existingOro && !payload.caseStudies.some((c: any) => c.id === 'cs-b2b-oro')) {
          payload.caseStudies.splice(5, 0, existingOro);
        }
        const existingAfro = existing.caseStudies?.find((c: any) => c.id === 'cs-b2b-afro-energy');
        if (existingAfro && !payload.caseStudies.some((c: any) => c.id === 'cs-b2b-afro-energy')) {
          payload.caseStudies.splice(6, 0, existingAfro);
        }
        const existingSadko = existing.caseStudies?.find((c: any) => c.id === 'cs-b2b-sadko');
        if (existingSadko && !payload.caseStudies.some((c: any) => c.id === 'cs-b2b-sadko')) {
          payload.caseStudies.splice(7, 0, existingSadko);
        }
        const existingUfar = existing.caseStudies?.find((c: any) => c.id === 'cs-b2b-ufar');
        if (existingUfar && !payload.caseStudies.some((c: any) => c.id === 'cs-b2b-ufar')) {
          payload.caseStudies.splice(8, 0, existingUfar);
        }
        const existingSiltalId = existing.caseStudies?.find((c: any) => c.id === 'cs-b2b-siltal-identity');
        if (existingSiltalId && !payload.caseStudies.some((c: any) => c.id === 'cs-b2b-siltal-identity')) {
          payload.caseStudies.splice(9, 0, existingSiltalId);
        }
        const existingBilton = existing.caseStudies?.find((c: any) => c.id === 'cs-b2b-bilton');
        if (existingBilton && !payload.caseStudies.some((c: any) => c.id === 'cs-b2b-bilton')) {
          payload.caseStudies.splice(10, 0, existingBilton);
        }
        const existingPenguinWeb = existing.caseStudies?.find((c: any) => c.id === 'cs-b2c-penguin-web');
        if (existingPenguinWeb && !payload.caseStudies.some((c: any) => c.id === 'cs-b2c-penguin-web')) {
          payload.caseStudies.splice(11, 0, existingPenguinWeb);
        }
        // Preserve stored passwordHash values if incoming teamMembers payload was sanitized
        if (Array.isArray(existing.teamMembers) && Array.isArray(payload.teamMembers)) {
          const hashById = new Map<string, string>();
          for (const m of existing.teamMembers) {
            if (m?.id && typeof m.passwordHash === 'string' && m.passwordHash) {
              hashById.set(m.id, m.passwordHash);
            }
          }
          payload.teamMembers = payload.teamMembers.map((m: any) => {
            if (m && m.id && !m.passwordHash && hashById.has(m.id)) {
              return { ...m, passwordHash: hashById.get(m.id) };
            }
            return m;
          });
        }
      } catch {}
    }
    const { data: cleaned } = offloadDataUrls(payload);
    fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(cleaned, null, 2), 'utf-8');
    res.json({ success: true, message: 'Agency data persisted to server successfully' });
  } catch (err: any) {
    console.error('Error saving data-store.json:', err);
    res.status(500).json({ error: 'Failed to write agency data on server' });
  }
});

// Endpoint: Host generated invoice PDF so it can be linked/shared cleanly via WhatsApp
app.post('/api/invoices/upload-pdf', (req, res) => {
  try {
    const { invoiceNumber, pdfBase64 } = req.body || {};
    if (!pdfBase64 || typeof pdfBase64 !== 'string') {
      return res.status(400).json({ error: 'PDF payload is required' });
    }

    const base64Clean = pdfBase64.replace(/^data:application\/pdf(?:;[^,]*)?;base64,/i, '').trim();
    const buffer = Buffer.from(base64Clean, 'base64');

    if (buffer.length < 100 || buffer.length > 20 * 1024 * 1024) {
      return res.status(400).json({ error: 'Invalid PDF size' });
    }
    if (buffer.subarray(0, 4).toString('ascii') !== '%PDF') {
      return res.status(400).json({ error: 'Invalid PDF file signature' });
    }

    const safeInv = String(invoiceNumber || 'DE-INV')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 48) || 'DE-INV';
    const hash = crypto.createHash('sha1').update(buffer).digest('hex').slice(0, 10);
    const filename = `${safeInv}-${hash}.pdf`;
    const filePath = path.join(INVOICES_UPLOADS_DIR, filename);

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, buffer);
    }

    return res.json({
      success: true,
      url: `/assets/uploads/invoices/${filename}`,
      filename,
    });
  } catch (err: any) {
    console.error('Error uploading invoice PDF:', err);
    return res.status(500).json({ error: 'Failed to store invoice PDF' });
  }
});

// Cloudflare GeoIP local development emulator
app.get('/api/geo', (req, res) => {
  const cfCountry = (req.headers['cf-ipcountry'] as string) || null;
  res.json({
    country: cfCountry ? cfCountry.toUpperCase() : null,
    isDetected: Boolean(cfCountry),
  });
});

// Server-side Team Account Authentication, Password Hashing (scrypt / pbkdf2), & RBAC Workspace Guard
const TEAM_SESSION_SECRET =
  (process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim().length >= 16
    ? process.env.SESSION_SECRET.trim()
    : '') ||
  (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.trim().length >= 20
    ? process.env.SUPABASE_SERVICE_ROLE_KEY.trim()
    : '') ||
  crypto.randomBytes(32).toString('hex');

function getSupabaseAdminConfig(): { supabaseUrl: string; serviceRoleKey: string } | null {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '')
    .trim()
    .replace(/\/$/, '');
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!supabaseUrl.startsWith('https://') || serviceRoleKey.length < 20) {
    return null;
  }
  return { supabaseUrl, serviceRoleKey };
}

function readLocalDataStore(): Record<string, any> {
  try {
    if (fs.existsSync(DATA_STORE_PATH)) {
      return JSON.parse(fs.readFileSync(DATA_STORE_PATH, 'utf-8')) || {};
    }
  } catch (err) {
    console.warn('Error reading local data-store.json:', err);
  }
  return {};
}

function writeLocalDataStore(nextState: Record<string, any>): void {
  fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(nextState, null, 2), 'utf-8');
}

async function loadTeamDirectory(): Promise<{
  teamMembers: AgencyTeamMember[];
  finOpsState: Record<string, any>;
  source: 'supabase' | 'local';
}> {
  const sb = getSupabaseAdminConfig();
  if (sb) {
    try {
      const storeRes = await fetch(
        `${sb.supabaseUrl}/rest/v1/agency_crm_store?id=eq.admin_finance_ops&select=state_json`,
        {
          method: 'GET',
          headers: {
            apikey: sb.serviceRoleKey,
            Authorization: `Bearer ${sb.serviceRoleKey}`,
            Accept: 'application/json',
          },
        }
      );
      if (storeRes.ok) {
        const rows = (await storeRes.json()) as Array<{ state_json?: Record<string, any> }>;
        const stateJson = rows?.[0]?.state_json || {};
        if (Array.isArray(stateJson.teamMembers) && stateJson.teamMembers.length > 0) {
          return {
            teamMembers: stateJson.teamMembers,
            finOpsState: stateJson,
            source: 'supabase',
          };
        }
      }
    } catch (err) {
      console.warn('Supabase team directory lookup fallback to local store:', err);
    }
  }

  const localStore = readLocalDataStore();
  const localMembers: AgencyTeamMember[] = Array.isArray(localStore.teamMembers)
    ? localStore.teamMembers
    : [];
  return {
    teamMembers: localMembers,
    finOpsState: {
      teamMembers: localMembers,
      expenses: Array.isArray(localStore.expenses) ? localStore.expenses : [],
      financialAuditLog: Array.isArray(localStore.financialAuditLog) ? localStore.financialAuditLog : [],
      closedMonths: localStore.closedMonths || {},
      financialSettings: localStore.financialSettings || undefined,
    },
    source: 'local',
  };
}

async function authenticateTeamWorkspaceRequest(req: express.Request): Promise<{
  member?: AgencyTeamMember;
  finOpsState?: Record<string, any>;
  teamMembers?: AgencyTeamMember[];
  source?: 'supabase' | 'local';
  status?: number;
  error?: string;
}> {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) {
    return { status: 401, error: 'Unauthorized' };
  }
  const verified = await verifyEdgeSessionToken(token, TEAM_SESSION_SECRET);
  if (!verified) {
    return { status: 401, error: 'Invalid or expired session' };
  }
  const dir = await loadTeamDirectory();
  const member = dir.teamMembers.find((m) => m && m.id === verified.memberId);
  if (!member || member.active === false) {
    return { status: 403, error: 'Account inactive' };
  }
  return {
    member,
    finOpsState: dir.finOpsState,
    teamMembers: dir.teamMembers,
    source: dir.source,
  };
}

app.post('/api/team/hash-password', (req, res) => {
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (password.length < 6 || password.length > 128) {
    return res.status(400).json({ error: 'Password must be between 6 and 128 characters.' });
  }
  const salt = crypto.randomBytes(16).toString('hex');
  crypto.scrypt(password, salt, 64, (err, derivedKey) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to hash password' });
    }
    return res.json({ hash: `scrypt$${salt}$${derivedKey.toString('hex')}` });
  });
});

app.post('/api/team/verify-password', async (req, res) => {
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const storedHash = typeof req.body?.hash === 'string' ? req.body.hash : '';
  if (!password || password.length > 128 || !storedHash) {
    return res.json({ valid: false });
  }
  try {
    const valid = await verifyStoredPasswordHash(password, storedHash);
    if (!valid) {
      return res.json({ valid: false });
    }
    const now = Date.now();
    const sessionToken = await signEdgeSessionToken(
      {
        memberId: `verify-${storedHash.slice(0, 12)}`,
        username: 'verified',
        iat: now,
        exp: now + 12 * 60 * 60 * 1000,
      },
      TEAM_SESSION_SECRET
    );
    return res.json({ valid: true, sessionToken });
  } catch {
    return res.status(500).json({ valid: false });
  }
});

app.post('/api/team/login', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const rawUsername = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const rawPassword = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!rawUsername || !rawPassword || rawPassword.length > 128) {
      return res.status(400).json({ ok: false, invalidCredentials: true });
    }

    const { teamMembers } = await loadTeamDirectory();
    if (teamMembers.length === 0) {
      return res.status(401).json({ ok: false, directoryEmpty: true, invalidCredentials: true });
    }

    const matched = teamMembers.find(
      (m) => m && m.username && usernamesMatch(m.username, rawUsername)
    );

    if (!matched || !matched.passwordHash) {
      return res.status(401).json({ ok: false, invalidCredentials: true });
    }

    if (matched.active === false) {
      return res.status(403).json({ ok: false, suspended: true });
    }

    const valid = await verifyStoredPasswordHash(rawPassword, matched.passwordHash);
    if (!valid) {
      return res.status(401).json({ ok: false, invalidCredentials: true });
    }

    const now = Date.now();
    const sessionToken = await signEdgeSessionToken(
      {
        memberId: matched.id,
        username: matched.username || rawUsername,
        iat: now,
        exp: now + 12 * 60 * 60 * 1000,
      },
      TEAM_SESSION_SECRET
    );

    return res.json({
      ok: true,
      member: sanitizeTeamMember(matched),
      sessionToken,
    });
  } catch (err) {
    console.error('Team login error:', err);
    return res.status(500).json({ ok: false, error: 'Authentication service error' });
  }
});

app.get('/api/team/workspace', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const auth = await authenticateTeamWorkspaceRequest(req);
    if (!auth.member) {
      return res.status(auth.status || 401).json({ ok: false, error: auth.error || 'Unauthorized' });
    }

    const perms = resolveMemberPermissions(auth.member);
    const sb = getSupabaseAdminConfig();
    let clients: Inquiry[] = [];
    let invoices: ClientInvoiceRecord[] = [];

    if (sb && auth.source === 'supabase') {
      const sbHeaders = {
        apikey: sb.serviceRoleKey,
        Authorization: `Bearer ${sb.serviceRoleKey}`,
        Accept: 'application/json',
      };
      const [clientsRes, invoicesRes] = await Promise.all([
        fetch(`${sb.supabaseUrl}/rest/v1/crm_client_accounts?select=*&order=client_created_at.desc`, {
          method: 'GET',
          headers: sbHeaders,
        }),
        perms.canViewFinancials
          ? fetch(`${sb.supabaseUrl}/rest/v1/client_invoices?select=*&order=invoice_created_at.desc`, {
              method: 'GET',
              headers: sbHeaders,
            })
          : Promise.resolve(null),
      ]);
      if (clientsRes.ok) {
        const rawClients = (await clientsRes.json()) as any[];
        clients = Array.isArray(rawClients) ? rawClients.map(mapCrmRowToInquiry) : [];
      }
      if (invoicesRes && invoicesRes.ok) {
        const rawInv = (await invoicesRes.json()) as any[];
        invoices = Array.isArray(rawInv) ? rawInv.map(mapRowToInvoice) : [];
      }
    } else {
      const localStore = readLocalDataStore();
      clients = Array.isArray(localStore.inquiries) ? localStore.inquiries : [];
      invoices = perms.canViewFinancials && Array.isArray(localStore.invoices) ? localStore.invoices : [];
    }

    const safeTeamMembers = (auth.teamMembers || []).map(sanitizeTeamMember);

    return res.json({
      ok: true,
      member: sanitizeTeamMember(auth.member),
      teamMembers: safeTeamMembers,
      clients,
      ...(perms.canViewFinancials
        ? {
            invoices,
            expenses: Array.isArray(auth.finOpsState?.expenses) ? auth.finOpsState?.expenses : [],
            financialAuditLog: Array.isArray(auth.finOpsState?.financialAuditLog)
              ? auth.finOpsState?.financialAuditLog
              : [],
            closedMonths: auth.finOpsState?.closedMonths || {},
            financialSettings: auth.finOpsState?.financialSettings || undefined,
          }
        : {}),
    });
  } catch (err) {
    console.error('Team workspace load error:', err);
    return res.status(500).json({ ok: false, error: 'Failed to load team workspace' });
  }
});

app.post('/api/team/workspace', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const auth = await authenticateTeamWorkspaceRequest(req);
    if (!auth.member) {
      return res.status(auth.status || 401).json({ ok: false, error: auth.error || 'Unauthorized' });
    }

    const perms = resolveMemberPermissions(auth.member);
    const body = req.body as {
      action?: string;
      client?: Inquiry;
      invoice?: ClientInvoiceRecord;
      invoiceId?: string;
      financeOps?: Record<string, any>;
    } | null;

    if (!body || typeof body.action !== 'string') {
      return res.status(400).json({ ok: false, error: 'Invalid action' });
    }

    const sb = getSupabaseAdminConfig();
    const sbHeaders = sb
      ? {
          apikey: sb.serviceRoleKey,
          Authorization: `Bearer ${sb.serviceRoleKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        }
      : null;

    if (body.action === 'upsert_client' && body.client && body.client.id) {
      const localStore = readLocalDataStore();
      const existingList: Inquiry[] = Array.isArray(localStore.inquiries) ? localStore.inquiries : [];
      const existsIdx = existingList.findIndex((c) => c.id === body.client!.id);
      if (existsIdx >= 0) {
        existingList[existsIdx] = body.client;
      } else {
        existingList.unshift(body.client);
      }
      localStore.inquiries = existingList;
      writeLocalDataStore(localStore);

      if (sb && sbHeaders) {
        await fetch(`${sb.supabaseUrl}/rest/v1/crm_client_accounts?on_conflict=id`, {
          method: 'POST',
          headers: sbHeaders,
          body: JSON.stringify(mapInquiryToCrmRow(body.client)),
        });
      }
      return res.json({ ok: true });
    }

    if (body.action === 'upsert_invoice' && body.invoice && body.invoice.id) {
      if (!perms.canViewFinancials && !perms.canApproveAdWallet) {
        return res.status(403).json({ ok: false, error: 'Forbidden' });
      }
      const localStore = readLocalDataStore();
      const existingList: ClientInvoiceRecord[] = Array.isArray(localStore.invoices) ? localStore.invoices : [];
      const existsIdx = existingList.findIndex((i) => i.id === body.invoice!.id);
      if (existsIdx >= 0) {
        existingList[existsIdx] = body.invoice;
      } else {
        existingList.unshift(body.invoice);
      }
      localStore.invoices = existingList;
      writeLocalDataStore(localStore);

      if (sb && sbHeaders) {
        await fetch(`${sb.supabaseUrl}/rest/v1/client_invoices?on_conflict=id`, {
          method: 'POST',
          headers: sbHeaders,
          body: JSON.stringify(mapInvoiceToRow(body.invoice)),
        });
      }
      return res.json({ ok: true });
    }

    if (body.action === 'delete_invoice' && typeof body.invoiceId === 'string' && body.invoiceId) {
      if (!perms.canViewFinancials || !perms.canDeleteRecords) {
        return res.status(403).json({ ok: false, error: 'Forbidden' });
      }
      const localStore = readLocalDataStore();
      localStore.invoices = (Array.isArray(localStore.invoices) ? localStore.invoices : []).filter(
        (i: any) => i?.id !== body.invoiceId
      );
      writeLocalDataStore(localStore);

      if (sb) {
        await fetch(
          `${sb.supabaseUrl}/rest/v1/client_invoices?id=eq.${encodeURIComponent(body.invoiceId)}`,
          {
            method: 'DELETE',
            headers: {
              apikey: sb.serviceRoleKey,
              Authorization: `Bearer ${sb.serviceRoleKey}`,
            },
          }
        );
      }
      return res.json({ ok: true });
    }

    if (body.action === 'save_finance_ops' && body.financeOps && typeof body.financeOps === 'object') {
      if (!perms.canViewFinancials && !perms.canApproveAdWallet) {
        return res.status(403).json({ ok: false, error: 'Forbidden' });
      }
      const localStore = readLocalDataStore();
      if (Array.isArray(body.financeOps.expenses)) localStore.expenses = body.financeOps.expenses;
      if (Array.isArray(body.financeOps.financialAuditLog)) {
        localStore.financialAuditLog = body.financeOps.financialAuditLog;
      }
      if (body.financeOps.closedMonths) localStore.closedMonths = body.financeOps.closedMonths;
      if (body.financeOps.financialSettings) localStore.financialSettings = body.financeOps.financialSettings;
      writeLocalDataStore(localStore);

      if (sb && sbHeaders) {
        const mergedSnapshot = {
          ...(auth.finOpsState || {}),
          ...(Array.isArray(body.financeOps.expenses) ? { expenses: body.financeOps.expenses } : {}),
          ...(Array.isArray(body.financeOps.financialAuditLog)
            ? { financialAuditLog: body.financeOps.financialAuditLog }
            : {}),
          ...(body.financeOps.closedMonths ? { closedMonths: body.financeOps.closedMonths } : {}),
          ...(body.financeOps.financialSettings
            ? { financialSettings: body.financeOps.financialSettings }
            : {}),
          teamMembers: auth.teamMembers,
        };
        await fetch(`${sb.supabaseUrl}/rest/v1/agency_crm_store?on_conflict=id`, {
          method: 'POST',
          headers: sbHeaders,
          body: JSON.stringify({
            id: 'admin_finance_ops',
            state_json: mergedSnapshot,
          }),
        });
      }
      return res.json({ ok: true });
    }

    return res.status(400).json({ ok: false, error: 'Unsupported action' });
  } catch (err) {
    console.error('Team workspace update error:', err);
    return res.status(500).json({ ok: false, error: 'Failed to save team update' });
  }
});

app.get('/api/team/verify-session', async (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  const verified = token ? await verifyEdgeSessionToken(token, TEAM_SESSION_SECRET) : null;
  if (!verified) {
    return res.status(401).json({ valid: false });
  }
  return res.json({ valid: true, exp: verified.exp });
});

// Endpoint: AI Creative / Plan Image Analyzer using Gemini Vision
app.post('/api/analyze-creative-image', async (req, res) => {
  try {
    const { imageBase64, imageUrl, projectName, sector } = req.body;

    if (!imageBase64 && !imageUrl) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    // Prepare image part for Gemini
    let imagePart: any = null;
    const targetSource = imageBase64 || imageUrl;

    if (targetSource && targetSource.startsWith('data:')) {
      const matches = targetSource.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches) {
        imagePart = {
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        };
      }
    }

    const fallbackResponse = {
      title: `تصميم وخطة إعلانية استراتيجية — ${projectName || 'ديجيتال إفكت'}`,
      titleEn: `Strategic Ad Creative & Plan — ${projectName || 'Digital Effect'}`,
      tag: 'خطة تسويقية',
      tagEn: 'Marketing Plan',
      desc: `تصميم إعلاني وخطة تسويقية متكاملة لمشروع ${projectName || 'المشروع'} تهدف لترسيخ المكانة السوقية وزيادة التحويل والمبيعات.`,
      descEn: `Integrated ad creative and marketing plan asset for ${projectName || 'Project'} designed to maximize conversions and brand authority.`
    };

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ ...fallbackResponse, note: 'Used intelligent fallback (GEMINI_API_KEY not configured)' });
    }

    const promptText = `أنت خبير تسويق رقمي وإدارة حملات إعلانية في وكالة ديجيتال إفكت (Digital Effect).
قم بفحص وتحليل هذه الصورة المرفقة بدقة بالغة (قد تكون تصميماً إعلانياً، بوستر سوشيال ميديا، خطة تسويقية/بلان، صورة منتج أو كتالوج، أو رسم بياني للأداء).
سياق المشروع/العميل الحالي: "${projectName || 'مشروع تسويقي'}"، القطاع: "${sector || 'عام'}".

المطلوب:
استخرج وحلل محتوى الصورة بعناية شديدة، ثم أنشئ بيانات تسويقية متقنة بصيغة JSON فقط بهذه الحقول المحددة:
1. "title": عنوان رئيسي جذاب وموجز ودقيق باللغة العربية (بين 5 و 12 كلمة) يلخص ما تحتويه الصورة/الخطة وقيمتها الترويجية مع ذكر المنتج أو الخدمة البارزة.
2. "titleEn": عنوان احترافي مقابل باللغة الإنجليزية.
3. "tag": تصنيف تسويقي دقيق من كلمة أو كلمتين بالعربية يلائم المحتوى (مثل: "خطة تسويقية", "إعلانات تحويلية", "هوية رقمية", "تصميم إعلاني", "حملة الصيف", "عروض وتخفيضات", "توعية طبية", "موشن جرافيك", "أداء سحابي").
4. "tagEn": التصنيف المقابل باللغة الإنجليزية (e.g. "Ad Creative", "Marketing Plan", "Brand Campaign", "Seasonal Offer").
5. "desc": شرح تسويقي احترافي متكامل من جملتين إلى 3 جمل بالعربية يصف سياق الحملة، القيمة المضافة المعروضة في الصورة، الجمهور المستهدف، والهدف الترويجي.
6. "descEn": الشرح المقابل باللغة الإنجليزية.

أجب بصيغة JSON فقط بدون نصوص تمهيدية.`;

    const parts: any[] = [];
    if (imagePart) {
      parts.push(imagePart);
    }
    parts.push({ text: promptText });

    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let resultJson = null;

    const aiClient = getAiClient();
    if (!aiClient) {
      return res.json({ ...fallbackResponse, note: 'Used intelligent fallback (GEMINI_API_KEY not configured)' });
    }

    for (const modelName of modelsToTry) {
      try {
        const response = await aiClient.models.generateContent({
          model: modelName,
          contents: { parts },
          config: {
            responseMimeType: 'application/json',
          }
        });

        if (response.text) {
          const cleanText = response.text.replace(/```json\n?|\n?```/g, '').trim();
          resultJson = JSON.parse(cleanText);
          if (resultJson.title) break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} error during image analysis:`, err?.message || err);
      }
    }

    if (resultJson && resultJson.title) {
      return res.json(resultJson);
    }

    return res.json(fallbackResponse);
  } catch (err: any) {
    console.error('Error analyzing creative image with AI:', err);
    return res.json({
      title: `تصميم إعلاني رقمي متكامل — ${req.body?.projectName || 'المشروع'}`,
      titleEn: `Integrated Digital Creative — ${req.body?.projectName || 'Project'}`,
      tag: 'تصميم إعلاني',
      tagEn: 'Ad Creative',
      desc: `تصميم إعلاني رقمي عالي الجودة يعزز التفاعل وتوليد الطلبات للعميل.`,
      descEn: `High-impact digital creative designed to maximize engagement and lead generation.`
    });
  }
});

// Lazily initialize server-side Gemini client so dev server boots cleanly even without GEMINI_API_KEY
let _aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!_aiClient) {
    _aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return _aiClient;
}

const SYSTEM_INSTRUCTION = `
أنت "المساعد الذكي لوكالة ديجيتال إفكت" (Digital Effect AI Advisor).
ديجيتال إفكت هي وكالة تسويق وحلول رقمية رائدة بخبرة تزيد عن ١٢ عاماً في السوق وخبرة تراكمية تتجاوز ٢٠ عاماً لشركائها وفريقها، ولها مقرات في القاهرة (التجمع الخامس) ودبي (الخليج التجاري).

مهمتك:
مساعدة العملاء والإجابة عن كافة استفساراتهم حول:
1. قطاعات الوكالة الثلاثة الرئيسية:
   - قطاع الشركات والمصانع (B2B): استراتيجيات ABM، إعلانات LinkedIn الموجهة، جذب العقود السنوية، صناعة المحتوى التخصصي والوثائقيات للمصانع، أتمتة الـ CRM. دراسات حالة بارزة: جمعية مستثمري مناطق بني سويف الصناعية (BSIZIA)، مجموعة الفنار للمعدات الثقيلة، كلاود مايند للـ ERP.
   - قطاع التجزئة والمستهلكين (B2C): مضاعفة المبيعات والمتاجر الإلكترونية، إعلانات Meta وتيك توك، إنتاج مقاطع فيديو ريلز وموشن جرافيك، حملات التقسيط البنكي (ValU و 2B). دراسات حالة بارزة: بينجوين للأجهزة المنزلية والتبريد، باينري راكس للاستضافة السحابية، قهوة جيموكا الإيطالية، معمار لاشين للتطوير العقاري، كونكريت للملابس، أكتون، يوكين، سيلتال، هامبورج، باساب (16898)، والوعد للسياحة.
   - القطاع الطبي والرعاية الصحية (Medical): التسويق الطبي الأخلاقي المعتمد، إنتاج فيديوهات الأطباء التوعوية، تصدر خرائط جوجل والبحث المحلي (Google Maps SEO)، مسارات الحجز الفوري وتحويل المشاهدات إلى مواعيد عيادة مؤكدة. دراسة حالة بارزة: مركز IPT للعلاج الطبيعي والتأهيل الحركي.

2. باقات الوكالة والأسعار:
   - باقات B2B: الباقة الاحترافية، وباقة الشركات الكبرى المخصصة (Custom Scope).
   - باقات B2C: الباقة الأساسية، باقة النمو، باقة التوسع ومقاطع الفيديو.
   - باقات Medical: باقة العيادات التخصصية، باقة المجمعات والمستشفيات، مع عروض الخصم الربع سنوي التي توفر حتى ١٧,٧٠٠ ج.م.

3. التواصل والحجز:
   - الهاتف والواتساب: 01505000349 (+20 150 500 0349)
   - البريد الإلكتروني: Sales@digitaleffect.net
   - تشجيع العميل دائماً على حجز استشارة مجانية مع خبراء الوكالة أو التواصل المباشر عبر الواتساب لدراسة مشروعه بالتفصيل.

أسلوب الرد:
- مهني، ودود، رصين، وواضح ومختصر.
- أجب بنفس لغة العميل (عربي افتراضياً، أو إنجليزي إذا سأل بالإنجليزية).
- استخدم نقاطاً مرتبة ومعلومات دقيقة تلائم نشاط العميل.
`;

function getIntelligentFallbackReply(userText: string, sectorContext?: string): string {
  const query = (userText || '').toLowerCase();
  const isEnglish = /[a-zA-Z]{3,}/.test(query) && !/[\u0600-\u06FF]/.test(query);

  if (isEnglish) {
    if (query.includes('medical') || query.includes('clinic') || query.includes('doctor') || query.includes('hospital') || query.includes('ipt') || sectorContext === 'medical') {
      return `Welcome to **Digital Effect - Medical Sector**!
With over 12 years of experience, we provide certified ethical medical growth solutions:

1. **Specialized Clinics Package**:
   - Targeted medical ad campaigns to drive qualified patient appointments.
   - Google Maps Medical SEO & local discovery.
   - Doctor awareness reel production and scripting.
   - Streamlined digital booking funnels.

2. **Medical Centers & Hospitals Package**:
   - Multi-specialty marketing & departmental coverage.
   - High-end documentary video & facility walk-throughs.
   - Automated CRM response and consultation booking.

🎁 **Quarterly Retainer Discount**:
Sign up for a 3-month retainer and save up to **17,700 EGP** on the full medical growth bundle!

📌 Check out our flagship case study: **IPT Physical Therapy & Rehabilitation Center**.
For immediate consultation, reach us on WhatsApp: **01505000349** (+20 150 500 0349).`;
    }

    if (query.includes('b2b') || query.includes('business') || query.includes('industrial') || query.includes('factory') || query.includes('bsizia') || sectorContext === 'b2b') {
      return `Welcome to **Digital Effect - B2B Sector**!
We empower manufacturers and enterprise businesses to secure long-term contracts and build market authority:

- **Account-Based Marketing (ABM)**: Precision LinkedIn targeting of C-level decision-makers and procurement managers.
- **Factory Documentaries & Technical Content**: Showcasing production lines, machinery, and capacity.
- **CRM & Sales Pipeline Automation**: Real-time lead tracking and CRM integration.

📌 **Flagship B2B Clients**: Beni Suef Industrial Zone Investors Association (BSIZIA), El-Fanar Heavy Equipment, and CloudMind ERP.
Chat with our enterprise advisors on WhatsApp: **01505000349** (+20 150 500 0349).`;
    }

    if (query.includes('b2c') || query.includes('retail') || query.includes('sales') || query.includes('store') || query.includes('penguin') || sectorContext === 'b2c') {
      return `Welcome to **Digital Effect - B2C Sector**!
We scale direct-to-consumer brands and retail revenue with high-impact creative campaigns:

- **High-ROAS Ad Campaigns**: Performance marketing across Meta, TikTok, and Google.
- **Creative Production**: Viral Reels, TikTok creative series, motion graphics, and product shoots.
- **Retail & Installment Campaigns**: Zero-interest promo launches with partners like ValU and 2B.

📌 **Featured Brands**: Penguin Home Appliances, Binary Racks, Gimoka Coffee, Memar Lashin, Concrete, Passap, and Al Waad Travel.
Connect with our creative team on WhatsApp: **01505000349** (+20 150 500 0349).`;
    }

    if (query.includes('price') || query.includes('cost') || query.includes('package') || query.includes('pricing')) {
      return `Digital Effect provides customized and fixed packages across 3 core sectors:
- **B2B**: ABM, LinkedIn management, factory documentary videos, and lead generation.
- **B2C**: Social media management, high-ROAS ads, Reels, and seasonal campaigns.
- **Medical**: Specialized clinic growth and center management, with quarterly discount savings up to **17,700 EGP**.

Explore our Packages section on the website or schedule a free strategy session with our team!`;
    }

    return `Welcome to **Digital Effect**!
We are an award-winning digital marketing agency with 12+ years in the market and 20+ years of collective leadership experience, operating from Cairo (New Cairo) and Dubai (Business Bay).

How can we assist you today?
- **Medical Sector**: Clinic marketing, doctor reels, Google Maps SEO, and quarterly discounts.
- **B2B Sector**: Enterprise ABM, LinkedIn campaigns, and factory documentaries.
- **B2C Sector**: Retail growth, viral video production, and performance ads.

Feel free to ask any question or chat with us on WhatsApp: **01505000349** (+20 150 500 0349).`;
  }

  // Arabic responses
  if (query.includes('طبي') || query.includes('ميديكال') || query.includes('عيادة') || query.includes('دكتور') || query.includes('مركز') || query.includes('ipt') || sectorContext === 'medical') {
    return `أهلاً بك! في **القطاع الطبي والرعاية الصحية (Medical)**، تقدم ديجيتال إفكت حلولاً تسويقية طبية متخصصة ومبنية على الامتثال الأخلاقي الكامل:

1. **باقة العيادات التخصصية**:
   - إدارة الحملات الطبية المركزة لجذب المرضى المناسبين.
   - تصدر خرائط جوجل والبحث المحلي (Google Maps Medical SEO).
   - إنتاج وتعديل مقاطع الفيديو التوعوية للأطباء.
   - مسار تحويل رقمي سلس لحجز المواعيد.

2. **باقة المراكز والمجمعات الطبية**:
   - إدارة متكاملة لكافة التخصصات والأقسام.
   - إنتاج تغطيات وثائقية وفيديوهات احترافية داخل المراكز.
   - أتمتة الردود وحجوزات المواعيد الطبية ومتابعة المرضى.

🎁 **عرض الخصم الربع سنوي**:
عند التعاقد الربع سنوي (٣ أشهر) نوفر خصماً مميزاً يصل توفيره إلى **١٧,٧٠٠ ج.م** على الباقة الشاملة.

📌 يمكنك الاطلاع على دراسة حالة عميلنا **مركز IPT للعلاج الطبيعي والتأهيل** من صفحة الدراسات في الموقع!
لأي استفسار إضافي أو لبدء خطتك فوراً، يمكنك مراسلتنا مباشرة على واتساب: **01505000349** (+20 150 500 0349).`;
  }

  if (query.includes('b2b') || query.includes('شركات') || query.includes('مصانع') || query.includes('مستثمر') || query.includes('صناعي') || query.includes('bsizia') || sectorContext === 'b2b') {
    return `أهلاً بك! في **قطاع الأعمال والشركات (B2B)**، نركز في ديجيتال إفكت على العقود طويلة الأجل وبناء الثقة المؤسسية:

- **استراتيجيات ABM (Account-Based Marketing)**: استهداف صناع القرار بدقة على LinkedIn.
- **صناعة المحتوى التخصصي والوثائقيات**: إبراز خطوط الإنتاج والقدرات التصنيعية للمصانع والشركات.
- **أتمتة المبيعات والـ CRM**: ربط الحملات الإعلانية بنظام إدارة العملاء لمتابعة الصفقات لحظة بلحظة.

📌 **أبرز شركاء النجاح**: دراسة حالة جمعية مستثمري مناطق بني سويف الصناعية (BSIZIA)، ومجموعة الفنار، وكلاود مايند.
تتوفر لدينا باقات مخصصة حسب حجم الشركة. للمزيد أو لحجز استشارة: **01505000349** (+20 150 500 0349).`;
  }

  if (query.includes('b2c') || query.includes('مبيعات') || query.includes('متاجر') || query.includes('ريلز') || query.includes('بينجوين') || query.includes('مستهلك') || sectorContext === 'b2c') {
    return `أهلاً بك! في **قطاع المستهلكين والتجزئة (B2C)**، نركز على تسريع المبيعات وتعزيز الانتشار الرقمي:

- **حملات التحويل العالي**: إعلانات Meta و TikTok مع التركيز على الـ ROAS (العائد على الإنفاق الإعلاني).
- **إنتاج المحتوى الإبداعي**: مقاطع Reels وفيديوهات تيك توك، موشن جرافيك، وتصوير منتجات عالي الدقة.
- **حملات المواسم والعروض**: حملات التقسيط والجمعة البيضاء وغيرها.

📌 **أبرز العلامات التجارية**: بينجوين للأجهزة المنزلية، باينري راكس، قهوة جيموكا، معمار لاشين، كونكريت، باساب، والوعد للسياحة.
يسعدنا دراسة خطتكم التسويقية مباشرة عبر الواتساب: **01505000349** (+20 150 500 0349).`;
  }

  if (query.includes('سعر') || query.includes('اسعار') || query.includes('باقة') || query.includes('باقات') || query.includes('تكلفة')) {
    return `أهلاً بك في ديجيتال إفكت!
لدينا باقات مصممة خصيصاً لكل قطاع:
- **قطاع B2B**: باقات مخصصة لتوليد العملاء المحتملين وصناع القرار.
- **قطاع B2C**: باقات تبدأ من إدارة السوشيال ميديا حتى الحملات الشاملة وإنتاج الفيديو الاحترافي.
- **القطاع الطبي**: باقات العيادات وباقات المراكز الطبية مع خصم ربع سنوي يوفر حتى **١٧,٧٠٠ ج.م**.

يمكنك تصفح صفحة الباقات في الموقع للاطلاع على تفاصيل كل باقة، أو الضغط على "حجز استشارة" للتحدث مع مستشارينا.`;
  }

  if (query.includes('تواصل') || query.includes('رقم') || query.includes('واتساب') || query.includes('عنوان') || query.includes('ايميل') || query.includes('مكان')) {
    return `يسعدنا تواصلك معنا دائماً!
- **الهاتف / واتساب**: 01505000349 (+20 150 500 0349)
- **البريد الإلكتروني**: Sales@digitaleffect.net
- **المقرات**: 
  - القاهرة: التجمع الخامس، القاهرة الجديدة
  - دبي: الخليج التجاري (Business Bay)
فريقنا متاح للرد على كافة استفساراتك على مدار الساعة!`;
  }

  return `مرحباً بك في ديجيتال إفكت (Digital Effect)!
نحن وكالة تسويق رقمي وحلول متكاملة بخبرة تتجاوز ١٢ عاماً في السوق العربي والخليجي.

كيف يمكنني مساعدتك اليوم؟
- هل تود الاستفسار عن باقات **القطاع الطبي (Medical)** وعروض الخصم؟
- أم خدمات وباقات **قطاع الشركات والمصانع (B2B)**؟
- أم حلول مضاعفة المبيعات لـ **قطاع التجزئة والمتاجر (B2C)**؟

يسعدني إرشادك لأفضل خيار أو يمكنك التواصل المباشر مع خبرائنا عبر الواتساب: **01505000349** (+20 150 500 0349).`;
}

// Gemini Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, sectorContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'مفتاح Gemini API غير مهيأ على الخادم. يرجى ضبط GEMINI_API_KEY في إعدادات البيئة.' 
      });
    }

    // Convert client messages to Gemini contents format
    // Map roles: 'user' -> 'user', 'assistant'/'model' -> 'model'
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    // Append context if sector is provided
    let instruction = SYSTEM_INSTRUCTION;
    if (sectorContext) {
      instruction += `\nسياق الصفحة الحالية للعميل: العميل يتصفح حالياً صفحة قطاع (${sectorContext}).`;
    }

    // Model calling with valid GenAI models
    let replyText = '';
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let lastError: any = null;

    const aiClient = getAiClient();
    if (!aiClient) {
      return res.status(500).json({ 
        error: 'مفتاح Gemini API غير مهيأ على الخادم. يرجى ضبط GEMINI_API_KEY في إعدادات البيئة.' 
      });
    }

    for (const modelName of modelsToTry) {
      try {
        const response = await aiClient.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: instruction,
          },
        });
        if (response.text) {
          replyText = response.text;
          break;
        }
      } catch (callErr: any) {
        lastError = callErr;
        console.warn(`Model ${modelName} returned error, trying fallback...`, callErr?.message || callErr);
      }
    }

    if (!replyText) {
      // Intelligently fallback to agency knowledge base during API spikes
      const lastUserMessage = messages[messages.length - 1]?.content || '';
      replyText = getIntelligentFallbackReply(lastUserMessage, sectorContext);
    }

    return res.json({ reply: replyText });
  } catch (err: any) {
    console.error('Gemini API Error in /api/chat:', err);
    const lastUserMessage = req.body?.messages?.[req.body.messages.length - 1]?.content || '';
    const fallbackReply = getIntelligentFallbackReply(lastUserMessage, req.body?.sectorContext);
    return res.json({ reply: fallbackReply });
  }
});

// Setup Vite dev server or serve production build
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Digital Effect Server is running on http://0.0.0.0:${port}`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
});
