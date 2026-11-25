/*
 * 右上角的按钮：笔记本、物品、地图、显示可调查的地方、菜单
 */
WL.hud = {
  render() {
    const { el } = WL.util;
    const hud = document.getElementById("hud");
    hud.innerHTML = "";
    hud.className = WL.game.inGame ? "" : "hidden";
    if (!WL.game.inGame || !WL.state.data) return;
    const scene = GAME_SCENES[WL.state.data.scene] || {};

    const add = (label, fn, alert) => {
      const b = el("button", "chip" + (alert ? " alert" : ""), label);
      b.onclick = () => { if (!WL.game.busy) fn(); };
      hud.appendChild(b);
    };
    add("笔记本", () => WL.game.openNotebook(), WL.state.data.newNotes || WL.game.deductionReady());
    add("物品", () => WL.game.openInventory());
    if (!scene.noMap && WL.state.has("ch1")) add("地图", () => WL.game.openMap());
    add(WL.game.showHints ? "隐藏提示" : "显示可调查", () => {
      WL.game.showHints = !WL.game.showHints;
      WL.game.refresh();
    });
    add("菜单", () => WL.game.openMenu());
  }
};
