const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const moneyEl = document.getElementById("money");
const reputationEl = document.getElementById("reputation");
const salesEl = document.getElementById("sales");
const customersEl = document.getElementById("customers");
const levelEl = document.getElementById("restaurantLevel");
const levelFill = document.getElementById("levelFill");

const constructionUI = document.getElementById("constructionUI");
const constructionTitle = document.getElementById("constructionTitle");
const constructionProgress = document.getElementById("constructionProgress");
const constructionPercent = document.getElementById("constructionPercent");
const notification = document.getElementById("notification");

let game = {
  money: 500,
  reputation: 1,
  sales: 0,
  customers: 0,

  tables: 2,
  chefs: 1,
  kitchenLevel: 1,
  delivery: false,
  expansion: 1,

  level: 1,

  workers: [],
  customersList: [],

  construction: null
};

const SAVE_KEY = "burgerEmpireSave";

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    money: game.money,
    reputation: game.reputation,
    sales: game.sales,
    customers: game.customers,
    tables: game.tables,
    chefs: game.chefs,
    kitchenLevel: game.kitchenLevel,
    delivery: game.delivery,
    expansion: game.expansion,
    level: game.level
  }));
}

function loadGame() {
  const saved = localStorage.getItem(SAVE_KEY);

  if (!saved) return;

  try {
    const data = JSON.parse(saved);

    Object.assign(game, data);

  } catch (error) {
    console.log("تعذر تحميل الحفظ");
  }
}

loadGame();

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();

  canvas.width = Math.floor(rect.width * devicePixelRatio);
  canvas.height = Math.floor(rect.height * devicePixelRatio);

  ctx.setTransform(
    devicePixelRatio,
    0,
    0,
    devicePixelRatio,
    0,
    0
  );
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

function updateUI() {
  moneyEl.textContent = Math.floor(game.money);
  reputationEl.textContent = game.reputation;
  salesEl.textContent = game.sales;
  customersEl.textContent = game.customers;
  levelEl.textContent = game.level;

  const progress = Math.min(100, game.level * 20);
  levelFill.style.width = progress + "%";

  document.getElementById("tableBtn").disabled =
    !!game.construction || game.money < 150;

  document.getElementById("chefBtn").disabled =
    !!game.construction || game.money < 300;

  document.getElementById("kitchenBtn").disabled =
    !!game.construction || game.money < 700;

  document.getElementById("deliveryBtn").disabled =
    !!game.construction || game.delivery || game.money < 1200;

  document.getElementById("expandBtn").disabled =
    !!game.construction || game.money < 2500;
}

function notify(message) {
  notification.textContent = message;
  notification.classList.remove("hidden");

  setTimeout(() => {
    notification.classList.add("hidden");
  }, 2200);
}


/* =========================
   الرسم
========================= */

function getSize() {
  return {
    w: canvas.clientWidth,
    h: canvas.clientHeight
  };
}

function drawFloor(w, h) {

  ctx.fillStyle = "#8a6646";
  ctx.fillRect(0, 0, w, h);

  const tile = 45;

  for (let y = 0; y < h; y += tile) {
    for (let x = 0; x < w; x += tile) {

      ctx.fillStyle =
        ((x / tile + y / tile) % 2 === 0)
          ? "#936f4c"
          : "#876342";

      ctx.fillRect(x, y, tile, tile);

      ctx.strokeStyle = "rgba(40,20,10,.13)";
      ctx.strokeRect(x, y, tile, tile);
    }
  }
}


function drawWalls(w, h) {

  ctx.fillStyle = "#382116";

  ctx.fillRect(0, 0, w, 45);
  ctx.fillRect(0, 0, 35, h);
  ctx.fillRect(w - 35, 0, 35, h);

  if (game.expansion === 1) {
    ctx.fillRect(0, h - 35, w, 35);
  }

  if (game.expansion >= 2) {
    ctx.fillStyle = "#51301e";
    ctx.fillRect(0, h - 35, w, 35);
  }

  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 19px Arial";
  ctx.textAlign = "center";
  ctx.fillText("🍔 إمبراطورية البرجر", w / 2, 30);
}


