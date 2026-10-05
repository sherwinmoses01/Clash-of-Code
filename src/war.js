// ==========================================================================
// Clash of Code - Massive 50-Territory Clan War Engine (war.html)
// 7-Day Weekly Syndicate Raid with 5-Attempts Limit per Member
// ==========================================================================

import {
  gameState,
  saveState,
  resetClanWar,
  addPlayerXp,
  addPlayerCodePoints,
  normalizePlayerLevel
} from './data.js';
import { sounds, spawnCrosshair } from './audio.js';
import {
  initClanWarRoom,
  subscribeToGameRoom,
  writeTerritoryConquest,
  getRoomIdFromUrl,
  generateRoomId,
  copyRoomLink,
  getLatencyVisualStatus,
  applyStateInterpolation
} from './db.js';
import {
  runProblemTestsWithGemini,
  getGeminiHint,
  isGeminiConfigured
} from './gemini.js';
import { initAuthUI } from './auth.js';

// Multi-language template bank for Clan War JDoodle Cloud execution
const PYTHON_TEMPLATES = {
  twoSum: `def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in seen:\n            return [seen[diff], i]\n        seen[n] = i\n    return []`,
  isValid: `def isValid(s):\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for ch in s:\n        if ch in mapping.values():\n            stack.append(ch)\n        elif ch in mapping:\n            if not stack or stack.pop() != mapping[ch]:\n                return False\n    return len(stack) == 0`,
  maxSubArray: `def maxSubArray(nums):\n    cur = max_s = nums[0]\n    for n in nums[1:]:\n        cur = max(n, cur + n)\n        max_s = max(max_s, cur)\n    return max_s`,
  search: `def search(nums, target):\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        mid = (l + r) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            l = mid + 1\n        else:\n            r = mid - 1\n    return -1`,
  mergeIntervals: `def mergeIntervals(intervals):\n    if not intervals:\n        return []\n    intervals.sort(key=lambda x: x[0])\n    res = [intervals[0]]\n    for cur in intervals[1:]:\n        if cur[0] <= res[-1][1]:\n            res[-1][1] = max(res[-1][1], cur[1])\n        else:\n            res.append(cur)\n    return res`,
  solve: `def solve():\n    return True`
};

// Active Clan War Room & Realtime State
let currentWarRoomId = null;
let unsubscribeWarRoom = null;

// ==================== 50-TERRITORY CONTINENT GENERATION ====================
const SECTOR_NAMES = [
  "West Citadel Cape", "Cascadia Peninsula", "Silicon Coast", "Pacifica Highlands", "Sierra Vista Reach",
  "Northern Fjordland", "Olympus Basin", "Redwood Valley", "Mojave Desert Flats", "Sonora Foothills",
  "Yukon Crest", "Great Basin Divide", "Salt Flats Range", "Colorado Canyon", "Rio Grande Delta",
  "Prairie Redoubt", "Black Hills Pass", "Dakota Steppes", "Platte River Basin", "Ozark Plateau",
  "Boreal Heartlands", "Superior Ridge", "Badlands Core", "Mississippi Valley", "Gulf Coastal Reach",
  "Huron Archipelago", "Great Lakes Delta", "Wabash Lowlands", "Cumberland Gap", "Bayou Wetlands",
  "Ontario Shoreline", "Erie Frontier", "Ohio Riverlands", "Appalachian Pass", "Blue Ridge Divide",
  "Adirondack Spire", "Allegheny Plateau", "Shenandoah Valley", "Piedmont Hills", "Atlantic Tidewater",
  "St. Lawrence Rift", "Hudson River Reach", "Susquehanna Basin", "Chesapeake Bay", "Cape Hatteras Point",
  "Acadia Promontory", "Bay of Fundy Sound", "Massachusetts Cape", "Dragon's Teeth Ridge", "Dragon Core Cape"
];

