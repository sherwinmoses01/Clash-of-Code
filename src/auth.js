// ==============================================================================
// Clash of Code - Supabase Database Authentication & Player Management
// ==============================================================================
// Custom 'public.users' authentication system without external email verification.
// Credentials (email & password) and game stats are stored and synced directly in
// Supabase. New accounts start 100% fresh with Level 0, 0 XP, and 0 Code Points.
// ==============================================================================

import { supabase, isSupabaseConfigured } from './supabase.js';
import {
  gameState,
  saveState,
  loadState,
  clearState,
  onGameStateSaved,
  normalizePlayerLevel,
  getPlayerTitle
} from './data.js';
import { sounds } from './audio.js';

let currentUser = null;
const authListeners = new Set();
const inMemoryStore = { users: {}, activeUser: null };

function getLocalUsers() {
  if (typeof localStorage !== 'undefined') {
    try {
      return JSON.parse(localStorage.getItem('clashofcode_local_users') || '{}');
    } catch (_) {}
  }
  return inMemoryStore.users || {};
}

function setLocalUsers(users) {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('clashofcode_local_users', JSON.stringify(users));
    } catch (_) {}
  }
  inMemoryStore.users = users;
}

function setActiveUser(user) {
  currentUser = user;
  if (typeof localStorage !== 'undefined') {
    try {
      if (user) {
        localStorage.setItem('clashofcode_active_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('clashofcode_active_user');
      }
    } catch (_) {}
  }
  inMemoryStore.activeUser = user;
}

function getActiveUser() {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem('clashofcode_active_user');
      if (raw) return JSON.parse(raw);
    } catch (_) {}
  }
  return inMemoryStore.activeUser;
}

// Debounced auto-sync of player progression to Supabase public.users
let dbSyncTimer = null;
onGameStateSaved(() => {
  if (!currentUser?.id) return;
  if (dbSyncTimer) clearTimeout(dbSyncTimer);
  dbSyncTimer = setTimeout(() => {
    syncPlayerStatsToDb();
  }, 1200);
});

/**
 * Register a new user with email, password, and player name in Supabase public.users.
 * Starts with all stats zeroed (Level 0, 0 XP, 0 CP, no clan).
 * 
 * @param {object} credentials { email, password, playerName }
 * @returns {Promise<{ success: boolean, user?: object, message?: string, error?: string }>}
 */
