// Game State and Data for Clash of Code

export const gameState = {
  player: {
    name: "NeoPilot",
    title: "Syntax Initiate",
    level: 0,
    xp: 0,
    maxXp: 100,
    codePoints: 0,
    activeTheme: "cyberpunk",
    soundMuted: false,
    clan: null
  },

  coach: {
    name: "Ada",
    role: "Senior AI Algorithmic Coach",
    status: "ONLINE • COCKPIT LINKED",
    quotes: [
      "Ready to clash in the arena? Remember: premature optimization is the root of all bugs!",
      "Tip of the day: When confronting graph cycles, Dijkstra won't help with negative weights — use Bellman-Ford!",
      "Your syntax clarity is up 14% this week! Keep that momentum going in the Training Dojo.",
      "A Wild Bug Titan appeared in the queue! Shall we duel and harvest its Code Points?",
      "Need a memory boost? Check the Shop for the L3 Cache Overclock booster!",
      "Good developers write good code. Great champions write clean tests that break it early!"
    ]
  },

  battleModes: [
    {
      id: "pvp",
      title: "1v1 Algorithmic Duel",
      subtitle: "Live Matchmaking against global tech champions",
      tier: "Ranked Gold",
      entryFee: "100 CP",
      reward: "350 CP + 40 XP",
      icon: "⚔️",
      difficulty: "Hard"
    },
    {
      id: "boss",
      title: "Raid: The Glitch Hydra",
      subtitle: "Multi-threaded recursion monster boss fight",
      tier: "Weekly Raid",
      entryFee: "Free",
      reward: "1,200 CP + Legendary Token",
      icon: "🐉",
      difficulty: "Nightmare"
    },
    {
      id: "blitz",
      title: "Speed Debug Blitz",
      subtitle: "Squash 5 runtime exceptions under 60 seconds",
      tier: "Arcade Mode",
      entryFee: "50 CP",
      reward: "180 CP + 25 XP",
      icon: "⚡",
      difficulty: "Fast"
    }
  ],

  clanRoster: [
    {
      id: "clan_bitknights",
      name: "BitKnights",
      tag: "[KNIGHT]",
      members: "48 / 50",
      leader: "AdaLovelace_AI",
      rating: "14,820 CP",
      buff: "+20% Bonus XP on Algo Duels",
      perk: "Shared Code Snippet Vault & Daily Raid Pass",
      joined: true,
      bannerColor: "#7C3AED",
      icon: "🛡️"
    },
    {
      id: "clan_cyberdragons",
      name: "CyberDragons",
      tag: "[DRGN]",
      members: "49 / 50",
      leader: "ZeroDayNinja",
      rating: "15,200 CP",
      buff: "+15% Faster Debug Execution",
      perk: "Priority Queue for Boss Bug Raids",
      joined: false,
      bannerColor: "#EF4444",
      icon: "🐉"
    },
    {
      id: "clan_rustcrust",
      name: "RustCrustaceans",
      tag: "[RUST]",
      members: "44 / 50",
      leader: "Ferris_Prime",
      rating: "13,950 CP",
      buff: "Zero-Cost Memory Leak Shield",
      perk: "Automated Compiler Linting Assist",
      joined: false,
      bannerColor: "#F97316",
      icon: "🦀"
    },
    {
      id: "clan_neonninjas",
      name: "NeonNinjas",
      tag: "[NEON]",
      members: "38 / 50",
      leader: "QuantumShadow",
      rating: "12,400 CP",
      buff: "+200 CP on Daily Kata Sparring",
      perk: "Exclusive Cyber Dojo Weapon Skins",
      joined: false,
      bannerColor: "#06B6D4",
      icon: "⚡"
    }
  ],

  repoDecks: [
    {
      id: "algo_1",
      name: "Fast Binary Search",
      category: "Divide & Conquer",
      complexity: "O(log N)",
      mastery: "Mastered (Lvl 5)",
      status: "Combat Ready",
      snippet: "while (left <= right) { mid = left + ((right - left) >> 1); ... }"
    },
    {
      id: "algo_2",
      name: "Dijkstra Shortest Path",
      category: "Graph Theory",
      complexity: "O((V + E) log V)",
      mastery: "Proficient (Lvl 3)",
      status: "Combat Ready",
      snippet: "pq.push({0, start}); while(!pq.empty()) { ... }"
    },
    {
      id: "algo_3",
      name: "LRU Cache Architecture",
      category: "Data Structures",
      complexity: "O(1) Get / Put",
      mastery: "Mastered (Lvl 5)",
      status: "Combat Ready",
      snippet: "hashmap<int, Node*> + doubly_linked_list"
    },
    {
      id: "algo_4",
      name: "Trie (Prefix Tree)",
      category: "Strings & Trees",
      complexity: "O(L) Search",
      mastery: "Adept (Lvl 2)",
      status: "Deck Backup",
      snippet: "struct TrieNode { TrieNode* children[26]; bool isWord; };"
    }
  ],

  trainQuestions: [
    {
      id: "q1",
      title: "Warmup: Quick Time Complexity Check",
      prompt: "What is the worst-case runtime of QuickSort with naive pivot on already sorted data?",
      options: [
        { text: "O(N log N)", correct: false },
        { text: "O(N^2)", correct: true },
        { text: "O(N)", correct: false },
        { text: "O(1)", correct: false }
      ],
      explanation: "Without random or median-of-three pivots, an already sorted array partitions into 1 and N-1 elements at each step, yielding O(N^2) comparisons."
    },
    {
      id: "q2",
      title: "Syntax Duel: JavaScript Event Loop",
      prompt: "Which queue is evaluated first immediately after the synchronous execution context finishes?",
      options: [
        { text: "Macro-task queue (setTimeout / setInterval)", correct: false },
        { text: "Micro-task queue (Promise.then / queueMicrotask)", correct: true },
        { text: "Render pipeline batch", correct: false },
        { text: "I/O polling queue", correct: false }
      ],
      explanation: "Microtasks always drain completely prior to picking the next macrotask from the event queue."
    },
    {
      id: "q3",
      title: "Algorithm Reflex: Two-Sum Hash Map",
      prompt: "To find if two numbers in an unsorted array add up to Target in O(N) time, what should the hash map store?",
      options: [
        { text: "Keys = value, Values = index (or complement check)", correct: true },
        { text: "All possible pair sums", correct: false },
        { text: "Sorted frequency buckets", correct: false },
        { text: "Binary search tree pointers", correct: false }
      ],
      explanation: "Looking up (target - current) in a hash map takes O(1) average time, solving Two-Sum in a single linear pass."
    }
  ],

  shopItems: [
    {
      id: "item_1",
      name: "Aurora Cyber Headset H100",
      category: "Dev Gear Cosmetic",
      price: 1500,
      purchased: false,
      desc: "Neon cyan earcups with low-latency syntax audio feedback",
      icon: "🎧"
    },
    {
      id: "item_2",
      name: "Mechanical ESC Keycap 'Cyber-A'",
      category: "Peripherals",
      price: 800,
      purchased: true,
      desc: "Tactile gold-plated switch for instant emergency breakpoint escape",
      icon: "⌨️"
    },
    {
      id: "item_3",
      name: "Synthwave '84 IDE Theme Chip",
      category: "Visual Theme",
      price: 1200,
      purchased: false,
      desc: "Vibrant hot-pink and electric violet glowing syntax theme",
      icon: "🎨"
    },
    {
      id: "item_4",
      name: "CPU Overclock Nitro Boost",
      category: "Consumable Potion",
      price: 500,
      purchased: false,
      desc: "Grants +50% XP boost for the next 3 Battle matches",
      icon: "🧪"
    }
  ],

  missions: [
    {
      id: "m1",
      title: "Daily Kata Warmup",
      desc: "Answer 1 question correctly in the Training Dojo",
      progress: 0,
      target: 1,
      reward: "150 CP + 20 XP",
      completed: false,
      claimed: false
    },
    {
      id: "m2",
      title: "Master the Heap",
      desc: "Inspect algorithms in the Repository Vault",
      progress: 1,
      target: 1,
      reward: "200 CP + 15 XP",
      completed: true,
      claimed: false
    },
    {
      id: "m3",
      title: "Arena Challenger",
      desc: "Queue or complete any Code Battle match",
      progress: 0,
      target: 1,
      reward: "400 CP + 35 XP",
      completed: false,
      claimed: false
    }
  ],

  mailbox: [
    {
      id: "mail_1",
      sender: "Neo-Kyoto Battle League",
      subject: "⚔️ Invitation to the Algorithmic Grand Prix!",
      time: "10m ago",
      read: false,
      content: "Congratulations Coder! Your performance at Rank 8 has unlocked access to the Neo-Kyoto Cyber Invitational. Top 10 champions receive exclusive holographic avatars."
    },
    {
      id: "mail_2",
      sender: "AI Coach Ada",
      subject: "💡 Tactical debrief: Dynamic Programming speed",
      time: "2h ago",
      read: true,
      content: "Nice work on the memoization practice earlier! Notice how state compression reduced your space complexity from O(N) to O(1). Keep up the good work."
    },
    {
      id: "mail_3",
      sender: "System Maintenance",
      subject: "🛠️ Clash of Code v2.4 Patch Notes Live",
      time: "Yesterday",
      read: true,
      content: "Enhanced PvP matchmaking speeds, updated Boss Bug attack patterns, and added high-contrast accessibility options in the Submenu."
    }
  ],

  leaderboard: [
    { rank: 1, name: "BitLord_99", rating: "3,420 ELO", title: "Grandmaster" },
    { rank: 2, name: "ZeroDayNinja", rating: "3,310 ELO", title: "Grandmaster" },
    { rank: 3, name: "AdaLovelace_AI", rating: "3,280 ELO", title: "Cyber Sensei" },
    { rank: 4, name: "RecursionQueen", rating: "3,150 ELO", title: "Master" },
    { rank: 5, name: "NeoCoder_42 (You)", rating: "2,840 ELO", title: "Syntax Sentinel" }
  ],

  // 7-Day Clan War State
  clanWar: {
    isActive: false,
    startTime: null,
    durationMs: 7 * 24 * 60 * 60 * 1000,
    playerRole: "Leader", // "Leader", "Vice Leader", or "Member"
    playerAttemptsRemaining: 5,
    maxAttempts: 5,
    homeScore: 1,
    rivalScore: 1,
    homeClan: {
      name: "BitKnights",
      tag: "[KNIGHT]",
      icon: "🛡️",
      bannerColor: "#7C3AED"
    },
    rivalClan: {
      id: "clan_cyberdragons",
      name: "CyberDragons",
      tag: "[DRGN]",
      rating: "15,200 CP",
      icon: "🐉",
      bannerColor: "#EF4444"
    },
    territories: []
  }
};

