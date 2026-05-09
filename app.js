const STORAGE_KEY = "kpk_zony_styled_mvp_v1";

const defaultData = {
  player: { name: "Лис", hp: 8, hpMax: 12, fatigue: 2, radiation: 1, ammo: 15 },
  scene: {
    name: "Старий блокпост",
    description: "Туман стелиться між бетонними плитами. Біля іржавої вантажівки чути приглушені голоси. З підвалу тягне холодом, мокрим бетоном і металом.",
    sounds: "Тріск лічильника Гейгера, далекий гавкіт, металевий стукіт з підвалу.",
    smells: "Мокрий бетон, гар, іржа, стара кров.",
    objects: ["іржава вантажівка", "бетонні плити", "розбитий шлагбаум", "вхід у підвал", "кущі праворуч"]
  },
  enemies: [
    { name: "Автоматник", state: "цілий", color: "green", position: "біля воріт", danger: "дуже висока", action: "готує чергу", visible: true },
    { name: "Бандит з обрізом", state: "поранений", color: "orange", position: "за машиною", danger: "висока зблизька", action: "перезаряджається", visible: true },
    { name: "Боягуз", state: "наляканий", color: "yellow", position: "біля паркану", danger: "низька", action: "відступає", visible: true }
  ],
  inventory: [
    { item: "Аптечка", count: 2, note: "лікує поранення під час перепочинку" },
    { item: "Антирад", count: 1, note: "знижує радіацію за рішенням майстра" },
    { item: "Болти", count: 6, note: "для перевірки аномалій" },
    { item: "Автомат", count: 1, note: "дозволяє стріляти чергою" }
  ],
  journal: [
    { time: nowTime(), text: "КПК активовано. Сигнал нестабільний. Дані сцени завантажено." }
  ]
};

let data = load();

function nowTime(){
  const d = new Date();
  return d.toLocaleTimeString("uk-UA", {hour:"2-digit", minute:"2-digit"});
}

function load(){
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if(saved) return JSON.parse(saved);
  } catch(e){}
  return structuredClone(defaultData);
}

function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clamp(num, min, max){ return Math.max(min, Math.min(max, Number(num)||0)); }

function dots(current, max, mode="normal"){
  const val = clamp(current,0,max);
  let out = "";
  for(let i=1;i<=max;i++){
    let cls = "dot";
    if(i<=val) cls += " filled";
    if(mode==="rad" && i<=val) cls += val>=4 ? " danger" : " warn";
    if(mode==="fatigue" && i<=val) cls += val>=4 ? " danger" : "";
    out += `<span class="${cls}"></span>`;
  }
  return out;
}

function enemyColorClass(color){
  if(color === "green") return "state-green";
  if(color === "orange") return "state-orange";
  if(color === "yellow") return "state-yellow";
  if(color === "red") return "state-red";
  return "";
}

function render(){
  const p = data.player;
  qs("#characterName").textContent = p.name;
  qs("#hpNow").textContent = p.hp;
  qs("#hpMax").textContent = p.hpMax;
  qs("#fatigueNow").textContent = p.fatigue;
  qs("#radiationNow").textContent = p.radiation;
  qs("#ammoNow").textContent = p.ammo;
  qs("#hpDots").innerHTML = dots(p.hp, p.hpMax);
  qs("#fatigueDots").innerHTML = dots(p.fatigue, 5, "fatigue");
  qs("#radDots").innerHTML = dots(p.radiation, 7, "rad");
  qs("#ammoDots").innerHTML = dots(Math.min(p.ammo, 6), 6);

  const s = data.scene;
  qs("#sceneNameShort").textContent = s.name;
  qs("#sceneDescShort").textContent = shortText(s.description, 70);
  qs("#sceneName").textContent = s.name;
  qs("#sceneDescription").textContent = s.description;
  qs("#sceneSounds").textContent = s.sounds;
  qs("#sceneSmells").textContent = s.smells;
  qs("#sceneObjects").innerHTML = s.objects.map(o => `<li>${escapeHtml(o)}</li>`).join("");

  const visible = data.enemies.filter(e => e.visible !== false);
  qs("#stateEnemies").innerHTML = visible.map(enemyRow).join("");
  qs("#enemyCards").innerHTML = visible.map(enemyCard).join("");
  qs("#inventoryList").innerHTML = data.inventory.map(invItem).join("");
  qs("#journalList").innerHTML = data.journal.slice().reverse().map(logItem).join("");

  fillMaster();
  save();
}

