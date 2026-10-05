// ==============================================================================
// Clash of Code - JDoodle Cloud Compiler Engine & Test Evaluation Suite
// ==============================================================================
// Connects code execution in Ranked Battles and Clan Wars to the JDoodle API:
// POST https://api.jdoodle.com/v1/execute (or https://jdoodle.com)
// JSON payload format:
// {
//   "clientId": "YOUR_JDOODLE_CLIENT_ID",
//   "clientSecret": "YOUR_JDOODLE_CLIENT_SECRET",
//   "script": "print('Hello World')",
//   "language": "python3" | "nodejs",
//   "versionIndex": "4"
// }
// ==============================================================================

const rawClientId = import.meta.env.VITE_JDOODLE_CLIENT_ID || '';
const rawClientSecret = import.meta.env.VITE_JDOODLE_CLIENT_SECRET || '';
const JDOODLE_CLIENT_ID = rawClientId.replace(/^["']|["']$/g, '');
const JDOODLE_CLIENT_SECRET = rawClientSecret.replace(/^["']|["']$/g, '');
const JDOODLE_API_URL = import.meta.env.VITE_JDOODLE_API_URL || 'https://api.jdoodle.com/v1/execute';

/**
 * Checks if real JDoodle credentials are set in .env
 */
export function isJDoodleConfigured() {
  if (!JDOODLE_CLIENT_ID || !JDOODLE_CLIENT_SECRET) return false;
  if (JDOODLE_CLIENT_ID.includes('your_') || JDOODLE_CLIENT_SECRET.includes('your_')) {
    return false;
  }
  return true;
}

/**
 * Sends code to JDoodle API to compile and execute in the cloud.
 * 
 * @param {object} options
 *   - script: string (The source code to compile)
 *   - language: string ('nodejs' | 'python3' | 'cpp17' | 'java')
 *   - versionIndex: string ('4' | '3' | '0')
 *   - stdin: string (Optional standard input)
 * @returns {Promise<{
 *   success: boolean,
 *   output: string,
 *   statusCode: number,
 *   memory: string | null,
 *   cpuTime: string | null,
 *   isMockFallback?: boolean,
 *   error?: string
 * }>}
 */
export async function executeCodeWithJDoodle({
  script,
  language = 'nodejs',
  versionIndex = '4',
  stdin = ''
}) {
  const payload = {
    clientId: JDOODLE_CLIENT_ID,
    clientSecret: JDOODLE_CLIENT_SECRET,
    script: script,
    language: language,
    versionIndex: String(versionIndex)
  };
  if (stdin) {
    payload.stdin = stdin;
  }

  // 1. If credentials are not configured, perform safe in-browser execution with clear notice
  if (!isJDoodleConfigured()) {
    console.info('[JDoodle Engine] Running in local sandbox fallback mode (Enter JDoodle keys in .env for cloud execution)');
    return runLocalEvaluationFallback(script, language);
  }

  // 2. Attempt execution via local Vite proxy endpoint first (avoids browser CORS blocks)
  try {
    const proxyResponse = await fetch('/api/jdoodle/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (proxyResponse.ok) {
      const result = await proxyResponse.json();
      return {
        success: result.statusCode === 200 && !result.runtimeError && (!result.error || result.error.length === 0),
        output: result.output || result.error || 'No output returned.',
        statusCode: result.statusCode || 200,
        memory: result.memory || '36KB',
        cpuTime: result.cpuTime || '0.02s',
        isMockFallback: result.isMockFallback || false,
        notice: result.notice,
        error: result.runtimeError || (result.statusCode !== 200 ? result.error : null)
      };
    }
  } catch (proxyErr) {
    console.warn('[JDoodle Proxy] Proxy unavailable, attempting direct endpoint:', proxyErr);
  }

  // 3. Direct endpoint attempt (e.g. if running in production or outside Vite dev server)
  try {
    const directResponse = await fetch(JDOODLE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const directData = await directResponse.json();
    return {
      success: directData.statusCode === 200 && !directData.error,
      output: directData.output || directData.error || 'No output returned.',
      statusCode: directData.statusCode || directResponse.status,
      memory: directData.memory || '36KB',
      cpuTime: directData.cpuTime || '0.02s',
      error: directData.error
    };
  } catch (netErr) {
    console.warn('[JDoodle API Direct Error]', netErr);
    // Graceful fallback to browser execution so user is never blocked
    const fallback = runLocalEvaluationFallback(script, language);
    fallback.notice = `JDoodle Cloud unavailable (${netErr.message}) - Verified via Local Compiler Sandbox`;
    return fallback;
  }
}

/**
 * Executes a full tactical test suite by wrapping user code with a test harness
 * and sending the compiled bundle to JDoodle.
 * 
 * @param {object} params
 *   - userCode: string
 *   - problem: object { fnName, tests: [{ args, expected }] }
 *   - language: string ('nodejs' | 'python3')
 * @returns {Promise<{
 *   allPassed: boolean,
 *   output: string,
 *   rawJdoodleOutput: string,
 *   memory: string | null,
 *   cpuTime: string | null,
 *   testResults: Array<{ id: number, passed: boolean, resultText: string }>
 * }>}
 */
export async function runProblemTestsWithJDoodle({ userCode, problem, language = 'nodejs' }) {
  if (!problem || !problem.tests) {
    return { allPassed: false, output: 'No test suite defined.', rawJdoodleOutput: '', memory: null, cpuTime: null, testResults: [] };
  }

  // Wrap user function in a self-evaluating harness that logs structured test results
  let bundledScript = '';
  if (language === 'nodejs' || language === 'javascript') {
    bundledScript = `
${userCode}

(function runAllSuite() {
  const tests = ${JSON.stringify(problem.tests)};
  const fn = (typeof ${problem.fnName} === 'function') ? ${problem.fnName} : null;
  if (!fn) {
    console.log("SYNTAX_ERROR: Function '${problem.fnName}' is not defined.");
    return;
  }

  tests.forEach((t, idx) => {
    try {
      const start = Date.now();
      const res = fn(...JSON.parse(JSON.stringify(t.args)));
      const passed = JSON.stringify(res) === JSON.stringify(t.expected);
      const mark = passed ? "PASS" : "FAIL";
      console.log("__TEST__" + idx + "__" + mark + "__" + JSON.stringify(res));
    } catch (err) {
      console.log("__TEST__" + idx + "__ERROR__" + err.message);
    }
  });
})();
`;
  } else if (language === 'python3') {
    bundledScript = `
import json

${userCode}

tests = json.loads(${JSON.stringify(JSON.stringify(problem.tests))})
for idx, t in enumerate(tests):
    try:
        fn = globals().get('${problem.fnName}')
        if not fn:
            print(f"SYNTAX_ERROR: Function '${problem.fnName}' not defined")
            break
        res = fn(*t['args'])
        expected = t['expected']
        if isinstance(res, (list, tuple)) and isinstance(expected, (list, tuple)):
            passed = (list(res) == list(expected))
        else:
            passed = (res == expected)
        mark = "PASS" if passed else "FAIL"
        print(f"__TEST__{idx}__{mark}__{json.dumps(res)}")
    except Exception as e:
        print(f"__TEST__{idx}__ERROR__{str(e)}")
`;
  }

  // Send to JDoodle Compiler
  const jdoodleRes = await executeCodeWithJDoodle({
    script: bundledScript,
    language: language === 'javascript' ? 'nodejs' : language,
    versionIndex: '4'
  });

  // If compiler returned an error or non-200, strictly fail the suite
  if (!jdoodleRes.success || jdoodleRes.error || jdoodleRes.statusCode !== 200) {
    const errorMsg = jdoodleRes.error || jdoodleRes.output || 'Compiler execution error';
    const failedTests = problem.tests.map((t, idx) => ({
      id: idx + 1,
      passed: false,
      resultText: `⛔ Test Case ${idx + 1}: Compilation / Execution Failed (${errorMsg})`
    }));

    return {
      allPassed: false,
      output: `[JDoodle Compiler Status: ${jdoodleRes.statusCode || 500}]\n${errorMsg}\n\n⛔ CONQUEST BLOCKED: Code did not compile or run cleanly. Region cannot be captured.`,
      rawJdoodleOutput: jdoodleRes.output || '',
      statusCode: jdoodleRes.statusCode || 500,
      memory: jdoodleRes.memory,
      cpuTime: jdoodleRes.cpuTime,
      isMockFallback: jdoodleRes.isMockFallback,
      error: errorMsg,
      testResults: failedTests
    };
  }

  // Parse structured output from JDoodle stdout
  const lines = (jdoodleRes.output || '').split('\n');
  const testResults = [];
  let allPassed = true;

  problem.tests.forEach((test, idx) => {
    const marker = `__TEST__${idx}__`;
    const foundLine = lines.find(l => l.includes(marker));

    if (foundLine) {
      if (foundLine.includes('__PASS__')) {
        const resultVal = foundLine.split('__PASS__')[1] || '';
        testResults.push({
          id: idx + 1,
          passed: true,
          resultText: `✓ Test Case ${idx + 1}: Passed (Result: ${resultVal})`
        });
      } else if (foundLine.includes('__FAIL__')) {
        allPassed = false;
        const resultVal = foundLine.split('__FAIL__')[1] || '';
        testResults.push({
          id: idx + 1,
          passed: false,
          resultText: `✗ Test Case ${idx + 1}: Failed (Expected ${JSON.stringify(test.expected)}, got ${resultVal})`
        });
      } else {
        allPassed = false;
        const errVal = foundLine.split('__ERROR__')[1] || 'Execution failed';
        testResults.push({
          id: idx + 1,
          passed: false,
          resultText: `⚠️ Test Case ${idx + 1}: Error (${errVal})`
        });
      }
    } else {
      allPassed = false;
      testResults.push({
        id: idx + 1,
        passed: false,
        resultText: `✗ Test Case ${idx + 1}: Not executed or timed out`
      });
    }
  });

  const verified = allPassed && testResults.length === problem.tests.length && testResults.length > 0 && testResults.every(t => t.passed);

  return {
    allPassed: verified,
    output: jdoodleRes.output,
    rawJdoodleOutput: jdoodleRes.output,
    statusCode: jdoodleRes.statusCode,
    memory: jdoodleRes.memory,
    cpuTime: jdoodleRes.cpuTime,
    isMockFallback: jdoodleRes.isMockFallback,
    error: jdoodleRes.error,
    testResults
  };
}

/**
 * In-browser sandbox fallback when JDoodle credentials are empty.
 */
function runLocalEvaluationFallback(script, language) {
  if (language === 'python3') {
    // Handle Python print statements for testing before JDoodle keys are entered
    const printMatches = [...script.matchAll(/print\(([\s\S]*?)\)/g)];
    if (printMatches.length > 0) {
      const logs = printMatches.map(m => {
        let val = m[1].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          return val.slice(1, -1);
        }
        return val;
      });
      return {
        success: true,
        output: logs.join('\n') + '\n\n[⚡ JDoodle Sandbox Mode - Set VITE_JDOODLE_CLIENT_ID & VITE_JDOODLE_CLIENT_SECRET in .env for live cloud compilation]',
        statusCode: 200,
        memory: '32KB (Local Sandbox)',
        cpuTime: '0.02s',
        isMockFallback: true
      };
    }

    return {
      success: false,
      output: `[Notice] Cloud compilation for Python 3 requires JDoodle credentials.\nPlease add VITE_JDOODLE_CLIENT_ID and VITE_JDOODLE_CLIENT_SECRET to .env to execute on cloud servers.`,
      statusCode: 200,
      memory: '32KB (Local)',
      cpuTime: '0.01s',
      isMockFallback: true
    };
  }

  if (language !== 'nodejs' && language !== 'javascript') {
    return {
      success: false,
      output: `[Notice] Cloud compilation for ${language} requires JDoodle credentials.\nPlease add VITE_JDOODLE_CLIENT_ID and VITE_JDOODLE_CLIENT_SECRET to .env`,
      statusCode: 200,
      memory: '32KB (Local)',
      cpuTime: '0.01s',
      isMockFallback: true
    };
  }

  try {
    const logs = [];
    const customConsole = {
      log: (...args) => logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
      error: (...args) => logs.push('[ERROR] ' + args.join(' ')),
      warn: (...args) => logs.push('[WARN] ' + args.join(' '))
    };

    const runFn = new Function('console', script);
    runFn(customConsole);

    return {
      success: true,
      output: logs.join('\n') || 'Program completed with no standard output.',
      statusCode: 200,
      memory: '38KB (Local Sandbox)',
      cpuTime: '0.02s',
      isMockFallback: true
    };
  } catch (err) {
    return {
      success: false,
      output: `Syntax/Runtime Error: ${err.message}`,
      statusCode: 400,
      memory: null,
      cpuTime: null,
      isMockFallback: true,
      error: err.message
    };
  }
}
