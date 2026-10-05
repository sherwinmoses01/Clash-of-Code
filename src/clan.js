// Clan Headquarters Controller for Clash of Code (clan.html)
import { gameState, saveState } from './data.js';
import { sounds, spawnCrosshair } from './audio.js';
import { generateRoomId } from './db.js';
import { initAuthUI } from './auth.js';

// DOM Elements
const modalContainer = document.getElementById('modal-container');
const crosshairContainer = document.getElementById('crosshair-container');
const clanBgmIndicator = document.getElementById('clan-bgm-indicator');
const cardClanInfo = document.getElementById('card-clan-info');
const cardClanWar = document.getElementById('card-clan-war');
const btnLeaveClan = document.getElementById('btn-leave-clan');
const promptLeaveHub = document.getElementById('prompt-leave-hub');
const promptBackHub = document.getElementById('prompt-back-hub');

const hudCp = document.getElementById('clan-hud-cp');
const hudClanName = document.getElementById('clan-hud-name');
const hudClanTag = document.getElementById('clan-hud-tag');
const hudClanEmblem = document.getElementById('clan-hud-emblem');

let currentClan = null;

// Find active player clan or default to BitKnights
function getActiveClan() {
  const playerClanName = gameState.player.clan || 'BitKnights';
  const found = gameState.clanRoster.find(c => c.name.toLowerCase() === playerClanName.toLowerCase() || c.joined);
  if (found) {
    found.joined = true;
    gameState.player.clan = found.name;
    return found;
  }
  // Fallback to first clan
  const fallback = gameState.clanRoster[0];
  fallback.joined = true;
  gameState.player.clan = fallback.name;
  return fallback;
}

// Update Top HUD
function updateClanHUD() {
  currentClan = getActiveClan();

  if (hudCp) hudCp.textContent = gameState.player.codePoints.toLocaleString();
  if (hudClanName) hudClanName.textContent = currentClan.name;
  if (hudClanTag) hudClanTag.textContent = currentClan.tag;
  if (hudClanEmblem) hudClanEmblem.textContent = currentClan.icon;

  const identityBadge = document.getElementById('clan-identity-badge');
  if (identityBadge && currentClan.bannerColor) {
    identityBadge.style.borderColor = currentClan.bannerColor;
  }

  updateClanWarCard();
}


// Modal helper
function openModal(htmlContent, modalClass = '') {
  sounds.playModalOpen();
  modalContainer.innerHTML = `
    <div class="modal-dialog ${modalClass}" role="dialog" aria-modal="true">
      <button class="modal-close-btn" id="modal-close-btn" aria-label="Close modal">✕</button>
      ${htmlContent}
    </div>
  `;
  modalContainer.classList.add('active');

  const closeBtn = document.getElementById('modal-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
}

function closeModal() {
  sounds.playModalClose();
  modalContainer.classList.remove('active');
  modalContainer.innerHTML = '';
}

// Click outside to close modal
if (modalContainer) {
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) closeModal();
  });
}