function enemyRow(e){
  const icon = e.color === "green" ? "⌁" : e.color === "orange" ? "✚" : e.color === "yellow" ? ")))" : "!";
  return `<div class="enemy-row">
    <div class="enemy-thumb"></div>
    <div><h4>${escapeHtml(e.name)}</h4><p class="${enemyColorClass(e.color)}">${escapeHtml(e.state)}</p></div>
    <div class="enemy-icon ${enemyColorClass(e.color)}">${icon}</div><div class="chev">›</div>
  </div>`;
}

function enemyCard(e){
  return `<article class="enemy-card">
    <h4>${escapeHtml(e.name)}</h4>
    <p><strong>Стан:</strong> <span class="${enemyColorClass(e.color)}">${escapeHtml(e.state)}</span></p>
    <p><strong>Позиція:</strong> ${escapeHtml(e.position)}</p>
    <p><strong>Небезпека:</strong> ${escapeHtml(e.danger)}</p>
    <p><strong>Що робить:</strong> ${escapeHtml(e.action)}</p>
  </article>`;
}

function invItem(i){
  return `<div class="inventory-item"><div><h4>${escapeHtml(i.item)}</h4><p>${escapeHtml(i.note || "")}</p></div><div class="inventory-count">${escapeHtml(String(i.count))}</div></div>`;
}

function logItem(j){
  return `<div class="journal-entry"><time>${escapeHtml(j.time)}</time>${escapeHtml(j.text)}</div>`;
}

function fillMaster(){
  const p = data.player, s = data.scene;
  setVal("#gmName", p.name); setVal("#gmHp", p.hp); setVal("#gmHpMax", p.hpMax);
  setVal("#gmFatigue", p.fatigue); setVal("#gmRad", p.radiation); setVal("#gmAmmo", p.ammo);
  setVal("#gmSceneName", s.name); setVal("#gmSceneDescription", s.description); setVal("#gmSceneSounds", s.sounds);
  setVal("#gmSceneSmells", s.smells); setVal("#gmSceneObjects", s.objects.join(", "));

  qs("#gmEnemies").innerHTML = data.enemies.map((e, idx) => `
    <div class="gm-row">
      <label>Назва <input data-enemy="${idx}" data-field="name" value="${escapeAttr(e.name)}"></label>
      <label>Стан <input data-enemy="${idx}" data-field="state" value="${escapeAttr(e.state)}"></label>
      <label>Колір
        <select data-enemy="${idx}" data-field="color">
          ${["green","orange","yellow","red"].map(c => `<option value="${c}" ${e.color===c?"selected":""}>${c}</option>`).join("")}
        </select>
      </label>
      <label>Позиція <input data-enemy="${idx}" data-field="position" value="${escapeAttr(e.position)}"></label>
      <label>Небезпека <input data-enemy="${idx}" data-field="danger" value="${escapeAttr(e.danger)}"></label>
      <label>Дія <input data-enemy="${idx}" data-field="action" value="${escapeAttr(e.action)}"></label>
      <label><input type="checkbox" data-enemy="${idx}" data-field="visible" ${e.visible!==false?"checked":""}> Видимий</label>
      <button class="metal-btn danger" data-remove-enemy="${idx}">Прибрати</button>
    </div>
  `).join("");

  qs("#gmInventory").innerHTML = data.inventory.map((it, idx) => `
    <div class="gm-row">
      <label>Річ <input data-item="${idx}" data-field="item" value="${escapeAttr(it.item)}"></label>
      <label>Кількість <input type="number" data-item="${idx}" data-field="count" value="${escapeAttr(String(it.count))}"></label>
      <label>Примітка <input data-item="${idx}" data-field="note" value="${escapeAttr(it.note || "")}"></label>
      <button class="metal-btn danger" data-remove-item="${idx}">Прибрати</button>
    </div>
  `).join("");
}

function setVal(sel, val){
  const el = qs(sel);
  if(el && el.value !== String(val)) el.value = val;
}

