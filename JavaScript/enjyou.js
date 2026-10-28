const userInput = document.getElementById('user-input');
const buttonArea = document.getElementById('button-area');
const postButton = document.getElementById('post-button');
const emptyMessage = document.getElementById('empty-message');
const mainTweet = document.getElementById('main-tweet');
const targetTweetText = document.getElementById('target-tweet-text');
const replyContainer = document.getElementById('reply-container');
const notiCount = document.getElementById('noti-count');

const countReply = document.getElementById('count-reply');
const countRepost = document.getElementById('count-repost');
const countLike = document.getElementById('count-like');

let meterTimer = null;
let replyTimer = null;

const kusoReplies = [
    { name: "通りすがりの匿名", id: "@user_abc", text: "これ本気で言ってるの？流石に引くわ…" },
    { name: "物申すマン", id: "@say_it_man", text: "ネット向いてないから今すぐアカウント消したほうがいいですよ。" },
    { name: "裏垢", id: "@ura_ura_99", text: "これ完全にアウトでしょ。魚拓とりました。" },
    { name: "正義の味方", id: "@justice_3", text: "不快です。言葉を選んで発言してください。" },
    { name: "炎上発見マン", id: "@tokutei_han", text: "こんなこと言っちゃうんだwネットのおもちゃ確定www" },
    { name: "通りすがり", id: "@passerby", text: "日本語読めますか？常識がなさすぎる。" },
    { name: "炎上チェッカー", id: "@flame_check", text: "うわぁ、また香ばしいポストを見つけてしまったな笑" },
    { name: "匿名希望", id: "@tokumei_x", text: "何が面白いと思ってこれ書いたの？親の顔が見てみたい。" },
    { name: "トレンドまとめ速報", id: "@matome_trend", text: "【悲報】SNS民さん、取り返しのつかない大失言で人生終了へｗｗｗｗｗｗ" },
    { name: "辛口批評bot", id: "@spicy_review", text: "こういうこと平気で言えちゃう感性が本当に理解できない。" },
    { name: "マジレスおじさん", id: "@majiresu_ojisan", text: "あなたの発言は社会的に見て非常に軽率であり、猛省すべきです。" },
    { name: "一般人", id: "@ippan_jin_9", text: "うわぁ…関わりたくないから今のうちにブロックしておこ。" },
    { name: "物知り", id: "@info_hunter", text: "過去の投稿も見てみたけど、元からこういう問題発言多い奴だったわ。" },
    { name: "冷笑系", id: "@cool_smile", text: "また注目浴びたくて炎上商法やってるよ。哀れだね。" },
    { name: "通知欄お見舞い", id: "@noti_bomb", text: "おすすめトレンドから来ました。あなたの通知欄、今すごいことになってそう笑" },
    { name: "ネット張り付き", id: "@why_question", text: "何に対してそんなに怒ってるの？見てて本当に不愉快なんだけど。" },
    { name: "煽りアカwwww", id: "@aori_master", text: "はい、デジタルタトゥー決定！一生ネットに残りまーすおめでとう！" },
    { name: "自称サポーター", id: "@fake_friend", text: "私はあなたの味方ですけど、今回の発言だけは流石に擁護できないです…" },
    { name: "スパム風ボット", id: "@crypto_spam_99", text: "FOLLOW ME FOR CRYPTO RICH ONLY TODAY!! 📈🔥" },
    { name: "最後の警告者", id: "@last_warning", text: "もう手遅れだけど、これ以上傷口を広げる前に早く消した方がいいぞ。" }
];

userInput.addEventListener('focus', () => {
    userInput.rows = 3;
    buttonArea.classList.remove('hide');
});

postButton.addEventListener('click', () => {
    const text = userInput.value.trim();

    if (text === "") {
        alert("文章を入力してください！");
        return;
    }

    emptyMessage.classList.add('hide');
    targetTweetText.textContent = text;
    mainTweet.classList.remove('hide');
    replyContainer.classList.remove('hide');

    userInput.value = "";
    userInput.rows = 1;
    buttonArea.classList.add('hide');

    startFlameSimulation();
});

function startFlameSimulation() {

    if (meterTimer !== null) clearInterval(meterTimer);
    if (replyTimer !== null) clearInterval(replyTimer);


    replyContainer.innerHTML = "";

    let replies = 0;
    let reposts = 0;
    let likes = 0;
    let notifications = 0;
    let replyIndex = 0;

    notiCount.classList.remove('hide');

    meterTimer = setInterval(() => {
        replies += Math.floor(Math.random() * 5) + 2;
        reposts += Math.floor(Math.random() * 10) + 4;
        likes += Math.floor(Math.random() * 2);
        notifications += Math.floor(Math.random() * 12) + 5;

        countReply.textContent = replies;
        countRepost.textContent = reposts;
        countLike.textContent = likes;
        notiCount.textContent = notifications;
        if(reposts >= 500 && reposts < 1500) {
            document.body.classList.add("is-warning-shake");
        }

        if (reposts >= 1500) {
            clearInterval(meterTimer);
            clearInterval(replyTimer);

            document.body.classList.add("is-enjo-panic")

            setTimeout(() => {
                window.location.href = './enjyoukaisetu.html'; 
            }, 1000);
        }
    }, 100);

    replyTimer = setInterval(() => {
        
        if (replyIndex >= kusoReplies.length) {
            replyIndex = 0;
        }

        const data = kusoReplies[replyIndex];
        
        const replyBox = document.createElement('div');
        replyBox.className = 'reply-box';
        replyBox.innerHTML = `
            <div class="reply-avatar-area">
                <div class="default-avatar" style="width: 40px; height: 40px; background-color: #e1e8ed; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; user-select: none;">👤</div>
            </div>
            <div class="reply-content-area">
                <div class="reply-user-info">
                    <span class="reply-display-name">${data.name}</span>
                    <span class="reply-user-id">${data.id} ・ 今</span>
                </div>
                <div class="reply-text">${data.text}</div>
            </div>
        `;
        
        replyContainer.prepend(replyBox);
        replyIndex++;
        
    }, 1000); 
}
