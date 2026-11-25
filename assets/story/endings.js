/*
 * 结案和结局
 */

// 最后在祠堂当着全村人，要证明的四件事。每件要交出两条证据（顺序不限）
window.GAME_FINAL_CASE = {
  intro: [
    "第二天一早，老周出殡之前，全村的人都聚在祠堂。",
    "我站在老周的遗像前，把找到的东西，一样一样摆出来。"
  ],
  claims: [
    { text: "林朗那晚被关进小黑屋，再也没有被放出来", answer: ["journal", "found_lang"] },
    { text: "马国栋那晚不在学校", answer: ["ledger", "med_log"] },
    { text: "马国栋和老周作了伪证", answer: ["report", "zhou_1123"] },
    { text: "小黑屋的入口被故意封死", answer: ["zhou_1203", "bricks"] }
  ],
  // 四件事都证明了 → good；否则 → bad
  good: "truth",
  bad: "home",
  // 真结局之后，如果这些灵异旗标都有，就再进入隐藏结局
  secret: { need: ["ghost_window", "ghost_song", "ghost_bell", "ghost_steps"], ending: "echo" }
};

window.GAME_ENDINGS = {
  silence: {
    name: "沉默",
    bg: "scenes/playground.jpg",
    text: "我离开了雾岭村。\n\n一个星期后，学校旧址被推平，盖起了新的村委楼。\n\n地底下的事，再也没有人知道。"
  },
  home: {
    name: "带他回家",
    bg: "scenes/basement.jpg",
    text: "我报了警。\n\n马国栋因为把我关在地下，被警察带走了。\n可是二十年前的事，他一口咬定：“那孩子是自己钻进去的，我真不知道。”\n证据不够，弟弟的死最后被当成了意外。\n\n我带弟弟回城里安葬。\n\n……至少，他不用再一个人待在黑暗里了。"
  },
  truth: {
    name: "真相",
    bg: "scenes/ancestral_hall.jpg",
    text: "我在祠堂当着全村人，把证据一样一样摆了出来。\n\n推平工程被叫停，警方重新调查，何医生和陈姨出来作证。\n二十年前的事，法律上可能已经过了追诉时效。\n可这一次，他把我关在地下，是刚刚犯下的罪。马国栋在山下的车站被警察带走，村长的职务也被撤了。\n教育局为林朗正了名。\n\n陈姨撕下了贴了二十年的寻人启事。\n\n我把木刻小鸟，放在了弟弟的墓前。"
  },
  echo: {
    name: "回声",
    hidden: true,
    bg: "scenes/playground.jpg",
    ghost: true,
    text: "离开那天，我回头看了一眼宿舍楼二楼的窗。\n\n窗边站着一个小孩。\n\n他朝我挥了挥手，然后不见了。"
  }
};
