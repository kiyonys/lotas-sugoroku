/* ルーレット制御（確定版：当該のみ 0.5s×4 + 1.0s×4 → 2.5倍保持） */
(() => {
  const wheel = document.getElementById('wheel');
  const spinBtn = document.getElementById('spinBtn');
  const resultEl = document.getElementById('result');

  /** 現在保持中のバッジ（次回回すまで2.5倍のまま） */
  let heldBadge = null;
  /** 現在の累積回転角（続けて回した時に逆戻りしないよう加算） */
  let rot = 0;

  function centerAngleOf(n) {
    // セグメントは 1..6、12時=0deg。1は 330..30 の中央=0deg付近。
    // 回転は “ホイールを回す” ので、選んだセグメントの中央を 0deg に合わせる＝
    // 360 - セグメント中央角を加算。
    // セグメント幅60deg、1の中央=0deg, 2=60, 3=120, 4=180, 5=240, 6=300
    const centers = {1:0, 2:60, 3:120, 4:180, 5:240, 6:300};
    return centers[n];
  }

  function spinOnce(toNumber) {
    // 既存保持を解除
    if (heldBadge) { heldBadge.classList.remove('hold'); heldBadge = null; }

    const n = toNumber ?? (Math.floor(Math.random()*6)+1);
    const center = centerAngleOf(n);
    // 多回転させつつ、選んだnが12時に来るように（回すのはホイールなので 360-center で回転）
    const spins = 4; // 充分に回す
    const target = rot + (spins*360) + (360 - center);
    rot = target;

    // 一旦すべてのパルスクラスを掃除
    wheel.querySelectorAll('.badge').forEach(b=>{
      b.classList.remove('pulse-05','pulse-10','hold');
    });

    // 回転開始
    wheel.style.transform = `rotate(${target}deg)`;

    // 回転完了後（CSS 2.2s）に「当該のみ」パルス → 保持
    spinBtn.disabled = true;
    setTimeout(() => {
      const seg = wheel.querySelector(`.seg[data-n="${n}"]`);
      const badge = seg.querySelector('.badge');

      // 0.5s × 4
      badge.classList.add('pulse-05');

      // 次に 1.0s × 4
      const t1 = 0.5 * 4 * 1000;
      setTimeout(() => {
        badge.classList.remove('pulse-05');
        badge.classList.add('pulse-10');

        // 最後に 2.5倍保持
        const t2 = 1.0 * 4 * 1000;
        setTimeout(() => {
          badge.classList.remove('pulse-10');
          badge.classList.add('hold');
          heldBadge = badge;
          resultEl.textContent = String(n);
          spinBtn.disabled = false;

          // 盤面に通知
          window.dispatchEvent(new CustomEvent('roulette:stopped', { detail:{ number:n } }));
        }, t2);

      }, t1);
    }, 2200);

    return n;
  }

  spinBtn.addEventListener('click', () => spinOnce());
  // デバッグ用に公開（必要なら）
  window.Roulette = { spinOnce };
})();
