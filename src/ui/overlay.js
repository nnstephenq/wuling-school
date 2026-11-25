/*
 * 弹出画面的管理：打开一个画面，关掉时通知等待的人
 */
WL.overlay = {
  layer() { return document.getElementById("overlay-layer"); },

  // build(close) 负责建立画面并返回元素；close(结果) 会关掉画面，并把结果交给等待的人
  open(build) {
    return new Promise(resolve => {
      let node = null;
      const close = (result) => {
        if (node && node.parentNode) node.remove();
        resolve(result);
      };
      node = build(close);
      this.layer().appendChild(node);
    });
  },

  // 常用的面板：半透明背景 + 中间一个框，点框外面或“关闭”按钮就关掉
  panel(title, fill, opts = {}) {
    return this.open(close => {
      const back = WL.util.el("div", "panel-backdrop");
      const box = WL.util.el("div", "panel " + (opts.cls || ""));
      if (opts.closable !== false) {
        const x = WL.util.el("button", "btn close", "关闭");
        x.onclick = () => close(null);
        box.appendChild(x);
        back.onclick = (e) => { if (e.target === back) close(null); };
      }
      if (title) box.appendChild(WL.util.el("h2", null, title));
      fill(box, close);
      back.appendChild(box);
      return back;
    });
  },

  clear() { this.layer().innerHTML = ""; }
};