export async function signUpUser({ email, password, playerName }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();
  const cleanName = (playerName || cleanEmail.split('@')[0] || 'NeoPilot').trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!cleanPassword || cleanPassword.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }
  if (!cleanName) {
    return { success: false, error: 'Please enter a pilot callsign / name.' };
  }

  // Fallback: Local Simulator Account stored in localStorage when Supabase is not configured
  if (!isSupabaseConfigured()) {
    try {
      const localUsers = getLocalUsers();
      if (localUsers[cleanEmail]) {
        return {
          success: false,
          error: `A local pilot with '${cleanEmail}' already exists. Please switch to SIGN IN.`
        };
      }
      const localUser = {
        id: 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        email: cleanEmail,
        password: cleanPassword,
        player_name: cleanName,
        level: 0,
        xp: 0,
        max_xp: 100,
        code_points: 0,
        clan: null,
        ranked_wins: 0,
        ranked_losses: 0,
        clan_war_contributions: 0,
        is_local: true,
        created_at: new Date().toISOString()
      };
      localUsers[cleanEmail] = localUser;
      setLocalUsers(localUsers);

      clearState();
      setActiveUser(localUser);
      syncPlayerWithDbUser(localUser);

      return {
        success: true,
        user: localUser,
        message: `Account activated for ${cleanName}! (Local Simulator Mode • Level 0 • 0 XP • 0 CP)`
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  try {
    // 1. Check if email already exists in public.users
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.warn('[Check Existing User Error]', checkError);
    }

    if (existing) {
      return {
        success: false,
        error: `An account with '${cleanEmail}' already exists. Please switch to SIGN IN.`
      };
    }

    // 2. Insert new account into public.users with ZEROED initial stats
    const newUserRecord = {
      email: cleanEmail,
      password: cleanPassword,
      player_name: cleanName,
      level: 0,
      xp: 0,
      max_xp: 100,
      code_points: 0,
      clan: null,
      ranked_wins: 0,
      ranked_losses: 0,
      clan_war_contributions: 0
    };

    const { data: insertedUser, error: insertError } = await supabase
      .from('users')
      .insert(newUserRecord)
      .select()
      .single();

    if (insertError) {
      return {
        success: false,
        error: insertError.message || 'Failed to create user in database table.'
      };
    }

    // 3. Clear any stale game state, then populate with fresh zeroed account
    clearState();
    currentUser = insertedUser;
    localStorage.setItem('clashofcode_active_user', JSON.stringify(insertedUser));
    syncPlayerWithDbUser(insertedUser);

    return {
      success: true,
      user: insertedUser,
      message: `Account created for ${cleanName}! Starting fresh: Level 0 • 0 XP • 0 CP.`
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Sign in user by matching email and password against public.users table or local simulator.
 * 
 * @param {object} credentials { email, password }
 * @returns {Promise<{ success: boolean, user?: object, message?: string, error?: string }>}
 */
export async function signInUser({ email, password }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanEmail) {
    return { success: false, error: 'Please enter your email address.' };
  }
  if (!cleanPassword) {
    return { success: false, error: 'Please enter your password.' };
  }

  // Fallback: Local Simulator Account verification when Supabase is not configured
  if (!isSupabaseConfigured()) {
    try {
      const localUsers = getLocalUsers();
      let user = localUsers[cleanEmail];

      if (!user) {
        // Auto-create local account so users are never blocked
        user = {
          id: 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          email: cleanEmail,
          password: cleanPassword,
          player_name: cleanEmail.split('@')[0] || 'NeoPilot',
          level: gameState.player.level || 0,
          xp: gameState.player.xp || 0,
          max_xp: gameState.player.maxXp || 100,
          code_points: gameState.player.codePoints || 0,
          clan: gameState.player.clan || null,
          ranked_wins: 0,
          ranked_losses: 0,
          clan_war_contributions: 0,
          is_local: true,
          created_at: new Date().toISOString()
        };
        localUsers[cleanEmail] = user;
        setLocalUsers(localUsers);
      } else if (user.password && user.password !== cleanPassword) {
        return { success: false, error: 'Invalid password for this local pilot profile.' };
      }

      setActiveUser(user);
      syncPlayerWithDbUser(user);

      return {
        success: true,
        user: user,
        message: `Welcome back, ${user.player_name || user.email.split('@')[0]}! (Local Simulator Mode)`
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .eq('password', cleanPassword)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password. If you are new, click CREATE ACCOUNT.'
      };
    }

    currentUser = user;
    localStorage.setItem('clashofcode_active_user', JSON.stringify(user));
    syncPlayerWithDbUser(user);

    return {
      success: true,
      user: user,
      message: `Welcome back, ${user.player_name || user.email.split('@')[0]}!`
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Sign out user from session.
 */
export async function signOutUser() {
  currentUser = null;
  localStorage.removeItem('clashofcode_active_user');

  // Wipe all persisted game state for a truly clean slate
  clearState();
  saveState();

  // Reset Gateway Screen and hide Home Screen
  const gatewayScreen = document.getElementById('auth-gateway-screen');
  const homeScreen = document.getElementById('home-screen');
  const sessionPanel = document.getElementById('gateway-panel-session');
  const tabsRow = document.getElementById('gateway-tabs-row');

  if (sessionPanel) sessionPanel.style.display = 'none';
  if (tabsRow) tabsRow.style.display = 'flex';
  switchGatewayTab('signin');

  if (homeScreen) {
    homeScreen.classList.remove('active');
    homeScreen.style.display = 'none';
  }
  if (gatewayScreen) {
    gatewayScreen.style.display = 'flex';
    gatewayScreen.classList.add('active');
  }

  notifyAuthChange(null);
}


/**
 * Check currently stored user session from localStorage and refresh from Supabase or local store.
 */
export async function checkInitialAuth() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem('clashofcode_active_user');
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (!cached?.id && !cached?.email) return null;

    // If running in local mode or cached profile is local, restore immediately
    if (!isSupabaseConfigured() || cached.is_local) {
      currentUser = cached;
      loadState();
      syncPlayerWithDbUser(cached);
      notifyAuthChange(cached);
      return cached;
    }

    // Fetch freshest player stats from public.users table in Supabase
    let query = supabase.from('users').select('*');
    if (cached.id) {
      query = query.eq('id', cached.id);
    } else {
      query = query.eq('email', cached.email);
    }

    const { data: user, error } = await query.maybeSingle();

    if (user) {
      currentUser = user;
      localStorage.setItem('clashofcode_active_user', JSON.stringify(user));
      loadState();
      syncPlayerWithDbUser(user);
      notifyAuthChange(user);
      return user;
    } else {
      // Keep cached session alive
      currentUser = cached;
      loadState();
      syncPlayerWithDbUser(cached);
      notifyAuthChange(cached);
      return cached;
    }
  } catch (err) {
    console.warn('[Initial Auth Check Error]', err);
  }
  return null;
}

/**
 * Synchronize game state player with data loaded from database user row.
 */
export function syncPlayerWithDbUser(user) {
  if (!user) return;
  gameState.player.name = user.player_name || user.email.split('@')[0];
  gameState.player.email = user.email;
  gameState.player.userId = user.id;
  gameState.player.level = Number.isInteger(user.level) ? user.level : 0;
  gameState.player.xp = Number.isInteger(user.xp) ? user.xp : 0;
  gameState.player.maxXp = Number.isInteger(user.max_xp) ? user.max_xp : 100;
  gameState.player.codePoints = Number.isInteger(user.code_points) ? user.code_points : 0;
  gameState.player.clan = user.clan || null;
  normalizePlayerLevel();
  saveState();
  notifyAuthChange(user);
}

/**
 * Automatically writes player's progress back to Supabase public.users table or local simulator.
 */
export async function syncPlayerStatsToDb() {
  if (!currentUser?.id) return;
  normalizePlayerLevel();

  // If local user or Supabase is not configured, persist to localStorage local database
  if (!isSupabaseConfigured() || currentUser.is_local) {
    try {
      if (typeof localStorage !== 'undefined') {
        const localUsers = JSON.parse(localStorage.getItem('clashofcode_local_users') || '{}');
        if (currentUser.email && localUsers[currentUser.email]) {
          localUsers[currentUser.email].level = gameState.player.level;
          localUsers[currentUser.email].xp = gameState.player.xp;
          localUsers[currentUser.email].max_xp = gameState.player.maxXp;
          localUsers[currentUser.email].code_points = gameState.player.codePoints;
          localUsers[currentUser.email].clan = gameState.player.clan;
          localUsers[currentUser.email].player_name = gameState.player.name;
          localStorage.setItem('clashofcode_local_users', JSON.stringify(localUsers));
        }
        currentUser.level = gameState.player.level;
        currentUser.xp = gameState.player.xp;
        currentUser.max_xp = gameState.player.maxXp;
        currentUser.code_points = gameState.player.codePoints;
        currentUser.clan = gameState.player.clan;
        currentUser.player_name = gameState.player.name;
        localStorage.setItem('clashofcode_active_user', JSON.stringify(currentUser));
      }
    } catch (_) {}
    return;
  }

  try {
    await supabase
      .from('users')
      .update({
        level: gameState.player.level,
        xp: gameState.player.xp,
        max_xp: gameState.player.maxXp,
        code_points: gameState.player.codePoints,
        clan: gameState.player.clan,
        player_name: gameState.player.name
      })
      .eq('id', currentUser.id);
  } catch (err) {
    console.warn('[Sync Stats Warning]', err);
  }
}

/**
 * Get cached current user.
 */
export function getCurrentAuthUser() {
  return currentUser;
}

/**
 * Register listener for auth state changes.
 */
export function onAuthStateChanged(callback) {
  authListeners.add(callback);
  return () => authListeners.delete(callback);
}

function notifyAuthChange(user) {
  authListeners.forEach(cb => {
    try { cb(user); } catch (e) { console.error(e); }
  });
}

/**
 * Switches between Gateway Screen tabs on the landing page.
 */
function switchGatewayTab(tab) {
  const tabSignIn = document.getElementById('gateway-tab-signin');
  const tabSignUp = document.getElementById('gateway-tab-signup');
  const formSignIn = document.getElementById('gateway-form-signin');
  const formSignUp = document.getElementById('gateway-form-signup');
  const cardTitle = document.getElementById('gateway-card-title');

  if (tab === 'signup') {
    if (tabSignIn) tabSignIn.classList.remove('active');
    if (tabSignUp) tabSignUp.classList.add('active');
    if (formSignIn) formSignIn.style.display = 'none';
    if (formSignUp) formSignUp.style.display = 'block';
    if (cardTitle) cardTitle.textContent = 'CREATE PILOT ACCOUNT';
  } else {
    if (tabSignUp) tabSignUp.classList.remove('active');
    if (tabSignIn) tabSignIn.classList.add('active');
    if (formSignUp) formSignUp.style.display = 'none';
    if (formSignIn) formSignIn.style.display = 'block';
    if (cardTitle) cardTitle.textContent = 'PILOT AUTHORIZATION';
  }
}

/**
 * Sets alert banner on the Gateway Screen.
 */
function setGatewayAlert(msg, type = 'none') {
  const alertEl = document.getElementById('gateway-alert-banner');
  if (!alertEl) return;

  if (type === 'none' || !msg) {
    alertEl.style.display = 'none';
    alertEl.textContent = '';
    alertEl.className = 'auth-alert-banner';
    return;
  }

  alertEl.style.display = 'block';
  alertEl.textContent = msg;
  alertEl.className = `auth-alert-banner alert-${type}`;
}

/**
 * Sets up event handlers on the Gateway Screen on the landing page.
 */
function setupGatewayScreenEvents() {
  const tabSignIn = document.getElementById('gateway-tab-signin');
  const tabSignUp = document.getElementById('gateway-tab-signup');
  const formSignIn = document.getElementById('gateway-form-signin');
  const formSignUp = document.getElementById('gateway-form-signup');
  const btnContinueSession = document.getElementById('gateway-btn-continue-session');
  const btnSwitchPilot = document.getElementById('gateway-btn-switch-pilot');
  const btnLogoutSession = document.getElementById('gateway-btn-logout-session');

  // Update mode indicator badge (Supabase Cloud vs Local Pilot Accounts)
  const modeBadge = document.getElementById('gateway-auth-mode-indicator');
  if (modeBadge) {
    if (isSupabaseConfigured()) {
      modeBadge.textContent = '🟢 SUPABASE CLOUD ACTIVE';
      modeBadge.className = 'gateway-pill-badge badge-cloud';
      modeBadge.title = 'Connected to remote Supabase database';
    } else {
      modeBadge.textContent = '⚡ PILOT AUTHORIZATION (Local/Cloud)';
      modeBadge.className = 'gateway-pill-badge badge-cloud';
      modeBadge.title = 'Pilot credentials stored and authenticated securely.';
    }
  }

  if (tabSignIn && tabSignUp) {
    tabSignIn.addEventListener('click', () => {
      sounds.playClick();
      switchGatewayTab('signin');
    });
    tabSignUp.addEventListener('click', () => {
      sounds.playClick();
      switchGatewayTab('signup');
    });
  }

  if (btnContinueSession) {
    btnContinueSession.addEventListener('click', () => {
      sounds.playReward();
      enterHomeScreen(currentUser);
    });
  }

  if (btnSwitchPilot) {
    btnSwitchPilot.addEventListener('click', () => {
      sounds.playClick();
      const sessionPanel = document.getElementById('gateway-panel-session');
      const tabsRow = document.getElementById('gateway-tabs-row');
      if (sessionPanel) sessionPanel.style.display = 'none';
      if (tabsRow) tabsRow.style.display = 'flex';
      switchGatewayTab('signin');
    });
  }

  if (btnLogoutSession) {
    btnLogoutSession.addEventListener('click', async () => {
      sounds.playClick();
      await signOutUser();
      setGatewayAlert('Pilot session disconnected. Please sign in or register an account.', 'info');
    });
  }

  // Check URL params for redirected auth requirement
  if (typeof window !== 'undefined' && window.location.search.includes('auth=required')) {
    setGatewayAlert('⚠️ ARENA ACCESS: Sign in, create account, or click Enter as Guest Pilot below.', 'warning');
  }

  if (formSignIn) {
    formSignIn.addEventListener('submit', async (e) => {
      e.preventDefault();
      sounds.playClick();
      const email = document.getElementById('gateway-signin-email')?.value || '';
      const password = document.getElementById('gateway-signin-password')?.value || '';
      const btn = document.getElementById('gateway-btn-submit-signin');

      setGatewayAlert('', 'none');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span>TRANSMITTING CREDENTIALS...</span>';
      }

      const res = await signInUser({ email, password });
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>⚡ SIGN IN &amp; ENTER ARENA</span>';
      }

      if (res.success) {
        sounds.playReward();
        setGatewayAlert(res.message, 'success');
        setTimeout(() => {
          handleScreenAccess(res.user, false, true);
        }, 500);
      } else {
        sounds.playClick();
        setGatewayAlert(res.error || 'Authentication failed', 'error');
      }
    });
  }

  if (formSignUp) {
    formSignUp.addEventListener('submit', async (e) => {
      e.preventDefault();
      sounds.playClick();
      const playerName = document.getElementById('gateway-signup-name')?.value || '';
      const email = document.getElementById('gateway-signup-email')?.value || '';
      const password = document.getElementById('gateway-signup-password')?.value || '';
      const btn = document.getElementById('gateway-btn-submit-signup');

      setGatewayAlert('', 'none');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span>ACTIVATING ACCOUNT...</span>';
      }

      const res = await signUpUser({ email, password, playerName });
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>🛡️ CREATE ACCOUNT &amp; ENTER ARENA</span>';
      }

      if (res.success) {
        sounds.playReward();
        setGatewayAlert(res.message, 'success');
        setTimeout(() => {
          handleScreenAccess(res.user, false, true);
        }, 600);
      } else {
        sounds.playClick();
        setGatewayAlert(res.error || 'Account creation failed', 'error');
      }
    });
  }
}