// ==================== 1. CLAN INFO MODAL ====================
function openClanInfoModal() {
  sounds.playClick();
  currentClan = getActiveClan();

  const mockMembers = [
    { name: currentClan.leader, role: 'Guildmaster', cp: '4,850 CP', status: 'ONLINE', avatar: '👑' },
    { name: 'NeoCoder_42 (You)', role: 'Commander', cp: '2,840 CP', status: 'ONLINE', avatar: '⚡' },
    { name: 'BinaryPhantom', role: 'Elite Duelist', cp: '2,410 CP', status: 'IN DUEL', avatar: '🛡️' },
    { name: 'AlgorithmQueen', role: 'Veteran', cp: '1,980 CP', status: 'IDLE', avatar: '💎' },
    { name: 'CacheOverlord', role: 'Member', cp: '1,540 CP', status: 'OFFLINE', avatar: '🦾' },
    { name: 'SyntaxStriker', role: 'Member', cp: '1,200 CP', status: 'ONLINE', avatar: '🏹' }
  ];

  const membersRows = mockMembers.map(m => `
    <tr class="member-row ${m.name.includes('(You)') ? 'is-player' : ''}">
      <td class="member-user-cell">
        <span class="member-avatar-chip">${m.avatar}</span>
        <div>
          <strong class="member-name">${m.name}</strong>
          <span class="member-role-sub">${m.role}</span>
        </div>
      </td>
      <td class="member-stat-cell"><strong class="highlight-gold">${m.cp}</strong></td>
      <td class="member-status-cell">
        <span class="status-indicator ${m.status.toLowerCase().replace(' ', '-')}">${m.status}</span>
      </td>
    </tr>
  `).join('');

  const content = `
    <div class="modal-header clan-info-header">
      <div class="modal-title-wrap">
        <span class="modal-badge-tag cyan-tag">GUILD PROFILE</span>
        <h2 class="modal-title">${currentClan.name} ${currentClan.tag}</h2>
      </div>
      <div class="header-stat">
        <span>Global Syndicate Rank</span>
        <strong style="color: #38BDF8">#3 WORLDWIDE</strong>
      </div>
    </div>
    <div class="modal-body">
      <!-- Guild Banner Showcase -->
      <div class="clan-profile-banner" style="border-left: 4px solid ${currentClan.bannerColor}">
        <div class="profile-emblem-wrap" style="border-color:${currentClan.bannerColor}; box-shadow: 0 0 20px ${currentClan.bannerColor}55">
          ${currentClan.icon}
        </div>
        <div class="profile-info-content">
          <div class="profile-top-line">
            <h3>${currentClan.name} <span class="clan-tag-badge">${currentClan.tag}</span></h3>
            <span class="clan-rating-badge">⭐ ${currentClan.rating}</span>
          </div>
          <span class="clan-buff-tag">🔥 Active Perk: ${currentClan.buff}</span>
          <p class="clan-perk-desc">${currentClan.perk}</p>
          <div class="clan-stats-bar">
            <span>Members: <strong>${currentClan.members}</strong></span>
            <span>Founder: <strong>${currentClan.leader}</strong></span>
            <span>Vault Treasury: <strong style="color:#FACC15">45,000 CP</strong></span>
          </div>
        </div>
      </div>

      <!-- Guild Tabs Section -->
      <div class="clan-info-tabs-bar">
        <button class="info-tab-btn active" id="tab-members">MEMBERS ROSTER (${mockMembers.length})</button>
        <button class="info-tab-btn" id="tab-vault">ALGORITHM VAULT (12)</button>
        <button class="info-tab-btn" id="tab-perks">ACTIVE BUFFS</button>
      </div>

      <div class="clan-tab-content-area" id="clan-tab-content">
        <div class="clan-members-table-wrap">
          <table class="clan-members-table">
            <thead>
              <tr>
                <th>DEVELOPER</th>
                <th>CONTRIBUTION</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${membersRows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  openModal(content, 'clan-info-modal');

  // Sub-tabs interaction
  const tabContent = document.getElementById('clan-tab-content');
  const tabs = document.querySelectorAll('.info-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      sounds.playHover();
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (tab.id === 'tab-members') {
        tabContent.innerHTML = `
          <div class="clan-members-table-wrap">
            <table class="clan-members-table">
              <thead><tr><th>DEVELOPER</th><th>CONTRIBUTION</th><th>STATUS</th></tr></thead>
              <tbody>${membersRows}</tbody>
            </table>
          </div>
        `;
      } else if (tab.id === 'tab-vault') {
        tabContent.innerHTML = `
          <div class="vault-decks-grid">
            <div class="vault-deck-card">
              <span class="vault-cat-tag">ALGO VAULT</span>
              <h4>Dijkstra & A* Pathfinding Suite</h4>
              <p>Optimized with Fibonacci heap for lightning-fast graph cycles.</p>
              <div class="vault-deck-footer">
                <span>⭐ Mastered</span>
                <button class="vault-use-btn" id="btn-copy-deck">EQUIP DECK</button>
              </div>
            </div>
            <div class="vault-deck-card">
              <span class="vault-cat-tag">MEMORY SHIELD</span>
              <h4>Zero-Allocation LRU Cache</h4>
              <p>O(1) lookups with double linked list and atomic bit masks.</p>
              <div class="vault-deck-footer">
                <span>⭐ Mastered</span>
                <button class="vault-use-btn">EQUIP DECK</button>
              </div>
            </div>
            <div class="vault-deck-card">
              <span class="vault-cat-tag">CONCURRENCY</span>
              <h4>Lock-Free Ring Buffer</h4>
              <p>Atomic ring buffer designed for competitive PvP multi-threading duels.</p>
              <div class="vault-deck-footer">
                <span>⭐ Mastered</span>
                <button class="vault-use-btn">EQUIP DECK</button>
              </div>
            </div>
          </div>
        `;
        const equipBtns = tabContent.querySelectorAll('.vault-use-btn');
        equipBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            sounds.playReward();
            btn.textContent = 'EQUIPPED! ✓';
            btn.style.background = '#10B981';
          });
        });
      } else if (tab.id === 'tab-perks') {
        tabContent.innerHTML = `
          <div class="perks-display-grid">
            <div class="perk-detail-box active">
              <span class="perk-ico">🔥</span>
              <div>
                <h4>${currentClan.buff}</h4>
                <p>Applies to all active clan members during Ranked and Quick 1v1 Algorithmic Duels.</p>
                <span class="perk-active-badge">STATUS: ACTIVE & ACCELERATED</span>
              </div>
            </div>
            <div class="perk-detail-box active">
              <span class="perk-ico">🛡️</span>
              <div>
                <h4>Syndicate Raid Pass Overclock</h4>
                <p>Instant priority queue matchmaking when challenging weekly Bug Titan Bosses.</p>
                <span class="perk-active-badge">STATUS: ACTIVE & ACCELERATED</span>
              </div>
            </div>
          </div>
        `;
      }
    });
  });
}

// Update Clan War card state on Clan page
function updateClanWarCard() {
  const warStatusBadge = document.getElementById('clan-war-status-badge');
  const warDescText = document.getElementById('clan-war-desc-text');
  if (!warStatusBadge) return;

  const isWarActive = gameState.clanWar && gameState.clanWar.isActive;
  if (isWarActive) {
    warStatusBadge.className = 'clan-strip-stat status-active-pulse';
    warStatusBadge.textContent = '● WAR ACTIVE';
    if (warDescText) {
      warDescText.textContent = `Live 50-territory war against [DRGN] CyberDragons! ${gameState.clanWar.playerAttemptsRemaining || 5}/5 attempts remaining.`;
    }
  } else {
    warStatusBadge.className = 'clan-strip-stat status-idle';
    warStatusBadge.textContent = '● NO ONGOING WAR';
    if (warDescText) {
      warDescText.textContent = 'No ongoing clan war. Clan Leader or Vice Leader must declare war to unlock the 50-territory continent map.';
    }
  }
}

// ==================== 2. CLAN WAR MODAL ====================
function openClanWarModal() {
  sounds.playBattle();
  currentClan = getActiveClan();

  const clanWar = gameState.clanWar || {
    isActive: false,
    playerRole: 'Leader',
    playerAttemptsRemaining: 5,
    rivalClan: {
      name: 'CyberDragons',
      tag: '[DRGN]',
      rating: '15,200 CP',
      icon: '🐉',
      bannerColor: '#EF4444'
    }
  };

  // Case 1: War is already active -> Direct all members directly to the 50-territory war map!
  if (clanWar.isActive) {
    sounds.playReward();
    const warRoom = clanWar.roomId || generateRoomId('guild');
    clanWar.roomId = warRoom;
    saveState();
    window.location.href = `/war.html?room=${encodeURIComponent(warRoom)}`;
    return;
  }

  // Case 2: No ongoing war. Check member role permissions (Leader / Vice Leader vs Member)
  const currentRole = clanWar.playerRole || 'Leader';
  const canDeclare = (currentRole === 'Leader' || currentRole === 'Vice Leader');

  if (!canDeclare) {
    // Regular Member View: No Ongoing War
    const memberContent = `
      <div class="modal-header clan-war-header">
        <div class="modal-title-wrap">
          <span class="modal-badge-tag orange-tag">SYNDICATE WARFARE</span>
          <h2 class="modal-title">CLAN WAR STATUS</h2>
        </div>
        <div class="header-stat">
          <span>Your Role</span>
          <strong style="color: #94A3B8">MEMBER</strong>
        </div>
      </div>
      <div class="modal-body">
        <div class="no-war-idle-box">
          <div class="no-war-icon">🛡️</div>
          <h3 class="no-war-headline">NO ONGOING CLAN WAR</h3>
          <p class="no-war-desc">
            Your syndicate <strong>${currentClan.name} ${currentClan.tag}</strong> is not currently engaged in any active Clan War.
            Only the <strong>Clan Leader</strong> or <strong>Vice Leader</strong> has the tactical authority to initiate matchmaking and declare war.
          </p>
          <div class="no-war-meta-box">
            <div class="meta-item">
              <span class="meta-lbl">FORMAT</span>
              <strong class="meta-val">7 Days • 50 Territories</strong>
            </div>
            <div class="meta-item">
              <span class="meta-lbl">MEMBER LIMIT</span>
              <strong class="meta-val">5 Attempts / Developer</strong>
            </div>
            <div class="meta-item">
              <span class="meta-lbl">BOUNTY</span>
              <strong class="meta-val" style="color: #FACC15">50,000 CP</strong>
            </div>
          </div>
        </div>

        <!-- Role Switcher for Testing / Demonstration -->
        <div class="role-demo-switcher">
          <span class="switcher-lbl">🎮 TEST DEMO ROLE:</span>
          <div class="role-btn-group">
            <button class="role-toggle-btn active" data-role="Member">🛡️ Member (Current)</button>
            <button class="role-toggle-btn" data-role="Vice Leader">⚔️ Vice Leader</button>
            <button class="role-toggle-btn" data-role="Leader">👑 Leader</button>
          </div>
        </div>

        <div class="war-action-row" style="margin-top: 18px;">
          <button class="war-cancel-btn" id="btn-close-no-war">
            <span>CLOSE</span>
          </button>
        </div>
      </div>
    `;

    openModal(memberContent, 'no-war-modal');

    const closeBtn = document.getElementById('btn-close-no-war');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Setup role switchers
    const roleBtns = document.querySelectorAll('.role-toggle-btn');
    roleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedRole = btn.getAttribute('data-role');
        gameState.clanWar.playerRole = selectedRole;
        saveState();
        closeModal();
        openClanWarModal();
      });
    });

    return;
  }

  // Case 3: Player is Leader or Vice Leader -> Allow searching and declaring 7-Day War
  const leaderContent = `
    <div class="modal-header clan-war-header">
      <div class="modal-title-wrap">
        <span class="modal-badge-tag orange-tag">TACTICAL COMMAND</span>
        <h2 class="modal-title">DECLARE SYNDICATE CLAN WAR</h2>
      </div>
      <div class="header-stat">
        <span>Command Authority</span>
        <strong style="color: #FACC15">${currentRole.toUpperCase()} 👑</strong>
      </div>
    </div>
    <div class="modal-body">
      <div class="war-briefing-card">
        <div class="brief-icon">🗺️</div>
        <div class="brief-info">
          <h3>Massive 50-Territory Continent Conquest</h3>
          <p>
            Deploy <strong>${currentClan.name}</strong> into a 7-day algorithmic clash against an evenly matched rival syndicate.
            Capture interlocking territories on the massive map by conquering adjacent sectors first.
          </p>
        </div>
      </div>

      <div class="war-rules-grid">
        <div class="rule-box">
          <span class="rule-icon">⏱️</span>
          <strong class="rule-title">7-Day Duration</strong>
          <span class="rule-sub">War continues continuously for one full week</span>
        </div>
        <div class="rule-box">
          <span class="rule-icon">⚡</span>
          <strong class="rule-title">5 Attempts / Member</strong>
          <span class="rule-sub">Each developer can execute only 5 problem submissions</span>
        </div>
        <div class="rule-box">
          <span class="rule-icon">📍</span>
          <strong class="rule-title">50 Territories</strong>
          <span class="rule-sub">State outline continent map with white borders</span>
        </div>
        <div class="rule-box">
          <span class="rule-icon">🏆</span>
          <strong class="rule-title">50,000 CP Bounty</strong>
          <span class="rule-sub">Syndicate with the most sectors captured wins</span>
        </div>
      </div>

      <!-- Role Switcher for Testing / Demonstration -->
      <div class="role-demo-switcher">
        <span class="switcher-lbl">🎮 TEST DEMO ROLE:</span>
        <div class="role-btn-group">
          <button class="role-toggle-btn ${currentRole === 'Member' ? 'active' : ''}" data-role="Member">🛡️ Member</button>
          <button class="role-toggle-btn ${currentRole === 'Vice Leader' ? 'active' : ''}" data-role="Vice Leader">⚔️ Vice Leader</button>
          <button class="role-toggle-btn ${currentRole === 'Leader' ? 'active' : ''}" data-role="Leader">👑 Leader</button>
        </div>
      </div>

      <!-- Matchmaking Status Box -->
      <div id="war-matchmaking-box" class="matchmaking-status hidden">
        <div class="pulse-radar"></div>
        <div class="radar-text" id="war-radar-text">
          <h5>SEARCHING SYNDICATE REGISTRY...</h5>
          <p>Pairing against matched 50-member rival syndicate</p>
        </div>
      </div>

      <!-- Action Button Row -->
      <div class="war-action-row" id="war-action-controls">
        <button class="war-deploy-btn" id="btn-find-clan-war">
          <span>⚔️ FIND CLAN WAR (START 7-DAY CONQUEST)</span>
        </button>
      </div>
    </div>
  `;

  openModal(leaderContent, 'clan-war-declaration-modal');

  // Role toggle buttons
  const roleBtns = document.querySelectorAll('.role-toggle-btn');
  roleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedRole = btn.getAttribute('data-role');
      gameState.clanWar.playerRole = selectedRole;
      saveState();
      closeModal();
      openClanWarModal();
    });
  });

  const findWarBtn = document.getElementById('btn-find-clan-war');
  const mmBox = document.getElementById('war-matchmaking-box');
  const radarText = document.getElementById('war-radar-text');

  if (findWarBtn) {
    findWarBtn.addEventListener('click', () => {
      sounds.playBattle();
      mmBox.classList.remove('hidden');
      findWarBtn.disabled = true;
      findWarBtn.innerHTML = `<span>⚡ SEARCHING SYNDICATE LADDER...</span>`;

      setTimeout(() => {
        sounds.playReward();
        if (radarText) {
          radarText.innerHTML = `
            <h5 style="color: #38BDF8">⚔️ RIVAL SYNDICATE FOUND!</h5>
            <p style="font-size: 0.95rem; color: #FFFFFF; font-weight: 700;">
              Opponent: <strong style="color: #EF4444">[DRGN] CyberDragons (15,200 CP)</strong>
            </p>
            <p style="color: #FACC15; font-size: 0.8rem; margin-top: 4px;">
              Generating 50-territory continent map... Deploying in 2 seconds!
            </p>
          `;
        }

        // Initialize and start clan war
        gameState.clanWar.isActive = true;
        gameState.clanWar.startTime = Date.now();
        gameState.clanWar.playerAttemptsRemaining = 5;
        const warRoom = generateRoomId('guild');
        gameState.clanWar.roomId = warRoom;
        saveState();

        setTimeout(() => {
          closeModal();
          window.location.href = `/war.html?room=${encodeURIComponent(warRoom)}`;
        }, 2000);
      }, 2000);
    });
  }
}


// ==================== 3. RED LEAVE BUTTON CONFIRMATION ====================
function openLeaveClanModal() {
  sounds.playClick();
  currentClan = getActiveClan();

  const content = `
    <div class="modal-header clan-leave-header">
      <div class="modal-title-wrap">
        <span class="modal-badge-tag red-tag">DANGER ZONE</span>
        <h2 class="modal-title" style="color: #EF4444">LEAVE CLAN</h2>
      </div>
    </div>
    <div class="modal-body">
      <div class="clan-leave-warning-box">
        <div class="warning-icon-wrap">⚠️</div>
        <div class="warning-text-wrap">
          <h3>Are you sure you want to leave ${currentClan.name}?</h3>
          <p>
            You will forfeit all guild privileges, including your <strong>${currentClan.buff}</strong> multiplier,
            access to <strong>12 shared algorithm vault decks</strong>, and your Syndicate Clan War raid progress.
          </p>
        </div>
      </div>

      <div class="clan-leave-actions">
        <button class="cancel-leave-btn" id="btn-cancel-leave">
          NEVER MIND, STAY IN CLAN
        </button>
        <button class="confirm-leave-btn red-danger-btn" id="btn-confirm-leave">
          <span>🚪 YES, CONFIRM & LEAVE CLAN</span>
        </button>
      </div>
    </div>
  `;

  openModal(content, 'clan-leave-dialog-modal');

  const cancelBtn = document.getElementById('btn-cancel-leave');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  }

  const confirmBtn = document.getElementById('btn-confirm-leave');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      sounds.playClick();

      // Clear player clan
      gameState.player.clan = null;
      gameState.clanRoster.forEach(c => c.joined = false);
      saveState();

      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `<span>LEAVING CLAN...</span>`;

      setTimeout(() => {
        // Redirect back to Hub where they can join/create a clan
        window.location.href = '/#clan';
      }, 600);
    });
  }
}

// Littleroot BGM Controller
function toggleLittlerootBGM() {
  const isPlaying = sounds.toggleBGM();
  if (clanBgmIndicator) {
    clanBgmIndicator.classList.toggle('playing', isPlaying);
  }
}

// Attach Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  initAuthUI({ requireAuth: true });
  updateClanHUD();

  // Pointer click crosshair
  window.addEventListener('pointerdown', (e) => {
    spawnCrosshair(e.clientX, e.clientY, sounds, crosshairContainer, true);

    // Autoplay BGM on first interaction
    if (!sounds.bgmStarted && sounds.bgmEnabled) {
      sounds.startBGM();
      if (clanBgmIndicator) clanBgmIndicator.classList.add('playing');
    }
  });

  // BGM Indicator Click
  if (clanBgmIndicator) {
    clanBgmIndicator.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLittlerootBGM();
    });
  }

  // Hero Card 1: CLAN INFO
  if (cardClanInfo) {
    cardClanInfo.addEventListener('click', () => {
      openClanInfoModal();
    });
  }

  // Hero Card 2: CLAN WAR
  if (cardClanWar) {
    cardClanWar.addEventListener('click', () => {
      openClanWarModal();
    });
  }

  // RED LEAVE BUTTON in top corner
  if (btnLeaveClan) {
    btnLeaveClan.addEventListener('click', (e) => {
      e.stopPropagation();
      openLeaveClanModal();
    });
  }

  // Bottom prompt leave
  if (promptLeaveHub) {
    promptLeaveHub.addEventListener('click', (e) => {
      e.stopPropagation();
      openLeaveClanModal();
    });
  }

  // Bottom prompt back
  if (promptBackHub) {
    promptBackHub.addEventListener('click', () => {
      sounds.playClick();
      window.location.href = '/';
    });
  }

  // Hash routing for direct navigation / testing
  function handleHash() {
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam && ['Leader', 'Vice Leader', 'Member'].includes(roleParam)) {
      gameState.clanWar.playerRole = roleParam;
    }

    const hash = window.location.hash;
    if (hash === '#info') {
      openClanInfoModal();
    } else if (hash === '#war') {
      openClanWarModal();
    } else if (hash === '#leave') {
      openLeaveClanModal();
    }
  }

  handleHash();
  window.addEventListener('hashchange', handleHash);

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (modalContainer.classList.contains('active')) {
      if (e.key === 'Escape') closeModal();
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'b':
      case 'escape':
        window.location.href = '/';
        break;
      case '1':
      case 'i':
        openClanInfoModal();
        break;
      case '2':
      case 'w':
        openClanWarModal();
        break;
      case 'x':
      case 'l':
        openLeaveClanModal();
        break;
    }
  });
});
