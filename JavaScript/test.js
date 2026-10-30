"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const evidenceData = [
  {
    title: "取引の募集投稿",
    subtitle: "SNSに掲載された交換募集 / SOCIAL POST",
    analysis: "相場より魅力的な条件で相手を誘い、個人間取引に持ち込もうとしている可能性があります。先払いを要求している点や、取引を保証する説明がない点に注意しましょう。",
    content: `
      <div class="evidence-document">
        <div class="document-topline"><span>PUBLIC POST / SNS</span><span>14:02</span></div>
        <div class="document-body">
          <p><strong>ゲーム交換屋 <span class="document-highlight">@game_trade_001</span></strong></p>
          <p>【ゲーム特典コード交換します！】</p>
          <p>限定特典コードをお譲りします！<br>PayPayなどの電子マネーで交換可能です。</p>
          <p>先払いできる方優先！<br>気になる方はDMしてください！</p>
          <p class="document-warning">※この投稿では、過去の取引実績を確認できません。</p>
        </div>
      </div>
`
  },
  {
    title: "DMのやり取り",
    subtitle: "取引相手とのメッセージ / DIRECT MESSAGE",
    analysis: "相手は先払いを急がせています。「ほかにも希望者がいる」と焦らせる行為は、冷静な判断を妨げる手口として使われることがあります。急いで送金せず、相手の情報や取引条件を確認することが重要です。",
    content: `
      <div class="evidence-document">
        <div class="document-topline"><span>DIRECT MESSAGE</span><span>14:08 - 14:15</span></div>
        <div class="chat-line">
          <span class="chat-sender">ゲーム交換屋</span>
          <p>交換できます！先に電子マネーを送ってもらえば、確認後すぐコードを送ります。</p>
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
      </div>`
  },
  {
    title: "送金の記録",
    subtitle: "電子マネーの送付履歴 / PAYMENT RECORD",
    analysis: "送金記録は、取引の経緯を説明する際に役立つ可能性があります。相手のアカウント名、送金日時、金額、取引番号などを保存し、決済サービスの公式窓口に相談しましょう。",
    content: `
      <div class="evidence-document">
        <div class="document-topline"><span>PAYMENT HISTORY</span><span>取引記録</span></div>
        <div class="document-body">
          <div class="record-row"><span>送金先</span><strong>ゲーム交換屋</strong></div>
          <div class="record-row"><span>送金日時</span><strong>１４：１９</strong></div>
          <div class="record-row"><span>送金額</span><strong>3,000円</strong></div>
          <div class="record-row"><span>取引内容</span><strong>ゲーム特典コードの交換</strong></div>
          <div class="record-row"><span>取引状況</span><strong class="red">コード未受領</strong></div>
          <div class="record-row"><span>取引番号</span><strong>DEMO-001-4827</strong></div>
        </div>
      </div>
      <p>※この送金記録は学習用に作成した架空のデータです。</p>`
  },
  {
    title: "取引相手のアカウント",
    subtitle: "プロフィールと投稿履歴 / ACCOUNT PROFILE",
    analysis: "アカウントが新しく、過去の取引実績も確認できません。新規アカウントであることだけで詐欺と断定はできませんが、他の証拠と組み合わせて慎重に判断する必要があります。",
    content: `
      <div class="evidence-document">
        <div class="document-topline"><span>PROFILE INSPECTION</span><span>公開情報の確認</span></div>
        <div class="document-body">
          <div class="record-row"><span>表示名</span><strong>ゲーム交換屋</strong></div>
          <div class="record-row"><span>ユーザー名</span><strong>@game_trade_001</strong></div>
          <div class="record-row"><span>自己紹介</span><strong>ゲームコード交換受付中！</strong></div>
          <div class="record-row"><span>アカウント作成</span><strong>約２週間前</strong></div>
          <div class="record-row"><span>過去の取引報告</span><strong class="red">確認できず</strong></div>
          <div class="record-row"><span>本人確認情報</span><strong>確認できず</strong></div>
          <p class="document-warning">注意：プロフィールだけでは、相手の身元や信頼性は保証されません。</p>
        </div>
      </div>`
  },
  {
    title: "送金後の連絡記録",
    subtitle: "連絡が途絶える直前 / FINAL MESSAGE",
    analysis: "送金後にコードが届かず、相手からの返信もなくなっています。先払い要求や取引実績の不足と合わせると、詐欺の可能性が高い状況です。実際に被害に遭った場合は、証拠を保存し、決済サービスやSNSの公式窓口へ相談してください。",
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
`
  }
];


const suspiciousPointsData = [
  [
    "電子マネーでの先払いを要求している",
    "取引の具体的な保証がない",
    "過去の取引実績を確認できない"
  ],
  [
    "コードを渡す前に送金を求めている",
    "ほかにも希望者がいると急がせている",
    "送金画面のスクリーンショットを要求している"
  ],
  [
    "送金済みなのにコードを受け取れていない",
    "送金先と取引相手の関係を十分に確認できない",
    "送金記録を証拠として保存する必要がある"
  ],
  [
    "アカウント作成から約2週間しか経っていない",
    "過去の取引報告を確認できない",
    "本人確認情報を確認できない"
  ],
  [
    "送金後もコードが届いていない",
    "複数回連絡しても返信がない",
    "相手のプロフィールを確認できなくなった"
  ]
];


// 「」内に指定された全フレーズは選択肢として表示する。
// 正解として扱うのは、以前から設定されている重要なポイントだけ。
const selectablePhrases = [
  [
    "ゲーム交換屋", "@game_trade_001", "ゲーム特典コード", "交換します！",
    "限定特典コード", "お譲りします！", "電子マネーで交換可能です。", "先払いできる方優先！",
    "気になる方はDMしてください", "この投稿では", "過去の取引実績を確認できません。"
  ],
  [
    "交換できます！", "先に電子マネーを送ってもらえば", "確認後すぐコードを送ります。",
    "先にコードを確認", "ほかにも希望者がいるので", "今すぐ送金できる人を優先します！",
    "送金したら", "スクショを送ってください。"
  ],
  [
    "送金先", "ゲーム交換屋", "送金日時", "１４：１９", "送金額", "3,000円",
    "取引内容", "ゲーム特典コードの交換", "取引状況", "コード未受領", "取引番号", "DEMO-001-4827"
  ],
  [
    "表示名", "ゲーム交換屋", "ユーザー名", "@game_trade_001", "自己紹介",
    "ゲームコード交換受付中！", "アカウント作成", "約２週間前", "過去の取引報告",
    "確認できず", "本人確認情報", "確認できず"
  ],
  [
    "送金しました。", "コードを送ってください", "確認できましたか？", "返信をお願いします。",
    "コードがまだ届いていません。", "相手からの返信なし", "プロフィールを確認できなくなりました。"
  ]
];

// 正解は以前の設定を維持。選択できるフレーズ全部が正解という扱いにはしない。
const suspiciousPhrases = [
  ["電子マネーで交換可能です。", "先払いできる方優先！", "過去の取引実績を確認できません。"],
  ["先に電子マネーを送ってもらえば", "今すぐ送金できる人を優先します！", "スクショを送ってください。"],
  ["3,000円", "コード未受領", "ゲーム特典コードの交換"],
  ["約２週間前", "確認できず", "確認できず"],
  ["コードがまだ届いていません。", "相手からの返信なし", "プロフィールを確認できなくなりました。"]
];

// 正解後に表示する解説。各ポイントが「危険な兆候」なのか「被害を裏付ける証拠」なのかも区別する。
const suspiciousExplanations = [
  [
    { phrase: "電子マネーで交換可能です。", reason: "電子マネーは送金後に取り戻すことが難しい場合があります。相手の身元や取引の安全性を確認できないまま送金するのは危険です。" },
    { phrase: "先払いできる方優先！", reason: "商品・コードを受け取る前に支払いを求めています。代金だけを受け取り、約束したコードを渡さない先払い詐欺につながるおそれがあります。" },
    { phrase: "過去の取引実績を確認できません。", reason: "過去に約束どおり取引したかを判断できる材料がありません。実績が見えない相手との個人間取引では、慎重な確認が必要です。" }
  ],
  [
    { phrase: "先に電子マネーを送ってもらえば", reason: "コードの内容や利用可能性を確認する前に支払いを求めています。相手がコードを渡さなくても、先に送金してしまう形になります。" },
    { phrase: "今すぐ送金できる人を優先します！", reason: "「ほかにも希望者がいる」と急がせ、考える時間を与えない言い方です。焦って確認を省かせるのは、詐欺で使われることのある手口です。" },
    { phrase: "スクショを送ってください。", reason: "送金画面の画像を要求し、支払いを先に確定させようとしています。画像を送る前に、相手の信頼性や取引条件を確認しましょう。" }
  ],
  [
    { phrase: "3,000円", reason: "金額そのものが詐欺の証拠というわけではありません。ただし、実際に支払った金額を確認できる重要な記録で、被害相談や返金の問い合わせに必要になる場合があります。" },
    { phrase: "コード未受領", reason: "支払いが完了している一方で、約束されたコードを受け取れていません。代金と商品・サービスの受け渡しが一致していないことを示す重要な情報です。" },
    { phrase: "ゲーム特典コードの交換", reason: "この記録によって、3,000円の送金が何のためだったのかを確認できます。取引内容と未受領の状態を結び付ける証拠になります。" }
  ],
  [
    { phrase: "約２週間前", reason: "作成から日が浅いアカウントです。新しいことだけで詐欺とは断定できませんが、長期間の利用実績がなく、信頼性を判断する材料が少ない点に注意が必要です。" },
    { phrase: "確認できず", reason: "過去の取引報告が見当たらず、約束どおりコードを渡した実績を確かめられません。取引相手を信用できるか判断しにくい状態です。" },
    { phrase: "確認できず", reason: "本人確認情報が確認できず、アカウントの背後にいる人物を確かめられません。トラブル時に相手を特定する手がかりが乏しい点がリスクです。" }
  ],
  [
    { phrase: "コードがまだ届いていません。", reason: "送金後も約束されたコードが届いていないことを、メッセージで伝えています。支払い後に商品が渡されていない状況を示しています。" },
    { phrase: "相手からの返信なし", reason: "送金後の確認や問い合わせに相手が応じていません。単なる返信遅れの可能性もありますが、未受領の状態と重なると不審な兆候です。" },
    { phrase: "プロフィールを確認できなくなりました。", reason: "相手のプロフィールまで確認できなくなり、連絡や相手の情報確認が難しくなっています。送金後に連絡手段を断たれた可能性を示す重要な状況です。" }
  ]
];

const state = {
  reviewed: new Set(),
  identified: new Map(),
  answered: new Set(),
  currentEvidence: null,
  modalScrollY: 0,
  toastTimer: null,
  isAnimating: false
};

const $caseIntro = $("#caseIntro");
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
  toast.classList.remove("show");
  // 再表示時も中央ポップアップのアニメーションを確実に再生する。
  void toast.offsetWidth;
  toast.classList.add("show");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

investigationButton.addEventListener("click", () => {
  $caseIntro.classList.add("hidden");
  workspace.classList.remove("hidden");
  window.scrollTo(0, 0);
});

$("#backToCase").addEventListener("click", () => {
  workspace.classList.add("hidden");
  $caseIntro.classList.remove("hidden");
  scrollToElement($caseIntro);
});

function updateProgress() {
  const count = state.reviewed.size;
  const total = evidenceData.length;
  const identifiedCount = [...state.identified.values()].reduce((sum, picks) => sum + picks.size, 0);
  const percent = (count / total) * 100;

  $("#progressText").textContent = `${count} / ${total}`;
  $("#progressFill").style.width = `${percent}%`;
  $("#progressCaption").textContent = count === 0
    ? "まだ調査していません"
    : count === total
      ? "すべての証拠を調査しました"
      : `残り ${total - count} 件の証拠`;

  $("#suspectMiniProgress").style.width = `${Math.min(count / 2, 1) * 100}%`;
  $("#suspectProgressText").textContent = `${Math.min(count, 2)} / 2 件`;
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
  const allReviewed = state.reviewed.size === evidenceData.length && state.answered.size === evidenceData.length;
  const resultShown = !$("#verdictResult").classList.contains("hidden");
  $("#verdictLocked").classList.toggle("hidden", allReviewed);
  $("#verdictReady").classList.toggle("hidden", !allReviewed || resultShown);
  $("#forumEnd").classList.toggle("hidden", !allReviewed);
}

function openEvidence(index) {
  if (state.isAnimating || index < 0 || index >= evidenceData.length) return;

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
  renderSuspiciousPoints(index);
  $("#dialogProgress").textContent = `EVIDENCE ${String(index + 1).padStart(2, "0")} / ${evidenceData.length}`;

  evidenceModal.classList.remove("hidden");
  evidenceModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  evidenceModal.scrollTop = 0;
  $(".evidence-modal").scrollTop = 0;
  $("#confirmEvidence").focus({ preventScroll: true });
}

function renderSuspiciousPoints(index) {
  const isEvidenceCollection = index === 2;
  const heading = $("#suspiciousPointsTitle");
  const headingLabel = $(".suspicious-heading > span");
  const headingDescription = $(".suspicious-heading > p");
  heading.textContent = isEvidenceCollection ? "証拠を集める" : "怪しいポイントを見つける";
  headingLabel.textContent = isEvidenceCollection ? "02 / COLLECT THE EVIDENCE" : "02 / FIND THE CLUES";
  headingDescription.textContent = isEvidenceCollection
    ? "左側の送金記録から、支払いの事実や取引内容を示す情報を選んで証拠として集めよう。必要な項目をすべて選んだら「証拠を確認する」を押してください。"
    : "左側の本文を読み、気になる箇所をクリックして赤丸を付けよう。必要なポイントをすべて選んだら「答え合わせ」を押してください。";
  $("#confirmEvidence").textContent = isEvidenceCollection ? "証拠を確認する" : "答え合わせ";
  const list = $("#suspiciousPointsList");
  list.replaceChildren();

  // 文章は日本語の単語単位でクリック可能にする。正解フレーズはひとまとまりで選択できる。
  // 正解かどうかは「答え合わせ」を押すまで表示しない。
  const selected = state.identified.get(index) || new Set();
  const phrases = selectablePhrases[index];
  const answerPhrases = suspiciousPhrases[index];
  const walker = document.createTreeWalker(dialogContent, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.nodeValue.trim() && !node.parentElement.closest('button, script, style')) textNodes.push(node);
  }

  let textId = 0;
  const answerTargets = new Map(answerPhrases.map((_, clueIndex) => [clueIndex, new Set()]));
  const phraseOccurrenceCounts = new Map();
  const segmenter = typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter("ja", { granularity: "word" })
    : null;

  function makeToken(text, clueIndices = []) {
    if (!text) return null;
    if (/^\s+$/.test(text)) return document.createTextNode(text);
    const token = document.createElement("button");
    token.type = "button";
    token.className = "text-clue-target";
    token.dataset.textId = String(textId++);
    token.dataset.clueIndices = clueIndices.join(",");
    token.setAttribute("aria-pressed", String(selected.has(token.dataset.textId)));
    token.setAttribute("aria-label", "この単語・語句に赤丸を付ける");
    token.textContent = text;
    token.classList.toggle("found", selected.has(token.dataset.textId));
    clueIndices.forEach((clueIndex) => answerTargets.get(clueIndex).add(token.dataset.textId));
    return token;
  }

  // 接続詞や、文末・依頼表現などの機能語は赤丸の選択対象にしない。
  const nonSelectableWords = [
    "してください", "してくださいませ", "お願いいたします", "お願いします",
    "します", "しました", "しません", "している", "しています", "ください", "下さい",
    "など", "等", "そして", "しかし", "また", "だから", "そのため", "ただし", "なお", "さらに",
    "ところが", "なので", "または", "もしくは", "あるいは", "一方", "それでも",
    "つまり", "ところで", "それから", "そのうえ", "したがって", "けれど", "けれども",
    "しかしながら", "それに", "それでは", "では", "逆に"
  ].sort((a, b) => b.length - a.length);

  function appendOrdinaryText(fragment, text) {
    // 引用フレーズとして指定された部分以外はクリック・選択できない通常テキストにする。
    if (text) fragment.append(document.createTextNode(text));
  }

  function replaceTextNode(node) {
    const original = node.nodeValue;
    const fragment = document.createDocumentFragment();
    let cursor = 0;
    while (cursor < original.length) {
      let nextStart = -1;
      let nextPhrase = null;
      let nextClueIndex = -1;
      for (let clueIndex = 0; clueIndex < phrases.length; clueIndex++) {
        const phrase = phrases[clueIndex];
        const pos = original.indexOf(phrase, cursor);
        if (pos !== -1 && (nextStart === -1 || pos < nextStart || (pos === nextStart && phrase.length > nextPhrase.length))) {
          nextStart = pos;
          nextPhrase = phrase;
          nextClueIndex = answerPhrases.indexOf(phrase);
        }
      }
      if (nextStart === -1) {
        appendOrdinaryText(fragment, original.slice(cursor));
        break;
      }
      appendOrdinaryText(fragment, original.slice(cursor, nextStart));
      const phraseOccurrenceKey = `${index}:${nextPhrase}`;
      const matchingAnswerIndices = answerPhrases
        .map((answer, answerIndex) => answer === nextPhrase ? answerIndex : -1)
        .filter(answerIndex => answerIndex >= 0);
      const occurrence = phraseOccurrenceCounts.get(phraseOccurrenceKey) || 0;
      phraseOccurrenceCounts.set(phraseOccurrenceKey, occurrence + 1);
      // 同じ正解語句が複数ある場合は、本文中の出現順に別々の正解枠へ割り当てる。
      // それ以外の選択肢は赤丸を付けられても正解にはならない。
      const answerIndex = matchingAnswerIndices[occurrence];
      const clueIndices = answerIndex === undefined ? [] : [answerIndex];
      fragment.append(makeToken(nextPhrase, clueIndices));
      cursor = nextStart + nextPhrase.length;
    }
    node.parentNode.replaceChild(fragment, node);
  }
  textNodes.forEach(replaceTextNode);

  dialogContent.onclick = (event) => {
    const target = event.target.closest(".text-clue-target");
    if (!target) return;
    const id = target.dataset.textId;
    const picks = state.identified.get(index) || new Set();
    if (picks.has(id)) {
      picks.delete(id);
      target.classList.remove("found");
      target.setAttribute("aria-pressed", "false");
    } else {
      picks.add(id);
      target.classList.add("found");
      target.setAttribute("aria-pressed", "true");
    }
    state.identified.set(index, picks);
    state.answered.delete(index);
    updateSuspiciousFeedback(index, answerTargets);
  };

  if (state.answered.has(index)) {
    $("#confirmEvidence").textContent = "調査を完了して掲示板へ戻る →";
    $("#confirmEvidence").disabled = false;
  } else {
    $("#confirmEvidence").textContent = "答え合わせ";
    $("#confirmEvidence").disabled = false;
  }
  updateSuspiciousFeedback(index, answerTargets);
}

function renderSuspiciousExplanations(index) {
  const panel = $("#suspiciousExplanation");
  panel.replaceChildren();
  if (!state.answered.has(index)) {
    panel.classList.add("hidden");
    return;
  }

  const heading = document.createElement("h4");
  heading.textContent = index === 2 ? "なぜ証拠になる？ / EVIDENCE ANALYSIS" : "なぜ怪しい？ / CLUE ANALYSIS";
  panel.append(heading);
  suspiciousExplanations[index].forEach((item, clueIndex) => {
    const article = document.createElement("article");
    article.className = "explanation-item";
    const title = document.createElement("h5");
    title.textContent = `${String(clueIndex + 1).padStart(2, "0")}　「${item.phrase}」`;
    const reason = document.createElement("p");
    reason.textContent = item.reason;
    article.append(title, reason);
    panel.append(article);
  });
  panel.classList.remove("hidden");
}

function updateSuspiciousFeedback(index, answerTargets = null) {
  const picks = state.identified.get(index) || new Set();
  const total = suspiciousPhrases[index].length;
  const selectedCount = picks.size;
  const feedback = $("#suspiciousFeedback");

  if (state.answered.has(index)) {
    renderSuspiciousExplanations(index);
    feedback.textContent = index === 2
      ? `✓ 証拠をすべて集めました（${total}/${total}）。「調査を完了して掲示板へ戻る」を押してください。`
      : `✓ 正解！怪しいポイントをすべて見つけました（${total}/${total}）。「調査を完了して掲示板へ戻る」を押してください。`;
    feedback.classList.add("complete");
    $("#confirmEvidence").disabled = false;
    $("#confirmEvidence").textContent = "調査を完了して掲示板へ戻る →";
    return;
  }

  renderSuspiciousExplanations(index);
  feedback.textContent = index === 2
    ? `送金記録の重要な項目を選んで証拠として集めよう。選択中：${selectedCount}か所。選び終えたら「証拠を確認する」を押してください。`
    : `文章の気になる部分を自由に赤丸で囲もう。選択中：${selectedCount}か所。丸を付け終えたら「答え合わせ」を押してください。`;
  feedback.classList.remove("complete");
  $("#confirmEvidence").disabled = false;
  $("#confirmEvidence").textContent = "答え合わせ";
}

function checkEvidenceAnswers(index) {
  const picks = state.identified.get(index) || new Set();
  const phrases = suspiciousPhrases[index];
  const walker = document.createTreeWalker(dialogContent, NodeFilter.SHOW_ELEMENT);
  const targets = [];
  while (walker.nextNode()) {
    const element = walker.currentNode;
    if (element.classList?.contains("text-clue-target")) targets.push(element);
  }

  const clueTokenIds = new Map(phrases.map((_, clueIndex) => [clueIndex, new Set()]));
  for (const target of targets) {
    (target.dataset.clueIndices || "").split(",").filter(Boolean).forEach((clueIndex) => {
      clueTokenIds.get(Number(clueIndex))?.add(target.dataset.textId);
    });
  }
  const foundCorrect = new Set();
  for (const [clueIndex, tokenIds] of clueTokenIds) {
    if (tokenIds.size > 0 && [...tokenIds].every((id) => picks.has(id))) foundCorrect.add(clueIndex);
  }

  const total = phrases.length;
  const correctTokenIds = new Set([...clueTokenIds.values()].flatMap((ids) => [...ids]));
  const selectedOnlyCorrect = picks.size === correctTokenIds.size && [...picks].every((id) => correctTokenIds.has(id));
  if (foundCorrect.size === total && [...clueTokenIds.values()].every((ids) => ids.size > 0) && selectedOnlyCorrect) {
    state.answered.add(index);
    updateSuspiciousFeedback(index);
    showToast(index === 2 ? "証拠をすべて集めました！" : "答え合わせ正解！すべての怪しいポイントを見つけました。");
  } else {
    const missing = total - foundCorrect.size;
    const hasExtraSelections = [...picks].some((id) => !correctTokenIds.has(id));
    $("#suspiciousFeedback").textContent = hasExtraSelections
      ? `正解以外のフレーズも選択されています（正解 ${foundCorrect.size}/${total}）。必要な箇所だけに赤丸を付け直してください。`
      : `まだ正解がそろっていません（正解 ${foundCorrect.size}/${total}）。赤丸を付け直して、もう一度答え合わせしてください。`;
    $("#suspiciousFeedback").classList.remove("complete");
    showToast(index === 2 ? `まだ集めていない証拠が ${missing} つあります。` : `まだ見つかっていない怪しいポイントが ${missing} か所あります。`);
  }
}

function closeEvidenceDialog(restoreScroll = true) {
  evidenceModal.classList.add("hidden");
  evidenceModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (restoreScroll) window.scrollTo({ top: state.modalScrollY, behavior: "instant" });
}

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
    setTimeout(() => scrollToElement(nextPost, "center"), 250);
  } else {
    setTimeout(() => scrollToElement($(".verdict-panel"), "center"), 250);
  }

  setTimeout(() => {
    state.isAnimating = false;
    // 05の調査を完了したら、最終判定を画面中央に大きく自動表示する。
    if (index === evidenceData.length - 1 && state.reviewed.size === evidenceData.length && state.answered.size === evidenceData.length) {
      workspace.classList.add("hidden");
      $("#finalVerdictScreen").classList.remove("hidden");
      document.body.style.overflow = "hidden";
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, 1100);
}

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
      { transform: "translate(-50%, -50%) scale(.1)", opacity: 1, borderWidth: "5px" },
      { transform: `translate(-50%, -50%) scale(${3 + i * 1.2})`, opacity: 0, borderWidth: "1px" }
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

$("#evidenceList").addEventListener("click", (event) => {
  const post = event.target.closest(".forum-post");
  if (!post) return;
  const button = event.target.closest(".inspect-button");
  if (!button || button.disabled) return;
  openEvidence(Number(post.dataset.evidence));
});

$("#confirmEvidence").addEventListener("click", () => {
  const index = state.currentEvidence;
  if (index === null) return;
  if (state.answered.has(index)) finishEvidence();
  else checkEvidenceAnswers(index);
});
$("#closeModalX").addEventListener("click", () => closeEvidenceDialog(true));

evidenceModal.addEventListener("click", (event) => {
  if (event.target === evidenceModal) closeEvidenceDialog(true);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !evidenceModal.classList.contains("hidden")) {
    closeEvidenceDialog(true);
  }
});

// 最終判定はプレイヤーが「詐欺」か「詐欺ではない」を選んでから解説を表示する。
$$(".final-choice-button").forEach((button) => {
  button.addEventListener("click", () => {
    sessionStorage.setItem("cyber_experience_transaction", "completed");
    const choseFraud = button.dataset.choice === "fraud";
    const title = $("#finalVerdictTitle");
    const lead = $("#finalVerdictLead");
    const choiceArea = $("#finalChoiceArea");
    const details = $("#finalVerdictDetails");
    const outcome = $("#finalChoiceOutcome");

    choiceArea.classList.add("hidden");
    details.classList.remove("hidden");
    outcome.classList.remove("hidden");
    outcome.textContent = choseFraud ? "あなたの判定：詐欺" : "あなたの判定：詐欺ではない";
    title.textContent = choseFraud ? "詐欺と判断しました" : "詐欺ではないと判断しました";
    lead.textContent = choseFraud
      ? "正解です。先払い後にコードが届かず、相手からの返信も途絶えています。複数の証拠から詐欺の可能性が高いと考えられます。"
      : "不正解です。このケースでは詐欺の可能性が高いと判断できます。先払い後にコードが届かず、相手からの返信も途絶えた点を、ほかの証拠と合わせて確認しましょう。";
    $("#finalVerdictIcon").textContent = choseFraud ? "✓" : "!";
    $("#finalVerdictIcon").classList.toggle("correct", choseFraud);
  });
});

$("#showVerdict").addEventListener("click", () => {
  if (state.reviewed.size !== evidenceData.length || state.answered.size !== evidenceData.length) {
    showToast("先にすべての証拠を調査してください。");
    return;
  }
  $("#verdictReady").classList.add("hidden");
  $("#verdictLocked").classList.add("hidden");
  $("#verdictResult").classList.remove("hidden");
  workspace.classList.add("hidden");
  $("#finalVerdictScreen").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

$("#finalRestartInvestigation").addEventListener("click", () => {
  $("#restartInvestigation").click();
});

$("#restartInvestigation").addEventListener("click", () => {
  if (!window.confirm("調査状況をリセットして最初からやり直しますか？")) return;

  state.reviewed.clear();
  state.identified.clear();
  state.answered.clear();
  state.currentEvidence = null;
  state.isAnimating = false;
  closeEvidenceDialog(false);

  $("#finalVerdictScreen").classList.add("hidden");
  $("#finalChoiceArea").classList.remove("hidden");
  $("#finalVerdictDetails").classList.add("hidden");
  $("#finalChoiceOutcome").classList.add("hidden");
  $("#finalVerdictTitle").textContent = "詐欺か、詐欺ではないか？";
  $("#finalVerdictLead").textContent = "すべての証拠を確認しました。証拠をもとに、あなたの最終判断を選んでください。";
  $("#finalVerdictIcon").textContent = "?";
  $("#finalVerdictIcon").classList.remove("correct");
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
  $caseIntro.classList.remove("hidden");
  window.scrollTo(0, 0);
  showToast("調査状況をリセットしました。");
});

updateEvidenceCards();


// メインサイトからリンクで開かれた場合はリンク元へ戻す。
document.addEventListener("DOMContentLoaded", () => {
  // 上部と最終判定画面の両方から、大元のサイトへ戻れるようにする。
  const returnButtons = [
    document.getElementById("returnMainHome"),
    document.getElementById("returnMainHomeFinal")
  ].filter(Boolean);

  returnButtons.forEach((button) => {
    if (document.referrer) {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        window.location.href = document.referrer;
      });
    }
  });
});
