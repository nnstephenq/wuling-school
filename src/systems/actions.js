/*
 * 执行剧情：把 scenes.js 里写的 do: [ ... ] 一句一句执行
 * 每一种写法是什么意思，见 scenes.js 开头的说明
 */
WL.actions = {
  STOP: "__STOP__",   // 进入结局时，停止后面的剧情

  async run(list) {
    for (const a of list || []) {
      await this.one(a);
      if (WL.game.stopped) return;
    }
  },

  async one(a) {
    const S = WL.state;
    const D = WL.dialog;

    // 一句话：旁白
    if (typeof a === "string") return D.line(null, a);

    // 人物说话：{ chen_yi: "..." } 或 { say: "chen_yi", text: "..." }
    if (a.say) return D.line(a.say, a.text);
    for (const k of Object.keys(a)) {
      if (GAME_CHARACTERS[k] && typeof a[k] === "string") return D.line(k, a[k]);
    }

    if (a.give) {
      D.close();
      S.addItem(a.give);
      await WL.viewer.item(a.give, true);
      return;
    }
    if (a.show) { D.close(); return WL.viewer.item(a.show, false); }
    if (a.image) { D.close(); return WL.viewer.image(a.image, a.caption); }

    if (a.set) { S.set(a.set); return; }
    if (a.unset) { S.unset(a.unset); return; }
    if (a.fact) { if (S.addFact(a.fact)) WL.game.notesChanged = true; return; }
    if (a.ask) { if (S.ask(a.ask)) WL.game.notesChanged = true; return; }
    if (a.solve) { if (S.solve(a.solve)) WL.game.notesChanged = true; return; }
    if (a.unlock) {
      if (S.unlock(a.unlock)) WL.util.toast("地图上出现了新地点：" + GAME_PLACES[a.unlock].name);
      return;
    }

    if (a.goto) { D.close(); return WL.game.enterScene(a.goto); }

    if (a.memory) {
      D.close();
      const sc = GAME_SCENES[S.data.scene] || {};
      return WL.effects.memory(a.memory, sc.bg);
    }
    if (a.chapter) { D.close(); return WL.effects.chapter(a.chapter); }
    if (a.caption) { D.close(); return WL.effects.caption(a.caption); }
    if (a.ghost) {
      D.close();
      if (a.flag) S.set(a.flag);
      return WL.effects.ghost(a.ghost.rect);
    }
    if (a.scare) { D.close(); return WL.effects.scare(a.scare); }
    if (a.slam) { D.close(); return WL.effects.slam(); }    if (a.wait) { return WL.util.wait(a.wait); }

    if (a.choice) {
      const visible = a.choice.filter(c => !c.if || WL.cond(c.if));
      const idx = await D.choose(visible.map(c => c.label), a.prompt);
      return this.run(visible[idx].do);
    }

    if (a.if !== undefined) {
      return this.run(WL.cond(a.if) ? a.then : a.else);
    }

    if (a.puzzle) {
      D.close();
      const ok = await WL.puzzleView.lock(a.puzzle);
      return this.run(ok ? a.ok : a.fail);
    }

    if (a.run) return this.run(GAME_SCRIPTS[a.run]);

    if (a.finalCase) { D.close(); return WL.game.finalCase(); }
    if (a.ending) { D.close(); return WL.game.ending(a.ending); }

    console.warn("看不懂的剧情：", a);
  }
};