const PROBLEM_BANK = [
  {
    title: "Two-Sum Target Finder",
    category: "ARRAYS & HASH",
    difficulty: "EASY",
    diffClass: "diff-easy",
    description: "Given an integer array <code>nums</code> and an integer <code>target</code>, return an array of the indices of the two numbers such that they add up to <code>target</code>. Exactly one valid solution exists.",
    exampleIn: "nums = [2, 7, 11, 15], target = 9",
    exampleOut: "[0, 1]",
    exampleNote: "nums[0] + nums[1] = 2 + 7 = 9",
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Exactly one valid answer exists"],
    template: `function twoSum(nums, target) {
  // Return [index1, index2]
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    tests: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[3, 2, 4], 6], expected: [1, 2] },
      { args: [[3, 3], 6], expected: [0, 1] }
    ],
    fnName: "twoSum"
  },
  {
    title: "Valid Parentheses Validator",
    category: "STACK",
    difficulty: "EASY",
    diffClass: "diff-easy",
    description: "Given a string <code>s</code> containing characters '(', ')', '{', '}', '[' and ']', determine if the input string is syntactically valid.",
    exampleIn: "s = '()[]{}'",
    exampleOut: "true",
    exampleNote: "All brackets closed in correct order",
    constraints: ["1 <= s.length <= 10^4", "s consists only of '()[]{}'"],
    template: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const ch of s) {
    if (ch === '(' || ch === '{' || ch === '[') {
      stack.push(ch);
    } else {
      if (stack.pop() !== map[ch]) return false;
    }
  }
  return stack.length === 0;
}`,
    tests: [
      { args: ["()[]{}"], expected: true },
      { args: ["(]"], expected: false },
      { args: ["{[]}"], expected: true }
    ],
    fnName: "isValid"
  },
  {
    title: "Maximum Subarray Sum (Kadane)",
    category: "DYNAMIC PROGRAMMING",
    difficulty: "MEDIUM",
    diffClass: "diff-medium",
    description: "Given an integer array <code>nums</code>, find the contiguous subarray which has the largest sum and return its sum.",
    exampleIn: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
    exampleOut: "6",
    exampleNote: "The contiguous subarray [4,-1,2,1] has the largest sum = 6",
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    template: `function maxSubArray(nums) {
  let curSum = nums[0];
  let maxSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    curSum = Math.max(nums[i], curSum + nums[i]);
    maxSum = Math.max(maxSum, curSum);
  }
  return maxSum;
}`,
    tests: [
      { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { args: [[1]], expected: 1 },
      { args: [[5, 4, -1, 7, 8]], expected: 23 }
    ],
    fnName: "maxSubArray"
  },
  {
    title: "Binary Search Target Index",
    category: "BINARY SEARCH",
    difficulty: "EASY",
    diffClass: "diff-easy",
    description: "Given an array of integers <code>nums</code> sorted in ascending order and a target value, search for target. If it exists, return its index. Otherwise return -1.",
    exampleIn: "nums = [-1,0,3,5,9,12], target = 9",
    exampleOut: "4",
    exampleNote: "9 exists in nums and its index is 4",
    constraints: ["1 <= nums.length <= 10^4", "All elements in nums are unique"],
    template: `function search(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    tests: [
      { args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 }
    ],
    fnName: "search"
  },
  {
    title: "Merge Overlapping Intervals",
    category: "INTERVALS",
    difficulty: "HARD",
    diffClass: "diff-hard",
    description: "Given an array of intervals where <code>intervals[i] = [start, end]</code>, merge all overlapping intervals into non-overlapping intervals.",
    exampleIn: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
    exampleOut: "[[1,6],[8,10],[15,18]]",
    exampleNote: "Intervals [1,3] and [2,6] overlap, merging into [1,6]",
    constraints: ["1 <= intervals.length <= 10^4", "intervals[i].length == 2"],
    template: `function mergeIntervals(intervals) {
  if (intervals.length <= 1) return intervals;
  intervals.sort((a, b) => a[0] - b[0]);
  const result = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const prev = result[result.length - 1];
    const curr = intervals[i];
    if (curr[0] <= prev[1]) {
      prev[1] = Math.max(prev[1], curr[1]);
    } else {
      result.push(curr);
    }
  }
  return result;
}`,
    tests: [
      { args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
      { args: [[[1, 4], [4, 5]]], expected: [[1, 5]] }
    ],
    fnName: "mergeIntervals"
  }
];

// Stored continental vertices lattice and perimeter path
let continentVertices = [];
let continentPerimeterPath = "";

// Generate 50 realistic, organic land territories with shared state boundaries
function build50Territories() {
  const list = [];
  const COLS = 10;
  const ROWS = 5;
  continentVertices = [];

  // Generate 11x6 organic continental vertex mesh spanning 1500 x 780 viewBox
  for (let c = 0; c <= COLS; c++) {
    continentVertices[c] = [];
    const u = c / COLS; // 0.0 (West) to 1.0 (East)
    const baseX = 75 + u * 1350;

    for (let r = 0; r <= ROWS; r++) {
      const v = r / ROWS; // 0.0 (North) to 1.0 (South)

      // Continental envelope: wide in the middle, narrowing at capes on the flanks
      const taper = Math.sin(u * Math.PI);
      const verticalSpan = 470 + 190 * Math.pow(taper, 0.55);
      const midY = 385 + 28 * Math.sin(u * Math.PI * 2);

      let y = (midY - verticalSpan / 2) + v * verticalSpan;
      let x = baseX;

      // Organic geographic coastal features
      // 1. Northwest Fjord Inlet (c=1..3, r=0)
      if (c >= 1 && c <= 3 && r === 0) {
        y += 50 * Math.sin(((c - 1) / 2) * Math.PI);
      }
      // 2. Southwest Bay of Cascadia (c=2..4, r=ROWS)
      if (c >= 2 && c <= 4 && r === ROWS) {
        y -= 60 * Math.sin(((c - 2) / 2) * Math.PI);
        x += 22;
      }
      // 3. Central Great Southern Gulf (c=5..7, r=ROWS)
      if (c >= 5 && c <= 7 && r === ROWS) {
        y -= 75 * Math.sin(((c - 5) / 2) * Math.PI);
      }
      // 4. Northeast Dragon Sea Promontory (c=7..9, r=0)
      if (c >= 7 && c <= 9 && r === 0) {
        y -= 45 * Math.sin(((c - 7) / 2) * Math.PI);
      }
      // 5. Eastern Dragon's Fang Cape (c=COLS, r=2..3)
      if (c === COLS && (r === 2 || r === 3)) {
        x += 42;
      }
      // 6. Western Cape of Alliance (c=0, r=2)
      if (c === 0 && r === 2) {
        x -= 32;
      }

      // Internal natural land jitter (rivers, mountain passes, natural state borders)
      if (c > 0 && c < COLS) {
        const jitterX = Math.sin(c * 3.7 + r * 5.3) * 18 + Math.cos(r * 4.1) * 12;
        x += jitterX;
      }
      if (r > 0 && r < ROWS) {
        const jitterY = Math.cos(c * 4.9 + r * 2.8) * 16 + Math.sin(c * 2.3) * 10;
        y += jitterY;
      }

      continentVertices[c][r] = { x: Math.round(x), y: Math.round(y) };
    }
  }

  // Build outer continental perimeter path
  const perimeterPoints = [];
  // Top edge: West to East
  for (let c = 0; c <= COLS; c++) perimeterPoints.push(continentVertices[c][0]);
  // Right edge: North to South
  for (let r = 1; r <= ROWS; r++) perimeterPoints.push(continentVertices[COLS][r]);
  // Bottom edge: East to West
  for (let c = COLS - 1; c >= 0; c--) perimeterPoints.push(continentVertices[c][ROWS]);
  // Left edge: South to North
  for (let r = ROWS - 1; r >= 1; r--) perimeterPoints.push(continentVertices[0][r]);

  continentPerimeterPath = perimeterPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`).join(' ') + ' Z';

  // Construct 50 territories from seamless shared vertex cells
  let idCounter = 1;
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const id = idCounter++;
      const p1 = continentVertices[c][r];
      const p2 = continentVertices[c+1][r];
      const p3 = continentVertices[c+1][r+1];
      const p4 = continentVertices[c][r+1];

      const cx = Math.round((p1.x + p2.x + p3.x + p4.x) / 4);
      const cy = Math.round((p1.y + p2.y + p3.y + p4.y) / 4);

      let owner = "neutral";
      let isBase = false;
      let flag = null;

      // West Base: ID 1 (User Home Base 🏁)
      // East Base: ID 50 (Enemy Base 🚩)
      if (id === 1) {
        owner = "user";
        isBase = true;
        flag = "🏁";
      } else if (id === 50) {
        owner = "enemy";
        isBase = true;
        flag = "🚩";
      }

      // Adjacency Neighbors (Orthogonal + Strategic natural passes)
      const neighbors = [];
      // Left
      if (c > 0) neighbors.push(id - ROWS);
      // Right
      if (c < COLS - 1) neighbors.push(id + ROWS);
      // Up
      if (r > 0) neighbors.push(id - 1);
      // Down
      if (r < ROWS - 1) neighbors.push(id + 1);

      // Natural mountain pass diagonal connections for strategic routing
      if (c < COLS - 1 && r < ROWS - 1 && (id % 3 === 0)) neighbors.push(id + ROWS + 1);
      if (c > 0 && r > 0 && (id % 4 === 0)) neighbors.push(id - ROWS - 1);

      const problem = PROBLEM_BANK[(id - 1) % PROBLEM_BANK.length];

      list.push({
        id,
        isOrganic: true,
        c,
        r,
        code: `SEC ${String(id).padStart(2, '0')}`,
        name: SECTOR_NAMES[id - 1] || `Sector ${id}`,
        shortName: (SECTOR_NAMES[id - 1] || `SEC ${id}`).toUpperCase(),
        points: `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`,
        cx,
        cy,
        owner,
        isBase,
        flag,
        neighbors,
        problem
      });
    }
  }

  return list;
}

// Global State for Clan War
let warTerritories = [];
let activeChallengeSector = null;
let warTimerInterval = null;
let enemyAiInterval = null;
let matchEnded = false;

// DOM Elements
const svgOceanLayer = document.getElementById('war-svg-ocean-contours');
const svgGeographyLayer = document.getElementById('war-svg-geography-layer');
const svgTerritoriesLayer = document.getElementById('war-svg-territories-layer');
const svgBeaconsLayer = document.getElementById('war-svg-beacons-layer');
const svgRoutesLayer = document.getElementById('war-svg-routes-layer');

