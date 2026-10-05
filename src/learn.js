// ==========================================================================
// Clash of Code - Striver's A2Z DSA Roadmap Engine (learn.html)
// Interactive Roadmap with official LeetCode redirects & progress tracking
// ==========================================================================

import { ROADMAP_STEPS } from './learnData.js';
import { sounds, spawnCrosshair } from './audio.js';
import {
  executeCodeWithGemini,
  getGeminiHint,
  explainCodeWithGemini,
  isGeminiConfigured,
  GEMINI_MODEL
} from './gemini.js';
import { addPlayerXp, addPlayerCodePoints, normalizePlayerLevel } from './data.js';
import { initAuthUI } from './auth.js';

// Safe HTML Escape Helper
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// LeetCode Official SVG Icon
export const LEETCODE_SVG_ICON = `
<svg class="leetcode-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.762-1.828.762s-1.362-.295-1.828-.762l-4.24-4.24a2.586 2.586 0 0 1 0-3.657l4.24-4.24c.466-.467 1.111-.762 1.828-.762s1.362.295 1.828.762l2.697 2.607" stroke="#FFA116" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M10.87 8.528l6.81-6.81c.54-.54 1.417-.54 1.957 0l1.782 1.782c.54.54.54 1.417 0 1.957l-6.81 6.81" stroke="#FFA116" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9.1 12.3h8.8" stroke="#E2E8F0" stroke-width="2.2" stroke-linecap="round"/>
</svg>
`;

// State
let solvedProblems = new Set();
let currentFilter = 'ALL';
let searchQuery = '';
let selectedStepId = 'ALL';

// Storage Key
const STORAGE_KEY = 'clashofcode_solved_dsa_problems';

// Lightweight debounce utility
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initAuthUI({ requireAuth: true });
  loadSolvedState();
  initHUD();
  renderRoadmap();
  updateProgressStats();
  initEventListeners();
  initJDoodleScratchpad();
});

// Load Solved State from localStorage
function loadSolvedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        solvedProblems = new Set(arr);
      }
    }
  } catch (err) {
    console.error("Failed to load solved problems from storage:", err);
  }
}

// Save Solved State to localStorage
function saveSolvedState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(solvedProblems)));
  } catch (err) {
    console.error("Failed to save solved problems to storage:", err);
  }
}

// Toggle Solved Status
export function toggleProblemSolved(problemId) {
  if (solvedProblems.has(problemId)) {
    solvedProblems.delete(problemId);
    sounds.playClick();
  } else {
    solvedProblems.add(problemId);
    sounds.playWin();
    addPlayerXp(20);
    addPlayerCodePoints(40);
  }
  saveSolvedState();
  updateProgressStats();
  refreshProblemRowState(problemId);
}

// Update Single Row DOM State (without re-rendering everything)
function refreshProblemRowState(problemId) {
  const row = document.getElementById(`problem-row-${problemId}`);
  if (!row) return;

  const isSolved = solvedProblems.has(problemId);
  row.classList.toggle('is-solved', isSolved);

  const checkbox = row.querySelector('.problem-checkbox');
  if (checkbox) {
    checkbox.checked = isSolved;
  }

  // Update step progress badge in header
  const stepCard = row.closest('.roadmap-step-card');
  if (stepCard) {
    const stepId = parseInt(stepCard.getAttribute('data-step-id'), 10);
    const step = ROADMAP_STEPS.find(s => s.stepId === stepId);
    if (step) {
      const stepProblems = getStepProblems(step);
      const solvedInStep = stepProblems.filter(p => solvedProblems.has(p.id)).length;
      const stepBadge = stepCard.querySelector('.step-progress-pill');
      if (stepBadge) {
        stepBadge.textContent = `${solvedInStep} / ${stepProblems.length} SOLVED`;
        stepBadge.classList.toggle('all-done', solvedInStep === stepProblems.length && stepProblems.length > 0);
      }
    }
  }
}

// Helper: Get all problems in a step
function getStepProblems(step) {
  const problems = [];
  step.subtopics.forEach(sub => {
    problems.push(...sub.problems);
  });
  return problems;
}

// Total Problems Count
function getTotalProblemsCount() {
  let count = 0;
  ROADMAP_STEPS.forEach(s => {
    count += getStepProblems(s).length;
  });
  return count;
}

