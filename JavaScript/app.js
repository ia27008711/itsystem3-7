/**
 * ネットの危険性体験シミュレータ＆見極めクイズ - アプリケーションロジック (app.js)
 * LINE風スマートフォンUI ＆ 完全絵文字排除・テキストデザイン
 * 登場人物: さくら（自称・小5女子、正体48歳男性）、みらい君（プレイヤー）
 */

// =============================================================================
// 1. サウンドマネージャー (Web Audio API)
// =============================================================================
class SoundManager {
  constructor() {
    this.enabled = true;
    this.audioCtx = null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.audioCtx = new AudioContext();
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // LINE風 ピコン音
  playPop() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.09);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  // タップ・クリック音
  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.04);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  // 正解・安全音
  playCorrect() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.18, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.18);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.18);
      });
    } catch (e) {}
  }

  // 不正解・警告音
  playIncorrect() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      [180, 140].forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.16, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.1);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.1);
      });
    } catch (e) {}
  }

  // 重大危険・ネタばらし音
  playDangerBoom() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.7);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.8);
    } catch (e) {}
  }
}

const sounds = new SoundManager();

// =============================================================================
// 2. メインアプリケーション
// =============================================================================
class SafetyApp {
  constructor() {
    this.currentScenario = null;
    this.currentNodeId = null;
    this.dangerLevel = 0;
    this.pendingOption = null;

    // クイズ
    this.quizIndex = 0;
    this.quizScore = 0;
    this.quizAnswered = false;

    // 文字サイズ
    this.fontSizes = ["normal", "large", "xlarge"];
    this.fontIndex = 1; // デフォルト large

    this.cacheDom();
    this.bindEvents();
    this.initStaticViews();
    this.loadScenario(SCENARIOS[0].id);
  }

  cacheDom() {
    // ヘッダー & ナビゲーション
    this.tabBtns = document.querySelectorAll("[data-tab]");
    this.tabPanels = document.querySelectorAll(".tab-panel");
    this.btnFontToggle = document.getElementById("btn-font-toggle");
    this.fontStatusText = document.getElementById("font-status-text");
    this.btnRubyToggle = document.getElementById("btn-ruby-toggle");
    this.rubyStatusText = document.getElementById("ruby-status-text");
    this.btnSoundToggle = document.getElementById("btn-sound-toggle");
    this.soundStatusText = document.getElementById("sound-status-text");

    // シナリオ選択
    this.scenarioChips = document.getElementById("scenario-chips");

    // スマホ & LINE風チャット
    this.phoneClock = document.getElementById("phone-clock");
    this.linePartnerAvatar = document.getElementById("line-partner-avatar");
    this.linePartnerName = document.getElementById("line-partner-name");
    this.linePartnerStatus = document.getElementById("line-partner-status");
    this.dangerPercentText = document.getElementById("danger-percent-text");
    this.dangerStatusBadge = document.getElementById("danger-status-badge");
    this.simSceneStep = document.getElementById("sim-scene-step");
    this.chatMessagesContainer = document.getElementById("chat-messages-container");
    this.typingIndicator = document.getElementById("typing-indicator");
    this.typingUsername = document.getElementById("typing-username");
    this.optionsButtonsGrid = document.getElementById("options-buttons-grid");

    // サイド解説パネル
    this.redflagLiveTitle = document.getElementById("redflag-live-title");
    this.redflagLiveDesc = document.getElementById("redflag-live-desc");
    this.sideFakeName = document.getElementById("side-fake-name");
    this.sideFakeStatus = document.getElementById("side-fake-status");
    this.sideFakeId = document.getElementById("side-fake-id");

    // 解説モーダル
    this.modalExplanation = document.getElementById("modal-explanation");
    this.expModalText = document.getElementById("exp-modal-text");
    this.expModalCalloutBox = document.getElementById("exp-modal-callout-box");
    this.calloutLeadBadge = document.getElementById("callout-lead-badge");
    this.expModalCallout = document.getElementById("exp-modal-callout");
    this.btnExpBack = document.getElementById("btn-exp-back");
    this.btnExpProceed = document.getElementById("btn-exp-proceed");

    // ネタばらしモーダル
    this.modalReveal = document.getElementById("modal-reveal");
    this.revealBadge = document.getElementById("reveal-badge");
    this.revealTitle = document.getElementById("reveal-title");
    this.revealSub = document.getElementById("reveal-sub");
    this.revealFakeAvatar = document.getElementById("reveal-fake-avatar");
    this.revealFakeName = document.getElementById("reveal-fake-name");
    this.revealFakeDesc = document.getElementById("reveal-fake-desc");
    this.revealRealAvatar = document.getElementById("reveal-real-avatar");
    this.revealRealName = document.getElementById("reveal-real-name");
    this.revealRealDesc = document.getElementById("reveal-real-desc");
    this.revealStoryText = document.getElementById("reveal-story-text");
    this.revealLessonsList = document.getElementById("reveal-lessons-list");
    this.btnRevealRestart = document.getElementById("btn-reveal-restart");
    this.btnRevealNext = document.getElementById("btn-reveal-next");

    // クイズ
    this.quizProgressText = document.getElementById("quiz-progress-text");
    this.quizScoreLive = document.getElementById("quiz-score-live");
    this.quizProgressFill = document.getElementById("quiz-progress-fill");
    this.quizPlayView = document.getElementById("quiz-play-view");
    this.quizResultView = document.getElementById("quiz-result-view");
    this.quizChatCard = document.getElementById("quiz-chat-card");
    this.quizSenderName = document.getElementById("quiz-sender-name");
    this.quizChatBubble = document.getElementById("quiz-chat-bubble");
    this.quizQuestionNum = document.getElementById("quiz-question-num");
    this.quizQuestionText = document.getElementById("quiz-question-text");
    this.quizAnswersGrid = document.getElementById("quiz-answers-grid");
    this.certScoreVal = document.getElementById("cert-score-val");
    this.certRankBadge = document.getElementById("cert-rank-badge");
    this.certCommentText = document.getElementById("cert-comment-text");
    this.certDateText = document.getElementById("cert-date-text");
    this.btnQuizRestart = document.getElementById("btn-quiz-restart");

    // 図鑑 & SOS
    this.groomingStepsContainer = document.getElementById("grooming-steps-container");
    this.redflagWordsContainer = document.getElementById("redflag-words-container");
    this.sosCardsContainer = document.getElementById("sos-cards-container");
  }

