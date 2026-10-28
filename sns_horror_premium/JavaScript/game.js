const $ = (id) => document.getElementById(id);
const ui = {
  boot:$('boot'), app:$('app'), world:$('world'), title:$('title-screen'), game:$('game-ui'),
  start:$('start-button'), briefButton:$('brief-button'), brief:$('brief'), objective:$('objective-title'),
  progress:$('progress-fill'), objectiveMeta:$('objective-meta'), clueCount:$('clue-count'),
  waypointHud:$('waypoint-hud'), waypointText:$('waypoint-text'), warningHead:$('warning-head'), warningSub:$('warning-sub'),
  phoneHud:$('phone-hud'), phoneChatList:$('phone-chat-list'), phoneTyping:$('phone-typing'),
  riskValue:$('risk-value'), riskMeter:$('risk-meter'), riskDescription:$('risk-description'),
  staminaValue:$('stamina-value'), staminaMeter:$('stamina-meter'), log:$('live-log'),
  prompt:$('center-prompt'), promptCopy:$('prompt-copy'), warning:$('chase-warning'),
  event:$('event-modal'), eventNumber:$('event-number'), eventIcon:$('event-icon'), eventTitle:$('event-title'),
  eventBody:$('event-body'), eventQuote:$('event-quote'), choices:$('event-choices'),
  pause:$('pause-modal'), resume:$('resume-button'), quit:$('quit-button'),
  policeModal:$('police-modal'), policeContinueBtn:$('police-continue-btn'),
  settings:$('settings-modal'), settingsOpen:$('settings-open'), settingsClose:$('settings-close'),
  soundToggle:$('sound-toggle'), flickerToggle:$('flicker-toggle'), scareToggle:$('scare-toggle'), sensitivity:$('sensitivity'),
  supportTop:$('support-open-top'), supportTitle:$('support-open-title'), supportPause:$('support-open-pause'),
  supportModal:$('support-modal'), supportClose:$('support-close'), scareOverlay:$('scare-overlay'),
  ending:$('ending-screen'), endingStamp:$('ending-stamp'), endingTitle:$('ending-title'),
  endingLead:$('ending-lead'), endingDescription:$('ending-description'), endingClues:$('ending-clues'),
  endingRisk:$('ending-risk'), endingDecisions:$('ending-decisions'), retry:$('retry-button'),
  storyTitle:$('story-title'), storyBody:$('story-body'),
  toast:$('toast'), compassNeedle:$('compass-needle'), distanceLabel:$('distance-label'),
  mobileRun:$('mobile-run'), mobileInteract:$('mobile-interact'), mobileLight:$('mobile-light')
};

let scene, camera, renderer, clock, worldGroup, playerLight, enemy, enemyParts=[], enemyTendrils=[], enemyEyes=[], enemyMouth, enemyHeadGroup, flashlight;
let player = {x:0,y:1.7,z:8,yaw:0,pitch:0,stamina:100};
let state = {mode:'title',risk:18,clues:0,decisions:0,checkpoint:0,chase:false,enemySpeed:2.1,elapsed:0,ending:'',activeEvent:-1,flashlight:true,mouseLocked:false,isCaught:false,isRescued:false,settings:{sound:true,flicker:true,scare:true,sensitivity:4}};
let keys = new Set(), interactables=[], lamps=[], obstacles=[], navWaypoints=[], particles=[], audioCtx=null, droneOsc=null, droneGain=null, lastFootstep=0, lastHeartbeat=0, toastTimer=0;
let enemyTwitchTimer=0, headTwitch={x:0,y:0,z:0};
let policeSirenLight1=null, policeSirenLight2=null, sirenAngle=0;
let phoneTimer=0, phoneMsgStep=0;
const TOTAL_DISTANCE = 104;

const masahiroChatPool = [
  { time: 2, text: '今駅の近くに着いたよ。どこにいるの？' },
  { time: 8, text: 'メッセージ読んでる？ 早く返事してよ' },
  { time: 15, text: 'ねえ、暗いから迎えに行ってあげるって' },
  { time: 22, text: 'もしかして、僕から逃げてる？' },
  { time: 30, text: '足音聞こえるよ。すぐ後ろにいるからね', scary: true },
  { time: 38, text: '待ってって言ってるでしょ！！', scary: true },
  { time: 46, text: '走っても無駄だよ。マサヒロだよ', scary: true },
  { time: 54, text: '見えてるよ。角曲がったよね？', scary: true },
  { time: 62, text: '逃がさない逃がさない逃がさない', scary: true },
  { time: 70, text: 'つかまえた', scary: true }
];

const checkpoints = [
  {z:-16,title:'マサヒロからの通知',icon:'▣',body:'マッチング相手の「マサヒロ」からメッセージが届いた。「近くまで来ているから居場所を教えて」と急かされている。',quote:'マサヒロ「今どこ？ 位置情報を送って。迎えに行くから」',choices:[
    {label:'位置情報は送らず、会う約束を取り消す',tag:'SAFE',delta:-12,speedDelta:-0.4,clue:true,log:'位置情報は送らず約束を取り消した。マサヒロは困惑している。',feedback:'正解！ 現在地は最も危険な個人情報。約束をやめる勇気が自分を守る。'},
    {label:'便利だから、現在地を送信する',tag:'RISK',delta:24,speedDelta:1.1,clue:false,log:'現在地を送ってしまった！ マサヒロが速度を上げて走ってくる！',feedback:'危険！ 相手に居場所が特定された。マサヒロが急接近している！'},
    {label:'友人にメッセージを見せて相談する',tag:'SAFE',delta:-8,speedDelta:-0.3,clue:true,log:'友人に相談した。相手の要求を客観的に見直せた。',feedback:'正解！ 違和感を覚えたら、信頼できる人に相談するのが鉄則。'}
  ]},
  {z:-43,title:'自撮り写真を要求された',icon:'▧',body:'マサヒロはあなたの顔と制服が写った写真を要求してきた。断ると「信用していないの？ ひどいな」と責め立ててくる。',quote:'マサヒロ「写真くらい送れるでしょ。誰にも見せないからさ」',choices:[
    {label:'キッパリ断り、これ以上の要求には応じない',tag:'SAFE',delta:-10,speedDelta:-0.4,clue:true,log:'写真の要求を断った。マサヒロの足を鈍らせた。',feedback:'正解！ 写真から学校や生活圏が特定される。相手の機嫌を取る必要はない。'},
    {label:'制服が少し写る程度にして送る',tag:'RISK',delta:18,speedDelta:1.2,clue:false,log:'写真を送ってしまった！ マサヒロが執着を強めて速度アップ！',feedback:'危険！ 画像データや背景の看板などから個人情報が特定される！'},
    {label:'会話画面をスクショ保存し、警察・大人へ相談',tag:'SAFE',delta:-8,speedDelta:-0.3,clue:true,log:'証拠を保存した。脅迫やトラブル時の強力な武器になる。',feedback:'正解！ スクリーンショットは通報や相談時の確実な証拠になる。'}
  ]},
  {z:-70,title:'「裏道にひとりで来て」と強要された',icon:'⚑',body:'待ち合わせ場所が街灯の少ない真っ暗な裏道に変更された。マサヒロは「誰にも言わないで」と激しく怒鳴るようなメッセージを連投している。',quote:'マサヒロ「明るい場所は嫌だ。裏道に来て！ 友達や親には絶対秘密だぞ！」',choices:[
    {label:'裏道を拒絶し、全力で【交番】へ向かう',tag:'SAFE',delta:-16,speedDelta:-0.5,clue:true,log:'裏道へ行くのを拒絶し、交番を目指した！',feedback:'最善の判断！ 密室や裏道は犯罪の温床。明るい公共の場所へ逃げろ！'},
    {label:'怒らせるのが怖くて、裏道へ進んでしまう',tag:'DANGER',delta:35,speedDelta:1.8,clue:false,log:'裏道へ進んでしまった！ マサヒロが猛スピードで追いついてくる！',feedback:'最悪の選択！ 人目のない場所へ行くのは命に関わる危険！ マサヒロが猛追！'},
    {label:'周囲の店や通行人に助けを求める',tag:'SAFE',delta:-12,speedDelta:-0.4,clue:true,log:'周囲に助けを求めた。マサヒロは警戒して近づけない。',feedback:'正解！ 危険を感じたら約束より命を最優先。周囲を巻き込んで身を守ろう。'}
  ]}
];

