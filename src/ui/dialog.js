/*
 * 对话框：一句一句显示文字，点一下继续
 * 连续几句话时，对话框会一直开着，剧情结束才关掉，避免画面闪烁
 */
WL.dialog = {
  node: null,
  box: null,

  ensure() {
    if (this.node) return;
    const { el } = WL.util;
    this.node = el("div", "dialog-wrap");
    this.portrait = el("div", "dialog-portrait");
    this.box = el("div", "dialog-box");
    this.name = el("div", "dialog-name");
    this.text = el("div", "dialog-text");
    this.next = el("div", "dialog-next", "▼ 点击继续");
    this.choices = el("div", "dialog-choices");
    this.box.append(this.name, this.text, this.choices, this.next);
    this.node.append(this.portrait, this.box);
    WL.overlay.layer().appendChild(this.node);
  },

  close() {
    if (this.node) this.node.remove();
    this.node = null;
  },

  setSpeaker(who) {
    const ch = who ? GAME_CHARACTERS[who] : null;
    this.name.textContent = ch ? ch.name : "";
    this.name.style.display = ch ? "" : "none";
    this.text.className = "dialog-text" + (ch ? "" : " narration");
    this.portrait.innerHTML = "";
    if (ch && ch.portrait) {
      this.portrait.style.display = "";
      this.portrait.appendChild(WL.util.imgEl(ch.portrait));
    } else {
      this.portrait.style.display = "none";
    }
  },

  // 显示一句话。who 是人物 id，不写就是旁白
  line(who, text) {
    this.ensure();
    this.setSpeaker(who);
    this.choices.innerHTML = "";
    this.next.style.display = "";
    return new Promise(resolve => {
      const full = String(text);
      const speed = GAME_CONFIG.typeSpeed || 0;
      let i = speed ? 0 : full.length;
      let timer = null;
      const render = () => { this.text.textContent = full.slice(0, i); };
      render();
      if (i < full.length) {
        timer = setInterval(() => {
          i++; render();
          if (i >= full.length) { clearInterval(timer); timer = null; }
        }, speed);
      }
      this.node.onclick = () => {
        if (timer) { clearInterval(timer); timer = null; i = full.length; render(); return; }
        this.node.onclick = null;
        resolve();
      };
    });
  },

  // 显示几个选项，回传选中的是第几个
  choose(labels, prompt, who) {
    this.ensure();
    this.setSpeaker(who || null);
    this.text.textContent = prompt || "";
    this.next.style.display = "none";
    this.node.onclick = null;
    this.choices.innerHTML = "";
    return new Promise(resolve => {
      labels.forEach((label, idx) => {
        const b = WL.util.el("button", "btn", label);
        b.onclick = (e) => { e.stopPropagation(); this.choices.innerHTML = ""; resolve(idx); };
        this.choices.appendChild(b);
      });
    });
  }
};
