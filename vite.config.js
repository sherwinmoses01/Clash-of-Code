import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      {
        name: 'jdoodle-proxy-middleware',
        configureServer(server) {
          server.middlewares.use('/api/jdoodle/execute', (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end('Method Not Allowed');
              return;
            }

            let body = '';
            req.on('data', chunk => {
              body += chunk;
            });

            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const rawId = parsed.clientId || env.VITE_JDOODLE_CLIENT_ID || env.JDOODLE_CLIENT_ID || '';
                const rawSec = parsed.clientSecret || env.VITE_JDOODLE_CLIENT_SECRET || env.JDOODLE_CLIENT_SECRET || '';
                const clientId = String(rawId).replace(/^["']|["']$/g, '');
                const clientSecret = String(rawSec).replace(/^["']|["']$/g, '');
                const targetUrl = (env.VITE_JDOODLE_API_URL || 'https://api.jdoodle.com/v1/execute').replace(/^["']|["']$/g, '');
                const script = parsed.script || '';
                const language = parsed.language || 'nodejs';
                const stdin = parsed.stdin || '';

                let cloudResult = null;
                // 1. Try JDoodle Cloud API if keys are provided
                if (clientId && clientSecret && !clientId.includes('your_')) {
                  try {
                    const response = await fetch(targetUrl, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        clientId,
                        clientSecret,
                        script,
                        language,
                        versionIndex: parsed.versionIndex || '4',
                        stdin
                      })
                    });
                    cloudResult = await response.json();
                  } catch (netErr) {
                    console.warn('[JDoodle Cloud Fetch Warning]:', netErr.message);
                  }
                }

                // 2. If JDoodle Cloud succeeded (200) and no daily limit error, return cloud output
                if (cloudResult && cloudResult.statusCode === 200 && !cloudResult.error) {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(cloudResult));
                  return;
                }

                // 3. Fallback: If JDoodle daily limit is reached (429), or network error, execute locally via system node/python
                const isLimit = cloudResult && (cloudResult.statusCode === 429 || (cloudResult.error && cloudResult.error.toLowerCase().includes('daily limit')));
                console.info(`[JDoodle Compiler] ${isLimit ? 'Daily limit reached on cloud' : 'Cloud offline'}: Compiling ${language} via local system engine...`);

                const tmpExt = (language === 'python3' || language === 'python') ? '.py' : '.js';
                const tmpFile = path.join(os.tmpdir(), `coc_eval_${Date.now()}_${Math.random().toString(36).slice(2)}${tmpExt}`);

                try {
                  fs.writeFileSync(tmpFile, script, 'utf8');
                  const cmd = (language === 'python3' || language === 'python')
                    ? `python "${tmpFile}"`
                    : `node "${tmpFile}"`;

                  const stdout = execSync(cmd, {
                    encoding: 'utf8',
                    timeout: 8000,
                    input: stdin
                  });

                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    output: stdout || 'Program completed with no output.',
                    statusCode: 200,
                    memory: '38KB',
                    cpuTime: '0.02s',
                    isMockFallback: true,
                    notice: isLimit
                      ? 'JDoodle Cloud Daily Limit Reached (429) -> Executed & Verified via Local System Compiler'
                      : 'Verified via Local Compiler Engine'
                  }));
                } catch (execErr) {
                  // User's code threw syntax error or runtime error
                  const errOutput = execErr.stdout || execErr.stderr || execErr.message;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    output: errOutput,
                    statusCode: 200,
                    memory: '38KB',
                    cpuTime: '0.02s',
                    isMockFallback: true,
                    runtimeError: execErr.stderr || execErr.message
                  }));
                } finally {
                  try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch (e) {}
                }
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message, statusCode: 500 }));
              }
            });
          });
        }
      }
    ],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          clan: resolve(__dirname, 'clan.html'),
          ranked: resolve(__dirname, 'ranked.html'),
          war: resolve(__dirname, 'war.html'),
          learn: resolve(__dirname, 'learn.html'),
        },
      },
    },
  };
});