function init(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070d18);
  scene.fog = new THREE.FogExp2(0x08101b,0.018);
  camera = new THREE.PerspectiveCamera(74,innerWidth/innerHeight,.1,220);
  camera.position.set(0,player.y,player.z);
  renderer = new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.setSize(innerWidth,innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.setAttribute('aria-label','3Dの夜道を歩くゲーム画面');
  renderer.domElement.style.touchAction='none';
  ui.world.appendChild(renderer.domElement);
  clock = new THREE.Clock();
  worldGroup = new THREE.Group(); scene.add(worldGroup);
  createEnvironment(); createPlayerLight(); createEnemy(); createInteractables(); createStars();
  bindEvents();
  $('boot').classList.add('is-hidden'); $('app').classList.remove('is-hidden');
  renderer.setAnimationLoop(animate);
}
function mat(color,roughness=.8,metalness=0,emissive=0,emissiveIntensity=0){return new THREE.MeshStandardMaterial({color,roughness,metalness,emissive,emissiveIntensity});}
function box(parent,x,y,z,sx,sy,sz,material,cast=false,receive=true){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);mesh.position.set(x,y,z);mesh.castShadow=cast;mesh.receiveShadow=receive;parent.add(mesh);return mesh;
}
function createEnvironment(){
  const hemi=new THREE.HemisphereLight(0x7e9bbd,0x080b10,1.0);scene.add(hemi);
  const moon=new THREE.DirectionalLight(0x7b9dbd,1.25);moon.position.set(-16,26,14);moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);moon.shadow.camera.left=-28;moon.shadow.camera.right=28;moon.shadow.camera.top=35;moon.shadow.camera.bottom=-35;scene.add(moon);
  const ground=mat(0x101821,.96),road=mat(0x171d25,.95),sidewalk=mat(0x303b45,.9);
  box(worldGroup,0,-.18,-47,150,.35,130,ground);
  box(worldGroup,0,-.02,-47,8,.12,130,road);
  box(worldGroup,-5.1,.02,-47,2.2,.18,130,sidewalk);
  box(worldGroup,5.1,.02,-47,2.2,.18,130,sidewalk);

  // Center road lines
  for(let z=14;z>-112;z-=10){
    box(worldGroup,0,.045,z,.09,.025,3.8,mat(0x75808b,.9,0,0x2a3b48,.1));
  }

  // --- 1. Distinct Building Outlines & Cityscape ---
  for(const side of [-1,1]){
    for(let z=16;z>-113;z-=11+Math.random()*3){
      const width=5+Math.random()*3,depth=6+Math.random()*6,height=8+Math.random()*14;
      const x=side*(7.2+width/2);
      const buildingMat=mat([0x0e1724,0x141f2e,0x1b2838,0x101a26][Math.floor(Math.random()*4)],.85,.1);
      const building=box(worldGroup,x,height/2-.05,z,width,height,depth,buildingMat,true);
      box(worldGroup,x,height+.02,z,width+.08,.14,depth+.08,mat(0x22364a),false);

      // Sharp visible outline edges for high contrast
      const wireGeo=new THREE.EdgesGeometry(building.geometry);
      const wireMat=new THREE.LineBasicMaterial({color:0x2c5c82,linewidth:1});
      const wire=new THREE.LineSegments(wireGeo,wireMat);
      building.add(wire);

      // Lit windows
      const rows=Math.max(2,Math.floor(height/2.5));
      for(let row=0;row<rows;row++){
        for(let col=0;col<Math.floor(width/1.35);col++){
          if(Math.random()<.25) continue;
          const wx=x-side*(width/2-.35)-side*col*1.05;
          const wy=1.3+row*2.1;
          if(wy>height-.6)continue;
          const isWarm=Math.random()<.25;
          const windowMat=mat(isWarm?0xb2eef8:0x203548,.3,.1,isWarm?0x52cce6:0x0,isWarm?.75:0);
          box(worldGroup,wx,wy,z+depth/2+.015,.48,.72,.035,windowMat);
        }
      }
      // Shop signs with bright neon
      if(z<2&&z>-80&&Math.random()<.55){
        const signColor=side===1?0x1ad9cc:0xff3366;
        const signMat=mat(0x111111,.4,.15,signColor,1.8);
        box(worldGroup,side*5.85,2.8,z,.12,.5,2.4,signMat);
      }
    }
    // Curb edges and trees
    box(worldGroup,side*6.25,.15,-47,.12,.3,130,mat(0x66747e),false);
    for(let z=8;z>-108;z-=5.5){
      if(Math.random()<.28)continue;
      const treeGroup=new THREE.Group();treeGroup.position.set(side*(6.4+Math.random()*.8),0,z);worldGroup.add(treeGroup);
      const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,1.7,6),mat(0x292b30));trunk.position.y=.85;treeGroup.add(trunk);
      const leaves=new THREE.Mesh(new THREE.IcosahedronGeometry(.8+Math.random()*.45,1),mat(0x111e24));leaves.position.y=2.0;leaves.scale.y=1.3;treeGroup.add(leaves);
    }
  }

  // --- 2. Nav Waypoints (Glowing road guidance line to Koban) ---
  navWaypoints=[];
  for(let z=10;z>-96;z-=4.8){
    const wpGroup=new THREE.Group();wpGroup.position.set(0,0.04,z);worldGroup.add(wpGroup);
    const arrowMat=new THREE.MeshBasicMaterial({color:0x4deeff,transparent:true,opacity:0.65});
    const chevronL=box(wpGroup,-.32,0,.14,.09,.02,.45,arrowMat);chevronL.rotation.y=-Math.PI/4;
    const chevronR=box(wpGroup,.32,0,.14,.09,.02,.45,arrowMat);chevronR.rotation.y=Math.PI/4;
    const dot=box(wpGroup,0,0,-.12,.08,.02,.18,arrowMat);
    navWaypoints.push({group:wpGroup,baseZ:z,arrowMat});
  }

  // --- 3. Obstacles (Cones, barriers, boxes, bicycles) ---
  obstacles=[];
  const obsDefs=[
    {type:'cones',z:-8,x:-1.4},
    {type:'barrier',z:-22,x:1.8},
    {type:'boxes',z:-35,x:-0.8},
    {type:'bicycle',z:-50,x:1.5},
    {type:'cones',z:-64,x:-1.8},
    {type:'barrier',z:-76,x:0.5},
    {type:'boxes',z:-88,x:-1.5}
  ];
  const coneMat=new THREE.MeshStandardMaterial({color:0xff3300,roughness:.5,emissive:0xff2200,emissiveIntensity:.4});
  const barMat=new THREE.MeshStandardMaterial({color:0xddcc00,roughness:.6});
  const boxMat=mat(0x6b4c30,.9);

  obsDefs.forEach(o=>{
    const g=new THREE.Group();g.position.set(o.x,0,o.z);worldGroup.add(g);
    if(o.type==='cones'){
      for(let i=-1;i<=1;i++){
        const cone=new THREE.Mesh(new THREE.ConeGeometry(.2,.65,8),coneMat);cone.position.set(i*.42,.32,0);cone.castShadow=true;g.add(cone);
        const base=new THREE.Mesh(new THREE.BoxGeometry(.35,.05,.35),coneMat);base.position.set(i*.42,.025,0);g.add(base);
      }
      obstacles.push({x:o.x,z:o.z,radius:1.1,name:'カラーコーン'});
    }else if(o.type==='barrier'){
      box(g,0,.5,0,1.8,.12,.12,barMat,true);
      box(g,-.8,.25,0,.1,.5,.6,mat(0x222222));box(g,.8,.25,0,.1,.5,.6,mat(0x222222));
      obstacles.push({x:o.x,z:o.z,radius:1.2,name:'工事用バリケード'});
    }else if(o.type==='boxes'){
      box(g,-.2,.3,0,.65,.6,.65,boxMat,true);box(g,.3,.25,.1,.5,.5,.5,boxMat,true);box(g,-.1,.75,0,.45,.4,.45,boxMat,true);
      obstacles.push({x:o.x,z:o.z,radius:1.1,name:'放置段ボール'});
    }else if(o.type==='bicycle'){
      box(g,0,.45,0,.15,.7,1.4,mat(0x2a3d54,.5,.5),true);
      const w1=new THREE.Mesh(new THREE.TorusGeometry(.28,.04,6,14),mat(0x111111));w1.position.set(0,.3,-.5);g.add(w1);
      const w2=new THREE.Mesh(new THREE.TorusGeometry(.28,.04,6,14),mat(0x111111));w2.position.set(0,.3,.5);g.add(w2);
      obstacles.push({x:o.x,z:o.z,radius:1.0,name:'放置自転車'});
    }
  });

  // Street lights
  for(let z=9,side=-1;z>-108;z-=15,side*=-1){
    const poleGroup=new THREE.Group();poleGroup.position.set(side*5.65,0,z);worldGroup.add(poleGroup);
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.055,.085,5.2,7),mat(0x59636c,.65,.55));pole.position.y=2.6;poleGroup.add(pole);
    const arm=box(poleGroup,side*.42,5.05,0,.9,.07,.07,mat(0x59636c,.65,.5));arm.position.x=side*.35;
    const bulb=new THREE.Mesh(new THREE.BoxGeometry(.38,.12,.32),mat(0xb9efff,.25,.05,0x84dfff,2.8));bulb.position.set(side*.72,4.95,0);poleGroup.add(bulb);
    const light=new THREE.PointLight(0x8adfff,5.0,13,2);light.position.set(side*.72,4.7,0);light.castShadow=false;scene.add(light);lamps.push({light,base:5.0,phase:Math.random()*6.28});
  }

  // --- 4. Authentic Japanese Police Station (交番 / KOBAN) Goal ---
  const koban=new THREE.Group();koban.position.set(0,0,-101);worldGroup.add(koban);
  // Main building (White & navy blue police architecture)
  box(koban,0,2.8,0,12,5.6,6.5,mat(0xdbe9f4,.55,.1),true);
  box(koban,0,.45,.08,12.2,.9,6.7,mat(0x142b47,.6,.3)); // lower navy band
  box(koban,0,5.35,.08,12.2,.45,6.7,mat(0x142b47,.6,.3)); // roof navy trim

  // Large bright entrance doors with reassuring warm interior light
  box(koban,0,1.8,3.28,4.4,3.6,.1,mat(0x9fefff,.1,.2,0xfff0aa,1.1));
  const indoorLight=new THREE.PointLight(0xfff1ba,9,18);indoorLight.position.set(0,2.6,1.4);koban.add(indoorLight);

  // Luminous "交番 / POLICE" signboard
  const signMat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x33bbee,emissiveIntensity:3.2,roughness:.2});
  box(koban,0,4.25,3.34,5.8,.95,.18,signMat);

  // Rotating Red & Blue Police Siren Beacons (パトランプ) on roof
  for(const sx of [-2.4,2.4]){
    box(koban,sx,5.75,2.4,.5,.25,.5,mat(0x222222,.5));
    const sirenCap=new THREE.Mesh(new THREE.CylinderGeometry(.22,.26,.45,12),new THREE.MeshStandardMaterial({color:0xff0020,emissive:0xff0025,emissiveIntensity:4.2}));
    sirenCap.position.set(sx,6.08,2.4);koban.add(sirenCap);
  }
  policeSirenLight1=new THREE.SpotLight(0xff0022,18,35,Math.PI/3,.38);
  policeSirenLight1.position.set(-2.4,6.2,2.4);koban.add(policeSirenLight1);koban.add(policeSirenLight1.target);

  policeSirenLight2=new THREE.SpotLight(0x0066ff,12,32,Math.PI/3,.38);
  policeSirenLight2.position.set(2.4,6.2,2.4);koban.add(policeSirenLight2);koban.add(policeSirenLight2.target);

  // Parked Police Car (白黒パトカー)
  const patrolCar=new THREE.Group();patrolCar.position.set(3.8,.45,2.8);koban.add(patrolCar);
  box(patrolCar,0,.3,0,1.8,.6,3.6,mat(0x0a0c10,.4,.2),true);
  box(patrolCar,0,.85,-.2,1.45,.52,2.0,mat(0xffffff,.3,.1),true);
  box(patrolCar,0,1.18,-.2,.6,.16,.24,mat(0xff0025,.1,0,0xff0022,3.5));
  for(const wx of [-.72,.72])for(const wz of [-1.05,1.05]){
    const w=new THREE.Mesh(new THREE.CylinderGeometry(.26,.26,.14,10),mat(0x080a0d,.9));w.rotation.z=Math.PI/2;w.position.set(wx,.05,wz);patrolCar.add(w);
  }
}
function createStars(){
  const count=420,positions=new Float32Array(count*3);
  for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*150;positions[i*3+1]=8+Math.random()*45;positions[i*3+2]=-35-Math.random()*100;}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const points=new THREE.Points(geo,new THREE.PointsMaterial({color:0x9cb9cf,size:.11,transparent:true,opacity:.48}));scene.add(points);
}
function createPlayerLight(){
  flashlight=new THREE.SpotLight(0xb8e9ff,22,34,Math.PI/7,.38,1.25);
  flashlight.position.set(0,0,0);flashlight.target.position.set(0,0,-1);camera.add(flashlight);camera.add(flashlight.target);
  flashlight.visible=true;playerLight=new THREE.PointLight(0x4f8bba,.22,4);camera.add(playerLight);scene.add(camera);
}
function createEnemy(){
  enemy=new THREE.Group();scene.add(enemy);enemy.position.set(.45,0,16);
  enemyParts=[];enemyTendrils=[];enemyEyes=[];
  const cloak=mat(0x05070a,.98,0,0x000000,0),hoodMat=mat(0x0a0e14,.96),skinMat=mat(0x08090d,.95);
  const eyeMat=new THREE.MeshStandardMaterial({color:0xff0025,emissive:0xff0020,emissiveIntensity:5.5,roughness:.1,metalness:.2});
  const mouthMat=new THREE.MeshStandardMaterial({color:0x990015,emissive:0xbb0020,emissiveIntensity:3.2,roughness:.3});
  const clawMat=mat(0x020305,.9,0x111111,.1);

  // Elongated tall torso (height ~2.4m tall presence)
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.38,1.25,4,8),cloak);
  torso.position.y=1.42;torso.scale.set(1,1.05,.72);torso.castShadow=true;enemy.add(torso);enemyParts.push(torso);

  // Head group that can twitch and cock erratically
  enemyHeadGroup=new THREE.Group();enemyHeadGroup.position.set(0,2.35,0);enemy.add(enemyHeadGroup);

  // Neck
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,.28,6),skinMat);neck.position.y=-.14;enemyHeadGroup.add(neck);

  // Hood & Head
  const hood=new THREE.Mesh(new THREE.SphereGeometry(.36,12,10),hoodMat);hood.position.set(0,.08,.02);hood.scale.set(.95,1.08,1.02);hood.castShadow=true;enemyHeadGroup.add(hood);
  const hoodInner=new THREE.Mesh(new THREE.SphereGeometry(.31,10,8),mat(0x020305,1));hoodInner.position.set(0,.07,-.06);enemyHeadGroup.add(hoodInner);

  // Four glowing asymmetrical red eyes deep inside the dark hood
  const eyeConfigs=[
    {x:-.12,y:.12,z:-.25,s:.042},
    {x:.13, y:.14,z:-.25,s:.038},
    {x:-.06,y:-.02,z:-.26,s:.032},
    {x:.15, y:-.01,z:-.25,s:.035}
  ];
  eyeConfigs.forEach(cfg=>{
    const eye=new THREE.Mesh(new THREE.SphereGeometry(cfg.s,8,6),eyeMat);
    eye.position.set(cfg.x,cfg.y,cfg.z);enemyHeadGroup.add(eye);enemyEyes.push(eye);
  });

  // Jagged slit mouth
  enemyMouth=new THREE.Mesh(new THREE.BoxGeometry(.24,.03,.04),mouthMat);
  enemyMouth.position.set(.02,-.14,-.25);enemyMouth.rotation.z=.08;enemyHeadGroup.add(enemyMouth);

  // Faint ominous red aura light on the face
  const faceLight=new THREE.PointLight(0xff0522,1.8,4.5);
  faceLight.position.set(0,2.3,-.4);enemy.add(faceLight);

  // Distorted elongated arms with sharp claws
  for(const side of [-1,1]){
    const armGroup=new THREE.Group();armGroup.position.set(side*.46,1.85,0);enemy.add(armGroup);
    const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.11,1.05,4,8),cloak);
    arm.position.set(0,-.52,0);arm.rotation.z=side*-.12;arm.castShadow=true;armGroup.add(arm);enemyParts.push(armGroup);
    // Sharp tapered fingers / claws
    for(let f=-1;f<=1;f++){
      const claw=new THREE.Mesh(new THREE.ConeGeometry(.022,.22,4),clawMat);
      claw.position.set(side*.04+f*.035,-1.15,-.02);claw.rotation.x=Math.PI;claw.rotation.z=f*.18;armGroup.add(claw);
    }
    // Long legs
    const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.14,.85,4,7),cloak);
    leg.position.set(side*.22,.48,0);leg.castShadow=true;enemy.add(leg);enemyParts.push(leg);
  }

  // Wriggling shadow tendrils emerging from back
  for(let i=0;i<4;i++){
    const side=i%2===0?-1:1;
    const tendril=new THREE.Mesh(new THREE.CylinderGeometry(.03,.07,1.1,5),mat(0x030407,.98));
    tendril.position.set(side*(.22+(i>1?.12:0)),1.45+.15*(i%2),.28);
    tendril.rotation.x=.7+(i*.2);tendril.rotation.z=side*(.4+(i*.18));
    enemy.add(tendril);enemyTendrils.push(tendril);
  }

  // Double shadow with dark ominous pulsating ring
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(.95,24),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.65}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=.02;enemy.add(shadow);
  const outerAura=new THREE.Mesh(new THREE.RingGeometry(.9,1.5,24),new THREE.MeshBasicMaterial({color:0x150005,transparent:true,opacity:.3,side:THREE.DoubleSide}));
  outerAura.rotation.x=-Math.PI/2;outerAura.position.y=.025;enemy.add(outerAura);
}
function createInteractables(){
  checkpoints.forEach((cp,i)=>{
    const g=new THREE.Group();g.position.set(i===1?1.7:-1.4,.08,cp.z);scene.add(g);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.7,.035,8,28),new THREE.MeshStandardMaterial({color:0x78e8e8,emissive:0x32c9d4,emissiveIntensity:1.7,metalness:.25,roughness:.3}));ring.rotation.x=Math.PI/2;ring.position.y=.12;g.add(ring);
    const post=new THREE.Mesh(new THREE.CylinderGeometry(.05,.09,.5,8),mat(0x425563,.55,.25));post.position.y=.25;g.add(post);
    const orb=new THREE.Mesh(new THREE.OctahedronGeometry(.2,0),new THREE.MeshStandardMaterial({color:0xa3f9f2,emissive:0x54d8df,emissiveIntensity:2}));orb.position.y=.85;g.add(orb);
    const light=new THREE.PointLight(0x47dbe0,1.2,5);light.position.y=1.1;g.add(light);
    interactables.push({group:g,ring,orb,light,checkpoint:i,used:false});
  });
}
function bindEvents(){
  ui.start.addEventListener('click', startGame);
  ui.briefButton?.addEventListener('click', () => {
    ui.brief.classList.toggle('hidden');
  });
  ui.resume.addEventListener('click', resumeGame);
  ui.quit.addEventListener('click', returnToTitle);
  ui.retry.addEventListener('click', returnToTitle);
  if(ui.policeContinueBtn){
    ui.policeContinueBtn.addEventListener('click', () => {
      ui.policeModal.classList.add('hidden');
      finishGame('win');
    });
  }

  ui.settingsOpen.addEventListener('click', () => {
    if(state.mode==='playing') pauseGame();
    ui.settings.classList.remove('hidden');
  });
  ui.settingsClose.addEventListener('click', () => {
    ui.settings.classList.add('hidden');
    readSettings();
  });
  [ui.soundToggle, ui.flickerToggle, ui.scareToggle, ui.sensitivity].forEach(el => {
    if(el) el.addEventListener('change', readSettings);
    if(el) el.addEventListener('input', readSettings);
  });

  const openSupport = () => {
    if(state.mode==='playing') pauseGame();
    if(document.pointerLockElement) document.exitPointerLock();
    ui.supportModal.classList.remove('hidden');
  };
  const closeSupport = () => {
    ui.supportModal.classList.add('hidden');
  };
  ui.supportTop?.addEventListener('click', openSupport);
  ui.supportTitle?.addEventListener('click', openSupport);
  ui.supportPause?.addEventListener('click', openSupport);
  ui.supportClose?.addEventListener('click', closeSupport);

  ui.mobileRun?.addEventListener('touchstart', e => { e.preventDefault(); keys.add('Shift'); }, {passive:false});
  ui.mobileRun?.addEventListener('touchend', () => keys.delete('Shift'));
  ui.mobileInteract?.addEventListener('click', interact);
  ui.mobileLight?.addEventListener('click', toggleFlashlight);
  document.querySelectorAll('[data-move]').forEach(btn => {
    const map = {forward:'KeyW', back:'KeyS', left:'KeyA', right:'KeyD'};
    const down = e => { e.preventDefault(); keys.add(map[btn.dataset.move]); };
    const up = e => { e.preventDefault(); keys.delete(map[btn.dataset.move]); };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointerleave', up);
    btn.addEventListener('pointercancel', up);
  });

  window.addEventListener('keydown', e => {
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
    if(e.repeat) return;
    if(e.code==='Escape'){
      if(state.mode==='playing') pauseGame();
      else if(state.mode==='paused') resumeGame();
      return;
    }
    if(e.code==='KeyE'){ interact(); return; }
    if(e.code==='KeyF'){ toggleFlashlight(); return; }
    if(state.mode==='playing') keys.add(e.code);
  });
  window.addEventListener('keyup', e => keys.delete(e.code));

  renderer.domElement.addEventListener('click', () => {
    if(state.mode==='playing' && matchMedia('(pointer:fine)').matches && document.pointerLockElement !== renderer.domElement){
      renderer.domElement.requestPointerLock?.();
    }
  });
  document.addEventListener('pointerlockchange', () => {
    state.mouseLocked = document.pointerLockElement === renderer.domElement;
  });
  document.addEventListener('mousemove', e => {
    if(state.mode!=='playing' || !state.mouseLocked || state.isCaught || state.isRescued) return;
    const sens = state.settings.sensitivity * 0.00065;
    player.yaw -= e.movementX * sens;
    player.pitch -= e.movementY * sens;
    player.pitch = THREE.MathUtils.clamp(player.pitch, -0.65, 0.65);
  });

  let touchLook = null;
  renderer.domElement.addEventListener('touchstart', e => {
    if(state.mode!=='playing' || e.touches.length!==1 || state.isCaught || state.isRescued) return;
    touchLook = {x: e.touches[0].clientX, y: e.touches[0].clientY};
  }, {passive:true});
  renderer.domElement.addEventListener('touchmove', e => {
    if(state.mode!=='playing' || !touchLook || e.touches.length!==1 || state.isCaught || state.isRescued) return;
    e.preventDefault();
    const t = e.touches[0], dx = t.clientX - touchLook.x, dy = t.clientY - touchLook.y;
    const sens = state.settings.sensitivity * 0.0011;
    player.yaw -= dx * sens;
    player.pitch = THREE.MathUtils.clamp(player.pitch - dy * sens, -0.65, 0.65);
    touchLook = {x: t.clientX, y: t.clientY};
  }, {passive:false});
  renderer.domElement.addEventListener('touchend', () => touchLook = null, {passive:true});

  window.addEventListener('resize', onResize);
}

