/* 工具函数：大家都会用到的小功能 */
window.WL = window.WL || {};

WL.util = {
  // 建立一个网页元素：el("div", "class名", "文字")
  el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  },

  // 图片完整路径
  img(path) {
    return GAME_CONFIG.imageRoot + path;
  },

  // 建立图片；图片找不到时自动隐藏，不让游戏坏掉
  imgEl(path, cls) {
    const i = WL.util.el("img", cls);
    i.src = WL.util.img(path);
    i.alt = "";
    i.onerror = () => { i.style.visibility = "hidden"; };
    return i;
  },

  // 用百分比 [左, 上, 宽, 高] 摆放元素
  place(e, rect) {
    e.style.left = rect[0] + "%";
    e.style.top = rect[1] + "%";
    e.style.width = rect[2] + "%";
    e.style.height = rect[3] + "%";
    return e;
  },

  wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  },

  // 把文字里的 [[重点]] 变成标记，其他字照原样显示（防止文字被当成网页代码）
  richText(container, text) {
    const parts = String(text).split(/(\[\[.*?\]\])/s);
    parts.forEach(p => {
      if (p.startsWith("[[") && p.endsWith("]]")) {
        container.appendChild(WL.util.el("mark", null, p.slice(2, -2)));
      } else if (p) {
        container.appendChild(document.createTextNode(p));
      }
    });
    return container;
  },

  // 在右上角显示一个小提示
  toast(text) {
    const box = document.getElementById("toast");
    if ([...box.children].some(c => c.textContent === text)) return;   // 同样的提示不重复显示
    const t = WL.util.el("div", null, text);
    box.appendChild(t);
    setTimeout(() => t.remove(), 3300);
  }
};