const blueScoreEl = document.getElementById('war-blue-score');
const redScoreEl = document.getElementById('war-red-score');
const countdownEl = document.getElementById('war-countdown');
const teleBlue = document.getElementById('tele-war-blue');
const teleRed = document.getElementById('tele-war-red');
const teleNeutral = document.getElementById('tele-war-neutral');
const attemptsCountText = document.getElementById('attempts-count-text');
const toastEl = document.getElementById('tactical-notice-toast');
const toastText = document.getElementById('toast-text');
const toastIcon = document.getElementById('toast-icon');

// Modal Elements
const challengeOverlay = document.getElementById('challenge-modal-overlay');
const chalCode = document.getElementById('chal-territory-code');
const chalCategory = document.getElementById('chal-category');
const chalDiff = document.getElementById('chal-difficulty');
const chalTitle = document.getElementById('chal-title');
const chalDesc = document.getElementById('chal-description');
const chalExIn = document.getElementById('chal-example-in');
const chalExOut = document.getElementById('chal-example-out');
const chalExNote = document.getElementById('chal-example-note');
const chalConstraints = document.getElementById('chal-constraints');
const codeEditor = document.getElementById('code-editor-input');
const consoleOutput = document.getElementById('console-output-text');
const consoleStatus = document.getElementById('console-status-pill');
const modalAttemptTag = document.getElementById('modal-attempt-tag');
const editorLangSelect = document.getElementById('editor-lang-select');
const jdoodleStatusPill = document.getElementById('jdoodle-status-pill');

const btnRunTests = document.getElementById('btn-run-tests');
const btnSubmit = document.getElementById('btn-submit-solution');
const btnQuickSolve = document.getElementById('btn-quick-solve');
const btnCloseChal = document.getElementById('btn-close-challenge');

// Endgame Elements
const endgameOverlay = document.getElementById('endgame-modal-overlay');
const endgameHeadline = document.getElementById('endgame-headline');
const endgameSubline = document.getElementById('endgame-subline');
const finalBlue = document.getElementById('final-blue-count');
const finalRed = document.getElementById('final-red-count');
const btnReturnClanHq = document.getElementById('btn-return-clan-hq');

// Navigation & Audio Buttons
const btnWarBackClan = document.getElementById('btn-war-back-clan');
const btnResetWar = document.getElementById('btn-reset-war');
const btnToggleBgm = document.getElementById('btn-toggle-bgm');
const btnToggleSfx = document.getElementById('btn-toggle-sound');
const crosshairContainer = document.getElementById('crosshair-container');

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
  initAuthUI({ requireAuth: true });
  initWarState();
  renderWarMap();
  updateScores();
  updateAttemptsDisplay();
  start7DayTimer();
  startEnemyAI();

  // Click crosshair
  window.addEventListener('pointerdown', (e) => {
    spawnCrosshair(e.clientX, e.clientY, sounds, crosshairContainer);
    if (!sounds.bgmStarted && sounds.bgmEnabled) {
      sounds.startBGM();
    }
  });

  // --- CLAN WAR ROOM & REALTIME DATABASE INITIALIZATION ---
  currentWarRoomId = getRoomIdFromUrl() || (gameState.clanWar && gameState.clanWar.roomId) || generateRoomId('guild');
  if (gameState.clanWar) {
    gameState.clanWar.roomId = currentWarRoomId;
    saveState();
  }

  // Update browser URL query parameter seamlessly
  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.get('room') !== currentWarRoomId) {
    currentUrl.searchParams.set('room', currentWarRoomId);
    window.history.replaceState({}, '', currentUrl.toString());
  }

  // Bind Clan War Room HUD Pill
  const warRoomPill = document.getElementById('war-room-id-pill');
  const warRoomCodeText = document.getElementById('war-room-code-text');
  if (warRoomCodeText) {
    warRoomCodeText.textContent = currentWarRoomId;
  }
  if (warRoomPill) {
    warRoomPill.addEventListener('click', async () => {
      sounds.playClick();
      const ok = await copyRoomLink(currentWarRoomId);
      if (ok) {
        showToast(`Clan War Room Link Copied! (${currentWarRoomId})`, '📋');
      }
    });
  }

  // Initialize Clan War Room in Database
  const clanInfo = {
    homeClan: gameState.clanWar?.homeClan || { name: 'BitKnights' },
    rivalClan: gameState.clanWar?.rivalClan || { name: 'CyberDragons' }
  };
  await initClanWarRoom(currentWarRoomId, clanInfo, warTerritories);

  // Subscribe to Realtime Updates (Zero-Lag via requestAnimationFrame)
  unsubscribeWarRoom = subscribeToGameRoom({
    roomId: currentWarRoomId,
    table: 'clan_war_rooms',
    onStateUpdate: (roomData, isRemote) => {
      if (!roomData || !Array.isArray(roomData.territories)) return;
      let stateChanged = false;

      roomData.territories.forEach(remoteT => {
        const localT = warTerritories.find(t => t.id === remoteT.id);
        if (localT && localT.owner !== remoteT.owner) {
          localT.owner = remoteT.owner;
          stateChanged = true;

          // State Interpolation: smooth visual transition on changed sector
          if (isRemote) {
            const poly = document.getElementById(`war-poly-${localT.id}`);
            if (poly) applyStateInterpolation(poly, localT.owner);

            if (localT.owner === 'enemy') {
              sounds.playClick();
              showToast(`RIVAL ADVANCE: CyberDragons conquered ${localT.name}!`, '⚠️', true);
            } else if (localT.owner === 'user') {
              sounds.playReward();
              showToast(`SQUAD CONQUEST: Clan conquered ${localT.name}!`, '🎉');
            }
          }
        }
      });

      if (stateChanged) {
        gameState.clanWar.territories = warTerritories;
        saveState();
        renderWarMap();
        updateScores();
        checkWarVictoryCondition();
      }
    },
    onLatencyChange: (rttMs) => {
      const badge = document.getElementById('war-net-latency-badge');
      const text = document.getElementById('war-net-latency-text');
      if (badge && text) {
        const visual = getLatencyVisualStatus(rttMs);
        badge.className = `net-status-badge ${visual.badgeClass}`;
        text.textContent = visual.pingText;
      }
    }
  });

  // Modal actions
  if (btnCloseChal) btnCloseChal.addEventListener('click', closeChallengeModal);
  if (btnRunTests) btnRunTests.addEventListener('click', runCurrentTests);
  if (btnSubmit) btnSubmit.addEventListener('click', submitCurrentSolution);
  if (btnQuickSolve) btnQuickSolve.addEventListener('click', autoSolveCode);

  // Coach Ada AI Hint via Gemini 3.6 Flash
  const btnCoachHint = document.getElementById('btn-coach-hint');
  if (btnCoachHint) {
    btnCoachHint.addEventListener('click', async () => {
      if (!activeChallengeSector || !activeChallengeSector.problem) return;
      sounds.playClick();
      btnCoachHint.disabled = true;
      btnCoachHint.textContent = '⏳ THINKING...';
      try {
        const prob = activeChallengeSector.problem;
        const lang = editorLangSelect ? editorLangSelect.value : 'nodejs';
        const hint = await getGeminiHint(codeEditor.value, prob, lang);
        sounds.playReward();
        consoleOutput.innerHTML = `
          <div class="gemini-hint-box" style="background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.5); border-radius: 6px; padding: 10px 12px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; color: #C084FC; font-weight: bold; font-size: 0.8rem; margin-bottom: 4px;">
              <span>💡 COACH ADA [AI]:</span>
            </div>
            <div style="color: #F1F5F9; line-height: 1.45; font-size: 0.84rem;">${escapeHtml(hint)}</div>
          </div>
        ` + consoleOutput.innerHTML;
      } catch (err) {
        consoleOutput.innerHTML = `<div class="test-fail">⚠️ AI Hint error: ${escapeHtml(err.message)}</div>` + consoleOutput.innerHTML;
      } finally {
        btnCoachHint.disabled = false;
        btnCoachHint.textContent = '💡 AI HINT';
      }
    });
  }

  // Compiler Language Switcher
  if (editorLangSelect) {
    editorLangSelect.addEventListener('change', () => {
      if (!activeChallengeSector || !activeChallengeSector.problem) return;
      sounds.playClick();
      const p = activeChallengeSector.problem;
      const lang = editorLangSelect.value;
      if (lang === 'python3') {
        codeEditor.value = PYTHON_TEMPLATES[p.fnName] || `# Python 3 Solution\ndef ${p.fnName}(*args):\n    pass\n`;
      } else {
        codeEditor.value = p.template;
      }
    });
  }

  // Navigation
  if (btnWarBackClan) btnWarBackClan.addEventListener('click', () => {
    if (unsubscribeWarRoom) unsubscribeWarRoom();
    window.location.href = '/clan.html';
  });
  if (btnReturnClanHq) btnReturnClanHq.addEventListener('click', () => {
    if (unsubscribeWarRoom) unsubscribeWarRoom();
    window.location.href = '/clan.html';
  });
  if (btnResetWar) btnResetWar.addEventListener('click', concedeWar);

  // Clean up subscription on window unload
  window.addEventListener('beforeunload', () => {
    if (unsubscribeWarRoom) unsubscribeWarRoom();
  });

  // Audio toggles
  if (btnToggleBgm) {
    btnToggleBgm.addEventListener('click', () => {
      const on = sounds.toggleBGM();
      document.getElementById('bgm-icon').textContent = on ? '🎵' : '🔇';
    });
  }
  if (btnToggleSfx) {
    btnToggleSfx.addEventListener('click', () => {
      sounds.enabled = !sounds.enabled;
      document.getElementById('sfx-icon').textContent = sounds.enabled ? '🔊' : '🔈';
    });
  }

  // Check URL query param for instant testing (e.g. ?open=2)
  const params = new URLSearchParams(window.location.search);
  const openId = parseInt(params.get('open'));
  if (!isNaN(openId)) {
    const target = warTerritories.find(t => t.id === openId);
    if (target) {
      openChallengeModal(target);
    }
  }
});