  bindEvents() {
    // タブ切替
    this.tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        sounds.playClick();
        const tabId = btn.getAttribute("data-tab");
        this.switchTab(tabId);
      });
    });

    // 文字サイズ切替
    this.btnFontToggle.addEventListener("click", () => {
      sounds.playClick();
      this.fontIndex = (this.fontIndex + 1) % this.fontSizes.length;
      const size = this.fontSizes[this.fontIndex];
      document.body.classList.remove("font-size-normal", "font-size-large", "font-size-xlarge");
      document.body.classList.add(`font-size-${size}`);
      const labels = { normal: "標準", large: "大", xlarge: "特大" };
      this.fontStatusText.textContent = labels[size];
    });

    // ふりがなトグル
    this.btnRubyToggle.addEventListener("click", () => {
      sounds.playClick();
      const isOff = document.body.classList.toggle("ruby-off");
      this.rubyStatusText.textContent = isOff ? "OFF" : "ON";
    });

    // 音声トグル
    this.btnSoundToggle.addEventListener("click", () => {
      const isOn = sounds.toggle();
      sounds.playClick();
      this.soundStatusText.textContent = isOn ? "ON" : "OFF";
    });

    // 解説モーダル ボタン
    this.btnExpBack.addEventListener("click", () => {
      sounds.playClick();
      this.modalExplanation.style.display = "none";
      this.pendingOption = null;
    });

    this.btnExpProceed.addEventListener("click", () => {
      sounds.playClick();
      this.modalExplanation.style.display = "none";
      if (this.pendingOption) {
        this.applyOptionAndAdvance(this.pendingOption);
        this.pendingOption = null;
      }
    });

    // ネタばらしモーダル ボタン
    this.btnRevealRestart.addEventListener("click", () => {
      sounds.playClick();
      this.modalReveal.style.display = "none";
      if (this.currentScenario) {
        this.loadScenario(this.currentScenario.id);
      }
    });

    this.btnRevealNext.addEventListener("click", () => {
      sounds.playClick();

      const currentIndex = SCENARIOS.findIndex(s => s.id === this.currentScenario.id);

      // パート3（最後のケース）が終わったらホームへ戻り、進捗を保存
      if (currentIndex === SCENARIOS.length - 1) {
        sessionStorage.setItem("cyber_experience_offline_meeting", "completed");
        window.location.href = "./index.html";
        return;
      }

      // パート1・2は次のケースへ
      this.modalReveal.style.display = "none";
      this.loadScenario(SCENARIOS[currentIndex + 1].id);
    });

    // クイズ再挑戦
    this.btnQuizRestart.addEventListener("click", () => {
      sounds.playClick();
      this.startQuiz();
    });
  }

  switchTab(tabId) {
    this.tabBtns.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });
    this.tabPanels.forEach(panel => {
      panel.classList.toggle("active", panel.id === tabId);
    });

    if (tabId === "tab-quiz" && this.quizIndex === 0 && !this.quizAnswered) {
      this.startQuiz();
    }
  }

  // ===========================================================================
  // 3. シナリオ進行ロジック (LINE風)
  // ===========================================================================
  loadScenario(scenarioId) {
    const sc = SCENARIOS.find(s => s.id === scenarioId) || SCENARIOS[0];
    this.currentScenario = sc;
    this.currentNodeId = sc.startNode;
    this.dangerLevel = sc.initialDanger || 0;

    // シナリオ選択チップの描画
    this.renderScenarioChips();

    // LINEヘッダー情報の更新
    this.linePartnerAvatar.textContent = sc.partner.initialLetter || "相";
    this.linePartnerName.textContent = sc.partner.name;
    this.linePartnerStatus.textContent = sc.headerStatus || "最終ログイン: たった今";
    this.typingUsername.textContent = sc.partner.shortName || sc.partner.name;

    // サイドパネル情報の更新
    this.sideFakeName.textContent = sc.partner.name;
    this.sideFakeStatus.textContent = sc.partner.statusMessage;
    this.sideFakeId.textContent = sc.partner.lineId;

    // メッセージエリア初期化
    this.chatMessagesContainer.innerHTML = `
      <div class="line-date-divider">今日 2026年8月28日(金)</div>
    `;

    // 危険度表示リセット
    this.updateDangerDisplay();

    // 最初のノード描画
    this.renderCurrentNode();
  }

  renderScenarioChips() {
    this.scenarioChips.innerHTML = SCENARIOS.map(sc => `
      <button class="scenario-chip ${sc.id === this.currentScenario.id ? 'active' : ''}" data-id="${sc.id}">
        <span>${sc.title.split(':')[0]}</span>: ${sc.partner.shortName || sc.partner.name}
      </button>
    `).join("");

    this.scenarioChips.querySelectorAll(".scenario-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        sounds.playClick();
        const id = chip.getAttribute("data-id");
        this.loadScenario(id);
      });
    });
  }

  async renderCurrentNode() {
    const node = this.currentScenario.nodes[this.currentNodeId];
    if (!node) return;

    // エンディング画面の場合
    if (node.location === "ending_screen" || node.endingType) {
      this.showEndingModal(node);
      return;
    }

    // 時計の更新 (15:22等)
    if (node.time) {
      this.phoneClock.textContent = node.time;
    }

    // レッドフラグのサイド表示
    if (node.redFlag) {
      this.redflagLiveTitle.textContent = node.redFlag.title;
      this.redflagLiveDesc.textContent = node.redFlag.desc;
    }

    // 返信ボタンを一旦クリア
    this.optionsButtonsGrid.innerHTML = "";

    const messages = node.messages || [];

    // メッセージを1件ずつリアルな入力待ち時間をかけて順次表示
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];

      // 1. 「さくら が入力中...」を表示
      this.typingIndicator.style.display = "flex";
      this.chatMessagesContainer.scrollTop = this.chatMessagesContainer.scrollHeight;

      // 2. 文字数に応じたリアルなタイピング時間（短文1.6秒〜長文2.8秒）待機
      const textLen = (msg.text || "").length;
      const typingTime = Math.min(2800, Math.max(1600, textLen * 65));
      await this.sleep(typingTime);

      // 3. 入力中を消してメッセージを画面に追加
      this.typingIndicator.style.display = "none";
      sounds.playPop();
      this.appendMessage(msg, node.time || "15:22");
      this.chatMessagesContainer.scrollTop = this.chatMessagesContainer.scrollHeight;

      // 次のメッセージがある場合は少し間（800ms）を置く
      if (i < messages.length - 1) {
        await this.sleep(750);
      }
    }

    // 全メッセージ表示後、少し間を置いて返信選択肢を表示
    await this.sleep(600);
    this.renderOptions(node.options);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  appendMessage(msg, fallbackTime) {
    const msgTime = msg.time || fallbackTime || "15:22";
    const initialChar = this.currentScenario.partner.initialLetter || "相";
    const row = document.createElement("div");
    row.className = "line-msg-row other";

    if (msg.type === "image") {
      row.innerHTML = `
        <div class="line-msg-avatar">${initialChar}</div>
        <div class="line-msg-content-wrapper">
          <span class="line-msg-sender-name">${this.currentScenario.partner.name}</span>
          <div class="line-msg-bubble-group">
            <div class="line-image-card">
              <div class="line-image-preview">
                <span>自撮り写真.jpg</span>
                <span class="line-image-fake-tag">ネットの拾い画像</span>
              </div>
              <div class="line-image-caption">${msg.text || "写真が送信されました"}</div>
            </div>
            <span class="line-msg-time-other">${msgTime}</span>
          </div>
        </div>
      `;
    } else {
      row.innerHTML = `
        <div class="line-msg-avatar">${initialChar}</div>
        <div class="line-msg-content-wrapper">
          <span class="line-msg-sender-name">${this.currentScenario.partner.name}</span>
          <div class="line-msg-bubble-group">
            <div class="line-bubble-other">${this.escapeHtml(msg.text)}</div>
            <span class="line-msg-time-other">${msgTime}</span>
          </div>
        </div>
      `;
    }

    this.chatMessagesContainer.appendChild(row);
  }

  renderOptions(options) {
    if (!options || options.length === 0) return;

    this.optionsButtonsGrid.innerHTML = "";
    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "line-option-btn";
      btn.innerHTML = `
        <span>${this.escapeHtml(opt.text)}</span>
        <span class="line-option-arrow">返信</span>
      `;
      btn.addEventListener("click", () => {
        this.handleOptionClick(opt);
      });
      this.optionsButtonsGrid.appendChild(btn);
    });
  }

  handleOptionClick(opt) {
    sounds.playClick();

    // 解説ダイアログを表示
    this.pendingOption = opt;
    this.expModalText.textContent = opt.feedback || "この選択についての解説を確認しましょう。";
    
    if (opt.dangerChange > 0) {
      this.calloutLeadBadge.textContent = "危険なサイン";
      this.calloutLeadBadge.style.background = "#dc2626";
      this.calloutLeadBadge.style.color = "#ffffff";
      this.expModalCallout.textContent = "相手の要求に不用意に応じてしまうと、さらなる要求や密会に引きずり込まれる恐れがあります。";
      this.expModalCalloutBox.style.borderColor = "#f87171";
      this.expModalCalloutBox.style.background = "#fff5f5";
      this.expModalCalloutBox.style.color = "#991b1b";
    } else {
      this.calloutLeadBadge.textContent = "適切な判断";
      this.calloutLeadBadge.style.background = "#16a34a";
      this.calloutLeadBadge.style.color = "#ffffff";
      this.expModalCallout.textContent = "個人情報を守り、家庭のルールを伝えたり大人に相談することでトラブルを未然に防ぐことができます。";
      this.expModalCalloutBox.style.borderColor = "#a7f3d0";
      this.expModalCalloutBox.style.background = "#ecfdf5";
      this.expModalCalloutBox.style.color = "#065f46";
    }

    this.modalExplanation.style.display = "flex";
  }

  applyOptionAndAdvance(opt) {
    // 自分のメッセージをLINE風（右側・緑吹き出し・既読付き）で追加
    const currentTime = this.phoneClock.textContent || "15:22";
    const myRow = document.createElement("div");
    myRow.className = "line-msg-row me";
    myRow.innerHTML = `
      <div class="line-meta-me">
        <span class="line-meta-read">既読</span>
        <span>${currentTime}</span>
      </div>
      <div class="line-bubble-me">${this.escapeHtml(opt.text)}</div>
    `;
    this.chatMessagesContainer.appendChild(myRow);
    this.chatMessagesContainer.scrollTop = this.chatMessagesContainer.scrollHeight;

    // 危険度更新
    this.dangerLevel = Math.max(0, Math.min(100, this.dangerLevel + (opt.dangerChange || 0)));
    this.updateDangerDisplay();

    // 次のノードへ遷移
    this.currentNodeId = opt.nextNode;
    setTimeout(() => {
      this.renderCurrentNode();
    }, 600);
  }

  updateDangerDisplay() {
    this.dangerPercentText.textContent = `${this.dangerLevel}%`;

    this.dangerStatusBadge.className = "danger-tag";
    if (this.dangerLevel <= 20) {
      this.dangerStatusBadge.classList.add("safe");
      this.dangerStatusBadge.textContent = "安全";
    } else if (this.dangerLevel <= 60) {
      this.dangerStatusBadge.classList.add("warning");
      this.dangerStatusBadge.textContent = "注意・警戒";
    } else {
      this.dangerStatusBadge.classList.add("danger");
      this.dangerStatusBadge.textContent = "重大な危険";
    }
  }

  // ===========================================================================
  // 4. ネタばらしモーダル (エンディング)
  // ===========================================================================
  showEndingModal(node) {
    const sc = this.currentScenario;

    if (node.endingType === "BAD") {
      sounds.playDangerBoom();
      this.revealBadge.className = "reveal-badge bad";
      this.revealBadge.textContent = "重大被害（最悪の結末）";
    } else if (node.endingType === "PERFECT") {
      sounds.playCorrect();
      this.revealBadge.className = "reveal-badge perfect";
      this.revealBadge.textContent = "完全防犯クリア";
    } else {
      sounds.playCorrect();
      this.revealBadge.className = "reveal-badge good";
      this.revealBadge.textContent = "安全クリア";
    }

    this.revealTitle.textContent = node.title || "シミュレーション結果";
    this.revealSub.textContent = node.subtitle || "";

    // 相手の正体比較
    this.revealFakeAvatar.textContent = sc.partner.initialLetter || "自";
    this.revealFakeName.textContent = sc.partner.name;
    this.revealFakeDesc.textContent = sc.partner.fakeProfile;

    this.revealRealAvatar.textContent = "男";
    this.revealRealName.textContent = sc.partner.realIdentity;
    this.revealRealDesc.textContent = sc.partner.realPurpose;

    // ストーリー & レッスン
    this.revealStoryText.textContent = node.story || "";
    this.revealLessonsList.innerHTML = (node.lesson || []).map(item => `<li>${this.escapeHtml(item)}</li>`).join("");

    // 最後のパートでは「次のケースへ」ではなく「ホームに戻る」と表示
    const currentIndex = SCENARIOS.findIndex(s => s.id === sc.id);
    this.btnRevealNext.textContent =
      currentIndex === SCENARIOS.length - 1 ? "ホームに戻る" : "次のケースへ";

    this.modalReveal.style.display = "flex";
  }

  // ===========================================================================
  // 5. 見極めクイズロジック
  // ===========================================================================
  startQuiz() {
    this.quizIndex = 0;
    this.quizScore = 0;
    this.quizAnswered = false;
    this.quizPlayView.style.display = "flex";
    this.quizResultView.style.display = "none";
    this.renderQuizQuestion();
  }

  renderQuizQuestion() {
    const q = QUIZ_QUESTIONS[this.quizIndex];
    if (!q) {
      this.showQuizResult();
      return;
    }

    this.quizAnswered = false;
    this.quizProgressText.textContent = `第 ${this.quizIndex + 1} 問 / 全 ${QUIZ_QUESTIONS.length} 問`;
    this.quizScoreLive.textContent = `スコア: ${this.quizScore} 点`;
    this.quizProgressFill.style.width = `${((this.quizIndex + 1) / QUIZ_QUESTIONS.length) * 100}%`;

    this.quizSenderName.textContent = q.sender;
    this.quizChatBubble.textContent = q.chatPreview;
    this.quizQuestionNum.textContent = `【${q.category}】 第 ${this.quizIndex + 1} 問`;
    this.quizQuestionText.textContent = q.question;

    this.quizAnswersGrid.innerHTML = "";
    q.answers.forEach((ans, idx) => {
      const btn = document.createElement("button");
      btn.className = "quiz-choice-btn";
      btn.innerHTML = `
        <span>${idx + 1}. ${this.escapeHtml(ans.text)}</span>
      `;
      btn.addEventListener("click", () => {
        if (this.quizAnswered) return;
        this.handleQuizAnswer(ans, btn);
      });
      this.quizAnswersGrid.appendChild(btn);
    });
  }

  handleQuizAnswer(selectedAns, selectedBtn) {
    this.quizAnswered = true;
    const q = QUIZ_QUESTIONS[this.quizIndex];

    const isCorrect = selectedAns.correct;
    if (isCorrect) {
      sounds.playCorrect();
      this.quizScore += Math.round(100 / QUIZ_QUESTIONS.length);
      selectedBtn.classList.add("correct-choice");
      selectedBtn.innerHTML += ` <span>【正解】</span>`;
    } else {
      sounds.playIncorrect();
      selectedBtn.classList.add("wrong-choice");
      selectedBtn.innerHTML += ` <span>【不正解】</span>`;
      
      // 正解ボタンをハイライト
      const btns = this.quizAnswersGrid.querySelectorAll(".quiz-choice-btn");
      q.answers.forEach((ans, i) => {
        if (ans.correct && btns[i]) {
          btns[i].classList.add("correct-choice");
          btns[i].innerHTML += ` <span>【正しい選択】</span>`;
        }
      });
    }

    this.quizScoreLive.textContent = `スコア: ${this.quizScore} 点`;

    // 解説ボックスと次へボタン
    const expBox = document.createElement("div");
    expBox.className = "quiz-explanation-box";
    expBox.innerHTML = `
      <div><strong>解説：</strong> ${selectedAns.reason}</div>
      <button class="quiz-next-btn">
        ${this.quizIndex + 1 < QUIZ_QUESTIONS.length ? "次の問題へ" : "結果・認定証を見る"}
      </button>
    `;
    const nextBtn = expBox.querySelector(".quiz-next-btn");
    nextBtn.addEventListener("click", () => {
      sounds.playClick();
      this.quizIndex++;
      this.renderQuizQuestion();
    });

    this.quizAnswersGrid.appendChild(expBox);
  }

  showQuizResult() {
    this.quizPlayView.style.display = "none";
    this.quizResultView.style.display = "flex";

    // スコア計算
    const finalScore = Math.min(100, this.quizScore);
    this.certScoreVal.textContent = `${finalScore} 点`;

    if (finalScore >= 90) {
      this.certRankBadge.textContent = "Sランク：防犯の達人！ネットマスター";
      this.certRankBadge.style.color = "#047857";
      this.certRankBadge.style.background = "#d1fae5";
      this.certCommentText.textContent = "素晴らしい！ネットに潜むグルーミングやなりすましの大人の手口を完全に見抜く力を持っています。この調子で安全にネットを楽しみましょう。";
    } else if (finalScore >= 70) {
      this.certRankBadge.textContent = "Aランク：防犯意識が高い合格レベル";
      this.certRankBadge.style.color = "#1d4ed8";
      this.certRankBadge.style.background = "#dbeafe";
      this.certCommentText.textContent = "高い防犯意識を持っています。「親に内緒」「写真の要求」などの重要サインをもう一度復習しておくとさらに安心です。";
    } else {
      this.certRankBadge.textContent = "Bランク：要注意！手口を復習しよう";
      this.certRankBadge.style.color = "#b45309";
      this.certRankBadge.style.background = "#fef3c7";
      this.certCommentText.textContent = "優しい言葉やプレゼントに騙されやすい傾向があります。「危険シグナル図鑑」を読んで、危ない手口をしっかり覚えましょう。";
    }

    this.certDateText.textContent = `認定日: ${new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}`;
  }

  // ===========================================================================
  // 6. 静的ビュー（図鑑・SOS窓口）初期化
  // ===========================================================================
  initStaticViews() {
    // グルーミング5段階
    this.groomingStepsContainer.innerHTML = GROOMING_STEPS.map(step => `
      <div class="grooming-step-card">
        <div class="step-num-badge">${step.step}</div>
        <div class="step-info">
          <div class="step-title-row">
            <span class="step-name">${step.name}</span>
            <span class="step-danger-pill">${step.dangerLevel}</span>
          </div>
          <p class="step-desc">${step.desc}</p>
        </div>
      </div>
    `).join("");

    // 危険ワード辞典
    this.redflagWordsContainer.innerHTML = RED_FLAG_WORDS.map(item => `
      <div class="redflag-word-card">
        <span class="redflag-cat-tag">【${item.category}】</span>
        <div class="redflag-word-text">${item.word}</div>
        <div class="redflag-word-why">理由: ${item.why}</div>
      </div>
    `).join("");

    // SOS相談窓口（リンクを排して静的な電話番号表示）
    this.sosCardsContainer.innerHTML = SOS_CONTACTS.map(contact => `
      <div class="sos-card">
        <span class="sos-badge" style="background: ${contact.color};">${contact.badge}</span>
        <div class="sos-title">${contact.name}</div>
        <div class="sos-number-box" style="color: ${contact.color}; border-color: ${contact.color};">
          <span class="sos-num-label">電話番号:</span> ${contact.number}
        </div>
        <p class="sos-desc">${contact.desc}</p>
      </div>
    `).join("");
  }

  escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// アプリケーション起動
document.addEventListener("DOMContentLoaded", () => {
  window.safetyApp = new SafetyApp();
});
