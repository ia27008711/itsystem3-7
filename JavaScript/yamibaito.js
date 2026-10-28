function openMail(element, sender, date, subject, content, fileName) {
    const emptyMail = document.getElementById("empty-mail");
    const mailContent = document.getElementById("mail-content");
    const attachment = document.getElementById("attachment");

    if (!emptyMail || !mailContent || !attachment) return;

    document.querySelectorAll(".mail-item").forEach(item => item.classList.remove("active"));
    element.classList.add("active");
    element.classList.remove("unread");

    emptyMail.style.display = "none";
    mailContent.style.display = "block";

    document.getElementById("from").innerText = sender;
    document.getElementById("date").innerText = date;
    document.getElementById("subject").innerText = subject;

    const contentArea = document.getElementById("content");

    if (sender === "support-center") {
        contentArea.innerHTML = `
            誠に突然のご連絡失礼いたします。当グループでは、現在一般には公開していない単発の特別高額アルバイトスタッフを募集しております。<br><br>
            <strong>【業務内容】</strong>指定場所での書類・荷物の回収および運搬（軽作業）<br>
            <strong>【報酬】</strong>日給 50,000円 〜 150,000円（即日現金手渡し可能）<br>
            <strong>【応募条件】</strong>年齢・経験一切不問。秘密厳守できる方。<br><br>
            ※枠が埋まり次第終了となります。現在、応募が殺到しているため、参加を希望される場合は下記リンクより24時間受付対応の【秘匿カスタマーチャット】へ今すぐアクセスし、直接ご連絡ください。<br><br>
            <a href="#" id="yami-link" style="color: #0076ff; text-decoration: underline; font-weight: bold; font-size: 16px;">👉 【暗号化通信】24時間対応・スピード応募チャットを起動する</a>
        `;
        
        const yamiLink = document.getElementById("yami-link");
        if (yamiLink) {
            yamiLink.addEventListener("click", function(e) {
                e.preventDefault();
                switchToFullChatPage("url_start");
            });
        }
    } else if (sender === "school-info") {
        contentArea.innerHTML = `
            スマホの画面に、同じ部活を引退した卒業生の先輩からLINEメッセージが届いた。<br><br>
            先輩『お疲れ！そういえばお前、前に金欠って言ってなかったっけ？俺が今やってる社長の知り合いの会社が、書類運ぶだけで日給3万出す臨時のバイト探してるんだよね。紹介枠が1個余ってるんだけど、興味ある？』<br><br>
            先輩『セキュリティ付きのチャットアプリを使うから絶対に安全だし、俺も毎週やってるから安心だよ。詳しい指示を出すマネージャーのグループに招待するから、とりあえず話だけでも聞いてみなよ！』<br><br>
            <a href="#" id="senpai-link" style="color: #28a745; text-decoration: underline; font-weight: bold; font-size: 16px;">👉 先輩を信じて、紹介された裏チャットページに接続する</a>
        `;
        
        const senpaiLink = document.getElementById("senpai-link");
        if (senpaiLink) {
            senpaiLink.addEventListener("click", function(e) {
                e.preventDefault();
                switchToFullChatPage("senpai_start");
            });
        }
    } else {
        contentArea.innerHTML = `
            ${content}<br><br>
            <span style="color:#d9534f; font-weight:bold;">※業務を始める前に、必ず添付ファイル（契約書・マニュアル）をパソコンまたはスマートフォンにダウンロードし、実行・確認してください。</span>
        `;
    }

    if (fileName && fileName !== "") {
        attachment.style.display = "flex";
        attachment.dataset.filename = fileName;
        const nameEl = attachment.querySelector(".attachment-name");
        if (nameEl) nameEl.innerText = fileName;
        
        attachment.onclick = function() {
            switchToFullChatPage("file_start");
        };
    } else {
        attachment.style.display = "none";
        attachment.onclick = null;
    }
}

function switchToFullChatPage(initialStep) {
    const emailView = document.getElementById("email-app-view");
    const fullChatView = document.getElementById("yami-full-page");
    const logArea = document.getElementById("full-chat-log-area");

    if (!emailView || !fullChatView || !logArea) return;

    emailView.style.display = "none";
    fullChatView.classList.remove("hide-view");
    
    history.pushState({ page: "chat" }, null, "");
    
    logArea.innerHTML = `<p style="color: #555; font-size: 12px; text-align: center; margin: 15px 0;">安全な接続が確立されました。通信ログの監視を遮断しています。</p>`;

    showFullTypingIndicator(() => { progressSim(initialStep); });
}

