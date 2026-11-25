/*
 * 判断条件，例如 "ch2 item:key !met_ma"
 * 用空格隔开，全部成立才算成立；前面加 ! 表示“没有”
 */
WL.cond = function (text) {
  if (!text) return true;
  return String(text).trim().split(/\s+/).every(term => {
    let neg = false;
    if (term.startsWith("!")) { neg = true; term = term.slice(1); }
    let ok;
    if (term.startsWith("item:")) ok = WL.state.hasItem(term.slice(5));
    else if (term.startsWith("fact:")) ok = WL.state.hasFact(term.slice(5));
    else ok = WL.state.has(term);
    return neg ? !ok : ok;
  });
};
