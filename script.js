// Configuração dos objetos
const objects = {
  monkey: { id: 1, img: "assets/img/monkey.png" },
  chair: { id: 5, img: "assets/img/chair.png" },
  stick: { id: 3, img: "assets/img/stick.png" },
  bananas: { id: 7, img: "assets/img/bananas.png" },
};

// Estado do macaco
let monkeyState = {
  hasStick: false,
  onChair: false,
  bananasReached: false,
  visitedCells: new Set(),
  currentAction: null,
};

// Elementos da UI
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const logDiv = document.getElementById("log");
const gridContainer = document.getElementById("grid-container");

// Inicialização do grid
function initGrid() {
  gridContainer.innerHTML = "";

  // Criar grid 3x3
  for (let i = 1; i <= 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.id = `cell${i}`;

    // Adicionar número da célula
    const cellNumber = document.createElement("span");
    cellNumber.className = "cell-number";
    cellNumber.textContent = i;
    cell.appendChild(cellNumber);

    gridContainer.appendChild(cell);
  }

  // Posicionar objetos
  for (const [obj, data] of Object.entries(objects)) {
    const cell = document.getElementById(`cell${data.id}`);
    if (obj !== "monkey") {
      const img = document.createElement("img");
      img.src = data.img;
      img.alt = obj;
      img.className = "object-img";
      cell.appendChild(img);
    }
  }

  // Posicionar macaco
  const monkeyCell = document.getElementById(`cell${objects.monkey.id}`);
  const monkeyImg = document.createElement("img");
  monkeyImg.src = objects.monkey.img;
  monkeyImg.className = "monkey-img";
  monkeyCell.appendChild(monkeyImg);
}

// Limpar log
function clearLog() {
  logDiv.innerHTML = "";
}

// Adicionar mensagem ao log
function logAction(message, type = "info") {
  const p = document.createElement("p");
  p.textContent = message;
  p.className = type;
  logDiv.appendChild(p);
  logDiv.scrollTop = logDiv.scrollHeight;
}

// Atualizar estado atual
function updateCurrentState() {
  const currentStateDiv = document.getElementById("current-state");
  currentStateDiv.innerHTML = "";

  // Macaco sempre aparece
  const monkeyImg = document.createElement("img");
  monkeyImg.src = objects.monkey.img;
  monkeyImg.alt = "Macaco";
  currentStateDiv.appendChild(monkeyImg);

  // Objetos coletados
  if (monkeyState.hasStick) {
    const stickImg = document.createElement("img");
    stickImg.src = objects.stick.img;
    stickImg.alt = "Vara";
    currentStateDiv.appendChild(stickImg);
  }

  if (monkeyState.onChair) {
    const chairImg = document.createElement("img");
    chairImg.src = objects.chair.img;
    chairImg.alt = "Cadeira";
    currentStateDiv.appendChild(chairImg);
  }

  // Descrição do estado
  const stateDesc = document.createElement("p");
  stateDesc.textContent = getStateDescription();

  if (monkeyState.bananasReached) {
    const bananasImg = document.createElement("img");
    bananasImg.src = objects.bananas.img;
    bananasImg.alt = "Bananas";
    bananasImg.classList.add("success-animation");
    currentStateDiv.appendChild(bananasImg);
    stateDesc.className = "success";
  }

  currentStateDiv.appendChild(stateDesc);
  updateProgressTracker();
}

// Atualizar rastreador de progresso
function updateProgressTracker() {
  const stickStatus = document.getElementById("stick-status");
  const chairStatus = document.getElementById("chair-status");
  const bananasStatus = document.getElementById("bananas-status");

  stickStatus.classList.toggle("completed", monkeyState.hasStick);
  chairStatus.classList.toggle("completed", monkeyState.onChair);
  bananasStatus.classList.toggle("completed", monkeyState.bananasReached);
}

// Descrição do estado atual
function getStateDescription() {
  if (monkeyState.bananasReached) return "Missão cumprida! 🎉";
  if (monkeyState.currentAction) return monkeyState.currentAction;
  if (monkeyState.hasStick && monkeyState.onChair)
    return "Pronto para pegar bananas!";
  if (monkeyState.hasStick) return "Precisa subir na cadeira";
  if (monkeyState.onChair) return "Precisa da vara";
  return "Explorando o ambiente...";
}

// Mover macaco para célula aleatória
function moveMonkeyRandomly() {
  const currentCell = document.getElementById(`cell${objects.monkey.id}`);
  currentCell.querySelector(".monkey-img")?.remove();

  let randomCellId;
  const maxAttempts = 10;
  let attempts = 0;

  // Evitar células já visitadas
  do {
    randomCellId = Math.floor(Math.random() * 9) + 1;
    attempts++;
    if (attempts >= maxAttempts) break;
  } while (
    monkeyState.visitedCells.has(randomCellId) &&
    monkeyState.visitedCells.size < 8
  );

  objects.monkey.id = randomCellId;
  monkeyState.visitedCells.add(randomCellId);

  const newCell = document.getElementById(`cell${randomCellId}`);
  const monkeyImg = document.createElement("img");
  monkeyImg.src = objects.monkey.img;
  monkeyImg.className = "monkey-img";
  newCell.appendChild(monkeyImg);

  // Destacar célula visitada
  newCell.style.backgroundColor = "#e3f2fd";
  setTimeout(() => {
    newCell.style.backgroundColor = "";
  }, 500);

  return randomCellId;
}

