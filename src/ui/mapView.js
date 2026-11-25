/*
 * 村子地图：用程序画几个地点和连线，回传选中的地点 id
 */
WL.mapView = {
  open(currentPlace) {
    const { el } = WL.util;
    const open = WL.state.data.places;
    return WL.overlay.panel("村子地图", (box, close) => {
      const map = el("div", "map");
      const NS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.setAttribute("preserveAspectRatio", "none");
      open.forEach(id => {
        (GAME_PLACES[id].links || []).forEach(l => {
          if (!open.includes(l)) return;
          const a = GAME_PLACES[id], b = GAME_PLACES[l];
          const line = document.createElementNS(NS, "line");
          line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
          line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
          line.setAttribute("stroke", "rgba(232,228,218,0.25)");
          line.setAttribute("stroke-width", "0.4");
          line.setAttribute("stroke-dasharray", "1.2 1");
          svg.appendChild(line);
        });
      });
      map.appendChild(svg);
      open.forEach(id => {
        const p = GAME_PLACES[id];
        const n = el("div", "map-node" + (id === currentPlace ? " here" : ""));
        n.style.left = p.x + "%"; n.style.top = p.y + "%";
        n.appendChild(el("div", "dot"));
        n.appendChild(el("div", null, p.name + (id === currentPlace ? "（现在）" : "")));
        n.appendChild(el("div", "why", p.why));
        n.onclick = () => close(id);
        map.appendChild(n);
      });
      box.appendChild(map);
    });
  }
};