// Update HUD & Progress Stats
function updateProgressStats() {
  const total = getTotalProblemsCount();
  const solved = solvedProblems.size;
  const percent = total > 0 ? Math.round((solved / total) * 100) : 0;

  const countEl = document.getElementById('progress-count');
  const barEl = document.getElementById('progress-bar-fill');
  const percentEl = document.getElementById('progress-percent');

  if (countEl) countEl.textContent = `${solved} / ${total}`;
  if (percentEl) percentEl.textContent = `${percent}%`;
  if (barEl) barEl.style.width = `${percent}%`;
}

// Render Full Roadmap Steps
function renderRoadmap() {
  const container = document.getElementById('roadmap-steps-container');
  if (!container) return;

  let html = '';

  ROADMAP_STEPS.forEach(step => {
    const stepProblems = getStepProblems(step);

    // Apply Filter & Search
    const filteredSubtopics = step.subtopics.map(sub => {
      const filteredProblems = sub.problems.filter(p => {
        // Difficulty filter
        if (currentFilter !== 'ALL' && p.difficulty.toUpperCase() !== currentFilter) {
          return false;
        }
        // Search query filter
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchNum = p.leetcodeId.toString().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          return matchTitle || matchNum || matchCat;
        }
        return true;
      });

      return {
        ...sub,
        problems: filteredProblems
      };
    }).filter(sub => sub.problems.length > 0);

    // If step filter is set, hide other steps
    if (selectedStepId !== 'ALL' && step.stepId.toString() !== selectedStepId) {
      return;
    }

    // If search is active and step has no matching problems, hide it
    if (searchQuery && filteredSubtopics.length === 0) {
      return;
    }

    const totalStepProblems = stepProblems.length;
    const solvedInStep = stepProblems.filter(p => solvedProblems.has(p.id)).length;
    const isStepAllDone = (solvedInStep === totalStepProblems && totalStepProblems > 0);

    html += `
      <section class="roadmap-step-card" data-step-id="${step.stepId}" id="step-card-${step.stepId}">
        
        <!-- Step Header -->
        <header class="step-card-header" data-toggle-step="${step.stepId}">
          <div class="step-meta-left">
            <div class="step-badge-node">
              <span class="step-icon">${step.icon}</span>
              <span class="step-num-text">STEP ${step.stepNumber}</span>
            </div>
            <div class="step-title-group">
              <h2 class="step-title">${step.title}</h2>
              <p class="step-desc">${step.desc}</p>
            </div>
          </div>

          <div class="step-meta-right">
            <span class="step-progress-pill ${isStepAllDone ? 'all-done' : ''}">
              ${solvedInStep} / ${totalStepProblems} SOLVED
            </span>
            <span class="step-chevron">▼</span>
          </div>
        </header>

        <!-- Step Content (Collapsible) -->
        <div class="step-card-body" id="step-body-${step.stepId}">
          ${renderSubtopics(filteredSubtopics)}
        </div>
      </section>
    `;
  });

  if (!html) {
    html = `
      <div class="empty-results-box">
        <span class="empty-icon">🔍</span>
        <h3>NO PROBLEMS MATCH YOUR FILTER</h3>
        <p>Try clearing your search query or selecting "ALL" difficulty.</p>
        <button class="reset-filter-btn" id="btn-clear-search">Reset Filters</button>
      </div>
    `;
  }

  container.innerHTML = html;
  attachRoadmapListeners();
}

// Render Subtopics and Problem Rows
function renderSubtopics(subtopics) {
  return subtopics.map(sub => `
    <div class="subtopic-group">
      <h3 class="subtopic-title">
        <span class="subtopic-bullet">▸</span>
        <span>${sub.subtopicName}</span>
        <span class="subtopic-count">(${sub.problems.length})</span>
      </h3>

      <div class="problem-rows-list">
        ${sub.problems.map(p => renderProblemRow(p)).join('')}
      </div>
    </div>
  `).join('');
}