// Initialize or load 50 territories from game state
function initWarState() {
  if (!gameState.clanWar) {
    gameState.clanWar = {
      isActive: true,
      startTime: Date.now(),
      durationMs: 7 * 24 * 60 * 60 * 1000,
      playerRole: "Leader",
      playerAttemptsRemaining: 5,
      maxAttempts: 5,
      territories: []
    };
  }

  // Ensure active flag is set
  if (!gameState.clanWar.isActive) {
    gameState.clanWar.isActive = true;
    gameState.clanWar.startTime = Date.now();
  }

  // Initialize territories if not already created (or upgrade to organic continent)
  if (!Array.isArray(gameState.clanWar.territories) || gameState.clanWar.territories.length !== 50 || !gameState.clanWar.territories[0]?.isOrganic) {
    gameState.clanWar.territories = build50Territories();
    saveState();
  }

  warTerritories = gameState.clanWar.territories;
}


// Tactical Toast Notification
let toastTimeout = null;
function showToast(message, icon = 'ℹ️', isError = false) {
  if (!toastEl) return;
  toastText.textContent = message;
  toastIcon.textContent = icon;
  toastEl.className = `tactical-notice-toast ${isError ? 'notice-error' : 'notice-success'}`;
  toastEl.classList.remove('hidden');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 3200);
}

// Adjacency Check: Is sector connected to Blue alliance frontline?
function isAdjacentToClan(territoryId) {
  const target = warTerritories.find(t => t.id === territoryId);
  if (!target) return false;
  return target.neighbors.some(nId => {
    const neighbor = warTerritories.find(t => t.id === nId);
    return neighbor && neighbor.owner === 'user';
  });
}

// Adjacency Check for Enemy AI
function isAdjacentToEnemy(territoryId) {
  const target = warTerritories.find(t => t.id === territoryId);
  if (!target) return false;
  return target.neighbors.some(nId => {
    const neighbor = warTerritories.find(t => t.id === nId);
    return neighbor && neighbor.owner === 'enemy';
  });
}

