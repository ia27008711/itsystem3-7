/**
 * 既読の向こう側 — 3D SNSホラーゲーム
 * 高密度タウンマップ・見える壁・大型ミニマップ・スマホ一時停止機能
 * Three.js (r159) CDN対応
 */

const $ = (id) => document.getElementById(id);

// UI参照
const ui = {
  boot: $('boot'),
  bootText: $('boot-text'),
  app: $('app'),
  world: $('world'),
  vignette: $('world-vignette'),
  damageFlash: $('damage-flash'),
  
  // トップバー
  chapterLabel: $('chapter-label'),
  soundMuteBtn: $('sound-mute-btn'),
  settingsOpen: $('settings-open'),
  
  // タイトル
  titleScreen: $('title-screen'),
  startDirectBtn: $('start-direct-btn'),
  startNovelBtn: $('start-novel-btn'),
  briefButton: $('brief-button'),
  brief: $('brief'),
  
  // ノベルパート
  novelScreen: $('novel-screen'),
  novelChatStream: $('novel-chat-stream'),
  novelSpeaker: $('novel-speaker'),
  novelText: $('novel-text'),
  novelChoices: $('novel-choices'),
  novelHint: $('novel-hint'),
  novelSkipBtn: $('novel-skip-btn'),
  
  // 3D HUD & ミニマップ
  gameUi: $('game-ui'),
  pointerLockHint: $('pointer-lock-hint'),
  minimapCanvas: $('minimap-canvas'),
  objTitle: $('objective-title'),
  objSub: $('objective-sub'),
  objProgress: $('progress-fill'),
  objMeta: $('objective-meta'),
  routeIndicator: $('route-indicator'),
  riskValue: $('risk-value'),
  riskMeter: $('risk-meter'),
  riskDesc: $('risk-description'),
  staminaValue: $('stamina-value'),
  staminaMeter: $('stamina-meter'),
  centerPrompt: $('center-prompt'),
  promptCopy: $('prompt-copy'),
  warning: $('chase-warning'),
  warningHead: $('warning-head'),
  warningSub: $('warning-sub'),
  liveLog: $('live-log'),
  
  // スマホUI
  phoneToggleBtn: $('phone-toggle-btn'),
  phoneBadge: $('phone-badge'),
  smartphone: $('smartphone-widget'),
  phoneBackdrop: $('phone-modal-backdrop'),
  phoneCloseBtn: $('phone-close-btn'),
  phoneClock: $('phone-clock'),
  phoneMustReply: $('phone-must-reply'),
  phoneChatBody: $('phone-chat-body'),
  phoneReplyArea: $('phone-reply-area'),
  phoneChoiceButtons: $('phone-choice-buttons'),
  replyCountdownText: $('reply-countdown-text'),
  replyTimerFill: $('reply-timer-fill'),
  phoneContactStatus: $('phone-contact-status'),
  
  // モバイルパッド
  mobilePad: $('mobile-pad'),
  mobileRun: $('mobile-run'),
  mobileInteract: $('mobile-interact'),
  mobilePhone: $('mobile-phone'),
  
  // ポーズ & 設定
  pauseModal: $('pause-modal'),
  resumeBtn: $('resume-button'),
  quitBtn: $('quit-button'),
  settingsModal: $('settings-modal'),
  settingsClose: $('settings-close'),
  soundToggle: $('sound-toggle'),
  flickerToggle: $('flicker-toggle'),
  timerToggle: $('timer-toggle'),
  nightToggle: $('night-toggle'),
  sensitivityInput: $('sensitivity'),
  diffEasy:   $('diff-easy'),
  diffNormal: $('diff-normal'),
  diffHard:   $('diff-hard'),
  diffDesc:   $('difficulty-desc'),
  
  // エンディング
  endingScreen: $('ending-screen'),
  endingStamp: $('ending-stamp'),
  endingTitle: $('ending-title'),
  endingLead: $('ending-lead'),
  endingNarrative: $('ending-narrative'),
  endingDesc: $('ending-description'),
  endingClues: $('ending-clues'),
  endingRisk: $('ending-risk'),
  endingTime: $('ending-time'),
  endingRoute: $('ending-route'),
  endingAdvice: $('ending-advice'),
  retryBtn: $('retry-button'),
  toast: $('toast')
};

let scene, camera, renderer, clock;
let playerArms, armL, armR, playerFlashlight;
let enemyMain, enemyMinion, policeOfficer, kobanBuilding, trafficLightGroup;
let kobanSirenLight, kobanSpotLight, sunMesh;
let storeDoorLeft = null, storeDoorRight = null;
let storeDoorOpenAmount = 0;
let minimapCtx = null;
let fogCanvas = null, fogCtx = null;
function initMinimapFog() {
  if (!fogCanvas) {
    fogCanvas = document.createElement('canvas');
    fogCanvas.width = 240;
    fogCanvas.height = 240;
    fogCtx = fogCanvas.getContext('2d');
  }
  // 未探索（全体を黒で覆う）
  fogCtx.globalCompositeOperation = 'source-over';
  fogCtx.fillStyle = '#0b0f17';
  fogCtx.fillRect(0, 0, 240, 240);
}


// スタート地点：コンビニ前 (X: 0, Z: 18)
const player = {
  x: 0,
  y: 1.65,
  z: 18,
  yaw: 0,
  pitch: 0,
  stamina: 100,
  exhausted: false,
  exhaustedTimer: 0,
  speed: 4.4,
  sprintSpeed: 7.4,
  verticalVelocity: 0,
  grounded: true
};

const state = {
  mode: 'boot',
  risk: 15,
  baseEnemySpeed: 4.5,
  currentEnemySpeed: 4.5,
  clues: 0,
  decisions: 0,
  safeDecisionsCount: 0,
  chaseActive: false,
  minionActive: false,
  elapsed: 0,
  gameTime: 0,
  routeTaken: 'コンビニ前',
  mouseLocked: false,
  soundEnabled: true,
  flickerEnabled: true,
  timerEnabled: false,   // 返信タイマー表示（デフォルトOFF）
  nightMode: true,       // ナイトモード（デフォルトON）
  difficulty: 'normal',  // 難易度プリセット: 'easy' | 'normal' | 'hard'
  sensitivity: 1,
  phoneOpen: false,
  phoneNotification: false,
  mustReplyActive: false, // スマホ返信待ちフラグ
  lastFootstep: 0,
  lastHeartbeat: 0,
  hasEndingTriggered: false
};

const keys = new Set();
const colliders = []; // 目に見える壁・障害物と完全一致するコリジョン
const lamps = [];

let audioCtx = null;

// ==========================================
// 1. ノベルシナリオ（コンビニ前集合）
// ==========================================
const novelScript = [
  {
    speaker: '主人公',
    text: '最近、オンラインゲームで知り合った「まさはる」。同じ趣味で意気投合し、毎晩SNSでチャットする仲になっていた。',
    chatPartner: 'まさはる',
    chatText: 'いつもゲーム一緒にやってくれてありがとね！ホント楽しい！'
  },
  {
    speaker: 'まさはる',
    text: '「ねえ、実は今君の街の近くにいるんだ！ 駅前のコンビニの前でちょっとだけ会わない？」',
    chatPartner: 'まさはる',
    chatText: '駅前の明るいコンビニの前で待ってるね！すぐ着くよ！'
  },
  {
    speaker: '主人公',
    text: '突然の誘いだった。「コンビニの前なら明るいし安全かも…？」どう返信しようか？',
    choices: [
      {
        text: '友達にメッセージを見せて「夜は会えない」と断る',
        tag: 'SAFE',
        riskDelta: -5,
        log: '慎重な判断。急な呼び出しに応じず、友人に共有した。',
        nextIndex: 3
      },
      {
        text: '「コンビニの前なら…」と、待ち合わせのコンビニに向かう',
        tag: 'DANGER',
        riskDelta: 20,
        log: '危険な判断。いくらコンビニ前でも素性の分からない相手と夜に会うのはハイリスク。',
        nextIndex: 3
      }
    ]
  },
  {
    speaker: '主人公',
    text: '夕暮れ時、待ち合わせのコンビニの前に到着した。周囲は薄暗く、車の通りも少なくなっている。',
    chatPartner: 'まさはる',
    chatText: '着いた？ コンビニの看板の下で待ってるよ！'
  },
  {
    speaker: '主人公',
    text: 'コンビニのガラス越しに、こちらを見つめる人影が見えた。写真の同年代の爽やかな姿とは全く違う、黒いパーカーを深く被った大柄な男だ。',
    chatPartner: 'まさはる',
    chatText: '見つけたよ。……逃げられると思ってるの？'
  },
  {
    speaker: '大柄な男',
    text: '「おい、逃げるなよ。せっかく会いに来てやったのに…スマホの写真全部見せろよ！」男が手を伸ばして迫ってくる！'
  },
  {
    speaker: '主人公',
    text: '背筋が凍りついた。これは重大な犯罪の罠だ！コンビニから走り出し、入り組んだ路地を抜けて交番へ逃げ切らなければ！'
  }
];

let novelStep = 0;
let novelTyping = false;
let novelTypeTimer = null;
let phoneCountdownTimer = null;

// ==========================================
// 2. スマホ強制返信イベント（特定地点で強制オープン）
// ==========================================
const phoneEvents = [
  {
    id: 1,
    triggerCondition: (p) => p.x > 6 && p.z <= 5,
    triggered: false,
    partnerText: 'おい！なんで逃げるんだよ！居場所教えろよ。すぐ後ろにいるからさ',
    choices: [
      {
        text: '「警察に通報しました！追ってこないで！」と送る',
        tag: 'SAFE',
        riskDelta: -5,
        playerText: '警察に通報しました！追ってこないで！',
        feedback: '警察の存在を告げて警戒させた。',
        enemySpeedBoost: 0
      },
      {
        text: '「今、大型車の前にいます…」と送ってしまう',
        tag: 'DANGER',
        riskDelta: 25,
        playerText: '今、大型車の前にいます…',
        feedback: '居場所の目印を教えてしまった！追跡者が猛烈に加速！',
        enemySpeedBoost: 0.9
      }
    ]
  },
  {
    id: 2,
    triggerCondition: (p) => p.z <= -12 && p.x > 16,
    triggered: false,
    partnerText: '路地に入ったな。周りの写真を送れよ。送らないとどうなるか分かってんの？',
    choices: [
      {
        text: '「写真は絶対に送りません！交番へ行きます！」と拒絶する',
        tag: 'SAFE',
        riskDelta: -5,
        playerText: '写真は絶対に送りません！交番へ行きます！',
        feedback: '写真の送信を拒絶し、現在地の特定を防いだ。',
        enemySpeedBoost: 0
      },
      {
        text: '脅しに負けて、路地と周囲のビルの写真を送る',
        tag: 'DANGER',
        riskDelta: 30,
        playerText: '（路地とビルの看板写真を送信）',
        feedback: '写真から逃走ルートを完全に特定された！追跡者が急接近！',
        enemySpeedBoost: 1.2
      }
    ]
  },
  {
    id: 3,
    triggerCondition: (p) => p.x > 32 && p.z <= -35,
    triggered: false,
    partnerText: '大通りの先は行き止まりだよ？奥の仲間に捕まるぞ。こっちの小道においで',
    choices: [
      {
        text: '相手の嘘を無視し、信号機の先の交番へ一直線にダッシュする',
        tag: 'SAFE',
        riskDelta: -10,
        playerText: '騙されない！信号の先の交番へ行く！',
        feedback: '相手の誘導を見破り、公的な保護地点へまっすぐ向かった！',
        enemySpeedBoost: 0
      },
      {
        text: '焦って相手の言う通りに怪しい脇道へ逃げ込もうとする',
        tag: 'DANGER',
        riskDelta: 35,
        playerText: 'わかった、そっちの小道へ行く…',
        feedback: '敵の罠に自らハマった！待ち伏せの仲間が目前に迫る！',
        enemySpeedBoost: 1.5
      }
    ]
  }
];

// ==========================================
// 3. 初期化処理
// ==========================================
function init() {
  ui.bootText.textContent = 'リアルな夕暮れの街並みとミニマップを準備中…';
  
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x381e28);
  scene.fog = new THREE.FogExp2(0x4a242c, 0.009);

  camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 280);
  camera.position.set(player.x, player.y, player.z);

  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  ui.world.appendChild(renderer.domElement);

  clock = new THREE.Clock();

  if (ui.minimapCanvas) {
    minimapCtx = ui.minimapCanvas.getContext('2d');
    initMinimapFog();
  }

  // 3Dアセット構築
  buildSunsetSky();
  // 道路・ビル群を生成し、南側の道路に面してコンビニを配置する。
  buildDenseCrankCity();
  buildConvenienceStore();
  buildHospitalAndHaneSupermarket();
  buildPark();
  buildKobanGoal();
  // 外周の壁の衝突判定を維持する。
  buildPlayerArms();
  buildRobloxEnemies();
  setupSunsetLightingAndStore();
  bindDomEvents();

  ui.boot.classList.add('is-hidden');
  ui.app.classList.remove('is-hidden');

  // URLパラメータで direct=1 が指定されている場合は直接3Dゲームを開始
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('direct') === '1' || urlParams.get('game') === '1') {
    start3DEscape();
  } else {
    state.mode = 'title';
  }

  renderer.setAnimationLoop(gameLoop);
}

// 統一されたマテリアル生成
function createMat(color, roughness = 0.8, metalness = 0.1, emissive = 0x000000, emissiveIntensity = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity });
}

// 直方体メッシュとコリジョン（見える壁のみコリジョンを登録）
function addBox(parent, x, y, z, sx, sy, sz, mat, castShadow = true, receiveShadow = true, addCollider = false) {
  const geo = new THREE.BoxGeometry(sx, sy, sz);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  parent.add(mesh);

  if (addCollider) {
    // 衝突判定は親Groupの位置も反映したワールド座標で登録する。
    // 以前はGroup内の建物パーツをローカル座標のまま登録していたため、
    // 建物から離れた場所に透明な壁のような当たり判定が発生していた。
    mesh.updateWorldMatrix(true, false);
    const worldPos = new THREE.Vector3();
    const worldScale = new THREE.Vector3();
    mesh.getWorldPosition(worldPos);
    mesh.getWorldScale(worldScale);
    const worldSX = sx * worldScale.x;
    const worldSY = sy * worldScale.y;
    const worldSZ = sz * worldScale.z;
    colliders.push({
      minX: worldPos.x - worldSX / 2,
      maxX: worldPos.x + worldSX / 2,
      minY: worldPos.y - worldSY / 2,
      maxY: worldPos.y + worldSY / 2,
      minZ: worldPos.z - worldSZ / 2,
      maxZ: worldPos.z + worldSZ / 2
    });
  }
  return mesh;
}

// ==========================================
// 4. 夕日
// ==========================================
function buildSunsetSky() {
  // 太陽本体と周囲の発光リングを表示しない。
  // 夕方の空色や照明設定はそのまま維持する。
}

