/* ルーレットのロジック（数字は 1..6） */
const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spinBtn");
const resultNumEl = document.getElementById("resultNum");
const labels = Array.from(document.querySelectorAll(".wheel .label"));

let currentAngle = 0;
let isSpinning = false;
let holdLabel = null;

/** idx(0..5) を 12時停止させるための絶対角度を返す */
function angleForIndex(idx) {
  // セグメント幅 60deg。ポインタは12時（0deg）を指すので
  // 目的セグメントの中央(30degずつ)を 0deg に合わせるよう逆回転。
  // さらに数回転分(>= 3周)を加えて自然に。
  const segmentCenter = idx * 60 + 30; // 30,90,150,210,270,330
  const base = 360 * 5; // 5回転
  return base + (360 - segmentCenter);
}

/** 当該のみ 0.5s×4 + 1.0s×4 → 保持 */
function flashSequence(targetLabel, done) {
  // 既存のフラッシュ・保持をリセット
  labels.forEach(l => l.classList.remove("flash","hold"));
  if (holdLabel) holdLabel.classList.remove("hold");

  let count = 0;
  let visible = false;

  const tick = () => {
    if (count < 8) {
      // 0..3 は 0.5s、4..7 は 1.0s
      const dur = count < 4 ? 500 : 1000;
      visible = !visible;
      targetLabel.classList.toggle("flash", visible);
      count++;
      setTimeout(tick, dur);
    } else {
      // 最終保持
      targetLabel.classList.remove("flash");
      targetLabel.classList.add("hold","flash"); // 視覚的に強く維持
      holdLabel = targetLabel;
      done && done();
    }
  };
  tick();
}

function spinOnce() {
  if (isSpinning) return;
  isSpinning = true;

  // ランダム結果（1..6）
  const idx = Math.floor(Math.random() * 6); // 0..5
  const deg = angleForIndex(idx);
  currentAngle += deg;

  // 回転開始
  wheel.style.transform = `rotate(${currentAngle}deg)`;

  // アニメ終了後
  wheel.addEventListener("transitionend", function handler() {
    wheel.removeEventListener("transitionend", handler);

    const value = idx + 1;
    resultNumEl.textContent = String(value);

    const label = labels[idx];
    flashSequence(label, () => {
      // ルーレット確定 → 盤面更新（controller.js）
      window.dispatchEvent(new CustomEvent("roulette:stop", { detail: { steps: value } }));
      isSpinning = false;
    });
  }, { once: true });
}

spinBtn?.addEventListener("click", spinOnce);
