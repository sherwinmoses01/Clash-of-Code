import { gameState, normalizePlayerLevel } from './data.js';
import { sounds, spawnCrosshair } from './audio.js';
import { initAuthUI } from './auth.js';
import { generateCoachTip, isGeminiConfigured } from './gemini.js';
import {
  initModals,
  openClanModal,
  openJoinClanView,
  openCreateClanView,
  openTrainModal,
  openShopModal,
  openMissionsModal,
  openMailboxModal,
  openStyleModal,
  openSubmenuModal,
  openRankModal,
  openRankedModal,
  openQuickModal,
  openPracticeModal,
  openTutorialModal,
  openCoachAdaChatModal
} from './modals.js';

// Screens
const homeScreen = document.getElementById('home-screen');
const battleScreen = document.getElementById('battle-screen');

// HUD Elements (Home)
const hudLevelVal = document.getElementById('hud-level-val');
const hudXpText = document.getElementById('hud-xp-text');
const hudXpBar = document.getElementById('hud-xp-bar');
const hudCpVal = document.getElementById('hud-cp-val');
const hudLevelBtn = document.getElementById('hud-level-btn');
const audioToggleBtn = document.getElementById('audio-toggle-btn');
const bgmTrackIndicator = document.getElementById('bgm-track-indicator');
const bgmStatusText = document.getElementById('bgm-status-text');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const modalContainer = document.getElementById('modal-container');
const crosshairContainer = document.getElementById('crosshair-container');

// Coach Elements
const aiCoachTrigger = document.getElementById('ai-coach-trigger');
const coachText = document.getElementById('coach-text');

// Home Action Cards
const btnBattle = document.getElementById('btn-battle');
const btnClan = document.getElementById('btn-clan');
const btnLearn = document.getElementById('btn-learn') || document.getElementById('btn-repo');
const btnTrain = document.getElementById('btn-train');
const btnShop = document.getElementById('btn-shop');

// Bottom Dock
const btnMissions = document.getElementById('btn-missions');
const btnMailbox = document.getElementById('btn-mailbox');
const btnStyle = document.getElementById('btn-style');
const btnSubmenu = document.getElementById('btn-submenu');
const missionsBadge = document.getElementById('missions-badge-dot');
const mailboxBadge = document.getElementById('mailbox-badge-dot');

// Battle Screen Elements
const battleScreenBackBtn = document.getElementById('battle-screen-back-btn');
const battleBgmIndicator = document.getElementById('battle-bgm-indicator');
const battleHudCp = document.getElementById('battle-hud-cp');
const promptBackHub = document.getElementById('prompt-back-hub');
const promptConfirmMode = document.getElementById('prompt-confirm-mode');

const modeCardRanked = document.getElementById('mode-card-ranked');
const modeCardQuick = document.getElementById('mode-card-quick');
const modeCardPractice = document.getElementById('mode-card-practice');
const modeCardTutorial = document.getElementById('mode-card-tutorial');

// Screen Transition Functions
export function showBattleScreen() {
  const gatewayScreen = document.getElementById('auth-gateway-screen');
  if (gatewayScreen && gatewayScreen.classList.contains('active')) return;
  if (homeScreen) {
    homeScreen.classList.remove('active');
    homeScreen.style.display = 'none';
  }
  if (battleScreen) {
    battleScreen.style.display = 'flex';
    battleScreen.classList.add('active');
    if (battleHudCp) {
      battleHudCp.textContent = gameState.player.codePoints.toLocaleString();
    }
  }
  sounds.playBattle();
}

export function showHomeScreen() {
  const gatewayScreen = document.getElementById('auth-gateway-screen');
  if (gatewayScreen && gatewayScreen.classList.contains('active')) return;
  if (battleScreen) {
    battleScreen.classList.remove('active');
    battleScreen.style.display = 'none';
  }
  if (homeScreen) {
    homeScreen.style.display = 'flex';
    homeScreen.classList.add('active');
  }
  updateHUD();
  sounds.playClick();
}

// Update HUD Display
export function updateHUD() {
  normalizePlayerLevel();
  if (hudLevelVal) hudLevelVal.textContent = gameState.player.level;
  if (hudXpText) hudXpText.textContent = `${gameState.player.xp}/${gameState.player.maxXp}`;
  if (hudXpBar) {
    const pct = Math.min(100, Math.max(0, Math.round((gameState.player.xp / gameState.player.maxXp) * 100)));
    hudXpBar.style.width = `${pct}%`;
  }
  if (hudCpVal) hudCpVal.textContent = (gameState.player.codePoints || 0).toLocaleString();
  if (battleHudCp) battleHudCp.textContent = (gameState.player.codePoints || 0).toLocaleString();

  // Badges update
  const uncompletedMissions = gameState.missions.filter(m => !m.claimed).length;
  if (missionsBadge) {
    missionsBadge.textContent = uncompletedMissions;
    missionsBadge.style.display = uncompletedMissions > 0 ? 'flex' : 'none';
  }

  const unreadMails = gameState.mailbox.filter(m => !m.read).length;
  if (mailboxBadge) {
    mailboxBadge.textContent = unreadMails;
    mailboxBadge.style.display = unreadMails > 0 ? 'flex' : 'none';
  }
}