// ==================== RENDER REAL GEOGRAPHIC LAND CONTINENT ====================
function renderWarGeography() {
  if (!svgOceanLayer || !svgGeographyLayer) return;

  // 1. Ocean Depth Shelf / Bathymetry Contours & Landmass Base
  if (continentPerimeterPath) {
    let oceanHtml = `
      <!-- Ocean Graticules (Latitude & Longitude Coordinates) -->
      <g class="graticules-group">
        <line x1="40" y1="130" x2="1460" y2="130" class="geo-graticule-line" />
        <text x="50" y="124" class="geo-graticule-label">64° 00' N (ARCTIC FRONTIER)</text>
        <line x1="40" y1="390" x2="1460" y2="390" class="geo-graticule-line prime-parallel" />
        <text x="50" y="384" class="geo-graticule-label">45° 00' N (WAR ZONE EQUATOR)</text>
        <line x1="40" y1="650" x2="1460" y2="650" class="geo-graticule-line" />
        <text x="50" y="644" class="geo-graticule-label">28° 00' N (SOUTHERN SOUND)</text>

        <line x1="280" y1="40" x2="280" y2="740" class="geo-graticule-line" />
        <text x="285" y="735" class="geo-graticule-label">135° W</text>
        <line x1="750" y1="40" x2="750" y2="740" class="geo-graticule-line prime-meridian" />
        <text x="755" y="735" class="geo-graticule-label">90° W (CENTRAL MERIDIAN)</text>
        <line x1="1220" y1="40" x2="1220" y2="740" class="geo-graticule-line" />
        <text x="1225" y="735" class="geo-graticule-label">45° W</text>
      </g>

      <!-- Cartographic Water Body Toponyms / Watermarks -->
      <g class="ocean-labels-group">
        <text x="140" y="195" class="ocean-watermark-text">NORTH BOREAL SEA</text>
        <text x="1260" y="150" class="ocean-watermark-text">DRAGON DEEP ABYSS</text>
        <text x="160" y="720" class="ocean-watermark-text">PACIFIC TRENCH COAST</text>
        <text x="640" y="750" class="ocean-watermark-text">GREAT SOUTHERN GULF OF CODE</text>
        <text x="1210" y="715" class="ocean-watermark-text">MARE CYBERNETICA</text>
      </g>

      <!-- Concentric Ocean Shelf Bathymetry Rings -->
      <path d="${continentPerimeterPath}" class="ocean-contour-outer" />
      <path d="${continentPerimeterPath}" class="ocean-contour-mid" />
      <path d="${continentPerimeterPath}" class="ocean-contour-surf" />

      <!-- Continental Landmass Solid Base Underlay -->
      <path d="${continentPerimeterPath}" class="continent-landmass-base" />
    `;
    svgOceanLayer.innerHTML = oceanHtml;
  }

  // 2. Topographic Mountain Ridges & Meandering Vector Rivers
  let geoHtml = '';

  // Draw Natural Meandering River Systems (traced along lattice valleys)
  if (continentVertices && continentVertices.length >= 11) {
    // Cascadia Northwestern River
    const r1_0 = continentVertices[3][2];
    const r1_1 = continentVertices[2][2];
    const r1_2 = continentVertices[2][1];
    const r1_3 = continentVertices[1][1];
    const r1_4 = continentVertices[1][0];
    const river1D = `M ${r1_0.x},${r1_0.y} ` +
      `Q ${r1_1.x},${r1_1.y} ${r1_2.x},${r1_2.y} ` +
      `Q ${r1_3.x},${r1_3.y} ${r1_4.x},${r1_4.y}`;

    // Great Continental Divide River (Flows South into Great Gulf)
    const r2_0 = continentVertices[5][1];
    const r2_1 = continentVertices[5][2];
    const r2_2 = continentVertices[5][3];
    const r2_3 = continentVertices[6][4];
    const r2_4 = continentVertices[6][5];
    const river2D = `M ${r2_0.x},${r2_0.y} ` +
      `Q ${r2_1.x},${r2_1.y} ${r2_2.x},${r2_2.y} ` +
      `Q ${r2_3.x},${r2_3.y} ${r2_4.x},${r2_4.y}`;

    // Eastern Appalachian / St. Lawrence Estuary
    const r3_0 = continentVertices[7][2];
    const r3_1 = continentVertices[8][2];
    const r3_2 = continentVertices[9][1];
    const r3_3 = continentVertices[10][1];
    const river3D = `M ${r3_0.x},${r3_0.y} ` +
      `Q ${r3_1.x},${r3_1.y} ${r3_2.x},${r3_2.y} ` +
      `Q ${r3_2.x + 20},${r3_2.y - 12} ${r3_3.x},${r3_3.y}`;

    geoHtml += `
      <!-- Glowing Vector River Systems -->
      <g class="geo-rivers-group">
        <path d="${river1D}" class="geo-river-glow" />
        <path d="${river1D}" class="geo-river-path" />
        <path d="${river2D}" class="geo-river-glow" />
        <path d="${river2D}" class="geo-river-path" />
        <path d="${river3D}" class="geo-river-glow" />
        <path d="${river3D}" class="geo-river-path" />
      </g>
    `;

    // Mountain Ranges (Shaded relief peaks along high continental divides)
    const mountainSpines = [
      // West Range (Sierra / Cascadia)
      { x: (continentVertices[2][2].x + continentVertices[3][2].x) / 2, y: (continentVertices[2][2].y + continentVertices[3][2].y) / 2 - 14, label: "SIERRA CREST" },
      { x: (continentVertices[2][3].x + continentVertices[3][3].x) / 2 - 15, y: (continentVertices[2][3].y + continentVertices[3][3].y) / 2 - 10, label: "" },
      { x: (continentVertices[3][1].x + continentVertices[4][1].x) / 2, y: (continentVertices[3][1].y + continentVertices[4][1].y) / 2, label: "" },
      // Central Divide
      { x: (continentVertices[5][2].x + continentVertices[6][2].x) / 2 + 10, y: (continentVertices[5][2].y + continentVertices[6][2].y) / 2 - 18, label: "GREAT DIVIDE" },
      { x: (continentVertices[5][3].x + continentVertices[6][3].x) / 2 + 8, y: (continentVertices[5][3].y + continentVertices[6][3].y) / 2 + 5, label: "" },
      // East Range (Appalachians / Dragon's Teeth)
      { x: (continentVertices[7][2].x + continentVertices[8][2].x) / 2, y: (continentVertices[7][2].y + continentVertices[8][2].y) / 2 - 15, label: "BLUE RIDGE" },
      { x: (continentVertices[8][3].x + continentVertices[9][3].x) / 2 + 10, y: (continentVertices[8][3].y + continentVertices[9][3].y) / 2 - 8, label: "DRAGON TEETH" },
      { x: (continentVertices[8][1].x + continentVertices[9][1].x) / 2 - 10, y: (continentVertices[8][1].y + continentVertices[9][1].y) / 2 + 8, label: "" }
    ];

    geoHtml += `<g class="geo-mountains-group">`;
    mountainSpines.forEach(m => {
      const p1 = { x: m.x, y: m.y, w: 14, h: 18 };
      const p2 = { x: m.x - 12, y: m.y + 4, w: 11, h: 14 };
      const p3 = { x: m.x + 12, y: m.y + 5, w: 12, h: 15 };

      [p2, p1, p3].forEach(p => {
        geoHtml += `
          <polygon points="${p.x},${p.y - p.h} ${p.x - p.w},${p.y + p.h * 0.4} ${p.x + p.w},${p.y + p.h * 0.4}" class="geo-mountain-base" />
          <polygon points="${p.x},${p.y - p.h} ${p.x},${p.y + p.h * 0.4} ${p.x + p.w},${p.y + p.h * 0.4}" class="geo-mountain-shade" />
          <polyline points="${p.x - p.w},${p.y + p.h * 0.4} ${p.x},${p.y - p.h} ${p.x + p.w},${p.y + p.h * 0.4}" class="geo-mountain-ridge" />
        `;
      });

      if (m.label) {
        geoHtml += `<text x="${m.x}" y="${m.y - 20}" class="geo-mountain-label">${m.label}</text>`;
      }
    });
    geoHtml += `</g>`;
  }

  // 3. Nautical Compass Rose in North-West Sea
  const cx = 110;
  const cy = 90;
  geoHtml += `
    <g class="geo-compass-rose" transform="translate(${cx}, ${cy})">
      <!-- Outer Compass Rings -->
      <circle cx="0" cy="0" r="44" class="compass-outer-ring" />
      <circle cx="0" cy="0" r="38" class="compass-inner-ring" />
      <circle cx="0" cy="0" r="3" class="compass-center-dot" />

      <!-- Compass Ticks -->
      <line x1="0" y1="-44" x2="0" y2="-38" class="compass-tick" />
      <line x1="0" y1="44" x2="0" y2="38" class="compass-tick" />
      <line x1="-44" y1="0" x2="-38" y2="0" class="compass-tick" />
      <line x1="44" y1="0" x2="38" y2="0" class="compass-tick" />

      <!-- 8-Point Compass Star -->
      <!-- North (Gold Major) -->
      <polygon points="0,-36 4,-6 0,0" class="compass-point-gold" />
      <polygon points="0,-36 -4,-6 0,0" class="compass-point-dark" />
      <!-- South -->
      <polygon points="0,32 -3,6 0,0" class="compass-point-cyan" />
      <polygon points="0,32 3,6 0,0" class="compass-point-dark" />
      <!-- East -->
      <polygon points="32,0 6,3 0,0" class="compass-point-cyan" />
      <polygon points="32,0 6,-3 0,0" class="compass-point-dark" />
      <!-- West -->
      <polygon points="-32,0 -6,-3 0,0" class="compass-point-cyan" />
      <polygon points="-32,0 -6,3 0,0" class="compass-point-dark" />

      <!-- Diagonal Minor Points -->
      <polygon points="18,-18 4,-2 0,0" class="compass-point-minor" />
      <polygon points="-18,-18 -2,-4 0,0" class="compass-point-minor" />
      <polygon points="18,18 2,4 0,0" class="compass-point-minor" />
      <polygon points="-18,18 -4,2 0,0" class="compass-point-minor" />

      <!-- Cardinal Direction Letters -->
      <text x="0" y="-48" class="compass-cardinal compass-north">N</text>
      <text x="0" y="56" class="compass-cardinal">S</text>
      <text x="50" y="4" class="compass-cardinal">E</text>
      <text x="-50" y="4" class="compass-cardinal">W</text>
      <text x="0" y="-2" class="compass-sub-label">WAR-GRID</text>
    </g>
  `;

  svgGeographyLayer.innerHTML = geoHtml;
}