function readSettings(){
  if(ui.soundToggle) state.settings.sound = ui.soundToggle.checked;
  if(ui.scareToggle) state.settings.scare = ui.scareToggle.checked;
  if(ui.flickerToggle) state.settings.flicker = ui.flickerToggle.checked;
  if(ui.sensitivity) state.settings.sensitivity = Number(ui.sensitivity.value) || 4;
  syncAudio();
}

function startGame(){
  if(state.mode==='title') resetGame(false);
  state.mode = 'playing';
  ui.title.classList.add('hidden');
  ui.ending.classList.add('hidden');
  ui.game.classList.remove('hidden');
  if(!audioCtx){
    try{ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){}
  }
  syncAudio();
  if(audioCtx?.state==='suspended') audioCtx.resume();
  ui.log.textContent = 'スマートフォンにメッセージが届いています。画面右下を確認してください。';
  if(matchMedia('(pointer:fine)').matches) renderer.domElement.requestPointerLock?.();
  toast('前方の光るリングへ進んでください。気になる痕跡は [E] キーで調べられます。');
  
  // マサヒロからの初期メッセージ
  setTimeout(() => {
    receivePhoneMessage('マサヒロ「駅に着いたよ？ 今どこ？ 迎えに行くよ」', false);
  }, 1200);
}

