import { gameState, saveState } from './data.js';
import { sounds, spawnCrosshair } from './audio.js';
import {
  initRankedRoom,
  subscribeToGameRoom,
  writeTerritoryConquest,
  getRoomIdFromUrl,
  generateRoomId,
  copyRoomLink,
  getLatencyVisualStatus,
  applyStateInterpolation
} from './db.js';
import {
  runProblemTestsWithJDoodle,
  executeCodeWithJDoodle,
  isJDoodleConfigured
} from './jdoodle.js';
import { initAuthUI } from './auth.js';

// Multi-language template bank for JDoodle Cloud execution
const PYTHON_TEMPLATES = {
  twoSum: `def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in seen:\n            return [seen[diff], i]\n        seen[n] = i\n    return []`,
  isPalindrome: `def isPalindrome(s):\n    clean = "".join(c.lower() for c in s if c.isalnum())\n    return clean == clean[::-1]`,
  isValid: `def isValid(s):\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for ch in s:\n        if ch in mapping.values():\n            stack.append(ch)\n        elif ch in mapping:\n            if not stack or stack.pop() != mapping[ch]:\n                return False\n    return len(stack) == 0`,
  reverse: `def reverse(x):\n    sign = -1 if x < 0 else 1\n    res = int(str(abs(x))[::-1]) * sign\n    if res < -2**31 or res > 2**31 - 1:\n        return 0\n    return res`,
  singleNumber: `def singleNumber(nums):\n    res = 0\n    for n in nums:\n        res ^= n\n    return res`,
  climbStairs: `def climbStairs(n):\n    if n <= 2:\n        return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b`,
  maxSubArray: `def maxSubArray(nums):\n    cur = max_s = nums[0]\n    for n in nums[1:]:\n        cur = max(n, cur + n)\n        max_s = max(max_s, cur)\n    return max_s`,
  mergeIntervals: `def mergeIntervals(intervals):\n    if not intervals:\n        return []\n    intervals.sort(key=lambda x: x[0])\n    res = [intervals[0]]\n    for cur in intervals[1:]:\n        if cur[0] <= res[-1][1]:\n            res[-1][1] = max(res[-1][1], cur[1])\n        else:\n            res.append(cur)\n    return res`,
  solve: `def solve():\n    return True`
};

// Active Room & Realtime State
let currentRoomId = null;
let unsubscribeRoom = null;

