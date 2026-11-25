/*
 * 笔记本：已知的事、当前的疑问、可以推理的事
 * 回传要推理的推理 id（没有就是 null）
 */
WL.notebookView = {
  open() {
    const st = WL.state.data;
    const { el } = WL.util;
    const lastNew = WL.game.lastSeenNotes || { facts: 0, q: [] };
    return WL.overlay.panel("笔记本", (box, close) => {
      // 可以推理
      const ready = GAME_DEDUCTIONS.filter(d => !st.deductionsDone.includes(d.id) && WL.cond(d.if));
      if (ready.length) {
        const dbox = el("div", "deduce-box");
        dbox.appendChild(el("div", null, "我好像想通了一些事……"));
        ready.forEach(d => {
          const b = el("button", "btn primary", "推理：" + d.question);
          b.style.marginTop = "0.5em";
          b.onclick = () => close(d.id);
          dbox.appendChild(b);
        });
        box.appendChild(dbox);
      }

      box.appendChild(el("h3", null, "当前的疑问"));
      const qul = el("ul");
      const qids = Object.keys(st.questions);
      // 还没解答的排前面
      qids.sort((a, b) => (st.questions[a] === "done") - (st.questions[b] === "done"));
      qids.forEach(id => {
        const li = el("li", st.questions[id] === "done" ? "done" : "", GAME_NOTEBOOK.questions[id]);
        if (st.questions[id] !== "done" && !lastNew.q.includes(id)) li.classList.add("new");
        qul.appendChild(li);
      });
      if (!qids.length) qul.appendChild(el("li", null, "（还没有）"));
      box.appendChild(qul);

      box.appendChild(el("h3", null, "已知的事"));
      const ful = el("ul");
      st.facts.forEach((id, i) => {
        const li = el("li", i >= lastNew.facts ? "new" : "", GAME_NOTEBOOK.facts[id]);
        ful.appendChild(li);
      });
      if (!st.facts.length) ful.appendChild(el("li", null, "（还没有）"));
      box.appendChild(ful);

      WL.game.lastSeenNotes = { facts: st.facts.length, q: Object.keys(st.questions) };
      st.newNotes = false;
    }, { cls: "notebook" });
  }
};
