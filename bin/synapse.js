#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const args = process.argv.slice(2);
const command = args[0] || 'start';

const PKG_DIR = path.resolve(__dirname, '..');
const PORT = process.env.PORT || process.env.SYNAPSE_PORT || 3000;

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
    fs.unlinkSync(pidFile);
    return false;
  }
}

function ensureDataDir() {
  const dataDir = process.env.DATA_DIR || path.join(os.homedir(), '.synapse');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function startServer() {
  if (isRunning()) {
    console.log(`⚡ Synapse is already running on http://localhost:${PORT}`);
    return;
  }

  ensureDataDir();

  const standaloneDir = path.join(PKG_DIR, '.next', 'standalone');
  if (!fs.existsSync(standaloneDir)) {
    console.log('⚡ Building Synapse for the first time...');
    try {
      execSync('npx next build', { cwd: PKG_DIR, stdio: 'inherit' });
    } catch {
      console.error('❌ Build failed. Run "synapse dev" for development mode.');
      process.exit(1);
    }
  }

  const cmd = process.execPath;
  const cmdArgs = [path.join(standaloneDir, 'server.js')];

  const child = spawn(cmd, cmdArgs, {
    cwd: PKG_DIR,
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, PORT },
  });

  child.unref();

  const pidFile = getPidFile();
  fs.writeFileSync(pidFile, child.pid.toString());

  console.log(`⚡ Synapse started on http://localhost:${PORT}`);
  console.log(`   PID: ${child.pid}`);
  console.log(`   Data: ~/.synapse/`);
  console.log(`   Login: http://localhost:${PORT}/login`);
}

function stopServer() {
  const pidFile = getPidFile();
  if (!fs.existsSync(pidFile)) {
    console.log('⚡ Synapse is not running');
    return;
  }

  try {
    const pid = parseInt(fs.readFileSync(pidFile, 'utf8').trim());
    process.kill(pid);
    fs.unlinkSync(pidFile);
    console.log('⚡ Synapse stopped');
  } catch {
    fs.unlinkSync(pidFile);
    console.log('⚡ Synapse is not running');
  }
}

function showStatus() {
  if (isRunning()) {
    const pid = fs.readFileSync(getPidFile(), 'utf8').trim();
    console.log(`⚡ Synapse is running`);
    console.log(`   URL: http://localhost:${PORT}`);
    console.log(`   PID: ${pid}`);
    console.log(`   Data: ~/.synapse/`);
  } else {
    console.log('⚡ Synapse is not running');
    console.log('   Run `synapse start` to start');
  }
}

function showHelp() {
  console.log(`
⚡ Synapse — AI Gateway & Intelligence Platform

Usage: synapse <command>

Commands:
  start     Start the Synapse server (default)
  stop      Stop the Synapse server
  restart   Restart the Synapse server
  status    Show server status
  dev       Start in development mode
  version   Show version
  help      Show this help message

Environment:
  PORT          Server port (default: 3000)
  SYNAPSE_PASSWORD  Admin login password (default: changeme)
  JWT_SECRET    JWT secret key
  DATA_DIR      Data directory (default: ~/.synapse)

Examples:
  synapse                    # Start server
  synapse start              # Start server
  synapse stop               # Stop server
  synapse status             # Check status
  PORT=8080 synapse start    # Start on port 8080
`);
}

function showVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(PKG_DIR, 'package.json'), 'utf8'));
    console.log(`⚡ Synapse v${pkg.version}`);
  } catch {
    console.log('⚡ Synapse v2.0.0');
  }
}

function startDev() {
  console.log(`⚡ Starting Synapse in development mode on http://localhost:${PORT}`);
  const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const child = spawn(cmd, ['next', 'dev', '-p', PORT], {
    cwd: PKG_DIR,
    stdio: 'inherit',
    env: { ...process.env, PORT },
  });
  child.on('close', (code) => process.exit(code));
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