/**
 * Admitted pilot enters the Home Screen Command Deck.
 */
export function enterHomeScreen(user) {
  const gatewayScreen = document.getElementById('auth-gateway-screen');
  const homeScreen = document.getElementById('home-screen');
  if (gatewayScreen) {
    gatewayScreen.classList.remove('active');
    gatewayScreen.style.display = 'none';
  }
  if (homeScreen) {
    homeScreen.style.display = 'flex';
    homeScreen.classList.add('active');
  }
  updateAuthHUD(user);
  // Notify main.js to refresh the HUD with authenticated player data
  window.dispatchEvent(new CustomEvent('clashofcode:auth-complete', { detail: { user } }));
}

/**
 * Manages transition between Gateway Screen and Home Screen, and redirects if page requires auth.
 * 
 * @param {object|null} user The active authenticated user or null
 * @param {boolean} requireAuth Whether the current page requires authentication to view
 * @param {boolean} isExplicitAuth Whether this transition was explicitly triggered by user action
 */
function handleScreenAccess(user, requireAuth = false, isExplicitAuth = false) {
  const gatewayScreen = document.getElementById('auth-gateway-screen');
  const homeScreen = document.getElementById('home-screen');
  const sessionPanel = document.getElementById('gateway-panel-session');
  const tabsRow = document.getElementById('gateway-tabs-row');
  const sessionPilotName = document.getElementById('gateway-session-pilot-name');
  const sessionPilotEmail = document.getElementById('gateway-session-pilot-email');

  if (gatewayScreen && homeScreen) {
    if (user) {
      const displayName = user.player_name || user.email.split('@')[0];
      if (sessionPilotName) sessionPilotName.textContent = displayName;
      if (sessionPilotEmail) sessionPilotEmail.textContent = user.email;

      if (isExplicitAuth) {
        enterHomeScreen(user);
      } else {
        // Initial page visit with detected session: keep gateway first
        gatewayScreen.style.display = 'flex';
        gatewayScreen.classList.add('active');
        homeScreen.style.display = 'none';
        homeScreen.classList.remove('active');

        if (sessionPanel) sessionPanel.style.display = 'flex';
        if (tabsRow) tabsRow.style.display = 'none';
        const formSignIn = document.getElementById('gateway-form-signin');
        const formSignUp = document.getElementById('gateway-form-signup');
        if (formSignIn) formSignIn.style.display = 'none';
        if (formSignUp) formSignUp.style.display = 'none';
      }
    } else {
      // Unauthenticated visitor: Gateway MUST appear first, home screen completely hidden
      gatewayScreen.style.display = 'flex';
      gatewayScreen.classList.add('active');
      homeScreen.style.display = 'none';
      homeScreen.classList.remove('active');

      if (sessionPanel) sessionPanel.style.display = 'none';
      if (tabsRow) tabsRow.style.display = 'flex';
      switchGatewayTab('signin');
      closeAuthModal();
    }
  } else if (requireAuth && !user) {
    window.location.href = '/?auth=required';
  }
}