// ==========================================
// 5. スタート地点：コンビニエンスストア
// ==========================================
function buildConvenienceStore() {
  // マップ南側（+Z側）。道路に面した日本風コンビニ。
  const storeGroup = new THREE.Group();
  storeGroup.position.set(48, 0, 49);
  // 店全体を大きくして存在感を出す。衝突判定もaddBox側で拡大率を反映。
  storeGroup.scale.set(1.25, 1.12, 1.65);
  scene.add(storeGroup);

  const wallMat = createMat(0xf2f0e9, 0.82, 0.05);
  const glassMat = createMat(0xa9d8df, 0.18, 0.22, 0x6caeb5, 0.18);
  // 自動ドアは周囲のガラスより少し暗い青緑色にして、境目を見分けやすくする。
  const doorGlassMat = createMat(0x5f9da8, 0.22, 0.28, 0x347d8b, 0.12);
  const darkGlassMat = createMat(0x1f3440, 0.3, 0.2);
  const roofMat = createMat(0x26343b, 0.8, 0.12);
  const floorMat = createMat(0xaaa9a2, 0.9, 0.0);
  const trimMat = createMat(0x168b72, 0.45, 0.12);
  const warmLightMat = createMat(0xfff1c2, 0.25, 0.05, 0xffd56a, 0.55);

  // 店内床。正面は道路側（-Z）に向ける。
  addBox(storeGroup, 0, -0.02, 3.45, 13.8, 0.12, 7.0, floorMat, false, true, false);
  // 左右・奥の壁。正面側はガラスと入口にする。
  addBox(storeGroup, -6.85, 2.35, 3.45, 0.3, 4.7, 7.0, wallMat, true, true, true);
  addBox(storeGroup, 6.85, 2.35, 3.45, 0.3, 4.7, 7.0, wallMat, true, true, true);
  addBox(storeGroup, 0, 2.35, 6.85, 13.7, 4.7, 0.3, wallMat, true, true, true);
  // 正面の低い腰壁＋ガラス面。中央に入口の開口を残す。
  addBox(storeGroup, -4.75, 0.55, -0.08, 4.0, 1.1, 0.18, wallMat, true, true, true);
  addBox(storeGroup, 4.75, 0.55, -0.08, 4.0, 1.1, 0.18, wallMat, true, true, true);
  addBox(storeGroup, -4.75, 2.25, -0.08, 4.0, 2.3, 0.12, glassMat, false, false, false);
  addBox(storeGroup, 4.75, 2.25, -0.08, 4.0, 2.3, 0.12, glassMat, false, false, false);
  addBox(storeGroup, 0, 2.25, -0.08, 4.7, 2.3, 0.12, glassMat, false, false, false);
  // 自動ドアの入口枠。中央の扉は左右にスライドするガラスパネル2枚。
  addBox(storeGroup, -1.2, 2.1, -0.16, 0.12, 2.5, 0.12, trimMat, false, false, false);
  addBox(storeGroup, 1.2, 2.1, -0.16, 0.12, 2.5, 0.12, trimMat, false, false, false);
  addBox(storeGroup, 0, 3.35, -0.16, 2.5, 0.12, 0.12, trimMat, false, false, false);
  storeDoorLeft = new THREE.Group();
  storeDoorRight = new THREE.Group();
  storeGroup.add(storeDoorLeft, storeDoorRight);
  const leftDoorPanel = new THREE.Mesh(new THREE.BoxGeometry(1.08, 1.9, 0.06), doorGlassMat);
  leftDoorPanel.position.set(-0.54, 1.55, -0.19);
  leftDoorPanel.castShadow = false;
  storeDoorLeft.add(leftDoorPanel);
  const rightDoorPanel = new THREE.Mesh(new THREE.BoxGeometry(1.08, 1.9, 0.06), doorGlassMat);
  rightDoorPanel.position.set(0.54, 1.55, -0.19);
  rightDoorPanel.castShadow = false;
  storeDoorRight.add(rightDoorPanel);
  // 扉に細い縦枠を付けてガラス面を見やすくする。
  const doorFrameMat = createMat(0x9caeb2, 0.35, 0.35);
  const leftFrame = new THREE.Mesh(new THREE.BoxGeometry(0.035, 1.9, 0.075), doorFrameMat);
  leftFrame.position.set(-1.06, 1.55, -0.19);
  storeDoorLeft.add(leftFrame);
  const rightFrame = new THREE.Mesh(new THREE.BoxGeometry(0.035, 1.9, 0.075), doorFrameMat);
  rightFrame.position.set(1.06, 1.55, -0.19);
  storeDoorRight.add(rightFrame);

  // 日本のコンビニらしい帯看板（緑・白・赤）と大きな店名サイン。
  addBox(storeGroup, 0, 4.25, -0.12, 14.0, 0.62, 0.32, trimMat, false, false, false);
  addBox(storeGroup, 0, 4.72, -0.12, 14.0, 0.28, 0.32, createMat(0xffffff, 0.35, 0.05), false, false, false);
  addBox(storeGroup, 0, 4.47, -0.31, 8.8, 0.42, 0.08, createMat(0xffffff, 0.25, 0.0, 0xffffff, 0.7), false, false, false);
  // 看板の色帯（文字テクスチャなしでもコンビニらしく認識できる配色）。
  addBox(storeGroup, -5.0, 4.47, -0.37, 2.0, 0.42, 0.08, createMat(0xe34a45, 0.35, 0.0), false, false, false);
  addBox(storeGroup, 5.0, 4.47, -0.37, 2.0, 0.42, 0.08, createMat(0x168b72, 0.35, 0.0), false, false, false);
  // 軒・屋根の縁。
  addBox(storeGroup, 0, 5.0, 3.35, 14.5, 0.28, 7.6, roofMat, true, true, false);
  // 店内の商品棚：3列、棚板と色違いの商品箱。
  const shelfMat = createMat(0x424b52, 0.75, 0.1);
  const productMats = [createMat(0xe7a34b, 0.5, 0.05), createMat(0x65a9a0, 0.5, 0.05), createMat(0xc96e68, 0.5, 0.05), createMat(0xe4d8b6, 0.65, 0.0)];
  function shelf(x, z, length) {
    addBox(storeGroup, x, 0.65, z, length, 1.25, 0.72, shelfMat, false, true, false);
    for (let level = 0; level < 3; level++) {
      addBox(storeGroup, x, 0.45 + level * 0.38, z - 0.39, length, 0.045, 0.08, createMat(0xd8d6cf, 0.8), false, false, false);
      for (let k = 0; k < Math.floor(length / 0.55); k++) {
        addBox(storeGroup, x - length / 2 + 0.25 + k * 0.55, 0.58 + level * 0.38, z - 0.45,
          0.25, 0.22, 0.12, productMats[(k + level) % productMats.length], false, false, false);
      }
    }
  }
  shelf(-3.6, 2.0, 4.2);
  shelf(0.0, 2.7, 4.2);
  shelf(3.6, 2.0, 4.2);
  // レジカウンターと端末。
  addBox(storeGroup, 4.7, 0.62, 5.3, 2.7, 1.2, 0.85, createMat(0x4a555b, 0.75), false, true, false);
  addBox(storeGroup, 4.4, 1.32, 5.15, 0.55, 0.16, 0.42, darkGlassMat, false, false, false);
  // レジに立つ店員。簡単な3D人型モデル（制服・顔・髪・腕）を配置。
  const clerk = new THREE.Group();
  clerk.position.set(4.55, 0, 6.05);
  clerk.rotation.y = 0; // カウンターの内側から入口側を向く
  storeGroup.add(clerk);
  const uniformMat = createMat(0x245a4b, 0.75, 0.05);
  const skinMat = createMat(0xd8a27e, 0.8, 0.0);
  const hairMat = createMat(0x282522, 0.9, 0.0);
  const pantsMat = createMat(0x303944, 0.8, 0.0);
  function clerkPart(w, h, d, mat, x, y, z, round=false) {
    const geo = round ? new THREE.SphereGeometry(w, 10, 8) : new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    clerk.add(mesh);
    return mesh;
  }
  clerkPart(0.32, 0.62, 0.22, uniformMat, 0, 1.25, 0);
  clerkPart(0.13, 0.45, 0.14, pantsMat, -0.09, 0.48, 0);
  clerkPart(0.13, 0.45, 0.14, pantsMat, 0.09, 0.48, 0);
  clerkPart(0.22, 0.22, 0.22, skinMat, 0, 1.72, -0.01, true);
  clerkPart(0.23, 0.10, 0.23, hairMat, 0, 1.81, -0.015, true);
  clerkPart(0.10, 0.40, 0.11, uniformMat, -0.22, 1.31, -0.08);
  clerkPart(0.10, 0.40, 0.11, uniformMat, 0.22, 1.31, -0.08);
  clerkPart(0.075, 0.24, 0.075, skinMat, -0.22, 1.10, -0.12);
  clerkPart(0.075, 0.24, 0.075, skinMat, 0.22, 1.10, -0.12);
  // 目を小さな点で付け、店員の顔の向きを入口側にする。
  const eyeMat = createMat(0x191919, 0.7, 0.0);
  clerkPart(0.025, 0.025, 0.025, eyeMat, -0.055, 1.73, -0.115, true);
  clerkPart(0.025, 0.025, 0.025, eyeMat, 0.055, 1.73, -0.115, true);

  // 駐車場に車を2台追加。車体・窓・4輪を簡易モデルで表現。
  function addParkingCar(x, z, bodyColor, cabinColor) {
    const car = new THREE.Group();
    car.position.set(x, 0.04, z);
    storeGroup.add(car);
    const bodyMat = createMat(bodyColor, 0.38, 0.28);
    const cabinMat = createMat(cabinColor, 0.22, 0.35);
    const tireMat = createMat(0x17191b, 0.9, 0.05);
    const wheelMat = createMat(0x73797c, 0.55, 0.25);
    function carBox(w,h,d,mat,px,py,pz) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
      m.position.set(px,py,pz); m.castShadow = true; m.receiveShadow = true; car.add(m); return m;
    }
    carBox(2.05, 0.52, 3.55, bodyMat, 0, 0.58, 0);
    carBox(1.58, 0.58, 1.75, cabinMat, 0, 1.05, 0.12);
    carBox(1.72, 0.12, 0.16, createMat(0xe8e6d6,0.3), 0, 0.52, -1.79);
    carBox(1.72, 0.12, 0.16, createMat(0xb53b35,0.35), 0, 0.52, 1.79);
    for (const wx of [-1.0,1.0]) for (const wz of [-1.15,1.15]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.34,0.18,12), tireMat);
      wheel.rotation.z = Math.PI/2; wheel.position.set(wx,0.35,wz); wheel.castShadow=true; car.add(wheel);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,0.19,10), wheelMat);
      hub.rotation.z = Math.PI/2; hub.position.set(wx*1.01,0.35,wz); car.add(hub);
    }
    // 駐車車両の立体的な当たり判定（ボンネット・トランクと屋根の2段構成で上に乗れる）
    addBox(car, 0, 0.42, 0, 2.05, 0.84, 3.55, bodyMat, false, false, true);
    addBox(car, 0, 0.95, 0.12, 1.62, 0.75, 1.8, cabinMat, false, false, true);
  }
  addParkingCar(-4.0, -5.3, 0x536b7b, 0x263b48);
  addParkingCar(4.0, -5.3, 0x8a3430, 0x292f34);

  // 店内の白色照明と入口周辺の暖色照明。
  const insideLight = new THREE.PointLight(0xfff4dc, 8, 20, 1.5);
  insideLight.position.set(0, 3.7, 2.5);
  storeGroup.add(insideLight);
  const frontLight = new THREE.PointLight(0xffe8b5, 2.8, 12, 1.8);
  frontLight.position.set(0, 3.2, -2.0);
  storeGroup.add(frontLight);
  // 駐車場のアスファルトと白線（道路側）。
  addBox(storeGroup, 0, -0.06, -5.3, 16, 0.12, 3.8, createMat(0x3a3b3c, 0.9), false, true, false);
  for (const x of [-5.2, 0, 5.2]) {
    addBox(storeGroup, x, 0.015, -5.3, 0.12, 0.02, 3.3, createMat(0xf0eee4, 0.8), false, false, false);
  }
}

// プレイヤーが入口に近づくと自動ドアが左右に開き、離れると閉じる。
function updateStoreAutomaticDoor(dt) {
  if (!storeDoorLeft || !storeDoorRight) return;
  const doorWorldX = 48;
  const doorWorldZ = 49 - 0.16 * 1.25;
  const distance = Math.hypot(player.x - doorWorldX, player.z - doorWorldZ);
  const target = (state.mode === 'playing' && distance < 4.4) ? 1 : 0;
  const speed = 2.8;
  if (storeDoorOpenAmount < target) storeDoorOpenAmount = Math.min(target, storeDoorOpenAmount + speed * dt);
  else if (storeDoorOpenAmount > target) storeDoorOpenAmount = Math.max(target, storeDoorOpenAmount - speed * dt);
  const slide = 1.08 * storeDoorOpenAmount;
  storeDoorLeft.position.x = -slide;
  storeDoorRight.position.x = slide;
}