function showFullTypingIndicator(callback) {
    const logArea = document.getElementById("full-chat-log-area");
    const choiceArea = document.getElementById("full-choice-area");
    if (!logArea || !choiceArea) return;

    choiceArea.innerHTML = "";
    
    const typingDiv = document.createElement("div");
    typingDiv.id = "full-typing-loader";
    typingDiv.style.alignSelf = "flex-start";
    typingDiv.style.background = "#1f1f26";
    typingDiv.style.padding = "12px 18px";
    typingDiv.style.borderRadius = "16px";
    typingDiv.style.borderBottomLeftRadius = "4px";
    typingDiv.style.color = "#888";
    typingDiv.style.fontSize = "14px";
    typingDiv.innerHTML = `指示役が入力中<span class="t-dot">.</span><span class="t-dot">.</span><span class="t-dot">.</span>`;
    
    logArea.appendChild(typingDiv);
    logArea.scrollTop = logArea.scrollHeight;

    setTimeout(() => {
        const loader = document.getElementById("full-typing-loader");
        if (loader) loader.remove();
        callback();
    }, 1100);
}

const simSteps = {
    file_start: {
        sender: "NETWORK SYSTEM",
        text: "指示役『送付したマニュアル（拡張子が.exeの不審なファイル）を開いたな。これで裏の登録完了。\n\nお前がファイルを開いたログから、スマホの内部データ、位置情報、実家の身元はすべてこちらのサーバーに同期された。今から出す指示通りに動いてもらうぞ。』",
        choices: [
            { text: "「勝手にデータを抜くなんて犯罪です！今すぐ消してください！」", next: "threat" },
            { text: "「分かりました、指示に従います」", next: "obey" }
        ]
    },
    url_start: {
        sender: "人事統括マネージャー",
        text: "募集担当『ご応募ありがとうございます！うちは法律に準拠したホワイト案件なので安心してください。\n\nただ、直前のドタキャンや荷物の持ち逃げを防ぐため、保証代わりにあなたの「顔写真付き身分証の画像」と「実家の詳しい住所・家族構成」をこの暗号チャットに送信してください。確認が取れ次第、明日の現地の招集場所を送ります。』",
        choices: [
            { text: "「わかりました！」マイナンバーカードの写真を撮影して送信する", next: "obey" },
            { text: "「仕事の詳細もわからない状態で、大切な個人情報は絶対に送れません」と突っぱねる", next: "threat" },
            { text: "（身分証や家族構成を求められるなんて100%闇バイトだ）何も返さず即座にアプリを削除する", next: "escape_clear" }
        ]
    },
    senpai_start: {
        sender: "〇〇先輩の紹介窓口",
        text: "グループのボス『君が〇〇（先輩）の後輩くんか、大歓迎だよ。仕事は指定した高齢者の家に行って荷物を預かるだけ。即日手渡しで3万〜5万稼げるよ。\n\n身内の紹介だから堅苦しい面接はないけど、保証代わりに君の「学生証の写真」と「親の携帯電話番号」だけ今すぐこのチャットに送って。』",
        choices: [
            { text: "先輩の紹介だし嘘はつかないはず。言われた通りに学生証と親の連絡先を送信する", next: "obey" },
            { text: "「先輩の紹介でも、親の連絡先を勝手に教えるのは絶対に無理です」と断る", next: "threat" },
            { text: "（「高齢者の家で荷物を預かるだけ」は特殊詐欺の手口だ！）何も言わずに即グループを退会して先輩もブロックする", next: "escape_clear" }
        ]
    },
    threat: {
        sender: "指示役（最上層ボス）",
        text: "指示役『あ？辞める？ナメたこと言ってんじゃねえぞ。こっちはお前の身元（または端末データ）を完全に掴んでんだよ。バックれる気なら、今からお前の実家に“叩き（強盗）”の実行部隊を直撃させるからな。\n\n学校や近所にもお前が犯罪組織に応募した証拠をばら撒く。お前だけでなく家族全員の人生が終わるぞ？今すぐ指定する現場へ向かえ！』",
        isThreat: true,
        choices: [
            { text: "家族や自分の人生が壊されるのは怖すぎる…脅迫に屈して現場へ向かう", next: "arrest_end" },
            { text: "脅されても絶対に拒絶し、今すぐ本物の警察（#9110）へ駆け込む", next: "police_clear" }
        ]
    },
    obey: {
        sender: "指示役（業務命令）",
        text: "指示役『素直でよろしい。では明日の指示を出す。朝10時に、指定する高級住宅街のターゲットの家へスーツを着用して向かえ。\n\n玄関先で「法律事務所の代理で参りました」と言えば、紙袋に入った現金を渡される。それを受け取ったら速やかに駅のコインロッカーへ運べ。いいな、逃げようなんて絶対に考えるなよ。』",
        choices: [
            { text: "「これって特殊詐欺の受け子（犯罪）じゃないですか！捕まるのは嫌なので辞めます！」", next: "threat" },
            { text: "震えながら指示された高齢者の家へ足を運ぶ", next: "arrest_end" },
            { text: "直前で激しい罪悪感に襲われた。指示役のメッセージを無視してスマホの電源を切り、そのまま交番に飛び込む", next: "police_clear" }
        ]
    },
    escape_clear: {
        sender: "シミュレーション終了",
        text: "完全回避：おめでとうございます！】\n\nあなたは闇バイトの罠を初期段階で見破り、身分証や個人情報を相手に渡す前にすべての連絡を遮断して見事に逃げ切りました。\n\n闇バイト組織は、手元に情報がないターゲットに対しては、逆恨みで嫌がらせをしたり家を襲ったりすることは絶対にできません。怪しいと感じた瞬間に『何も言わずに即ブロック・完全無視』を行うことが、最強の自己防衛です。",
        isEnd: true
    },
    police_clear: {
        sender: "シミュレーション終了",
        text: "【警察保護：正しいルートの選択】\n\n恐ろしい脅迫を受けながらも、犯罪に手を染める前に本物の警察にすべての履歴を見せて相談しました！\n犯人は「実家に強盗を送り込む」と極限の恐怖を煽ってきますが、実際は海外などの安全圏から口先だけで脅していることがほとんどです。\n\n実際に罪を犯してしまう前であれば、警察（#9110）や学校はあなたと家族の安全を完全に保護し、犯人グループとの関係を安全に断ち切ってくれます。脅されても一人で抱え込まず、すぐに助けを求めることが正しい道です。",
        isEnd: true
    },
    arrest_end: {
        sender: "【現行犯逮捕】人生の終了",
        text: "【ゲームオーバー：最悪の結末】\n\n指示された通りに高齢者の家でお金を受け取った瞬間、周囲を包囲していた私服警察官たちに窃盗・詐欺罪の容疑で現行犯逮捕されました。\n\nあなたがパトカーの中で絶望している間、指示役は遠隔操作でチャットルームを消去し、あなたを切り捨てて逃亡します。闇バイトの実行役（使い捨ての駒）になった人間が、警察の捜査網から逃げ切ることは100%不可能です。あなたに残されたのは、消えない前科と、数千万円に及ぶ損害賠償、そして崩壊した家族の未来だけです。",
        isEnd: true
    }
};

