(function () {
  const wheel   = document.getElementById("wheel");
  const labels  = [...document.querySelectorAll(".label")];
  const spinBtn = document.getElementById("spinBtn");
  const result  = document.getElementById("result");
  const status  = document.getElementById("status");
  const teamSel = document.getElementById("teamSelect");

  const centers = [0, 60, 120, 180, 240, 300]; // 1..6 の中心角（12時起点）
  const R = 110; // 数字半径

  // 配置初期化
  labels.forEach((el) => {
    const n = Number(el.dataset.n);
    const ang = centers[n - 1];
    const base = `rotate(${ang}deg) translate(${R}px) rotate(${-ang}deg)`;
    el.style.setProperty("--base", base);
    el.classList.remove("flash","hold");
    el.style.transform = `var(--base) scale(1)`;
  });

  let current = 0;      // 累積角
  let spinning = false; // 二重クリック防止
  let held = null;      // 保持中の当該

  function resetHeld(){ if(held){ held.classList.remove("hold","flash"); held=null; } }

  async function flashSequence(el){
    // 0.5秒×4（ON250/OFF250）
    const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
    for(let i=0;i<4;i++){ el.classList.add("flash"); await sleep(250); el.classList.remove("flash"); await sleep(250); }
    // 1.0秒×4（ON500/OFF500）
    for(let i=0;i<4;i++){ el.classList.add("flash"); await sleep(500); el.classList.remove("flash"); await sleep(500); }
    // 保持（次スピンまで）
    el.classList.add("hold"); held = el;
  }

  function spin(){
    if(spinning) return;
    spinning = true; spinBtn.disabled = true;
    status.textContent = "回転中…"; result.textContent = "…";
    // 前回保持は仕様によりここで解除
    labels.forEach(l=>l.classList.remove("flash")); resetHeld();

    // ランダム着地（中心±5°）
    const n = Math.floor(Math.random()*6)+1;
    const center = centers[n-1];
    const jitter = (Math.random()*10 - 5);
    const targetAngle = center + jitter;

    const spins = 5;
    const next = current + (360*spins) - targetAngle; // 真上に center が来る回転
    wheel.style.transform = `rotate(${next}deg)`;

    const onDone = async () => {
      wheel.removeEventListener("transitionend", onDone);
      current = next % 360;

      // 実効角（真上にある角度）を算出
      let eff = (-current)%360; if(eff<0) eff+=360;

      // 最も近い中心角をHITとする
      let hit=1, min=360;
      centers.forEach((c,i)=>{
        const d = Math.abs(((eff - c + 540)%360)-180);
        if(d<min){ min=d; hit=i+1; }
      });

      result.textContent = String(hit);
      status.textContent = "停止";
      const el = labels.find(l=>Number(l.dataset.n)===hit);
      if(el) await flashSequence(el);

      const team = teamSel ? teamSel.value : "A";
      document.dispatchEvent(new CustomEvent("roulette:hit",{ detail:{ value:hit, team } }));

      spinning = false; spinBtn.disabled = false;
    };
    wheel.addEventListener("transitionend", onDone);
  }

  if(spinBtn) spinBtn.addEventListener("click", spin);
})();