// ==========================================
// 6. 高密度タウンマップ（何もないエリアゼロ・見える壁で行き止まり再現）
// ==========================================
function buildDenseCrankCity() {
  // 第1段階：130m×130mの地面と道路だけを生成する。
  // 建物・コンビニ・交番・信号機はまだ配置しない。
  const groundMat = createMat(0x34383d, 0.98, 0.0);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(130, 130), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.13, 0);
  ground.receiveShadow = true;
  ground.name = 'ground_130m';
  scene.add(ground);

  const roadMat = createMat(0x24272b, 0.98, 0.0);
  const lineMat = createMat(0xe7dfc8, 0.75, 0.0, 0x8a806c, 0.12);
  const edgeMat = createMat(0x77716b, 0.95, 0.0);
  const roadY = -0.045;
  const lineY = 0.005;

  // 道路の面を追加（X方向は横道、Z方向は縦道）。
  function road(x, z, width, depth) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), roadMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, roadY, z);
    mesh.receiveShadow = true;
    scene.add(mesh);
  }
  function marking(x, z, width, depth, material = lineMat) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, lineY, z);
    scene.add(mesh);
  }

  // 中央の広い大通りと、左右・前後の生活道路。
  road(0, 0, 130, 12);
  road(0, 0, 12, 130);
  for (const x of [-32, 32]) road(x, 0, 7, 130);
  for (const z of [-32, 32]) road(0, z, 130, 7);

  // 細い裏路地。部分的な道にしてT字路も作る。
  road(-16, -44, 4, 41);
  road(16, 41, 4, 47);
  road(-47, 16, 32, 4);
  road(45, -16, 40, 4);
  road(-46, -16, 38, 4);
  road(46, 16, 38, 4);

  // 大通りの破線センターライン。
  for (let z = -61; z <= 61; z += 5.3) {
    if (Math.abs(z) < 8) continue;
    marking(0, z, 0.22, 4.2);
  }
  for (let x = -61; x <= 61; x += 5.3) {
    if (Math.abs(x) < 8) continue;
    marking(x, 0, 4.2, 0.22);
  }

  // 生活道路の端線。交差点の中央は空け、線が不自然に交差しないようにする。
  for (const x of [-32, 32]) {
    for (const side of [-1, 1]) {
      marking(x + side * 3.0, 0, 0.12, 130, edgeMat);
    }
  }
  for (const z of [-32, 32]) {
    for (const side of [-1, 1]) {
      marking(0, z + side * 3.0, 130, 0.12, edgeMat);
    }
  }

  // 横断歩道：中央交差点と主要道路の交差点に設置。
  const crosswalkMat = createMat(0xd8d5cf, 0.8, 0.0);
  function crosswalkX(x, z) {
    for (let i = -4; i <= 4; i++) {
      marking(x + i * 1.15, z, 0.62, 3.2, crosswalkMat);
    }
  }
  function crosswalkZ(x, z) {
    for (let i = -4; i <= 4; i++) {
      marking(x, z + i * 1.15, 3.2, 0.62, crosswalkMat);
    }
  }
  for (const p of [-32, 32]) {
    crosswalkX(0, p - 9);
    crosswalkX(0, p + 9);
    crosswalkZ(p - 9, 0);
    crosswalkZ(p + 9, 0);
  }
  crosswalkX(0, -9);
  crosswalkX(0, 9);
  crosswalkZ(-9, 0);
  crosswalkZ(9, 0);

  // 大通りに駐車車両を間隔を空けて配置（乗用車・軽自動車・大型車・トラック・軽トラ）。
  // 車体は景観用で、車両同士が密集しないよう道路の左右レーンに分散する。
  function addRoadVehicle(x, z, type, color, rotation = 0) {
    // 日本の軽自動車・ハイトワゴン・軽トラックを参考にした、角を抑えた車体デザイン
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = rotation;
    scene.add(g);
    const bodyMat = createMat(color, 0.32, 0.18);
    const trimMat = createMat(0x20262b, 0.7, 0.08);
    const glassMat = createMat(0x42616d, 0.18, 0.16);
    const tireMat = createMat(0x151719, 0.88, 0.03);
    const rimMat = createMat(0xb8c1c6, 0.35, 0.32);
    const lampMat = createMat(0xfff0c4, 0.2, 0.08, 0xffd66b, 0.25);
    const tailMat = createMat(0xb52828, 0.25, 0.1);
    let length = 3.9, width = 1.72, bodyH = 0.62, cabLen = 1.9, cabH = 0.9;
    if (type === 'kei') { length = 3.35; width = 1.48; bodyH = 0.57; cabLen = 1.95; cabH = 0.98; }
    if (type === 'large') { length = 4.65; width = 1.82; bodyH = 0.68; cabLen = 2.25; cabH = 1.02; }
    if (type === 'truck') { length = 7.0; width = 2.25; bodyH = 0.68; cabLen = 1.8; cabH = 1.08; }
    if (type === 'keiTruck') { length = 4.0; width = 1.55; bodyH = 0.56; cabLen = 1.35; cabH = 0.82; }
    function part(w,h,d,mat,px,py,pz, bevel=false) {
      const geom = new THREE.BoxGeometry(w,h,d);
      const m = new THREE.Mesh(geom,mat);
      m.position.set(px,py,pz); m.castShadow=true; m.receiveShadow=true; g.add(m); return m;
    }
    // 低いバンパーと下部ボディ
    part(width*0.96, 0.18, length*0.93, trimMat, 0, 0.28, 0);
    part(width, bodyH, length*0.88, bodyMat, 0, 0.56, 0);
    // ボンネットは前方、車種ごとに短く/長く調整
    part(width*0.91, 0.18, type==='keiTruck' ? 0.65 : 0.82, bodyMat, 0, 0.82, length*0.31);
    if (type === 'truck') {
      // 箱型の荷台＋前方キャビン
      part(width*0.91, 1.18, length*0.52, createMat(0xd7dadd,0.48,0.15), 0, 1.23, -length*0.20);
      part(width*0.88, 0.12, length*0.51, trimMat, 0, 0.69, -length*0.20);
      part(width*0.91, cabH, cabLen, bodyMat, 0, 1.17, length*0.29);
      part(width*0.82, 0.58, 0.08, glassMat, 0, 1.40, length*0.29 + cabLen*0.51);
      part(width*0.76, 0.48, cabLen*0.68, glassMat, 0, 1.44, length*0.29);
    } else if (type === 'keiTruck') {
      // 軽トラ：前席と開放荷台
      part(width*0.92, 0.18, length*0.43, createMat(0x9ba4a8,0.62,0.12), 0, 0.82, -length*0.22);
      part(width*0.88, cabH, cabLen, bodyMat, 0, 1.02, length*0.28);
      part(width*0.78, 0.48, 0.08, glassMat, 0, 1.22, length*0.28 + cabLen*0.51);
      part(width*0.72, 0.44, cabLen*0.64, glassMat, 0, 1.27, length*0.28);
      // 荷台の縁
      for (const side of [-1,1]) part(0.07,0.34,length*0.43,trimMat,side*width*0.43,0.91,-length*0.22);
      part(width*0.86,0.32,0.07,trimMat,0,0.91,-length*0.44);
    } else {
      // 軽ハッチバック/ハイトワゴン/ミニバンの一体感あるキャビン
      const cabZ = type === 'kei' ? -0.02 : -0.02;
      part(width*0.86, cabH, cabLen, bodyMat, 0, 1.00, cabZ);
      // 前後ガラス
      part(width*0.75, 0.48, 0.07, glassMat, 0, 1.20, cabZ + cabLen*0.51);
      part(width*0.73, 0.46, 0.07, glassMat, 0, 1.20, cabZ - cabLen*0.51);
      // 左右の窓パネルとピラー
      for (const side of [-1,1]) {
        part(0.055,0.49,cabLen*0.70,glassMat,side*width*0.435,1.22,cabZ);
        part(0.075,0.55,0.08,trimMat,side*width*0.44,1.20,cabZ+cabLen*0.20);
        part(0.075,0.55,0.08,trimMat,side*width*0.44,1.20,cabZ-cabLen*0.20);
        // ドアハンドルとミラー
        part(0.035,0.045,0.17,trimMat,side*width*0.505,0.83,cabZ-0.05);
        part(0.12,0.09,0.15,bodyMat,side*width*0.55,1.12,cabZ+cabLen*0.32);
      }
    }
    // グリル・前後ライト・ナンバープレート
    part(width*0.42,0.16,0.055,trimMat,0,0.56,length*0.455);
    part(width*0.27,0.10,0.035,createMat(0x9da9ad,0.3,0.2),0,0.55,length*0.49);
    for (const side of [-1,1]) {
      part(width*0.22,0.16,0.06,lampMat,side*width*0.32,0.68,length*0.45);
      part(width*0.17,0.13,0.06,tailMat,side*width*0.34,0.65,-length*0.45);
    }
    // 4輪とシルバーのホイール
    const wheelZ = type === 'truck' ? [-length*0.34, length*0.32] : [-length*0.32,length*0.32];
    for (const wx of [-width*0.49,width*0.49]) {
      for (const wz of wheelZ) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.29,0.29,0.17,14),tireMat);
        wheel.rotation.z=Math.PI/2; wheel.position.set(wx,0.31,wz); wheel.castShadow=true; g.add(wheel);
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.145,0.145,0.18,12),rimMat);
        rim.rotation.z=Math.PI/2; rim.position.set(wx*1.005,0.31,wz); g.add(rim);
      }
    }
    // 道路車両の立体的な当たり判定（ボンネット・荷台・屋根の形状に合わせた多段コライダー）
    function addVehiclePartCollider(offZ, w, d, h) {
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const wx = x - sin * offZ;
      const wz = z + cos * offZ;
      const isRot90 = Math.abs(sin) > 0.5;
      const colW = isRot90 ? d : w;
      const colD = isRot90 ? w : d;
      colliders.push({
        minX: wx - colW / 2,
        maxX: wx + colW / 2,
        minY: 0,
        maxY: h,
        minZ: wz - colD / 2,
        maxZ: wz + colD / 2
      });
    }

    if (type === 'truck') {
      // トラック荷台（高さ1.12m・荷台に乗れる）
      addVehiclePartCollider(-length * 0.14, width, length * 0.68, 1.12);
      // トラックキャビン（高さ2.18m・運転席屋根）
      addVehiclePartCollider(length * 0.32, width, length * 0.34, 2.18);
    } else if (type === 'keiTruck') {
      // 軽トラ荷台（高さ0.78m・荷台に乗れる）
      addVehiclePartCollider(-length * 0.14, width, length * 0.66, 0.78);
      // 軽トラキャビン（高さ1.72m・キャビン屋根）
      addVehiclePartCollider(length * 0.3, width, length * 0.34, 1.72);
    } else {
      // 一般車・セダン・軽・大型車
      // ボンネット・トランク部（高さ0.78m・ジャンプで飛び乗れる）
      addVehiclePartCollider(0, width, length, 0.78);
      // キャビン・ルーフ（高さ1.46m・屋根の上にも立てる）
      addVehiclePartCollider(0.08, width * 0.88, length * 0.52, 1.46);
    }
  }
  // 縦方向の大通り（x=0）。各車両は約18〜24m間隔。
  addRoadVehicle(-2.1, -53, 'kei', 0xd7dce0, 0);
  addRoadVehicle(2.1, -30, 'large', 0x315b83, Math.PI);
  addRoadVehicle(-2.1, -7, 'truck', 0x777d83, 0);
  addRoadVehicle(2.1, 19, 'keiTruck', 0x47744f, Math.PI);
  addRoadVehicle(-2.1, 52, 'sedan', 0x8b3435, 0);
  // 横方向の大通り（z=0）。
  addRoadVehicle(-53, -2.1, 'large', 0x9a9fa4, Math.PI/2);
  addRoadVehicle(-29, 2.1, 'kei', 0xcebfa0, -Math.PI/2);
  addRoadVehicle(-5, -2.1, 'truck', 0x42566b, Math.PI/2);
  addRoadVehicle(22, 2.1, 'keiTruck', 0xb7b9b2, -Math.PI/2);
  addRoadVehicle(52, -2.1, 'sedan', 0x344a3f, Math.PI/2);

  // 道路沿いのビル群（第2段階）。道路面を塞がない位置に、形・階数・外装を変えて配置する。
  const buildingColors = [0x8b969f, 0x667782, 0xb5a18c, 0x6d777d, 0x9caaa9, 0x786b63, 0x8995a2];
  const glassMats = [
    createMat(0x8fc9df, 0.24, 0.28, 0x183d50, 0.16),
    createMat(0x4e7587, 0.22, 0.35, 0x142c3a, 0.12),
    createMat(0xb8d8df, 0.18, 0.3, 0x24434b, 0.12)
  ];
  const trimMats = [createMat(0x333b42, 0.75, 0.18), createMat(0xd2d0c8, 0.72, 0.1), createMat(0x6b5545, 0.8, 0.08)];
  const roofMats = [createMat(0x34383c, 0.92, 0.1), createMat(0x565c61, 0.88, 0.08)];
  let buildingIndex = 0;
  function makeStreetBuilding(x, z, sx, sz, floors, style) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    scene.add(group);
    const h = floors * 3.15;
    const baseMat = createMat(buildingColors[(buildingIndex + style) % buildingColors.length], 0.72, 0.16);
    const glass = glassMats[(buildingIndex + style) % glassMats.length];
    const trim = trimMats[(buildingIndex + style) % trimMats.length];
    const roof = roofMats[(buildingIndex + style) % roofMats.length];
    // 主躯体は衝突判定あり。建物の足元は道路から少し離している。
    addBox(group, 0, h / 2, 0, sx, h, sz, baseMat, true, true, true);
    // 外観を3パターンで変化：ガラスカーテンウォール／横帯／茶系の縦フレーム。
    if (style % 3 === 0) {
      for (let f = 1; f < floors; f++) {
        const y = f * 3.15;
        addBox(group, 0, y, sz / 2 + 0.035, sx * 0.94, 0.16, 0.08, trim, false, false);
        addBox(group, 0, y, -sz / 2 - 0.035, sx * 0.94, 0.16, 0.08, trim, false, false);
        addBox(group, sx / 2 + 0.035, y, 0, 0.08, 0.16, sz * 0.94, trim, false, false);
        addBox(group, -sx / 2 - 0.035, y, 0, 0.08, 0.16, sz * 0.94, trim, false, false);
      }
      addBox(group, 0, h * 0.53, sz / 2 + 0.055, sx * 0.78, h * 0.78, 0.07, glass, false, false);
      addBox(group, sx / 2 + 0.055, h * 0.53, 0, 0.07, h * 0.78, sz * 0.78, glass, false, false);
    } else if (style % 3 === 1) {
      for (let f = 1; f < floors; f++) {
        const y = f * 3.15;
        addBox(group, 0, y, sz / 2 + 0.045, sx * 1.02, 0.38, 0.1, trim, false, false);
        addBox(group, 0, y, -sz / 2 - 0.045, sx * 1.02, 0.38, 0.1, trim, false, false);
        addBox(group, sx / 2 + 0.045, y, 0, 0.1, 0.38, sz * 1.02, trim, false, false);
        addBox(group, -sx / 2 - 0.045, y, 0, 0.1, 0.38, sz * 1.02, trim, false, false);
      }
      for (let f = 0; f < floors; f++) {
        const y = f * 3.15 + 1.65;
        addBox(group, 0, y, sz / 2 + 0.052, sx * 0.82, 1.55, 0.075, glass, false, false);
        addBox(group, sx / 2 + 0.052, y, 0, 0.075, 1.55, sz * 0.82, glass, false, false);
      }
    } else {
      for (let f = 0; f < floors; f++) {
        const y = f * 3.15 + 1.65;
        addBox(group, 0, y, sz / 2 + 0.052, sx * 0.68, 1.75, 0.075, glass, false, false);
        addBox(group, sx / 2 + 0.052, y, 0, 0.075, 1.75, sz * 0.68, glass, false, false);
      }
      for (const side of [-1, 1]) {
        addBox(group, side * sx * 0.36, h / 2, sz / 2 + 0.09, 0.24, h, 0.12, trim, false, false);
      }
    }
    addBox(group, 0, h + 0.12, 0, sx + 0.6, 0.24, sz + 0.6, roof, true, true);
    // 一部の屋上に小さな機械室を置き、シルエットにも差をつける。
    if (buildingIndex % 3 === 0) {
      addBox(group, sx * 0.18, h + 0.72, -sz * 0.12, sx * 0.28, 0.95, sz * 0.26, trim, true, true, true);
    }
    buildingIndex++;
  }
  // 道路の両側に並ぶ区画。各区画で幅・奥行き・階数・意匠を変える。
  const lots = [
    [-11.82,-53.77,9.45,8.86,5,0],[-23.05,-53.77,7.68,9.45,4,1],[-11.82,-42.55,8.86,7.68,3,2],[-23.05,-42.55,7.68,7.68,6,0],
    [11.82,-53.77,8.86,8.86,4,2],[23.05,-53.77,7.68,9.45,5,1],[11.82,-42.55,8.27,7.68,6,0],[23.05,-42.55,7.68,7.68,3,2],
    [-53.77,-23.05,8.86,7.68,4,1],[-42.55,-23.05,7.68,8.86,6,2],[-53.77,-11.82,8.86,8.27,3,0],[-42.55,-11.82,7.68,8.27,5,1],
    [53.77,-23.05,8.86,7.68,5,2],[42.55,-23.05,7.68,8.86,4,0],[53.77,-11.82,8.86,8.27,6,1],[42.55,-11.82,7.68,8.27,3,2],
    [-23.05,11.82,7.68,8.27,4,2],[-11.82,11.82,8.86,8.27,6,0],[-23.05,23.05,7.68,8.86,3,1],[-11.82,23.05,8.86,8.86,5,2],
    [23.05,11.82,7.68,8.27,5,1],[11.82,11.82,8.86,8.27,3,2],[23.05,23.05,7.68,8.86,6,0],[11.82,23.05,8.86,8.86,4,1],
    [-53.77,42.55,8.27,7.68,4,0],[-42.55,42.55,7.68,8.27,5,1],[-53.77,53.77,8.27,7.68,3,2],[-42.55,53.77,7.68,8.27,6,0],
    [53.77,42.55,8.27,7.68,5,1],[42.55,42.55,7.68,8.27,3,2],[53.77,53.77,8.27,7.68,4,0],[42.55,53.77,7.68,8.27,6,1],
    [-11.82,-23.05,8.86,7.09,4,0],[11.82,-23.05,8.86,7.09,5,1],[-23.05,-11.82,7.09,8.86,3,2],[23.05,-11.82,7.09,8.86,4,0],
    [-11.82,42.55,8.86,7.09,5,2],[11.82,42.55,8.86,7.09,4,0],[-23.05,53.77,7.09,7.68,6,1],[23.05,53.77,7.09,7.68,3,2]
  ];
  for (const [x,z,sx,sz,floors,style] of lots) {
    // 南東のコンビニ用区画はビルを置かず、店が建物に埋もれないようにする。
    const overlapsStoreLot = x > 34 && z > 34;
    const reservedHaneLot = Math.abs(x - 42.55) < 0.1 && Math.abs(z + 42.55) < 0.1;
    if (overlapsStoreLot || reservedHaneLot) continue;
    makeStreetBuilding(x,z,sx,sz,floors,style);
  }

  // マップ外周を大きな壁で完全に囲う（見た目と衝突判定を一致させる）。
  const boundaryWallMat = createMat(0x29272d, 0.92, 0.05);
  const boundary = 64;
  const wallHeight = 18;
  const wallThickness = 2;
  // 北・南の壁
  addBox(scene, 0, wallHeight / 2 - 0.13, -boundary, 130, wallHeight, wallThickness, boundaryWallMat, true, true, true);
  addBox(scene, 0, wallHeight / 2 - 0.13, boundary, 130, wallHeight, wallThickness, boundaryWallMat, true, true, true);
  // 東・西の壁
  addBox(scene, -boundary, wallHeight / 2 - 0.13, 0, wallThickness, wallHeight, 130, boundaryWallMat, true, true, true);
  addBox(scene, boundary, wallHeight / 2 - 0.13, 0, wallThickness, wallHeight, 130, boundaryWallMat, true, true, true);
}


// ディテール付きビル生成（窓・屋上ヘリ・室外機・ネオン看板）
function addDetailedBuilding(parent, x, z, sx, sy, sz, colorHex) {
  const bMat = createMat(colorHex, 0.85, 0.1);
  addBox(parent, x, sy / 2, z, sx, sy, sz, bMat, true, true, true);
  // 屋上ヘリ・フェンス
  addBox(parent, x, sy + 0.3, z, sx + 0.1, 0.6, sz + 0.1, createMat(0x1e293b, 0.6, 0.3), true, false);

  // 窓の明かり
  const winMat = createMat(0xffedd5, 0.2, 0.1, 0xfdba74, 1.3);
  const rows = Math.floor(sy / 2.8);
  for (let r = 1; r < rows; r++) {
    const wy = r * 2.6;
    if (sx >= 6) {
      addBox(parent, x, wy, z - sz / 2 - 0.05, sx * 0.7, 0.9, 0.08, winMat, false, false);
      addBox(parent, x, wy, z + sz / 2 + 0.05, sx * 0.7, 0.9, 0.08, winMat, false, false);
    }
  }
}