function drawKitchen(w, h) {

  let kitchenWidth = game.kitchenLevel >= 2 ? 250 : 190;

  ctx.fillStyle = "#3d2a20";
  ctx.fillRect(45, 75, kitchenWidth, 170);

  ctx.fillStyle = "#241914";
  ctx.fillRect(45, 75, kitchenWidth, 40);

  ctx.fillStyle = "#e8d7c5";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.fillText("🍳 المطبخ", 45 + kitchenWidth / 2, 101);

  // الأفران
  const ovens = game.kitchenLevel >= 2 ? 3 : 2;

  for (let i = 0; i < ovens; i++) {

    const x = 65 + i * 55;

    ctx.fillStyle = "#191311";
    ctx.fillRect(x, 135, 42, 55);

    ctx.fillStyle = "#7d4c2c";
    ctx.fillRect(x + 7, 145, 28, 20);

    ctx.fillStyle = "#ff9f1c";
    ctx.beginPath();
    ctx.arc(x + 21, 155, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // طاولة تجهيز
  ctx.fillStyle = "#65452e";
  ctx.fillRect(65, 205, kitchenWidth - 40, 22);

  if (game.kitchenLevel >= 2) {

    ctx.fillStyle = "#6f5138";
    ctx.fillRect(65, 115, 42, 20);

    ctx.fillStyle = "#d4b48d";
    ctx.font = "12px Arial";
    ctx.fillText("توسعة", 86, 130);
  }
}


function drawCounter(w, h) {

  ctx.fillStyle = "#56321f";

  ctx.fillRect(w - 250, 75, 190, 70);

  ctx.fillStyle = "#24140e";
  ctx.fillRect(w - 250, 75, 190, 22);

  ctx.fillStyle = "#f2d0a2";
  ctx.font = "bold 13px Arial";
  ctx.textAlign = "center";
  ctx.fillText("🍔 الكاشير", w - 155, 91);

  ctx.fillStyle = "#a66c3e";
  ctx.fillRect(w - 230, 110, 45, 25);

  ctx.fillStyle = "#e8d7c5";
  ctx.font = "10px Arial";
  ctx.fillText("طلبات", w - 207, 126);
}


function tablePosition(index, w, h) {

  const positions = [
    [330, 200],
    [500, 200],
    [330, 340],
    [500, 340],
    [250, 460],
    [460, 475],
    [650, 350],
    [650, 475]
  ];

  const p = positions[index % positions.length];

  let x = p[0];
  let y = p[1];

  if (w < 700) {
    x = 150 + (index % 2) * 170;
    y = 230 + Math.floor(index / 2) * 110;
  }

  return { x, y };
}


function drawTable(x, y, occupied = false) {

  // الكراسي
  ctx.fillStyle = "#3a2117";

  ctx.fillRect(x - 47, y - 13, 28, 15);
  ctx.fillRect(x + 19, y - 13, 28, 15);
  ctx.fillRect(x - 47, y + 28, 28, 15);
  ctx.fillRect(x + 19, y + 28, 28, 15);

  // ظل
  ctx.fillStyle = "rgba(0,0,0,.25)";
  ctx.beginPath();
  ctx.ellipse(x, y + 25, 47, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // الطاولة
  ctx.fillStyle = "#6d4327";
  ctx.beginPath();
  ctx.roundRect(x - 38, y - 30, 76, 60, 10);
  ctx.fill();

  ctx.fillStyle = "#9a6138";
  ctx.beginPath();
  ctx.roundRect(x - 32, y - 24, 64, 48, 8);
  ctx.fill();

  // برجر
  ctx.font = "22px Arial";
  ctx.textAlign = "center";
  ctx.fillText(occupied ? "🍔" : "🥤", x, y + 8);
}


function drawDoor(w, h) {

  ctx.fillStyle = "#23150f";

  ctx.fillRect(
    w / 2 - 48,
    h - 42,
    96,
    42
  );

  ctx.fillStyle = "#d18b42";
  ctx.font = "bold 12px Arial";
  ctx.textAlign = "center";

  ctx.fillText(
    "🚪 الدخول",
    w / 2,
    h - 17
  );
}


function drawDelivery(w, h) {

  if (!game.delivery) return;

  const x = w - 110;
  const y = h - 95;

  ctx.fillStyle = "#202020";
  ctx.beginPath();
  ctx.arc(x - 25, y + 25, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x + 25, y + 25, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#e76f00";
  ctx.fillRect(x - 35, y - 5, 70, 25);

  ctx.fillStyle = "#ffd166";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText("🛵", x, y - 8);
}


function drawWorker(worker) {

  ctx.save();

  ctx.translate(worker.x, worker.y);

  // ظل
  ctx.fillStyle = "rgba(0,0,0,.25)";
  ctx.beginPath();
  ctx.ellipse(0, 19, 17, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // جسم
  ctx.fillStyle = "#e76f00";
  ctx.beginPath();
  ctx.roundRect(-12, -2, 24, 27, 7);
  ctx.fill();

  // الرأس
  ctx.fillStyle = "#f0b27a";
  ctx.beginPath();
  ctx.arc(0, -13, 11, 0, Math.PI * 2);
  ctx.fill();

  // الخوذة
  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(0, -17, 12, Math.PI, Math.PI * 2);
  ctx.fill();

  if (worker.building) {

    ctx.strokeStyle = "#d9b37c";
    ctx.lineWidth = 4;

    const swing = Math.sin(Date.now() / 90) * .7;

    ctx.save();
    ctx.rotate(swing);
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(23, -15);
    ctx.stroke();

    ctx.fillStyle = "#777";
    ctx.fillRect(18, -19, 8, 6);

    ctx.restore();
  }

  ctx.restore();
}


function drawCustomer(customer) {

  ctx.save();

  ctx.translate(customer.x, customer.y);

  ctx.fillStyle = "rgba(0,0,0,.2)";
  ctx.beginPath();
  ctx.ellipse(0, 18, 15, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = customer.color;

  ctx.beginPath();
  ctx.roundRect(-11, -1, 22, 26, 7);
  ctx.fill();

  ctx.fillStyle = "#f0b27a";

  ctx.beginPath();
  ctx.arc(0, -12, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}


/* =========================
   الشخصيات
========================= */

function createWorker() {

  game.workers.push({
    x: 110,
    y: 285,
    targetX: 110,
    targetY: 285,
    building: false
  });
}

function ensureWorkers() {

  while (game.workers.length < game.chefs + 1) {
    createWorker();
  }
}

ensureWorkers();


function spawnCustomer() {

  if (game.customersList.length >= game.tables) return;

  const size = getSize();

  game.customersList.push({
    x: size.w / 2,
    y: size.h - 25,

    targetX: size.w / 2,
    targetY: size.h - 25,

    table: -1,

    state: "enter",

    color: [
      "#5b8def",
      "#d95d9b",
      "#52b788",
      "#9b5de5",
      "#f4a261"
    ][Math.floor(Math.random() * 5)],

    timer: 0
  });
}


function updateCustomers(dt) {

  for (let i = game.customersList.length - 1; i >= 0; i--) {

    const c = game.customersList[i];

    if (c.state === "enter") {

      if (c.table === -1) {

        const occupiedTables =
          game.customersList
            .filter(x => x.table >= 0)
            .map(x => x.table);

        let available = [];

        for (let t = 0; t < game.tables; t++) {
          if (!occupiedTables.includes(t)) {
            available.push(t);
          }
        }

        if (available.length) {
          c.table =
            available[
              Math.floor(Math.random() * available.length)
            ];

          const p = tablePosition(
            c.table,
            getSize().w,
            getSize().h
          );

          c.targetX = p.x;
          c.targetY = p.y + 55;
        }
      }

      moveToward(c, dt);

      if (distance(c.x, c.y, c.targetX, c.targetY) < 5) {
        c.state = "eating";
        c.timer = 0;
      }
    }

    else if (c.state === "eating") {

      c.timer += dt;

      if (c.timer > 4) {

        game.money += 25;
        game.sales++;
        game.reputation = Math.min(
          99,
          game.reputation + 0.05
        );

        c.state = "leave";

        c.targetX = getSize().w / 2;
        c.targetY = getSize().h + 40;
      }
    }

    else if (c.state === "leave") {

      moveToward(c, dt);

      if (c.y > getSize().h + 20) {
        game.customersList.splice(i, 1);
      }
    }
  }

  game.reputation = Math.round(game.reputation * 10) / 10;
}


function moveToward(obj, dt) {

  const dx = obj.targetX - obj.x;
  const dy = obj.targetY - obj.y;

  const d = Math.sqrt(dx * dx + dy * dy);

  if (d < 1) return;

  const speed = 90;

  obj.x += dx / d * speed * dt;
  obj.y += dy / d * speed * dt;
}


function distance(x1, y1, x2, y2) {

  return Math.sqrt(
    (x2 - x1) ** 2 +
    (y2 - y1) ** 2
  );
}


/* =========================
   البناء
========================= */

function startConstruction(type, cost, duration = 3000) {

  if (game.construction) {
    notify("⏳ فيه تطوير قاعد ينبني الآن");
    return;
  }

  if (game.money < cost) {
    notify("💸 ما عندك فلوس كفاية");
    return;
  }

  game.money -= cost;

  game.construction = {
    type,
    start: performance.now(),
    duration
  };

  constructionUI.classList.remove("hidden");

  if (type === "table") {
    constructionTitle.textContent =
      "👷 العامل يبني طاولة جديدة...";
  }

  if (type === "chef") {
    constructionTitle.textContent =
      "👨‍🍳 جاري تجهيز مكان الطباخ...";
  }

  if (type === "kitchen") {
    constructionTitle.textContent =
      "🏗️ جاري توسيع المطبخ...";
  }

  if (type === "delivery") {
    constructionTitle.textContent =
      "🛵 جاري تجهيز التوصيل...";
  }

  if (type === "expand") {
    constructionTitle.textContent =
      "🏗️ جاري توسيع مبنى المطعم...";
  }

  const worker = game.workers[0];

  if (worker) {

    worker.building = true;

    if (type === "table") {

      const p = tablePosition(
        game.tables,
        getSize().w,
        getSize().h
      );

      worker.targetX = p.x;
      worker.targetY = p.y;
    }

    else {

      worker.targetX = getSize().w / 2;
      worker.targetY = 170;
    }
  }
}


function finishConstruction(type) {

  if (type === "table") {

    game.tables++;

    notify("🪑 تم بناء الطاولة!");

  }

  if (type === "chef") {

    game.chefs++;

    ensureWorkers();

    notify("👨‍🍳 انضم طباخ جديد للمطعم!");

  }

  if (type === "kitchen") {

    game.kitchenLevel++;

    game.level++;

    notify("🍳 المطبخ توسّع!");

  }

  if (type === "delivery") {

    game.delivery = true;

    game.level++;

    notify("🛵 التوصيل أصبح متاحًا!");

  }

  if (type === "expand") {

    game.expansion++;

    game.level++;

    notify("🏪 المطعم توسّع!");

  }

  game.construction = null;

  constructionUI.classList.add("hidden");

  for (const worker of game.workers) {
    worker.building = false;
  }

  saveGame();
  updateUI();
}


function updateConstruction(now) {

  if (!game.construction) return;

  const c = game.construction;

  const elapsed = now - c.start;

  const percent =
    Math.min(100, elapsed / c.duration * 100);

  constructionProgress.style.width =
    percent + "%";

  constructionPercent.textContent =
    Math.floor(percent) + "%";

  if (elapsed >= c.duration) {
    finishConstruction(c.type);
  }
}


/* =========================
   رسم منطقة البناء
========================= */

function drawConstructionSpot() {

  if (!game.construction) return;

  const size = getSize();

  let x = size.w / 2;
  let y = 300;

  if (game.construction.type === "table") {

    const p = tablePosition(
      game.tables,
      size.w,
      size.h
    );

    x = p.x;
    y = p.y;
  }

  ctx.save();

  ctx.strokeStyle = "#ff9f1c";
  ctx.lineWidth = 3;

  ctx.setLineDash([8, 7]);

  ctx.strokeRect(
    x - 55,
    y - 50,
    110,
    100
  );

  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(255,159,28,.12)";
  ctx.fillRect(
    x - 55,
    y - 50,
    110,
    100
  );

  ctx.font = "25px Arial";
  ctx.textAlign = "center";
  ctx.fillText("🏗️", x, y + 8);

  ctx.restore();
}


/* =========================
   تحديث العمال
========================= */

function updateWorkers(dt) {

  for (const worker of game.workers) {

    moveToward(worker, dt);

    if (
      game.construction &&
      distance(
        worker.x,
        worker.y,
        worker.targetX,
        worker.targetY
      ) < 10
    ) {
      worker.building = true;
    }
  }
}


/* =========================
   الرسم الرئيسي
========================= */

function drawGame() {

  const size = getSize();

  const w = size.w;
  const h = size.h;

  ctx.clearRect(0, 0, w, h);

  drawFloor(w, h);
  drawWalls(w, h);

  drawKitchen(w, h);
  drawCounter(w, h);

  // الطاولات
  for (let i = 0; i < game.tables; i++) {

    const p = tablePosition(i, w, h);

    const occupied =
      game.customersList.some(
        c => c.table === i
      );

    drawTable(
      p.x,
      p.y,
      occupied
    );
  }

  drawConstructionSpot();

  drawDoor(w, h);
  drawDelivery(w, h);

  for (const customer of game.customersList) {
    drawCustomer(customer);
  }

  for (const worker of game.workers) {
    drawWorker(worker);
  }
}


/* =========================
   حلقة اللعبة
========================= */

let lastTime = performance.now();

function gameLoop(now) {

  const dt =
    Math.min(0.05, (now - lastTime) / 1000);

  lastTime = now;

  updateConstruction(now);
  updateWorkers(dt);
  updateCustomers(dt);

  drawGame();
  updateUI();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);


/* =========================
   الأزرار
========================= */

document.getElementById("tableBtn")
  .addEventListener("click", () => {

    startConstruction(
      "table",
      150,
      3000
    );

  });


document.getElementById("chefBtn")
  .addEventListener("click", () => {

    startConstruction(
      "chef",
      300,
      3000
    );

  });


document.getElementById("kitchenBtn")
  .addEventListener("click", () => {

    startConstruction(
      "kitchen",
      700,
      3000
    );

  });


document.getElementById("deliveryBtn")
  .addEventListener("click", () => {

    if (game.delivery) {
      notify("🛵 التوصيل موجود بالفعل");
      return;
    }

    startConstruction(
      "delivery",
      1200,
      3000
    );

  });


document.getElementById("expandBtn")
  .addEventListener("click", () => {

    startConstruction(
      "expand",
      2500,
      3000
    );

  });


/* =========================
   نظام الزبائن
========================= */

setInterval(() => {

  if (!game.construction) {
    spawnCustomer();
  }

}, 3000);


/* دخل بسيط من المطعم */

setInterval(() => {

  if (game.customersList.length > 0) {
    game.money += game.chefs * 2;
  }

  saveGame();
  updateUI();

}, 1000);


/* أول زبائن */

setTimeout(() => {
  spawnCustomer();
}, 800);

setTimeout(() => {
  spawnCustomer();
}, 1800);