// Verificar objeto na célula
function checkObject(cellId) {
  for (const [obj, data] of Object.entries(objects)) {
    if (data.id === cellId && obj !== "monkey") {
      return obj;
    }
  }
  return null;
}

// Tentar ação com objeto
function tryAction(object) {
  let result, message;

  switch (object) {
    case "bananas":
      if (monkeyState.hasStick && monkeyState.onChair) {
        monkeyState.bananasReached = true;
        message = "🎉 Macaco usou a vara na cadeira e pegou as bananas!";
        result = "success";
        monkeyState.currentAction = "Pegando bananas...";
      } else if (monkeyState.hasStick) {
        message =
          "🔧 Macaco tentou bater nas bananas com a vara, mas está baixo demais!";
        result = "need_chair";
        monkeyState.currentAction = "Preciso subir na cadeira...";
      } else if (monkeyState.onChair) {
        message =
          "🔧 Macaco tentou pular da cadeira, mas não alcançou as bananas!";
        result = "need_stick";
        monkeyState.currentAction = "Preciso da vara...";
      } else {
        message = "❌ Macaco não consegue alcançar as bananas sem ajuda.";
        result = "fail";
        monkeyState.currentAction = "Preciso de ferramentas...";
      }
      break;

    case "stick":
      if (!monkeyState.hasStick) {
        monkeyState.hasStick = true;
        message =
          "｜ Macaco pegou a vara! Agora pode tentar bater nas bananas.";
        result = "stick_acquired";
        monkeyState.currentAction = "Vara adquirida!";
      } else {
        result = "no_action";
      }
      break;

    case "chair":
      if (!monkeyState.onChair) {
        monkeyState.onChair = true;
        message = "🪑 Macaco subiu na cadeira! Agora está mais alto.";
        result = "chair_used";
        monkeyState.currentAction = "Subi na cadeira!";
      } else {
        result = "no_action";
      }
      break;

    default:
      result = "no_action";
  }

  if (message) {
    logAction(
      message,
      result === "success"
        ? "success"
        : result.includes("need")
        ? "warning"
        : result === "fail"
        ? "error"
        : "info"
    );
  }

  updateCurrentState();
  return result;
}

// Reiniciar simulação
function resetSimulation() {
  // Resetar estado
  monkeyState = {
    hasStick: false,
    onChair: false,
    bananasReached: false,
    visitedCells: new Set([objects.monkey.id]),
    currentAction: null,
  };

  // Resetar posições dos objetos
  objects.monkey.id = 1;
  objects.chair.id = 5;
  objects.stick.id = 3;
  objects.bananas.id = 7;

  // Reiniciar UI
  clearLog();
  initGrid();
  updateCurrentState();
  startBtn.disabled = false;

  logAction("🔄 Simulação reiniciada", "info");
}

// Lógica principal de simulação
function startSimulation() {
  resetSimulation();
  startBtn.disabled = true;
  logAction("🔍 Macaco começou a busca inteligente...", "info");
  monkeyState.currentAction = "Explorando...";
  updateCurrentState();

  const maxAttempts = 20;
  let attempts = 0;

  const simulationInterval = setInterval(() => {
    if (monkeyState.bananasReached || attempts >= maxAttempts) {
      clearInterval(simulationInterval);
      startBtn.disabled = false;

      if (monkeyState.bananasReached) {
        logAction("✅ Missão cumprida! Macaco venceu!", "success");
      } else {
        logAction("🛑 Macaco desistiu após muitas tentativas.", "error");
      }
      return;
    }

    attempts++;
    const cellId = moveMonkeyRandomly();
    const foundObject = checkObject(cellId);

    if (foundObject) {
      logAction(`✅ Encontrou: ${foundObject}`, "info");
      const result = tryAction(foundObject);

      // Lógica de tentativa e erro inteligente
      if (result === "need_chair") {
        setTimeout(() => {
          if (!monkeyState.onChair) {
            logAction(
              "💡 Macaco decidiu procurar a cadeira para combinar com a vara!",
              "info"
            );
            objects.monkey.id = objects.chair.id;
            moveMonkeyRandomly();
            tryAction("chair");
          }
        }, 1000);
      } else if (result === "need_stick") {
        setTimeout(() => {
          if (!monkeyState.hasStick) {
            logAction(
              "💡 Macaco decidiu procurar a vara para combinar com a cadeira!",
              "info"
            );
            objects.monkey.id = objects.stick.id;
            moveMonkeyRandomly();
            tryAction("stick");
          }
        }, 1000);
      }
    }
  }, 1500);
}

// Event listeners
startBtn.addEventListener("click", startSimulation);
resetBtn.addEventListener("click", resetSimulation);

// Inicialização
window.addEventListener("load", () => {
  initGrid();
  updateCurrentState();
  logAction(
    "🟢 Sistema pronto. Clique em 'Iniciar Simulação' para começar.",
    "info"
  );
});