// Render Individual Problem Row
function renderProblemRow(p) {
  const isSolved = solvedProblems.has(p.id);
  const diffClass = `diff-${p.difficulty.toLowerCase()}`;

  return `
    <div class="problem-item-row ${isSolved ? 'is-solved' : ''}" id="problem-row-${p.id}" data-id="${p.id}">
      
      <!-- Checkbox Solved -->
      <label class="checkbox-container" title="Mark as Solved">
        <input type="checkbox" class="problem-checkbox" data-id="${p.id}" ${isSolved ? 'checked' : ''}>
        <span class="custom-checkmark"></span>
      </label>

      <!-- LeetCode Problem Info -->
      <div class="problem-info-col">
        <div class="problem-title-line">
          <span class="lc-number">#${p.leetcodeId}</span>
          <span class="problem-title-text">${p.title}</span>
        </div>
        <div class="problem-tags-line">
          <span class="diff-badge ${diffClass}">${p.difficulty.toUpperCase()}</span>
          <span class="category-tag">${p.category}</span>
        </div>
      </div>

      <!-- Problem Action Column: JDoodle Cloud Compiler & LeetCode Redirect -->
      <div class="problem-action-col">
        <button 
          class="jdoodle-prob-btn" 
          data-prob-title="${escapeHtml(p.title)}" 
          data-lc-id="${p.leetcodeId}" 
          title="Open '${escapeHtml(p.title)}' in JDoodle Cloud Compiler"
        >
          <span class="jdoodle-btn-icon">⚡</span>
          <span class="jdoodle-btn-lbl">Compiler</span>
        </button>
        <a 
          href="${p.url}" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="leetcode-action-btn"
          title="Solve '${p.title}' on LeetCode (Opens in new tab)"
        >
          ${LEETCODE_SVG_ICON}
          <span class="lc-btn-text">Solve</span>
          <span class="external-arrow">↗</span>
        </a>
      </div>
    </div>
  `;
}

// Attach Event Handlers
function attachRoadmapListeners() {
  // Step Collapsible Headers
  const headers = document.querySelectorAll('.step-card-header');
  headers.forEach(h => {
    h.addEventListener('click', (e) => {
      // Don't collapse if clicking a link or button inside header
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
      sounds.playClick();
      const stepCard = h.closest('.roadmap-step-card');
      if (stepCard) {
        stepCard.classList.toggle('collapsed');
      }
    });
  });

  // Checkboxes
  const checkboxes = document.querySelectorAll('.problem-checkbox');
  checkboxes.forEach(cb => {
    cb.addEventListener('change', (e) => {
      e.stopPropagation();
      const id = cb.getAttribute('data-id');
      if (id) {
        toggleProblemSolved(id);
      }
    });
  });

  // LeetCode Buttons Sound
  const lcButtons = document.querySelectorAll('.leetcode-action-btn');
  lcButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.playClick();
    });
  });

  // JDoodle Problem Quick-Run Buttons
  const jdoodleProbBtns = document.querySelectorAll('.jdoodle-prob-btn');
  jdoodleProbBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const title = btn.getAttribute('data-prob-title') || 'Problem';
      const lcId = btn.getAttribute('data-lc-id') || '';
      openJDoodleScratchpadForProblem(title, lcId);
    });
  });

  // Reset filter button if empty
  const btnClearSearch = document.getElementById('btn-clear-search');
  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      searchQuery = '';
      currentFilter = 'ALL';
      const searchInput = document.getElementById('search-problems-input');
      if (searchInput) searchInput.value = '';
      document.querySelectorAll('.filter-pill-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-filter') === 'ALL');
      });
      renderRoadmap();
    });
  }
}

// Top Bar HUD & Keybindings
function initHUD() {
  // Back to Hub
  const btnBack = document.getElementById('btn-back-hub');
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      sounds.playClick();
      window.location.href = '/index.html';
    });
  }

  // Audio SFX Toggle
  const btnSound = document.getElementById('btn-toggle-sound');
  if (btnSound) {
    btnSound.addEventListener('click', () => {
      sounds.enabled = !sounds.enabled;
      document.getElementById('sfx-icon').textContent = sounds.enabled ? '🔊' : '🔈';
      sounds.playClick();
    });
  }

  // BGM Toggle
  const btnBgm = document.getElementById('btn-toggle-bgm');
  if (btnBgm) {
    btnBgm.addEventListener('click', () => {
      const on = sounds.toggleBGM();
      document.getElementById('bgm-icon').textContent = on ? '🎵' : '🔇';
    });
  }
}