// State change listeners for database synchronization
const stateListeners = new Set();

export function onGameStateSaved(callback) {
  stateListeners.add(callback);
  return () => stateListeners.delete(callback);
}

// Persistence helpers for multi-page synchronization (Hub <-> Clan Page <-> War Page)
export function saveState() {
  try {
    const dataToSave = {
      player: gameState.player,
      clanRoster: gameState.clanRoster,
      clanWar: gameState.clanWar
    };
    localStorage.setItem('clashofcode_game_state', JSON.stringify(dataToSave));
    stateListeners.forEach(cb => {
      try { cb(gameState.player); } catch (err) { console.warn(err); }
    });
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }
}

/** Wipes the persisted game state from localStorage (called on sign-out or new account). */
export function clearState() {
  try {
    localStorage.removeItem('clashofcode_game_state');
    // Reset in-memory to clean defaults
    gameState.player.name = 'NeoPilot';
    gameState.player.level = 0;
    gameState.player.xp = 0;
    gameState.player.maxXp = 100;
    gameState.player.codePoints = 0;
    gameState.player.clan = null;
    delete gameState.player.email;
    delete gameState.player.userId;
  } catch (e) {
    console.warn('Could not clear localStorage', e);
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem('clashofcode_game_state');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.player) {
        Object.assign(gameState.player, parsed.player);
      }
      if (Array.isArray(parsed.clanRoster) && parsed.clanRoster.length > 0) {
        gameState.clanRoster = parsed.clanRoster;
      }
      if (parsed.clanWar) {
        Object.assign(gameState.clanWar, parsed.clanWar);
      }
    }
  } catch (e) {
    console.warn('Could not load from localStorage', e);
  }
}

// Helper to start a clan war (Callable by Leader or Vice Leader)
export function startClanWar() {
  gameState.clanWar.isActive = true;
  gameState.clanWar.startTime = Date.now();
  gameState.clanWar.playerAttemptsRemaining = 5;
  saveState();
}

// Helper to reset clan war
export function resetClanWar() {
  gameState.clanWar.isActive = false;
  gameState.clanWar.startTime = null;
  gameState.clanWar.playerAttemptsRemaining = 5;
  gameState.clanWar.territories = [];
  saveState();
}

// NOTE: loadState() is intentionally NOT called here automatically.
// Auth (auth.js) controls when player data is loaded — only after a valid
// session is confirmed. This prevents stale localStorage from polluting new accounts.

