// 게임 실행에 필요한 전체 JavaScript 코드

// === 상수 설정 ===
const GRID_SIZE = 8;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const VICTORY_PERCENTAGE = 70;
const LAND_COST = 100;
const STARTING_MONEY = 500;
const INCOME_PER_LAND = 20;
const TOWER_COSTS = { accuracy: 200, power: 300, range: 250 };
const WALL_COSTS = { weak: 50, medium: 100, strong: 150 };
const WALL_HEALTH = { weak: 100, medium: 200, strong: 300 };

// === 게임 상태 ===
let gameState = {
    board: Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null)),
    currentPlayer: 1,
    turn: 1,
    money: {1: STARTING_MONEY, 2: STARTING_MONEY},
    territories: {1: 0, 2: 0},
    selectedCell: null,
    towers: [],
    walls: [],
    gameOver: false
};

// === DOM 요소 ===
const gameBoardEl = document.getElementById('game-board');
const statusBarEl = document.getElementById('status-bar');
const moneyDisplayEl = document.getElementById('money-display');
const moneyDisplay2El = document.getElementById('money-display-2');
const turnDisplayEl = document.getElementById('turn-display');
const playerDisplayEl = document.getElementById('player-display');
const territoriesDisplayEl = document.getElementById('territories-display');
const selectedCellEl = document.getElementById('selected-cell');
const endTurnBtn = document.getElementById('end-turn-btn');
const buyLandBtn = document.getElementById('buy-land-btn');
const buildAccuracyTowerBtn = document.getElementById('build-accuracy-tower-btn');
const buildPowerTowerBtn = document.getElementById('build-power-tower-btn');
const buildRangeTowerBtn = document.getElementById('build-range-tower-btn');
const buildWall1Btn = document.getElementById('build-wall-1-btn');
const buildWall2Btn = document.getElementById('build-wall-2-btn');
const buildWall3Btn = document.getElementById('build-wall-3-btn');
const progress1El = document.getElementById('progress-1');
const progress2El = document.getElementById('progress-2');
const combatLogEl = document.getElementById('combat-log');
const gameOverModalEl = document.getElementById('game-over-modal');
const winnerMessageEl = document.getElementById('winner-message');
const restartBtn = document.getElementById('restart-btn');

// === 게임 초기화 ===
function init() {
  initializeBoard();
  endTurnBtn.addEventListener('click', endTurn);
  buyLandBtn.addEventListener('click', buyLand);
  buildAccuracyTowerBtn.addEventListener('click', () => buildTower('accuracy'));
  buildPowerTowerBtn.addEventListener('click', () => buildTower('power'));
  buildRangeTowerBtn.addEventListener('click', () => buildTower('range'));
  buildWall1Btn.addEventListener('click', () => buildWall('weak'));
  buildWall2Btn.addEventListener('click', () => buildWall('medium'));
  buildWall3Btn.addEventListener('click', () => buildWall('strong'));
  restartBtn.addEventListener('click', restartGame);
  updateUI();
}

// === 게임 핵심 함수 ===
function initializeBoard() {
  gameBoardEl.innerHTML = '';
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', () => handleCellClick(row, col));
      gameBoardEl.appendChild(cell);
    }
  }
  setCellOwner(0, 0, 1);
  setCellOwner(GRID_SIZE - 1, GRID_SIZE - 1, 2);
}

function setCellOwner(row, col, player) {
  const index = row * GRID_SIZE + col;
  const cell = gameBoardEl.children[index];
  gameState.board[row][col] = { owner: player, type: 'land' };
  gameState.territories[player]++;
  cell.className = 'cell';
  cell.classList.add(player === 1 ? 'player1' : 'player2');
  updateProgressBars();
}

function handleCellClick(row, col) {
  if (gameState.gameOver) return;
  if (gameState.selectedCell) {
    const prev = gameState.selectedCell;
    gameBoardEl.children[prev.row * GRID_SIZE + prev.col].classList.remove('selected');
  }
  gameState.selectedCell = { row, col };
  gameBoardEl.children[row * GRID_SIZE + col].classList.add('selected');
  selectedCellEl.textContent = `(${row}, ${col})`;
  updateBuildButtons();
}

function updateUI() {
  turnDisplayEl.textContent = gameState.turn;
  playerDisplayEl.textContent = gameState.currentPlayer;
  moneyDisplayEl.textContent = gameState.money[gameState.currentPlayer];
  moneyDisplay2El.textContent = gameState.money[gameState.currentPlayer];
  const territoryCount = gameState.territories[gameState.currentPlayer];
  const percentage = ((territoryCount / TOTAL_CELLS) * 100).toFixed(1);
  territoriesDisplayEl.textContent = `${territoryCount}/${TOTAL_CELLS} (${percentage}%)`;
  statusBarEl.textContent = `플레이어 ${gameState.currentPlayer}의 턴 - 돈: ${gameState.money[gameState.currentPlayer]}`;
  updateBuildButtons();
  updateProgressBars();
}

