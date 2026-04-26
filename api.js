/**
 * portal-api.js — データアクセス抽象層
 *
 * ■ GitHub Pages 運用時（現在）
 *   PORTAL_API_MODE = 'github'
 *   → GitHub Raw JSONを fetch して読み込む
 *   → 書き込みは admin.html の GitHub API が直接行う
 *
 * ■ XSERVER 移行時
 *   PORTAL_API_MODE = 'xserver'
 *   → /api/docs.php, /api/blogs.php を fetch する
 *   → PHP側でJSONファイルまたはMySQLを読み書き
 *   → admin.html の doUpload/submitBlogPost も API経由に変更
 *
 * 切り替えは PORTAL_API_MODE の1行だけ変更でOK
 */

const PORTAL_API_MODE = 'github'; // 'github' | 'xserver'

const PORTAL_API_CONFIG = {
  github: {
    baseRaw: 'https://raw.githubusercontent.com/mgunshi3060/portal.index/main/',
    docs:   'data/docs.json',
    blogs:  'data/blogs.json',
  },
  xserver: {
    // XSERVER移行時にここのURLを設定するだけでOK
    base: 'https://your-domain.com/portal/api/',
    docs:  'docs.php',
    blogs: 'blogs.php',
  }
};

/**
 * ドキュメント一覧取得
 * @returns {Promise<Array>}
 */
async function apiGetDocs() {
  if (PORTAL_API_MODE === 'github') {
    const cfg = PORTAL_API_CONFIG.github;
    const res = await fetch(cfg.baseRaw + cfg.docs + '?_=' + Date.now());
    if (!res.ok) throw new Error('docs.json 取得失敗: ' + res.status);
    return res.json();
  }
  if (PORTAL_API_MODE === 'xserver') {
    const cfg = PORTAL_API_CONFIG.xserver;
    const res = await fetch(cfg.base + cfg.docs + '?action=list');
    if (!res.ok) throw new Error('API エラー: ' + res.status);
    return res.json();
  }
  throw new Error('不明なAPIモード: ' + PORTAL_API_MODE);
}

/**
 * ブログ一覧取得
 * @returns {Promise<Array>}
 */
async function apiGetBlogs() {
  if (PORTAL_API_MODE === 'github') {
    const cfg = PORTAL_API_CONFIG.github;
    const res = await fetch(cfg.baseRaw + cfg.blogs + '?_=' + Date.now());
    if (!res.ok) throw new Error('blogs.json 取得失敗: ' + res.status);
    return res.json();
  }
  if (PORTAL_API_MODE === 'xserver') {
    const cfg = PORTAL_API_CONFIG.xserver;
    const res = await fetch(cfg.base + cfg.blogs + '?action=list');
    if (!res.ok) throw new Error('API エラー: ' + res.status);
    return res.json();
  }
  throw new Error('不明なAPIモード: ' + PORTAL_API_MODE);
}

/**
 * ローカルキャッシュフォールバック付きデータ読み込み
 * @param {'docs'|'blogs'} type
 * @param {string} cacheKey - localStorage キー
 */
async function apiLoad(type, cacheKey) {
  try {
    const data = type === 'docs' ? await apiGetDocs() : await apiGetBlogs();
    localStorage.setItem(cacheKey, JSON.stringify(data));
    return data;
  } catch (e) {
    console.warn('[portal-api] フォールバック:', e.message);
    try {
      const cached = localStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch (_) {
      return [];
    }
  }
}

/*
 * ■ XSERVER 移行時に用意するPHPファイルの例（参考）
 *
 * /portal/api/docs.php
 * <?php
 * header('Content-Type: application/json; charset=utf-8');
 * header('Access-Control-Allow-Origin: *');
 * $action = $_GET['action'] ?? 'list';
 * $file = __DIR__ . '/../data/docs.json';
 * if ($action === 'list') {
 *   echo file_get_contents($file) ?: '[]';
 * } elseif ($action === 'save' && $_SERVER['REQUEST_METHOD'] === 'POST') {
 *   // 管理者認証チェックを必ず追加すること
 *   $body = file_get_contents('php://input');
 *   file_put_contents($file, $body);
 *   echo json_encode(['ok' => true]);
 * }
 */