function resetGame(toTitle=true){
  state.risk = 18;
  state.clues = 0;
  state.decisions = 0;
  state.checkpoint = 0;
  state.chase = false;
  state.enemySpeed = 2.1;
  state.elapsed = 0;
  state.ending = '';
  state.activeEvent = -1;
  state.flashlight = true;
  state.isCaught = false;
  state.isRescued = false;
  phoneTimer = 0;
  phoneMsgStep = 0;

  player = {x:0, y:1.7, z:8, yaw:0, pitch:0, stamina:100};
  keys.clear();
  enemy.position.set(0.45, 0, 16);
  enemy.rotation.set(0, 0, 0);
  enemy.visible = true;
  if(enemyHeadGroup) enemyHeadGroup.rotation.set(0, 0, 0);

  interactables.forEach(o => { o.used = false; o.group.visible = true; });

  ui.scareOverlay.classList.add('hidden');
  document.body.classList.remove('horror-shake');
  ui.riskValue.textContent = '18%';
  ui.riskMeter.style.width = '18%';
  ui.staminaMeter.style.width = '100%';
  ui.staminaValue.textContent = '100%';
  ui.clueCount.textContent = '手がかり 0 / 3';
  ui.objective.textContent = '交番（警察署）へ避難せよ';
  ui.progress.style.width = '0%';
  ui.objectiveMeta.textContent = '交番まで / 106 m';
  ui.warning.classList.add('hidden');
  ui.prompt.classList.add('hidden');
  ui.event.classList.add('hidden');
  ui.pause.classList.add('hidden');
  ui.settings.classList.add('hidden');
  ui.supportModal.classList.add('hidden');
  if(ui.policeModal) ui.policeModal.classList.add('hidden');

  // スマホチャット欄リセット
  if(ui.phoneChatList){
    ui.phoneChatList.innerHTML = '<div class="chat-bubble chat-system">新着メッセージを受信中...</div>';
  }

  if(toTitle){
    state.mode = 'title';
    ui.title.classList.remove('hidden');
    ui.game.classList.add('hidden');
    ui.ending.classList.add('hidden');
  }
}