// AI Coach Dynamic Dialogue (Enhanced with Gemini 3.6 Flash)
let currentQuoteIdx = 0;
async function cycleCoachSpeech() {
  if (!coachText) return;
  currentQuoteIdx = (currentQuoteIdx + 1) % gameState.coach.quotes.length;
  coachText.style.opacity = '0';
  coachText.style.transform = 'translateY(4px)';
  
  sounds.playClick();

  let quote = gameState.coach.quotes[currentQuoteIdx];
  if (isGeminiConfigured() && Math.random() > 0.4) {
    try {
      const aiTip = await generateCoachTip();
      if (aiTip) quote = aiTip;
    } catch {}
  }

  setTimeout(() => {
    coachText.textContent = `"${quote}"`;
    coachText.style.opacity = '1';
    coachText.style.transform = 'translateY(0)';
  }, 180);
}

// Add Hover Audio to All Interactive Elements
function attachHoverSounds() {
  const interactives = document.querySelectorAll(
    '.game-card, .dock-btn, .hud-action-btn, .hud-level-container, .currency-pill, .bgm-player-pill, #ai-coach-trigger, .battle-mode-card, .battle-back-btn, .nav-button-prompt, .stat-capsule'
  );
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => sounds.playHover());
  });
}

function toggleLittlerootBGM() {
  const isPlaying = sounds.toggleBGM();
  if (bgmTrackIndicator) {
    bgmTrackIndicator.classList.toggle('playing', isPlaying);
  }
  if (battleBgmIndicator) {
    battleBgmIndicator.classList.toggle('playing', isPlaying);
  }
  if (bgmStatusText) {
    bgmStatusText.textContent = isPlaying ? 'PLAYING • 0:38' : 'PAUSED';
  }
}

