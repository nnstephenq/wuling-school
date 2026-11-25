/*
 * 推理问答：选对才会关掉；选错显示提示，可以再选。中途关掉就是“再想想”，回传 false
 */
WL.deductionView = {
  run(d) {
    const { el } = WL.util;
    return WL.overlay.panel("推理", (box, close) => {
      box.classList.add("deduction");
      box.appendChild(el("div", "question", d.question));
      const opts = el("div", "options");
      const fb = el("div", "feedback");
      d.options.forEach(o => {
        const b = el("button", "btn", o.text);
        b.onclick = () => {
          if (o.correct) close(true);
          else { fb.textContent = d.wrong || "好像不对……再想想。"; b.disabled = true; }
        };
        opts.appendChild(b);
      });
      box.appendChild(opts);
      box.appendChild(fb);
    }).then(r => r === true);
  }
};