// ==================== RENDER 50-TERRITORY MAP ====================
function renderWarMap() {
  if (!svgTerritoriesLayer || !svgBeaconsLayer || !svgRoutesLayer) return;

  // 0. Render Ocean Shelf Bathymetry, Topography, Rivers & Compass
  renderWarGeography();

  // 1. Render connecting frontline adjacency vectors
  let routesHtml = '';
  const drawnEdges = new Set();

  warTerritories.forEach(t => {
    t.neighbors.forEach(nId => {
      const neighbor = warTerritories.find(item => item.id === nId);
      if (!neighbor) return;

      const edgeKey = [Math.min(t.id, nId), Math.max(t.id, nId)].join('-');
      if (!drawnEdges.has(edgeKey)) {
        drawnEdges.add(edgeKey);

        const isUserLine = (t.owner === 'user' && neighbor.owner === 'user');
        const isEnemyLine = (t.owner === 'enemy' && neighbor.owner === 'enemy');
        const isContested = (t.owner === 'user' && neighbor.owner === 'enemy') || (t.owner === 'enemy' && neighbor.owner === 'user');

        let lineClass = "svg-route-line";
        if (isUserLine) lineClass += " line-user";
        else if (isEnemyLine) lineClass += " line-enemy";
        else if (isContested) lineClass += " line-contested";

        routesHtml += `
          <line x1="${t.cx}" y1="${t.cy}" x2="${neighbor.cx}" y2="${neighbor.cy}" class="${lineClass}" />
        `;
      }
    });
  });
  svgRoutesLayer.innerHTML = routesHtml;

  // 2. Render 50 Territory Polygons (Crisp White Outlines)
  let territoriesHtml = '';
  let beaconsHtml = '';

  warTerritories.forEach(t => {
    const isAdjacent = isAdjacentToClan(t.id);
    const isUser = (t.owner === 'user');
    const isEnemy = (t.owner === 'enemy');
    const isNeutral = (t.owner === 'neutral');

    let polygonClass = "territory-polygon";
    if (isUser) polygonClass += " territory-blue";
    else if (isEnemy) polygonClass += " territory-red";
    else polygonClass += " territory-neutral";

    if (isNeutral && isAdjacent) {
      polygonClass += " territory-adjacent-accessible";
    }

    territoriesHtml += `
      <polygon 
        points="${t.points}" 
        class="${polygonClass}" 
        id="war-poly-${t.id}"
        data-id="${t.id}"
      />
    `;

    // 3. Render Beacons & Dots
    let dotClass = "territory-beacon-group war-beacon-group";
    if (isUser) dotClass += " owner-blue";
    else if (isEnemy) dotClass += " owner-red";
    else if (isAdjacent) dotClass += " status-ready-pulse";
    else dotClass += " status-locked";

    let markerSymbol = "";
    if (t.isBase) {
      markerSymbol = `<text x="${t.cx}" y="${t.cy + 5}" class="flag-text">${t.flag}</text>`;
    } else if (isUser) {
      markerSymbol = `<text x="${t.cx}" y="${t.cy + 4}" class="beacon-label">✓</text>`;
    } else if (isEnemy) {
      markerSymbol = `<text x="${t.cx}" y="${t.cy + 4}" class="beacon-label">⚔️</text>`;
    } else if (isAdjacent) {
      markerSymbol = `<circle cx="${t.cx}" cy="${t.cy}" r="4.5" class="beacon-center-core pulse-dot" />`;
    } else {
      markerSymbol = `<text x="${t.cx}" y="${t.cy + 3.5}" class="lock-label">🔒</text>`;
    }

    beaconsHtml += `
      <g class="${dotClass}" id="war-beacon-${t.id}" data-id="${t.id}" tabindex="0" role="button">
        <circle cx="${t.cx}" cy="${t.cy}" r="18" class="beacon-outer-target" />
        <circle cx="${t.cx}" cy="${t.cy}" r="11" class="beacon-main-dot" />
        ${markerSymbol}
        <text x="${t.cx}" y="${t.cy - 15}" class="sector-svg-name war-sector-label">${t.code}</text>
      </g>
    `;
  });

  svgTerritoriesLayer.innerHTML = territoriesHtml;
  svgBeaconsLayer.innerHTML = beaconsHtml;

  attachTerritoryListeners();
}

// Attach Event Handlers
function attachTerritoryListeners() {
  const items = document.querySelectorAll('.war-beacon-group, .territory-polygon');
  items.forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(el.getAttribute('data-id'), 10);
      handleTerritoryClick(id);
    });
  });
}

// Territory Click Event Handler
function handleTerritoryClick(id) {
  if (matchEnded) return;
  const target = warTerritories.find(t => t.id === id);
  if (!target) return;

  // Case 1: Already controlled by alliance
  if (target.owner === 'user') {
    sounds.playClick();
    showToast(`${target.name} (${target.code}) is already under BitKnights control!`, '🛡️');
    return;
  }

  // Case 2: Unconnected to alliance frontline
  const isAdjacent = isAdjacentToClan(id);
  if (!isAdjacent) {
    sounds.playClick();
    showToast(`LOCKED: ${target.name} is not connected to your frontline! Conquer adjacent sectors first.`, '🔒', true);

    const poly = document.getElementById(`war-poly-${id}`);
    if (poly) {
      poly.classList.add('shake-warning');
      setTimeout(() => poly.classList.remove('shake-warning'), 400);
    }
    return;
  }

  // Case 3: Check member attempts limit (5 attempts max)
  const attempts = gameState.clanWar.playerAttemptsRemaining;
  if (attempts <= 0) {
    sounds.playClick();
    showToast(`OUT OF ATTEMPTS: You have exhausted all 5 weekly clan war attempts! Awaiting squad reinforcement.`, '⚠️', true);
    return;
  }

  // Case 4: Launch Coding Challenge Modal
  openChallengeModal(target);
}

