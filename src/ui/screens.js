/*
 * 标题画面和菜单
 */
WL.screens = {
  title() {
    return WL.overlay.open(close => {
      const { el, imgEl } = WL.util;
      const fs = el("div", "fullscreen");
      fs.appendChild(imgEl("scenes/playground.jpg", "title-bg"));
      const c = el("div", "title-content");
      c.appendChild(el("div", "title-name", GAME_CONFIG.title));
      c.appendChild(el("div", "title-sub", GAME_CONFIG.subtitle));
      const menu = el("div", "title-menu");
      if (WL.state.hasSave()) {
        const cont = el("button", "btn primary", "继续游戏");
        cont.onclick = () => close("continue");
        menu.appendChild(cont);
      }
      const nw = el("button", "btn" + (WL.state.hasSave() ? "" : " primary"), "新游戏");
      nw.onclick = () => close("new");
      menu.appendChild(nw);
      c.appendChild(menu);
      fs.appendChild(c);
      return fs;
    });
  },

  menu() {
    return WL.overlay.panel("菜单", (box, close) => {
      const { el } = WL.util;
      const col = el("div", "title-menu");
      const back = el("button", "btn", "继续");
      back.onclick = () => close(null);
      const title = el("button", "btn", "回到标题（进度已自动保存）");
      title.onclick = () => close("title");
      const restart = el("button", "btn", "从头开始（会清除进度）");
      restart.onclick = () => close("restart");
      col.append(back, title, restart);
      box.appendChild(col);
    });
  }
};
