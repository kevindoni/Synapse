#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const args = process.argv.slice(2);
const command = args[0] || 'start';

const PORT = process.env.PORT || process.env.SYNAPSE_PORT || 3000;

function getPkgDir() {
  return path.resolve(__dirname, '..');
}

function getPidFile() {
  const dataDir = process.env.DATA_DIR || path.join(os.homedir(), '.synapse');
  return path.join(dataDir, 'synapse.pid');
}

function isRunning() {
  const pidFile = getPidFile();
  if (!fs.existsSync(pidFile)) return false;
  try {
    const pid = parseInt(fs.readFileSync(pidFile, 'utf8').trim());
    process.kill(pid, 0);
    return true;
  } catch {
    try { fs.unlinkSync(pidFile); } catch {}
    return false;
  }
}

function ensureDataDir() {
  const dataDir = process.env.DATA_DIR || path.join(os.homedir(), '.synapse');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function buildIfNeeded() {
  const PKG_DIR = getPkgDir();
  const standaloneDir = path.join(PKG_DIR, '.next', 'standalone');
  if (fs.existsSync(path.join(standaloneDir, 'server.js'))) return;

  console.log('⚡ Building Synapse (first time)...');
  try {
    execSync('npx next build', { cwd: PKG_DIR, stdio: 'inherit' });
    console.log('⚡ Build complete!');
  } catch {
    console.error('❌ Build failed. Try running manually: npm run build');
    process.exit(1);
  }
}

function startServer() {
  if (isRunning()) {
    console.log(`⚡ Synapse is already running on http://localhost:${PORT}`);
    return;
  }

  ensureDataDir();
  buildIfNeeded();

  const PKG_DIR = getPkgDir();
  const standaloneServer = path.join(PKG_DIR, '.next', 'standalone', 'server.js');

  const env = {
    ...process.env,
    PORT,
    HOSTNAME: '0.0.0.0',
  };

  const child = spawn(process.execPath, [standaloneServer], {
    cwd: PKG_DIR,
    detached: true,
    stdio: 'ignore',
    env,
  });

  child.unref();

  const pidFile = getPidFile();
  fs.writeFileSync(pidFile, child.pid.toString());

  console.log(``);
  console.log(`  ⚡ Synapse started`);
  console.log(`  ─────────────────────────`);
  console.log(`  URL:    http://localhost:${PORT}`);
  console.log(`  Login:  http://localhost:${PORT}/login`);
  console.log(`  PID:    ${child.pid}`);
  console.log(`  Data:   ${process.env.DATA_DIR || path.join(os.homedir(), '.synapse')}`);
  console.log(``);
  console.log(`  Use "synapse stop" to stop.`);
  console.log(``);
}

function stopServer() {
  if (!isRunning()) {
    console.log('⚡ Synapse is not running');
    return;
  }
  try {
    const pid = parseInt(fs.readFileSync(getPidFile(), 'utf8').trim());
    process.kill(pid);
    try { fs.unlinkSync(getPidFile()); } catch {}
    console.log('⚡ Synapse stopped');
  } catch {
    try { fs.unlinkSync(getPidFile()); } catch {}
    console.log('⚡ Synapse is not running');
  }
}

function showStatus() {
  if (isRunning()) {
    const pid = fs.readFileSync(getPidFile(), 'utf8').trim();
    console.log(`⚡ Synapse is running`);
    console.log(`   URL:  http://localhost:${PORT}`);
    console.log(`   PID:  ${pid}`);
    console.log(`   Data: ${process.env.DATA_DIR || path.join(os.homedir(), '.synapse')}`);
  } else {
    console.log('⚡ Synapse is not running');
    console.log('   Run "synapse start" to start');
  }
}

function showHelp() {
  console.log(`
  ⚡ Synapse — AI Gateway & Intelligence Platform

  Usage:
    synapse <command>

  Commands:
    start       Start server (production)
    stop        Stop server
    restart     Restart server
    status      Show server status
    dev         Start in development mode (hot reload)
    build       Build for production
    version     Show version
    help        Show this help

  Environment:
    PORT              Server port (default: 3000)
    SYNAPSE_PASSWORD  Login password (default: changeme)
    JWT_SECRET        JWT secret key
    DATA_DIR          Data directory (default: ~/.synapse)

  Examples:
    synapse                        Start on port 3000
    PORT=8080 synapse start        Start on port 8080
    synapse dev                    Development mode
    synapse stop                   Stop server
    synapse status                 Check if running
`);
}

function showVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(getPkgDir(), 'package.json'), 'utf8'));
    console.log(`⚡ Synapse v${pkg.version}`);
  } catch {
    console.log('⚡ Synapse v2.0.0');
  }
}

function startDev() {
  const PKG_DIR = getPkgDir();
  console.log(`⚡ Starting Synapse in dev mode on http://localhost:${PORT}`);
  const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const child = spawn(cmd, ['next', 'dev', '-p', PORT], {
    cwd: PKG_DIR,
    stdio: 'inherit',
    env: { ...process.env, PORT },
  });
  child.on('close', (code) => process.exit(code));
}

function runBuild() {
  buildIfNeeded();
  console.log('⚡ Build complete!');
}

switch (command) {
  case 'start':
    startServer();
    break;
  case 'stop':
    stopServer();
    break;
  case 'restart':
    stopServer();
    setTimeout(() => startServer(), 500);
    break;
  case 'status':
    showStatus();
    break;
  case 'dev':
    startDev();
    break;
  case 'build':
    runBuild();
    break;
  case 'version':
  case '-v':
  case '--version':
    showVersion();
    break;
  case 'help':
  case '-h':
  case '--help':
  default:
    showHelp();
    break;
}
