
"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const evidenceData = [
  {
    title: "取引の募集投稿",
    subtitle: "SNSに掲載された交換募集 / SOCIAL POST",
    analysis:
      "相場より魅力的な条件で相手を誘い、個人間取引に持ち込もうとしている可能性があります。先払いを要求している点や、取引を保証する説明がない点に注意しましょう。",
    content: `
      <div class="evidence-document">
        <div class="document-topline"><span>PUBLIC POST / SNS</span><span>14:02</span></div>
        <div class="document-body">
          <p><strong>ゲーム交換屋 <span class="document-highlight">@game_trade_001</span></strong></p>
          <p>【ゲーム特典コード交換します！】</p>
          <p>限定特典コードをお譲りします！<br>
          PayPayなどの電子マネーで交換可能です。</p>
          <p>先払いできる方優先！<br>気になる方はDMしてください！</p>
          <p class="document-warning">※この投稿では、過去の取引実績を確認できません。</p>
        </div>
      </div>
      <div class="evidence-document">
        <div class="document-topline"><span>OBSERVATION</span><span>調査ポイント</span></div>
        <div class="document-body">
          <p>・電子マネーでの先払いを要求している</p>
          <p>・取引の具体的な保証がない</p>
          <p>・相手の取引実績を確認できない</p>
        </div>
      </div>
    `
  },
  {
    title: "DMのやり取り",
    subtitle: "取引相手とのメッセージ / DIRECT MESSAGE",
    analysis:
      "相手は先払いを急がせています。「ほかにも希望者がいる」と焦らせる行為は、冷静な判断を妨げる手口として使われることがあります。急いで送金せず、相手の情報や取引条件を確認することが重要です。",
    content: `
      <div class="evidence-document">
        <div class="document-topline"><span>DIRECT MESSAGE</span><span>14:08 - 14:15</span></div>
        <div class="chat-line">
          <span class="chat-sender">ゲーム交換屋</span>
          <p>交換できます！先に電子マネーを送ってもらえれば、確認後すぐコードを送ります。</p>
          <span class="chat-time">14:08</span>
        </div>
        <div class="chat-line you">
          <span class="chat-sender">あなた</span>
          <p>先にコードを確認することはできますか？</p>
          <span class="chat-time">14:11</span>
        </div>
        <div class="chat-line">
          <span class="chat-sender">ゲーム交換屋</span>
          <p>ほかにも希望者がいるので、今すぐ送金できる人を優先します！</p>
          <span class="chat-time">14:13</span>
        </div>
        <div class="chat-line">
          <span class="chat-sender">ゲーム交換屋</span>
          <p>送金したらスクショを送ってください。</p>
          <span class="chat-time">14:15</span>
        </div>
      </div>
    `
  },
  {
    title: "送金の記録",
    subtitle: "電子マネーの送付履歴 / PAYMENT RECORD",
    analysis:
      "送金記録は、取引の経緯を説明する際に役立つ可能性があります。相手のアカウント名、送金日時、金額、取引番号などを保存し、決済サービスの公式窓口に相談しましょう。",
    content: `
      <div class="evidence-document">
        <div class="document-topline"><span>PAYMENT HISTORY</span><span>取引記録</span></div>
        <div class="document-body">
          <div class="record-row"><span>送金先</span><strong>ゲーム交換屋</strong></div>
          <div class="record-row"><span>送金日時</span><strong>14:19</strong></div>
          <div class="record-row"><span>送金額</span><strong>3,000円</strong></div>
          <div class="record-row"><span>取引内容</span><strong>ゲーム特典コードの交換</strong></div>
          <div class="record-row"><span>取引状況</span><strong class="red">コード未受領</strong></div>
          <div class="record-row"><span>取引番号</span><strong>DEMO-001-4827</strong></div>
        </div>
      </div>
      <p>※この送金記録は学習用に作成した架空のデータです。</p>
    `
  },
  {
    title: "取引相手のアカウント",
    subtitle: "プロフィールと投稿履歴 / ACCOUNT PROFILE",
    analysis:
      "アカウントが新しく、過去の取引実績も確認できません。新規アカウントであることだけで詐欺と断定はできませんが、他の証拠と組み合わせて慎重に判断する必要があります。",
    content: `
      <div class="evidence-document">
        <div class="document-topline"><span>PROFILE INSPECTION</span><span>公開情報の確認</span></div>
        <div class="document-body">
          <div class="record-row"><span>表示名</span><strong>ゲーム交換屋</strong></div>
          <div class="record-row"><span>ユーザー名</span><strong>@game_trade_001</strong></div>
          <div class="record-row"><span>自己紹介</span><strong>ゲームコード交換受付中！</strong></div>
          <div class="record-row"><span>アカウント作成</span><strong>約2週間前</strong></div>
          <div class="record-row"><span>過去の取引報告</span><strong class="red">確認できず</strong></div>
          <div class="record-row"><span>本人確認情報</span><strong>確認できず</strong></div>
          <p class="document-warning">注意：プロフィールだけでは、相手の身元や信頼性は保証されません。</p>
        </div>
      </div>
    `
  },
  {
    title: "送金後の連絡記録",
    subtitle: "連絡が途絶える直前 / FINAL MESSAGE",
    analysis:
      "送金後にコードが届かず、相手からの返信もなくなっています。先払い要求や取引実績の不足と合わせると、詐欺の可能性が高い状況です。実際に被害に遭った場合は、証拠を保存し、決済サービスやSNSの公式窓口へ相談してください。",
    content: `
      <div class="evidence-document">
        <div class="document-topline"><span>DIRECT MESSAGE</span><span>14:19 - 14:46</span></div>
        <div class="chat-line you">
          <span class="chat-sender">あなた</span>
          <p>送金しました。コードを送ってください。</p>
          <span class="chat-time">14:19</span>
        </div>
        <div class="chat-line you">
          <span class="chat-sender">あなた</span>
          <p>確認できましたか？</p>
          <span class="chat-time">14:27</span>
        </div>
        <div class="chat-line you">
          <span class="chat-sender">あなた</span>
          <p>返信をお願いします。コードがまだ届いていません。</p>
          <span class="chat-time">14:38</span>
        </div>
        <div class="chat-line">
          <span class="chat-sender">システム記録</span>
          <p class="document-warning">相手からの返信なし。プロフィールを確認できなくなりました。</p>
          <span class="chat-time">14:46</span>
        </div>
      </div>
      <div class="evidence-document">
        <div class="document-topline"><span>CASE SUMMARY</span><span>事件の整理</span></div>
        <div class="document-body">
          <p>・先払いを要求された</p>
          <p>・電子マネーを送金した</p>
          <p>・約束されたコードが届かなかった</p>
          <p>・相手からの返信がなくなった</p>
        </div>
      </div>
    `
  }
];