// ==========================================
// 7. 大通りの信号機＆横断歩道（Z: -72 付近）
// ==========================================
function buildHospitalAndHaneSupermarket() {
  // ミニマップで指定された空き区画：北東に「はんえー」、西側に病院。
  const hospital = new THREE.Group();
  hospital.position.set(-42.5, 0, 8.5);
  scene.add(hospital);
  const stone = createMat(0xd8d2c6, 0.88, 0.03);
  const stoneLight = createMat(0xe9e4da, 0.82, 0.02);
  const brick = createMat(0x9b785f, 0.9, 0.02);
  const glass = createMat(0x315d70, 0.22, 0.22, 0x173747, 0.15);
  const roof = createMat(0x6d5145, 0.86, 0.05);
  const red = createMat(0xd92332, 0.35, 0.08, 0x8f111e, 0.45);
  // クリニック風の切妻屋根と淡い石目外壁
  addBox(hospital, 0, 2.05, 0, 9.6, 4.1, 7.8, stone, true, true, true);
  addBox(hospital, 0, 4.2, 0, 10.1, 0.22, 8.2, roof, true, true, false);
  // 屋根の二面を傾斜板で表現
  const roofPanelA = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.22, 8.5), roof);
  roofPanelA.position.set(-2.45, 5.05, 0); roofPanelA.rotation.z = -0.34; roofPanelA.castShadow = true; hospital.add(roofPanelA);
  const roofPanelB = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.22, 8.5), roof);
  roofPanelB.position.set(2.45, 5.05, 0); roofPanelB.rotation.z = 0.34; roofPanelB.castShadow = true; hospital.add(roofPanelB);
  addBox(hospital, 0, 0.48, 3.94, 9.5, 0.96, 0.18, brick, true, true, false);
  // 正面の大きな窓と中央玄関
  for (const x of [-3.45, -1.55, 1.55, 3.45]) {
    addBox(hospital, x, 2.05, 3.96, 1.22, 1.55, 0.09, glass, false, false, false);
    addBox(hospital, x, 2.05, 4.02, 1.34, 0.08, 0.08, stoneLight, false, false, false);
  }
  addBox(hospital, 0, 1.55, 4.02, 1.35, 2.35, 0.1, glass, false, false, false);
  addBox(hospital, -0.72, 1.55, 4.12, 0.12, 2.45, 0.12, stoneLight, false, false, false);
  addBox(hospital, 0.72, 1.55, 4.12, 0.12, 2.45, 0.12, stoneLight, false, false, false);
  // 病院の赤十字を正面上部に設置
  addBox(hospital, 0, 3.25, 4.12, 1.25, 0.22, 0.14, red, false, false, false);
  addBox(hospital, 0, 3.25, 4.13, 0.22, 1.25, 0.14, red, false, false, false);
  // 入口までの小さな歩道と案内ポール
  addBox(hospital, 0, 0.025, 5.45, 4.0, 0.05, 2.6, createMat(0xbab8b0, 0.95, 0), false, true, false);
  addBox(hospital, -4.0, 1.0, 4.35, 0.12, 2.0, 0.12, stoneLight, false, false, false);
  addBox(hospital, 4.0, 1.0, 4.35, 0.12, 2.0, 0.12, stoneLight, false, false, false);

  const market = new THREE.Group();
  market.position.set(42.5, 0, -42.5);
  scene.add(market);
  const marketWall = createMat(0xe4e6df, 0.82, 0.03);
  const marketGreen = createMat(0x159b91, 0.52, 0.08);
  const marketDark = createMat(0x08766f, 0.55, 0.06);
  const marketGlass = createMat(0x6ca5aa, 0.22, 0.2, 0x16454a, 0.12);
  const signYellow = createMat(0xffd21c, 0.55, 0.02);
  // サンエー系の食品スーパーを参考にした平屋＋緑の庇
  addBox(market, 0, 2.0, 0, 10.2, 4.0, 8.4, marketWall, true, true, true);
  addBox(market, 0, 4.12, 0, 10.7, 0.22, 8.9, marketGreen, true, true, false);
  addBox(market, 0, 3.6, 4.28, 10.5, 0.42, 0.42, marketGreen, true, true, false);
  addBox(market, 0, 3.35, 4.51, 9.8, 0.12, 0.08, createMat(0xf4f4ec, 0.7, 0), false, false, false);
  // ガラス張りの正面と自動ドア
  for (const x of [-4.0, -2.65, -1.3, 1.3, 2.65, 4.0]) {
    addBox(market, x, 1.8, 4.24, 1.08, 2.35, 0.09, marketGlass, false, false, false);
  }
  addBox(market, 0, 1.55, 4.3, 1.15, 2.7, 0.1, createMat(0x285d68, 0.2, 0.18), false, false, false);
  addBox(market, -0.6, 1.55, 4.36, 0.06, 2.55, 0.06, marketGreen, false, false, false);
  addBox(market, 0.6, 1.55, 4.36, 0.06, 2.55, 0.06, marketGreen, false, false, false);
  // 看板は CanvasTexture で正確に「スーパー」と表示
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 512; signCanvas.height = 128;
  const signCtx = signCanvas.getContext('2d');
  signCtx.fillStyle = '#ffd21c'; signCtx.fillRect(0, 0, 512, 128);
  signCtx.fillStyle = '#159b91'; signCtx.fillRect(0, 0, 15, 128);
  signCtx.fillStyle = '#e32636'; signCtx.font = 'bold 76px "Yu Gothic", YuGothic, Meiryo, sans-serif';
  signCtx.textAlign = 'center'; signCtx.textBaseline = 'middle'; signCtx.fillText('スーパー', 260, 66);
  const signTexture = new THREE.CanvasTexture(signCanvas);
  signTexture.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.4), new THREE.MeshBasicMaterial({ map: signTexture }));
  sign.position.set(0, 3.35, 4.58); market.add(sign);
  // 店舗前駐車場・区画線と小さな植栽
  const asphalt = createMat(0x42484b, 0.96, 0.0);
  addBox(market, 0, -0.035, 7.0, 11.0, 0.08, 4.4, asphalt, false, true, false);
  const parkingLine = createMat(0xf0eee1, 0.8, 0.0);
  for (let x = -4.4; x <= 4.4; x += 2.2) addBox(market, x, 0.012, 7.0, 0.045, 0.025, 3.7, parkingLine, false, false, false);
  // 看板の小さな縁取り
  addBox(market, 0, 3.35, 4.48, 5.9, 1.55, 0.06, marketDark, false, false, false);
  // 先に追加した縁取りの前面へ看板を戻す
  sign.position.z = 4.535;
}

function buildTrafficLights() {
  trafficLightGroup = new THREE.Group();
  trafficLightGroup.position.set(40, 0, -72);
  scene.add(trafficLightGroup);

  const zebraMat = createMat(0xffffff, 0.5, 0.1, 0xfff7ed, 0.5);
  for (let x = -5.5; x <= 5.5; x += 1.3) {
    addBox(trafficLightGroup, x, 0.04, 0, 0.7, 0.03, 3.2, zebraMat, false, true);
  }

  const metalMat = createMat(0x64748b, 0.5, 0.6);
  for (const side of [-6.8, 6.8]) {
    addBox(trafficLightGroup, side, 3.0, 0, 0.16, 6.0, 0.16, metalMat, true, true, true);
    addBox(trafficLightGroup, side * 0.7, 5.8, 0, 2.8, 0.12, 0.12, metalMat, true, true);

    const lightBox = addBox(trafficLightGroup, side * 0.5, 5.7, 0, 1.4, 0.45, 0.25, createMat(0x1e293b, 0.8), true, false);
    addBox(lightBox, -0.4, 0, 0.14, 0.25, 0.25, 0.05, createMat(0x22c55e, 0.1, 0.1, 0x16a34a, 3.5), false, false);
    addBox(lightBox, 0, 0, 0.14, 0.25, 0.25, 0.05, createMat(0x334155, 0.8), false, false);
    addBox(lightBox, 0.4, 0, 0.14, 0.25, 0.25, 0.05, createMat(0x334155, 0.8), false, false);

    const pedBox = addBox(trafficLightGroup, side, 2.5, -0.2, 0.35, 0.75, 0.25, createMat(0x1e293b, 0.8), true, false);
    addBox(pedBox, 0, 0.18, 0.13, 0.2, 0.2, 0.04, createMat(0x22c55e, 0.1, 0.1, 0x16a34a, 3.0), false, false);
    addBox(pedBox, 0, -0.18, 0.13, 0.2, 0.2, 0.04, createMat(0x334155, 0.8), false, false);
  }
}


// ==========================================
// 公園：南西側の広い空き区画に配置
// ==========================================
function buildPark() {
  const park = new THREE.Group();
  park.position.set(48, 0, 23);
  scene.add(park);
  const grass = createMat(0x355b42, 0.98, 0.0);
  const path = createMat(0x9a9b8d, 0.95, 0.0);
  const wood = createMat(0x76513a, 0.9, 0.0);
  const metal = createMat(0x343c43, 0.75, 0.2);
  addBox(park, 0, -0.045, 0, 25, 0.12, 22, grass, false, true, false);
  addBox(park, 0, 0.025, 0, 2.6, 0.025, 21, path, false, true, false);
  addBox(park, 0, 0.03, 0, 24, 0.025, 2.2, path, false, true, false);
  // ベンチ2台（当たり判定付き）
  for (const z of [-6, 6]) {
    addBox(park, -5.5, 0.55, z, 2.4, 0.55, 0.65, wood, true, true, true);
    addBox(park, -5.5, 0.85, z + 0.22, 2.4, 0.55, 0.14, wood, true, true, false);
    for (const x of [-6.35, -4.65]) addBox(park, x, 0.28, z, 0.12, 0.55, 0.12, metal, true, true, false);
  }
  // 木を4本、幹と樹冠で表現（当たり判定付き）
  for (const [x,z] of [[-9,-7],[9,-7],[-9,7],[9,7]]) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.32,2.1,8), wood);
    trunk.position.set(x,1.0,z); trunk.castShadow=true; park.add(trunk);
    const crown = new THREE.Mesh(new THREE.SphereGeometry(1.45,10,8), createMat(0x244a34,0.95,0.0));
    crown.position.set(x,2.65,z); crown.castShadow=true; park.add(crown);

    // 公園の木々の当たり判定（ワールド座標）
    const wx = park.position.x + x;
    const wz = park.position.z + z;
    const treeRadius = 0.55;
    colliders.push({
      minX: wx - treeRadius,
      maxX: wx + treeRadius,
      minY: 0,
      maxY: 8.0,
      minZ: wz - treeRadius,
      maxZ: wz + treeRadius
    });
  }
  // 小さな遊具（当たり判定付き）
  addBox(park, 5, 0.9, 0, 0.18, 1.8, 0.18, metal, true, true, false);
  addBox(park, 7, 0.9, 0, 0.18, 1.8, 0.18, metal, true, true, false);
  addBox(park, 6, 1.75, 0, 2.2, 0.14, 0.14, metal, true, true, false);
  addBox(park, 6, 0.9, 0, 2.4, 1.8, 0.5, metal, false, false, true);
  // 公園灯
  addBox(park, 10.5, 2.0, 0, 0.12, 4.0, 0.12, metal, true, true, false);
  const lamp = new THREE.PointLight(0xffe6b0, 2.2, 12, 1.7);
  lamp.position.set(10.5,3.7,0); park.add(lamp);
}

// ==========================================
// 8. コンビニの真反対側に配置する交番
// ==========================================
function buildKobanGoal() {
  kobanBuilding = new THREE.Group();
  kobanBuilding.position.set(-48, 0, -48);
  scene.add(kobanBuilding);

  const wallMat = createMat(0xf8fafc, 0.8, 0.1);
  const darkWallMat = createMat(0x334155, 0.8, 0.1);
  const glassMat = createMat(0xbae6fd, 0.1, 0.3, 0x38bdf8, 0.9);
  const roofMat = createMat(0x1e293b, 0.7, 0.2);

  // 外壁を分割して、正面中央にプレイヤーが通れる入口を確保
  addBox(kobanBuilding, -4.35, 2.5, 0, 0.3, 5.0, 7.0, wallMat, true, true, true);
  addBox(kobanBuilding, 4.35, 2.5, 0, 0.3, 5.0, 7.0, wallMat, true, true, true);
  addBox(kobanBuilding, 0, 2.5, -3.35, 8.7, 5.0, 0.3, wallMat, true, true, true);
  // 正面の左右の壁。中央約2.8mを入口として開けておく
  addBox(kobanBuilding, -3.25, 2.5, 3.35, 2.2, 5.0, 0.3, wallMat, true, true, true);
  addBox(kobanBuilding, 3.25, 2.5, 3.35, 2.2, 5.0, 0.3, wallMat, true, true, true);
  addBox(kobanBuilding, 0, 5.15, 0.4, 9.6, 0.3, 7.8, roofMat, true, true);

  addBox(kobanBuilding, 0, 3.2, 4.0, 5.0, 0.2, 1.6, roofMat, true, true);
  addBox(kobanBuilding, -2.2, 1.6, 4.6, 0.2, 3.2, 0.2, darkWallMat, true, true);
  addBox(kobanBuilding, 2.2, 1.6, 4.6, 0.2, 3.2, 0.2, darkWallMat, true, true);

  // 入口脇のガラス窓（中央は開口部）
  addBox(kobanBuilding, -3.25, 1.8, 3.52, 2.0, 2.0, 0.08, glassMat, false, false);
  addBox(kobanBuilding, 3.25, 1.8, 3.52, 2.0, 2.0, 0.08, glassMat, false, false);

  // 看板
  addBox(kobanBuilding, 0, 3.9, 4.05, 3.6, 0.7, 0.1, createMat(0x0f172a, 0.5, 0.5), false, false);
  addBox(kobanBuilding, 0, 3.9, 4.12, 3.2, 0.4, 0.04, createMat(0xffffff, 0.1, 0.1, 0x38bdf8, 2.5), false, false);
  addBox(kobanBuilding, 0, 4.5, 4.1, 0.45, 0.45, 0.08, createMat(0xfacc15, 0.2, 0.8, 0xeab308, 3.0), false, false);

  // 遠くからでも交番と分かる大きな屋外案内板（道路側）
  addBox(kobanBuilding, 0, 6.1, 5.1, 6.2, 1.0, 0.22, createMat(0x0b3b75, 0.45, 0.2), true, true);
  addBox(kobanBuilding, 0, 6.1, 5.24, 5.7, 0.68, 0.06, createMat(0xffffff, 0.25, 0.1, 0x93c5fd, 1.2), false, false);

  // 赤色回転灯
  addBox(kobanBuilding, 0, 4.85, 4.0, 0.35, 0.45, 0.35, createMat(0xef4444, 0.1, 0.1, 0xdc2626, 4.5), false, false);

  kobanSpotLight = new THREE.PointLight(0xfff7ed, 9.0, 26, 1.5);
  kobanSpotLight.position.set(0, 3.2, 4.8);
  kobanBuilding.add(kobanSpotLight);

  kobanSirenLight = new THREE.PointLight(0xef4444, 7.0, 30, 1.5);
  kobanSirenLight.position.set(0, 5.0, 4.2);
  kobanBuilding.add(kobanSirenLight);

  // 警察官
  policeOfficer = buildRobloxCharacter(0x1e293b, 0x0f172a, 0xfcd34d, 'POLICE');
  policeOfficer.position.set(-47.2, 0, -43.5);
  policeOfficer.rotation.y = Math.PI;
  scene.add(policeOfficer);
}

function createStreetLamp(parent, x, z, side) {
  const poleGroup = new THREE.Group();
  poleGroup.position.set(x, 0, z);
  parent.add(poleGroup);

  const metalMat = createMat(0x64748b, 0.5, 0.7);
  addBox(poleGroup, 0, 2.4, 0, 0.25, 4.8, 0.25, metalMat, true, true, true);
  addBox(poleGroup, side * 0.45, 4.75, 0, 0.9, 0.1, 0.1, metalMat, true, true);

  const bulbMat = createMat(0xffedd5, 0.1, 0.1, 0xfdba74, 2.8);
  addBox(poleGroup, side * 0.85, 4.65, 0, 0.4, 0.12, 0.3, bulbMat, false, false);

  const light = new THREE.PointLight(0xfdba74, 4.8, 16, 1.8);
  light.position.set(side * 0.85, 4.4, 0);
  poleGroup.add(light);
  lamps.push({ light, baseIntensity: 4.8, phase: Math.random() * 6.28 });
}

