import { execSync } from 'node:child_process';

const port = process.env.PORT ?? 3011;

function run(command) {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return '';
  }
}

function freePortWindows() {
  const output = run(`netstat -ano | findstr :${port}`);
  if (!output) return;

  const pids = new Set(
    output
      .split('\n')
      .map((line) => line.trim().split(/\s+/).pop())
      .filter(Boolean),
  );

  for (const pid of pids) {
    run(`taskkill /F /PID ${pid}`);
    console.log(`[free-port] Liberado el puerto ${port} (PID ${pid})`);
  }
}

function freePortUnix() {
  const output = run(`lsof -ti tcp:${port}`);
  if (!output) return;

  const pids = output.split('\n').filter(Boolean);

  for (const pid of pids) {
    run(`kill -9 ${pid}`);
    console.log(`[free-port] Liberado el puerto ${port} (PID ${pid})`);
  }
}

if (process.platform === 'win32') {
  freePortWindows();
} else {
  freePortUnix();
}
