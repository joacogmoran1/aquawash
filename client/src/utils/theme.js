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

  :root {
    --sidebar-width: 220px;

    /* Notion-like dark minimal palette */
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
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  img, svg, video, canvas {
    display: block;
    max-width: 100%;
  }

  button, input, textarea, select {
    font: inherit;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  ::-webkit-scrollbar-track {
    background: var(--surface);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--border2);
    border-radius: 2px;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .app {
    min-height: 100vh;
    display: flex;
    background: var(--bg);
  }

  .main {
    margin-left: var(--sidebar-width);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .topbar {
    padding: 18px 32px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    background: var(--surface);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .page-title {
    font-family: var(--font-disp);
    font-size: 28px;
    letter-spacing: 1.5px;
    color: var(--text);
    line-height: 1;
  }

  .page-subtitle {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--green);
    box-shadow: none;
    animation: pulse 2s infinite;
  }

  .status-text {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--muted2);
  }

  .page-content {
    padding: 32px;
    flex: 1;
    min-width: 0;
  }

  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 24px;
  }

  .card-sm {
    padding: 20px;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
  }

  .section-title {
    font-family: var(--font-disp);
    font-size: 20px;
    letter-spacing: 1px;
  }

  .divider {
    height: 1px;
    background: var(--border);
    margin: 24px 0;
  }

  .empty-state {
    text-align: center;
    padding: 48px 24px;
  }

  .empty-icon {
    font-size: 40px;
    margin-bottom: 12px;
    opacity: 0.4;
  }

  .empty-text {
    color: var(--muted2);
    font-size: 14px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  thead th {
    padding: 10px 16px;
    text-align: left;
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--muted);
    text-transform: uppercase;
    border-bottom: 1px solid var(--border);
    font-weight: 400;
  }

  tbody tr {
    border-bottom: 1px solid rgba(30, 42, 68, 0.5);
    transition: background 0.1s;
  }

  tbody tr:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  tbody td {
    padding: 14px 16px;
    font-size: 13.5px;
    vertical-align: middle;
  }

  tbody tr:last-child {
    border-bottom: none;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 20px;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  .badge-cyan {
    background: rgba(47, 128, 255, 0.12);
    color: var(--cyan);
    border: 1px solid rgba(47, 128, 255, 0.25);
  }

  .badge-green {
    background: rgba(0, 255, 159, 0.1);
    color: var(--green);
    border: 1px solid rgba(0, 255, 159, 0.2);
  }

  .badge-orange {
    background: rgba(255, 140, 66, 0.1);
    color: var(--orange);
    border: 1px solid rgba(255, 140, 66, 0.2);
  }

  .badge-red {
    background: rgba(255, 77, 109, 0.1);
    color: var(--red);
    border: 1px solid rgba(255, 77, 109, 0.2);
  }

  .badge-muted {
    background: rgba(90, 106, 138, 0.15);
    color: var(--muted2);
    border: 1px solid var(--border);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 9px 18px;
    border-radius: 8px;
    border: 1px solid;
    font-size: 13px;
    font-weight: 500;
    font-family: var(--font-body);
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    box-shadow: none;
  }

  .btn-primary {
    background: var(--cyan);
    border-color: var(--cyan);
    color: var(--bg);
  }

  .btn-primary:hover:not(:disabled) {
    background: rgba(96, 170, 255, 0.95);
    box-shadow: none;
  }

  .btn-ghost {
    background: transparent;
    border-color: var(--border2);
    color: var(--muted2);
  }

  .btn-ghost:hover:not(:disabled) {
    background: var(--card2);
    color: var(--text);
  }

  .btn-danger {
    background: transparent;
    border-color: rgba(255, 77, 109, 0.3);
    color: var(--red);
  }

  .btn-danger:hover:not(:disabled) {
    background: rgba(255, 77, 109, 0.1);
  }

  .btn-sm {
    padding: 6px 12px;
    font-size: 12px;
  }

  .input {
    width: 100%;
    padding: 10px 14px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    font-size: 14px;
    font-family: var(--font-body);
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .input:focus {
    border-color: var(--cyan);
    box-shadow: 0 0 0 2px rgba(47, 128, 255, 0.14);
  }

  .input::placeholder {
    color: var(--muted);
  }

  textarea.input {
    min-height: 100px;
    resize: vertical;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .input-label {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    min-width: 0;
    width: 100%;
    max-width: 320px;
  }

  .search-bar input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--text);
    font-size: 13.5px;
    font-family: var(--font-body);
    flex: 1;
    min-width: 0;
  }

  .search-bar input::placeholder {
    color: var(--muted);
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(10, 10, 10, 0.72);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 200;
    animation: fadeIn 0.15s ease;
  }

  .modal {
    background: var(--card);
    border: 1px solid var(--border2);
    border-radius: 16px;
    padding: 32px;
    width: 100%;
    max-width: 460px;
    animation: slideUp 0.2s ease;
  }

  .modal-title {
    font-family: var(--font-disp);
    font-size: 26px;
    letter-spacing: 1px;
    margin-bottom: 24px;
  }

  .modal-actions {
    display: flex;
    gap: 10px;
    margin-top: 28px;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: var(--card2);
    border: 1px solid var(--border2);
    border-radius: 10px;
    padding: 14px 20px;
    font-size: 13px;
    z-index: 999;
    animation: slideUp 0.2s ease;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: none;
    max-width: calc(100vw - 32px);
  }

  .toast-success {
    border-left: 3px solid var(--green);
  }

  .toast-error {
    border-left: 3px solid var(--red);
  }

  @media (max-width: 1024px) {
    .topbar {
      padding: 16px 20px;
    }

    .page-content {
      padding: 20px;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .main {
      margin-left: 0;
      width: 100%;
    }

    .topbar {
      padding: 14px 16px;
      flex-direction: column;
      align-items: flex-start;
    }

    .topbar-right {
      width: 100%;
      justify-content: flex-start;
    }

    .page-title {
      font-size: 24px;
    }

    .page-content {
      padding: 16px;
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .modal {
      padding: 20px;
    }

    .modal-actions {
      justify-content: stretch;
    }

    .modal-actions .btn {
      flex: 1;
    }

    .toast {
      right: 16px;
      left: 16px;
      bottom: 16px;
      max-width: none;
    }
  }
`;