// ==========================================
// 9. Robloxキャラクター & 敵
// ==========================================
function buildRobloxCharacter(shirtColor, pantsColor, skinColor, type = 'ENEMY') {
  const group = new THREE.Group();

  // まさはる：参考画像のような、顔が赤く発光する黒い影の怪異
  // 角張った通常キャラクターではなく、丸みのある暗いシルエットで構成する。
  if (type === 'ENEMY') {
    const shadowMat = createMat(0x030609, 0.98, 0.02);
    const edgeMat = createMat(0x080d12, 0.9, 0.04);
    const redCoreMat = createMat(0xff1528, 0.12, 0.05, 0xff0018, 5.5);
    const redHaloMat = createMat(0x8f0715, 0.25, 0.0, 0xc90018, 2.0);
    const sphere = (x, y, z, sx, sy, sz, mat) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 14), mat);
      mesh.position.set(x, y, z);
      mesh.scale.set(sx, sy, sz);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    };
    const limb = (x, y, z, radius, length, mat, rotZ = 0) => {
      const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 4, 8), mat);
      mesh.position.set(x, y, z);
      mesh.rotation.z = rotZ;
      mesh.castShadow = true;
      group.add(mesh);
      return mesh;
    };

    // 大きく前傾した胴体と、頭部を包む黒い輪郭
    const torso = sphere(0, 1.15, 0, 0.53, 0.72, 0.34, shadowMat);
    torso.rotation.x = -0.08;
    const head = sphere(0, 2.02, 0.02, 0.39, 0.43, 0.36, edgeMat);
    // 赤い顔の中心と、ぼんやりした発光リング
    sphere(0, 2.03, 0.335, 0.19, 0.20, 0.075, redHaloMat);
    sphere(0, 2.04, 0.392, 0.105, 0.115, 0.045, redCoreMat);
    const faceLight = new THREE.PointLight(0xff1028, 1.8, 4.5, 2);
    faceLight.position.set(0, 2.04, 0.52);
    group.add(faceLight);

    const armL = limb(-0.59, 1.22, 0, 0.16, 0.54, shadowMat, -0.32);
    const armR = limb(0.59, 1.22, 0, 0.16, 0.54, shadowMat, 0.32);
    const legL = limb(-0.23, 0.40, 0, 0.17, 0.43, shadowMat, 0.02);
    const legR = limb(0.23, 0.40, 0, 0.17, 0.43, shadowMat, -0.02);
    group.userData = { torso, head, armL, armR, legL, legR, animPhase: 0 };
    return group;
  }

  const shirtMat = createMat(shirtColor, 0.85, 0.1);
  const pantsMat = createMat(pantsColor, 0.9, 0.1);
  const skinMat = createMat(skinColor, 0.7, 0.0);

  const torso = addBox(group, 0, 1.15, 0, 0.8, 0.9, 0.42, shirtMat, true, true);
  const head = addBox(group, 0, 1.82, 0, 0.46, 0.46, 0.46, skinMat, true, true);

  if (type === 'POLICE') {
    const capMat = createMat(0x0f172a, 0.8, 0.2);
    addBox(group, 0, 2.08, 0, 0.52, 0.14, 0.52, capMat, true, true);
    addBox(group, 0, 2.05, 0.26, 0.48, 0.05, 0.2, createMat(0x020617, 0.5, 0.5), true, true);
    addBox(group, 0, 2.12, 0.27, 0.1, 0.1, 0.02, createMat(0xfacc15, 0.2, 0.8, 0xeab308, 2.0), false, false);
  }

  const armL = addBox(group, -0.58, 1.15, 0, 0.36, 0.85, 0.38, shirtMat, true, true);
  const armR = addBox(group, 0.58, 1.15, 0, 0.36, 0.85, 0.38, shirtMat, true, true);
  const legL = addBox(group, -0.21, 0.42, 0, 0.36, 0.85, 0.4, pantsMat, true, true);
  const legR = addBox(group, 0.21, 0.42, 0, 0.36, 0.85, 0.4, pantsMat, true, true);

  group.userData = { torso, head, armL, armR, legL, legR, animPhase: 0 };
  return group;
}

function buildRobloxEnemies() {
  enemyMain = buildRobloxCharacter(0x18181b, 0x09090b, 0x27272a, 'ENEMY');
  enemyMain.name = 'まさはる';
  enemyMain.position.set(48, 0, 47.5);
  enemyMain.visible = false;
  scene.add(enemyMain);

  // 敵はコンビニ前の1人だけ。脇道の追加敵は生成しない。
  enemyMinion = null;
}

function buildPlayerArms() {
  playerArms = new THREE.Group();
  camera.add(playerArms);

  const sleeveMat = createMat(0x0284c7, 0.85, 0.1);
  const skinMat = createMat(0xfcd34d, 0.7, 0.0);

  armL = new THREE.Group();
  armL.position.set(-0.38, -0.32, -0.65);
  addBox(armL, 0, 0, 0, 0.18, 0.22, 0.55, sleeveMat, false, false);
  addBox(armL, 0, 0, -0.32, 0.16, 0.18, 0.22, skinMat, false, false);
  playerArms.add(armL);

  armR = new THREE.Group();
  armR.position.set(0.38, -0.32, -0.65);
  addBox(armR, 0, 0, 0, 0.18, 0.22, 0.55, sleeveMat, false, false);
  addBox(armR, 0, 0, -0.32, 0.16, 0.18, 0.22, skinMat, false, false);
  playerArms.add(armR);

  playerFlashlight = new THREE.SpotLight(0xffedd5, 14, 28, Math.PI / 6.5, 0.35, 1.2);
  playerFlashlight.position.set(0.2, -0.1, -0.3);
  playerFlashlight.target.position.set(0, -0.1, -5);
  camera.add(playerFlashlight);
  camera.add(playerFlashlight.target);

  scene.add(camera);
}

function setupSunsetLighting() {
  const hemi = new THREE.HemisphereLight(0xffa94d, 0x3d2737, 1.4);
  scene.add(hemi);

  const sunLight = new THREE.DirectionalLight(0xff7a18, 2.4);
  sunLight.position.set(30, 22, -80);
  sunLight.target.position.set(20, 0, -20);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(1024, 1024);
  sunLight.shadow.camera.left = -40;
  sunLight.shadow.camera.right = 40;
  sunLight.shadow.camera.top = 40;
  sunLight.shadow.camera.bottom = -40;
  scene.add(sunLight);
  scene.add(sunLight.target);
}

// ==========================================
// ナイトモード照明管理
// ==========================================
let sunsetLights = [];   // 夕日ライトの参照
let nightLights = [];    // 夜用ライトの参照

function setupSunsetLightingAndStore() {
  const hemi = new THREE.HemisphereLight(0xffa94d, 0x3d2737, 1.4);
  hemi.userData.nightLight = false;
  scene.add(hemi);
  sunsetLights.push(hemi);

  const sunLight = new THREE.DirectionalLight(0xff7a18, 2.4);
  sunLight.position.set(30, 22, -80);
  sunLight.target.position.set(20, 0, -20);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(1024, 1024);
  sunLight.shadow.camera.left = -40;
  sunLight.shadow.camera.right = 40;
  sunLight.shadow.camera.top = 40;
  sunLight.shadow.camera.bottom = -40;
  sunLight.userData.nightLight = false;
  scene.add(sunLight);
  scene.add(sunLight.target);
  sunsetLights.push(sunLight);
}

/**
 * ナイトモードON/OFF切替
 * enabled=true → 夜の街、蛍光灯ON
 * enabled=false → 夕暮れモードに戻す
 */
function toggleNightMode(enabled) {
  state.nightMode = enabled;

  if (enabled) {
    // ---- 夕日ライトを暗くする ----
    sunsetLights.forEach(l => {
      if (l.isHemisphereLight) l.intensity = 0.18;
      if (l.isDirectionalLight) l.intensity = 0.3;
    });

    // ---- 夜空の背景色 ----
    scene.background = new THREE.Color(0x060c18);
    scene.fog = new THREE.FogExp2(0x08101f, 0.013);

    // ---- 蛍光灯（街灯代わり）を追加 ----
    if (nightLights.length === 0) {
      // 蛍光灯の設置位置リスト [x, y, z, 色, 強度]
      const lampPositions = [
        [  0,  7,  10, 0xd0eeff, 2.8],
        [ 15,  7,  -5, 0xd0eeff, 2.8],
        [-15,  7,  -5, 0xd0eeff, 2.8],
        [ 30,  7, -20, 0xc8e8ff, 2.6],
        [  0,  7, -30, 0xd0eeff, 2.8],
        [-28,  7, -20, 0xc8e8ff, 2.6],
        [ 10,  7, -50, 0xd4f0ff, 2.4],
        [-10,  7, -50, 0xd4f0ff, 2.4],
        [ 35,  7, -55, 0xd0eeff, 2.6],
        [-35,  7, -55, 0xd0eeff, 2.6],
        [  0,  7, -70, 0xc8e8ff, 2.8],
        [ 20,  7, -70, 0xd0eeff, 2.4],
        [-20,  7, -70, 0xd0eeff, 2.4],
      ];

      lampPositions.forEach(([x, y, z, color, intensity]) => {
        // 光源
        const pt = new THREE.PointLight(color, intensity, 28, 1.6);
        pt.position.set(x, y, z);
        pt.userData.isNightLight = true;
        scene.add(pt);
        nightLights.push(pt);

        // 蛍光灯の発光体（薄い白い平板）
        const bulbGeo = new THREE.BoxGeometry(1.4, 0.08, 0.3);
        const bulbMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: new THREE.Color(color),
          emissiveIntensity: 2.5,
          roughness: 0.4
        });
        const bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.position.set(x, y + 0.05, z);
        bulb.userData.isNightLight = true;
        scene.add(bulb);
        nightLights.push(bulb);
      });

      // コンビニのネオンサイン風オレンジ灯
      const neon = new THREE.PointLight(0xff8800, 3.5, 20, 2);
      neon.position.set(0, 5, 20);
      neon.userData.isNightLight = true;
      scene.add(neon);
      nightLights.push(neon);
    } else {
      // 既存の夜用ライトを再表示
      nightLights.forEach(l => { l.visible = true; });
    }

    document.body.classList.add('night-mode');

  } else {
    // ---- 夕日ライトを元の強度に戻す ----
    sunsetLights.forEach(l => {
      if (l.isHemisphereLight) l.intensity = 1.4;
      if (l.isDirectionalLight) l.intensity = 2.4;
    });

    // ---- 夕暮れ空に戻す ----
    scene.background = new THREE.Color(0x381e28);
    scene.fog = new THREE.FogExp2(0x4a242c, 0.009);

    // ---- 夜用ライトを非表示 ----
    nightLights.forEach(l => { l.visible = false; });

    document.body.classList.remove('night-mode');
  }
}

// ==========================================
// 10. 操作バインド
// ==========================================

// ==========================================
// 難易度プリセット定義と適用
// ==========================================
const DIFFICULTY_PRESETS = {
  easy: {
    label: 'かんたん',
    desc: '敵が遅く、スタミナ回復が速い。じっくり学習できます。',
    baseEnemySpeed: 2.8,
    sprintSpeed: 8.0,
    staminaRecovery: 28,     // 毎秒回復量
    exhaustCooldown: 1.2,    // 息切れ回復待ち時間(秒)
    exhaustSpeedMult: 0.95,  // 息切れ中の速度倍率
    phoneTimeout: 15,        // タイマー秒数
    enemyBoostMult: 0.5,     // 危険選択時の速度ブースト倍率
  },
  normal: {
    label: 'ふつう',
    desc: '標準的なバランス。油断するとすぐ追いつかれます。',
    baseEnemySpeed: 4.5,
    sprintSpeed: 7.4,
    staminaRecovery: 16,
    exhaustCooldown: 2.5,
    exhaustSpeedMult: 0.88,
    phoneTimeout: 10,
    enemyBoostMult: 1.0,
  },
  hard: {
    label: 'むずかしい',
    desc: '敵が速く、スタミナ切れが厳しい。本気で逃げろ！',
    baseEnemySpeed: 6.2,
    sprintSpeed: 6.8,
    staminaRecovery: 9,
    exhaustCooldown: 4.0,
    exhaustSpeedMult: 0.72,
    phoneTimeout: 7,
    enemyBoostMult: 1.6,
  }
};

// 現在の難易度設定キャッシュ（ゲームループから参照）
let diffConfig = { ...DIFFICULTY_PRESETS.normal };

function applyDifficulty(key) {
  const preset = DIFFICULTY_PRESETS[key];
  if (!preset) return;
  state.difficulty = key;
  diffConfig = { ...preset };

  // ゲーム中なら即時反映
  player.sprintSpeed = preset.sprintSpeed;
  state.baseEnemySpeed = preset.baseEnemySpeed;
  state.currentEnemySpeed = Math.max(preset.baseEnemySpeed, state.currentEnemySpeed);

  // UIボタン（設定モーダルおよびタイトル画面）のactiveクラス更新
  document.querySelectorAll('[data-diff]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-diff') === key);
  });
  ['easy', 'normal', 'hard'].forEach(d => {
    const btn = ui[`diff${d.charAt(0).toUpperCase() + d.slice(1)}`];
    if (btn) btn.classList.toggle('active', d === key);
  });

  // 説明文更新
  if (ui.diffDesc) ui.diffDesc.textContent = preset.desc;
  const titleDesc = document.getElementById('title-difficulty-desc');
  if (titleDesc) titleDesc.textContent = preset.desc;

  showToast(`難易度を「${preset.label}」に設定しました`);
}

function bindDomEvents() {
  if (ui.startDirectBtn) {
    ui.startDirectBtn.addEventListener('click', () => {
      initAudio();
      start3DEscape();
    });
  }
  ui.startNovelBtn.addEventListener('click', startNovelPart);
  ui.briefButton.addEventListener('click', () => {
    ui.brief.classList.toggle('hidden');
    ui.briefButton.querySelector('span').textContent = ui.brief.classList.contains('hidden') ? '＋' : '−';
  });

  ui.novelScreen.addEventListener('click', handleNovelAdvance);
  ui.novelSkipBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    skipToEscapePart();
  });

  ui.phoneToggleBtn.addEventListener('click', () => {
    if (!state.mustReplyActive) toggleSmartphone();
  });
  ui.phoneCloseBtn.addEventListener('click', () => {
    if (!state.mustReplyActive) closeSmartphone();
  });

  ui.settingsOpen.addEventListener('click', () => {
    if (state.mode === 'playing') pauseGame();
    ui.settingsModal.classList.remove('hidden');
  });
  ui.settingsClose.addEventListener('click', () => {
    saveSettings();
    ui.settingsModal.classList.add('hidden');
    if (state.mode === 'paused') resumeGame();
  });
  ui.soundToggle.addEventListener('change', () => {
    state.soundEnabled = ui.soundToggle.checked;
    updateAudioState();
  });
  ui.flickerToggle.addEventListener('change', () => state.flickerEnabled = ui.flickerToggle.checked);
  if (ui.timerToggle) {
    ui.timerToggle.addEventListener('change', () => {
      state.timerEnabled = ui.timerToggle.checked;
    });
  }
  if (ui.nightToggle) {
    ui.nightToggle.addEventListener('change', () => {
      toggleNightMode(ui.nightToggle.checked);
    });
  }
  ui.sensitivityInput.addEventListener('input', () => state.sensitivity = Number(ui.sensitivityInput.value));
  ui.soundMuteBtn.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    ui.soundToggle.checked = state.soundEnabled;
    ui.soundMuteBtn.textContent = state.soundEnabled ? '🔊' : '🔇';
    updateAudioState();
  });

  ui.resumeBtn.addEventListener('click', resumeGame);
  ui.quitBtn.addEventListener('click', returnToTitle);
  ui.retryBtn.addEventListener('click', retrySimulation);

  // 難易度プリセットボタン（設定画面・タイトル画面両対応）
  document.querySelectorAll('[data-diff]').forEach(btn => {
    btn.addEventListener('click', () => {
      const diff = btn.getAttribute('data-diff');
      if (diff) applyDifficulty(diff);
    });
  });
  ['easy', 'normal', 'hard'].forEach(key => {
    const btn = ui[`diff${key.charAt(0).toUpperCase() + key.slice(1)}`];
    if (btn) btn.addEventListener('click', () => applyDifficulty(key));
  });
  // 初期状態でふつうをactive
  applyDifficulty('normal');

  window.addEventListener('keydown', (e) => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    if (e.repeat) return;

    if (e.code === 'Escape') {
      if (state.mode === 'playing' && !state.mustReplyActive) pauseGame();
      else if (state.mode === 'paused') resumeGame();
      else if (state.phoneOpen && !state.mustReplyActive) closeSmartphone();
      return;
    }

    if (e.code === 'Tab') {
      e.preventDefault();
      if (state.mode === 'playing' && !state.mustReplyActive) toggleSmartphone();
      return;
    }

    if (e.code === 'KeyE') {
      if (state.mode === 'playing') {
        if (state.phoneNotification && !state.phoneOpen) toggleSmartphone();
        else showToast('交番へ急ごう！');
      }
      return;
    }

    if (state.mode === 'novel' && (e.code === 'Space' || e.code === 'Enter')) {
      handleNovelAdvance();
      return;
    }

    if (state.mode === 'playing' && !state.mustReplyActive) {
      keys.add(e.code);
    }
  });

  window.addEventListener('keyup', (e) => keys.delete(e.code));

  let isPointerDown = false;
  let lastPointerX = 0;
  let lastPointerY = 0;

  window.addEventListener('mousedown', (e) => {
    if (state.mode === 'playing' && !state.phoneOpen && !state.mustReplyActive) {
      if (e.target.closest('button, a, input, select, textarea, .overlay:not(.hidden)')) return;
      isPointerDown = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      initAudio();
      if (window.matchMedia('(pointer:fine)').matches && document.pointerLockElement !== renderer.domElement) {
        renderer.domElement.requestPointerLock?.();
      }
    }
  });

  window.addEventListener('mouseup', () => {
    isPointerDown = false;
  });

  document.addEventListener('pointerlockchange', () => {
    state.mouseLocked = (document.pointerLockElement === renderer.domElement);
    if (ui.pointerLockHint) {
      if (state.mouseLocked || state.mode !== 'playing') {
        ui.pointerLockHint.classList.add('hidden');
      } else {
        ui.pointerLockHint.classList.remove('hidden');
      }
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (state.mode !== 'playing' || state.phoneOpen || state.mustReplyActive) return;
    const sens = state.sensitivity * 0.0004;
    if (state.mouseLocked) {
      player.yaw -= e.movementX * sens;
      player.pitch -= e.movementY * sens;
      player.pitch = THREE.MathUtils.clamp(player.pitch, -0.65, 0.65);
    } else if (isPointerDown) {
      const dx = e.clientX - lastPointerX;
      const dy = e.clientY - lastPointerY;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      player.yaw -= dx * sens * 1.6;
      player.pitch -= dy * sens * 1.6;
      player.pitch = THREE.MathUtils.clamp(player.pitch, -0.65, 0.65);
    }
  });

  setupMobileControls();
  window.addEventListener('resize', onResize);
}