// Control Bar Listeners
function initEventListeners() {
  // Crosshair
  const crosshairContainer = document.getElementById('crosshair-container');
  window.addEventListener('pointerdown', (e) => {
    spawnCrosshair(e.clientX, e.clientY, sounds, crosshairContainer, true);

    if (!sounds.bgmStarted && sounds.bgmEnabled) {
      sounds.startBGM();
    }
  });

  // Search Input (debounced for performance)
  const searchInput = document.getElementById('search-problems-input');
  if (searchInput) {
    const debouncedSearch = debounce((val) => {
      searchQuery = val.trim();
      renderRoadmap();
    }, 150);
    searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
  }

  // Difficulty Filter Pills
  const filterBtns = document.querySelectorAll('.filter-pill-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sounds.playClick();
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter') || 'ALL';
      renderRoadmap();
    });
  });

  // Step Select Dropdown
  const stepSelect = document.getElementById('step-select-dropdown');
  if (stepSelect) {
    stepSelect.addEventListener('change', (e) => {
      sounds.playClick();
      selectedStepId = e.target.value;
      renderRoadmap();
    });
  }

  // Expand / Collapse All
  const btnExpandAll = document.getElementById('btn-expand-all');
  const btnCollapseAll = document.getElementById('btn-collapse-all');

  if (btnExpandAll) {
    btnExpandAll.addEventListener('click', () => {
      sounds.playClick();
      document.querySelectorAll('.roadmap-step-card').forEach(c => c.classList.remove('collapsed'));
    });
  }

  if (btnCollapseAll) {
    btnCollapseAll.addEventListener('click', () => {
      sounds.playClick();
      document.querySelectorAll('.roadmap-step-card').forEach(c => c.classList.add('collapsed'));
    });
  }
}

// ==================== JDOODLE CLOUD COMPILER SCRATCHPAD ====================
let scratchpadOverlay = null;
let scratchpadCode = null;
let scratchpadLangSelect = null;
let scratchpadStatusPill = null;
let scratchpadConsoleStatus = null;
let scratchpadConsoleOutput = null;
let btnScratchpadRun = null;

