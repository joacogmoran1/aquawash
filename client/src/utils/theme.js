export const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@300;400;500&family=Geist:wght@300;400;500;600&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body, #root {
    min-height: 100%;
  }

  html { overflow-x: hidden; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  img, svg, video, canvas { display: block; max-width: 100%; }
  button, input, textarea, select { font: inherit; }
  a { color: inherit; text-decoration: none; }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: var(--surface); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

  :root {
    --sidebar-width: 220px;
    --bg: #0b0c10;
    --surface: #0f1117;
    --card: #0f1218;
    --card2: #0c0e13;
    --border: #2a2f3a;
    --border2: #343a46;
    --cyan: #2f80ff;
    --cyan-dim: #256fda;
    --cyan-glow: rgba(47, 128, 255, 0.14);
    --green: #2fbf71;
    --orange: #f2c66d;
    --red: #ff6b6b;
    --text: #e8eaee;
    --muted: #9aa3b2;
    --muted2: #7f8796;
    --font-disp: 'Bebas Neue', sans-serif;
    --font-mono: 'IBM Plex Mono', monospace;
    --font-body: 'Geist', sans-serif;
    color-scheme: dark;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
  }

  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── APP LAYOUT (mobile-first) ── */
  .app {
    min-height: 100vh;
    display: flex;
    background: var(--bg);
  }

  /* Mobile: full width, no sidebar push */
  .main {
    margin-left: 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    width: 100%;
  }

  /* Desktop: sidebar is visible, push content */
  @media (min-width: 769px) {
    .main {
      margin-left: 196px;
      width: calc(100% - 196px);
    }
  }

  @media (min-width: 1024px) {
    .main {
      margin-left: 220px;
      width: calc(100% - 220px);
    }
  }

  /* ── TOPBAR ── */
  .topbar {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: var(--surface);
    position: sticky;
    top: 0;
    z-index: 50;
    flex-wrap: wrap;
  }

  @media (min-width: 768px) { .topbar { padding: 14px 24px; flex-wrap: nowrap; } }
  @media (min-width: 1024px) { .topbar { padding: 18px 32px; } }

  .page-title {
    font-family: var(--font-disp);
    font-size: 22px;
    letter-spacing: 1.5px;
    color: var(--text);
    line-height: 1;
  }

  @media (min-width: 768px) { .page-title { font-size: 28px; } }

  .page-subtitle {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--muted);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .status-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--green);
    animation: pulse 2s infinite;
  }

  .status-text { font-family: var(--font-mono); font-size: 11px; color: var(--muted2); }

  /* ── PAGE CONTENT ── */
  .page-content {
    padding: 12px;
    flex: 1;
    min-width: 0;
  }

  @media (min-width: 480px) { .page-content { padding: 16px; } }
  @media (min-width: 768px) { .page-content { padding: 24px; } }
  @media (min-width: 1024px) { .page-content { padding: 32px; } }

  /* ── CARD ── */
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 16px;
  }

  @media (min-width: 640px) { .card { border-radius: 12px; padding: 20px; } }
  @media (min-width: 1024px) { .card { padding: 24px; } }

  .card-sm { padding: 14px; }
  @media (min-width: 640px) { .card-sm { padding: 18px; } }

  .section-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }

  @media (min-width: 640px) { .section-header { align-items: center; margin-bottom: 18px; flex-wrap: nowrap; } }

  .section-title { font-family: var(--font-disp); font-size: 18px; letter-spacing: 1px; }
  @media (min-width: 640px) { .section-title { font-size: 20px; } }

  .divider { height: 1px; background: var(--border); margin: 16px 0; }
  @media (min-width: 640px) { .divider { margin: 24px 0; } }

  .empty-state { text-align: center; padding: 32px 16px; }
  .empty-icon { font-size: 32px; margin-bottom: 10px; opacity: 0.4; }
  .empty-text { color: var(--muted2); font-size: 13px; }

  /* ── TABLES ── */
  table { width: 100%; border-collapse: collapse; }

  thead th {
    padding: 8px 12px;
    text-align: left;
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 1.5px;
    color: var(--muted);
    text-transform: uppercase;
    border-bottom: 1px solid var(--border);
    font-weight: 400;
    white-space: nowrap;
  }

  @media (min-width: 640px) { thead th { padding: 10px 16px; font-size: 10px; letter-spacing: 2px; } }

  tbody tr { border-bottom: 1px solid rgba(30,42,68,0.5); transition: background 0.1s; }
  tbody tr:hover { background: rgba(255,255,255,0.02); }
  tbody td { padding: 10px 12px; font-size: 12.5px; vertical-align: middle; }
  tbody tr:last-child { border-bottom: none; }
  @media (min-width: 640px) { tbody td { padding: 12px 16px; font-size: 13.5px; } }

  /* ── BADGES ── */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 20px;
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  @media (min-width: 640px) { .badge { padding: 3px 10px; font-size: 10px; } }

  .badge-cyan { background: rgba(47,128,255,0.12); color: var(--cyan); border: 1px solid rgba(47,128,255,0.25); }
  .badge-green { background: rgba(47,191,113,0.1); color: var(--green); border: 1px solid rgba(47,191,113,0.2); }
  .badge-orange { background: rgba(242,198,109,0.1); color: var(--orange); border: 1px solid rgba(242,198,109,0.2); }
  .badge-red { background: rgba(255,107,107,0.1); color: var(--red); border: 1px solid rgba(255,107,107,0.2); }
  .badge-muted { background: rgba(90,106,138,0.15); color: var(--muted2); border: 1px solid var(--border); }

  /* ── BUTTONS ── */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 8px;
    border: 1px solid;
    font-size: 12px;
    font-weight: 500;
    font-family: var(--font-body);
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }

  @media (min-width: 640px) { .btn { padding: 9px 18px; gap: 8px; font-size: 13px; } }

  .btn:disabled { opacity: 0.7; cursor: not-allowed; }
  .btn-primary { background: var(--cyan); border-color: var(--cyan); color: var(--bg); }
  .btn-primary:hover:not(:disabled) { background: rgba(96,170,255,0.95); }
  .btn-ghost { background: transparent; border-color: var(--border2); color: var(--muted2); }
  .btn-ghost:hover:not(:disabled) { background: var(--card2); color: var(--text); }
  .btn-danger { background: transparent; border-color: rgba(255,107,107,0.3); color: var(--red); }
  .btn-danger:hover:not(:disabled) { background: rgba(255,107,107,0.1); }
  .btn-sm { padding: 5px 10px; font-size: 11px; }
  @media (min-width: 640px) { .btn-sm { padding: 6px 12px; font-size: 12px; } }

  /* ── INPUTS ── */
  .input {
    width: 100%;
    padding: 9px 12px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    font-size: 13px;
    font-family: var(--font-body);
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  @media (min-width: 640px) { .input { padding: 10px 14px; font-size: 14px; } }

  .input:focus { border-color: var(--cyan); box-shadow: 0 0 0 2px rgba(47,128,255,0.14); }
  .input::placeholder { color: var(--muted); }
  textarea.input { min-height: 80px; resize: vertical; }

  .input-group { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
  .input-label { font-family: var(--font-mono); font-size: 9px; color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase; }
  @media (min-width: 640px) { .input-label { font-size: 10px; letter-spacing: 2px; } }

  .form-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
  @media (min-width: 640px) { .form-grid { grid-template-columns: 1fr 1fr; gap: 16px; } }

  /* ── SEARCH ── */
  .search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    min-width: 0;
    width: 100%;
  }

  @media (min-width: 640px) { .search-bar { padding: 10px 14px; max-width: 320px; } }

  .search-bar input { background: transparent; border: none; outline: none; color: var(--text); font-size: 13px; font-family: var(--font-body); flex: 1; min-width: 0; }
  .search-bar input::placeholder { color: var(--muted); }

  /* ── MODAL ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(8,11,18,0.8);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 0;
    z-index: 200;
    animation: fadeIn 0.15s ease;
  }

  @media (min-width: 640px) {
    .modal-overlay { align-items: center; padding: 16px; }
  }

  .modal {
    background: var(--card);
    border: 1px solid var(--border2);
    border-radius: 16px 16px 0 0;
    padding: 20px 16px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.2s ease;
  }

  @media (min-width: 640px) {
    .modal { border-radius: 16px; padding: 28px 32px; max-width: 460px; max-height: none; overflow: visible; }
  }

  .modal-title { font-family: var(--font-disp); font-size: 22px; letter-spacing: 1px; margin-bottom: 16px; }
  @media (min-width: 640px) { .modal-title { font-size: 26px; margin-bottom: 24px; } }

  .modal-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 20px;
  }

  @media (min-width: 480px) {
    .modal-actions { flex-direction: row; justify-content: flex-end; margin-top: 28px; flex-wrap: wrap; }
  }

  /* ── TOAST ── */
  .toast {
    position: fixed;
    bottom: 16px;
    left: 16px;
    right: 16px;
    background: var(--card2);
    border: 1px solid var(--border2);
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 13px;
    z-index: 999;
    animation: slideUp 0.2s ease;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }

  @media (min-width: 640px) {
    .toast { bottom: 24px; right: 24px; left: auto; max-width: 380px; padding: 14px 20px; }
  }

  .toast-success { border-left: 3px solid var(--green); }
  .toast-error { border-left: 3px solid var(--red); }
`;