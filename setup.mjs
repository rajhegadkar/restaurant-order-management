#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = new Set(process.argv.slice(2));
const shouldStart = args.has('--start');
const shouldBuild = args.has('--build');
const openBrowser = args.has('--open');

function getLanIP() {
  const interfaces = os.networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        const lower = name.toLowerCase();
        const isVirtual = /vethernet|vmware|virtualbox|vbox|wsl|hyper-v|docker|loopback|tailscale|zerotier/.test(lower);
        const isPreferred = /wi-fi|wifi|wlan|ethernet|en0|eth0/.test(lower);
        candidates.push({ address: iface.address, priority: isPreferred && !isVirtual ? 0 : isVirtual ? 2 : 1 });
      }
    }
  }
  candidates.sort((a, b) => a.priority - b.priority);
  return candidates[0]?.address || '127.0.0.1';
}

function logBanner() {
  console.log('\n============================================================');
  console.log('  Restaurant Online Ordering & QR Table Management Setup');
  console.log('============================================================\n');
}

function ensureEnvFile() {
  const envPath = path.join(__dirname, '.env');
  const examplePath = path.join(__dirname, '.env.example');
  if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log('[OK] Created .env from .env.example (Local + LAN mode ready).');
  } else if (fs.existsSync(envPath)) {
    console.log('[OK] Existing .env file found.');
  }
}

function ensureDataDir() {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('[OK] Initialized data/ directory for real-time LAN sync.');
  } else {
    console.log('[OK] Data directory ready.');
  }
}

function ensureDependencies() {
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  const viteBin = path.join(nodeModulesPath, '.bin', process.platform === 'win32' ? 'vite.cmd' : 'vite');
  if (!fs.existsSync(nodeModulesPath) || !fs.existsSync(viteBin)) {
    console.log('[..] Installing dependencies (npm install)...');
    execSync('npm install', { cwd: __dirname, stdio: 'inherit' });
    console.log('[OK] Dependencies installed.');
  } else {
    console.log('[OK] Dependencies already installed.');
  }
}

function ensureProductionBuild() {
  const distIndex = path.join(__dirname, 'dist', 'index.html');
  if (shouldBuild || !fs.existsSync(distIndex)) {
    console.log('[..] Building production bundle (npm run build)...');
    execSync('npm run build', { cwd: __dirname, stdio: 'inherit' });
    console.log('[OK] Production build ready in dist/.');
  } else {
    console.log('[OK] Production build (dist/) already present.');
  }
}

function openUrlInBrowser(url) {
  try {
    if (process.platform === 'win32') {
      spawn('cmd', ['/c', 'start', '', url], { detached: true, stdio: 'ignore' }).unref();
    } else if (process.platform === 'darwin') {
      spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
    } else {
      spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
    }
  } catch {
    // Non-fatal if running in a headless environment
  }
}

function printSummary(lanIp, port) {
  console.log('\n------------------------------------------------------------');
  console.log('  SETUP COMPLETE! Access URLs:');
  console.log(`  - Customer Storefront (Local): http://localhost:${port}/`);
  console.log(`  - Customer Storefront (LAN):   http://${lanIp}:${port}/`);
  console.log(`  - Table 01 QR Demo:            http://${lanIp}:${port}/order?table=Table%2001&token=tok_tbl01_948a`);
  console.log(`  - Admin Control Panel:         http://localhost:${port}/admin`);
  console.log(`  - Kitchen Display (KDS):       http://localhost:${port}/admin/kitchen`);
  console.log('\n  Demo Admin Login:');
  console.log('  - Email:    admin@restaurant.com');
  console.log('  - Password: admin123');
  console.log('------------------------------------------------------------\n');
}

function main() {
  logBanner();
  ensureEnvFile();
  ensureDataDir();
  ensureDependencies();

  const port = 5173;
  const lanIp = getLanIP();

  if (shouldBuild || shouldStart) {
    ensureProductionBuild();
  }

  printSummary(lanIp, port);

  if (shouldStart) {
    const distExists = fs.existsSync(path.join(__dirname, 'dist', 'index.html'));
    const viteScript = distExists ? 'start:prod' : 'dev';
    console.log(`[..] Starting server via "npm run ${viteScript}" on port ${port}...\n`);

    if (openBrowser) {
      setTimeout(() => openUrlInBrowser(`http://localhost:${port}/`), 2000);
    }

    const command = `npm run ${viteScript}`;
    const child = spawn(command, {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true,
    });

    child.on('exit', (code) => process.exit(code ?? 0));
  } else {
    console.log('Next step: Run "npm start" or double-click Start-Restaurant-App.bat\n');
  }
}

main();