function initJDoodleScratchpad() {
  scratchpadOverlay = document.getElementById('jdoodle-modal-overlay');
  scratchpadCode = document.getElementById('scratchpad-code-input');
  scratchpadLangSelect = document.getElementById('scratchpad-lang-select');
  scratchpadStatusPill = document.getElementById('scratchpad-status-pill');
  scratchpadConsoleStatus = document.getElementById('scratchpad-console-status');
  scratchpadConsoleOutput = document.getElementById('scratchpad-console-output');
  btnScratchpadRun = document.getElementById('btn-scratchpad-run');

  const btnOpen = document.getElementById('btn-open-jdoodle');
  const btnClose = document.getElementById('btn-close-jdoodle-modal');
  const btnHello = document.getElementById('btn-scratchpad-hello');
  const btnClear = document.getElementById('btn-scratchpad-clear');

  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      openJDoodleScratchpad();
    });
  }

  if (btnClose) {
    btnClose.addEventListener('click', () => {
      closeJDoodleScratchpad();
    });
  }

  if (scratchpadOverlay) {
    scratchpadOverlay.addEventListener('click', (e) => {
      if (e.target === scratchpadOverlay) {
        closeJDoodleScratchpad();
      }
    });
  }

  if (btnHello) {
    btnHello.addEventListener('click', () => {
      sounds.playClick();
      const lang = scratchpadLangSelect ? scratchpadLangSelect.value : 'python3';
      if (lang === 'python3') {
        scratchpadCode.value = 'print("Hello World")\n';
      } else {
        scratchpadCode.value = 'console.log("Hello World");\n';
      }
      scratchpadCode.focus();
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      sounds.playClick();
      scratchpadCode.value = '';
      scratchpadCode.focus();
    });
  }

  if (scratchpadLangSelect) {
    scratchpadLangSelect.addEventListener('change', () => {
      sounds.playClick();
      const lang = scratchpadLangSelect.value;
      const curVal = scratchpadCode.value.trim();
      if (!curVal || curVal.includes('Hello World') || curVal.includes('print(') || curVal.includes('console.log(')) {
        if (lang === 'python3') {
          scratchpadCode.value = 'print("Hello World")\n';
        } else {
          scratchpadCode.value = 'console.log("Hello World");\n';
        }
      }
    });
  }

  if (btnScratchpadRun) {
    btnScratchpadRun.addEventListener('click', () => {
      runScratchpadCode();
    });
  }

  // Coach Ada AI Hint
  const btnScratchpadHint = document.getElementById('btn-scratchpad-hint');
  if (btnScratchpadHint) {
    btnScratchpadHint.addEventListener('click', async () => {
      if (!scratchpadCode) return;
      sounds.playClick();
      btnScratchpadHint.disabled = true;
      btnScratchpadHint.textContent = '⏳ THINKING...';
      try {
        const script = scratchpadCode.value;
        const lang = scratchpadLangSelect ? scratchpadLangSelect.value : 'python3';
        const hint = await getGeminiHint(script, { title: 'DSA Roadmap Algorithm' }, lang);
        sounds.playReward();
        if (scratchpadConsoleOutput) {
          scratchpadConsoleOutput.innerHTML = `
            <div class="gemini-hint-box" style="background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.5); border-radius: 6px; padding: 10px 12px; margin-bottom: 12px;">
              <div style="color: #C084FC; font-weight: bold; font-size: 0.82rem; margin-bottom: 4px;">💡 COACH ADA [AI • ${GEMINI_MODEL}]:</div>
              <div style="color: #F1F5F9; font-size: 0.85rem; line-height: 1.45;">${escapeHtml(hint)}</div>
            </div>
          ` + scratchpadConsoleOutput.innerHTML;
        }
      } catch (err) {
        if (scratchpadConsoleOutput) {
          scratchpadConsoleOutput.innerHTML = `<div class="test-fail">⚠️ AI Hint Error: ${escapeHtml(err.message)}</div>` + scratchpadConsoleOutput.innerHTML;
        }
      } finally {
        btnScratchpadHint.disabled = false;
        btnScratchpadHint.textContent = '💡 AI HINT';
      }
    });
  }

  // Gemini AI Code Explainer
  const btnScratchpadExplain = document.getElementById('btn-scratchpad-explain');
  if (btnScratchpadExplain) {
    btnScratchpadExplain.addEventListener('click', async () => {
      if (!scratchpadCode) return;
      sounds.playClick();
      btnScratchpadExplain.disabled = true;
      btnScratchpadExplain.textContent = '⏳ ANALYZING...';
      try {
        const script = scratchpadCode.value;
        const lang = scratchpadLangSelect ? scratchpadLangSelect.value : 'python3';
        const analysis = await explainCodeWithGemini(script, lang);
        sounds.playReward();
        if (scratchpadConsoleOutput) {
          scratchpadConsoleOutput.innerHTML = `
            <div class="gemini-explain-box" style="background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 6px; padding: 10px 12px; margin-bottom: 12px;">
              <div style="color: #38BDF8; font-weight: bold; font-size: 0.82rem; margin-bottom: 6px;">🧠 CODE ANALYSIS [AI • ${GEMINI_MODEL}]:</div>
              <div style="color: #E2E8F0; font-size: 0.85rem; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(analysis)}</div>
            </div>
          ` + scratchpadConsoleOutput.innerHTML;
        }
      } catch (err) {
        if (scratchpadConsoleOutput) {
          scratchpadConsoleOutput.innerHTML = `<div class="test-fail">⚠️ Code Analysis Error: ${escapeHtml(err.message)}</div>` + scratchpadConsoleOutput.innerHTML;
        }
      } finally {
        btnScratchpadExplain.disabled = false;
        btnScratchpadExplain.textContent = '🧠 EXPLAIN CODE';
      }
    });
  }
}

function openJDoodleScratchpad(customTitle = null, customCode = null) {
  sounds.playModalOpen();
  if (scratchpadOverlay) scratchpadOverlay.classList.add('active');

  const titleEl = document.getElementById('scratchpad-title');
  if (titleEl) {
    titleEl.textContent = customTitle || `GEMINI AI CODE COMPILER (${GEMINI_MODEL})`;
  }

  if (scratchpadStatusPill) {
    if (isGeminiConfigured()) {
      scratchpadStatusPill.innerHTML = `<span class="jdoodle-dot green-dot"></span> GEMINI 3.6 FLASH`;
      scratchpadStatusPill.className = 'jdoodle-live-pill pill-online';
    } else {
      scratchpadStatusPill.innerHTML = `<span class="jdoodle-dot yellow-dot"></span> GEMINI SANDBOX`;
      scratchpadStatusPill.className = 'jdoodle-live-pill pill-sandbox';
    }
  }

  if (customCode && scratchpadCode) {
    scratchpadCode.value = customCode;
  }
}

