/*
 * 检查剧情文件有没有写错
 * 例如物品名字打错、场景不存在，网页一打开就会用中文告诉你错在哪里
 */
WL.validate = function () {
  const errors = [];
  const need = (obj, name) => {
    if (!window[obj]) errors.push(`找不到 ${name}（${obj}），检查 index.html 有没有载入这个文件。`);
  };
  need("GAME_CONFIG", "assets/config/config.js");
  need("GAME_CHARACTERS", "assets/story/characters.js");
  need("GAME_ITEMS", "assets/story/items.js");
  need("GAME_NOTEBOOK", "assets/story/notebook.js");
  need("GAME_PLACES", "assets/story/places.js");
  need("GAME_SCENES", "assets/story/scenes.js");
  need("GAME_DEDUCTIONS", "assets/story/deductions.js");
  need("GAME_ENDINGS", "assets/story/endings.js");
  if (errors.length) return errors;

  const items = GAME_ITEMS, scenes = GAME_SCENES, chars = GAME_CHARACTERS;
  const facts = GAME_NOTEBOOK.facts, qs = GAME_NOTEBOOK.questions;
  const known = ["say", "text", "me", "give", "show", "image", "caption", "set", "unset", "fact", "ask", "solve",
    "unlock", "goto", "memory", "chapter", "ghost", "flag", "choice", "if", "then", "else", "puzzle", "ok", "fail",
    "run", "finalCase", "ending", "wait", "scare", "slam", "prompt"];

  function checkCond(c, where) {
    if (!c) return;
    String(c).trim().split(/\s+/).forEach(t => {
      t = t.replace(/^!/, "");
      if (t.startsWith("item:") && !items[t.slice(5)]) errors.push(`${where}：条件里的物品“${t.slice(5)}”不存在（看 items.js）`);
      if (t.startsWith("fact:") && !facts[t.slice(5)]) errors.push(`${where}：条件里的“${t.slice(5)}”不在笔记本里（看 notebook.js）`);
    });
  }

  function checkActions(list, where) {
    if (!Array.isArray(list)) { errors.push(`${where}：剧情要写成 [ ... ] 的列表`); return; }
    list.forEach((a, i) => {
      const at = `${where} 第 ${i + 1} 句`;
      if (typeof a === "string") return;
      if (!a || typeof a !== "object") { errors.push(`${at}：看不懂的写法`); return; }
      Object.keys(a).forEach(k => {
        if (!known.includes(k) && !chars[k]) errors.push(`${at}：看不懂“${k}”。如果是人物说话，要先在 characters.js 里加上这个人物`);
      });
      if (a.scare && !(chars[a.scare] && chars[a.scare].portrait)) errors.push(`${at}：惊吓用的人物“${a.scare}”不存在，或没有立绘`);
      if (a.say && !chars[a.say]) errors.push(`${at}：人物“${a.say}”不存在（看 characters.js）`);
      ["give", "show"].forEach(k => { if (a[k] && !items[a[k]]) errors.push(`${at}：物品“${a[k]}”不存在（看 items.js）`); });
      if (a.fact && !facts[a.fact]) errors.push(`${at}：笔记本里没有“${a.fact}”这条已知的事`);
      ["ask", "solve"].forEach(k => { if (a[k] && !qs[a[k]]) errors.push(`${at}：笔记本里没有“${a[k]}”这个疑问`); });
      if (a.unlock && !GAME_PLACES[a.unlock]) errors.push(`${at}：地点“${a.unlock}”不存在（看 places.js）`);
      if (a.goto && !scenes[a.goto]) errors.push(`${at}：场景“${a.goto}”不存在`);
      if (a.ending && !GAME_ENDINGS[a.ending]) errors.push(`${at}：结局“${a.ending}”不存在（看 endings.js）`);
      if (a.run && !(window.GAME_SCRIPTS || {})[a.run]) errors.push(`${at}：GAME_SCRIPTS 里没有“${a.run}”`);
      if (a.if !== undefined) { checkCond(a.if, at); if (a.then) checkActions(a.then, at); if (a.else) checkActions(a.else, at); }
      if (a.choice) a.choice.forEach((c, j) => checkActions(c.do, `${at} 选项 ${j + 1}`));
      if (a.puzzle) { if (a.ok) checkActions(a.ok, at); if (a.fail) checkActions(a.fail, at); }
    });
  }

  if (window.GAME_START) checkActions(GAME_START, "GAME_START");
  Object.entries(window.GAME_SCRIPTS || {}).forEach(([k, v]) => checkActions(v, `GAME_SCRIPTS.${k}`));

  Object.entries(scenes).forEach(([sid, s]) => {
    const w = `场景 ${sid}`;
    if (s.firstEnter) checkActions(s.firstEnter, `${w} firstEnter`);
    (s.hotspots || []).forEach(h => {
      const hw = `${w} 的“${h.label || h.id}”`;
      if (!Array.isArray(h.rect) || h.rect.length !== 4) errors.push(`${hw}：rect 要写成 [左, 上, 宽, 高]`);
      checkCond(h.if, hw);
      if (h.do) checkActions(h.do, hw);
      (h.cases || []).forEach((c, j) => { checkCond(c.if, hw); checkActions(c.do, `${hw} 情况 ${j + 1}`); });
      if (!h.do && !h.cases) errors.push(`${hw}：要写 do 或 cases`);
    });
    (s.people || []).forEach(p => {
      const pw = `${w} 的人物 ${p.id}`;
      if (!chars[p.id]) errors.push(`${pw}：characters.js 里没有这个人物`);
      (p.topics || []).forEach(t => { checkCond(t.if, pw); checkActions(t.do, `${pw} 的话题“${t.label}”`); });
      Object.entries(p.show || {}).forEach(([it, acts]) => {
        if (!items[it]) errors.push(`${pw}：出示的物品“${it}”不存在`);
        checkActions(acts, `${pw} 出示 ${it}`);
      });
      if (p.showDefault) checkActions(p.showDefault, `${pw} showDefault`);
    });
    (s.exits || []).forEach(e => {
      if (e.to && !scenes[e.to]) errors.push(`${w} 的出口“${e.label}”：场景“${e.to}”不存在`);
      if (e.do) checkActions(e.do, `${w} 的出口“${e.label}”`);
    });
  });

  Object.entries(GAME_PLACES).forEach(([pid, p]) => {
    (p.scenes || []).forEach(x => { if (!scenes[x.scene]) errors.push(`地点 ${pid}：场景“${x.scene}”不存在`); });
    (p.links || []).forEach(l => { if (!GAME_PLACES[l]) errors.push(`地点 ${pid}：连线的地点“${l}”不存在`); });
  });
  GAME_CONFIG.startPlaces.forEach(p => { if (!GAME_PLACES[p]) errors.push(`config.js：startPlaces 里的“${p}”不存在`); });

  GAME_DEDUCTIONS.forEach(d => {
    checkCond(d.if, `推理 ${d.id}`);
    checkActions(d.then, `推理 ${d.id}`);
    if (!d.options.some(o => o.correct)) errors.push(`推理 ${d.id}：没有正确答案（correct: true）`);
  });

  const fc = window.GAME_FINAL_CASE;
  if (fc) {
    fc.claims.forEach((c, i) => c.answer.forEach(it => { if (!items[it]) errors.push(`结案第 ${i + 1} 件事：证据“${it}”不存在`); }));
    [fc.good, fc.bad, fc.secret && fc.secret.ending].forEach(e => { if (e && !GAME_ENDINGS[e]) errors.push(`结案：结局“${e}”不存在`); });
  }
  return errors;
};