// ==================== TERRITORIES DEFINITION ====================
// 10 state-like polygonal territories fitting together seamlessly
const TERRITORIES = [
  {
    id: 1,
    code: "SECTOR 01",
    name: "West Coast Command",
    shortName: "WEST BASE",
    points: "50,140 180,120 200,240 170,360 60,350 40,240",
    cx: 120,
    cy: 245,
    owner: "user", // BLUE START BASE
    isBase: true,
    baseType: "user",
    flag: "🏁",
    neighbors: [2, 3]
  },
  {
    id: 2,
    code: "SECTOR 02",
    name: "Cascade Uplands",
    shortName: "CASCADE",
    points: "180,120 320,80 350,200 200,240",
    cx: 260,
    cy: 160,
    owner: "neutral",
    neighbors: [1, 3, 4, 6],
    problem: {
      title: "Two-Sum Target Finder",
      category: "ARRAYS & HASH",
      difficulty: "EASY",
      diffClass: "diff-easy",
      description: "Given an integer array <code>nums</code> and an integer <code>target</code>, return an array of the indices of the two numbers such that they add up to <code>target</code>. Assume exactly one solution exists.",
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
    }
  },
  {
    id: 3,
    code: "SECTOR 03",
    name: "Silicon Coast",
    shortName: "SILICON",
    points: "200,240 350,200 340,350 170,360",
    cx: 260,
    cy: 290,
    owner: "neutral",
    neighbors: [1, 2, 4, 5],
    problem: {
      title: "Palindrome String Cleaner",
      category: "STRINGS",
      difficulty: "EASY",
      diffClass: "diff-easy",
      description: "A phrase is a palindrome if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward. Return <code>true</code> if palindrome, else <code>false</code>.",
      exampleIn: 's = "A man, a plan, a canal: Panama"',
      exampleOut: "true",
      exampleNote: '"amanaplanacanalpanama" is a palindrome',
      constraints: ['1 <= s.length <= 2 * 10^5', 's consists only of printable ASCII characters'],
      template: `function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === clean.split('').reverse().join('');
}`,
      tests: [
        { args: ["A man, a plan, a canal: Panama"], expected: true },
        { args: ["race a car"], expected: false },
        { args: [" "], expected: true }
      ],
      fnName: "isPalindrome"
    }
  },
  {
    id: 4,
    code: "SECTOR 04",
    name: "Great Basin Divide",
    shortName: "BASIN",
    points: "320,80 490,90 480,220 350,200",
    cx: 410,
    cy: 150,
    owner: "neutral",
    neighbors: [2, 3, 5, 6, 7],
    problem: {
      title: "Valid Parentheses Protocol",
      category: "STACKS",
      difficulty: "MEDIUM",
      diffClass: "diff-med",
      description: "Given a string <code>s</code> containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. Brackets must close in the correct order.",
      exampleIn: 's = "()[]{}"',
      exampleOut: "true",
      exampleNote: "All brackets are properly closed in order",
      constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'"],
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
    }
  },
  {
    id: 5,
    code: "SECTOR 05",
    name: "Mojave Grid",
    shortName: "MOJAVE",
    points: "350,200 480,220 460,380 340,350",
    cx: 405,
    cy: 290,
    owner: "neutral",
    neighbors: [3, 4, 7, 8],
    problem: {
      title: "Reverse Integer Protocol",
      category: "MATH & LOGIC",
      difficulty: "EASY",
      diffClass: "diff-easy",
      description: "Given a signed 32-bit integer <code>x</code>, return <code>x</code> with its digits reversed. If reversing causes the value to go outside the 32-bit range [-2^31, 2^31 - 1], return 0.",
      exampleIn: "x = 123",
      exampleOut: "321",
      exampleNote: "Digits reversed cleanly",
      constraints: ["-2^31 <= x <= 2^31 - 1"],
      template: `function reverseNumber(x) {
  const sign = x < 0 ? -1 : 1;
  const rev = parseInt(Math.abs(x).toString().split('').reverse().join('')) * sign;
  if (rev < -Math.pow(2, 31) || rev > Math.pow(2, 31) - 1) return 0;
  return rev;
}`,
      tests: [
        { args: [123], expected: 321 },
        { args: [-123], expected: -321 },
        { args: [120], expected: 21 }
      ],
      fnName: "reverseNumber"
    }
  },
  {
    id: 6,
    code: "SECTOR 06",
    name: "Northern Highlands",
    shortName: "HIGHLANDS",
    points: "490,90 660,70 650,210 480,220",
    cx: 570,
    cy: 145,
    owner: "neutral",
    neighbors: [2, 4, 7, 9],
    problem: {
      title: "Maximum Subarray Sum (Kadane)",
      category: "ARRAYS",
      difficulty: "MEDIUM",
      diffClass: "diff-med",
      description: "Given an integer array <code>nums</code>, find the subarray with the largest sum, and return its sum.",
      exampleIn: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
      exampleOut: "6",
      exampleNote: "Subarray [4,-1,2,1] has the largest sum = 6",
      constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
      template: `function maxSubArray(nums) {
  let maxSum = nums[0];
  let curSum = nums[0];
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
    }
  },
  {
    id: 7,
    code: "SECTOR 07",
    name: "Central Nexus Hub",
    shortName: "CENTRAL NEXUS",
    points: "480,220 650,210 630,370 460,380",
    cx: 550,
    cy: 295,
    owner: "neutral",
    neighbors: [4, 5, 6, 8, 9, 10],
    problem: {
      title: "Merge Overlapping Intervals",
      category: "INTERVALS",
      difficulty: "HARD",
      diffClass: "diff-hard",
      description: "Given an array of intervals where <code>intervals[i] = [start_i, end_i]</code>, merge all overlapping intervals, and return an array of the non-overlapping intervals.",
      exampleIn: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
      exampleOut: "[[1,6],[8,10],[15,18]]",
      exampleNote: "Since [1,3] and [2,6] overlap, merge them into [1,6]",
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
  },
  {
    id: 8,
    code: "SECTOR 08",
    name: "Rio Grande Foothills",
    shortName: "RIO GRANDE",
    points: "460,380 630,370 780,400 760,490 440,480",
    cx: 600,
    cy: 435,
    owner: "neutral",
    neighbors: [5, 7, 10],
    problem: {
      title: "Longest Common Prefix",
      category: "STRINGS",
      difficulty: "EASY",
      diffClass: "diff-easy",
      description: "Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string <code>\"\"</code>.",
      exampleIn: 'strs = ["flower","flow","flight"]',
      exampleOut: '"fl"',
      exampleNote: 'The longest common prefix is "fl"',
      constraints: ["1 <= strs.length <= 200", "0 <= strs[i].length <= 200"],
      template: `function longestCommonPrefix(strs) {
  if (!strs || strs.length === 0) return "";
  let prefix = strs[0];
  for (let i = 1; i < strs.length; i++) {
    while (strs[i].indexOf(prefix) !== 0) {
      prefix = prefix.substring(0, prefix.length - 1);
      if (prefix === "") return "";
    }
  }
  return prefix;
}`,
      tests: [
        { args: [["flower", "flow", "flight"]], expected: "fl" },
        { args: [["dog", "racecar", "car"]], expected: "" }
      ],
      fnName: "longestCommonPrefix"
    }
  },
  {
    id: 9,
    code: "SECTOR 09",
    name: "Great Lakes Citadel",
    shortName: "CITADEL",
    points: "660,70 820,90 810,230 650,210",
    cx: 735,
    cy: 150,
    owner: "neutral",
    neighbors: [6, 7, 10],
    problem: {
      title: "Climbing Stairs (DP)",
      category: "DYNAMIC PROG",
      difficulty: "EASY",
      diffClass: "diff-easy",
      description: "You are climbing a staircase. It takes <code>n</code> steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
      exampleIn: "n = 3",
      exampleOut: "3",
      exampleNote: "1 step + 1 step + 1 step, 1 step + 2 steps, or 2 steps + 1 step",
      constraints: ["1 <= n <= 45"],
      template: `function climbStairs(n) {
  if (n <= 2) return n;
  let first = 1, second = 2;
  for (let i = 3; i <= n; i++) {
    const third = first + second;
    first = second;
    second = third;
  }
  return second;
}`,
      tests: [
        { args: [2], expected: 2 },
        { args: [3], expected: 3 },
        { args: [5], expected: 8 }
      ],
      fnName: "climbStairs"
    }
  },
  {
    id: 10,
    code: "SECTOR 10",
    name: "East Coast Core",
    shortName: "EAST CORE",
    points: "650,210 810,230 940,250 920,420 780,400 630,370",
    cx: 810,
    cy: 315,
    owner: "enemy", // RED ENEMY START BASE
    isBase: true,
    baseType: "enemy",
    flag: "🚩",
    neighbors: [7, 8, 9]
  }
];

// ==================== STATE MANAGEMENT ====================
let territories = JSON.parse(JSON.stringify(TERRITORIES));
let activeChallengeSector = null;
let matchSeconds = 300; // 5 minutes clock
let timerInterval = null;
let enemyAiInterval = null;
let matchEnded = false;

// DOM Elements
const svgTerritoriesLayer = document.getElementById('svg-territories-layer');
const svgBeaconsLayer = document.getElementById('svg-beacons-layer');
const svgRoutesLayer = document.getElementById('svg-frontline-routes');

const blueScoreEl = document.getElementById('blue-score-count');
const redScoreEl = document.getElementById('red-score-count');
const countdownEl = document.getElementById('match-countdown');
const teleBlue = document.getElementById('tele-blue-status');
const teleRed = document.getElementById('tele-red-status');
const teleNeutral = document.getElementById('tele-neutral-status');
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
const rewardCp = document.getElementById('reward-cp');
const rewardXp = document.getElementById('reward-xp');
const rewardElo = document.getElementById('reward-elo');
const btnPlayAgain = document.getElementById('btn-play-again');
const btnReturnHub = document.getElementById('btn-return-hub');

// Sound / BGM / Crosshair
const btnConcede = document.getElementById('btn-concede-match');
const btnToggleBgm = document.getElementById('btn-toggle-bgm');
const btnToggleSfx = document.getElementById('btn-toggle-sound');
const crosshairContainer = document.getElementById('crosshair-container');

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
  initAuthUI({ requireAuth: true });
  const userDisplay = document.getElementById('user-display-name');
  if (userDisplay && gameState.player?.name) {
    userDisplay.textContent = gameState.player.name;
  }
  renderMap();
  updateScores();
  startTimer();
  startEnemyAI();

  // Click crosshair
  window.addEventListener('pointerdown', (e) => {
    spawnCrosshair(e.clientX, e.clientY, sounds, crosshairContainer, true);
    if (!sounds.bgmStarted && sounds.bgmEnabled) {
      sounds.startBGM();
    }
  });

  // --- ROOM & REALTIME DATABASE INITIALIZATION ---
  currentRoomId = getRoomIdFromUrl() || generateRoomId('ranked');
  // Reflect room ID in browser address bar without reload
  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.get('room') !== currentRoomId) {
    currentUrl.searchParams.set('room', currentRoomId);
    window.history.replaceState({}, '', currentUrl.toString());
  }

  // Bind Room ID Pill in HUD
  const roomPill = document.getElementById('room-id-pill');
  const roomCodeText = document.getElementById('room-code-text');
  if (roomCodeText) {
    roomCodeText.textContent = currentRoomId;
  }
  if (roomPill) {
    roomPill.addEventListener('click', async () => {
      sounds.playClick();
      const ok = await copyRoomLink(currentRoomId);
      if (ok) {
        showToast(`Invite link copied to clipboard! (${currentRoomId})`, '📋');
      }
    });
  }

  // Initialize room record in database
  const hostInfo = {
    id: gameState.player?.name || 'Player_1',
    name: gameState.player?.name || 'NeoCoder_42',
    elo: 2840
  };
  await initRankedRoom(currentRoomId, hostInfo, territories);

  // Subscribe to Realtime Updates (Zero-Lag via requestAnimationFrame)
  unsubscribeRoom = subscribeToGameRoom({
    roomId: currentRoomId,
    table: 'ranked_rooms',
    onStateUpdate: (roomData, isRemote) => {
      if (!roomData || !Array.isArray(roomData.territories)) return;
      let stateChanged = false;

      roomData.territories.forEach(remoteT => {
        const localT = territories.find(t => t.id === remoteT.id);
        if (localT && localT.owner !== remoteT.owner) {
          localT.owner = remoteT.owner;
          stateChanged = true;

          // State Interpolation: smooth visual transition on changed sector
          if (isRemote) {
            const poly = document.getElementById(`poly-sector-${localT.id}`);
            if (poly) applyStateInterpolation(poly, localT.owner);

            if (localT.owner === 'enemy') {
              sounds.playClick();
              showToast(`OPPONENT ACTION: Rival conquered ${localT.name}!`, '⚔️', true);
            } else if (localT.owner === 'user') {
              sounds.playReward();
              showToast(`ALLIED ACTION: ${localT.name} conquered!`, '🎉');
            }
          }
        }
      });

      if (stateChanged) {
        renderMap();
        updateScores();
        checkVictoryCondition();
      }
    },
    onLatencyChange: (rttMs) => {
      const badge = document.getElementById('net-latency-badge');
      const text = document.getElementById('net-latency-text');
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

  // Endgame actions
  if (btnPlayAgain) btnPlayAgain.addEventListener('click', resetMatch);
  if (btnReturnHub) btnReturnHub.addEventListener('click', () => {
    if (unsubscribeRoom) unsubscribeRoom();
    window.location.href = '/';
  });
  if (btnConcede) btnConcede.addEventListener('click', concedeMatch);

  // Clean up subscription on window unload
  window.addEventListener('beforeunload', () => {
    if (unsubscribeRoom) unsubscribeRoom();
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

  // Check URL params for testing/preview e.g. ?open=2
  const params = new URLSearchParams(window.location.search);
  const openSectorId = parseInt(params.get('open'));
  if (!isNaN(openSectorId)) {
    const targetSector = territories.find(t => t.id === openSectorId);
    if (targetSector) {
      openChallengeModal(targetSector);
    }
  }
});

// ==================== TACTICAL TOAST ====================
let toastTimeout = null;
function showToast(message, icon = 'ℹ️', isError = false) {
  if (!toastEl) return;
  toastText.textContent = message;
  toastIcon.textContent = icon;
  toastEl.className = `tactical-notice-toast ${isError ? 'error-toast' : 'info-toast'}`;
  toastEl.classList.remove('hidden');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 2800);
}


// ==================== ADJACENCY LOGIC ====================
// Check if territory is connected to any territory currently owned by the user (Blue)
function isAdjacentToUser(territoryId) {
  const target = territories.find(t => t.id === territoryId);
  if (!target) return false;
  return target.neighbors.some(neighborId => {
    const neighbor = territories.find(t => t.id === neighborId);
    return neighbor && neighbor.owner === 'user';
  });
}

// Check if territory is connected to enemy (Red)
function isAdjacentToEnemy(territoryId) {
  const target = territories.find(t => t.id === territoryId);
  if (!target) return false;
  return target.neighbors.some(neighborId => {
    const neighbor = territories.find(t => t.id === neighborId);
    return neighbor && neighbor.owner === 'enemy';
  });
}

// ==================== RENDER MAP ====================
function renderMap() {
  if (!svgTerritoriesLayer || !svgBeaconsLayer || !svgRoutesLayer) return;

  // 1. Draw Frontline Routes (Dashed lines between neighbors)
  let routesHtml = '';
  const drawnEdges = new Set();

  territories.forEach(t => {
    t.neighbors.forEach(nId => {
      const neighbor = territories.find(item => item.id === nId);
      if (!neighbor) return;

      const edgeKey = [Math.min(t.id, nId), Math.max(t.id, nId)].join('-');
      if (!drawnEdges.has(edgeKey)) {
        drawnEdges.add(edgeKey);

        // Determine line styling based on connection status
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

  // 2. Draw Territory Polygons (White Outlines)
  let territoriesHtml = '';
  let beaconsHtml = '';

  territories.forEach(t => {
    const isAdjacent = isAdjacentToUser(t.id);
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
        id="poly-sector-${t.id}"
        data-id="${t.id}"
      />
    `;

    // 3. Draw Territory Dots & Beacons
    let dotClass = "territory-beacon-group";
    if (isUser) dotClass += " owner-blue";
    else if (isEnemy) dotClass += " owner-red";
    else if (isAdjacent) dotClass += " status-ready-pulse";
    else dotClass += " status-locked";

    // Inner marker (Flag for base, Lock for non-adjacent, Star/Dot for accessible)
    let markerSymbol = "";
    if (t.isBase) {
      markerSymbol = `<text x="${t.cx}" y="${t.cy + 5}" class="flag-text">${t.flag}</text>`;
    } else if (isUser) {
      markerSymbol = `<text x="${t.cx}" y="${t.cy + 4}" class="beacon-label">✓</text>`;
    } else if (isEnemy) {
      markerSymbol = `<text x="${t.cx}" y="${t.cy + 4}" class="beacon-label">⚔️</text>`;
    } else if (isAdjacent) {
      markerSymbol = `<circle cx="${t.cx}" cy="${t.cy}" r="5" class="beacon-center-core pulse-dot" />`;
    } else {
      markerSymbol = `<text x="${t.cx}" y="${t.cy + 4}" class="lock-label">🔒</text>`;
    }

    beaconsHtml += `
      <g class="${dotClass}" id="beacon-group-${t.id}" data-id="${t.id}" tabindex="0" role="button">
        <!-- Outer Target Ring -->
        <circle cx="${t.cx}" cy="${t.cy}" r="22" class="beacon-outer-target" />
        <!-- Main Dot Shell -->
        <circle cx="${t.cx}" cy="${t.cy}" r="14" class="beacon-main-dot" />
        <!-- Center Symbol -->
        ${markerSymbol}
        <!-- Sector Label Tag -->
        <text x="${t.cx}" y="${t.cy - 20}" class="sector-svg-name">${t.shortName}</text>
      </g>
    `;
  });

  svgTerritoriesLayer.innerHTML = territoriesHtml;
  svgBeaconsLayer.innerHTML = beaconsHtml;

  // Bind click events on all territory polygons and beacon dots
  attachTerritoryListeners();
}