function openJDoodleScratchpadForProblem(title, lcId) {
  const lang = scratchpadLangSelect ? scratchpadLangSelect.value : 'python3';
  let starter = '';
  if (lang === 'python3') {
    starter = `# LeetCode #${lcId}: ${title}\n# Cloud-compiled via Google Gemini API (${GEMINI_MODEL})\n\ndef solution():\n    print("Executing solution for: ${title}")\n    return "PASSED"\n\n# Run demonstration\nres = solution()\nprint("Result:", res)\n`;
  } else {
    starter = `// LeetCode #${lcId}: ${title}\n// Cloud-compiled via Google Gemini API (${GEMINI_MODEL})\n\nfunction solution() {\n  console.log("Executing solution for: ${title}");\n  return "PASSED";\n}\n\n// Run demonstration\nconst res = solution();\nconsole.log("Result:", res);\n`;
  }
  openJDoodleScratchpad(`LEETCODE #${lcId} WORKBENCH`, starter);
}

function closeJDoodleScratchpad() {
  sounds.playModalClose();
  if (scratchpadOverlay) scratchpadOverlay.classList.remove('active');
}

async function runScratchpadCode() {
  if (!scratchpadCode) return;
  sounds.playClick();

  const script = scratchpadCode.value;
  const lang = scratchpadLangSelect ? scratchpadLangSelect.value : 'python3';

  if (scratchpadConsoleStatus) {
    scratchpadConsoleStatus.textContent = `Compiling via Gemini AI (${GEMINI_MODEL})...`;
    scratchpadConsoleStatus.className = "console-status running";
  }

  if (scratchpadConsoleOutput) {
    scratchpadConsoleOutput.innerHTML = `
      <div class="compiling-notice">
        <span class="pulse-radar-mini"></span>
        <span>Transmitting script payload to <strong>Google Gemini API (${GEMINI_MODEL})</strong> (${lang})...</span>
      </div>
    `;
  }

  if (btnScratchpadRun) btnScratchpadRun.disabled = true;

  try {
    const res = await executeCodeWithGemini({
      script,
      language: lang,
      versionIndex: '4'
    });

    let outputHtml = `
      <div class="jdoodle-result-header">
        <div class="jdoodle-brand">
          <span class="jdoodle-icon">⚡</span>
          <strong>${res.isMockFallback ? 'GEMINI COMPILER (SANDBOX)' : 'GEMINI CLOUD COMPILER (' + GEMINI_MODEL + ')'}</strong>
          <span class="jdoodle-status-tag ${res.success ? 'tag-pass' : 'tag-warn'}">STATUS: ${res.statusCode || 200}</span>
        </div>
        <div class="jdoodle-stats">
          <span>CPU: <strong>${res.cpuTime || '0.04s'}</strong></span>
          <span>MEM: <strong>${res.memory || '38KB'}</strong></span>
        </div>
      </div>
    `;

    const displayOutput = (res.output || '').trim();
    outputHtml += `
      <div class="jdoodle-stdout-wrap">
        <div class="jdoodle-stdout-title">STANDARD OUTPUT (STDOUT):</div>
        <pre class="jdoodle-stdout-box">${escapeHtml(displayOutput || 'Program completed with no output.')}</pre>
      </div>
    `;

    if (res.success) {
      sounds.playReward();
      if (scratchpadConsoleStatus) {
        scratchpadConsoleStatus.textContent = "EXECUTION SUCCESSFUL (200 OK)";
        scratchpadConsoleStatus.className = "console-status pass";
      }
    } else {
      sounds.playClick();
      if (scratchpadConsoleStatus) {
        scratchpadConsoleStatus.textContent = "EXECUTION ERROR";
        scratchpadConsoleStatus.className = "console-status fail";
      }
    }

    if (scratchpadConsoleOutput) {
      scratchpadConsoleOutput.innerHTML = outputHtml;
    }
  } catch (err) {
    sounds.playClick();
    if (scratchpadConsoleStatus) {
      scratchpadConsoleStatus.textContent = "RUNTIME ERROR";
      scratchpadConsoleStatus.className = "console-status fail";
    }
    if (scratchpadConsoleOutput) {
      scratchpadConsoleOutput.innerHTML = `<div class="test-fail">⚠️ Error: ${escapeHtml(err.message)}</div>`;
    }
  } finally {
    if (btnScratchpadRun) btnScratchpadRun.disabled = false;
  }
}