function pauseGame(){
  if(state.mode!=='playing') return;
  state.mode = 'paused';
  keys.clear();
  ui.pause.classList.remove('hidden');
  if(document.pointerLockElement) document.exitPointerLock();
}

function resumeGame(){
  ui.pause.classList.add('hidden');
  ui.settings.classList.add('hidden');
  if(state.mode==='paused') state.mode = 'playing';
  if(matchMedia('(pointer:fine)').matches) renderer.domElement.requestPointerLock?.();
}

function returnToTitle(){
  resetGame(true);
}

function toggleFlashlight(){
  if(state.mode!=='playing') return;
  state.flashlight = !state.flashlight;
  flashlight.visible = state.flashlight;
  toast(state.flashlight ? 'ライト点灯' : 'ライト消灯');
  beep(state.flashlight ? 520 : 240, 0.07, 0.035);
}

function interact(){
  if(state.mode!=='playing' || !ui.event.classList.contains('hidden')) return;
  const target = interactables.find(o => !o.used && Math.hypot(player.x - o.group.position.x, player.z - o.group.position.z) < 3.2);
  if(target){
    openEvent(target.checkpoint);
    return;
  }
  toast('近くに調べるものはありません。');
}

function openEvent(index){
  if(index < state.checkpoint || index >= checkpoints.length) return;
  const cp = checkpoints[index];
  state.activeEvent = index;
  state.mode = 'event';
  keys.clear();
  if(document.pointerLockElement) document.exitPointerLock();

  ui.eventNumber.textContent = `0${index + 1} / 03`;
  ui.eventIcon.textContent = cp.icon;
  ui.eventTitle.textContent = cp.title;
  ui.eventBody.textContent = cp.body;
  ui.eventQuote.textContent = cp.quote;
  ui.choices.innerHTML = '';

  cp.choices.forEach((choice, i) => {
    const b = document.createElement('button');
    b.className = 'choice-button' + (choice.tag==='RISK' ? ' risk-button' : '');
    const label = document.createElement('span');
    label.className = 'choice-label';
    label.textContent = choice.label;
    const tag = document.createElement('small');
    tag.className = 'choice-tag ' + choice.tag.toLowerCase();
    tag.textContent = choice.tag;
    b.append(label, tag);
    b.addEventListener('click', () => choose(index, i));
    ui.choices.appendChild(b);
  });

  ui.event.classList.remove('hidden');
  beep(640, 0.12, 0.045);
}

function choose(index, choiceIndex){
  const cp = checkpoints[index];
  const choice = cp.choices[choiceIndex];
  const obj = interactables.find(o => o.checkpoint === index);

  state.risk = THREE.MathUtils.clamp(state.risk + choice.delta, 0, 100);
  state.decisions++;
  if(choice.clue) state.clues++;
  if(obj){ obj.used = true; obj.group.visible = false; }

  // 敵の足の速さ変更（加速システム）
  if(choice.speedDelta){
    state.enemySpeed = THREE.MathUtils.clamp(state.enemySpeed + choice.speedDelta, 1.8, 6.2);
    if(choice.speedDelta > 0){
      toast(`⚠️ 判断を誤った！ マサヒロの追跡速度が急上昇した！ (+${(choice.speedDelta*10).toFixed(0)})`);
      receivePhoneMessage('マサヒロ「そっちに行ったんだね…すぐ追いつくよ」', true);
    }else{
      toast('🛡️ 賢明な判断！ マサヒロを警戒させ距離を稼いだ！');
      receivePhoneMessage('マサヒロ「あれ…どこ行ったの？ 見失った…」', false);
    }
  }

  state.checkpoint = Math.max(state.checkpoint, index + 1);
  state.mode = 'playing';
  ui.event.classList.add('hidden');
  ui.log.textContent = choice.log;
  toast(choice.feedback);

  if(state.risk >= 40 || index >= 1) startChase();
  updateHud();

  if(matchMedia('(pointer:fine)').matches) renderer.domElement.requestPointerLock?.();
  beep(choice.delta > 0 ? 180 : 720, 0.18, 0.04);
}

