import { gameState, saveState } from './data.js';
import { sounds } from './audio.js';
import { generateRoomId } from './db.js';

let modalContainer = null;
let currentOpenModal = null;
let updateHudCallback = null;

export function initModals(containerEl, onHudUpdate) {
  modalContainer = containerEl;
  updateHudCallback = onHudUpdate;

  // ESC to close modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentOpenModal) {
      closeModal();
    }
  });

  // Click outside to close
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) {
      closeModal();
    }
  });
}

export function closeModal() {
  if (!currentOpenModal) return;
  sounds.playModalClose();
  modalContainer.classList.remove('active');
  modalContainer.innerHTML = '';
  currentOpenModal = null;
}

function openModal(htmlContent, modalId) {
  sounds.playModalOpen();
  currentOpenModal = modalId;
  modalContainer.innerHTML = `
    <div class="modal-dialog ${modalId}-modal" role="dialog" aria-modal="true">
      <button class="modal-close-btn" aria-label="Close modal">✕</button>
      ${htmlContent}
    </div>
  `;
  modalContainer.classList.add('active');

  const closeBtn = modalContainer.querySelector('.modal-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeModal());
  }
}

// 1. RANKED DUEL MODAL (Battle Screen - Card 1)
export function openRankedModal() {
  const content = `
    <div class="modal-header ranked-header">
      <div class="modal-title-wrap">
        <span class="modal-badge-tag cyan-tag">COMPETITIVE QUEUE</span>
        <h2 class="modal-title">RANKED CODE DUEL</h2>
      </div>
      <div class="header-stat">
        <span>Current Rating</span>
        <strong style="color: #38BDF8">2,840 ELO [GOLD I]</strong>
      </div>
    </div>
    <div class="modal-body">
      <div class="battle-card-option">
        <div class="mode-icon-badge">⚔️</div>
        <div class="mode-info">
          <div class="mode-top-line">
            <h4 class="mode-title">1v1 Synchronous Code Duel</h4>
            <span class="mode-tier-tag">Ranked Match</span>
          </div>
          <p class="mode-subtitle">Real-time algorithmic showdown. First to pass all test suites wins +45 ELO and 350 Code Points.</p>
          <div class="mode-footer">
            <span>Entry Stake: <strong>100 CP</strong></span>
            <span>Win Bonus: <strong>+45 ELO / +350 CP</strong></span>
          </div>
        </div>
        <button id="launch-ranked-queue-btn" class="mode-launch-btn">FIND RIVAL</button>
      </div>

      <div id="ranked-queue-status" class="matchmaking-status hidden">
        <div class="pulse-radar"></div>
        <div class="radar-text">
          <h5>SEARCHING IN TIER: GOLD I (~2,840 ELO)</h5>
          <p>Analyzing compiler latency & skill parity [US-EAST-CYBER]</p>
        </div>
        <button id="cancel-ranked-btn" class="cancel-queue-btn">CANCEL</button>
      </div>
    </div>
  `;

  openModal(content, 'ranked');

  const startBtn = modalContainer.querySelector('#launch-ranked-queue-btn');
  const statusBox = modalContainer.querySelector('#ranked-queue-status');
  const cancelBtn = modalContainer.querySelector('#cancel-ranked-btn');

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      sounds.playBattle();
      statusBox.classList.remove('hidden');
      startBtn.disabled = true;

      setTimeout(() => {
        if (currentOpenModal === 'ranked') {
          sounds.playReward();
          const roomId = generateRoomId('ranked');
          statusBox.innerHTML = `
            <div class="match-found-banner">
              <span class="banner-alert">⚔️ MATCH PAIRING CONFIRMED!</span>
              <h4>Opponent: <strong>ZeroDayNinja (2,890 ELO • RED FACTION)</strong></h4>
              <p>Room ID: <strong style="color: #38BDF8">${roomId}</strong> (Real-Time Synced)</p>
              <p>Mission: <strong>Territory Map Conquest (White Outline Grid)</strong></p>
              <div class="ready-timer">Deploying to Tactical Map Arena in 3... 2... 1...</div>
            </div>
          `;
          setTimeout(() => {
            closeModal();
            window.location.href = `/ranked.html?room=${encodeURIComponent(roomId)}`;
          }, 2000);
        }
      }, 2200);
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      statusBox.classList.add('hidden');
      startBtn.disabled = false;
    });
  }
}

