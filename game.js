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
function buildTower(type) {
  const { row, col } = gameState.selectedCell;
  const cellState = gameState.board[row][col];
  if (!cellState || cellState.owner !== gameState.currentPlayer || cellState.type !== 'land') return;
  const cost = TOWER_COSTS[type];
  if (gameState.money[gameState.currentPlayer] < cost) return;
  gameState.money[gameState.currentPlayer] -= cost;
  cellState.type = 'tower';
  addLogEntry(`플레이어 ${gameState.currentPlayer}이(가) (${row}, ${col})에 ${type} 포탑을 건설했습니다.`);
  const index = row * GRID_SIZE + col;
  const towerEl = document.createElement('div');
  towerEl.className = `tower tower-${type}`;
  towerEl.textContent = type.charAt(0).toUpperCase();
  gameBoardEl.children[index].appendChild(towerEl);
  updateUI();
}

function buildWall(strength) {
  const { row, col } = gameState.selectedCell;
  const cellState = gameState.board[row][col];
  if (!cellState || cellState.owner !== gameState.currentPlayer || cellState.type !== 'land') return;
  const cost = WALL_COSTS[strength];
  if (gameState.money[gameState.currentPlayer] < cost) return;
  gameState.money[gameState.currentPlayer] -= cost;
  cellState.type = 'wall';
  addLogEntry(`플레이어 ${gameState.currentPlayer}이(가) (${row}, ${col})에 ${strength} 성벽을 건설했습니다.`);
  const index = row * GRID_SIZE + col;
  const wallEl = document.createElement('div');
  wallEl.className = 'wall';
  gameBoardEl.children[index].appendChild(wallEl);
  updateUI();
}

// === 기타 함수들은 그대로 유지 ===
// initializeBoard, setCellOwner, handleCellClick, updateUI, updateBuildButtons, disableAllBuildButtons,
// hasAdjacentOwnedLand, buyLand, addLogEntry, updateProgressBars, endTurn, restartGame 등 유지됨

// === 게임 시작 트리거 ===
window.onload = init;
