/*
 * 推理问答
 *   if        什么条件下可以推理（满足后，笔记本里会出现“推理”按钮）
 *   question  问题
 *   options   选项，correct: true 是正确答案
 *   wrong     选错时的提示
 *   then      答对后发生的事
 * 选错不会失败，可以重新想。
 */
window.GAME_DEDUCTIONS = [
  {
    id: "sender",
    if: "fact:zhou_sent fact:zhou_janitor",
    question: "寄包裹的人，最可能是谁？",
    options: [
      { text: "马国栋" },
      { text: "陈姨" },
      { text: "老周", correct: true },
      { text: "何秀兰" }
    ],
    wrong: "好像说不通。再看看笔记本：谁要过我家的地址？谁拿得到学校的钥匙？",
    then: [
      "是老周。他拄着拐杖去陈姨店里寄过快递，还要了我家的地址。",
      "他是学校的校工，学校的钥匙都归他管。",
      "可他为什么要寄一把学校储藏室的钥匙给我？",
      { solve: "q_sender" }, { fact: "sender" }, { ask: "q_why_key" },
      { unlock: "school" },
      { set: "ch2" },
      { chapter: ["第二章", "废校"] },
      "钥匙牌上写着“雾岭小学”。我要去学校看看。"
    ]
  },
  {
    id: "where",
    if: "item:journal fact:keybox",
    question: "那晚，林朗最后在哪里？",
    options: [
      { text: "后山" },
      { text: "二楼的女生宿舍" },
      { text: "宿舍楼地下的储藏室（小黑屋）", correct: true },
      { text: "校门口老周的校工房" }
    ],
    wrong: "不对。小芳的周记里写了什么？钥匙箱里少了哪一把？",
    then: [
      "小黑屋。小芳看见他被马老师带去那里，之后再也没人看见他出来。",
      "钥匙箱里，偏偏少了储藏室的那一把。",
      "而储藏室的钥匙，二十年来一直在老周手上。",
      { memory: ["那晚何护士抱着我，叫我别哭。", "她的手一直在抖。"] },
      { solve: "q_where" }, { solve: "q_why_key" }, { fact: "basement" },
      { ask: "q_release" }, { ask: "q_he" },
      { set: "ch3" },
      { chapter: ["第三章", "卫生院"] },
      { if: "know_clinic", then: [{ unlock: "clinic" }, "何护士……现在是何医生。我要去卫生院找她。"],
        else: [{ ask: "q_he_where" }, "何护士现在在哪里？去问问陈姨吧。"] }
    ]
  },
  {
    id: "alibi",
    if: "item:ledger item:med_log",
    question: "马国栋说他九点半就放了林朗，而且整晚在岗。可信吗？",
    options: [
      { text: "可信" },
      { text: "不可信", correct: true },
      { text: "说不清" }
    ],
    wrong: "再对照一下：陈姨的账本和何护士的医务日志，是怎么写的？",
    then: [
      "账本写着，他 21:30 到 23:15 都在小卖部，听见钟声才走；何护士的日志写着，他 23:40 才满身酒气地赶回学校。",
      "九点半，他刚好在小卖部坐下。他根本不在学校，不可能放人。",
      "“放回宿舍”“整晚在岗”，全是假的。",
      { solve: "q_release" }, { fact: "ma_lied" }, { ask: "q_checked" },
      { run: "chapter4" }
    ]
  }
];