function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return [...document.querySelectorAll(sel)]; }
function shortText(t, n){ return t.length > n ? t.slice(0,n-1) + "…" : t; }
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function escapeAttr(str){ return escapeHtml(str).replace(/"/g, "&quot;");}

function switchScreen(target){
  qsa(".screen").forEach(s => s.classList.toggle("active", s.dataset.screen === target));
  qsa(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.target === target));
  qs("#rollResult").hidden = true;
  window.scrollTo({top:0, behavior:"smooth"});
}

function rollDie(sides=20){ return Math.floor(Math.random()*sides)+1; }

function rollD20(count, modifier=0){
  const dice = Array.from({length:count}, () => rollDie(20));
  return { dice, totals: dice.map(d => d + modifier), modifier };
}

function doAction(action){
  const p = data.player;
  let count = 1, mod = 0, cost = 0, title = "", extra = "";
  if(action === "shoot_aimed"){ count = 1; mod = 2; cost = 1; title = "Точний постріл"; extra = "1 набій, +2 до точності."; }
  if(action === "shoot_normal"){ count = 2; mod = 0; cost = 2; title = "Бойовий постріл"; extra = "2 набої, кожне влучання окремо."; }
  if(action === "shoot_burst"){ count = 3; mod = -2; cost = 3; title = "Черга"; extra = "3 набої, -2, після черги діє Віддача."; }
  if(action === "look"){ count = 1; mod = 0; cost = 0; title = "Огляд"; extra = "1d20 + Сприйняття. Додай модифікатор персонажа вручну."; }

  if(cost && p.ammo < cost){
    showToast("Недостатньо набоїв.");
    addLog(`Спроба дії «${title}»: недостатньо набоїв.`);
    render();
    return;
  }
  if(cost) p.ammo -= cost;

  const r = rollD20(count, mod);
  const rollText = mod ? `${count}d20 ${mod>0?"+":""}${mod}` : `${count}d20`;
  const result = qs("#rollResult");
  result.hidden = false;
  result.innerHTML = `<h4>${title}</h4>
    <div>${escapeHtml(extra)}</div>
    <div class="roll-dice">🎲 ${r.dice.join(" · ")}</div>
    <div><strong>Кидок:</strong> ${rollText}</div>
    <div><strong>Підсумок:</strong> ${r.totals.join(" · ")}</div>
    ${cost ? `<div><strong>Набої:</strong> -${cost}, лишилось ${p.ammo}</div>` : ""}`;
  addLog(`${title}: ${rollText}. Кубики: ${r.dice.join(", ")}. Підсумок: ${r.totals.join(", ")}${cost ? `. Набої: ${p.ammo}` : ""}.`);
  render();
  triggerFlicker();
}

function addLog(text){
  data.journal.push({time: nowTime(), text});
  if(data.journal.length > 80) data.journal = data.journal.slice(-80);
  save();
}

function showToast(text){
  const t = qs("#toast");
  t.textContent = text;
  t.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.hidden = true, 2400);
}

function triggerFlicker(){
  document.body.animate([
    { filter:"brightness(1)" },
    { filter:"brightness(1.16) contrast(1.07)" },
    { filter:"brightness(.92)" },
    { filter:"brightness(1)" }
  ], { duration: 420, easing:"steps(3)" });
}

function randomKpkWarning(){
  const options = [
    "КПК: зафіксовано аномальну активність. Болти рекомендовано тримати напоготові.",
    "КПК: рівень перешкод зріс. Радіосигнал нестабільний.",
    "КПК: рух праворуч. Джерело не ідентифіковано.",
    "КПК: температура впала. Можлива прихована аномалія.",
    "КПК: пульс нестабільний. Перевір стан персонажа."
  ];
  const msg = options[Math.floor(Math.random()*options.length)];
  addLog(msg);
  showToast(msg);
  triggerFlicker();
  render();
}