// Keyboard shortcuts for arcade feel
function initKeybindings() {
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    // Ignore shortcuts when Auth Gateway Screen is active
    const gatewayScreen = document.getElementById('auth-gateway-screen');
    if (gatewayScreen && gatewayScreen.classList.contains('active')) return;

    const isBattleScreenActive = battleScreen && battleScreen.classList.contains('active');
    const isModalOpen = modalContainer && modalContainer.classList.contains('active');

    // Escape or B key back handling
    if ((e.key === 'Escape' || e.key.toLowerCase() === 'b') && isBattleScreenActive && !isModalOpen) {
      showHomeScreen();
      return;
    }

    if (isBattleScreenActive && !isModalOpen) {
      switch (e.key.toLowerCase()) {
        case '1':
        case 'r':
          openRankedModal();
          break;
        case '2':
        case 'q':
          openQuickModal();
          break;
        case '3':
        case 'p':
          openPracticeModal();
          break;
        case '4':
        case 't':
          openTutorialModal();
          break;
        case 'a':
        case 'enter':
          openRankedModal();
          break;
        case 'l':
          toggleLittlerootBGM();
          break;
      }
      return;
    }

    // Home Screen shortcuts
    if (!isModalOpen) {
      switch (e.key.toLowerCase()) {
        case '1':
        case 'b':
          showBattleScreen();
          break;
        case '2':
        case 'c':
          if (e.shiftKey) {
            cycleCoachSpeech();
          } else {
            if (gameState.player.clan) {
              window.location.href = '/clan.html';
            } else {
              openClanModal();
            }
          }
          break;
        case '3':
          window.location.href = '/learn.html';
          break;
        case '4':
        case 't':
          openTrainModal();
          break;
        case '5':
        case 's':
          openShopModal();
          break;
        case 'm':
          openMissionsModal();
          break;
        case 'l':
          toggleLittlerootBGM();
          break;
      }
    }
  });
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initModals(modalContainer, updateHUD);
  // Do NOT call updateHUD() here — auth.js resolves the session asynchronously
  // and will call updateHUD() via handleScreenAccess → enterHomeScreen flow.
  // Calling it here would show stale localStorage data (old level/CP) on new accounts.
  initAuthUI();
  attachHoverSounds();
  initKeybindings();

  // Update HUD only after auth confirms the player — prevents stale data flash
  window.addEventListener('clashofcode:auth-complete', () => {
    updateHUD();
  });

  // Crosshair on click anywhere
  window.addEventListener('pointerdown', (e) => {
    const gatewayScreen = document.getElementById('auth-gateway-screen');
    if (gatewayScreen && gatewayScreen.classList.contains('active')) return;

    spawnCrosshair(e.clientX, e.clientY, sounds, crosshairContainer, true);

    // Auto-start Littleroot BGM on first user interaction inside arena
    if (!sounds.bgmStarted && sounds.bgmEnabled) {
      sounds.startBGM();
      if (bgmTrackIndicator) bgmTrackIndicator.classList.add('playing');
      if (battleBgmIndicator) battleBgmIndicator.classList.add('playing');
      if (bgmStatusText) bgmStatusText.textContent = 'PLAYING • 0:38';
    }
  });

  // Top Bar Actions
  if (hudLevelBtn) hudLevelBtn.addEventListener('click', () => openRankModal());

  // Littleroot BGM Controllers
  if (bgmTrackIndicator) {
    bgmTrackIndicator.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLittlerootBGM();
    });
  }
  if (battleBgmIndicator) {
    battleBgmIndicator.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLittlerootBGM();
    });
  }

  // Audio Toggle (SFX)
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sounds.enabled = !sounds.enabled;
      gameState.player.soundMuted = !sounds.enabled;
      audioToggleBtn.classList.toggle('muted', !sounds.enabled);
      sounds.playClick();
    });
  }

  // Fullscreen
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sounds.playClick();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  // Coach Ada Click -> Open Interactive AI Mentorship Chat Modal
  if (aiCoachTrigger) {
    aiCoachTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      openCoachAdaChatModal();
    });
  }

  // Press 'C' to open Coach Ada Chat
  window.addEventListener('keydown', (e) => {
    if ((e.key === 'c' || e.key === 'C') && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
      openCoachAdaChatModal();
    }
  });

  // Home Action Cards Click
  if (btnBattle) {
    btnBattle.addEventListener('click', (e) => {
      e.stopPropagation();
      showBattleScreen();
    });
  }

  if (btnClan) {
    btnClan.addEventListener('click', (e) => {
      e.stopPropagation();
      sounds.playClick();
      if (gameState.player.clan) {
        window.location.href = '/clan.html';
      } else {
        openClanModal();
      }
    });
  }

  if (btnLearn) {
    btnLearn.addEventListener('click', (e) => {
      e.stopPropagation();
      sounds.playClick();
      window.location.href = '/learn.html';
    });
  }

  if (btnTrain) {
    btnTrain.addEventListener('click', (e) => {
      e.stopPropagation();
      sounds.playClick();
      openTrainModal();
    });
  }

  if (btnShop) {
    btnShop.addEventListener('click', (e) => {
      e.stopPropagation();
      sounds.playClick();
      openShopModal();
    });
  }

  // Bottom Dock Clicks
  if (btnMissions) {
    btnMissions.addEventListener('click', (e) => {
      e.stopPropagation();
      sounds.playClick();
      openMissionsModal();
    });
  }

  if (btnMailbox) {
    btnMailbox.addEventListener('click', (e) => {
      e.stopPropagation();
      sounds.playClick();
      openMailboxModal();
    });
  }

  if (btnStyle) {
    btnStyle.addEventListener('click', (e) => {
      e.stopPropagation();
      sounds.playClick();
      openStyleModal();
    });
  }

  if (btnSubmenu) {
    btnSubmenu.addEventListener('click', (e) => {
      e.stopPropagation();
      sounds.playClick();
      openSubmenuModal();
    });
  }

  // ==================== BATTLE SCREEN LISTENERS ====================
  // Back buttons
  if (battleScreenBackBtn) {
    battleScreenBackBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showHomeScreen();
    });
  }

  if (promptBackHub) {
    promptBackHub.addEventListener('click', (e) => {
      e.stopPropagation();
      showHomeScreen();
    });
  }

  if (promptConfirmMode) {
    promptConfirmMode.addEventListener('click', (e) => {
      e.stopPropagation();
      openRankedModal();
    });
  }

  // Battle Mode Cards (Ranked, Quick, Practice, Tutorial)
  if (modeCardRanked) {
    modeCardRanked.addEventListener('click', (e) => {
      e.stopPropagation();
      openRankedModal();
    });
  }

  if (modeCardQuick) {
    modeCardQuick.addEventListener('click', (e) => {
      e.stopPropagation();
      openQuickModal();
    });
  }

  if (modeCardPractice) {
    modeCardPractice.addEventListener('click', (e) => {
      e.stopPropagation();
      openPracticeModal();
    });
  }

  if (modeCardTutorial) {
    modeCardTutorial.addEventListener('click', (e) => {
      e.stopPropagation();
      openTutorialModal();
    });
  }

  // Hash routing for direct navigation / testing
  function handleHash() {
    const gatewayScreen = document.getElementById('auth-gateway-screen');
    if (gatewayScreen && gatewayScreen.classList.contains('active')) return;
    const hash = window.location.hash;
    if (hash === '#battle') {
      showBattleScreen();
    } else if (hash === '#clan') {
      showHomeScreen();
      openClanModal();
    } else if (hash === '#clan-join') {
      showHomeScreen();
      openJoinClanView();
    } else if (hash === '#clan-create') {
      showHomeScreen();
      openCreateClanView();
    } else {
      showHomeScreen();
    }
  }

  handleHash();
  window.addEventListener('hashchange', handleHash);

  // Periodic Coach Dialogue update
  setInterval(() => {
    if (!document.hidden && !modalContainer.classList.contains('active')) {
      cycleCoachSpeech();
    }
  }, 18000);
});