// Attach event handlers to SVG interactive elements
function attachTerritoryListeners() {
  const beaconGroups = document.querySelectorAll('.territory-beacon-group, .territory-polygon');
  beaconGroups.forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(el.getAttribute('data-id'), 10);
      handleTerritoryClick(id);
    });
  });
}

// ==================== TERRITORY CLICK HANDLER ====================
function handleTerritoryClick(id) {
  if (matchEnded) return;

  const target = territories.find(t => t.id === id);
  if (!target) return;

  // Case 1: Already User territory
  if (target.owner === 'user') {
    sounds.playClick();
    showToast(`${target.name} is already under your control! Secure adjacent sectors.`, '🛡️');
    return;
  }

  // Case 2: Not connected to user frontline (ADJACENCY RULE)
  const isAdjacent = isAdjacentToUser(id);
  if (!isAdjacent) {
    sounds.playClick();
    showToast(`LOCKED: ${target.name} is not connected to your frontline! Conquer adjacent sectors first.`, '🔒', true);

    // Shake the clicked element
    const poly = document.getElementById(`poly-sector-${id}`);
    if (poly) {
      poly.classList.add('shake-warning');
      setTimeout(() => poly.classList.remove('shake-warning'), 400);
    }
    return;
  }

  // Case 3: Enemy Base (Territory 10)
  if (target.id === 10 && target.owner === 'enemy') {
    // If adjacent, allow boss takeover
    openChallengeModal(target);
    return;
  }

  // Case 4: Adjacent Neutral or Enemy Territory -> Launch Coding Challenge!
  openChallengeModal(target);
}