// ==================== CODING CHALLENGE MODAL ====================
function openChallengeModal(territory) {
  activeChallengeSector = territory;
  sounds.playModalOpen();

  const prob = territory.problem || PROBLEM_BANK[0];
  const attempts = gameState.clanWar.playerAttemptsRemaining;

  chalCode.textContent = territory.code;
  chalCategory.textContent = prob.category;
  chalDiff.textContent = prob.difficulty;
  chalDiff.className = `chal-diff-pill ${prob.diffClass}`;
  chalTitle.textContent = `${territory.name}: ${prob.title}`;
  chalDesc.innerHTML = prob.description;
  chalExIn.textContent = prob.exampleIn;
  chalExOut.textContent = prob.exampleOut;
  chalExNote.textContent = prob.exampleNote;

  if (modalAttemptTag) {
    modalAttemptTag.textContent = `⚡ Consumes 1 Attempt (${attempts} Left)`;
  }

  chalConstraints.innerHTML = prob.constraints.map(c => `<li><code>${c}</code></li>`).join('');

  // Update Gemini Status Indicator
  if (jdoodleStatusPill) {
    if (isGeminiConfigured()) {
      jdoodleStatusPill.innerHTML = `<span class="jdoodle-dot green-dot"></span> GEMINI AI`;
      jdoodleStatusPill.className = 'jdoodle-live-pill pill-online';
    } else {
      jdoodleStatusPill.innerHTML = `<span class="jdoodle-dot yellow-dot"></span> GEMINI SANDBOX`;
      jdoodleStatusPill.className = 'jdoodle-live-pill pill-sandbox';
    }
  }

  // Load language template
  const lang = editorLangSelect ? editorLangSelect.value : 'nodejs';
  if (lang === 'python3') {
    codeEditor.value = PYTHON_TEMPLATES[prob.fnName] || `# Python 3 Solution\ndef ${prob.fnName}(*args):\n    pass\n`;
  } else {
    codeEditor.value = prob.template;
  }

  consoleStatus.textContent = "Awaiting execution";
  consoleStatus.className = "console-status";
  consoleOutput.innerHTML = `Tactical challenge initialized for <strong>${territory.name}</strong>. Evaluated by <strong>Google Gemini AI</strong>. Click "Run Tests" to verify.`;

  challengeOverlay.classList.add('active');
}

function closeChallengeModal() {
  sounds.playModalClose();
  challengeOverlay.classList.remove('active');
  activeChallengeSector = null;
}

// Helper to escape HTML safely
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Run test cases against user code via Gemini API
async function runCurrentTests() {
  if (!activeChallengeSector || !activeChallengeSector.problem) return false;
  sounds.playClick();

  const prob = activeChallengeSector.problem;
  const userCode = codeEditor.value;
  const lang = editorLangSelect ? editorLangSelect.value : 'nodejs';

  consoleStatus.textContent = `Evaluating via Gemini AI Engine...`;
  consoleStatus.className = "console-status running";
  consoleOutput.innerHTML = `
    <div class="compiling-notice">
      <span class="pulse-radar-mini"></span>
      <span>Transmitting code payload to <strong>Google Gemini AI</strong> (${lang})...</span>
    </div>
  `;

  try {
    const res = await runProblemTestsWithGemini({
      userCode,
      problem: prob,
      language: lang
    });

    let outputHtml = '';

    // 1. Gemini API Execution Badge & Telemetry Bar
    outputHtml += `
      <div class="jdoodle-result-header">
        <div class="jdoodle-brand">
          <span class="jdoodle-icon">⚡</span>
          <strong>${res.isMockFallback ? 'GEMINI ENGINE (SANDBOX)' : 'GEMINI CLOUD COMPILER'}</strong>
          <span class="jdoodle-status-tag ${res.allPassed ? 'tag-pass' : 'tag-warn'}">STATUS: ${res.statusCode || 200}</span>
        </div>
        <div class="jdoodle-stats">
          <span>CPU: <strong>${res.cpuTime || '0.04s'}</strong></span>
          <span>MEM: <strong>${res.memory || '38KB'}</strong></span>
        </div>
      </div>
    `;

    if (res.notice) {
      outputHtml += `
        <div class="jdoodle-notice-banner" style="font-size: 0.72rem; color: #38BDF8; background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 4px; padding: 6px 10px; margin-bottom: 10px;">
          <span>ℹ️ ${escapeHtml(res.notice)}</span>
        </div>
      `;
    }

    // 2. Standard Output Box (STDOUT)
    const displayOutput = (res.output || '').trim();
    if (displayOutput) {
      outputHtml += `
        <div class="jdoodle-stdout-wrap">
          <div class="jdoodle-stdout-title">TEST VERIFICATION SUITE:</div>
          <pre class="jdoodle-stdout-box">${escapeHtml(displayOutput)}</pre>
        </div>
      `;
    }

    // 3. Test Cases List
    if (res.testResults && res.testResults.length > 0) {
      outputHtml += `<div class="jdoodle-tests-list">`;
      res.testResults.forEach(tr => {
        outputHtml += `<div class="${tr.passed ? 'test-pass' : 'test-fail'}">${escapeHtml(tr.resultText)}</div>`;
      });
      outputHtml += `</div>`;
    }

    if (res.allPassed) {
      sounds.playReward();
      consoleStatus.textContent = "VERIFIED BY GEMINI: ALL OUTPUTS CORRECT";
      consoleStatus.className = "console-status pass";
      outputHtml += `<div class="test-summary-pass">✅ All ${prob.tests.length} tests verified correct by Gemini AI Judge! Sector is ready to conquer.</div>`;
      consoleOutput.innerHTML = outputHtml;
      return true;
    } else {
      sounds.playClick();
      consoleStatus.textContent = "CONQUEST REJECTED: INCORRECT CODE OUTPUT";
      consoleStatus.className = "console-status fail";
      outputHtml += `<div class="test-fail" style="margin-top: 8px; font-weight: bold; border-left: 3px solid #EF4444; padding-left: 8px;">⛔ CONQUEST BLOCKED: Code output did not match required test outputs. Sector cannot be captured.</div>`;
      consoleOutput.innerHTML = outputHtml;
      return false;
    }
  } catch (err) {
    sounds.playClick();
    consoleStatus.textContent = "SYNTAX / RUNTIME ERROR";
    consoleStatus.className = "console-status fail";
    consoleOutput.innerHTML = `<div class="test-fail">⚠️ Error: ${escapeHtml(err.message)}</div><div class="test-fail" style="margin-top: 8px; font-weight: bold;">⛔ CONQUEST BLOCKED: Code failed to compile or execute cleanly.</div>`;
    return false;
  }
}

// Submit Solution & Capture Sector (ONLY if compiler output is verified correct)
async function submitCurrentSolution() {
  if (gameState.clanWar.playerAttemptsRemaining <= 0) {
    showToast("No attempts remaining for this week!", "⚠️", true);
    return;
  }

  if (btnSubmit) btnSubmit.disabled = true;
  const passed = await runCurrentTests();
  if (btnSubmit) btnSubmit.disabled = false;

  // STRICT REQUIREMENT: Only capture sector if code output is verified correct
  if (!passed) {
    sounds.playClick();
    showToast("CONQUEST REJECTED: Sector NOT captured! All test cases must produce the correct answer via the compiler.", "⚠️", true);

    const consoleBox = document.getElementById('test-console-box');
    if (consoleBox) {
      consoleBox.classList.add('shake-warning');
      setTimeout(() => consoleBox.classList.remove('shake-warning'), 400);
    }
    return;
  }

  if (!activeChallengeSector) return;

  // Deduct 1 attempt ONLY after verified correct solution
  gameState.clanWar.playerAttemptsRemaining = Math.max(0, gameState.clanWar.playerAttemptsRemaining - 1);
  updateAttemptsDisplay();

  // Capture Territory for Blue
  const sector = activeChallengeSector;
  sector.owner = 'user';
  gameState.clanWar.territories = warTerritories;
  saveState();

  sounds.playBattle();
  showToast(`CONQUERED! ${sector.name} (${sector.code}) is now secured for BitKnights! (+30 XP, +100 CP)`, "🎉");
  addPlayerXp(30);
  addPlayerCodePoints(100);

  closeChallengeModal();
  renderWarMap();
  updateScores();

  // Optimistic Write-Back to Supabase Database
  if (currentWarRoomId) {
    const blueCount = warTerritories.filter(t => t.owner === 'user').length;
    const redCount = warTerritories.filter(t => t.owner === 'enemy').length;
    writeTerritoryConquest({
      roomId: currentWarRoomId,
      table: 'clan_war_rooms',
      sectorId: sector.id,
      newOwner: 'user',
      playerInfo: {
        id: gameState.player?.name || 'Member',
        name: gameState.player?.name || 'BitKnights_Hero'
      },
      fullTerritories: warTerritories,
      blueScore: blueCount,
      redScore: redCount,
      memberAttemptsRemaining: gameState.clanWar.playerAttemptsRemaining
    });
  }

  checkWarVictoryCondition();
}

