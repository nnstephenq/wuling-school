/*
 * 入口：把所有部分组装起来
 * WL.game 负责“点了以后做什么”：进场景、执行剧情、打开笔记本和地图、结局
 */
WL.game = {
  inGame: false,
  busy: false,          // 剧情进行中时，不能再点别的地方
  stopped: false,       // 进入结局后，停止后面的剧情
  showHints: false,     // “显示可调查”按钮
  notesChanged: false,

  // ---------- 开始 ----------
  boot() {
    const errors = WL.validate();
    if (errors.length) {
      const box = document.getElementById("error-box");
      box.style.display = "block";
      box.textContent = "剧情文件有地方写错了：\n\n" + errors.slice(0, 15).join("\n") +
        (errors.length > 15 ? `\n……还有 ${errors.length - 15} 个` : "");
      return;
    }
    this.title();
  },

  async title() {
    this.inGame = false;
    WL.overlay.clear();
    document.getElementById("scene-layer").innerHTML = "";
    WL.hud.render();
    const choice = await WL.screens.title();
    if (choice === "continue" && WL.state.load() && GAME_SCENES[WL.state.data.scene]) {
      this.inGame = true;
      this.lastSeenNotes = { facts: WL.state.data.facts.length, q: Object.keys(WL.state.data.questions) };
      this.refresh();
    } else {
      this.startNew();
    }
  },

  startNew() {
    WL.state.clearSave();
    WL.state.reset();
    this.lastSeenNotes = { facts: 0, q: [] };
    this.inGame = true;
    this.play(GAME_START);
  },

  // ---------- 执行一段剧情 ----------
  play(list) {
    return this.playFn(() => WL.actions.run(list));
  },

  refresh() {
    if (!this.inGame) return;
    if (WL.state.data.scene) WL.sceneView.render(WL.state.data.scene);
    WL.hud.render();
  },

  // ---------- 场景 ----------
  async enterScene(id) {
    const st = WL.state;
    st.data.scene = id;
    // 记住现在在地图上的哪个地点（教室、院长室这类子场景，沿用上一个地点）
    const pid = Object.keys(GAME_PLACES).find(k => GAME_PLACES[k].scenes.some(x => x.scene === id));
    if (pid) st.data.place = pid;
    WL.sceneView.render(id);
    WL.hud.render();
    const s = GAME_SCENES[id];
    if (s.firstEnter && !st.has("entered:" + id)) {
      st.set("entered:" + id);
      await WL.actions.run(s.firstEnter);
    }
  },

  onHotspot(sceneId, h) {
    if (this.busy) return;
    WL.state.set("seen:" + sceneId + ":" + h.id);
    let acts = h.do;
    if (h.cases) {
      const c = h.cases.find(c => !c.if || WL.cond(c.if));
      acts = c ? c.do : [];
    }
    this.play(acts);
  },

  onExit(x) {
    if (this.busy) return;
    this.play(x.to ? [{ goto: x.to }] : x.do);
  },

  // 和人物说话：选话题、出示物品，直到按“离开”
  onPerson(p) {
    if (this.busy) return;
    const talk = async () => {
      while (!this.stopped) {
        const topics = (p.topics || []).filter(t => !t.if || WL.cond(t.if));
        const labels = topics.map(t => t.label).concat(["出示物品", "离开"]);
        const idx = await WL.dialog.choose(labels, "要说什么？", p.id);
        if (idx === labels.length - 1) return;
        if (idx === labels.length - 2) {
          WL.dialog.close();
          const item = await WL.inventoryView.pick("要给" + GAME_CHARACTERS[p.id].name + "看哪一样？");
          if (!item) continue;
          await WL.actions.run((p.show && p.show[item]) || p.showDefault || ["对方没有什么反应。"]);
        } else {
          await WL.actions.run(topics[idx].do);
        }
      }
    };
    this.playFn(talk);
  },

  // 和 play 一样，但执行的是一个函数
  async playFn(fn) {
    if (this.busy) return;
    this.busy = true;
    this.stopped = false;
    this.notesChanged = false;
    try { await fn(); } finally { WL.dialog.close(); this.busy = false; }
    if (this.stopped) return;
    if (this.notesChanged) WL.util.toast("笔记本更新了");
    this.checkDeductions();
    WL.state.save();
    this.refresh();
  },

  // ---------- 笔记本、推理 ----------
  deductionReady() {
    return GAME_DEDUCTIONS.some(d => !WL.state.data.deductionsDone.includes(d.id) && WL.cond(d.if));
  },

  checkDeductions() {
    const st = WL.state.data;
    GAME_DEDUCTIONS.forEach(d => {
      if (!st.deductionsDone.includes(d.id) && WL.cond(d.if) && !st.notified.includes(d.id)) {
        st.notified.push(d.id);
        WL.util.toast("我好像想通了什么……打开笔记本看看");
      }
    });
  },

  async openNotebook() {
    const id = await WL.notebookView.open();
    WL.hud.render();
    if (!id) return;
    const d = GAME_DEDUCTIONS.find(x => x.id === id);
    const ok = await WL.deductionView.run(d);
    if (!ok) return;
    WL.state.data.deductionsDone.push(d.id);
    this.play(d.then);
  },

  openInventory() { return WL.inventoryView.open(); },

  async openMap() {
    const pid = await WL.mapView.open(WL.state.data.place);
    if (!pid) return;
    const p = GAME_PLACES[pid];
    const pick = p.scenes.find(x => !x.if || WL.cond(x.if));
    WL.state.data.place = pid;
    this.play([{ goto: pick.scene }]);
  },

  async openMenu() {
    const r = await WL.screens.menu();
    if (r === "title") this.title();
    if (r === "restart") this.startNew();
  },

  // ---------- 结案和结局 ----------
  async finalCase() {
    const fc = GAME_FINAL_CASE;
    await WL.actions.run(fc.intro);
    WL.dialog.close();
    const result = await WL.finalCaseView.open();
    if (!result) return;   // 按了“再想想”
    const allOk = result.every(x => x);
    if (!allOk) return this.ending(fc.bad);
    const secret = fc.secret && fc.secret.need.every(f => WL.state.has(f));
    return this.ending(fc.good, secret ? fc.secret.ending : null);
  },

  async ending(id, nextId) {
    this.stopped = true;
    this.inGame = false;
    WL.hud.render();
    WL.overlay.clear();
    const e = Object.assign({}, GAME_ENDINGS[id]);
    if (nextId) e.continueLabel = "继续";
    await WL.effects.ending(e);
    if (nextId) await WL.effects.ending(GAME_ENDINGS[nextId]);
    // 不在这里等标题画面，免得和正在执行的剧情缠在一起
    setTimeout(() => this.title(), 0);
  }
};

// 程序出错时，用中文显示在画面上，方便找问题
window.addEventListener("error", (e) => {
  const box = document.getElementById("error-box");
  box.style.display = "block";
  box.textContent = "程序出错了：" + e.message + "\n位置：" + (e.filename || "").split("/").pop() + " 第 " + e.lineno + " 行";
});

window.addEventListener("load", () => WL.game.boot());
