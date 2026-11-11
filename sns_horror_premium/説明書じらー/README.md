# 既読の向こう側 — SNS安全学習ゲーム

SNSで知り合った相手と実際に会う危険性を学ぶ、ブラウザ向けの体験型教材です。

## フォルダ構成

```text
taikensaito/
├── index.html                 # ポータル画面（CSSはHTML内に記述）
├── start_portal.bat           # Windows用：ポータルを起動
├── README.md                  # この説明書
├── PROJECT_HANDOFF.md         # 現状・構成・次の作業の引き継ぎ
├── AGENTS.md                  # 今後の編集・保守ルール
├── image/
│   └── onlinemeet.png         # ポータル用画像
└── sns_horror_premium/
    ├── index.html             # ゲーム画面
    ├── snskaisetsu.html       # 学習レポート
    ├── start_game.bat         # Windows用：ゲームを直接起動
    ├── README_JP.txt          # 操作・公開方法
    ├── .nojekyll              # GitHub Pages用
    ├── robots.txt             # クローラー向け設定
    ├── CSS/
    │   └── style.css          # ゲーム画面のスタイル
    └── JavaScript/
        └── game.js            # ゲーム処理（3Dマップ・プレイヤー・敵・UI等）
```

## 起動方法（Windows）

- ポータルから：`start_portal.bat` を実行
- ゲームを直接：`sns_horror_premium/start_game.bat` を実行
- 手動：各 `index.html` をブラウザで開く

Three.js は CDN（jsDelivr）から読み込むため、初回起動時にインターネット接続が必要です。
ローカルファイルからの起動と GitHub Pages / Netlify での公開を想定しています。

## 編集するファイル

| 変更内容 | ファイル |
|---|---|
| ポータルの文章・見た目 | `index.html` |
| 3Dマップ、プレイヤー、敵、ゲーム進行 | `sns_horror_premium/JavaScript/game.js` |
| ゲーム画面のデザイン | `sns_horror_premium/CSS/style.css` |
| ゲーム画面のHTML | `sns_horror_premium/index.html` |
| 学習レポート | `sns_horror_premium/snskaisetsu.html` |
| 操作説明 | `sns_horror_premium/README_JP.txt` |

## PC操作

- W / A / S / D または矢印キー：移動
- マウス：視点操作
- Shift：ダッシュ
- Tab またはスマートフォンボタン：スマートフォンの開閉
- E：周囲の確認
- Esc：ポーズ

## 注意

本作は教育目的のフィクションです。SNSで知り合った相手とのトラブルや不安がある場合は、保護者・学校の先生など信頼できる人に相談してください。緊急時は110番、警察への相談は #9110 を利用できます。