// 2. QUICK SPRINT MODAL (Battle Screen - Card 2)
export function openQuickModal() {
  const content = `
    <div class="modal-header quick-header">
      <div class="modal-title-wrap">
        <span class="modal-badge-tag orange-tag">CASUAL BLITZ</span>
        <h2 class="modal-title">QUICK CODE SPRINT</h2>
      </div>
      <div class="header-stat">
        <span>Sprint Speed</span>
        <strong style="color: #FACC15">3 MINUTES</strong>
      </div>
    </div>
    <div class="modal-body">
      <div class="battle-card-option">
        <div class="mode-icon-badge">⚡</div>
        <div class="mode-info">
          <div class="mode-top-line">
            <h4 class="mode-title">Instant Bug Squash Sprint</h4>
            <span class="mode-tier-tag" style="background:rgba(250,204,21,0.2);color:#FACC15;border-color:rgba(250,204,21,0.4)">Fast Casual</span>
          </div>
          <p class="mode-subtitle">Jump directly into a 3-minute rapid code sprint. Zero ELO penalty if you fail, pure CP rewards!</p>
          <div class="mode-footer">
            <span>Entry Fee: <strong>FREE</strong></span>
            <span>Reward: <strong>+180 CP / +25 XP</strong></span>
          </div>
        </div>
        <button id="launch-quick-sprint-btn" class="mode-launch-btn" style="background:linear-gradient(135deg,#FACC15,#CA8A04)">INSTANT LAUNCH</button>
      </div>

      <div id="quick-sprint-status" class="matchmaking-status hidden">
        <div class="pulse-radar" style="border-color:#FACC15"></div>
        <div class="radar-text">
          <h5 style="color:#FACC15">GENERATING SYNTAX SCENARIO...</h5>
          <p>Loading 3 runtime exceptions to patch [0.4s]</p>
        </div>
      </div>
    </div>
  `;

  openModal(content, 'quick');

  const startBtn = modalContainer.querySelector('#launch-quick-sprint-btn');
  const statusBox = modalContainer.querySelector('#quick-sprint-status');

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      sounds.playBattle();
      statusBox.classList.remove('hidden');
      startBtn.disabled = true;

      setTimeout(() => {
        if (currentOpenModal === 'quick') {
          sounds.playReward();
          statusBox.innerHTML = `
            <div class="match-found-banner">
              <span class="banner-alert" style="color:#FACC15">⚡ SPRINT READY!</span>
              <h4>Challenge: <strong>Memory Leak in React useEffect Hook</strong></h4>
              <p>Patch timer: <strong>180 Seconds</strong></p>
              <div class="ready-timer" style="color:#FEF08A">Starting in 2... 1...</div>
            </div>
          `;
          setTimeout(() => {
            gameState.player.codePoints += 180;
            gameState.player.xp += 25;
            if (updateHudCallback) updateHudCallback();
            closeModal();
          }, 2600);
        }
      }, 1500);
    });
  }
}

// 3. PRACTICE LAB MODAL (Battle Screen - Card 3)
export function openPracticeModal() {
  openTrainModal(); // Leverages the interactive Sparring Dojo quiz with AI supervisor!
}

// 4. TUTORIAL BOOTCAMP MODAL (Battle Screen - Card 4)
export function openTutorialModal() {
  const content = `
    <div class="modal-header tutorial-header">
      <div class="modal-title-wrap">
        <span class="modal-badge-tag" style="color:#10B981">BOOTCAMP</span>
        <h2 class="modal-title">SYNTAX & ARENA TUTORIAL</h2>
      </div>
      <div class="header-stat">
        <span>Instructor</span>
        <strong style="color: #10B981">COACH ADA & TREE SENTINEL</strong>
      </div>
    </div>
    <div class="modal-body">
      <div class="tutorial-lessons-list">
        <div class="repo-card-item" style="border-color:#10B981;margin-bottom:12px">
          <div class="repo-header-row">
            <span class="repo-category" style="color:#34D399">Lesson 1: Arena Controls & Shortcuts</span>
            <span class="repo-complexity" style="color:#A7F3D0">Basic</span>
          </div>
          <h4 class="repo-name">Combat Shortcuts & Tactical Targeting</h4>
          <p style="font-size:0.85rem;color:#D1FAE5;line-height:1.4">
            Click anywhere on the battle grid to use your tactical crosshair. Press [B] or [ESC] anytime to return to the Command Deck.
          </p>
        </div>

        <div class="repo-card-item" style="border-color:#10B981;margin-bottom:12px">
          <div class="repo-header-row">
            <span class="repo-category" style="color:#34D399">Lesson 2: Big-O Algorithm Complexity</span>
            <span class="repo-complexity" style="color:#A7F3D0">Intermediate</span>
          </div>
          <h4 class="repo-name">Optimal Time & Space Trade-offs</h4>
          <p style="font-size:0.85rem;color:#D1FAE5;line-height:1.4">
            In Ranked duels, solutions with lower space and time complexity score bonus speed multipliers against rival opponents.
          </p>
        </div>

        <button id="complete-tutorial-btn" class="mode-launch-btn" style="background:linear-gradient(135deg,#10B981,#047857);color:#FFFFFF;width:100%">
          COMPLETE TUTORIAL (+200 CP, +50 XP)
        </button>
      </div>
    </div>
  `;

  openModal(content, 'tutorial');

  const completeBtn = modalContainer.querySelector('#complete-tutorial-btn');
  if (completeBtn) {
    completeBtn.addEventListener('click', () => {
      sounds.playReward();
      gameState.player.codePoints += 200;
      gameState.player.xp += 50;
      if (updateHudCallback) updateHudCallback();
      closeModal();
    });
  }
}