// Quick Auto-Solve helper for rapid demo & testing
function autoSolveCode() {
  if (!activeChallengeSector || !activeChallengeSector.problem) return;
  sounds.playReward();
  const prob = activeChallengeSector.problem;
  const lang = editorLangSelect ? editorLangSelect.value : 'nodejs';
  if (lang === 'python3') {
    codeEditor.value = PYTHON_TEMPLATES[prob.fnName] || prob.template;
  } else {
    codeEditor.value = prob.template;
  }
  runCurrentTests();
}

// ==================== ATTEMPTS DISPLAY ====================
function updateAttemptsDisplay() {
  const attempts = gameState.clanWar.playerAttemptsRemaining ?? 5;
  if (attemptsCountText) {
    attemptsCountText.textContent = `${attempts} / 5 REMAINING`;
    if (attempts === 0) {
      attemptsCountText.style.color = "#EF4444";
      attemptsCountText.textContent = "0 / 5 (EXHAUSTED)";
    } else if (attempts <= 2) {
      attemptsCountText.style.color = "#FACC15";
    } else {
      attemptsCountText.style.color = "#38BDF8";
    }
  }

  // Update battery pips
  for (let i = 1; i <= 5; i++) {
    const pip = document.getElementById(`pip-${i}`);
    if (pip) {
      if (i <= attempts) {
        pip.className = "attempt-pip filled";
      } else {
        pip.className = "attempt-pip empty";
      }
    }
  }
}

// ==================== ENEMY AI SYNDICATE EXPANSION ====================
function startEnemyAI() {
  // Every 45 seconds, enemy syndicate advances and captures an adjacent neutral sector
  enemyAiInterval = setInterval(() => {
    if (matchEnded) return;

    const candidates = warTerritories.filter(t => t.owner === 'neutral' && isAdjacentToEnemy(t.id));
    if (candidates.length > 0) {
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      target.owner = 'enemy';
      gameState.clanWar.territories = warTerritories;
      saveState();

      sounds.playClick();
      showToast(`ENEMY INCURSION: CyberDragons captured ${target.name} (${target.code})!`, "⚠️", true);

      renderWarMap();
      updateScores();

      // Write-back enemy conquest to database
      if (currentWarRoomId) {
        const blueCount = warTerritories.filter(t => t.owner === 'user').length;
        const redCount = warTerritories.filter(t => t.owner === 'enemy').length;
        writeTerritoryConquest({
          roomId: currentWarRoomId,
          table: 'clan_war_rooms',
          sectorId: target.id,
          newOwner: 'enemy',
          playerInfo: { id: 'rival_ai', name: 'CyberDragons' },
          fullTerritories: warTerritories,
          blueScore: blueCount,
          redScore: redCount
        });
      }

      checkWarVictoryCondition();
    }
  }, 45000);
}

// ==================== SCOREBOARD & TELEMETRY ====================
function updateScores() {
  const blueCount = warTerritories.filter(t => t.owner === 'user').length;
  const redCount = warTerritories.filter(t => t.owner === 'enemy').length;
  const neutralCount = warTerritories.filter(t => t.owner === 'neutral').length;

  if (blueScoreEl) blueScoreEl.textContent = blueCount;
  if (redScoreEl) redScoreEl.textContent = redCount;

  if (teleBlue) teleBlue.textContent = `${blueCount} Sectors`;
  if (teleRed) teleRed.textContent = `${redCount} Sectors`;
  if (teleNeutral) teleNeutral.textContent = `${neutralCount} Sectors Available`;
}

// ==================== 7-DAY CLOCK TIMER ====================
function start7DayTimer() {
  const startTime = gameState.clanWar.startTime || Date.now();
  const durationMs = gameState.clanWar.durationMs || (7 * 24 * 60 * 60 * 1000);

  function updateClock() {
    if (matchEnded) return;
    const now = Date.now();
    const elapsed = now - startTime;
    const remainingMs = Math.max(0, durationMs - elapsed);

    const totalSecs = Math.floor(remainingMs / 1000);
    const days = Math.floor(totalSecs / (24 * 3600));
    const hours = Math.floor((totalSecs % (24 * 3600)) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const formatted = `${String(days).padStart(2, '0')}d : ${String(hours).padStart(2, '0')}h : ${String(mins).padStart(2, '0')}m : ${String(secs).padStart(2, '0')}s`;
    if (countdownEl) countdownEl.textContent = formatted;

    if (remainingMs <= 0) {
      clearInterval(warTimerInterval);
      endWar("7-Day Clan War Period Concluded");
    }
  }

  updateClock();
  warTimerInterval = setInterval(updateClock, 1000);
}

// Check Victory Conditions
function checkWarVictoryCondition() {
  const blueCount = warTerritories.filter(t => t.owner === 'user').length;
  const redCount = warTerritories.filter(t => t.owner === 'enemy').length;

  // If majority captured (> 25 sectors out of 50)
  if (blueCount >= 26) {
    endWar("Territory Superiority Victory");
  } else if (redCount >= 26) {
    endWar("Enemy Superiority Defeat");
  }
}

// End War Resolution
function endWar(reason) {
  matchEnded = true;
  if (warTimerInterval) clearInterval(warTimerInterval);
  if (enemyAiInterval) clearInterval(enemyAiInterval);

  const blueCount = warTerritories.filter(t => t.owner === 'user').length;
  const redCount = warTerritories.filter(t => t.owner === 'enemy').length;
  const userWon = blueCount >= redCount;

  finalBlue.textContent = `${blueCount} SECTORS`;
  finalRed.textContent = `${redCount} SECTORS`;

  const banner = document.getElementById('endgame-banner');
  const trophy = document.getElementById('endgame-trophy');

  if (userWon) {
    sounds.playReward();
    endgameHeadline.textContent = "TACTICAL CLAN VICTORY!";
    endgameSubline.textContent = `BitKnights conquered ${blueCount} of 50 continent territories! 50,000 CP Bounty claimed!`;
    banner.className = "endgame-banner-box banner-victory";
    trophy.textContent = "🏆";

    gameState.player.codePoints += 50000;
    saveState();
  } else {
    sounds.playClick();
    endgameHeadline.textContent = "SYNDICATE DEFEAT";
    endgameSubline.textContent = `CyberDragons secured ${redCount} territories. Regroup your clan for next week's raid!`;
    banner.className = "endgame-banner-box banner-defeat";
    trophy.textContent = "💀";
  }

  endgameOverlay.classList.add('active');
}

// Concede / Reset Clan War
function concedeWar() {
  if (confirm("Concede and end the current Clan War? This will reset the war state.")) {
    resetClanWar();
    window.location.href = '/clan.html';
  }
}
