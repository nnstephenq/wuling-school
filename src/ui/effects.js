/*
 * 全屏效果：黑屏字幕、章节标题、回忆片段、灵异剪影、结局画面
 */
WL.effects = {
  // 黑屏字幕：一行一行浮现，全部出现后点一下继续
  caption(lines) {
    return WL.overlay.open(close => {
      const { el } = WL.util;
      const fs = el("div", "fullscreen");
      const rows = lines.map(t => el("div", "caption-line", t));
      rows.forEach(r => fs.appendChild(r));
      const hint = el("div", "caption-hint", "点击继续");
      hint.style.visibility = "hidden";
      fs.appendChild(hint);
      let shown = 0;
      const step = () => {
        if (shown < rows.length) { rows[shown++].classList.add("show"); }
        if (shown >= rows.length) hint.style.visibility = "visible";
      };
      const timer = setInterval(() => { step(); if (shown >= rows.length) clearInterval(timer); }, 1400);
      setTimeout(step, 300);
      fs.onclick = () => {
        if (shown < rows.length) { rows.forEach(r => r.classList.add("show")); shown = rows.length; hint.style.visibility = "visible"; clearInterval(timer); return; }
        close();
      };
      return fs;
    });
  },

  // 章节标题：自己消失
  chapter(lines) {
    return WL.overlay.open(close => {
      const { el } = WL.util;
      const fs = el("div", "fullscreen chapter-card");
      fs.appendChild(el("div", "chapter-name", lines[0]));
      if (lines[1]) fs.appendChild(el("div", "chapter-sub", lines[1]));
      const t = setTimeout(() => close(), 2600);
      fs.onclick = () => { clearTimeout(t); close(); };
      return fs;
    });
  },

  // 回忆片段：用现在的场景图，变成黑白、模糊、加噪点
  memory(lines, bg) {
    return WL.overlay.open(close => {
      const { el, imgEl } = WL.util;
      const fs = el("div", "fullscreen memory");
      if (bg) fs.appendChild(imgEl(bg, "memory-bg"));
      fs.appendChild(el("div", "memory-noise"));
      const box = el("div", "memory-text");
      box.appendChild(el("div", "memory-label", "—— 回忆 ——"));
      const rows = lines.map(t => el("div", "caption-line", t));
      rows.forEach(r => box.appendChild(r));
      fs.appendChild(box);
      rows.forEach((r, i) => setTimeout(() => r.classList.add("show"), 400 + i * 1500));
      fs.onclick = () => {
        if (rows.some(r => !r.classList.contains("show"))) { rows.forEach(r => r.classList.add("show")); return; }
        close();
      };
      return fs;
    });
  },

  // 灵异：在场景上闪一下剪影
  async ghost(rect) {
    const { el, imgEl, place, wait } = WL.util;
    const g = place(el("div", "ghost"), rect);
    g.appendChild(imgEl("characters/lang_silhouette.png"));
    document.getElementById("scene-layer").appendChild(g);
    await wait(2600);
    g.remove();
  },

  // 惊吓：先黑一下、手电筒闪烁，然后人物猛地冲到眼前（闪白、震动、刺耳的声音）
  scare(who) {
    const ch = GAME_CHARACTERS[who];
    return WL.overlay.open(close => {
      const { el, imgEl, wait } = WL.util;
      const fs = el("div", "fullscreen scare");
      const face = el("div", "scare-face");
      face.appendChild(imgEl(ch.portrait));
      const flash = el("div", "scare-flash");
      fs.append(face, flash);
      let ready = false;
      (async () => {
        await wait(700);                       // 一片漆黑，手电筒闪两下
        fs.classList.add("flicker");
        await wait(650);
        fs.classList.remove("flicker");
        fs.classList.add("hit");               // 人脸冲上来
        WL.effects.scareSound();
        document.getElementById("stage").classList.add("shake");
        await wait(500);
        document.getElementById("stage").classList.remove("shake");
        await wait(700);
        ready = true;
        fs.appendChild(el("div", "caption-hint", "点击继续"));
      })();
      fs.onclick = () => { if (ready) close(); };
      return fs;
    });
  },

  // 重重关上的声音：画面一黑、震动、一声闷响
  async slam() {
    const { el, wait } = WL.util;
    const stage = document.getElementById("stage");
    const dark = el("div", "fullscreen");
    dark.style.animation = "none";
    WL.overlay.layer().appendChild(dark);
    WL.effects.scareSound(true);
    stage.classList.add("shake");
    await wait(500);
    stage.classList.remove("shake");
    await wait(600);
    dark.remove();
  },

  // 用程序合成的惊吓音效（不需要音效文件）。onlyBoom: 只要低沉的一声
  // （下面的 scareSound 第一行会读这个参数）
  scareSound(onlyBoom) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = WL.effects._ctx || (WL.effects._ctx = new AC());
      const t = ctx.currentTime;
      const out = ctx.createGain();
      out.gain.value = 0.5;
      out.connect(ctx.destination);
      // 低沉的“咚”
      const boom = ctx.createOscillator(), bg = ctx.createGain();
      boom.frequency.setValueAtTime(110, t);
      boom.frequency.exponentialRampToValueAtTime(35, t + 0.8);
      bg.gain.setValueAtTime(1, t);
      bg.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      boom.connect(bg).connect(out);
      boom.start(t); boom.stop(t + 1.2);
      if (onlyBoom) return;
      // 刺耳的高音（两个音高稍微错开，听起来很难受）
      [1180, 1255].forEach(f => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(f, t);
        o.frequency.linearRampToValueAtTime(f * 0.85, t + 0.7);
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        o.connect(g).connect(out);
        o.start(t); o.stop(t + 0.8);
      });
      // 噪音
      const len = ctx.sampleRate * 0.5;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const n = ctx.createBufferSource(), ng = ctx.createGain();
      n.buffer = buf; ng.gain.value = 0.35;
      n.connect(ng).connect(out);
      n.start(t);
    } catch (e) { /* 浏览器不支持声音，就只有画面 */ }
  },

  // 结局画面。回传：玩家按了哪个按钮
  ending(e) {
    return WL.overlay.open(close => {
      const { el, imgEl } = WL.util;
      const fs = el("div", "fullscreen ending");
      if (e.bg) fs.appendChild(imgEl(e.bg, "ending-bg"));
      const c = el("div", "ending-content");
      c.appendChild(el("div", "ending-label", e.hidden ? "隐藏结局" : "结局"));
      c.appendChild(el("div", "ending-name", e.name));
      c.appendChild(el("div", "ending-text", e.text));
      const b = el("button", "btn primary", e.continueLabel || "回到标题");
      b.onclick = () => close("title");
      c.appendChild(b);
      fs.appendChild(c);
      if (e.ghost) {
        const g = el("div", "ghost");
        g.style.cssText = "left:46%;top:18%;width:5%;height:16%;animation-duration:5s;";
        g.appendChild(imgEl("characters/lang_silhouette.png"));
        fs.appendChild(g);
      }
      return fs;
    });
  }
};