function receivePhoneMessage(text, isScary = false){
  if(!ui.phoneChatList) return;
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble' + (isScary ? ' scary' : '');
  bubble.textContent = text;
  ui.phoneChatList.appendChild(bubble);

  // バイブレーション音・アニメーション
  playPhoneVibe();
  if(ui.phoneHud){
    ui.phoneHud.classList.remove('phone-vibe');
    void ui.phoneHud.offsetWidth;
    ui.phoneHud.classList.add('phone-vibe');
    setTimeout(() => {
      ui.phoneHud.classList.remove('phone-vibe');
    }, 450);
  }

  // スクロール最下部へ
  ui.phoneChatList.scrollTop = ui.phoneChatList.scrollHeight;
}

function updateHud(){
  const risk = Math.round(state.risk);
  ui.riskValue.textContent = `${risk}%`;
  ui.riskMeter.style.width = `${risk}%`;
  ui.riskMeter.style.background = risk > 65 ? '#ff4059' : risk > 35 ? '#ff9c58' : '#82e5e7';
  ui.riskValue.style.color = risk > 65 ? '#ff5368' : risk > 35 ? '#ffc879' : '#82e5e7';
  ui.riskDescription.textContent = risk > 65 ? '極めて危険な兆候。即座に逃げて！' : risk > 35 ? '怪しい言動に注意。個人情報を守れ' : '安全な判断を維持中。交番へ向かえ';
  ui.clueCount.textContent = `手がかり ${state.clues} / 3`;
}

function updatePlayer(dt){
  if(state.isCaught || state.isRescued) return;
  let forward = 0, side = 0;
  if(keys.has('KeyW') || keys.has('ArrowUp')) forward += 1;
  if(keys.has('KeyS') || keys.has('ArrowDown')) forward -= 1;
  if(keys.has('KeyA')) side -= 1;
  if(keys.has('KeyD')) side += 1;
  if(keys.has('ArrowLeft')) player.yaw += dt * 1.65;
  if(keys.has('ArrowRight')) player.yaw -= dt * 1.65;

  const moving = forward !== 0 || side !== 0;
  const sprint = (keys.has('ShiftLeft') || keys.has('ShiftRight') || keys.has('Shift')) && player.stamina > 1 && moving;
  let speed = sprint ? 7.2 : 4.0;

  if(sprint) player.stamina = Math.max(0, player.stamina - 25 * dt);
  else player.stamina = Math.min(100, player.stamina + 14 * dt);

  if(moving){
    const len = Math.hypot(forward, side) || 1;
    forward /= len;
    side /= len;
    let nextX = player.x + (-Math.sin(player.yaw) * forward + Math.cos(player.yaw) * side) * speed * dt;
    let nextZ = player.z + (-Math.cos(player.yaw) * forward - Math.sin(player.yaw) * side) * speed * dt;

    // 障害物との当たり判定
    for(const obs of obstacles){
      const dist = Math.hypot(nextX - obs.x, nextZ - obs.z);
      if(dist < obs.radius){
        // 衝突！ 押し戻され、減速
        const pushAngle = Math.atan2(nextZ - obs.z, nextX - obs.x);
        nextX = obs.x + Math.cos(pushAngle) * obs.radius;
        nextZ = obs.z + Math.sin(pushAngle) * obs.radius;
        player.stamina = Math.max(0, player.stamina - 8 * dt);
        if(performance.now() - lastFootstep > 400){
          toast(`🚧 ${obs.name}に衝突！足を取られた！`);
          beep(75, 0.08, 0.04, 'sawtooth');
        }
      }
    }

    player.x = THREE.MathUtils.clamp(nextX, -4.5, 4.5);
    player.z = THREE.MathUtils.clamp(nextZ, -105, 12);

    if(state.settings.sound && performance.now() - lastFootstep > (sprint ? 300 : 470)){
      beep(sprint ? 92 : 75, 0.045, sprint ? 0.018 : 0.009, 'triangle');
      lastFootstep = performance.now();
    }
  }

  camera.position.set(player.x, player.y + (moving ? Math.sin(state.elapsed * (sprint ? 16 : 11)) * 0.035 : 0), player.z);
  camera.rotation.order = 'YXZ';
  camera.rotation.y = player.yaw;
  camera.rotation.x = player.pitch;
  flashlight.position.set(0, 0, 0);
  flashlight.target.position.set(0, -0.12, -1);

  if(player.z < -11 && !state.chase) startChase();

  // 道しるべ・案内HUDの更新
  const distToKoban = Math.max(0, Math.round(player.z - (-98)));
  if(ui.waypointHud){
    ui.waypointHud.classList.remove('hidden');
    if(ui.waypointText){
      if(distToKoban <= 5){
        ui.waypointText.textContent = '【交番の入り口】すぐ中へ入れ！';
      }else if(distToKoban <= 20){
        ui.waypointText.textContent = `交番の赤色灯が見えた！ あと ${distToKoban}m！`;
      }else{
        ui.waypointText.textContent = `直進して交番へ避難せよ（残り ${distToKoban}m）`;
      }
    }
  }

  // 交番到着による警察救助
  if(player.z <= -96 && !state.isRescued){
    triggerPoliceRescue();
  }

  if(player.stamina <= 0 && sprint) toast('息が切れた！ 歩いてスタミナを回復させよう。');
  ui.staminaValue.textContent = `${Math.round(player.stamina)}%`;
  ui.staminaMeter.style.width = `${player.stamina}%`;

  const progress = THREE.MathUtils.clamp((8 - player.z) / TOTAL_DISTANCE * 100, 0, 100);
  ui.progress.style.width = `${progress}%`;
  ui.objectiveMeta.textContent = `交番まで / ${distToKoban} m`;
  if(ui.distanceLabel) ui.distanceLabel.textContent = `${distToKoban} M`;

  const target = interactables.find(o => !o.used && Math.hypot(player.x - o.group.position.x, player.z - o.group.position.z) < 3.2);
  if(target){
    ui.prompt.classList.remove('hidden');
    ui.promptCopy.textContent = checkpoints[target.checkpoint].title;
  }else{
    ui.prompt.classList.add('hidden');
  }
}

function triggerPoliceRescue(){
  state.isRescued = true;
  state.mode = 'police';
  if(document.pointerLockElement) document.exitPointerLock();

  // パトカー・交番サイレン音再生
  playPoliceSiren();

  if(ui.policeModal){
    ui.policeModal.classList.remove('hidden');
  }else{
    finishGame('win');
  }
  toast('🚨 交番に駆け込んだ！ 警察官が保護してくれた！');
}

function startChase(){
  if(state.chase) return;
  state.chase = true;
  enemy.position.set(THREE.MathUtils.clamp(player.x + (Math.random() > 0.5 ? 1.1 : -1.1), -4, 4), 0, player.z + 13);
  enemy.visible = true;
  state.enemySpeed = 2.4 + state.risk * 0.025;
  ui.warning.classList.remove('hidden');
  toast('背後から足音！ マサヒロが追ってきた！ 走って逃げろ！');
  playHorrorStinger();
  receivePhoneMessage('マサヒロ「見つけた。逃げないで」', true);
}