function progressSim(stepKey) {
    const step = simSteps[stepKey];
    const logArea = document.getElementById("full-chat-log-area");
    const choiceArea = document.getElementById("full-choice-area");
    const senderHeader = document.getElementById("full-chat-sender");
    const fullPageWindow = document.getElementById("yami-full-page");

    if (!logArea || !choiceArea || !senderHeader || !fullPageWindow) return;

    if (stepKey === "reset") {
        fullPageWindow.classList.add("hide-view");
        
        logArea.innerHTML = "";
        choiceArea.innerHTML = "";
        senderHeader.innerText = "接続中...";
        document.getElementById("full-dummy-input").innerText = "メッセージを選択してください...";
    
        const emailView = document.getElementById("email-app-view");
        if (emailView) emailView.style.display = "flex";
        
        document.getElementById("empty-mail").style.display = "flex";
        document.getElementById("mail-content").style.display = "none";
        
        document.querySelectorAll(".mail-item").forEach(item => item.classList.remove("active"));
        return;
    }

    if (!step) return;

    senderHeader.innerText = step.sender;

    const msgDiv = document.createElement("div");
    msgDiv.style.margin = "4px 0";
    msgDiv.style.padding = "14px 20px";
    msgDiv.style.borderRadius = "16px";
    msgDiv.style.fontSize = "14px";
    msgDiv.style.lineHeight = "1.6";
    msgDiv.style.maxWidth = "80%";
    msgDiv.style.whiteSpace = "pre-wrap";

    if (step.isEnd) {
        msgDiv.style.background = stepKey.includes("clear") ? "#1b5e20" : "#5f0000";
        msgDiv.style.color = "#fff";
        msgDiv.style.fontWeight = "bold";
        msgDiv.style.maxWidth = "100%";
        msgDiv.style.border = stepKey.includes("clear") ? "1px solid #2e7d32" : "1px solid #b71c1c";
    } else if (step.isThreat) {
        msgDiv.style.background = "#4a0008";
        msgDiv.style.color = "#ffb3b3";
        msgDiv.style.border = "1px solid #d9534f";
        msgDiv.style.fontWeight = "bold";
        msgDiv.style.boxShadow = "0 0 15px rgba(219,83,79,0.3)";
       
    } else {
        msgDiv.style.background = "#1f1f26";
        msgDiv.style.color = "#ffffff";
        msgDiv.style.borderBottomLeftRadius = "4px";
        msgDiv.style.border = "1px solid #2d2d35";
    }
    
    msgDiv.innerText = step.text;
    logArea.appendChild(msgDiv);
    logArea.scrollTop = logArea.scrollHeight;
    choiceArea.innerHTML = "";

    if (step.isEnd) {
        const infoDiv = document.createElement("div");
        infoDiv.style.background = "#141419";
        infoDiv.style.color = "#aaa";
        infoDiv.style.padding = "15px";
        infoDiv.style.borderRadius = "8px";
        infoDiv.style.fontSize = "13px";
        infoDiv.style.lineHeight = "1.5";
        infoDiv.style.border = "1px solid #2d2d33";
        infoDiv.style.width = "100%";
        infoDiv.innerHTML = `<strong>現実の少年犯罪・防犯窓口案内</strong><br>
            ・警察相談専用相談窓口：<strong>「#9110」</strong><br>
            ・どんなに脅迫されても、犯罪を実行する前なら警察はあなたを100%保護します。絶対に一人で悩まないでください。`;
        choiceArea.appendChild(infoDiv);

        const btn = document.createElement("button");
        btn.innerText = "闇バイトの解説へ";
        btn.style.padding = "14px";
        btn.style.marginTop = "10px";
        btn.style.width = "100%";
        btn.style.background = "#d9534f";
        btn.style.color = "#fff";
        btn.style.border = "none";
        btn.style.borderRadius = "8px";
        btn.style.cursor = "pointer";
        btn.style.fontWeight = "bold";
        btn.style.fontSize = "14px";
        btn.onclick = () => { window.location.href = "yamibaitokaisetu.html"; };
        choiceArea.appendChild(btn);
    } else {

        step.choices.forEach(c => {
            const btn = document.createElement("button");
            btn.innerText = c.text;
            btn.style.padding = "14px 20px";
            btn.style.width = "100%";
            btn.style.background = "#24242d";
            btn.style.color = "#fff";
            btn.style.border = "1px solid #3d3d45";
            btn.style.textAlign = "left";
            btn.style.cursor = "pointer";
            btn.style.borderRadius = "8px";
            btn.style.fontSize = "13px";
            btn.style.lineHeight = "1.4";
            btn.style.transition = "0.2s";
            
            btn.onmouseover = () => { btn.style.background = "#2d2d38"; btn.style.borderColor = "#52525e"; };
            btn.onmouseout = () => { btn.style.background = "#24242d"; btn.style.borderColor = "#3d3d45"; };
            
            btn.onclick = () => {
                const userMsg = document.createElement('div');
                userMsg.style.alignSelf = "flex-end";
                userMsg.style.background = "#0076ff";
                userMsg.style.color = "#fff";
                userMsg.style.padding = "12px 18px";
                userMsg.style.borderRadius = "16px";
                userMsg.style.borderBottomRightRadius = "4px";
                userMsg.style.fontSize = "14px";
                userMsg.style.maxWidth = "80%";
                userMsg.innerText = c.text;
                
                logArea.appendChild(userMsg);
                logArea.scrollTop = logArea.scrollHeight;
                
                document.getElementById("full-dummy-input").innerText = "送信完了";
                choiceArea.innerHTML = "";
                
                showFullTypingIndicator(() => {
                    document.getElementById("full-dummy-input").innerText = "メッセージを選択してください...";
                    progressSim(c.next);
                });
            };
            choiceArea.appendChild(btn);
        });
    }
}


window.addEventListener("popstate", function (event) {
    const fullChatView = document.getElementById("yami-full-page");
    
    if (fullChatView && !fullChatView.classList.contains("hide-view")) {

        progressSim("reset");
    }
});