const state = {
  reviewed: new Set(),
  currentEvidence: null,
  modalScrollY: 0,
  toastTimer: null,
  isAnimating: false
};

const caseIntro = $("#caseIntro");
const workspace = $("#workspace");
const investigationButton = $("#startInvestigation");
const evidenceModal = $("#evidenceModal");
const dialogContent = $("#dialogContent");
const screenFlash = $("#screenFlash");
const shockwaveLayer = $("#screenShockwave");
const particleLayer = $("#particleLayer");
const unlockBanner = $("#unlockBanner");

function scrollToElement(element, block = "start") {
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block });
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

/* 調査開始：事件ファイルを左側の固定パネルに切り替える */
investigationButton.addEventListener("click", () => {
  caseIntro.classList.add("hidden");
  workspace.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "instant" });
});

$("#backToCase").addEventListener("click", () => {
  workspace.classList.add("hidden");
  caseIntro.classList.remove("hidden");
  scrollToElement(caseIntro);
});

/* 進行度・証拠ロック */
function updateProgress() {
  const count = state.reviewed.size;
  const total = evidenceData.length;
  const percent = (count / total) * 100;

  $("#progressText").textContent = `${count} / ${total}`;
  $("#progressFill").style.width = `${percent}%`;
  $("#progressCaption").textContent =
    count === 0
      ? "まだ調査していません"
      : count === total
        ? "すべての証拠を調査しました"
        : `残り ${total - count} 件の証拠`;

  $("#suspectMiniProgress").style.width =
    `${Math.min(count / 2, 1) * 100}%`;
  $("#suspectProgressText").textContent =
    `${Math.min(count, 2)} / 2 件`;

  $("#verdictMiniProgress").style.width = `${percent}%`;
  $("#verdictProgressText").textContent = `${count} / ${total} 件`;
}

