# 社内ポータル — 使用方法・構造ガイド

> リポジトリ: `mgunshi3060/portal.index` (GitHub Pages)

---

## 目次

1. [システム概要](#システム概要)
2. [ファイル構成](#ファイル構成)
3. [GitHubリポジトリ構造](#githubリポジトリ構造)
4. [各ページの説明](#各ページの説明)
5. [管理画面の使い方](#管理画面の使い方)
6. [初期セットアップ](#初期セットアップ)
7. [ログイン情報](#ログイン情報)
8. [データの仕組み](#データの仕組み)
9. [トラブルシューティング](#トラブルシューティング)

---

## システム概要

GitHub Pages を **データベース代わり**に使った、サーバーレスの社内ポータルシステムです。

```
[管理者] → admin.html → GitHub API → data/*.json / pdfs/ / images/
                                          ↓
[一般社員] → index.html / blog.html ← GitHub Pages（公開URL）
```

- **サーバー不要** — すべてのデータはGitHubリポジトリに保存
- **認証不要（閲覧）** — 一般ページは誰でも閲覧可能
- **GitHub Token必要（管理）** — 管理者のみPDFアップロード・記事投稿が可能

---

## ファイル構成

```
portal.index/
│
├── index.html          # 一般ページ（ホーム・お知らせ）
├── blog.html           # 社内ブログページ
├── admin.html          # 管理者画面
├── README.md           # 本ファイル
│
├── data/               # JSONデータ（GitHubに自動保存）
│   ├── docs.json       # お知らせPDFのメタデータ一覧
│   ├── blogs.json      # ブログ記事一覧
│   ├── events.json     # 行事・予定一覧
│   └── tags.json       # お知らせタグ・ブログカテゴリ定義
│
├── pdfs/               # アップロードされたPDFファイル
│   └── *.pdf
│
└── images/             # ブログ記事の画像ファイル
    └── blog_*.jpg / .png / .gif
```

---

## GitHubリポジトリ構造

### data/docs.json（お知らせ）

```json
[
  {
    "id": "doc_1234567890",
    "name": "セキュリティガイドライン.pdf",
    "tag": "security",
    "date": "2026-04-28",
    "urgent": false,
    "comment": "資料が更新されました。参照願います。",
    "numPages": 5,
    "thumbData": "data:image/jpeg;base64,...",   // 1ページ目サムネイル
    "url": "https://mgunshi3060.github.io/portal.index/pdfs/xxx.pdf"
  }
]
```

### data/blogs.json（ブログ）

```json
[
  {
    "id": "blog_1234567890",
    "title": "JAPAN DX WEEK",
    "author": "山田",
    "content": "本文テキスト...",
    "category": "tech",
    "tags": ["AI", "DX"],
    "imageUrl": "https://mgunshi3060.github.io/portal.index/images/blog_xxx.jpg",
    "date": "2026-04-27"
  }
]
```

> **注意**: 旧仕様では `imageData`（base64文字列）を使用。新仕様は `imageUrl`（GitHub Pages URL）のみ。両方に後方互換あり。

### data/events.json（行事）

```json
[
  {
    "id": "ev_1234567890",
    "title": "定例会",
    "date": "2026-04-29",
    "time": "10:00",        // 空文字の場合は終日
    "note": "3F会議室"
  }
]
```

### data/tags.json（タグ定義）

```json
{
  "notice": [
    { "id": "security", "icon": "🔒", "label": "セキュリティ", "bg": "#FCEBEB", "color": "#A32D2D", "cls": "bs" }
  ],
  "blog": [
    { "id": "tech", "icon": "💡", "label": "技術", "bg": "#E6F1FB", "color": "#185fa5" }
  ]
}
```

---

## 各ページの説明

### index.html（一般ページ）

| エリア | 内容 |
|---|---|
| ヒーローバナー | 挨拶・日付・天気（つくば市固定）|
| アラートバー | 「重要」フラグのお知らせを赤帯で表示 |
| 統計カード | 今月の新着数・ブログ数・ドキュメント数 |
| 最新のお知らせ | 最新5件（サムネイル・コメント付き）|
| 直近のイベント | 今日以降の行事を最大5件 |
| 最新のブログ | 最新4件のカード表示 |
| クイックリンク | お知らせ・ブログへのショートカット |

**データ取得**: GitHub Contents API (`api.github.com`) 経由でキャッシュなし取得

---

### blog.html（ブログページ）

- カテゴリフィルター（タグ管理で追加・削除可能）
- キーワード検索
- カード一覧 → 詳細モーダル
- スマホ対応（ボトムナビ付き）

---

### admin.html（管理者画面）

ログイン後に使用できる全機能：

| メニュー | 機能 |
|---|---|
| 📤 PDFアップロード | PDF→サムネイル自動生成→GitHub保存 |
| 📋 ドキュメント管理 | 一覧・重要フラグ切替・削除 |
| 🏷 タグ・カテゴリ管理 | お知らせタグ／ブログカテゴリの追加・削除 |
| 📅 行事管理 | 行事の追加・編集・削除 |
| ✏️ 新規投稿 | ブログ記事の投稿（画像対応） |
| 📰 ブログ管理 | 記事一覧・削除 |
| ⚙️ ポータル設定 | サイト名・アラートメッセージ変更 |
| 🔑 GitHub設定 | Personal Access Token の登録 |
| 🔒 パスワード変更 | 管理者ログインパスワードの変更 |

---

## 管理画面の使い方

### PDFをアップロードする

1. 管理画面にログイン
2. 左メニュー「📤 PDFアップロード」
3. PDFをドラッグ＆ドロップ（または選択）
4. カテゴリ・公開日・コメント・重要フラグを設定
5. 「✓ GitHubへアップロード」をクリック
6. 完了後、`index.html` のお知らせに即反映

### ブログ記事を投稿する

1. 左メニュー「✏️ 新規投稿」
2. タイトル・著者・本文・カテゴリを入力
3. 画像をドラッグ＆ドロップ（任意）
4. 「✓ GitHubへ投稿」をクリック
5. 画像は `images/` フォルダにアップロードされ、JSONにはURLのみ記録

### 行事を登録する

1. 左メニュー「📅 行事管理」
2. 行事名・日付・種別（終日/時間指定）・メモを入力
3. 「✓ 追加する」をクリック
4. `index.html` の直近のイベントに即反映

### タグを追加・削除する

1. 左メニュー「🏷 タグ・カテゴリ管理」
2. 絵文字・タグ名を入力して「＋ 追加」
3. 不要なタグは「✕」で削除
4. 「💾 GitHubに保存」をクリック
5. `index.html` / `blog.html` のフィルタータブに即反映

---

## 初期セットアップ

### 1. GitHub Personal Access Tokenの取得

1. GitHub → Settings → Developer settings → Personal access tokens → **Tokens (classic)**
2. 「Generate new token」をクリック
3. 以下の権限にチェックを入れる:
   - `repo`（リポジトリへの読み書き）
4. 生成されたトークンをコピー（`ghp_xxxx...`）

### 2. Tokenを管理画面に登録

1. `admin.html` にログイン
2. 左メニュー「🔑 GitHub設定」
3. Tokenを貼り付けて保存
4. 「接続テスト」でOKになればOK

### 3. GitHub Pagesの有効化

1. リポジトリ → Settings → Pages
2. Source: `Deploy from a branch`
3. Branch: `main` / `/ (root)`
4. Save → 数分後に `https://mgunshi3060.github.io/portal.index/` で公開

### 4. data/ フォルダの初期化

管理画面 → ポータル設定 → 「🔧 データ修復」でJSONの初期化が可能

---

## ログイン情報

| 項目 | 初期値 |
|---|---|
| ID | `admin` |
| パスワード | 管理者にお問い合わせください |

> パスワードは管理画面「🔒 パスワード変更」から変更可能（ブラウザのlocalStorageに保存）

---

## データの仕組み

### データ取得フロー（一般ページ）

```
1. GitHub Contents API で最新JSON取得（キャッシュなし）
   └ 成功 → 表示 + localStorageに保存
   └ 失敗 → localStorageのキャッシュから表示
```

### データ保存フロー（管理画面）

```
1. GitHub Contents API で現在のファイルのSHAを取得
2. 新しいデータでPUT（SHAがあれば上書き・なければ新規）
3. localStorageにも同時保存（オフライン表示用）
```

### 画像・PDFの保存方式

| ファイル種別 | 保存場所 | JSONへの記録 |
|---|---|---|
| PDFファイル | `pdfs/ファイル名.pdf` | GitHub Pages URL |
| PDFサムネイル | `data/docs.json`内 | base64（1ページ目のみ・軽量） |
| ブログ画像 | `images/blog_ID.拡張子` | GitHub Pages URL |

---

## トラブルシューティング

### アップロードできない
- GitHub Tokenが失効していないか確認（管理画面 → GitHub設定 → 接続テスト）
- Tokenに `repo` 権限があるか確認

### 一般ページに反映されない
- GitHub Pagesのデプロイ完了まで数分かかる場合あり
- ブラウザの強制リロード（`Ctrl+Shift+R`）を試す

### PDFが開けない
- リポジトリがPublicになっているか確認（PrivateだとGitHub Pages URLにアクセスできない）

### パスワードを忘れた
- ブラウザのlocalStorageから `portal_admin_pw` を削除すると初期パスワードに戻る
- DevTools → Application → Local Storage → `portal_admin_pw` を削除

### データが消えた・壊れた
- 管理画面 → ポータル設定 → データ修復 で修復を試みる
- GitHubリポジトリの `data/` フォルダを直接確認・編集することも可能

---

## 技術仕様

| 項目 | 内容 |
|---|---|
| フロントエンド | HTML / CSS / Vanilla JS（フレームワーク不使用）|
| データ保存 | GitHub REST API v3 |
| 画像・PDF配信 | GitHub Pages（CDN）|
| 天気情報 | Open-Meteo API（つくば市固定・APIキー不要）|
| イベントデータ | GitHub Contents API（常に最新・キャッシュなし）|
| スマホ対応 | レスポンシブCSS・ボトムナビ |

---

*最終更新: 2026年4月*