function setupMobileControls() {
  ui.mobileRun.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!state.mustReplyActive) keys.add('Shift');
  }, { passive: false });
  ui.mobileRun.addEventListener('touchend', () => keys.delete('Shift'));

  ui.mobileInteract.addEventListener('click', () => showToast('交番へ急ごう！'));
  ui.mobilePhone.addEventListener('click', () => {
    if (!state.mustReplyActive) toggleSmartphone();
  });

  document.querySelectorAll('[data-move]').forEach(btn => {
    const map = { forward: 'KeyW', back: 'KeyS', left: 'KeyA', right: 'KeyD' };
    const down = (e) => {
      e.preventDefault();
      if (!state.mustReplyActive) keys.add(map[btn.dataset.move]);
    };
    const up = (e) => { e.preventDefault(); keys.delete(map[btn.dataset.move]); };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointerleave', up);
    btn.addEventListener('pointercancel', up);
  });
}

// ==========================================
// 11. ノベル進行
// ==========================================
function startNovelPart() {
  initAudio();
  state.mode = 'novel';
  ui.chapterLabel.textContent = 'SCENE 01　コンビニでの待ち合わせ';
  ui.titleScreen.classList.add('hidden');
  ui.novelScreen.classList.remove('hidden');
  ui.novelChatStream.innerHTML = '';
  novelStep = 0;
  displayNovelStep(novelStep);
}

