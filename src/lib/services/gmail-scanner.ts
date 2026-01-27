// lib/services/gmail-scanner.ts

import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { getOAuth2Client } from '@/lib/google-oauth';
import { differenceInDays } from 'date-fns';
import { BillingCycle } from '@prisma/client';

/* ----------------------------------
   CONFIG
----------------------------------- */

const SUBSCRIPTION_KEYWORDS = [
  'payment received',
  'payment confirmation',
  'subscription',
  'invoice',
  'receipt',
  'billing',
  'charged',
  'billed',
  'renewal',
];

const COMMON_SERVICES = [
  { name: 'Netflix', domains: ['netflix.com'], category: 'Entertainment' },
  { name: 'Spotify', domains: ['spotify.com'], category: 'Entertainment' },
  { name: 'YouTube Premium', domains: ['youtube.com', 'google.com'], category: 'Entertainment' },
  { name: 'Disney+', domains: ['disneyplus.com', 'disney.com'], category: 'Entertainment' },
  { name: 'Adobe Creative Cloud', domains: ['adobe.com'], category: 'Productivity' },
  { name: 'Microsoft 365', domains: ['microsoft.com'], category: 'Productivity' },
  { name: 'Notion', domains: ['notion.so', 'notion.com'], category: 'Productivity' },
  { name: 'Slack', domains: ['slack.com'], category: 'Productivity' },
  { name: 'GitHub', domains: ['github.com'], category: 'Development' },
  { name: 'AWS', domains: ['amazonaws.com', 'aws.amazon.com'], category: 'Infrastructure' },
  { name: 'Vercel', domains: ['vercel.com'], category: 'Development' },
  { name: 'Claude', domains: ['anthropic.com', 'claude.ai'], category: 'AI Tools' },
  { name: 'ChatGPT Plus', domains: ['openai.com'], category: 'AI Tools' },
  { name: 'Figma', domains: ['figma.com'], category: 'Design' },
  { name: 'Canva', domains: ['canva.com'], category: 'Design' },
  { name: 'Dropbox', domains: ['dropbox.com'], category: 'Storage' },
  { name: 'Google One', domains: ['google.com'], category: 'Storage' },
  { name: 'LinkedIn Premium', domains: ['linkedin.com'], category: 'Professional' },
  { name: 'Zoom', domains: ['zoom.us'], category: 'Communication' },
  { name: 'TURBOLEARN LLC', domains: ['turbo.ai'], category:'AI Tools'},
  { name: 'Poe', domains: ['poe.com'], category: 'AI Tools' }
];

/* ----------------------------------
   MAIN FUNCTION
----------------------------------- */