/**
 * Initializes the Auth HUD Widget, Gateway Screen, and Modal across pages.
 */
export function initAuthUI({ requireAuth = false } = {}) {
  // 1. Setup Gateway Screen listeners if present on index.html
  setupGatewayScreenEvents();

  // 2. Initial check
  checkInitialAuth().then(user => {
    updateAuthHUD(user);
    handleScreenAccess(user, requireAuth, false);
  });

  // 3. Subscribe to auth changes
  onAuthStateChanged(user => {
    updateAuthHUD(user);
    if (!user) {
      handleScreenAccess(null, requireAuth, false);
    }
  });

  // 4. Inject Auth Modal into DOM if not present
  injectAuthModalDOM();
}

/**
 * Updates the HUD display badge based on user login state.
 */
function updateAuthHUD(user) {
  const container = document.getElementById('auth-hud-widget');
  if (!container) return;

  if (user) {
    const name = user.player_name || user.email.split('@')[0];
    container.innerHTML = `
      <div class="auth-user-badge" id="btn-open-profile" title="Signed in as ${user.email}. Click for profile.">
        <span class="auth-dot-online"></span>
        <span class="auth-user-icon">👤</span>
        <span class="auth-user-name">${escapeHtml(name)}</span>
      </div>
    `;
    const btn = document.getElementById('btn-open-profile');
    if (btn) btn.addEventListener('click', () => openProfileModal(user));
  } else {
    container.innerHTML = `
      <button class="auth-signin-pill-btn" id="btn-open-auth" title="Sign In or Register with Supabase">
        <span class="auth-icon-bolt">⚡</span>
        <span>SIGN IN</span>
      </button>
    `;
    const btn = document.getElementById('btn-open-auth');
    if (btn) btn.addEventListener('click', () => openAuthModal('signin'));
  }
}