// 5. CLAN MODAL - GATEWAY (Join Clan or Create Clan)
export function openClanModal() {
  const content = `
    <div class="modal-header clan-header">
      <div class="modal-title-wrap">
        <span class="modal-badge-tag pink-tag">GUILDS & ALLIANCES</span>
        <h2 class="modal-title">DEVELOPER CLANS</h2>
      </div>
      <div class="header-stat">
        <span>Your Balance</span>
        <strong style="color: #FACC15">${gameState.player.codePoints.toLocaleString()} CP</strong>
      </div>
    </div>
    <div class="modal-body">
      <div class="clan-banner-info">
        <p>Team up with fellow developers for Guild Wars, shared algorithm vaults, and collective CP multiplier perks.</p>
      </div>

      <div class="clan-gate-grid">
        <!-- 1. JOIN CLAN BUTTON / PORTAL -->
        <div class="clan-portal-card join-portal-card" id="card-gate-join" role="button" tabindex="0">
          <div class="clan-portal-badge cyan-badge">ENLIST IN A SQUAD</div>
          <div class="clan-portal-icon-wrap cyan-glow">
            <span class="clan-portal-icon">🛡️</span>
          </div>
          <h3 class="clan-portal-title">JOIN CLAN</h3>
          <p class="clan-portal-desc">
            Browse verified developer guilds, inspect leaderboard ratings, and unlock instant team-wide XP and debug buffs.
          </p>
          <ul class="clan-portal-perks">
            <li><span class="bullet-chk">✓</span> <strong>${gameState.clanRoster.length} Active Guilds</strong> currently recruiting</li>
            <li><span class="bullet-chk">✓</span> Shared code snippet & algorithm vaults</li>
            <li><span class="bullet-chk">✓</span> Instant clan-wide XP multiplier bonus</li>
          </ul>
          <button class="clan-gate-btn join-clan-gate-btn" id="btn-gate-join">
            <span>BROWSE & JOIN CLAN</span>
            <span class="gate-arrow">›</span>
          </button>
        </div>

        <!-- 2. CREATE CLAN BUTTON / PORTAL -->
        <div class="clan-portal-card create-portal-card" id="card-gate-create" role="button" tabindex="0">
          <div class="clan-portal-badge gold-badge">FOUND A GUILD</div>
          <div class="clan-portal-icon-wrap gold-glow">
            <span class="clan-portal-icon">👑</span>
          </div>
          <h3 class="clan-portal-title">CREATE CLAN</h3>
          <p class="clan-portal-desc">
            Found your own developer clan. Customize your clan name, [TAG], crest emblem, banner colors, and active buffs.
          </p>
          <ul class="clan-portal-perks">
            <li><span class="bullet-chk">✓</span> Custom name, [TAG] & cyber emblem</li>
            <li><span class="bullet-chk">✓</span> Define your guild's combat perk buff</li>
            <li><span class="bullet-chk">✓</span> Full Guildmaster & recruitment rights</li>
          </ul>
          <button class="clan-gate-btn create-clan-gate-btn" id="btn-gate-create">
            <span>CREATE CLAN (500 CP)</span>
            <span class="gate-arrow">›</span>
          </button>
        </div>
      </div>
    </div>
  `;

  openModal(content, 'clan');

  const cardJoin = modalContainer.querySelector('#card-gate-join');
  const btnJoin = modalContainer.querySelector('#btn-gate-join');
  const openJoin = () => {
    sounds.playClick();
    openJoinClanView();
  };
  if (cardJoin) cardJoin.addEventListener('click', (e) => {
    if (e.target.closest('#btn-gate-join')) return;
    openJoin();
  });
  if (btnJoin) btnJoin.addEventListener('click', (e) => {
    e.stopPropagation();
    openJoin();
  });

  const cardCreate = modalContainer.querySelector('#card-gate-create');
  const btnCreate = modalContainer.querySelector('#btn-gate-create');
  const openCreate = () => {
    sounds.playClick();
    openCreateClanView();
  };
  if (cardCreate) cardCreate.addEventListener('click', (e) => {
    if (e.target.closest('#btn-gate-create')) return;
    openCreate();
  });
  if (btnCreate) btnCreate.addEventListener('click', (e) => {
    e.stopPropagation();
    openCreate();
  });
}

// SUB-VIEW A: BROWSE & JOIN CLAN
export function openJoinClanView(searchQuery = '') {
  const query = searchQuery.trim().toLowerCase();
  const filteredClans = gameState.clanRoster.filter(clan => {
    if (!query) return true;
    return clan.name.toLowerCase().includes(query) ||
           clan.tag.toLowerCase().includes(query) ||
           clan.buff.toLowerCase().includes(query) ||
           clan.leader.toLowerCase().includes(query);
  });

  const clansHtml = filteredClans.length > 0 
    ? filteredClans.map(clan => `
      <div class="clan-roster-card ${clan.joined ? 'active-clan' : ''}">
        <div class="clan-icon-box" style="border-color:${clan.bannerColor}; box-shadow: 0 0 14px ${clan.bannerColor}44">
          ${clan.icon}
        </div>
        <div class="clan-meta">
          <div class="clan-title-line">
            <h4>${clan.name}</h4>
            <span class="clan-tag-badge">${clan.tag}</span>
            <span class="clan-rating-badge">⭐ ${clan.rating}</span>
          </div>
          <span class="clan-buff-tag">🔥 ${clan.buff}</span>
          <p class="clan-perk-desc">${clan.perk}</p>
          <div class="clan-stats-bar">
            <span>Members: <strong>${clan.members}</strong></span>
            <span>Founder: <strong>${clan.leader}</strong></span>
          </div>
        </div>
        <div class="clan-action">
          ${clan.joined 
            ? `<span class="badge-clan-joined">YOUR CLAN</span>` 
            : `<button class="join-clan-btn" data-id="${clan.id}">JOIN CLAN</button>`
          }
        </div>
      </div>
    `).join('')
    : `
      <div class="clan-empty-state">
        <span class="empty-icon">🔍</span>
        <h4>No clans matched "${searchQuery}"</h4>
        <p>Try a different keyword or create your own developer clan!</p>
        <button class="create-clan-shortcut-btn" id="btn-empty-create-clan">Create Clan Instead</button>
      </div>
    `;

  const content = `
    <div class="modal-header clan-header">
      <div class="modal-header-nav">
        <button class="modal-subview-back-btn" id="btn-back-to-clan-gate" title="Return to Clan Choice">
          <span class="back-arrow">‹</span>
          <span>BACK</span>
        </button>
        <div class="modal-title-wrap">
          <span class="modal-badge-tag cyan-tag">ROSTER & RECRUITMENT</span>
          <h2 class="modal-title">BROWSE & JOIN CLANS</h2>
        </div>
      </div>
      <div class="header-stat">
        <span>Current Clan</span>
        <strong style="color: #EC4899">${gameState.player.clan || 'None'}</strong>
      </div>
    </div>
    <div class="modal-body">
      <div class="clan-toolbar">
        <div class="clan-search-box">
          <span class="search-ico">🔍</span>
          <input type="text" id="clan-search-input" class="clan-search-input" placeholder="Search by clan name, tag, perk, or founder..." value="${searchQuery}">
          ${searchQuery ? `<button id="btn-clear-search" class="search-clear-btn" title="Clear search">✕</button>` : ''}
        </div>
        <button class="create-quick-pill-btn" id="btn-quick-found-clan">
          <span>+ Create Clan</span>
        </button>
      </div>

      <div class="clan-grid">
        ${clansHtml}
      </div>
    </div>
  `;

  openModal(content, 'clan');

  // Back button to Gateway
  const backBtn = modalContainer.querySelector('#btn-back-to-clan-gate');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      sounds.playClick();
      openClanModal();
    });
  }

  // Create clan quick shortcut
  const quickCreate = modalContainer.querySelector('#btn-quick-found-clan');
  if (quickCreate) {
    quickCreate.addEventListener('click', () => {
      sounds.playClick();
      openCreateClanView();
    });
  }

  const emptyCreate = modalContainer.querySelector('#btn-empty-create-clan');
  if (emptyCreate) {
    emptyCreate.addEventListener('click', () => {
      sounds.playClick();
      openCreateClanView();
    });
  }

  // Search input reactive filtering
  const searchInput = modalContainer.querySelector('#clan-search-input');
  if (searchInput) {
    searchInput.focus();
    // Keep cursor at end of input
    const valLen = searchInput.value.length;
    searchInput.setSelectionRange(valLen, valLen);

    searchInput.addEventListener('input', (e) => {
      openJoinClanView(e.target.value);
    });
  }

  const clearBtn = modalContainer.querySelector('#btn-clear-search');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      sounds.playClick();
      openJoinClanView('');
    });
  }

  // Join Clan action buttons
  const joinBtns = modalContainer.querySelectorAll('.join-clan-btn');
  joinBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      gameState.clanRoster.forEach(c => c.joined = (c.id === id));
      const newClan = gameState.clanRoster.find(c => c.id === id);
      if (newClan) {
        gameState.player.clan = newClan.name;
        saveState();
        sounds.playReward();
        if (updateHudCallback) updateHudCallback();
        openJoinClanView(searchQuery);
      }
    });
  });
}