function updateEnemy(dt){
  if(!state.chase || state.mode==='title' || state.mode==='ending' || state.isCaught || state.isRescued) return;
  const targetZ = player.z + 0.2;
  const dx = player.x - enemy.position.x, dz = targetZ - enemy.position.z;
  const actual = Math.hypot(player.x - enemy.position.x, player.z - enemy.position.z);
  const speed = state.enemySpeed + (player.stamina < 20 ? 0.35 : 0) + (state.risk > 70 ? 0.6 : 0) + (actual > 9 ? 0.25 : 0);

  if(actual > 0.1){
    enemy.position.x += dx / actual * speed * dt;
    enemy.position.z += dz / actual * speed * dt;
  }
  enemy.position.x = THREE.MathUtils.clamp(enemy.position.x, -4.2, 4.2);
  enemy.rotation.y = Math.atan2(player.x - enemy.position.x, player.z - enemy.position.z) + Math.PI;

  // 首の不気味な痙攣
  enemyTwitchTimer -= dt;
  if(enemyTwitchTimer <= 0){
    headTwitch.z = (Math.random() - 0.5) * 0.95;
    headTwitch.x = (Math.random() - 0.5) * 0.5;
    enemyTwitchTimer = 0.22 + Math.random() * 0.42;
  }
  if(enemyHeadGroup){
    enemyHeadGroup.rotation.z = headTwitch.z;
    enemyHeadGroup.rotation.x = headTwitch.x;
  }

  // 触手の蠢き
  enemyTendrils.forEach((t, i) => {
    t.rotation.z = Math.sin(state.elapsed * 7.5 + i * 1.4) * 0.42;
    t.rotation.x = 0.7 + Math.cos(state.elapsed * 6.5 + i) * 0.32;
  });

  // 目の発光
  const eyeIntensity = 5.0 + Math.sin(state.elapsed * 14) * 1.8 + (actual < 7 ? 3.5 : 0);
  enemyEyes.forEach(eye => {
    if(eye.material) eye.material.emissiveIntensity = eyeIntensity;
  });

  // 接近時の前傾姿勢
  if(actual < 7.5){
    enemy.rotation.x = THREE.MathUtils.lerp(enemy.rotation.x, 0.28, dt * 5);
    enemyParts.forEach((part, i) => {
      part.rotation.x = -1.1 + Math.sin(state.elapsed * 11 + i) * 0.25;
    });
  }else{
    enemy.rotation.x = THREE.MathUtils.lerp(enemy.rotation.x, 0, dt * 3);
    enemyParts.forEach((part, i) => {
      part.rotation.x = Math.sin(state.elapsed * 7 + i) * 0.14;
    });
  }

  // 心拍音
  const beatInterval = actual < 5 ? 360 : actual < 9 ? 650 : 1100;
  if(state.settings.sound && actual < 15 && performance.now() - lastHeartbeat > beatInterval){
    const heartVol = THREE.MathUtils.clamp((15 - actual) / 15 * 0.14, 0.03, 0.16);
    playHeartbeat(heartVol);
    lastHeartbeat = performance.now();
  }

  // ライトちらつき
  if(state.settings.flicker && actual < 11 && state.flashlight){
    if(Math.random() < dt * 3.5){
      flashlight.intensity = Math.random() < 0.35 ? 0 : Math.random() * 12;
    }else if(flashlight.intensity !== 22){
      flashlight.intensity = 22;
    }
  }

  // 距離警告表示
  ui.warning.classList.toggle('hidden', actual > 14);
  const warnSmall = ui.warning.querySelector('small') || ui.warningSub;
  if(actual < 5){
    if(warnSmall) warnSmall.textContent = 'すぐ後ろにいる！ 止まるな！';
    ui.warning.style.borderColor = '#ff0033';
  }else if(actual < 8){
    if(warnSmall) warnSmall.textContent = '急速に接近中！ 前へ走れ！';
    ui.warning.style.borderColor = '';
  }else{
    if(warnSmall) warnSmall.textContent = '背後に気配… 足を止めるな';
    ui.warning.style.borderColor = '';
  }

  // 恐怖のうめき声
  if(actual < 8 && Math.random() < dt * 1.6) beep(48, 0.18, 0.022, 'sawtooth');

  // 捕獲判定
  if(actual < 1.35){
    triggerJumpscare();
  }
}

function triggerJumpscare(){
  if(state.isCaught) return;
  state.isCaught = true;
  if(document.pointerLockElement) document.exitPointerLock();

  if(!state.settings.scare){
    finishGame('caught');
    return;
  }

  const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw);
  enemy.position.set(player.x + fx * 0.88, player.y - 1.95, player.z + fz * 0.88);
  enemy.rotation.y = player.yaw;
  if(enemyHeadGroup) enemyHeadGroup.rotation.set(0.08, 0, Math.random() > 0.5 ? 0.38 : -0.38);

  playJumpscareSound();
  ui.scareOverlay.classList.remove('hidden');
  document.body.classList.add('horror-shake');

  setTimeout(() => {
    ui.scareOverlay.classList.add('hidden');
    document.body.classList.remove('horror-shake');
    finishGame('caught');
  }, 1150);
}

function updateDecor(dt){
  // 街灯
  lamps.forEach(l => {
    let v = l.base;
    if(state.settings.flicker && Math.random() < 0.08) v *= 0.2;
    l.light.intensity = v * (0.97 + Math.sin(state.elapsed * 2 + l.phase) * 0.03);
  });

  // 道しるべ矢印の波打ち発光アニメーション
  navWaypoints.forEach((wp, i) => {
    const wave = Math.sin(state.elapsed * 3.5 - i * 0.45);
    wp.group.position.y = 0.04 + Math.max(0, wave) * 0.08;
    if(wp.arrowMat){
      wp.arrowMat.opacity = 0.55 + Math.sin(state.elapsed * 3.0 - i * 0.4) * 0.35;
    }
  });

  // 交番の赤青パトランプ回転
  sirenAngle += dt * 8.5;
  if(policeSirenLight1){
    policeSirenLight1.target.position.set(-2.4 + Math.cos(sirenAngle) * 5, 5.0, 2.4 + Math.sin(sirenAngle) * 5);
    policeSirenLight1.intensity = 16 + Math.sin(sirenAngle) * 6;
  }
  if(policeSirenLight2){
    policeSirenLight2.target.position.set(2.4 + Math.cos(sirenAngle + Math.PI) * 5, 5.0, 2.4 + Math.sin(sirenAngle + Math.PI) * 5);
    policeSirenLight2.intensity = 14 + Math.cos(sirenAngle) * 6;
  }

  // スマホメッセージの自動着信
  if(state.mode==='playing'){
    phoneTimer += dt;
    if(phoneMsgStep < masahiroChatPool.length){
      const nextMsg = masahiroChatPool[phoneMsgStep];
      if(phoneTimer >= nextMsg.time){
        receivePhoneMessage(`マサヒロ「${nextMsg.text}」`, !!nextMsg.scary);
        phoneMsgStep++;
      }
    }
  }

  // オブジェクトの回転
  interactables.forEach(o => {
    if(o.group.visible){
      o.orb.rotation.y += dt * 0.7;
      o.orb.rotation.x += dt * 0.4;
      o.ring.material.emissiveIntensity = 1.3 + Math.sin(state.elapsed * 2.5 + o.checkpoint) * 0.5;
    }
  });

  // 追跡中の画面赤み演出
  if(state.chase){
    const d = Math.hypot(player.x - enemy.position.x, player.z - enemy.position.z);
    const amount = THREE.MathUtils.clamp((11 - d) / 11, 0, 0.85);
    const redGlow = amount > 0.5 ? `rgba(180,0,20,${(amount - 0.5) * 0.55})` : 'rgba(0,0,0,0)';
    const vig = document.querySelector('.world-vignette');
    if(vig){
      vig.style.background = `radial-gradient(ellipse at center,transparent ${32 - amount * 20}%,rgba(0,0,0,${0.25 + amount * 0.4}) 68%,rgba(15,0,5,${0.7 + amount * 0.25}) 100%), radial-gradient(circle at center,${redGlow} 0%,transparent 70%)`;
    }
    if(d < 6.5 && !state.isCaught && !state.isRescued){
      camera.position.x += (Math.random() - 0.5) * (6.5 - d) * 0.014;
      camera.position.y += (Math.random() - 0.5) * (6.5 - d) * 0.014;
    }
  }else{
    const vig = document.querySelector('.world-vignette');
    if(vig) vig.style.background = '';
  }

  if(ui.compassNeedle){
    ui.compassNeedle.style.transform = `rotate(${player.yaw * 180 / Math.PI}deg)`;
  }
}

