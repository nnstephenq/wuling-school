/*
 * 画出一个场景：背景、叠加图、临时物件、可以点的地方、人物和出口按钮
 * 这里只负责“画”，点了以后要做什么交给 WL.game
 */
WL.sceneView = {
  render(sceneId) {
    const { el, imgEl, place } = WL.util;
    const s = GAME_SCENES[sceneId];
    const root = document.getElementById("scene-layer");
    root.innerHTML = "";
    root.className = (GAME_CONFIG.showHotspots || WL.game.showHints ? "show-hotspots" : "") + (s.night ? " is-night" : "");

    // 背景
    if (s.bg) root.appendChild(imgEl(s.bg, "scene-bg" + (s.night ? " night" : "")));
    else root.appendChild(el("div", "scene-dark"));

    // 叠加图（遗像等）
    (s.overlays || []).forEach(o => {
      if (o.if && !WL.cond(o.if)) return;
      const d = place(el("div", "scene-overlay" + (o.style ? " overlay-" + o.style : "")), o.rect);
      d.appendChild(imgEl(o.image));
      root.appendChild(d);
    });

    // 用程序画的临时物件
    (s.props || []).forEach(p => {
      if (p.if && !WL.cond(p.if)) return;
      const d = place(el("div", "prop prop-" + p.type), p.rect);
      if (p.type === "keybox") {
        for (let i = 0; i < 10; i++) d.appendChild(el("span", i === 6 ? "empty" : ""));
      }
      root.appendChild(d);
    });

    // 夜晚的手电筒光
    if (s.night) {
      const f = el("div", "flashlight");
      root.appendChild(f);
      root.onmousemove = (e) => {
        const r = root.getBoundingClientRect();
        f.style.setProperty("--fx", ((e.clientX - r.left) / r.width * 100) + "%");
        f.style.setProperty("--fy", ((e.clientY - r.top) / r.height * 100) + "%");
      };
    } else {
      root.onmousemove = null;
    }

    // 可以点的地方
    (s.hotspots || []).forEach(h => {
      if (h.if && !WL.cond(h.if)) return;
      const d = place(el("div", "hotspot"), h.rect);
      if (WL.state.has("seen:" + sceneId + ":" + h.id)) d.classList.add("seen");
      d.appendChild(el("span", "hs-label", h.label));
      d.onclick = () => WL.game.onHotspot(sceneId, h);
      root.appendChild(d);
    });

    root.appendChild(el("div", "scene-title", s.name));

    // 底部：人物（左）和出口（右）
    const bar = el("div", "scene-bar");
    (s.people || []).forEach(p => {
      if (p.if && !WL.cond(p.if)) return;
      const c = el("button", "chip person", p.label || GAME_CHARACTERS[p.id].name);
      c.onclick = () => WL.game.onPerson(p);
      bar.appendChild(c);
    });
    bar.appendChild(el("div", "spacer"));
    (s.exits || []).forEach(x => {
      if (x.if && !WL.cond(x.if)) return;
      const c = el("button", "chip exit", x.label);
      c.onclick = () => WL.game.onExit(x);
      bar.appendChild(c);
    });
    root.appendChild(bar);
  }
};