function displayNovelStep(stepIndex) {
  if (stepIndex >= novelScript.length) {
    start3DEscape();
    return;
  }

  const current = novelScript[stepIndex];
  ui.novelSpeaker.textContent = current.speaker;
  ui.novelChoices.classList.add('hidden');
  ui.novelChoices.innerHTML = '';
  ui.novelHint.classList.remove('hidden');

  if (current.chatPartner && current.chatText) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${current.chatPartner === 'まさはる' ? 'partner' : 'player'}`;
    if (stepIndex >= 4) msgDiv.classList.add('suspicious');
    msgDiv.textContent = current.chatText;
    ui.novelChatStream.appendChild(msgDiv);
    ui.novelChatStream.scrollTop = ui.novelChatStream.scrollHeight;
    playBeep(current.chatPartner === 'まさはる' ? 420 : 640, 0.06, 0.02);
  }

  typeWriterEffect(current.text, () => {
    if (current.choices) {
      ui.novelHint.classList.add('hidden');
      renderNovelChoices(current.choices);
    }
  });
}

function typeWriterEffect(fullText, onComplete) {
  novelTyping = true;
  ui.novelText.textContent = '';
  let charIdx = 0;
  clearInterval(novelTypeTimer);

  novelTypeTimer = setInterval(() => {
    ui.novelText.textContent += fullText.charAt(charIdx);
    charIdx++;
    if (charIdx >= fullText.length) {
      clearInterval(novelTypeTimer);
      novelTyping = false;
      if (onComplete) onComplete();
    }
  }, 20);
}

function handleNovelAdvance() {
  if (state.mode !== 'novel') return;
  if (novelTyping) {
    clearInterval(novelTypeTimer);
    novelTyping = false;
    const current = novelScript[novelStep];
    ui.novelText.textContent = current.text;
    if (current.choices) {
      ui.novelHint.classList.add('hidden');
      renderNovelChoices(current.choices);
    }
    return;
  }

  const current = novelScript[novelStep];
  if (current.choices && !ui.novelChoices.classList.contains('hidden')) return;

  novelStep++;
  displayNovelStep(novelStep);
}

// クリア状態の保存・取得（初回はヒント非表示、クリア後は「安全な判断」「危険な判断」を表示）
const STORAGE_KEY_CLEARED = 'sns_game_cleared';

function isGameCleared() {
  try {
    return localStorage.getItem(STORAGE_KEY_CLEARED) === 'true';
  } catch (e) {
    return false;
  }
}

function setGameCleared() {
  try {
    localStorage.setItem(STORAGE_KEY_CLEARED, 'true');
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

// デバッグ用（ブラウザコンソールからリセット可能）
window.resetGameClear = () => {
  localStorage.removeItem(STORAGE_KEY_CLEARED);
  console.log('クリア状態をリセットしました（初回状態）');
};
window.setGameClear = () => {
  setGameCleared();
  console.log('クリア状態に設定しました（クリア後状態）');
};

function renderNovelChoices(choices) {
  ui.novelChoices.innerHTML = '';

  choices.forEach(ch => {
    const btn = document.createElement('button');
    btn.className = 'novel-choice-btn';
    const textSpan = document.createElement('span');
    textSpan.textContent = ch.text;
    btn.appendChild(textSpan);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectNovelChoice(ch);
    });
    ui.novelChoices.appendChild(btn);
  });
  ui.novelChoices.classList.remove('hidden');
}

function selectNovelChoice(ch) {
  state.decisions++;
  state.risk = THREE.MathUtils.clamp(state.risk + ch.riskDelta, 5, 100);
  if (ch.tag === 'SAFE') state.safeDecisionsCount++;

  if (ch.riskDelta > 0) {
    state.baseEnemySpeed += (ch.riskDelta * 0.035);
    playBeep(180, 0.25, 0.05, 'sawtooth');
  } else {
    playBeep(680, 0.15, 0.03, 'sine');
  }

  showToast(ch.log);
  novelStep = ch.nextIndex;
  displayNovelStep(novelStep);
}

function skipToEscapePart() {
  clearInterval(novelTypeTimer);
  novelTyping = false;
  start3DEscape();
}

// ==========================================
// 12. 3D逃走パート開始
// ==========================================
function start3DEscape() {
  initMinimapFog();
  state.mode = 'playing';
  state.chaseActive = true;
  // 難易度プリセットの値を反映
  state.baseEnemySpeed = diffConfig.baseEnemySpeed;
  state.currentEnemySpeed = state.baseEnemySpeed + (state.risk * 0.025);
  player.sprintSpeed = diffConfig.sprintSpeed;
  ui.chapterLabel.textContent = 'CASE 01　コンビニからの逃走';

  ui.titleScreen.classList.add('hidden');
  ui.novelScreen.classList.add('hidden');
  ui.gameUi.classList.remove('hidden');

  if (ui.pointerLockHint && !state.mouseLocked) {
    ui.pointerLockHint.classList.remove('hidden');
  }

  player.x = 48;
  player.y = 1.65;
  player.verticalVelocity = 0;
  player.grounded = true;
  player.z = 42;
  player.yaw = Math.PI;
  player.pitch = 0;
  player.stamina = 100;
  player.exhausted = false;
  player.exhaustedTimer = 0;
  camera.position.set(player.x, player.y, player.z);

  // 敵「まさはる」は開始後コンビニ扉前の外に登場。
  enemyMain.position.set(48, 0, 47.5);
  enemyMain.visible = false;
  state.chaseActive = false;

  updateHUD();
  showToast('コンビニから脱出！まっすぐ進み、路地へ入れ！');

  // ナイトモードを適用（state.nightModeに従う）
  toggleNightMode(state.nightMode);

  if (window.matchMedia('(pointer:fine)').matches) {
    renderer.domElement.requestPointerLock?.();
  }
}

// ==========================================
// 13. スマホ強制オープン＆返信待機システム
// ==========================================
function checkPhoneTriggers() {
  phoneEvents.forEach(evt => {
    if (!evt.triggered && evt.triggerCondition(player)) {
      evt.triggered = true;
      forceOpenSmartphone(evt);
    }
  });
}

function forceOpenSmartphone(evt) {
  state.mustReplyActive = true;
  keys.clear();

  if (document.pointerLockElement) {
    document.exitPointerLock();
  }

  state.phoneOpen = true;
  ui.smartphone.classList.remove('collapsed');
  ui.phoneBackdrop.classList.remove('hidden');
  ui.phoneMustReply.classList.remove('hidden');
  ui.phoneCloseBtn.style.display = 'none';

  const msgEl = document.createElement('div');
  msgEl.className = 'phone-msg partner threat';
  msgEl.textContent = evt.partnerText;
  ui.phoneChatBody.appendChild(msgEl);
  ui.phoneChatBody.scrollTop = ui.phoneChatBody.scrollHeight;

  ui.phoneChoiceButtons.innerHTML = '';
  const cleared = isGameCleared();

  evt.choices.forEach(ch => {
    const btn = document.createElement('button');
    btn.className = 'phone-choice-btn';
    btn.textContent = ch.text;

    btn.addEventListener('click', () => selectPhoneReply(evt, ch));
    ui.phoneChoiceButtons.appendChild(btn);
  });
  ui.phoneReplyArea.classList.remove('hidden');

  // ★【難易度UP：10秒返信カウントダウンタイマー】（timerEnabled=trueのときのみ有効）
  clearInterval(phoneCountdownTimer);

  // タイマーバーエリアの表示制御
  const timerBarWrap = ui.phoneReplyArea.querySelector('.reply-timer-bar-wrap');
  if (timerBarWrap) {
    timerBarWrap.style.display = state.timerEnabled ? '' : 'none';
  }

  if (state.timerEnabled) {
    const totalSec = diffConfig.phoneTimeout; // 難易度で変わる猶予時間
    let countdownSeconds = totalSec;

    function updateCountdownUI() {
      if (!ui.replyCountdownText || !ui.replyTimerFill) return;
      const secDisplay = Math.max(0, Math.ceil(countdownSeconds));
      ui.replyCountdownText.textContent = `${secDisplay}s`;
      const pct = Math.max(0, (countdownSeconds / totalSec) * 100);
      ui.replyTimerFill.style.width = `${pct}%`;

      if (countdownSeconds <= 3.5) {
        ui.replyCountdownText.classList.add('urgent');
        ui.replyTimerFill.classList.add('urgent');
      } else {
        ui.replyCountdownText.classList.remove('urgent');
        ui.replyTimerFill.classList.remove('urgent');
      }
    }

    updateCountdownUI();

    phoneCountdownTimer = setInterval(() => {
      countdownSeconds -= 0.1;
      if (countdownSeconds <= 0) {
        clearInterval(phoneCountdownTimer);
        handlePhoneTimeout(evt);
      } else {
        updateCountdownUI();
        // 残り3秒以下で緊迫の警告音
        if (countdownSeconds <= 3.0 && Math.abs((countdownSeconds * 10) % 10) < 0.2) {
          playBeep(880, 0.08, 0.04, 'square');
        }
      }
    }, 100);

    playPhoneVibrationSound();
    showToast(`⚠️ スマートフォンが着信！${totalSec}秒以内に返信してください！`);
  } else {
    playPhoneVibrationSound();
    showToast('⚠️ スマートフォンが着信！安全な返信を選んでください！');
  }
}

function handlePhoneTimeout(evt) {
  const timeoutChoice = {
    text: '【時間切れ】焦って現在地の写真を誤送信してしまった！',
    tag: 'DANGER',
    riskDelta: 30,
    playerText: '（返信に迷ってパニックになり、周辺の写真を誤送信してしまった…！）',
    feedback: '時間切れ！現在地を相手に特定され、追跡者が猛烈に加速＆急接近！',
    enemySpeedBoost: 1.2
  };
  selectPhoneReply(evt, timeoutChoice);
}

function selectPhoneReply(evt, ch) {
  clearInterval(phoneCountdownTimer);
  ui.phoneReplyArea.classList.add('hidden');
  ui.phoneMustReply.classList.add('hidden');
  ui.phoneCloseBtn.style.display = 'block';

  const replyEl = document.createElement('div');
  replyEl.className = 'phone-msg player';
  replyEl.textContent = ch.playerText;
  ui.phoneChatBody.appendChild(replyEl);
  ui.phoneChatBody.scrollTop = ui.phoneChatBody.scrollHeight;

  state.decisions++;
  state.risk = THREE.MathUtils.clamp(state.risk + ch.riskDelta, 0, 100);
  if (ch.tag === 'SAFE') state.safeDecisionsCount++;

  if (ch.tag === 'DANGER' || ch.enemySpeedBoost > 0) {
    // 難易度の倍率をかけてスピードブーストを適用
    state.currentEnemySpeed += (ch.enemySpeedBoost || 0.8) * diffConfig.enemyBoostMult;
    // 居場所を特定され、敵が急接近！
    const currentDist = Math.hypot(player.x - enemyMain.position.x, player.z - enemyMain.position.z);
    if (currentDist > 8) {
      enemyMain.position.x = player.x + (enemyMain.position.x - player.x) * 0.55;
      enemyMain.position.z = player.z + (enemyMain.position.z - player.z) * 0.55;
    }
    triggerDamageFlash();
    playBeep(140, 0.35, 0.08, 'sawtooth');
    showToast(`⚠️ 危険な判断！ ${ch.feedback}`);
  } else {
    playBeep(720, 0.12, 0.03);
    showToast(`✓ 安全な判断！ ${ch.feedback}`);
  }

  updateHUD();

  setTimeout(() => {
    state.mustReplyActive = false;
    closeSmartphone();
    showToast('返信完了！逃走を再開しよう！');
  }, 900);
}

function toggleSmartphone() {
  if (state.mustReplyActive) return;
  if (state.phoneOpen) closeSmartphone();
  else openSmartphone();
}

function openSmartphone() {
  state.phoneOpen = true;
  ui.smartphone.classList.remove('collapsed');
  ui.phoneBadge.classList.add('hidden');
  if (document.pointerLockElement) document.exitPointerLock();
  playBeep(520, 0.08, 0.03);
}

function closeSmartphone() {
  if (state.mustReplyActive) return;
  state.phoneOpen = false;
  ui.smartphone.classList.add('collapsed');
  ui.phoneBackdrop.classList.add('hidden');

  if (state.mode === 'playing' && window.matchMedia('(pointer:fine)').matches) {
    renderer.domElement.requestPointerLock?.();
  }
}

// ==========================================
// 14. プレイヤー移動（透明の壁なし・見える壁のみで衝突）
// ==========================================
function updatePlayer(dt) {
  if (state.mustReplyActive || state.phoneOpen) return; // スマホ中は移動不可

  let moveForward = 0;
  let moveSide = 0;

  if (keys.has('KeyW') || keys.has('ArrowUp')) moveForward += 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) moveForward -= 1;
  if (keys.has('KeyA')) moveSide -= 1;
  if (keys.has('KeyD')) moveSide += 1;

  // 矢印キー左右で視点回転（マウス非ロック時やトラックパッドでも確実に旋回操作可能）
  if (keys.has('ArrowLeft')) player.yaw += 2.2 * dt;
  if (keys.has('ArrowRight')) player.yaw -= 2.2 * dt;

  const isMoving = (moveForward !== 0 || moveSide !== 0);

  // ★【難易度UP：スタミナ切れ＆息切れシステム】（難易度設定に連動）
  if (player.stamina <= 0 && !player.exhausted) {
    player.exhausted = true;
    player.exhaustedTimer = diffConfig.exhaustCooldown; // 難易度で変わる回復待ち時間
    showToast('息が切れた…！少し歩いて息を整えよう！');
    playBeep(200, 0.25, 0.05, 'triangle');
  }
  if (player.exhausted) {
    player.exhaustedTimer -= dt;
    if (player.exhaustedTimer <= 0 && player.stamina > 25) {
      player.exhausted = false;
    }
  }

  const isSprinting = (keys.has('ShiftLeft') || keys.has('ShiftRight') || keys.has('Shift')) && !player.exhausted && player.stamina > 2 && isMoving;

  if (isSprinting) player.stamina = Math.max(0, player.stamina - 28 * dt);
  else player.stamina = Math.min(100, player.stamina + diffConfig.staminaRecovery * dt);

  const currentSpeed = isSprinting ? player.sprintSpeed : (player.exhausted ? player.speed * diffConfig.exhaustSpeedMult : player.speed);

  if (isMoving) {
    const len = Math.hypot(moveForward, moveSide) || 1;
    moveForward /= len;
    moveSide /= len;

    const dx = (-Math.sin(player.yaw) * moveForward + Math.cos(player.yaw) * moveSide) * currentSpeed * dt;
    const dz = (-Math.cos(player.yaw) * moveForward - Math.sin(player.yaw) * moveSide) * currentSpeed * dt;

    moveWithCollision(dx, dz);

    if (state.soundEnabled && performance.now() - state.lastFootstep > (isSprinting ? 270 : 440)) {
      playFootstepSound(isSprinting);
      state.lastFootstep = performance.now();
    }
  }

  // Spaceでジャンプ。着地直後に再入力すれば連続バニーホップできる。
  const jumpPressed = keys.has('Space');
  if (jumpPressed && player.grounded) {
    player.verticalVelocity = 7.2;
    player.grounded = false;
  }
  if (!player.grounded) {
    player.y += player.verticalVelocity * dt;
    player.verticalVelocity -= 18.5 * dt;

    // コライダー上面への着地チェック
    const pRadius = 0.4;
    const footY = player.y - 1.65;
    let landedOnSurface = false;
    if (player.verticalVelocity <= 0) {
      // 下降中のみチェック
      for (const c of colliders) {
        const cMaxY = (c.maxY !== undefined) ? c.maxY : 0;
        if (cMaxY < 0.1) continue; // 地面扱いはスキップ
        // プレイヤーのXZがコライダー範囲内
        if (player.x + pRadius > c.minX && player.x - pRadius < c.maxX &&
            player.z + pRadius > c.minZ && player.z - pRadius < c.maxZ) {
          // 足元がコライダー上面に達したか（若干のマージン）
          if (footY <= cMaxY + 0.12 && footY >= cMaxY - 0.5) {
            player.y = cMaxY + 1.65;
            player.verticalVelocity = 0;
            player.grounded = true;
            landedOnSurface = true;
            break;
          }
        }
      }
    }

    // 通常の地面（Y=0）への着地
    if (!landedOnSurface && player.y <= 1.65) {
      player.y = 1.65;
      player.verticalVelocity = 0;
      player.grounded = true;
    }
  }

  // コライダー上に立っているとき、コライダー外に出たら落下
  if (player.grounded && player.y > 1.66) {
    const pRadius = 0.4;
    let onSurface = false;
    for (const c of colliders) {
      const cMaxY = (c.maxY !== undefined) ? c.maxY : 0;
      if (Math.abs((player.y - 1.65) - cMaxY) < 0.12 &&
          player.x + pRadius > c.minX && player.x - pRadius < c.maxX &&
          player.z + pRadius > c.minZ && player.z - pRadius < c.maxZ) {
        onSurface = true;
        break;
      }
    }
    if (!onSurface) {
      player.grounded = false;
      player.verticalVelocity = 0;
    }
  }
  const bobbing = isMoving && player.grounded ? Math.sin(state.elapsed * (isSprinting ? 16 : 11)) * 0.04 : 0;
  camera.position.set(player.x, player.y + bobbing, player.z);
  camera.rotation.order = 'YXZ';
  camera.rotation.y = player.yaw;
  camera.rotation.x = player.pitch;

  updatePlayerArms(isMoving, isSprinting, dt);

  // ルート現在地表示
  if (player.z > 8) {
    state.routeTaken = '① コンビニ前';
    ui.objSub.textContent = 'まっすぐ進み、正面の角を右に曲がろう';
  } else if (player.z <= 8 && player.z >= 0 && player.x < 15) {
    state.routeTaken = '② 右折路地';
    ui.objSub.textContent = '東へ進み、突き当たりの左の中道へ入ろう';
  } else if (player.x >= 15 && player.x < 28 && player.z > -20) {
    state.routeTaken = '③ 狭い中道';
    ui.objSub.textContent = '北へ進み、突き当たりの右の路地を抜けよう';
  } else if (player.z <= -20 && player.x < 34) {
    state.routeTaken = '④ 建物間の路地';
    ui.objSub.textContent = '路地を東へ抜け、大通りを目指そう！';
  } else if (player.x >= 34 && player.z > -72) {
    state.routeTaken = '⑤ 大通り';
    ui.objSub.textContent = '前方の信号機の先にある交番へダッシュ！';
  } else {
    state.routeTaken = '⑥ 交差点・交番前';
    ui.objSub.textContent = '信号を渡って交番に飛び込め！保護されるぞ！';
  }
  ui.routeIndicator.textContent = state.routeTaken;

  // 交番の入口を通って中に入ったらクリア（交番中心は x=-48,z=-48、正面入口は z=-44.5）
  if (!state.hasEndingTriggered && player.x > -49.6 && player.x < -46.4 && player.z < -44.0 && player.z > -51.0) {
    triggerEnding('win');
    return;
  }

  checkPhoneTriggers();
}

// 見える壁のAABBでのみ衝突（不可視クランプを廃止し、外周も目に見える外壁で遮断）
function moveWithCollision(dx, dz) {
  const pRadius = 0.45;
  const newX = player.x + dx;
  const newZ = player.z + dz;
  // 足元のY座標（player.y はカメラ高さ = 地面+1.65）
  const footY = player.y - 1.65;
  // プレイヤーの頭のY
  const headY = player.y + 0.15;

  // コライダーがY軸でプレイヤーと重なるか判定
  function collidesYAxis(c) {
    const cMinY = (c.minY !== undefined) ? c.minY : -99;
    const cMaxY = (c.maxY !== undefined) ? c.maxY : 99;
    // プレイヤーが既にコライダー上面に乗っている場合はXZ当たり不要
    if (footY >= cMaxY - 0.05) return false;
    // コライダーの底がプレイヤーの頭より上なら当たらない
    if (cMinY >= headY) return false;
    return true;
  }

  let collideX = false;
  for (const c of colliders) {
    if (!collidesYAxis(c)) continue;
    if (newX + pRadius > c.minX && newX - pRadius < c.maxX &&
        player.z + pRadius > c.minZ && player.z - pRadius < c.maxZ) {
      collideX = true;
      break;
    }
  }
  if (!collideX) player.x = newX;

  let collideZ = false;
  for (const c of colliders) {
    if (!collidesYAxis(c)) continue;
    if (player.x + pRadius > c.minX && player.x - pRadius < c.maxX &&
        newZ + pRadius > c.minZ && newZ - pRadius < c.maxZ) {
      collideZ = true;
      break;
    }
  }
  if (!collideZ) player.z = newZ;
}

function updatePlayerArms(isMoving, isSprinting, dt) {
  if (!playerArms) return;
  const swingFreq = isSprinting ? 14 : 9;
  const swingAmp = isSprinting ? 0.22 : 0.12;

  if (isMoving) {
    const swingL = Math.sin(state.elapsed * swingFreq) * swingAmp;
    const swingR = -Math.sin(state.elapsed * swingFreq) * swingAmp;
    armL.position.z = -0.65 + swingL;
    armR.position.z = -0.65 + swingR;
    armL.rotation.x = swingL * 0.8;
    armR.rotation.x = swingR * 0.8;
  } else {
    const breath = Math.sin(state.elapsed * 2.5) * 0.015;
    armL.position.y = -0.32 + breath;
    armR.position.y = -0.32 + breath;
    armL.rotation.x *= 0.9;
    armR.rotation.x *= 0.9;
  }
}

// ==========================================
// 15. 敵追跡AI（建物すり抜け防止・壁回り込みナビ・スマホ停止連動）
// ==========================================
const enemyNavState = {
  lastSlideDir: 1
};

function moveEnemyWithCollision(enemy, dt, speed) {
  const eRadius = 0.42;
  const currentX = enemy.position.x;
  const currentZ = enemy.position.z;

  const dx = player.x - currentX;
  const dz = player.z - currentZ;
  const dist = Math.hypot(dx, dz);
  if (dist < 0.2) return { moveX: 0, moveZ: 0 };

  const normX = dx / dist;
  const normZ = dz / dist;
  const stepX = normX * speed * dt;
  const stepZ = normZ * speed * dt;

  function isBlocked(tx, tz) {
    const eY = 0; // 敵は常に地面に居る（Y=0が足元）
    const eHead = 2.0;
    for (const c of colliders) {
      const cMinY = (c.minY !== undefined) ? c.minY : -99;
      const cMaxY = (c.maxY !== undefined) ? c.maxY : 99;
      // 敵の足元がコライダー上面より上なら当たらない（上を歩いている状態）
      if (eY >= cMaxY - 0.05) continue;
      // コライダーの底が敵の頭より上なら当たらない
      if (cMinY >= eHead) continue;
      if (tx + eRadius > c.minX && tx - eRadius < c.maxX &&
          tz + eRadius > c.minZ && tz - eRadius < c.maxZ) {
        return true;
      }
    }
    return false;
  }

  let newX = currentX;
  let newZ = currentZ;
  let movedX = false;
  let movedZ = false;

  // X方向の移動判定
  if (!isBlocked(currentX + stepX, currentZ)) {
    newX += stepX;
    movedX = true;
  }

  // Z方向の移動判定
  if (!isBlocked(newX, currentZ + stepZ)) {
    newZ += stepZ;
    movedZ = true;
  }

  // 壁滑り・回避処理
  if (!movedX && movedZ) {
    // Xが壁で止まった場合、壁沿い(Z方向)にスムーズにスライド
    const slideDir = Math.abs(dz) > 0.08 ? Math.sign(dz) : (enemyNavState.lastSlideDir || 1);
    enemyNavState.lastSlideDir = slideDir;
    const extraZ = slideDir * speed * dt;
    if (!isBlocked(newX, newZ + extraZ)) {
      newZ += extraZ;
    }
  } else if (movedX && !movedZ) {
    // Zが壁で止まった場合、壁沿い(X方向)にスムーズにスライド
    const slideDir = Math.abs(dx) > 0.08 ? Math.sign(dx) : (enemyNavState.lastSlideDir || 1);
    enemyNavState.lastSlideDir = slideDir;
    const extraX = slideDir * speed * dt;
    if (!isBlocked(newX + extraX, newZ)) {
      newX += extraX;
    }
  } else if (!movedX && !movedZ) {
    // 角や壁に正面から当たった場合：回避可能な方向を探して回り込む
    const dirs = [
      { x: speed * dt, z: 0 },
      { x: -speed * dt, z: 0 },
      { x: 0, z: speed * dt },
      { x: 0, z: -speed * dt }
    ];
    dirs.sort((a, b) => {
      const distA = Math.hypot(player.x - (currentX + a.x), player.z - (currentZ + a.z));
      const distB = Math.hypot(player.x - (currentX + b.x), player.z - (currentZ + b.z));
      return distA - distB;
    });

    for (const d of dirs) {
      if (!isBlocked(currentX + d.x, currentZ + d.z)) {
        newX = currentX + d.x;
        newZ = currentZ + d.z;
        break;
      }
    }
  }

  const actualMoveX = newX - currentX;
  const actualMoveZ = newZ - currentZ;

  enemy.position.x = newX;
  enemy.position.z = newZ;

  return { moveX: actualMoveX, moveZ: actualMoveZ };
}

// 直線視界判定（Raycast的サンプリング）
function hasLineOfSight(fromPos, toPos) {
  const samples = 8;
  for (let i = 1; i < samples; i++) {
    const t = i / samples;
    const sx = fromPos.x + (toPos.x - fromPos.x) * t;
    const sz = fromPos.z + (toPos.z - fromPos.z) * t;
    for (const c of colliders) {
      if (sx >= c.minX && sx <= c.maxX && sz >= c.minZ && sz <= c.maxZ) {
        if (c.maxY === undefined || c.maxY > 1.2) {
          return false;
        }
      }
    }
  }
  return true;
}

function updateEnemies(dt) {
  if (state.mode !== 'playing') return;
  if (!enemyMain.visible && state.gameTime >= 4) {
    enemyMain.position.set(48, 0, 47.5);
    enemyMain.visible = true;
    state.chaseActive = true;
    showToast('まさはるがコンビニの扉の前に現れた！逃げろ！');
  }
  if (!state.chaseActive || !enemyMain.visible) return;

  // ★【１．スマホを開いてるとき敵の動きも止める！】
  if (state.phoneOpen || state.mustReplyActive) {
    return;
  }

  const dx = player.x - enemyMain.position.x;
  const dz = player.z - enemyMain.position.z;
  const dist = Math.hypot(dx, dz);

  // ★【難易度UP：視界ダッシュ＆息切れ追い打ちシステム】
  const inSight = (dist < 26) && hasLineOfSight(enemyMain.position, player);

  let speed = state.currentEnemySpeed;
  if (inSight && dist > 3.0) {
    speed += 1.35; // プレイヤーを視界に捉えている間は早足で猛追！
  } else if (player.stamina < 15 || player.exhausted) {
    speed += 0.8; // プレイヤーが息切れしているときは追い打ち
  }

  if (dist > 0.2) {
    const moveRes = moveEnemyWithCollision(enemyMain, dt, speed);
    if (Math.hypot(moveRes.moveX, moveRes.moveZ) > 0.001) {
      enemyMain.rotation.y = Math.atan2(moveRes.moveX, moveRes.moveZ);
    } else {
      enemyMain.rotation.y = Math.atan2(dx, dz);
    }
  } else {
    enemyMain.rotation.y = Math.atan2(dx, dz);
  }
  animateRobloxCharacter(enemyMain, dt, speed);

  if (dist < 1.35) {
    triggerEnding('caught');
    return;
  }

  const nearestDist = dist;

  ui.warning.classList.toggle('hidden', nearestDist > 18);
  if (nearestDist <= 18) {
    if (inSight && nearestDist > 5) {
      ui.warningHead.textContent = '👀 見つかった！小走りで追ってくる！';
      ui.warningSub.textContent = '角を曲がって視界を切れ！路地へ逃げ込め！';
    } else if (nearestDist < 6) {
      ui.warningHead.textContent = 'すぐ後ろにいる！';
      ui.warningSub.textContent = '交番まで止まるな！ダッシュしろ！';
    } else {
      ui.warningHead.textContent = '後ろから足音が近づいている！';
      ui.warningSub.textContent = '立ち止まらずに交番の明かりを目指せ';
    }

    const heartInterval = THREE.MathUtils.clamp(nearestDist * 50, 240, 850);
    if (performance.now() - state.lastHeartbeat > heartInterval) {
      playHeartbeatSound();
      state.lastHeartbeat = performance.now();
    }
  }
}

function animateRobloxCharacter(model, dt, speed) {
  if (!model.userData) return;
  const d = model.userData;
  d.animPhase = (d.animPhase || 0) + dt * speed * 4.2;

  const swing = Math.sin(d.animPhase) * 0.45;
  d.armL.rotation.x = swing;
  d.armR.rotation.x = -swing;
  d.legL.rotation.x = -swing;
  d.legR.rotation.x = swing;
}

// ==========================================
// 16. 大型円形ミニマップ（240x240 高精細VALORANT風）
// ==========================================
function drawMinimap() {
  if (!minimapCtx || state.mode !== 'playing') return;

  const ctx = minimapCtx;
  const w = 240;
  const h = 240;
  const cx = w / 2;
  const cy = h / 2;
  const scale = 1.58; // 130m×130m全域が円内に入る縮尺
  const mapRadius = 108;

  function worldToMap(wx, wz) {
    return { x: cx + wx * scale, y: cy + wz * scale };
  }
  function mapRect(wx, wz, worldWidth, worldDepth, color) {
    const p = worldToMap(wx - worldWidth / 2, wz - worldDepth / 2);
    ctx.fillStyle = color;
    ctx.fillRect(p.x, p.y, worldWidth * scale, worldDepth * scale);
  }

  // ★【マインクラフト風：探索フォグ（Fog of War）更新】
  // プレイヤーの現在位置の周囲（半径約22m）の霧を晴らす
  if (fogCtx) {
    const curP = worldToMap(player.x, player.z);
    const explorePixelRadius = 22 * scale; // 約35px
    fogCtx.save();
    fogCtx.globalCompositeOperation = 'destination-out';
    const grad = fogCtx.createRadialGradient(curP.x, curP.y, explorePixelRadius * 0.45, curP.x, curP.y, explorePixelRadius);
    grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    grad.addColorStop(0.85, 'rgba(0, 0, 0, 0.85)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    fogCtx.fillStyle = grad;
    fogCtx.beginPath();
    fogCtx.arc(curP.x, curP.y, explorePixelRadius, 0, Math.PI * 2);
    fogCtx.fill();
    fogCtx.restore();
  }

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, mapRadius, 0, Math.PI * 2);
  ctx.clip();

  // マップ全体を固定表示。
  ctx.fillStyle = '#18212b';
  ctx.fillRect(0, 0, w, h);

  // 地面内周と道路網（ゲーム内の道路座標に対応）
  mapRect(0, 0, 130, 130, '#303943');
  const roadColor = '#68717b';
  mapRect(0, 0, 130, 12, roadColor);
  mapRect(0, 0, 12, 130, roadColor);
  for (const x of [-32, 32]) mapRect(x, 0, 7, 130, roadColor);
  for (const z of [-32, 32]) mapRect(0, z, 130, 7, roadColor);
  // 裏路地
  mapRect(-16, -44, 4, 41, roadColor);
  mapRect(16, 41, 4, 47, roadColor);
  mapRect(-47, 16, 32, 4, roadColor);
  mapRect(45, -16, 40, 4, roadColor);
  mapRect(-46, -16, 38, 4, roadColor);
  mapRect(46, 16, 38, 4, roadColor);

  // 建物の配置を簡略表示（3Dの各区画と同じ座標）
  const lots = [
    [-11.82,-53.77,9.45,8.86],[-23.05,-53.77,7.68,9.45],[-11.82,-42.55,8.86,7.68],[-23.05,-42.55,7.68,7.68],
    [11.82,-53.77,8.86,8.86],[23.05,-53.77,7.68,9.45],[11.82,-42.55,8.27,7.68],[23.05,-42.55,7.68,7.68],
    [-53.77,-23.05,8.86,7.68],[-42.55,-23.05,7.68,8.86],[-53.77,-11.82,8.86,8.27],[-42.55,-11.82,7.68,8.27],
    [53.77,-23.05,8.86,7.68],[42.55,-23.05,7.68,8.86],[53.77,-11.82,8.86,8.27],[42.55,-11.82,7.68,8.27],
    [-23.05,11.82,7.68,8.27],[-11.82,11.82,8.86,8.27],[-23.05,23.05,7.68,8.86],[-11.82,23.05,8.86,8.86],
    [23.05,11.82,7.68,8.27],[11.82,11.82,8.86,8.27],[23.05,23.05,7.68,8.86],[11.82,23.05,8.86,8.86],
    [-53.77,42.55,8.27,7.68],[-42.55,42.55,7.68,8.27],[-53.77,53.77,8.27,7.68],[-42.55,53.77,7.68,8.27],
    [53.77,42.55,8.27,7.68],[42.55,42.55,7.68,8.27],[53.77,53.77,8.27,7.68],[42.55,53.77,7.68,8.27],
    [-11.82,-23.05,8.86,7.09],[11.82,-23.05,8.86,7.09],[-23.05,-11.82,7.09,8.86],[23.05,-11.82,7.09,8.86],
    [-11.82,42.55,8.86,7.09],[11.82,42.55,8.86,7.09],[-23.05,53.77,7.09,7.68],[23.05,53.77,7.09,7.68]
  ];
  for (let i = 0; i < lots.length; i++) {
    const [x, z, sx, sz] = lots[i];
    if (Math.abs(x - 42.55) < 0.1 && Math.abs(z + 42.55) < 0.1) continue;
    mapRect(x, z, sx, sz, ['#a5aab0', '#858f99', '#b5a28f'][i % 3]);
  }
  // 追加施設
  mapRect(-42.5, 8.5, 9.6, 7.8, '#d8d2c6');
  mapRect(42.5, -42.5, 10.2, 8.4, '#e4e6df');
  mapRect(42.5, -38.15, 11.0, 4.4, '#42484b');
  const hospitalMap = worldToMap(-42.5, 8.5);
  ctx.fillStyle = '#d92332'; ctx.fillRect(hospitalMap.x - 4, hospitalMap.y - 1.3, 8, 2.6); ctx.fillRect(hospitalMap.x - 1.3, hospitalMap.y - 4, 2.6, 8);
  const haneMap = worldToMap(42.5, -42.5);
  ctx.fillStyle = '#159b91'; ctx.fillRect(haneMap.x - 5.2, haneMap.y - 3.5, 10.4, 7);
  ctx.fillStyle = '#ffd21c'; ctx.fillRect(haneMap.x - 4.2, haneMap.y - 1.6, 8.4, 3.2);
  ctx.fillStyle = '#18312f'; ctx.font = 'bold 5px "Yu Gothic", YuGothic, Meiryo, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('スーパー', haneMap.x, haneMap.y);

  // 主要施設アイコン：交番(K)とコンビニ(C)
  function mapMarker(wx, wz, label, fill) {
    const m = worldToMap(wx, wz);
    ctx.beginPath(); ctx.arc(m.x, m.y, 6.2, 0, Math.PI * 2);
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 9px "Yu Gothic", YuGothic, Meiryo, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, m.x, m.y + 0.3);
  }
  mapMarker(-48, -48, 'K', '#0284c7');
  mapMarker(48, 49, 'C', '#16a34a');

  // 外周壁
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - 65 * scale, cy - 65 * scale, 130 * scale, 130 * scale);

  // ★ 未探索エリアの霧（Fog of War）をマップの上に重ね描きして覆う
  if (fogCanvas) {
    ctx.drawImage(fogCanvas, 0, 0);
  }

  // 追跡者（赤）：敵がプレイヤーの接近範囲内（26m以内）かつ視界または近接時にレーダー表示
  if (enemyMain && enemyMain.visible) {
    const enemyDist = Math.hypot(player.x - enemyMain.position.x, player.z - enemyMain.position.z);
    if (enemyDist <= 26) {
      const e = worldToMap(enemyMain.position.x, enemyMain.position.z);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(e.x, e.y, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fee2e2'; ctx.lineWidth = 1.2; ctx.stroke();
    }
  }

  // プレイヤーは常に現在位置に黄色い矢印で表示
  const p = worldToMap(player.x, player.z);
  const lookAngle = -player.yaw - Math.PI / 2;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(lookAngle);
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.moveTo(5, 0); ctx.lineTo(-3, -3.5); ctx.lineTo(-1.5, 0); ctx.lineTo(-3, 3.5);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#422006'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();

  ctx.restore();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, mapRadius, 0, Math.PI * 2); ctx.stroke();
}

// ==========================================
// 17. HUD更新
// ==========================================
function updateHUD() {
  const risk = Math.round(state.risk);
  ui.riskValue.textContent = `${risk}%`;
  ui.riskMeter.style.width = `${risk}%`;

  if (risk >= 65) {
    ui.riskMeter.style.background = 'var(--red)';
    ui.riskValue.style.color = 'var(--red)';
    ui.riskDesc.textContent = '超危険！追跡者が猛烈に加速中！';
  } else if (risk >= 35) {
    ui.riskMeter.style.background = 'var(--amber)';
    ui.riskValue.style.color = 'var(--amber)';
    ui.riskDesc.textContent = '警戒中。要求に惑わされないように';
  } else {
    ui.riskMeter.style.background = 'var(--cyan)';
    ui.riskValue.style.color = 'var(--cyan)';
    ui.riskDesc.textContent = '安全な判断を維持中';
  }

  ui.staminaValue.textContent = `${Math.round(player.stamina)}%`;
  ui.staminaMeter.style.width = `${player.stamina}%`;

  // 交番までの距離表示は削除。目的地の案内はルート表示で行う。
  ui.objMeta.textContent = '';

  const totalDist = 120;
  const progressPercent = THREE.MathUtils.clamp(((18 - player.z) / totalDist) * 100, 0, 100);
  ui.objProgress.style.width = `${progressPercent}%`;
}

function updateDecor(dt) {
  lamps.forEach(l => {
    let intensity = l.baseIntensity;
    if (state.flickerEnabled && Math.random() < 0.05) intensity *= 0.3;
    l.light.intensity = intensity * (0.96 + Math.sin(state.elapsed * 2.5 + l.phase) * 0.04);
  });

  if (kobanSirenLight) {
    kobanSirenLight.intensity = 4.5 + Math.sin(state.elapsed * 12) * 3.5;
  }
}

// ==========================================
// 18. ゲームループ
// ==========================================
function gameLoop() {
  const dt = Math.min(clock.getDelta(), 0.04);
  const worldPaused = state.phoneOpen || state.mustReplyActive;
  if (!worldPaused) state.elapsed += dt;

  if (state.mode === 'playing' && !worldPaused) {
    state.gameTime += dt;
    updatePlayer(dt);
    updateStoreAutomaticDoor(dt);
    updateEnemies(dt);
    updateHUD();
    drawMinimap();
  }

  if (!worldPaused) updateDecor(dt);
  renderer.render(scene, camera);
}

// ==========================================
// 19. エンディング処理
// ==========================================
function triggerEnding(type) {
  if (state.hasEndingTriggered) return;
  state.hasEndingTriggered = true;
  state.mode = 'ending';
  clearInterval(phoneCountdownTimer);

  keys.clear();
  if (document.pointerLockElement) document.exitPointerLock();

  ui.gameUi.classList.add('hidden');
  ui.smartphone.classList.add('collapsed');
  ui.phoneBackdrop.classList.add('hidden');
  ui.endingScreen.classList.remove('hidden');

  const minutes = Math.floor(state.gameTime / 60);
  const seconds = Math.floor(state.gameTime % 60);
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  ui.endingClues.textContent = `${state.safeDecisionsCount} / ${state.decisions}`;
  ui.endingRisk.textContent = `${Math.round(state.risk)}%`;
  ui.endingTime.textContent = timeStr;
  ui.endingRoute.textContent = state.routeTaken;

  if (type === 'win') {
    setGameCleared();
    playPoliceSirenSound();
    ui.endingStamp.textContent = 'CASE RESOLVED / 保護完了';
    ui.endingStamp.className = 'ending-stamp';
    ui.endingTitle.textContent = '信号を渡り、交番に保護された！';
    ui.endingLead.textContent = 'あなたは入り組んだ路地を駆け抜け、無事に交番へ逃げ込みました。';
    
    ui.endingNarrative.className = 'ending-narrative';
    ui.endingNarrative.innerHTML = `
      <b>【保護と犯人逮捕の記録】</b><br>
      コンビニから始まった追跡を振り切り、中道・大通りを抜けて交番へ飛び込みました。<br>
      警察官が即座にあなたを室内に保護し、パトカーのサイレンとともに追跡者の男はその場で現行犯逮捕されました。<br>
      スマートフォンに残されたSNSメッセージの履歴は、事件の決定的な証拠となりました。
    `;

    ui.endingDesc.textContent = (state.safeDecisionsCount >= 3)
      ? '完璧な危機管理とナビゲーションです。位置情報や写真の要求を断り、迷わず交番を目指したことが自らの命を守りました。'
      : '無事に交番へ辿り着けました。今後は、相手から位置情報や写真を求められた際も、より早い段階で毅然と断る勇気を持ちましょう。';

    ui.endingAdvice.innerHTML = `
      <strong>💡 現実で自分を守るためのポイント：</strong>
      <ul>
        <li>「コンビニの前で会おう」と言われても、素性の分からないネットの相手と会ってはいけません。</li>
        <li>「写真を送って」「居場所を教えて」は追跡・特定のための典型的な手口です。</li>
        <li>違和感を感じたらその場から逃げ出し、迷わず交番や人のいる店舗に助けを求めましょう。</li>
      </ul>
    `;
  } else {
    triggerDamageFlash();
    playBeep(90, 0.6, 0.1, 'sawtooth');

    ui.endingStamp.textContent = 'CASE FAILED / 被害発生';
    ui.endingStamp.className = 'ending-stamp danger';
    ui.endingTitle.textContent = '追跡者に追いつかれてしまった';
    ui.endingLead.textContent = '相手の要求に応じてしまい、安全な逃走ルートを失ってしまいました。';

    ui.endingNarrative.className = 'ending-narrative caught';
    ui.endingNarrative.innerHTML = `
      <b>【事件発生の記録】</b><br>
      路地の角で腕を強く掴まれ、暗がりへ引きずり込まれそうになりました。<br>
      「写真を送った時点で、どの路地に逃げたか筒抜けだったんだよ」男は冷笑を浮かべます。<br>
      このシミュレーションは教育用ですが、現実では重大な犯罪被害につながる極めて危険な状況です。
    `;

    ui.endingDesc.textContent = (type === 'caught_minion')
      ? '中道の行き止まり脇道に迷い込み、待ち伏せの仲間に挟み撃ちにされてしまいました。夜道や見知らぬ街では袋小路を避け、大通りを進むことが原則です。'
      : '危険な選択を重ねたことで追跡者の速度が上昇し、逃げ切ることができませんでした。相手の誘導を断ることが大切です。';

    ui.endingAdvice.innerHTML = `
      <strong>⚠️ なぜ追いつかれてしまったのか？</strong>
      <ul>
        <li>位置情報や周辺の写真を送ると、相手にリアルタイムの居場所を特定されます。</li>
        <li>見知らぬ相手からの「暗い路地においで」という誘いは罠です。絶対に近づいてはいけません。</li>
        <li>現実では「断ったら相手に悪い」と遠慮せず、自分の身の安全を最優先してください。</li>
      </ul>
    `;
  }
}

function retrySimulation() {
  initMinimapFog();
  state.hasEndingTriggered = false;
  state.risk = 15;
  state.baseEnemySpeed = diffConfig.baseEnemySpeed;
  state.currentEnemySpeed = diffConfig.baseEnemySpeed;
  player.sprintSpeed = diffConfig.sprintSpeed;
  state.decisions = 0;
  state.safeDecisionsCount = 0;
  state.chaseActive = false;
  state.minionActive = false;
  state.mustReplyActive = false;
  state.gameTime = 0;
  state.phoneOpen = false;
  state.phoneNotification = false;

  player.exhausted = false;
  player.exhaustedTimer = 0;
  clearInterval(phoneCountdownTimer);

  phoneEvents.forEach(evt => evt.triggered = false);

  ui.endingScreen.classList.add('hidden');
  ui.smartphone.classList.add('collapsed');
  ui.phoneBackdrop.classList.add('hidden');
  ui.phoneChatBody.innerHTML = '';
  ui.phoneReplyArea.classList.add('hidden');

  // ナイトモードを現在の設定値で再適用
  toggleNightMode(state.nightMode);

  startNovelPart();
}

function pauseGame() {
  if (state.mode !== 'playing') return;
  state.mode = 'paused';
  keys.clear();
  ui.pauseModal.classList.remove('hidden');
  if (document.pointerLockElement) document.exitPointerLock();
}

function resumeGame() {
  ui.pauseModal.classList.add('hidden');
  ui.settingsModal.classList.add('hidden');
  if (state.mode === 'paused') state.mode = 'playing';
  if (window.matchMedia('(pointer:fine)').matches && !state.phoneOpen && !state.mustReplyActive) {
    renderer.domElement.requestPointerLock?.();
  }
}

function returnToTitle() {
  location.reload();
}

function saveSettings() {
  state.soundEnabled = ui.soundToggle.checked;
  state.flickerEnabled = ui.flickerToggle.checked;
  if (ui.timerToggle) state.timerEnabled = ui.timerToggle.checked;
  if (ui.nightToggle) {
    const nightWanted = ui.nightToggle.checked;
    if (nightWanted !== state.nightMode) toggleNightMode(nightWanted);
  }
  state.sensitivity = Number(ui.sensitivityInput.value);
  updateAudioState();
}

function onResize() {
  if (!renderer || !camera) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
}

// ==========================================
// 20. サウンド
// ==========================================
function initAudio() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {}
  }
  if (audioCtx?.state === 'suspended') audioCtx.resume();
}

function updateAudioState() {
  if (!audioCtx) return;
  if (!state.soundEnabled && audioCtx.state === 'running') audioCtx.suspend();
  else if (state.soundEnabled && audioCtx.state === 'suspended') audioCtx.resume();
}

function playBeep(freq = 440, duration = 0.1, volume = 0.03, type = 'sine') {
  if (!state.soundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

function playFootstepSound(isSprinting) {
  playBeep(isSprinting ? 95 : 75, 0.045, isSprinting ? 0.025 : 0.012, 'triangle');
}

function playHeartbeatSound() {
  playBeep(55, 0.14, 0.04, 'sine');
  setTimeout(() => playBeep(45, 0.16, 0.03, 'sine'), 120);
}

function playPhoneVibrationSound() {
  playBeep(120, 0.1, 0.04, 'square');
  setTimeout(() => playBeep(120, 0.1, 0.04, 'square'), 180);
}

function playPoliceSirenSound() {
  if (!state.soundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(960, now);
    osc.frequency.linearRampToValueAtTime(770, now + 0.7);
    osc.frequency.linearRampToValueAtTime(960, now + 1.4);
    osc.frequency.linearRampToValueAtTime(770, now + 2.1);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(now + 2.8);
  } catch (e) {}
}

function triggerDamageFlash() {
  ui.damageFlash.classList.remove('hidden');
  setTimeout(() => ui.damageFlash.classList.add('hidden'), 400);
}

let toastTimer = null;
function showToast(msg) {
  ui.toast.textContent = msg;
  ui.toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    ui.toast.classList.add('hidden');
  }, 2800);
}

window.addEventListener('DOMContentLoaded', init);
