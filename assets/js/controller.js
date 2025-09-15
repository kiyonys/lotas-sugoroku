/* タブ切り替え・盤面生成とルーレット連携（デモ） */
(() => {
  /* ---- タブ ---- */
  const tabs = document.querySelectorAll('.tab');
  const panes = document.querySelectorAll('.tabpane');
  tabs.forEach(btn=>{
    btn.addEventListener('click', () => {
      tabs.forEach(b=>b.classList.remove('active'));
      panes.forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  /* ---- 盤面（36マス） ---- */
  const board = document.getElementById('boardGrid');
  const teamSel = document.getElementById('teamSel');
  const teamLabel = document.getElementById('teamLabel');
  const posLabel = document.getElementById('posLabel');
  const resetBtn = document.getElementById('resetBoard');

  // マス色ローテ
  const colorClass = (i) => ['c1','c2','c3','c4'][i%4];

  // 36マス生成（1=スタート, 36=ゴール）
  const cells = [];
  for (let i=1;i<=36;i++){
    const d = document.createElement('div');
    d.className = `cell ${colorClass(i)}` + (i===1?' start':'') + (i===36?' goal':'');
    const no = document.createElement('div');
    no.className = 'no';
    no.textContent = String(i);
    d.appendChild(no);
    board.appendChild(d);
    cells.push(d);
  }

  // チーム毎の位置
  const state = {
    A:1, B:1
  };
  const tokenA = document.createElement('div'); tokenA.className='token';
  const tokenB = document.createElement('div'); tokenB.className='token'; tokenB.style.background='linear-gradient(#ad1457,#d81b60)';
  function placeTokens(){
    // 既存トークン掃除
    cells.forEach(c=>{
      c.querySelectorAll('.token').forEach(t=>t.remove());
    });
    // 配置
    cells[state.A-1]?.appendChild(tokenA);
    cells[state.B-1]?.appendChild(tokenB);
    teamLabel.textContent = teamSel.value;
    posLabel.textContent = String(state[teamSel.value]);
  }
  placeTokens();

  // ルーレット停止 → 現在選択チームの駒を進める
  window.addEventListener('roulette:stopped', (ev) => {
    const n = ev.detail.number;
    const team = teamSel.value;
    state[team] = Math.min(36, state[team] + n);
    placeTokens();
  });

  resetBtn.addEventListener('click', () => {
    state.A = 1; state.B = 1; placeTokens();
  });

  teamSel.addEventListener('change', placeTokens);
})();