function updateEvidenceCards() {
  $$(".forum-post").forEach((post, index) => {
    const reviewed = state.reviewed.has(index);
    const unlocked = index <= state.reviewed.size;

    post.classList.remove("available", "locked", "reviewed");

    const button = post.querySelector(".inspect-button");
    const status = post.querySelector(".post-state");

    if (reviewed) {
      post.classList.add("reviewed");
      button.disabled = false;
      button.textContent = "証拠を再確認 ↗";
      status.textContent = "✓ 調査済み";
    } else if (unlocked) {
      post.classList.add("available");
      button.disabled = false;
      button.textContent = "投稿を調査する →";
      status.textContent = "● 調査可能";
    } else {
      post.classList.add("locked");
      button.disabled = true;
      button.textContent = "前の証拠を確認";
      status.textContent = "🔒 未解放";
    }
  });

  updateProgress();
  updateSuspectPanel();
  updateVerdictPanel();
}

function updateSuspectPanel() {
  const unlocked = state.reviewed.size >= 2;

  $("#suspectLocked").classList.toggle("hidden", unlocked);
  $("#suspectDetails").classList.toggle("hidden", !unlocked);
  $("#suspectLock").textContent = unlocked ? "✓" : "🔒";
}

function updateVerdictPanel() {
  const allReviewed = state.reviewed.size === evidenceData.length;
  const resultShown = !$("#verdictResult").classList.contains("hidden");

  $("#verdictLocked").classList.toggle("hidden", allReviewed);
  $("#verdictReady").classList.toggle("hidden", !allReviewed || resultShown);
  $("#forumEnd").classList.toggle("hidden", !allReviewed);
}

/* 証拠の詳細を開く */
function openEvidence(index) {
  if (state.isAnimating) return;

  if (index < 0 || index >= evidenceData.length) return;

  if (index > state.reviewed.size && !state.reviewed.has(index)) {
    showToast("先に前の証拠を確認してください。");
    return;
  }

  const evidence = evidenceData[index];

  state.currentEvidence = index;
  state.modalScrollY = window.scrollY;

  $("#dialogNumber").textContent = String(index + 1).padStart(2, "0");
  $("#dialogTitle").textContent = evidence.title;
  $("#dialogSubtitle").textContent = evidence.subtitle;
  dialogContent.innerHTML = evidence.content;
  $("#dialogAnalysis").textContent = evidence.analysis;
  $("#dialogProgress").textContent =
    `EVIDENCE ${String(index + 1).padStart(2, "0")} / ${evidenceData.length}`;

  evidenceModal.classList.remove("hidden");
  evidenceModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  evidenceModal.scrollTop = 0;
  $(".evidence-modal").scrollTop = 0;

  $("#confirmEvidence").focus({ preventScroll: true });
}

function closeEvidenceDialog(restoreScroll = true) {
  evidenceModal.classList.add("hidden");
  evidenceModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (restoreScroll) {
    window.scrollTo({
      top: state.modalScrollY,
      behavior: "instant"
    });
  }
}

/* 証拠を確認して次の投稿を解放 */
function finishEvidence() {
  const index = state.currentEvidence;
  if (index === null || state.isAnimating) return;

  const alreadyReviewed = state.reviewed.has(index);

  closeEvidenceDialog(true);
  state.currentEvidence = null;

  if (alreadyReviewed) {
    showToast("この証拠はすでに調査済みです。");
    return;
  }

  state.reviewed.add(index);
  updateEvidenceCards();

  const nextIndex = index + 1;
  const nextPost = $(`.forum-post[data-evidence="${nextIndex}"]`);

  let title = "証拠を確認しました";
  let subtitle = "次の投稿が解放されました";

  if (state.reviewed.size === 2) {
    title = "出品者情報が解放されました";
    subtitle = "右側の捜査情報を確認してください";
  }

  if (state.reviewed.size === evidenceData.length) {
    title = "全証拠の調査が完了しました";
    subtitle = "最終判定が解放されました";
  }

  state.isAnimating = true;

  playUnlockAnimation(nextPost, title, subtitle);

  if (nextPost) {
    setTimeout(() => {
      scrollToElement(nextPost, "center");
    }, 250);
  } else {
    setTimeout(() => {
      scrollToElement($(".verdict-panel"), "center");
    }, 250);
  }

  setTimeout(() => {
    state.isAnimating = false;
  }, 1100);
}