// SUB-VIEW B: CREATE CLAN
export function openCreateClanView() {
  const emblems = ['🛡️', '🐉', '🦀', '⚡', '🦅', '🐺', '🚀', '⚔️', '💎', '🦾', '👾', '🔮'];
  const colors = [
    { name: 'Neon Purple', hex: '#7C3AED' },
    { name: 'Cyber Blue', hex: '#0284C7' },
    { name: 'Emerald', hex: '#10B981' },
    { name: 'Amber Gold', hex: '#F59E0B' },
    { name: 'Crimson', hex: '#EF4444' },
    { name: 'Hot Pink', hex: '#EC4899' }
  ];
  const perks = [
    { title: '+20% Bonus XP on Algo Duels', desc: 'Shared Code Snippet Vault & Daily Raid Pass' },
    { title: '+15% Faster Debug Execution', desc: 'Priority Queue for Boss Bug Raids' },
    { title: 'Zero-Cost Memory Leak Shield', desc: 'Automated Compiler Linting Assist' },
    { title: '+250 CP on Daily Kata Sparring', desc: 'Accelerated Code Point Yield on Wins' },
    { title: '+30% Critical Hit on Bug Bosses', desc: 'Bonus damage multiplier during co-op raids' }
  ];

  let selectedEmblem = '🛡️';
  let selectedColor = '#7C3AED';
  let selectedPerkIdx = 0;

  const content = `
    <div class="modal-header clan-header">
      <div class="modal-header-nav">
        <button class="modal-subview-back-btn" id="btn-back-to-clan-gate" title="Return to Clan Choice">
          <span class="back-arrow">‹</span>
          <span>BACK</span>
        </button>
        <div class="modal-title-wrap">
          <span class="modal-badge-tag gold-tag">FOUNDATION CEREMONY</span>
          <h2 class="modal-title">FOUND A NEW CLAN</h2>
        </div>
      </div>
      <div class="header-stat">
        <span>Your Balance</span>
        <strong style="color: #FACC15">${gameState.player.codePoints.toLocaleString()} CP</strong>
      </div>
    </div>
    <div class="modal-body">
      <div class="create-clan-layout">
        
        <!-- LEFT: FORM CONFIGURATION -->
        <div class="create-clan-form">
          <div class="form-row-dual">
            <div class="form-group flex-2">
              <label class="form-label" for="input-clan-name">Clan Name <span class="required">*</span></label>
              <input type="text" id="input-clan-name" class="form-input" placeholder="e.g. Quantum Knights" maxlength="22" autocomplete="off">
              <span class="form-hint">3-22 characters</span>
            </div>
            <div class="form-group flex-1">
              <label class="form-label" for="input-clan-tag">Tag <span class="required">*</span></label>
              <input type="text" id="input-clan-tag" class="form-input tag-input" placeholder="QTM" maxlength="5" autocomplete="off">
              <span class="form-hint">2-5 letters [TAG]</span>
            </div>
          </div>

          <!-- Emblem Picker -->
          <div class="form-group">
            <label class="form-label">Emblem Crest</label>
            <div class="emblem-selector-grid" id="emblem-grid">
              ${emblems.map((emb, i) => `
                <button type="button" class="emblem-option ${i === 0 ? 'selected' : ''}" data-emblem="${emb}">
                  ${emb}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Theme Color Picker -->
          <div class="form-group">
            <label class="form-label">Banner Accent Color</label>
            <div class="color-swatch-row" id="color-row">
              ${colors.map((c, i) => `
                <button type="button" class="color-swatch ${i === 0 ? 'selected' : ''}" data-color="${c.hex}" style="background-color: ${c.hex}" title="${c.name}"></button>
              `).join('')}
            </div>
          </div>

          <!-- Clan Perk Focus -->
          <div class="form-group">
            <label class="form-label" for="select-clan-perk">Clan Buff Specialization</label>
            <select id="select-clan-perk" class="form-select">
              ${perks.map((p, i) => `
                <option value="${i}">${p.title}</option>
              `).join('')}
            </select>
          </div>

          <!-- Clan Motto -->
          <div class="form-group">
            <label class="form-label" for="input-clan-motto">Guild Motto / Pitch</label>
            <input type="text" id="input-clan-motto" class="form-input" placeholder="e.g. Clean syntax, zero memory leaks." maxlength="55" autocomplete="off">
          </div>
        </div>

        <!-- RIGHT: LIVE PREVIEW & CONFIRMATION -->
        <div class="create-clan-preview-col">
          <span class="preview-heading">LIVE GUILD CARD PREVIEW</span>
          
          <div class="clan-roster-card active-clan preview-card" id="clan-live-preview">
            <div class="clan-icon-box" id="preview-icon-box" style="border-color:${selectedColor}; box-shadow: 0 0 16px ${selectedColor}55">
              ${selectedEmblem}
            </div>
            <div class="clan-meta">
              <div class="clan-title-line">
                <h4 id="preview-name">Quantum Knights</h4>
                <span class="clan-tag-badge" id="preview-tag">[QTM]</span>
                <span class="clan-rating-badge">⭐ 10,000 CP</span>
              </div>
              <span class="clan-buff-tag" id="preview-buff">🔥 ${perks[0].title}</span>
              <p class="clan-perk-desc" id="preview-desc">${perks[0].desc}</p>
              <div class="clan-stats-bar">
                <span>Members: <strong>1 / 50</strong></span>
                <span>Founder: <strong>${gameState.player.name}</strong></span>
              </div>
            </div>
            <div class="clan-action">
              <span class="badge-clan-joined">FOUNDER</span>
            </div>
          </div>

          <div class="founding-cost-card">
            <div class="cost-header">
              <span>Founding Cost</span>
              <strong class="cost-amount">500 CP</strong>
            </div>
            <p class="cost-desc">
              Founding registers your clan in the global registry and grants you permanent Guildmaster leadership privileges.
            </p>
          </div>

          <div id="create-clan-status" class="create-clan-status"></div>

          <button class="create-clan-submit-btn" id="btn-submit-create-clan">
            <span>FOUND CLAN (500 CP)</span>
          </button>
        </div>

      </div>
    </div>
  `;

  openModal(content, 'clan');

  // Back button to Gateway
  const backBtn = modalContainer.querySelector('#btn-back-to-clan-gate');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      sounds.playClick();
      openClanModal();
    });
  }

  // Live preview interactive elements
  const inputName = modalContainer.querySelector('#input-clan-name');
  const inputTag = modalContainer.querySelector('#input-clan-tag');
  const inputMotto = modalContainer.querySelector('#input-clan-motto');
  const selectPerk = modalContainer.querySelector('#select-clan-perk');
  const statusEl = modalContainer.querySelector('#create-clan-status');

  const previewName = modalContainer.querySelector('#preview-name');
  const previewTag = modalContainer.querySelector('#preview-tag');
  const previewBuff = modalContainer.querySelector('#preview-buff');
  const previewDesc = modalContainer.querySelector('#preview-desc');
  const previewIcon = modalContainer.querySelector('#preview-icon-box');

  function updatePreview() {
    const nameVal = inputName.value.trim() || 'Quantum Knights';
    let tagVal = inputTag.value.trim().toUpperCase() || 'QTM';
    if (!tagVal.startsWith('[')) tagVal = `[${tagVal}]`;

    previewName.textContent = nameVal;
    previewTag.textContent = tagVal;
    previewBuff.textContent = `🔥 ${perks[selectedPerkIdx].title}`;
    previewDesc.textContent = inputMotto.value.trim() || perks[selectedPerkIdx].desc;
    previewIcon.textContent = selectedEmblem;
    previewIcon.style.borderColor = selectedColor;
    previewIcon.style.boxShadow = `0 0 16px ${selectedColor}55`;
  }

  if (inputName) inputName.addEventListener('input', updatePreview);
  if (inputTag) inputTag.addEventListener('input', () => {
    // Keep tag clean and uppercase
    inputTag.value = inputTag.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    updatePreview();
  });
  if (inputMotto) inputMotto.addEventListener('input', updatePreview);
  if (selectPerk) selectPerk.addEventListener('change', (e) => {
    selectedPerkIdx = parseInt(e.target.value, 10) || 0;
    updatePreview();
  });

  // Emblem picker selection
  const emblemBtns = modalContainer.querySelectorAll('.emblem-option');
  emblemBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.playHover();
      emblemBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedEmblem = btn.getAttribute('data-emblem');
      updatePreview();
    });
  });

  // Color swatches selection
  const colorBtns = modalContainer.querySelectorAll('.color-swatch');
  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.playHover();
      colorBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedColor = btn.getAttribute('data-color');
      updatePreview();
    });
  });

  // Submit clan creation
  const submitBtn = modalContainer.querySelector('#btn-submit-create-clan');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const name = inputName.value.trim();
      let tag = inputTag.value.trim().toUpperCase();

      if (!name || name.length < 3) {
        statusEl.className = 'create-clan-status error';
        statusEl.textContent = 'Please enter a valid clan name (at least 3 characters).';
        inputName.focus();
        return;
      }

      if (!tag || tag.length < 2) {
        statusEl.className = 'create-clan-status error';
        statusEl.textContent = 'Please enter a clan tag (2-5 characters).';
        inputTag.focus();
        return;
      }

      const cost = 500;
      if (gameState.player.codePoints < cost) {
        statusEl.className = 'create-clan-status error';
        statusEl.textContent = `Insufficient Code Points! You need ${cost} CP to establish a clan (Current: ${gameState.player.codePoints} CP).`;
        return;
      }

      // Format tag
      if (!tag.startsWith('[')) tag = `[${tag}]`;

      // Deduct CP
      gameState.player.codePoints -= cost;

      // Unjoin previous clans
      gameState.clanRoster.forEach(c => c.joined = false);

      // Create new clan
      const newClan = {
        id: `clan_${Date.now()}`,
        name: name,
        tag: tag,
        members: "1 / 50",
        leader: gameState.player.name,
        rating: "10,000 CP",
        buff: perks[selectedPerkIdx].title,
        perk: inputMotto.value.trim() || perks[selectedPerkIdx].desc,
        joined: true,
        bannerColor: selectedColor,
        icon: selectedEmblem
      };

      gameState.clanRoster.unshift(newClan);
      gameState.player.clan = newClan.name;
      saveState();

      sounds.playReward();
      if (updateHudCallback) updateHudCallback();

      // Show success feedback and then take player to the browse list
      statusEl.className = 'create-clan-status success';
      statusEl.textContent = `🎉 Clan "${newClan.name}" established successfully!`;
      submitBtn.disabled = true;

      setTimeout(() => {
        openJoinClanView();
      }, 900);
    });
  }
}

// 6. REPO (BOX) MODAL
export function openRepoModal() {
  const itemsHtml = gameState.repoDecks.map(item => `
    <div class="repo-card-item">
      <div class="repo-header-row">
        <span class="repo-category">${item.category}</span>
        <span class="repo-complexity">${item.complexity}</span>
      </div>
      <h4 class="repo-name">${item.name}</h4>
      <div class="repo-code-preview">
        <code>${item.snippet}</code>
      </div>
      <div class="repo-footer-row">
        <span class="repo-mastery">⭐ ${item.mastery}</span>
        <span class="repo-status-pill">${item.status}</span>
      </div>
    </div>
  `).join('');

  const content = `
    <div class="modal-header repo-header">
      <div class="modal-title-wrap">
        <span class="modal-badge-tag purple-tag">CODE VAULT</span>
        <h2 class="modal-title">ALGORITHM REPOSITORY</h2>
      </div>
      <div class="header-stat">
        <span>Combat Decks</span>
        <strong>4 / 12 SLOTS</strong>
      </div>
    </div>
    <div class="modal-body">
      <div class="repo-grid">
        ${itemsHtml}
      </div>
    </div>
  `;

  openModal(content, 'repo');
}

// 7. TRAIN MODAL
export function openTrainModal() {
  const q = gameState.trainQuestions[Math.floor(Math.random() * gameState.trainQuestions.length)];

  const content = `
    <div class="modal-header train-header">
      <div class="modal-title-wrap">
        <span class="modal-badge-tag orange-tag">KATA DOJO</span>
        <h2 class="modal-title">DAILY CODE SPARRING</h2>
      </div>
      <div class="header-stat">
        <span>Coach Status</span>
        <strong style="color: #10B981">ADA SUPERVISING</strong>
      </div>
    </div>
    <div class="modal-body">
      <div class="quiz-container">
        <div class="quiz-question-card">
          <span class="quiz-badge">${q.title}</span>
          <h3 class="quiz-prompt">${q.prompt}</h3>
        </div>
        <div class="quiz-options-list">
          ${q.options.map((opt, i) => `
            <button class="quiz-option-btn" data-correct="${opt.correct}">
              <span class="opt-letter">${String.fromCharCode(65 + i)}</span>
              <span class="opt-text">${opt.text}</span>
            </button>
          `).join('')}
        </div>
        <div id="quiz-feedback" class="quiz-feedback hidden"></div>
      </div>
    </div>
  `;

  openModal(content, 'train');

  const options = modalContainer.querySelectorAll('.quiz-option-btn');
  const feedback = modalContainer.querySelector('#quiz-feedback');

  options.forEach(btn => {
    btn.addEventListener('click', () => {
      const isCorrect = btn.getAttribute('data-correct') === 'true';
      options.forEach(b => b.disabled = true);

      if (isCorrect) {
        btn.classList.add('correct');
        sounds.playReward();
        feedback.className = 'quiz-feedback success';
        feedback.innerHTML = `
          <h4>🎯 EXCELLENT STRIKE! (+100 CP, +20 XP)</h4>
          <p>${q.explanation}</p>
        `;
        gameState.player.codePoints += 100;
        gameState.player.xp += 20;

        const m = gameState.missions.find(m => m.id === 'm1');
        if (m) { m.completed = true; m.progress = 1; }

        if (updateHudCallback) updateHudCallback();
      } else {
        btn.classList.add('incorrect');
        sounds.playHover();
        feedback.className = 'quiz-feedback error';
        feedback.innerHTML = `
          <h4>⚠️ SYNTAX BLOCKED!</h4>
          <p>${q.explanation}</p>
        `;
      }
      feedback.classList.remove('hidden');
    });
  });
}

// 8. SHOP MODAL
export function openShopModal() {
  const itemsHtml = gameState.shopItems.map(item => `
    <div class="shop-item-card ${item.purchased ? 'purchased' : ''}">
      <div class="shop-item-icon">${item.icon}</div>
      <div class="shop-item-info">
        <span class="shop-item-cat">${item.category}</span>
        <h4>${item.name}</h4>
        <p>${item.desc}</p>
      </div>
      <div class="shop-item-action">
        ${item.purchased 
          ? `<span class="owned-pill">OWNED</span>`
          : `<button class="buy-item-btn" data-id="${item.id}" data-price="${item.price}">
              BUY (${item.price} CP)
            </button>`
        }
      </div>
    </div>
  `).join('');

  const content = `
    <div class="modal-header shop-header">
      <div class="modal-title-wrap">
        <span class="modal-badge-tag cyan-tag">CYBER EMPORIUM</span>
        <h2 class="modal-title">DEVELOPER GEAR SHOP</h2>
      </div>
      <div class="header-stat">
        <span>Balance</span>
        <strong style="color: #38BDF8">${gameState.player.codePoints.toLocaleString()} CP</strong>
      </div>
    </div>
    <div class="modal-body">
      <div class="shop-grid">
        ${itemsHtml}
      </div>
    </div>
  `;

  openModal(content, 'shop');

  const buyBtns = modalContainer.querySelectorAll('.buy-item-btn');
  buyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = gameState.shopItems.find(i => i.id === id);
      const price = parseInt(btn.getAttribute('data-price'));

      if (gameState.player.codePoints >= price) {
        gameState.player.codePoints -= price;
        item.purchased = true;
        sounds.playReward();
        if (updateHudCallback) updateHudCallback();
        openShopModal();
      } else {
        alert("Not enough Code Points! Win duels or complete missions.");
      }
    });
  });
}

// 9. MISSIONS MODAL
export function openMissionsModal() {
  const missionsHtml = gameState.missions.map(m => `
    <div class="mission-row ${m.completed ? 'completed' : ''}">
      <div class="mission-checkbox">${m.completed ? '✓' : '○'}</div>
      <div class="mission-details">
        <h4>${m.title}</h4>
        <p>${m.desc}</p>
        <div class="mission-reward-tag">Reward: ${m.reward}</div>
      </div>
      <div class="mission-action">
        ${m.claimed 
          ? `<span class="claimed-pill">CLAIMED</span>`
          : m.completed 
            ? `<button class="claim-reward-btn" data-id="${m.id}">CLAIM</button>`
            : `<span class="in-progress-pill">${m.progress}/${m.target}</span>`
        }
      </div>
    </div>
  `).join('');

  const content = `
    <div class="modal-header missions-header">
      <div class="modal-title-wrap">
        <span class="modal-badge-tag">DAILY PROTOCOLS</span>
        <h2 class="modal-title">ACTIVE MISSIONS</h2>
      </div>
      <p class="modal-desc">Complete daily development protocols to earn Code Points and level up your mastery.</p>
    </div>
    <div class="modal-body">
      <div class="missions-list">
        ${missionsHtml}
      </div>
    </div>
  `;

  openModal(content, 'missions');

  const claimBtns = modalContainer.querySelectorAll('.claim-reward-btn');
  claimBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const mission = gameState.missions.find(m => m.id === id);
      mission.claimed = true;
      sounds.playReward();
      gameState.player.codePoints += 200;
      gameState.player.xp += 25;
      if (updateHudCallback) updateHudCallback();
      openMissionsModal();
    });
  });
}

// 10. MAILBOX MODAL
export function openMailboxModal() {
  const mailsHtml = gameState.mailbox.map(mail => `
    <div class="mail-item ${mail.read ? 'read' : 'unread'}">
      <div class="mail-status-dot"></div>
      <div class="mail-content-wrap">
        <div class="mail-top">
          <span class="mail-sender">${mail.sender}</span>
          <span class="mail-time">${mail.time}</span>
        </div>
        <h4 class="mail-subject">${mail.subject}</h4>
        <p class="mail-snippet">${mail.content}</p>
      </div>
    </div>
  `).join('');

  const content = `
    <div class="modal-header mailbox-header">
      <div class="modal-title-wrap">
        <span class="modal-badge-tag">INBOX TERMINAL</span>
        <h2 class="modal-title">COMMUNICATION FEED</h2>
      </div>
      <div class="header-stat">
        <span>Messages</span>
        <strong>${gameState.mailbox.length} TRANSMISSIONS</strong>
      </div>
    </div>
    <div class="modal-body">
      <div class="mailbox-list">
        ${mailsHtml}
      </div>
    </div>
  `;

  openModal(content, 'mailbox');

  gameState.mailbox.forEach(m => m.read = true);
  if (updateHudCallback) updateHudCallback();
}

// 11. STYLE MODAL
export function openStyleModal() {
  const themes = [
    { id: 'cyberpunk', name: 'Cyberpunk Neon (Default)', colors: ['#7C3AED', '#06B6D4', '#10B981'] },
    { id: 'synthwave', name: 'Synthwave 1984', colors: ['#FF007F', '#7928CA', '#00F0FF'] },
    { id: 'monokai', name: 'Monokai Pro Dark', colors: ['#A6E22E', '#F92672', '#66D9EF'] },
    { id: 'matrix', name: 'Matrix Terminal Green', colors: ['#00FF66', '#0D3B22', '#003311'] }
  ];

  const themesHtml = themes.map(t => `
    <div class="theme-choice-card ${gameState.player.activeTheme === t.id ? 'active' : ''}" data-theme="${t.id}">
      <div class="theme-color-swatches">
        ${t.colors.map(c => `<span class="swatch" style="background:${c}"></span>`).join('')}
      </div>
      <h4>${t.name}</h4>
      <button class="apply-theme-btn">${gameState.player.activeTheme === t.id ? 'APPLIED' : 'EQUIP'}</button>
    </div>
  `).join('');

  const content = `
    <div class="modal-header style-header">
      <div class="modal-title-wrap">
        <span class="modal-badge-tag">CUSTOMIZER</span>
        <h2 class="modal-title">STYLE & THEMES</h2>
      </div>
      <p class="modal-desc">Customize HUD appearance, neon glow accents, and coach cockpit shaders.</p>
    </div>
    <div class="modal-body">
      <div class="themes-grid">
        ${themesHtml}
      </div>
    </div>
  `;

  openModal(content, 'style');

  const themeCards = modalContainer.querySelectorAll('.theme-choice-card');
  themeCards.forEach(card => {
    card.addEventListener('click', () => {
      const themeId = card.getAttribute('data-theme');
      gameState.player.activeTheme = themeId;
      document.body.setAttribute('data-theme', themeId);
      sounds.playClick();
      openStyleModal();
    });
  });
}

// 12. SUBMENU MODAL
export function openSubmenuModal() {
  const leaderboardHtml = gameState.leaderboard.map(u => `
    <div class="lb-row ${u.name.includes('(You)') ? 'current-user' : ''}">
      <span class="lb-rank">#${u.rank}</span>
      <div class="lb-details">
        <strong>${u.name}</strong>
        <span class="lb-title">${u.title}</span>
      </div>
      <span class="lb-elo">${u.rating}</span>
    </div>
  `).join('');

  const content = `
    <div class="modal-header submenu-header">
      <div class="modal-title-wrap">
        <span class="modal-badge-tag">COMMAND DECK</span>
        <h2 class="modal-title">SUBMENU & SETTINGS</h2>
      </div>
    </div>
    <div class="modal-body">
      <div class="submenu-layout">
        <div class="submenu-column">
          <h4 class="section-title">GLOBAL LEADERBOARD</h4>
          <div class="leaderboard-table">
            ${leaderboardHtml}
          </div>
        </div>
        <div class="submenu-column settings-panel">
          <h4 class="section-title">SYSTEM PREFERENCES</h4>
          <div class="setting-item">
            <span>Littleroot Town BGM</span>
            <button id="toggle-bgm-setting" class="setting-toggle-btn">
              ${sounds.bgmEnabled ? 'PLAYING' : 'PAUSED'}
            </button>
          </div>
          <div class="setting-item">
            <span>Tactical Sound FX</span>
            <button id="toggle-sound-setting" class="setting-toggle-btn">
              ${sounds.enabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>
          <div class="setting-item">
            <span>Clash of Code Engine</span>
            <span class="setting-val">v2.4.0-CHAMPION</span>
          </div>
          <div class="about-box">
            <p>Clash of Code is an AI-powered gamified learning platform for software engineers. Battle bugs, train algorithms, and level up with coach Ada.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  openModal(content, 'submenu');

  const soundBtn = modalContainer.querySelector('#toggle-sound-setting');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      sounds.enabled = !sounds.enabled;
      soundBtn.textContent = sounds.enabled ? 'ENABLED' : 'MUTED';
      if (updateHudCallback) updateHudCallback();
    });
  }

  const bgmBtn = modalContainer.querySelector('#toggle-bgm-setting');
  if (bgmBtn) {
    bgmBtn.addEventListener('click', () => {
      const isPlaying = sounds.toggleBGM();
      bgmBtn.textContent = isPlaying ? 'PLAYING' : 'PAUSED';
    });
  }
}