// ==================== CODING CHALLENGE MODAL ====================
function openChallengeModal(territory) {
  activeChallengeSector = territory;
  sounds.playModalOpen();

  const prob = territory.problem || {
    title: "Territory Cyber Infiltration",
    category: "ALGORITHMIC SIEGE",
    difficulty: "HARD",
    diffClass: "diff-hard",
    description: "Infiltrate and bypass the automated security protocol to capture this strategic sector.",
    exampleIn: "n = 5",
    exampleOut: "true",
    exampleNote: "Bypass verification achieved",
    constraints: ["Zero runtime errors allowed"],
    template: `function solve() {\n  return true;\n}`,
    tests: [{ args: [], expected: true }],
    fnName: "solve"
  };

  chalCode.textContent = territory.code;
  chalCategory.textContent = prob.category;
  chalDiff.textContent = prob.difficulty;
  chalDiff.className = `chal-diff-pill ${prob.diffClass}`;
  chalTitle.textContent = prob.title;
  chalDesc.innerHTML = prob.description;
  chalExIn.textContent = prob.exampleIn;
  chalExOut.textContent = prob.exampleOut;
  chalExNote.textContent = prob.exampleNote;

  chalConstraints.innerHTML = prob.constraints.map(c => `<li><code>${c}</code></li>`).join('');

  // Update JDoodle Status Indicator
  if (jdoodleStatusPill) {
    if (isJDoodleConfigured()) {
      jdoodleStatusPill.innerHTML = '<span class="jdoodle-dot green-dot"></span> JDOODLE CLOUD';
      jdoodleStatusPill.className = 'jdoodle-live-pill pill-online';
    } else {
      jdoodleStatusPill.innerHTML = '<span class="jdoodle-dot yellow-dot"></span> JDOODLE SANDBOX';
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
  consoleOutput.innerHTML = `Tactical challenge initialized for <strong>${territory.name}</strong>. Powered by <strong>JDoodle Compiler API</strong>. Click "Run Tests" to compile and execute.`;

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

// Run test cases against user code via JDoodle Compiler API
async function runCurrentTests() {
  if (!activeChallengeSector || !activeChallengeSector.problem) return false;
  sounds.playClick();

  const prob = activeChallengeSector.problem;
  const userCode = codeEditor.value;
  const lang = editorLangSelect ? editorLangSelect.value : 'nodejs';

  consoleStatus.textContent = "Compiling via JDoodle API...";
  consoleStatus.className = "console-status running";
  consoleOutput.innerHTML = `
    <div class="compiling-notice">
      <span class="pulse-radar-mini"></span>
      <span>Transmitting code payload to <strong>JDoodle Cloud Compiler</strong> (${lang})...</span>
    </div>
  `;

  try {
    const res = await runProblemTestsWithJDoodle({
      userCode,
      problem: prob,
      language: lang
    });

    let outputHtml = '';

    // 1. JDoodle API Execution Badge & Telemetry Bar
    outputHtml += `
      <div class="jdoodle-result-header">
        <div class="jdoodle-brand">
          <span class="jdoodle-icon">⚡</span>
          <strong>${res.isMockFallback ? 'JDOODLE COMPILER (VERIFIED)' : 'JDOODLE CLOUD COMPILER'}</strong>
          <span class="jdoodle-status-tag ${res.allPassed ? 'tag-pass' : 'tag-warn'}">STATUS: ${res.statusCode || 200}</span>
        </div>
        <div class="jdoodle-stats">
          <span>CPU: <strong>${res.cpuTime || '0.02s'}</strong></span>
          <span>MEM: <strong>${res.memory || '36KB'}</strong></span>
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
          <div class="jdoodle-stdout-title">CONSOLE OUTPUT (STDOUT):</div>
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
      consoleStatus.textContent = "VERIFIED BY COMPILER: ALL OUTPUTS CORRECT";
      consoleStatus.className = "console-status pass";
      outputHtml += `<div class="test-summary-pass">✅ All ${prob.tests.length} tests verified correct by JDoodle Compiler! Territory is ready to conquer.</div>`;
      consoleOutput.innerHTML = outputHtml;
      return true;
    } else {
      sounds.playClick();
      consoleStatus.textContent = "CONQUEST REJECTED: INCORRECT CODE OUTPUT";
      consoleStatus.className = "console-status fail";
      outputHtml += `<div class="test-fail" style="margin-top: 8px; font-weight: bold; border-left: 3px solid #EF4444; padding-left: 8px;">⛔ CONQUEST BLOCKED: Code output did not match required test outputs. Territory cannot be captured.</div>`;
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

// Submit Solution & Capture Territory (ONLY if compiler output is verified correct)
async function submitCurrentSolution() {
  if (btnSubmit) btnSubmit.disabled = true;
  const passed = await runCurrentTests();
  if (btnSubmit) btnSubmit.disabled = false;

  // STRICT REQUIREMENT: Only capture region if code output is verified correct
  if (!passed) {
    sounds.playClick();
    showToast("CONQUEST REJECTED: Territory NOT captured! All test cases must produce the correct answer via the compiler.", "⚠️", true);
    
    // Shake console box for prominent feedback
    const consoleBox = document.getElementById('test-console-box');
    if (consoleBox) {
      consoleBox.classList.add('shake-warning');
      setTimeout(() => consoleBox.classList.remove('shake-warning'), 400);
    }
    return;
  }

  if (!activeChallengeSector) return;

  // Solution Passed -> Capture Territory for User!
  const sector = activeChallengeSector;
  sector.owner = 'user';

  sounds.playBattle();
  showToast(`CONQUERED! ${sector.name} is now BLUE alliance territory!`, "🎉");

  closeChallengeModal();
  renderMap();
  updateScores();

  // Optimistic Write-Back to Supabase Database
  if (currentRoomId) {
    const blueCount = territories.filter(t => t.owner === 'user').length;
    const redCount = territories.filter(t => t.owner === 'enemy').length;
    writeTerritoryConquest({
      roomId: currentRoomId,
      table: 'ranked_rooms',
      sectorId: sector.id,
      newOwner: 'user',
      playerInfo: {
        id: gameState.player?.name || 'Player_1',
        name: gameState.player?.name || 'NeoCoder_42'
      },
      fullTerritories: territories,
      blueScore: blueCount,
      redScore: redCount
    });
  }

  // Check victory
  checkVictoryCondition();
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

// ==================== ENEMY AI EXPANSION ====================
function startEnemyAI() {
  // Every 32 seconds, the enemy tries to expand into an adjacent neutral territory
  enemyAiInterval = setInterval(() => {
    if (matchEnded) return;

    // Find neutral territories bordering enemy territory
    const candidates = territories.filter(t => t.owner === 'neutral' && isAdjacentToEnemy(t.id));
    if (candidates.length > 0) {
      // Pick one randomly or strategically towards center
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      target.owner = 'enemy';

      sounds.playClick();
      showToast(`ENEMY INCURSION: Rival captured ${target.name}!`, "⚠️", true);

      renderMap();
      updateScores();

      // Write-back enemy conquest to database
      if (currentRoomId) {
        const blueCount = territories.filter(t => t.owner === 'user').length;
        const redCount = territories.filter(t => t.owner === 'enemy').length;
        writeTerritoryConquest({
          roomId: currentRoomId,
          table: 'ranked_rooms',
          sectorId: target.id,
          newOwner: 'enemy',
          playerInfo: { id: 'rival_ai', name: 'ZeroDayNinja' },
          fullTerritories: territories,
          blueScore: blueCount,
          redScore: redCount
        });
      }

      checkVictoryCondition();
    }
  }, 32000);
}

// ==================== SCOREBOARD & TELEMETRY ====================
function updateScores() {
  const blueCount = territories.filter(t => t.owner === 'user').length;
  const redCount = territories.filter(t => t.owner === 'enemy').length;
  const neutralCount = territories.filter(t => t.owner === 'neutral').length;

  if (blueScoreEl) blueScoreEl.textContent = blueCount;
  if (redScoreEl) redScoreEl.textContent = redCount;

  if (teleBlue) teleBlue.textContent = `${blueCount} Controlled`;
  if (teleRed) teleRed.textContent = `${redCount} Controlled`;
  if (teleNeutral) teleNeutral.textContent = `${neutralCount} Sectors Available`;
}

// ==================== MATCH TIMER ====================
function startTimer() {
  timerInterval = setInterval(() => {
    if (matchEnded) return;
    matchSeconds--;

    const mins = String(Math.floor(matchSeconds / 60)).padStart(2, '0');
    const secs = String(matchSeconds % 60).padStart(2, '0');
    if (countdownEl) countdownEl.textContent = `${mins}:${secs}`;

    if (matchSeconds <= 0) {
      clearInterval(timerInterval);
      endMatch("Time Expired");
    }
  }, 1000);
}

// ==================== VICTORY & ENDGAME ====================
function checkVictoryCondition() {
  const blueCount = territories.filter(t => t.owner === 'user').length;
  const redCount = territories.filter(t => t.owner === 'enemy').length;
  const neutralCount = territories.filter(t => t.owner === 'neutral').length;

  // 1. If user captures enemy base
  const enemyBase = territories.find(t => t.id === 10);
  if (enemyBase && enemyBase.owner === 'user') {
    endMatch("Enemy Base Captured");
    return;
  }

  // 2. If all territories are conquered
  if (neutralCount === 0) {
    endMatch("All Sectors Conquered");
    return;
  }

  // 3. Majority capture (6 or more out of 10)
  if (blueCount >= 6) {
    endMatch("Dominant Territory Majority");
    return;
  } else if (redCount >= 6) {
    endMatch("Enemy Majority Expansion");
    return;
  }
}

function endMatch(reason) {
  matchEnded = true;
  clearInterval(timerInterval);
  clearInterval(enemyAiInterval);

  const blueCount = territories.filter(t => t.owner === 'user').length;
  const redCount = territories.filter(t => t.owner === 'enemy').length;

  finalBlue.textContent = `${blueCount} SECTORS`;
  finalRed.textContent = `${redCount} SECTORS`;

  const banner = document.getElementById('endgame-banner');
  const trophy = document.getElementById('endgame-trophy');

  if (blueCount > redCount) {
    // VICTORY!
    sounds.playReward();
    endgameHeadline.textContent = "TACTICAL VICTORY!";
    endgameSubline.textContent = `You outmaneuvered the rival and conquered ${blueCount} state territories! (${reason})`;
    banner.className = "endgame-banner-box banner-victory";
    trophy.textContent = "🏆";

    const earnedCp = 350;
    const earnedXp = 60;
    const earnedElo = 45;

    rewardCp.textContent = `+${earnedCp} CP`;
    rewardXp.textContent = `+${earnedXp} XP`;
    rewardElo.textContent = `+${earnedElo} ELO`;

    gameState.player.codePoints += earnedCp;
    gameState.player.xp += earnedXp;
    saveState();
  } else if (redCount > blueCount) {
    // DEFEAT
    sounds.playClick();
    endgameHeadline.textContent = "TACTICAL DEFEAT";
    endgameSubline.textContent = `The rival secured ${redCount} territories and severed your frontline. (${reason})`;
    banner.className = "endgame-banner-box banner-defeat";
    trophy.textContent = "💀";

    rewardCp.textContent = "+50 CP (Consolation)";
    rewardXp.textContent = "+15 XP";
    rewardElo.textContent = "-20 ELO";

    gameState.player.codePoints += 50;
    saveState();
  } else {
    // DRAW
    sounds.playClick();
    endgameHeadline.textContent = "STALEMATE DRAW";
    endgameSubline.textContent = `Both alliances held an equal number of territories (${blueCount} - ${redCount}).`;
    banner.className = "endgame-banner-box banner-draw";
    trophy.textContent = "⚖️";

    rewardCp.textContent = "+100 CP";
    rewardXp.textContent = "+25 XP";
    rewardElo.textContent = "+0 ELO";
  }

  endgameOverlay.classList.add('active');
}

// Reset match for a rematch
function resetMatch() {
  endgameOverlay.classList.remove('active');
  territories = JSON.parse(JSON.stringify(TERRITORIES));
  matchSeconds = 300;
  matchEnded = false;

  renderMap();
  updateScores();
  startTimer();
  startEnemyAI();

  showToast("Rematch started! Conquer adjacent territories from your West Base.", "⚔️");
}

function concedeMatch() {
  if (confirm("Are you sure you want to concede this ranked match? You will lose 20 ELO.")) {
    window.location.href = '/#battle';
  }
}