function updateBuildButtons() {
  const cell = gameState.selectedCell;
  if (!cell) return disableAllBuildButtons();
  const state = gameState.board[cell.row][cell.col];
  disableAllBuildButtons();
  if (!state && hasAdjacentOwnedLand(cell.row, cell.col, gameState.currentPlayer)) {
    buyLandBtn.disabled = gameState.money[gameState.currentPlayer] < LAND_COST;
    return;
  }
  if (state && state.owner === gameState.currentPlayer && state.type === 'land') {
    buildAccuracyTowerBtn.disabled = gameState.money[gameState.currentPlayer] < TOWER_COSTS.accuracy;
    buildPowerTowerBtn.disabled = gameState.money[gameState.currentPlayer] < TOWER_COSTS.power;
    buildRangeTowerBtn.disabled = gameState.money[gameState.currentPlayer] < TOWER_COSTS.range;
    buildWall1Btn.disabled = gameState.money[gameState.currentPlayer] < WALL_COSTS.weak;
    buildWall2Btn.disabled = gameState.money[gameState.currentPlayer] < WALL_COSTS.medium;
    buildWall3Btn.disabled = gameState.money[gameState.currentPlayer] < WALL_COSTS.strong;
  }
}

function disableAllBuildButtons() {
  buyLandBtn.disabled = true;
  buildAccuracyTowerBtn.disabled = true;
  buildPowerTowerBtn.disabled = true;
  buildRangeTowerBtn.disabled = true;
  buildWall1Btn.disabled = true;
  buildWall2Btn.disabled = true;
  buildWall3Btn.disabled = true;
}

function hasAdjacentOwnedLand(row, col, player) {
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  return dirs.some(([dr, dc]) => {
    const r = row + dr, c = col + dc;
    if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
      const cell = gameState.board[r][c];
      return cell && cell.owner === player;
    }
    return false;
  });
}

function buyLand() {
  const { row, col } = gameState.selectedCell;
  if (gameState.money[gameState.currentPlayer] < LAND_COST) return;
  if (gameState.board[row][col]) return;
  if (!hasAdjacentOwnedLand(row, col, gameState.currentPlayer)) return;
  gameState.money[gameState.currentPlayer] -= LAND_COST;
  setCellOwner(row, col, gameState.currentPlayer);
  addLogEntry(`플레이어 ${gameState.currentPlayer}이(가) (${row}, ${col})에 땅을 구매했습니다.`);
  updateUI();
}

function addLogEntry(msg) {
  const el = document.createElement('div');
  el.className = 'log-entry';
  el.textContent = `[턴 ${gameState.turn}] ${msg}`;
  combatLogEl.appendChild(el);
  combatLogEl.scrollTop = combatLogEl.scrollHeight;
}

function updateProgressBars() {
  progress1El.style.width = `${(gameState.territories[1] / TOTAL_CELLS) * 100}%`;
  progress2El.style.width = `${(gameState.territories[2] / TOTAL_CELLS) * 100}%`;
}

function endTurn() {
  gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
  if (gameState.currentPlayer === 1) gameState.turn++;
  const income = gameState.territories[gameState.currentPlayer] * INCOME_PER_LAND;
  gameState.money[gameState.currentPlayer] += income;
  addLogEntry(`플레이어 ${gameState.currentPlayer}이(가) 턴 시작 시 ${income} 골드를 얻었습니다.`);
  if (gameState.selectedCell) {
    const i = gameState.selectedCell.row * GRID_SIZE + gameState.selectedCell.col;
    gameBoardEl.children[i].classList.remove('selected');
    gameState.selectedCell = null;
    selectedCellEl.textContent = '없음';
  }
  updateUI();
}

function restartGame() {
  gameState = {
    board: Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null)),
    currentPlayer: 1,
    turn: 1,
    money: {1: STARTING_MONEY, 2: STARTING_MONEY},
    territories: {1: 0, 2: 0},
    selectedCell: null,
    towers: [],
    walls: [],
    gameOver: false
  };
  combatLogEl.innerHTML = '<div class="log-entry">게임이 재시작되었습니다!</div>';
  gameOverModalEl.style.display = 'none';
  initializeBoard();
  updateUI();
}

// === 마지막으로 게임 시작 트리거 ===
window.onload = init;