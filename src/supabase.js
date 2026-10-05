// ==============================================================================
// Clash of Code - Supabase Database Initialization & Client Setup
// ==============================================================================
// This module initializes the singleton Supabase client using environment
// variables loaded via Vite (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).
//
// Features:
// 1. Clean, documented client initialization with optimized Realtime WebSocket settings.
// 2. Automated configuration detection (verifies if credentials are valid or placeholder).
// 3. Built-in latency probe and health-check diagnostics.
// 4. Safe offline fallback handling to prevent game crashes when credentials are unset.
// ==============================================================================

import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from environment (Vite exposes variables prefixed with VITE_)
function resolveSupabaseCredentials() {
  let url = '';
  let key = '';
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      url = import.meta.env.VITE_SUPABASE_URL || '';
      key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    } else if (typeof process !== 'undefined' && process.env) {
      url = process.env.VITE_SUPABASE_URL || '';
      key = process.env.VITE_SUPABASE_ANON_KEY || '';
    }
  } catch (_) {}

  url = (url || '').replace(/^["']|["']$/g, '').trim().replace(/\/+$/, '');
  key = (key || '').replace(/^["']|["']$/g, '').trim();

  // Also support in-app localStorage configuration
  if (typeof localStorage !== 'undefined') {
    const storedUrl = (localStorage.getItem('clashofcode_supabase_url') || '').trim();
    const storedKey = (localStorage.getItem('clashofcode_supabase_anon_key') || '').trim();
    if (storedUrl && storedKey && !storedUrl.includes('your-project-id')) {
      url = storedUrl;
      key = storedKey;
    }
  }

  return { url, key };
}

const { url: supabaseUrl, key: supabaseAnonKey } = resolveSupabaseCredentials();

/**
 * Checks whether valid Supabase credentials have been configured in the .env file.
 * Returns false if still using default placeholders or empty strings.
 * 
 * @returns {boolean} True if credentials appear valid and ready for live cloud connection.
 */
export function isSupabaseConfigured() {
  const { url, key } = resolveSupabaseCredentials();
  if (!url || !key) return false;
  if (url.includes('your-project-id') || key.includes('your-supabase-anon-key')) {
    return false;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.supabase.co');
  } catch {
    return false;
  }
}

/**
 * Supabase Client Instance Options:
 * - auth.persistSession: true (Persists user login session in localStorage across pages).
 * - auth.autoRefreshToken: true (Automatically refreshes JWT tokens).
 * - realtime.params.eventsPerSecond: 25 (Allows smooth, high-frequency game room updates).
 */
const clientOptions = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 25 // Optimized rate for tactical conquest updates
    }
  }
};

/**
 * The singleton Supabase client instance.
 * If credentials are missing, initializes with dummy values to allow module loading without crashing,
 * while downstream database handlers safely switch to local fallback mode.
 */
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-anon-key',
  clientOptions
);

/**
 * Performs a lightweight health check against the Supabase database.
 * Measures round-trip ping time and confirms connectivity to public tables.
 * 
 * @returns {Promise<{ ok: boolean, latencyMs: number, error?: string }>}
 */
export async function checkSupabaseHealth() {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      latencyMs: 0,
      error: 'Supabase credentials not configured in .env (Running in Local Fallback Mode)'
    };
  }

  const startTime = performance.now();
  try {
    // Perform a lightweight limit-1 probe on ranked_rooms
    const { error } = await supabase
      .from('ranked_rooms')
      .select('room_id')
      .limit(1);

    const latencyMs = Math.round(performance.now() - startTime);

    if (error) {
      return { ok: false, latencyMs, error: error.message };
    }

    return { ok: true, latencyMs };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - startTime);
    return { ok: false, latencyMs, error: err.message || 'Network connection failed' };
  }
}

// Log status on development initialization
if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
  if (isSupabaseConfigured()) {
    console.log(`[Clash of Code DB] Supabase initialized for endpoint: ${supabaseUrl}`);
  } else {
    console.info('[Clash of Code DB] Supabase credentials not set in .env -> Using Local Cross-Tab Simulator Mode.');
  }
}
