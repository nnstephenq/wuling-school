/*
 * 放大显示：物品、文件、照片
 */
WL.viewer = {
  // 画出物品（图片或文件纸张），放进 container
  renderItem(container, id) {
    const { el, imgEl, richText } = WL.util;
    const it = GAME_ITEMS[id];
    if (it.image) {
      const wrap = el("div", "viewer-img-wrap");
      const im = imgEl(it.image);
      wrap.appendChild(im);
      if (it.text) {
        const t = el("div", "img-text", it.text.text);
        t.style.left = it.text.x + "%"; t.style.top = it.text.y + "%";
        t.style.transform = "translate(-50%, -50%) rotate(-2deg)";
        wrap.appendChild(t);
      }
      if (it.tag) {
        const t = el("div", "key-tag", it.tag.text);
        t.style.left = it.tag.x + "%"; t.style.top = it.tag.y + "%";
        wrap.appendChild(t);
      }
      if (it.ghost) {
        const g = el("div", "scene-overlay");
        g.style.left = it.ghost.x + "%"; g.style.top = it.ghost.y + "%";
        g.style.width = it.ghost.w + "%"; g.style.height = it.ghost.h + "%";
        g.style.opacity = "0.35"; g.style.filter = "blur(1.2px)";
        g.appendChild(imgEl("characters/lang_silhouette.png"));
        wrap.appendChild(g);
      }
      container.appendChild(wrap);
    } else if (it.doc) {
      const d = el("div", "doc" + (it.doc.hand ? " hand" : ""));
      if (it.doc.title) d.appendChild(el("div", "doc-title", it.doc.title));
      richText(d, it.doc.text);
      container.appendChild(d);
    }
  },

  item(id, isNew) {
    const it = GAME_ITEMS[id];
    return WL.overlay.open(close => {
      const { el } = WL.util;
      const back = el("div", "panel-backdrop viewer-backdrop");
      const v = el("div", "viewer");
      v.appendChild(el("div", "viewer-name", (isNew ? "得到：" : "") + it.name));
      this.renderItem(v, id);
      if (it.desc) v.appendChild(el("div", "viewer-caption", it.desc));
      v.appendChild(el("div", "dialog-next", "▼ 点击继续"));
      back.appendChild(v);
      back.onclick = () => close();
      return back;
    });
  },

  image(path, caption) {
    return WL.overlay.open(close => {
      const { el, imgEl } = WL.util;
      const back = el("div", "panel-backdrop viewer-backdrop");
      const v = el("div", "viewer");
      const wrap = el("div", "viewer-img-wrap");
      wrap.appendChild(imgEl(path));
      v.appendChild(wrap);
      if (caption) v.appendChild(el("div", "viewer-caption", caption));
      v.appendChild(el("div", "dialog-next", "▼ 点击继续"));
      back.appendChild(v);
      back.onclick = () => close();
      return back;
    });
  }
};