function animate(){
  const dt = Math.min(clock.getDelta(), 0.04);
  state.elapsed += dt;
  if(state.mode==='playing'){
    updatePlayer(dt);
    updateEnemy(dt);
    if(state.mode==='playing') updateHud();
  }
  updateDecor(dt);
  renderer.render(scene, camera);
}

function finishGame(result){
  if(state.mode==='ending') return;
  state.mode = 'ending';
  state.ending = result;
  keys.clear();
  if(document.pointerLockElement) document.exitPointerLock();

  ui.game.classList.add('hidden');
  ui.ending.classList.remove('hidden');

  if(result==='win'){
    ui.endingStamp.textContent = 'CASE RESOLVED / 交番救助成功';
    ui.endingStamp.style.color = '#82e5e7';
    ui.endingTitle.textContent = '交番へ無事避難！ 警察官に保護された';
    ui.endingLead.textContent = 'あなたの勇気ある判断が、最悪の事態から身を守りました。';
    ui.endingDescription.textContent = state.clues >= 2
      ? '危険な要求を毅然と拒絶し、現在地や写真を守り抜いて交番へ逃げ込むことができました。SNSで知り合った人と密室や夜道で会うことは極めて危険です。'
      : '無事に交番へ駆け込むことができましたが、いくつか危ない選択をしてしまいました。次は位置情報や自撮り写真を絶対に送らないよう気をつけましょう。';

    // 会った後の経緯（アフターストーリー）
    if(ui.storyTitle) ui.storyTitle.textContent = '【事件解決の経緯】駆けつけた警察と男の逮捕';
    if(ui.storyBody){
      ui.storyBody.innerHTML = `
        <p>交番のドアを開けて助けを求めた直後、追ってきた男（マサヒロ）は待ち構えていた警察官2名によってその場で職務質問・保護措置を受けました。</p>
        <p>警察の取調べにより、マサヒロと名乗っていた相手は実際には30代後半の成人男性であり、以前から別のアカウントでも未成年者を言葉巧みに誘い出していた要注意人物であったことが判明しました。</p>
        <p>男が乗ってきた車の中からは結束バンドや睡眠薬が押収され、もしあと数十秒逃げ遅れていたら取り返しのつかない凶悪事件に発展していた可能性が高いことが明らかになりました。</p>
        <p>その後、保護者と学校の担任が交番に駆けつけ、警察の生活安全課から「SNS上の人物は容易になりすましができる」「絶対に二人きりで会ってはいけない」という厳重な安全指導を受けました。ネット越しの親切な言葉に潜む恐ろしい危険性を身をもって学び、二度と軽はずみな約束をしないことを心に深く誓いました。</p>
      `;
    }
  }else{
    ui.endingStamp.textContent = 'CASE FAILED / 拘束・間一髪の救出';
    ui.endingStamp.style.color = '#ff5368';
    ui.endingTitle.textContent = 'マサヒロに追いつかれてしまった…';
    ui.endingLead.textContent = 'ネットの向こうの相手を信じすぎてはいけません。';
    ui.endingDescription.textContent = '「写真くらいなら」「少しだけなら」という油断が、マサヒロに居場所を特定させ、追いつかれる結果となりました。現実の犯罪は一瞬の隙から発生します。';

    // 会った後の経緯（アフターストーリー）
    if(ui.storyTitle) ui.storyTitle.textContent = '【事件の記録】連れ去りの恐怖と心の傷';
    if(ui.storyBody){
      ui.storyBody.innerHTML = `
        <p>「やっと会えたね…逃げられると思ったの？」——冷たい手で背後から腕を力任せに掴まれ、逃げ場を失いました。振り返った先にいたのは、SNSのアイコンとは似ても似つかない、冷酷な大人の男でした。</p>
        <p>悲鳴を上げようとした口を塞がれ、路地裏に停めてあった黒いワンボックスカーへ引きずり込まれそうになりましたが、異変に気づいた近隣住民の叫び声とパトカーのサイレンの音に男が動揺し、隙をついて逃げ出すことができました。</p>
        <p>男は数日後に警察に緊急逮捕されましたが、夜道を通るたびにあの冷たい手の感触が蘇り、長期間にわたってトラウマに苦しむことになりました。</p>
        <p>ネットの世界では、誰でも年齢や性別、性格を偽ることができます。「断ったら悪い」「いい人そうだから」という甘い考えが命取りになることを、生涯忘れられない恐怖として胸に刻むこととなりました。</p>
      `;
    }
  }

  ui.endingClues.textContent = `${state.clues} / 3`;
  ui.endingRisk.textContent = `${Math.round(state.risk)}%`;
  ui.endingDecisions.textContent = state.decisions;

  // 課題研究ポータルへの進捗反映用セッションストレージ
  try{
    sessionStorage.setItem('completed_offline_meeting', 'true');
  }catch(e){}
}

function onResize(){
  if(!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function toast(msg){
  if(!ui.toast) return;
  ui.toast.textContent = msg;
  ui.toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.add('hidden'), 3500);
}

function beep(freq, duration, gainVal=0.03, type='sine'){
  if(!state.settings.sound || !audioCtx) return;
  try{
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(gainVal, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(g);
    g.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }catch(e){}
}

function playPhoneVibe(){
  if(!state.settings.sound || !audioCtx) return;
  try{
    const now = audioCtx.currentTime;
    [0, 0.12].forEach(offset => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now + offset);
      g.gain.setValueAtTime(0.08, now + offset);
      g.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.08);
      osc.connect(g);
      g.connect(audioCtx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.08);
    });
  }catch(e){}
}

function playPoliceSiren(){
  if(!state.settings.sound || !audioCtx) return;
  try{
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(770, now);
    osc.frequency.linearRampToValueAtTime(960, now + 0.4);
    osc.frequency.linearRampToValueAtTime(770, now + 0.8);
    osc.frequency.linearRampToValueAtTime(960, now + 1.2);
    g.gain.setValueAtTime(0.12, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
    osc.connect(g);
    g.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 1.6);
  }catch(e){}
}

function playHeartbeat(vol=0.12){
  if(!state.settings.sound || !audioCtx) return;
  try{
    const now = audioCtx.currentTime;
    [0, 0.16].forEach((offset, idx) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(idx===0 ? 55 : 44, now + offset);
      osc.frequency.exponentialRampToValueAtTime(22, now + offset + 0.12);
      g.gain.setValueAtTime(vol * (idx===0 ? 1 : 0.7), now + offset);
      g.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.14);
      osc.connect(g);
      g.connect(audioCtx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.14);
    });
  }catch(e){}
}

function playHorrorStinger(){
  if(!state.settings.sound || !audioCtx) return;
  try{
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.9);
    g.gain.setValueAtTime(0.18, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    osc.connect(g);
    g.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.9);
  }catch(e){}
}

function playJumpscareSound(){
  if(!state.settings.sound || !audioCtx) return;
  try{
    const now = audioCtx.currentTime;
    const oLow = audioCtx.createOscillator(), gLow = audioCtx.createGain();
    oLow.type = 'sawtooth';
    oLow.frequency.setValueAtTime(150, now);
    oLow.frequency.exponentialRampToValueAtTime(24, now + 1.1);
    gLow.gain.setValueAtTime(0.26, now);
    gLow.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    oLow.connect(gLow);
    gLow.connect(audioCtx.destination);
    oLow.start(now);
    oLow.stop(now + 1.2);

    [320, 440, 510, 670, 890].forEach((freq, i) => {
      const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * (i%2 ? 1.35 : 0.65), now + 0.9);
      g.gain.setValueAtTime(0.06, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
      osc.connect(g);
      g.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 1.0);
    });
  }catch(e){}
}

function syncAudio(){
  if(!audioCtx) return;
  if(state.settings.sound){
    if(audioCtx.state==='suspended') audioCtx.resume();
  }else if(audioCtx.state==='running'){
    audioCtx.suspend();
  }
}

init();
