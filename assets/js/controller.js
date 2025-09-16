/* タブ切り替え */
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("is-active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("is-active"));
    btn.classList.add("is-active");
    document.getElementById(btn.dataset.tab)?.classList.add("is-active");
  });
});

/* 盤面（36マス）初期化＆進行 */
const boardGrid = document.getElementById("boardGrid");
const teamSelect = document.getElementById("teamSelect");

const BOARD_SIZE = 36;
const teamPos = { A: 0, B: 0, C: 0, D: 0 };

function renderBoard() {
  boardGrid.innerHTML = "";
  for (let i = 0; i < BOARD_SIZE; i++) {
    const div = document.createElement("div");
    div.className = "cell";
    div.textContent = String(i + 1);
    // 各チームの駒（チップ）を表示
    Object.entries(teamPos).forEach(([team, pos]) => {
      if (pos === i) {
        const chip = document.createElement("span");
        chip.className = "chip " + team;
        div.appendChild(chip);
        if (team === teamSelect.value) div.classList.add("active");
      }
    });
    boardGrid.appendChild(div);
  }
}

function advanceTeam(team, steps) {
  teamPos[team] = (teamPos[team] + steps) % BOARD_SIZE;
  renderBoard();
}

// 初期描画
renderBoard();

// ルーレット結果との連携
window.addEventListener("roulette:stop", (e) => {
  const steps = e.detail.steps;
  advanceTeam(teamSelect.value, steps);
});
