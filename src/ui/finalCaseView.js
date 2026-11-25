/*
 * 最后的结案：每件事选两条证据。全部选好后按“摆出证据”
 * 回传每件事是否证明成功的列表，例如 [true, true, false, true]
 */
WL.finalCaseView = {
  open() {
    const fc = GAME_FINAL_CASE;
    const { el } = WL.util;
    const picks = fc.claims.map(() => [null, null]);
    let active = 0;

    return WL.overlay.panel("当着全村人，说出真相", (box, close) => {
      box.appendChild(el("div", "viewer-caption", "每一件事，都要交出两样证据。先点一件事，再点下面的证据放进去；记不清内容就按“查看”。"));
      const claimsBox = el("div", "claims");
      const grid = el("div", "inv-grid");
      const submit = el("button", "btn primary", "摆出证据");
      submit.style.marginTop = "1em";

      const draw = () => {
        claimsBox.innerHTML = "";
        fc.claims.forEach((c, i) => {
          const cb = el("div", "claim" + (i === active ? " active" : ""));
          cb.appendChild(el("div", null, `${i + 1}. ${c.text}`));
          const slots = el("div", "slots");
          picks[i].forEach((p, j) => {
            const s = el("div", "slot" + (p ? " filled" : ""), p ? GAME_ITEMS[p].name : "（选一样证据）");
            s.onclick = () => { active = i; if (p) picks[i][j] = null; draw(); };
            slots.appendChild(s);
          });
          cb.appendChild(slots);
          cb.onclick = (e) => { if (!e.target.classList.contains("slot")) { active = i; draw(); } };
          claimsBox.appendChild(cb);
        });
        const used = picks.flat();
        grid.innerHTML = "";
        WL.state.data.items.filter(id => GAME_ITEMS[id].evidence).forEach(id => {
          const cell = WL.inventoryView.cell(id);
          if (used.includes(id)) cell.classList.add("picked");
          // “查看”按钮：放大看这份证据的内容，看完回到这里
          const look = el("button", "btn look", "查看");
          look.onclick = (e) => { e.stopPropagation(); WL.viewer.item(id, false); };
          cell.appendChild(look);
          cell.onclick = () => {
            const row = picks[active];
            if (row.includes(id)) return;
            const free = row.indexOf(null);
            if (free === -1) return;
            row[free] = id;
            if (!row.includes(null) && active < picks.length - 1) active++;
            draw();
          };
          grid.appendChild(cell);
        });
        submit.disabled = picks.some(r => r.includes(null));
      };

      submit.onclick = () => {
        close(fc.claims.map((c, i) => c.answer.every(a => picks[i].includes(a))));
      };
      box.appendChild(claimsBox);
      box.appendChild(el("h3", null, "我手上的证据"));
      box.appendChild(grid);
      const later = el("button", "btn", "再想想（先回去看看证据）");
      later.style.margin = "1em 0 0 0.8em";
      later.onclick = () => close(null);
      box.appendChild(submit);
      box.appendChild(later);
      draw();
    }, { closable: false, cls: "final-case" });
  }
};