/* 鎖・火花・フラッシュの解放演出 */
function playUnlockAnimation(target, title, subtitle) {
  const targetElement = target || $(".verdict-panel");
  const rect = targetElement.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  screenFlash.classList.remove("play");
  shockwaveLayer.replaceChildren();
  particleLayer.replaceChildren();

  void screenFlash.offsetWidth;
  screenFlash.classList.add("play");

  for (let i = 0; i < 3; i++) {
    const ring = document.createElement("div");
    ring.className = `shockwave-ring${i === 1 ? " purple" : ""}`;
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    ring.style.transform = "translate(-50%, -50%) scale(.1)";

    shockwaveLayer.appendChild(ring);

    ring.animate([
      {
        transform: "translate(-50%, -50%) scale(.1)",
        opacity: 1,
        borderWidth: "5px"
      },
      {
        transform: `translate(-50%, -50%) scale(${3 + i * 1.2})`,
        opacity: 0,
        borderWidth: "1px"
      }
    ], {
      duration: 700 + i * 130,
      delay: i * 70,
      easing: "cubic-bezier(.12,.65,.18,1)",
      fill: "forwards"
    });
  }

  const chain = document.createElement("div");
  chain.className = "chain-burst";
  chain.textContent = "⛓";
  chain.style.left = `${x}px`;
  chain.style.top = `${y}px`;
  particleLayer.appendChild(chain);

  for (let i = 0; i < 46; i++) {
    const particle = document.createElement("span");
    const angle = Math.PI * 2 * i / 46 + (Math.random() - .5) * .3;
    const distance = 90 + Math.random() * 260;

    particle.className = "particle";

    if (i % 5 === 0) particle.classList.add("spark");
    if (i % 4 === 0) particle.classList.add("purple");
    if (i % 7 === 0) particle.classList.add("white");

    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty("--fly-x", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--fly-y", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--angle", `${angle}rad`);
    particle.style.setProperty("--spin", `${Math.random() * 900 - 450}deg`);
    particle.style.animationDelay = `${Math.random() * .12}s`;

    particleLayer.appendChild(particle);
  }

  unlockBanner.classList.remove("show");
  $("#unlockBannerTitle").textContent = title;
  $("#unlockBannerText").textContent = subtitle;

  void unlockBanner.offsetWidth;
  unlockBanner.classList.add("show");

  if (target) {
    target.classList.remove("just-unlocked");
    void target.offsetWidth;
    target.classList.add("just-unlocked");
  }

  setTimeout(() => {
    shockwaveLayer.replaceChildren();
    particleLayer.replaceChildren();
  }, 1600);
}

/* 掲示板の投稿をクリック */
$("#evidenceList").addEventListener("click", (event) => {
  const post = event.target.closest(".forum-post");
  if (!post) return;

  const button = event.target.closest(".inspect-button");
  if (!button || button.disabled) return;

  openEvidence(Number(post.dataset.evidence));
});

$("#confirmEvidence").addEventListener("click", finishEvidence);

$("#closeModalX").addEventListener("click", () => {
  closeEvidenceDialog(true);
});

evidenceModal.addEventListener("click", (event) => {
  if (event.target === evidenceModal) {
    closeEvidenceDialog(true);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !evidenceModal.classList.contains("hidden")) {
    closeEvidenceDialog(true);
  }
});

/* 最終判定 */
$("#showVerdict").addEventListener("click", () => {
  if (state.reviewed.size !== evidenceData.length) {
    showToast("先にすべての証拠を調査してください。");
    return;
  }

  $("#verdictReady").classList.add("hidden");
  $("#verdictLocked").classList.add("hidden");
  $("#verdictResult").classList.remove("hidden");

  scrollToElement($(".verdict-panel"), "center");
});

/* 最初からやり直す */
$("#restartInvestigation").addEventListener("click", () => {
  if (!window.confirm("調査状況をリセットして最初からやり直しますか？")) {
    return;
  }

  state.reviewed.clear();
  state.currentEvidence = null;
  state.isAnimating = false;

  closeEvidenceDialog(false);

  $("#verdictResult").classList.add("hidden");
  $("#verdictReady").classList.add("hidden");
  $("#verdictLocked").classList.remove("hidden");

  $("#suspectDetails").classList.add("hidden");
  $("#suspectLocked").classList.remove("hidden");

  screenFlash.classList.remove("play");
  unlockBanner.classList.remove("show");
  shockwaveLayer.replaceChildren();
  particleLayer.replaceChildren();

  updateEvidenceCards();

  workspace.classList.add("hidden");
  caseIntro.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "instant" });

  showToast("調査状況をリセットしました。");
});

/* 初期化 */
updateEvidenceCards();