// 13. LEVEL PROGRESSION MODAL
export function openRankModal() {
  const content = `
    <div class="modal-header rank-header">
      <div class="modal-title-wrap">
        <span class="modal-badge-tag">MASTERY TIER</span>
        <h2 class="modal-title">LEVEL PROGRESSION</h2>
      </div>
      <div class="header-stat">
        <span>Current Tier</span>
        <strong style="color: #A78BFA">LEVEL ${gameState.player.level}</strong>
      </div>
    </div>
    <div class="modal-body">
      <div class="rank-modal-content">
        <div class="rank-large-badge">
          <span class="rank-num">${gameState.player.level}</span>
          <span class="rank-tier-name">${gameState.player.title}</span>
        </div>
        <div class="rank-bar-wrap">
          <div class="rank-bar-label">
            <span>Current EXP: ${gameState.player.xp} / ${gameState.player.maxXp} XP</span>
            <span>${Math.round((gameState.player.xp / gameState.player.maxXp) * 100)}%</span>
          </div>
          <div class="rank-progress-track">
            <div class="rank-progress-fill" style="width: ${(gameState.player.xp / gameState.player.maxXp) * 100}%"></div>
          </div>
        </div>
        <div class="rank-unlocks-box">
          <h4>UPCOMING REWARDS AT LEVEL 9:</h4>
          <ul>
            <li>🔓 Unlocks: <strong>Quantum Computing & Dynamic Programming Master Decks</strong></li>
            <li>🪙 Bonus: <strong>+1,000 Code Points</strong></li>
            <li>🎨 Unlocks: <strong>Holographic Golden Visor for Coach Ada</strong></li>
          </ul>
        </div>
      </div>
    </div>
  `;

  openModal(content, 'rank');
}
