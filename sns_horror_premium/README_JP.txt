【既読の向こう側 — SNSリスク体験ゲーム】

■ まずテストプレイする（サーバー不要）
方法A：このフォルダ内の「Chromeでゲームを起動.bat」をダブルクリックします。Chromeが見つからない場合は、Windowsの既定ブラウザで開きます。
方法B：「index.html」をダブルクリックして開きます（Windowsの既定ブラウザで開きます）。
※初回の起動時はインターネット接続が必要です。Three.jsの3DライブラリをCDNから読み込みます。
※「WindowsによってPCが保護されました」などの警告が出たら、内容を確認してください。不明なファイルの実行を無理に許可しないでください。

■ 使うアプリ・ソフト・サービス
1. Google Chrome（推奨ブラウザ）または Microsoft Edge
   ゲームを実行するブラウザです。Chromeを使う場合は「Chromeでゲームを起動.bat」またはChromeからindex.htmlを開いてください。
   Chrome: https://www.google.com/chrome/

2. Visual Studio Code（VS Code）
   HTML / CSS / JavaScriptの編集用。必須ではありません。無料。
   https://code.visualstudio.com/

3. GitHub + GitHub Pages または Netlify
   公開用サービスです。GitHub PagesとNetlifyのどちらか一方でOKです。
   GitHub: https://github.com/
   GitHub Pages: https://pages.github.com/
   Netlify Drop: https://app.netlify.com/drop

4. Three.js
   ブラウザ内で3D空間を描画するライブラリ。本作では、ローカルのHTMLをダブルクリックして動かせるように、クラシック版 r159 をCDN経由で読み込みます。
   https://threejs.org/
   ※Three.jsの読み込み先 https://cdn.jsdelivr.net/ にアクセスするため、インターネット接続が必要です。

5. Google Fonts（Noto Sans JP / IBM Plex Mono）
   UIの文字表示に使用。アクセスできない場合は標準フォントに切り替わります。
   https://fonts.google.com/

■ GitHub Pagesで公開する方法
1. GitHubで新しいリポジトリを作成します。無料で公開する場合はPublicを選びます。
2. ZIPを解凍し、index.html / snskaisetsu.html / CSS / JavaScript / .nojekyll / robots.txt をリポジトリの一番上にアップロードします。
   フォルダごと入れ子にせず、index.htmlがリポジトリの一番上に見えるようにしてください。
3. リポジトリの Settings → Pages を開きます。
4. Sourceを「Deploy from a branch」、Branchを「main」、フォルダを「/(root)」に設定して保存します。
5. 公開URLが表示されたら、そのURLをChromeで開きます。ゲームを直接開くにはURL末尾に index.html を付けても開けます。
6. 元のWebサイトから公開URLへリンクを追加します。

公開用にアップロードするのはHTML・CSS・JavaScriptなどのサイトファイルです。「Chromeでゲームを起動.bat」はローカルテスト用で、GitHub Pagesには不要です。

■ 操作
PC:
  W / A / S / D：移動
  ↑ / ↓：前進・後退
  ← / →：向きを変える
  マウス：視点操作（ゲーム画面をクリックすると有効）
  Shift：走る
  E：近くの通知・サインを調べる
  F：ライトのオン・オフ
  Esc：一時停止 / 再開

スマートフォン:
  画面下の方向ボタンで移動し、「調べる」で選択イベントを開きます。
  「走る」「ライト」も画面内ボタンから操作できます。

■ 注意
・このバージョンはローカルテスト時にBAT、Python、PowerShellサーバーを必要としません。
・GitHub Pages / Netlifyで公開後は、公開URLをブラウザで開くだけで動きます。
・ユーザーアカウント、オンラインマルチプレイ、クラウド保存などのバックエンド機能はありません。
・このゲームは教育目的のフィクションで、現実の相談窓口の代わりにはなりません。
