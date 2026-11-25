/*
 * 游戏进度：旗标、物品、笔记本、地图、现在在哪个场景
 * 进度会自动存在浏览器里，下次打开可以“继续游戏”
 */
WL.state = {
  data: null,

  fresh() {
    return {
      scene: null,
      flags: {},
      items: [],
      facts: [],
      questions: {},        // id → "open" 或 "done"
      places: GAME_CONFIG.startPlaces.slice(),
      deductionsDone: [],
      newNotes: false,      // 笔记本有没有新内容（按钮上的小红点）
      notified: []          // 已经提示过“可以推理了”的推理
    };
  },

  reset() { this.data = this.fresh(); },

  // ---- 旗标 ----
  has(flag) { return !!this.data.flags[flag]; },
  set(flag) { this.data.flags[flag] = true; },
  unset(flag) { delete this.data.flags[flag]; },

  // ---- 物品 ----
  hasItem(id) { return this.data.items.includes(id); },
  addItem(id) {
    if (this.hasItem(id)) return false;
    this.data.items.push(id);
    return true;
  },

  // ---- 笔记本 ----
  addFact(id) {
    if (this.data.facts.includes(id)) return false;
    this.data.facts.push(id);
    this.data.newNotes = true;
    return true;
  },
  hasFact(id) { return this.data.facts.includes(id); },
  ask(id) {
    if (this.data.questions[id]) return false;
    this.data.questions[id] = "open";
    this.data.newNotes = true;
    return true;
  },
  solve(id) {
    if (this.data.questions[id] === "done") return false;
    this.data.questions[id] = "done";
    this.data.newNotes = true;
    return true;
  },

  // ---- 地图 ----
  unlock(place) {
    if (this.data.places.includes(place)) return false;
    this.data.places.push(place);
    return true;
  },

  // ---- 存档 ----
  save() {
    try { localStorage.setItem(GAME_CONFIG.saveKey, JSON.stringify(this.data)); } catch (e) { /* 浏览器不让存，就算了 */ }
  },
  load() {
    try {
      const raw = localStorage.getItem(GAME_CONFIG.saveKey);
      if (!raw) return false;
      this.data = Object.assign(this.fresh(), JSON.parse(raw));
      return true;
    } catch (e) { return false; }
  },
  hasSave() {
    try { return !!localStorage.getItem(GAME_CONFIG.saveKey); } catch (e) { return false; }
  },
  clearSave() {
    try { localStorage.removeItem(GAME_CONFIG.saveKey); } catch (e) { /* 忽略 */ }
  }
};