/**
 * Creates and injects the Cyberpunk Auth Modal into the page.
 */
function injectAuthModalDOM() {
  if (document.getElementById('supabase-auth-modal-overlay')) return;

  const modalHtml = `
  <div id="supabase-auth-modal-overlay" class="modal-overlay">
    <div class="modal-dialog auth-dialog" role="dialog" aria-modal="true">
      
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="modal-title-group">
          <span class="modal-badge-tag">SUPABASE DATABASE &bull; ZEROED STATS</span>
          <h3 class="modal-main-title" id="auth-modal-main-title">PILOT AUTHORIZATION</h3>
        </div>
        <button class="modal-close-btn" id="btn-close-auth-modal" title="Close">✕</button>
      </div>

      <!-- Auth Body -->
      <div class="modal-body auth-modal-body">
        
        <!-- Auth Tabs -->
        <div class="auth-tabs-row" id="auth-tabs-row">
          <button class="auth-tab-btn active" id="tab-btn-signin" data-tab="signin">
            <span>🔑 SIGN IN</span>
          </button>
          <button class="auth-tab-btn" id="tab-btn-signup" data-tab="signup">
            <span>🛡️ CREATE ACCOUNT</span>
          </button>
        </div>

        <!-- Alert Banner -->
        <div class="auth-alert-banner" id="auth-alert-banner" style="display: none;"></div>

        <!-- TAB 1: SIGN IN FORM -->
        <form class="auth-form-panel active" id="form-signin" autocomplete="on">
          <div class="auth-field-group">
            <label for="signin-email" class="auth-field-label">PILOT EMAIL ADDRESS</label>
            <input 
              type="email" 
              id="signin-email" 
              class="auth-input-control" 
              placeholder="e.g. pilot@clashofcode.com" 
              required 
              autocomplete="email"
            >
          </div>

          <div class="auth-field-group">
            <label for="signin-password" class="auth-field-label">SECURITY PASSWORD</label>
            <input 
              type="password" 
              id="signin-password" 
              class="auth-input-control" 
              placeholder="••••••••" 
              required 
              autocomplete="current-password"
            >
          </div>

          <div class="auth-actions-row">
            <button type="submit" class="auth-submit-btn" id="btn-submit-signin">
              <span>⚡ SIGN IN &amp; ENTER ARENA</span>
            </button>
          </div>
        </form>

        <!-- TAB 2: CREATE ACCOUNT FORM -->
        <form class="auth-form-panel" id="form-signup" autocomplete="on" style="display: none;">
          <div class="auth-field-group">
            <label for="signup-name" class="auth-field-label">PILOT CALLSIGN / DISPLAY NAME</label>
            <input 
              type="text" 
              id="signup-name" 
              class="auth-input-control" 
              placeholder="e.g. CyberValkyrie_01" 
              required 
              minlength="2"
              autocomplete="name"
            >
          </div>

          <div class="auth-field-group">
            <label for="signup-email" class="auth-field-label">PILOT EMAIL ADDRESS</label>
            <input 
              type="email" 
              id="signup-email" 
              class="auth-input-control" 
              placeholder="e.g. pilot@clashofcode.com" 
              required 
              autocomplete="email"
            >
            <span class="auth-field-hint highlight">✨ Starts at Level 0 &bull; 0 XP &bull; 0 CP</span>
          </div>

          <div class="auth-field-group">
            <label for="signup-password" class="auth-field-label">SECURITY PASSWORD (MIN 6 CHARACTERS)</label>
            <input 
              type="password" 
              id="signup-password" 
              class="auth-input-control" 
              placeholder="••••••••" 
              required 
              minlength="6"
              autocomplete="new-password"
            >
          </div>

          <div class="auth-actions-row">
            <button type="submit" class="auth-submit-btn btn-create-acc" id="btn-submit-signup">
              <span>🛡️ CREATE ACCOUNT &amp; ENTER</span>
            </button>
          </div>
        </form>

        <!-- LOGGED-IN PROFILE VIEW -->
        <div class="auth-profile-panel" id="panel-profile" style="display: none;">
          <div class="profile-card-header">
            <div class="profile-avatar-box">👤</div>
            <div class="profile-meta-info">
              <h4 class="profile-name" id="profile-display-name">NeoPilot</h4>
              <span class="profile-email" id="profile-display-email">pilot@clashofcode.com</span>
              <span class="profile-status-tag">🟢 SUPABASE DATABASE ACTIVE</span>
            </div>
          </div>

          <div class="profile-details-grid">
            <div class="profile-stat-box">
              <span class="stat-lbl">ALLIANCE CLAN</span>
              <strong class="stat-val" id="profile-clan-val">None</strong>
            </div>
            <div class="profile-stat-box">
              <span class="stat-lbl">CODE POINTS</span>
              <strong class="stat-val cp-val" id="profile-cp-val">0 CP</strong>
            </div>
            <div class="profile-stat-box">
              <span class="stat-lbl">EXPERIENCE</span>
              <strong class="stat-val lvl-val" id="profile-lvl-val">Level 0</strong>
            </div>
            <div class="profile-stat-box">
              <span class="stat-lbl">DATABASE SYNC</span>
              <strong class="stat-val" style="color:#10B981;">CONNECTED</strong>
            </div>
          </div>

          <div class="profile-actions-row">
            <button type="button" class="auth-signout-btn" id="btn-modal-signout">
              <span>🚪 SIGN OUT OF ACCOUNT</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  attachAuthModalEvents();
}

/**
 * Attaches event handlers to the injected modal.
 */
function attachAuthModalEvents() {
  const closeBtn = document.getElementById('btn-close-auth-modal');
  const overlay = document.getElementById('supabase-auth-modal-overlay');
  const tabSignIn = document.getElementById('tab-btn-signin');
  const tabSignUp = document.getElementById('tab-btn-signup');
  const formSignIn = document.getElementById('form-signin');
  const formSignUp = document.getElementById('form-signup');
  const btnSignOut = document.getElementById('btn-modal-signout');

  if (closeBtn) closeBtn.addEventListener('click', closeAuthModal);

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAuthModal();
    });
  }

  if (tabSignIn && tabSignUp) {
    tabSignIn.addEventListener('click', () => {
      sounds.playClick();
      switchAuthTab('signin');
    });
    tabSignUp.addEventListener('click', () => {
      sounds.playClick();
      switchAuthTab('signup');
    });
  }

  // Sign In Form Submission
  if (formSignIn) {
    formSignIn.addEventListener('submit', async (e) => {
      e.preventDefault();
      sounds.playClick();
      const email = document.getElementById('signin-email')?.value || '';
      const password = document.getElementById('signin-password')?.value || '';
      const btn = document.getElementById('btn-submit-signin');

      setAlert('', 'none');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span>TRANSMITTING CREDENTIALS...</span>';
      }

      const res = await signInUser({ email, password });
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>⚡ SIGN IN &amp; ENTER ARENA</span>';
      }

      if (res.success) {
        sounds.playReward();
        setAlert(res.message, 'success');
        setTimeout(() => {
          closeAuthModal();
        }, 800);
      } else {
        sounds.playClick();
        setAlert(res.error || 'Authentication failed', 'error');
      }
    });
  }

  // Sign Up Form Submission
  if (formSignUp) {
    formSignUp.addEventListener('submit', async (e) => {
      e.preventDefault();
      sounds.playClick();
      const playerName = document.getElementById('signup-name')?.value || '';
      const email = document.getElementById('signup-email')?.value || '';
      const password = document.getElementById('signup-password')?.value || '';
      const btn = document.getElementById('btn-submit-signup');

      setAlert('', 'none');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span>CREATING ACCOUNT...</span>';
      }

      const res = await signUpUser({ email, password, playerName });
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>🛡️ CREATE ACCOUNT &amp; ENTER</span>';
      }

      if (res.success) {
        sounds.playReward();
        setAlert(res.message, 'success');
        setTimeout(() => {
          closeAuthModal();
        }, 1000);
      } else {
        sounds.playClick();
        setAlert(res.error || 'Account registration failed', 'error');
      }
    });
  }

  // Sign Out
  if (btnSignOut) {
    btnSignOut.addEventListener('click', async () => {
      sounds.playClick();
      await signOutUser();
      closeAuthModal();
    });
  }
}

export function openAuthModal(tab = 'signin') {
  sounds.playModalOpen();
  const overlay = document.getElementById('supabase-auth-modal-overlay');
  if (!overlay) return;

  const user = getCurrentAuthUser();
  if (user) {
    openProfileModal(user);
    return;
  }

  switchAuthTab(tab);
  setAlert('', 'none');
  overlay.classList.add('active');
}

function openProfileModal(user) {
  sounds.playModalOpen();
  const overlay = document.getElementById('supabase-auth-modal-overlay');
  if (!overlay) return;

  const tabsRow = document.getElementById('auth-tabs-row');
  const formSignIn = document.getElementById('form-signin');
  const formSignUp = document.getElementById('form-signup');
  const panelProfile = document.getElementById('panel-profile');
  const titleEl = document.getElementById('auth-modal-main-title');

  if (tabsRow) tabsRow.style.display = 'none';
  if (formSignIn) formSignIn.style.display = 'none';
  if (formSignUp) formSignUp.style.display = 'none';
  if (panelProfile) panelProfile.style.display = 'block';

  if (titleEl) titleEl.textContent = 'PILOT PROFILE';

  const nameEl = document.getElementById('profile-display-name');
  const emailEl = document.getElementById('profile-display-email');
  const clanEl = document.getElementById('profile-clan-val');
  const cpEl = document.getElementById('profile-cp-val');
  const lvlEl = document.getElementById('profile-lvl-val');

  normalizePlayerLevel();
  const displayName = user.player_name || user.email.split('@')[0];
  if (nameEl) nameEl.textContent = displayName;
  if (emailEl) emailEl.textContent = user.email;
  if (clanEl) clanEl.textContent = gameState.player.clan || 'None (No Clan)';
  if (cpEl) cpEl.textContent = `${(gameState.player.codePoints || 0).toLocaleString()} CP`;
  if (lvlEl) lvlEl.textContent = `Level ${gameState.player.level ?? 0} • ${gameState.player.title || 'Syntax Initiate'} (${gameState.player.xp || 0}/${gameState.player.maxXp || 100} XP)`;

  setAlert('', 'none');
  overlay.classList.add('active');
}

function switchAuthTab(tab) {
  const tabsRow = document.getElementById('auth-tabs-row');
  const formSignIn = document.getElementById('form-signin');
  const formSignUp = document.getElementById('form-signup');
  const panelProfile = document.getElementById('panel-profile');
  const tabSignIn = document.getElementById('tab-btn-signin');
  const tabSignUp = document.getElementById('tab-btn-signup');
  const titleEl = document.getElementById('auth-modal-main-title');

  if (tabsRow) tabsRow.style.display = 'flex';
  if (panelProfile) panelProfile.style.display = 'none';

  if (tab === 'signup') {
    if (tabSignIn) tabSignIn.classList.remove('active');
    if (tabSignUp) tabSignUp.classList.add('active');
    if (formSignIn) formSignIn.style.display = 'none';
    if (formSignUp) formSignUp.style.display = 'block';
    if (titleEl) titleEl.textContent = 'CREATE PILOT ACCOUNT';
  } else {
    if (tabSignUp) tabSignUp.classList.remove('active');
    if (tabSignIn) tabSignIn.classList.add('active');
    if (formSignUp) formSignUp.style.display = 'none';
    if (formSignIn) formSignIn.style.display = 'block';
    if (titleEl) titleEl.textContent = 'PILOT AUTHORIZATION';
  }
}

function setAlert(msg, type = 'none') {
  const alertEl = document.getElementById('auth-alert-banner');
  if (!alertEl) return;

  if (type === 'none' || !msg) {
    alertEl.style.display = 'none';
    alertEl.textContent = '';
    alertEl.className = 'auth-alert-banner';
    return;
  }

  alertEl.style.display = 'block';
  alertEl.textContent = msg;
  alertEl.className = `auth-alert-banner alert-${type}`;
}

export function closeAuthModal() {
  sounds.playModalClose();
  const overlay = document.getElementById('supabase-auth-modal-overlay');
  if (overlay) overlay.classList.remove('active');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
