/*
 * 密码锁：上下按钮调数字，按“开锁”。答对回传 true，放弃回传 false
 */
WL.puzzleView = {
  lock(p) {
    const { el } = WL.util;
    const digits = new Array(p.digits || 3).fill(0);
    return WL.overlay.panel("密码锁", (box, close) => {
      if (p.hint) box.appendChild(el("div", "viewer-caption", p.hint));
      const row = el("div", "lock");
      digits.forEach((_, i) => {
        const col = el("div", "lock-digit");
        const up = el("button", "btn", "▲");
        const num = el("div", "num", "0");
        const down = el("button", "btn", "▼");
        up.onclick = () => { digits[i] = (digits[i] + 1) % 10; num.textContent = digits[i]; };
        down.onclick = () => { digits[i] = (digits[i] + 9) % 10; num.textContent = digits[i]; };
        col.append(up, num, down);
        row.appendChild(col);
      });
      box.appendChild(row);
      const fb = el("div", "feedback");
      const go = el("button", "btn primary", "开锁");
      go.onclick = () => {
        if (digits.join("") === String(p.answer)) close(true);
        else fb.textContent = "锁纹丝不动。";
      };
      box.appendChild(go);
      box.appendChild(fb);
    }).then(r => r === true);
  }
};
