/*
 * 物品栏
 *   open()              看物品，点一下放大
 *   pick(标题)          选一样物品（出示给别人看），回传物品 id，取消回传 null
 */
WL.inventoryView = {
  cell(id) {
    const { el, imgEl } = WL.util;
    const it = GAME_ITEMS[id];
    const c = el("div", "inv-cell");
    if (it.image) c.appendChild(imgEl(it.image, "inv-thumb"));
    else c.appendChild(el("div", "inv-doc-thumb", it.doc ? "文" : "物"));
    c.appendChild(el("div", null, it.name));
    return c;
  },

  async open() {
    while (true) {
      const id = await WL.overlay.panel("物品", (box, close) => {
        const grid = WL.util.el("div", "inv-grid");
        WL.state.data.items.forEach(id => {
          const c = this.cell(id);
          c.onclick = () => close(id);
          grid.appendChild(c);
        });
        if (!WL.state.data.items.length) box.appendChild(WL.util.el("div", null, "（什么都没有）"));
        box.appendChild(grid);
      });
      if (!id) return;
      await WL.viewer.item(id, false);
    }
  },

  pick(title) {
    return WL.overlay.panel(title || "要出示哪一样？", (box, close) => {
      const grid = WL.util.el("div", "inv-grid");
      WL.state.data.items.forEach(id => {
        const c = this.cell(id);
        c.onclick = () => close(id);
        grid.appendChild(c);
      });
      box.appendChild(grid);
    });
  }
};