export async function scanGmailForSubscriptions(workspaceId: string) {
  // Get integration for this workspace
  const integration = await prisma.integration.findUnique({
    where: {
      workspaceId_type: { workspaceId, type: 'GMAIL' },
    },
  });

  if (!integration || integration.status !== 'CONNECTED') {
    throw new Error('Gmail not connected');
  }

  // Setup OAuth client
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken || undefined,
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Build search query
  const keywordQuery = SUBSCRIPTION_KEYWORDS.map((k) => `"${k}"`).join(' OR ');
  const query = `(category:purchases OR ${keywordQuery}) (invoice OR receipt OR billing OR payment) -subject:welcome -subject:trial -after:${getDateString(180)}`;

  // Fetch messages
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults: 50,
  });

  const messages = res.data.messages || [];
  const detected: any[] = [];

  // Process each message
  for (const msg of messages.slice(0, 30)) {
    try {
      const details = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full',
      });

      const parsed = parseEmail(details.data);
      if (!parsed) continue;

      const { from, subject, body, date } = parsed;

      // Detect service
      const service = detectService(from);
      if (!service) continue;

      // Extract amount
      const amountData = extractAmount(body, subject);
      if (!amountData) continue;

      // Calculate confidence
      const confidence = computeConfidence({
        serviceDetected: true,
        amountDetected: true,
        subject,
        body,
      });

      if (confidence < 70) continue;

      // Convert to MYR if needed
      const amountMYR = convertToMYR(amountData);

      detected.push({
        displayName: service.name,
        amount: amountMYR,
        currency: 'MYR',
        category: service.category,
        confidence,
        lastDetectedAt: new Date(date),
        sourceEmail: from,
        billingCycle: 'MONTHLY' as BillingCycle,
      });
    } catch (err) {
      console.error(`Error processing message ${msg.id}:`, err);
    }
  }

  // Save to database
  const saved = await saveSubscriptions(workspaceId, detected);

  // Update last sync time
  await prisma.integration.update({
    where: { id: integration.id },
    data: {
      lastSyncAt: new Date(),
      nextSyncAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  return {
    scanned: messages.length,
    detected: detected.length,
    saved,
  };
}

/* ----------------------------------
   HELPERS
----------------------------------- */

function parseEmail(message: any) {
  const headers = message.payload?.headers || [];

  const getHeader = (name: string) =>
    headers.find((h: any) => h.name?.toLowerCase() === name)?.value || '';

  const rawBody = getEmailBody(message.payload);
  if (!rawBody) return null;

  // Simple HTML stripping
  const cleanBody = rawBody
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    from: getHeader('from').toLowerCase(),
    subject: getHeader('subject'),
    date: getHeader('date'),
    body: cleanBody,
  };
}

function detectService(from: string) {
  // 1. Try your manual list first
  for (const service of COMMON_SERVICES) {
    if (service.domains?.some((d) => from.includes(d))) {
      return service;
    }
  }

  // 2. Fallback: If not in list, extract the domain (e.g., "support@framer.com" -> "Framer")
  try {
    const emailMatch = from.match(/<(.+?)>|(\S+@\S+)/);
    const email = emailMatch ? (emailMatch[1] || emailMatch[2]) : from;
    const domain = email.split('@')[1]; 
    
    if (domain) {
      const parts = domain.split('.');
      // Gets "framer" from "framer.com" or "zoom" from "zoom.us"
      const mainName = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
      
      // Clean up common subdomains
      const cleanName = mainName.replace(/^(mail|billing|no-reply|notifications)\./, '');
      
      return {
        name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
        category: 'Software', // Default category
      };
    }
  } catch (e) {
    return null;
  }
  return null;
}

function extractAmount(text: string, subject: string) {
  const full = `${text} ${subject}`.toLowerCase();
  
  // 1. Regex to find any currency symbol + numbers (e.g., $9.99, RM50, 20.00 USD)
  // This covers the most common formats globally
  const pricePattern = /(?:rm|myr|\$|usd|€|£)\s?(\d+(?:\.\d{2})?)/gi;
  
  const matches = [...full.matchAll(pricePattern)];
  if (matches.length === 0) return null;

  // 2. Convert matches to numbers and filter for realistic SaaS prices
  const amounts = matches
    .map(m => parseFloat(m[1]))
    .filter(a => a >= 1 && a <= 5000); // Filter out tiny numbers or huge order IDs
  
  if (amounts.length === 0) return null;

  // 3. Logic: The largest number in a receipt is usually the Total
  const maxAmount = Math.max(...amounts);

  // 4. Determine Currency
  const currencyMatch = full.match(/(\$|usd|rm|myr|€|£)/i);
  const currency = currencyMatch?.[1]?.toUpperCase() || 'MYR';

  return {
    amount: maxAmount,
    currency: currency === '$' ? 'USD' : currency,
  };
}

function convertToMYR(data: { amount: number; currency: string }) {
  if (data.currency === 'USD' || data.currency === '$') {
    return Math.round(data.amount * 4.5 * 100) / 100;
  }
  return data.amount;
}

function computeConfidence({
  serviceDetected,
  amountDetected,
  subject,
  body,
}: {
  serviceDetected: boolean;
  amountDetected: boolean;
  subject: string;
  body: string;
}) {
  let score = 0;

  if (serviceDetected) score += 40;
  if (amountDetected) score += 25;

  const subjectLower = subject.toLowerCase();
  if (SUBSCRIPTION_KEYWORDS.some((k) => subjectLower.includes(k))) {
    score += 15;
  }

  if (/monthly|every month|renewal|recurring/i.test(body)) {
    score += 10;
  }

  if (/invoice\s?#?\d+|receipt\s?#?\w+|order\s?#?\w+/i.test(body)) {
    score += 10;
  }

  return Math.min(score, 100);
}

async function saveSubscriptions(workspaceId: string, subs: any[]) {
  let saved = 0;

  for (const sub of subs) {
    // Check for existing to detect billing cycle
    const existing = await prisma.subscription.findMany({
      where: {
        workspaceId,
        displayName: sub.displayName,
      },
      orderBy: { lastDetectedAt: 'desc' },
      take: 2,
    });

    // Determine billing cycle
    let billingCycle: BillingCycle = 'MONTHLY';
    if (existing.length > 0) {
      const diff = differenceInDays(sub.lastDetectedAt, existing[0].lastDetectedAt);
      if (diff >= 25 && diff <= 35) {
        billingCycle = 'MONTHLY';
      } else if (diff >= 350 && diff <= 380) {
        billingCycle = 'YEARLY';
      }
    }

    // Inside saveSubscriptions loop
   await prisma.subscription.upsert({
  where: {
    workspaceId_displayName: {
      workspaceId: workspaceId, // Ensure this is the variable passed to the function
      displayName: sub.displayName,
    },
  },
  create: {
    displayName: sub.displayName,
    amount: sub.amount,
    currency: sub.currency,
    category: sub.category,
    confidence: sub.confidence,
    lastDetectedAt: sub.lastDetectedAt,
    sourceEmail: sub.sourceEmail,
    billingCycle: sub.billingCycle,
    status: 'PENDING',
    isConfirmed: false,
    // Fix: Use the workspaceId explicitly here
    workspaceId: workspaceId, 
  },
  update: {
    amount: sub.amount,
    lastDetectedAt: sub.lastDetectedAt,
    confidence: sub.confidence,
    // Note: I removed the status: { set: 'PENDING' } so you don't 
    // overwrite confirmed subs, as we discussed!
  },
});

    saved++;
  }

  return saved;
}

function getEmailBody(payload: any): string {
  let body = '';

  const walk = (part: any) => {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      body += Buffer.from(part.body.data, 'base64').toString('utf-8');
    }
    if (part.mimeType === 'text/html' && part.body?.data) {
      body += Buffer.from(part.body.data, 'base64').toString('utf-8');
    }
    if (part.parts) part.parts.forEach(walk);
  };

  walk(payload);
  return body;
}

function getDateString(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}