document.addEventListener("click", e => {
  const nav = e.target.closest(".nav-btn");
  if(nav) switchScreen(nav.dataset.target);

  const open = e.target.closest("[data-open]");
  if(open) switchScreen(open.dataset.open);

  const action = e.target.closest("[data-action]");
  if(action) doAction(action.dataset.action);

  const hpDelta = e.target.closest("[data-delta-hp]");
  if(hpDelta){ data.player.hp = clamp(data.player.hp + Number(hpDelta.dataset.deltaHp), 0, data.player.hpMax); addLog(`HP змінено: ${data.player.hp}/${data.player.hpMax}.`); render(); }

  const fDelta = e.target.closest("[data-delta-fatigue]");
  if(fDelta){ data.player.fatigue = clamp(data.player.fatigue + Number(fDelta.dataset.deltaFatigue), 0, 5); addLog(`Втома: ${data.player.fatigue}/5.`); render(); }

  if(e.target.id === "savePlayer"){
    data.player.name = qs("#gmName").value.trim() || "Сталкер";
    data.player.hpMax = Math.max(1, Number(qs("#gmHpMax").value)||1);
    data.player.hp = clamp(qs("#gmHp").value, 0, data.player.hpMax);
    data.player.fatigue = clamp(qs("#gmFatigue").value, 0, 5);
    data.player.radiation = clamp(qs("#gmRad").value, 0, 7);
    data.player.ammo = Math.max(0, Number(qs("#gmAmmo").value)||0);
    addLog("Майстер оновив стан персонажа.");
    showToast("Стан збережено.");
    render();
  }

  if(e.target.id === "saveScene"){
    data.scene.name = qs("#gmSceneName").value.trim() || "Невідома локація";
    data.scene.description = qs("#gmSceneDescription").value.trim();
    data.scene.sounds = qs("#gmSceneSounds").value.trim();
    data.scene.smells = qs("#gmSceneSmells").value.trim();
    data.scene.objects = qs("#gmSceneObjects").value.split(",").map(x=>x.trim()).filter(Boolean);
    addLog(`Сцену оновлено: ${data.scene.name}.`);
    showToast("Сцену оновлено.");
    render();
  }

  if(e.target.id === "addEnemy"){
    data.enemies.push({name:"Новий ворог", state:"цілий", color:"green", position:"невідомо", danger:"середня", action:"чекає", visible:true});
    render();
  }

  const remEnemy = e.target.closest("[data-remove-enemy]");
  if(remEnemy){ data.enemies.splice(Number(remEnemy.dataset.removeEnemy),1); render(); }

  if(e.target.id === "addItem"){
    data.inventory.push({item:"Нова річ", count:1, note:""});
    render();
  }

  const remItem = e.target.closest("[data-remove-item]");
  if(remItem){ data.inventory.splice(Number(remItem.dataset.removeItem),1); render(); }

  if(e.target.id === "addKpkMsg") randomKpkWarning();

  if(e.target.id === "clearJournal"){
    data.journal = [{time:nowTime(), text:"Журнал очищено."}];
    render();
  }

  if(e.target.id === "exportData"){
    qs("#exportBox").value = JSON.stringify(data, null, 2);
    showToast("JSON підготовлено.");
  }

  if(e.target.id === "resetData"){
    if(confirm("Скинути всі локальні дані MVP?")){
      data = structuredClone(defaultData);
      addLog("Дані скинуто до стартового стану.");
      render();
    }
  }
});

document.addEventListener("input", e => {
  const enemyInput = e.target.closest("[data-enemy]");
  if(enemyInput){
    const idx = Number(enemyInput.dataset.enemy);
    const field = enemyInput.dataset.field;
    if(field === "visible") data.enemies[idx][field] = enemyInput.checked;
    else data.enemies[idx][field] = enemyInput.value;
    save();
    render();
    return;
  }

  const itemInput = e.target.closest("[data-item]");
  if(itemInput){
    const idx = Number(itemInput.dataset.item);
    const field = itemInput.dataset.field;
    data.inventory[idx][field] = field === "count" ? Number(itemInput.value)||0 : itemInput.value;
    save();
    render();
  }
});

qs("#importData").addEventListener("change", async e => {
  const file = e.target.files[0];
  if(!file) return;
  try{
    const text = await file.text();
    const imported = JSON.parse(text);
    if(!imported.player || !imported.scene) throw new Error("bad file");
    data = imported;
    addLog("Імпортовано дані з JSON.");
    render();
    showToast("Імпорт виконано.");
  }catch(err){
    showToast("Не вдалося імпортувати JSON.");
  }
});

setInterval(() => {
  const d = new Date();
  qs("#clock").textContent = d.toLocaleTimeString("uk-UA", {hour:"2-digit", minute:"2-digit"});
}, 10000);

if("serviceWorker" in navigator){
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}

render();
