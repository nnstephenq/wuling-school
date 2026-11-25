/*
 * ============================================================
 *  场景和剧情
 * ============================================================
 *
 * 【场景的写法】
 *   name        场景名字（左上角显示）
 *   bg          背景图（assets/images/ 下面的路径）。不写就是全黑
 *   night       true：把图调暗，加上跟着鼠标走的手电筒光
 *   noMap       true：这个场景不能打开地图（离不开）
 *   firstEnter  第一次进来时发生的事
 *   overlays    叠在图上的图片：{ image, rect, style }
 *   props       用程序画的临时物件（图上没画出来的东西）：{ type, rect }
 *               type 可以是 paper（纸）、lock（锁）、keybox（钥匙箱）、bricks（新砖）
 *   hotspots    可以点的地方
 *   people      可以说话的人（显示在左下角）
 *   exits       去别的场景的按钮（显示在右下角）
 *
 * 【位置 rect】 [左, 上, 宽, 高]，都是百分比。例如 [10, 20, 15, 30]
 *   打开 assets/config/config.js，把 showHotspots 改成 true，就能看到所有虚线框
 *
 * 【可以点的地方 hotspot】
 *   { id, label, rect, if: "条件", do: [ 剧情 ] }
 *   或者用 cases 按条件分成几种情况，从上往下，第一个成立的会被执行：
 *   { id, label, rect, cases: [ { if: "条件", do: [...] }, { do: [...] } ] }
 *
 * 【条件】 用空格隔开，全部成立才算成立
 *   ch2            旗标 ch2 已经设定
 *   !ch2           旗标 ch2 还没设定
 *   item:key       身上有物品 key
 *   fact:lost      笔记本里有这条已知的事
 *
 * 【剧情 do 里面可以写的东西】（从上往下一句一句执行）
 *   "一句话"                       我的心里话（旁白）
 *   { me: "一句话" }               我说出口的话
 *   { chen_yi: "一句话" }          某个人说话（人物写在 characters.js）
 *   { give: "物品" }               得到物品，并放大显示
 *   { show: "物品" }               只放大显示，不得到
 *   { image: "路径", caption: "说明" }   放大显示一张图
 *   { set: "旗标" }                设定旗标
 *   { fact: "id" }  { ask: "id" }  { solve: "id" }   写进笔记本（见 notebook.js）
 *   { unlock: "地点" }             地图上出现新地点（见 places.js）
 *   { goto: "场景" }               去别的场景
 *   { memory: ["一句", "一句"] }   回忆片段（场景变黑白）
 *   { chapter: ["第一章", "回村"] } 章节标题
 *   { caption: ["一句", "一句"] }  黑屏字幕
 *   { ghost: { rect }, flag: "旗标" }   灵异：剪影闪一下
 *   { scare: "人物" }              惊吓：人物突然冲到眼前（闪光、震动、声音）
 *   { choice: [ { label: "选项", do: [...] } ] }   选择
 *   { if: "条件", then: [...], else: [...] }
 *   { puzzle: { digits: 4, answer: "1123", hint: "提示" }, ok: [...], fail: [...] }
 *   { run: "名字" }                执行 GAME_SCRIPTS 里写好的一段剧情
 *   { finalCase: true }            最后的结案（见 endings.js）
 *   { ending: "id" }               直接进入某个结局
 */

// 游戏一开始执行的剧情
window.GAME_START = [
  { caption: ["二十年前，雾岭小学的宿舍楼起了一场大火。", "那一晚，我逃了出来。", "我的弟弟，再也没有回来。"] },
  { goto: "package" }
];

// 可以重复使用的剧情段落，用 { run: "名字" } 调用
window.GAME_SCRIPTS = {
  prologue_check: [
    { if: "seen_badge seen_photo seen_key seen_note !ch1", then: [
      "二十年了，我一直以为他死在山上。",
      "我要回去。",
      { fact: "lost" }, { fact: "package" }, { ask: "q_sender" },
      { set: "ch1" },
      { chapter: ["第一章", "回村"] },
      { goto: "village" }
    ] }
  ],

  // 第四章的开场：何医生追出来
  chapter4: [
    { chapter: ["第四章", "地底"] },
    "那天傍晚，何医生找到了我。",
    { he_xiulan: "有件事，我之前没说。" },
    { he_xiulan: "老周这几个月一直在我这里看病。他走之前跟我说：林家那孩子要是回来，告诉她——" },
    { he_xiulan: "“箱子钥匙在钟里。”" },
    { he_xiulan: "老周明天一早出殡。他的东西……会一起烧掉。" },
    "钟里……是学校的那口铜钟。",
    "必须今晚去。",
    { fact: "bell_key" }, { ask: "q_tonight" },
    { set: "ch4" }
  ],

  // 第四章：找到弟弟后，被马国栋关在地下
  trapped: [
    "头顶……传来脚步声。",
    "手电筒的光从洞口照下来，晃了一下。",
    { ma_guodong: "……你不该下去的。" },
    { me: "马国栋？！" },
    { ma_guodong: "二十年都过去了。就当这下面，什么都没有。" },
    { slam: true },
    "哐——！",
    "铁盖板被盖上了。",
    "上面传来拖重物的声音，一下，又一下。",
    "然后，什么声音都没有了。",
    "二十年前，弟弟也是这样，被他关在这里。",
    { set: "trapped" }, { fact: "trapped" }, { ask: "q_escape" }
  ],

  // 被关在地下时，拿出手机
  phone: [
    { if: "!signal", then: [
      "手机屏幕上显示：无服务。",
      "地下太深了。要找个有风透进来的地方试试。"
    ], else: [
      { choice: [
        { label: "打 110", do: [
          "我拨了 110。",
          "嘟——",
          "电话断了。再拨，还是断。一格信号，撑不起一通电话。"
        ] },
        { label: "发短信给陈姨", do: [
          "陈姨的小卖部在山下，走上来要二十多分钟。",
          "而且这么晚了，她早就睡了……",
          "得找一个离学校近、看到短信就能马上赶来的人。"
        ] },
        { label: "发短信给何医生", do: [
          "卫生院就在学校旁边。何医生看到短信，几分钟就能赶到。",
          "可是要写清楚我在哪里。",
          { choice: [
            { label: "“救命！马国栋要害我，快帮我报警！”", do: [
              "短信发出去了。",
              "过了一会儿，何医生回了一条：“你在哪里？”",
              "……我得说清楚位置。"
            ] },
            { label: "“我在学校的宿舍楼里，出不去了，快来！”", do: [
              "短信发出去了。",
              "过了一会儿，何医生回了一条：“宿舍楼哪里？我到处找不到你！”",
              "宿舍楼都塌了一半……我得说得更清楚。"
            ] },
            { label: "“我被关在一个很黑的地方，快来救我！”", do: [
              "短信发出去了。",
              "过了一会儿，何医生回了一条：“你在哪里？说清楚！”",
              "……我得说清楚位置。"
            ] },
            { label: "“我在值班室的地下储藏室，被关住了！”", do: [{ run: "rescue" }] }
          ], prompt: "短信写什么？" }
        ] },
        { label: "先收起来", do: [] }
      ], prompt: "要联系谁？" }
    ] }
  ],

  rescue: [
    "短信……发送成功。",
    "我抱着膝盖，坐在弟弟身边。",
    "不知道过了多久。",
    "头顶传来搬东西的声音，有人在喊我的名字。",
    "铁盖板被掀开了。",
    { he_xiulan: "林晴！你没事吧？" },
    "何医生和陈姨拿着手电筒，站在上面。",
    { he_xiulan: "我看到短信就跑过来了。上面压着两根烧焦的房梁……" },
    { chen_yi: "我们上来的时候，看见村长往山下跑了。" },
    "何医生看见了角落里的那双小鞋。她捂住嘴，很久都没有说话。",
    { he_xiulan: "二十年前，我说我没看见。" },
    { he_xiulan: "这一次，我不会再说没看见。" },
    { set: "rescued" }, { solve: "q_escape" },
    "该带你回家了。",
    "也该让所有人知道，那晚到底发生了什么。",
    { finalCase: true }
  ]
};

window.GAME_SCENES = {

  // ============ 序章：包裹 ============
  package: {
    name: "序章　包裹",
    noMap: true,
    firstEnter: [
      "快递单上，寄件地址只写着“雾岭村”，没有寄件人的名字。",
      "盒子里有四样东西。"
    ],
    overlays: [
      { image: "items/badge.jpg",         rect: [6, 30, 19, 33.8] },
      { image: "items/package_photo.jpg", rect: [28, 30, 19, 33.8] },
      { image: "items/old_key.jpg",       rect: [50, 30, 19, 33.8] },
      { image: "items/note.jpg",          rect: [72, 30, 19, 33.8] }
    ],
    hotspots: [
      { id: "badge", label: "校徽", rect: [6, 30, 19, 33.8], cases: [
        { if: "!seen_badge", do: [
          { give: "badge" },
          { memory: ["那天早上，是我帮他别上的。", "他说：“姐姐，晚上有惊喜哦。”"] },
          { set: "seen_badge" }, { run: "prologue_check" }
        ] },
        { do: [{ show: "badge" }] }
      ] },
      { id: "photo", label: "照片", rect: [28, 30, 19, 33.8], cases: [
        { if: "!seen_photo", do: [{ give: "photo" }, { set: "seen_photo" }, { run: "prologue_check" }] },
        { do: [{ show: "photo" }] }
      ] },
      { id: "key", label: "旧钥匙", rect: [50, 30, 19, 33.8], cases: [
        { if: "!seen_key", do: [{ give: "key" }, { set: "seen_key" }, { run: "prologue_check" }] },
        { do: [{ show: "key" }] }
      ] },
      { id: "note", label: "字条", rect: [72, 30, 19, 33.8], cases: [
        { if: "!seen_note", do: [
          { give: "note" },
          "“他不在山上。”",
          "可是当年，所有人都说他往后山跑了。",
          { set: "seen_note" }, { run: "prologue_check" }
        ] },
        { do: [{ show: "note" }] }
      ] }
    ]
  },

  // ============ 第一章 ============
  village: {
    name: "村口与小卖部",
    bg: "scenes/village_entrance.jpg",
    firstEnter: [
      "二十年后，我回到了雾岭村。",
      "村口的水泥路很新，路两边盖起了楼房，可大多关着窗。",
      "山里的手机信号时有时无。"
    ],
    hotspots: [
      { id: "notice", label: "村务公告栏", rect: [1, 46, 17, 32], do: [
        "公告栏里贴着一张新通知：",
        "“雾岭小学旧址平整工程，下月开工，建设新村委楼。”",
        "下个月……学校就要被推平了。",
        { fact: "demolish" }
      ] },
      { id: "poster", label: "店里墙上发黄的旧纸", rect: [93, 74, 7, 24], do: [
        "是一张寻人启事。",
        "“寻人启事　林朗，男，八岁。二〇〇六年十一月二十二日夜，最后被看见往后山方向……”",
        "纸已经黄得发脆，边角卷了起来。",
        { if: "talked_chen", then: [
          { me: "陈姨，这张……一直贴着？" },
          { chen_yi: "撕了，就好像大家都忘了那孩子。" }
        ] },
        { fact: "poster" }
      ] },
      { id: "shelf", label: "快递货架", rect: [70, 62, 10, 30], cases: [
        { if: "talked_chen", do: ["货架上堆着快递包裹。", "老周的包裹，就是从这里寄出来的。"] },
        { do: ["货架上堆着快递包裹。这家小卖部，也是村里的快递代收点。"] }
      ] },
      { id: "road", label: "往山上的路", rect: [33, 42, 14, 30], do: [
        "水泥路一直往山上延伸，消失在雾里。",
        "学校就在山上。"
      ] }
    ],
    people: [
      { id: "chen_yi", label: "陈姨",
        topics: [
          { label: "打招呼", if: "!talked_chen", do: [
            { chen_yi: "你是……晴晴？林家的晴晴？" },
            { me: "陈姨，是我。" },
            { chen_yi: "都长这么大了……你妈还好吧？过年我还跟她通电话呢。" },
            { chen_yi: "你回来得巧，老周前几天走了。丧事在祠堂，村长张罗着守灵。" },
            "老周……学校的老周伯伯？",
            { chen_yi: "他走之前，还拄着拐杖来我这寄了个快递。跟我要了你家的地址，说给林家寄点东西。" },
            "……那个包裹，是从这里寄出去的。",
            { set: "talked_chen" }, { fact: "zhou_sent" }, { unlock: "hall" }
          ] },
          { label: "问当年的事", if: "talked_chen", do: [
            { chen_yi: "那晚的事，村里人都不爱提。" },
            { chen_yi: "你要问，就去问村长吧。他当年是学校的老师。" }
          ] },
          { label: "何秀兰是谁？", if: "talked_chen read_death", do: [
            { chen_yi: "何护士啊，现在是何医生了。" },
            { chen_yi: "学校关了以后，原来的医务室楼改成了村卫生院，她一直在那里看病。" },
            { fact: "clinic" }, { solve: "q_he_where" }, { set: "know_clinic" },
            { if: "ch3", then: [{ unlock: "clinic" }] }
          ] },
          { label: "问何护士的下落", if: "ch3 !know_clinic !read_death", do: [
            { chen_yi: "当年学校的何护士？她现在是何医生了。" },
            { chen_yi: "学校关了以后，原来的医务室楼改成了村卫生院，她一直在那里看病。" },
            { fact: "clinic" }, { solve: "q_he_where" }, { set: "know_clinic" }, { unlock: "clinic" }
          ] }
        ],
        show: {
          key: [
            "陈姨看了一眼钥匙上的铁牌。",
            { chen_yi: "学校的东西吧？以前学校的钥匙，都归老周管。" }
          ],
          photo: [{ chen_yi: "这不是学校的宿舍楼吗……这地方，谁还会去拍。" }],
          badge: ["陈姨看着校徽，好一会儿没说话。"],
          report: [
            { if: "!item:ledger", then: [
              "我把事故报告上“整晚在岗”那一句，指给陈姨看。",
              { chen_yi: "……整晚在岗？" },
              "陈姨的脸色变了。她沉默了很久，转身进了后面的仓库。",
              "过了好一会儿，她拿着一本发黄的账本出来。",
              { chen_yi: "那晚马老师就在我这儿打麻将、喝啤酒。九点半来的，听见学校的钟声才走。" },
              { chen_yi: "我当年不想惹事……对不起那孩子。" },
              { give: "ledger" }, { fact: "ledger" }
            ], else: [{ chen_yi: "账本你拿着吧。该说的，我都说了。" }] }
          ]
        },
        showDefault: [{ chen_yi: "这个我看不懂。" }]
      }
    ]
  },

  home: {
    name: "老房子",
    bg: "scenes/old_home.jpg",
    firstEnter: ["门一推就开了。二十年，屋里的一切都停在我们离开的那天。"],
    hotspots: [
      { id: "box", label: "旧木柜里的纸箱", rect: [3, 58, 15, 18], cases: [
        { if: "!read_death", do: [
          "纸箱里是爸妈留下的弟弟的东西：书包、作业本……",
          "他们说“带不走”。",
          "最下面，压着一份文书。",
          { give: "death_doc" }, { fact: "official" }, { set: "read_death" },
          "何秀兰……当年学校的何护士？",
          { if: "!know_clinic", then: [{ ask: "q_he_where" }] }
        ] },
        { do: ["纸箱里是弟弟的书包和作业本。"] }
      ] },
      { id: "diary", label: "桌上的笔记本", rect: [40, 66, 12, 10], cases: [
        { if: "!read_diary", do: [
          "是我小时候的日记。",
          "“11月22日　今天我生日。弟弟说晚上给我惊喜，神神秘秘的。”",
          "之后的每一页，都是空白。",
          { memory: ["我等到很晚，他都没来。", "我以为他忘了，还生了他的气。"] },
          { set: "read_diary" }
        ] },
        { do: ["日记停在我十岁生日那天。"] }
      ] },
      { id: "frame", label: "墙上的相框", rect: [62, 28, 12, 15], do: [
        "相框玻璃上积了厚厚的灰。我用袖子擦干净。",
        { image: "items/siblings_photo.jpg", caption: "我和弟弟。他胸前别着校徽，和包裹里的那一枚一样。" }
      ] },
      { id: "bed", label: "旧木床", rect: [62, 78, 36, 22], do: ["防尘布下面，是我和弟弟小时候睡的床。"] },
      { id: "window", label: "窗户", rect: [37, 15, 22, 46], do: ["窗外的竹子，长得比房子还高了。"] }
    ]
  },

  hall: {
    name: "祠堂",
    bg: "scenes/ancestral_hall.jpg",
    firstEnter: ["祠堂几年前翻新过，白墙、瓷砖、日光灯。只有供桌和牌位架还是老的。", "老周的灵堂就设在这里。"],
    overlays: [{ image: "characters/zhou_portrait.png", rect: [50.3, 39.6, 8.5, 22], style: "portrait" }],
    hotspots: [
      { id: "portrait", label: "老周的遗像", rect: [49, 33, 11, 32], cases: [
        { if: "!met_ma", do: [
          "遗像里的老人，我记得他。学校的老周伯伯，每天敲钟叫我们上课。",
          "一个男人从供桌旁迎了过来。",
          { ma_guodong: "哎，这不是林家的闺女吗？都长这么大了！" },
          { ma_guodong: "我是马国栋，现在是村里的村长。老周的丧事，村里帮着张罗。" },
          { if: "read_death", then: ["马国栋……就是那个说看见弟弟往后山跑的值班老师。"],
            else: ["马国栋……这个名字，好像在哪里听过。"] },
          { me: "我想问问，我弟弟当年的事。" },
          "他的笑容僵了一下。",
          { ma_guodong: "都过去二十年了，别再折腾了。" },
          { ma_guodong: "老周人好，就是晚年糊涂。他说的话，别当真。" },
          { set: "met_ma" }
        ] },
        { do: ["遗像前的香，快烧完了。"] }
      ] },
      { id: "register", label: "丧事登记簿", rect: [10, 70, 21, 10], do: [
        "登记簿第一页写着：",
        "“周德福，享年七十岁。生前为雾岭小学校工。无子女。”",
        { fact: "zhou_janitor" }
      ] },
      { id: "chest", label: "灵前的木箱", rect: [76, 73, 14, 22], do: [
        "灵前放着一个旧木箱，上了锁。",
        { villagers: "那是老周的东西。村里的规矩，出殡那天要和纸扎一起烧掉。" },
        { fact: "chest_burn" },
        { if: "item:key", then: ["我试了试包裹里的钥匙……插不进去。", "这不是箱子的钥匙。"] }
      ] },
      { id: "villagers", label: "守灵的村民", rect: [0, 64, 15, 36], do: [
        { villagers: "……老周走之前，一直念叨学校的事……" },
        { villagers: "嘘，村长在呢。" },
        "我一走近，他们就不说话了。"
      ] },
      { id: "villagers2", label: "守灵的村民", rect: [92, 72, 8, 28], do: [
        "老人低着头，像是没看见我。"
      ] }
    ],
    people: [
      { id: "ma_guodong", label: "马国栋", if: "met_ma",
        topics: [
          { label: "问弟弟的事", do: [
            { ma_guodong: "那天晚上，我九点半就放他回宿舍了。后来火一起，我亲眼看见一个小孩往后山跑……" },
            { ma_guodong: "我也难受啊。可人得往前看。" }
          ] },
          { label: "问老周的事", do: [
            { ma_guodong: "老周管了一辈子学校的钥匙，敲了一辈子的钟。人老了，糊涂了。" }
          ] }
        ],
        show: {
          key: [
            "马国栋的眼神在钥匙上停了一下。",
            { ma_guodong: "……旧东西，留着没用。给我吧，我替你扔了。" },
            "我把钥匙收了回来。"
          ],
          note: [{ ma_guodong: "“他不在山上”？谁写的这种东西……老糊涂了。" }]
        },
        showDefault: [{ ma_guodong: "这个我不清楚。" }]
      }
    ]
  },

  // ============ 第二章 ============
  playground: {
    name: "学校操场",
    bg: "scenes/playground.jpg",
    firstEnter: [
      "学校外面围了一圈施工围挡，大门锁着。",
      "我沿着后山的小路绕到学校后面，找到了围挡上的一个破口。",
      "钻进去，就是学校的操场。"
    ],
    hotspots: [
      { id: "bell", label: "铜钟", rect: [7, 30, 20, 32], cases: [
        { if: "!bell_memory", do: [
          "木架上挂着那口铜钟，钟绳已经烂了。",
          { memory: ["那晚的钟声，我到现在都记得。", "老周伯伯一直在敲，一直在敲……"] },
          { set: "bell_memory" }
        ] },
        { do: ["铜钟上长满了铜绿。二十年前，就是它把大家叫醒的。"] }
      ] },
      { id: "window", label: "宿舍楼二楼的窗", rect: [44, 35, 8, 14], cases: [
        { if: "!ghost_window", do: [
          { ghost: { rect: [45.5, 33, 4.5, 13] }, flag: "ghost_window" },
          "……！",
          "窗边站着一个小小的人影。",
          "我眨了一下眼，人影不见了。",
          "窗框上只挂着一件烧剩的小孩外套，被风吹得一晃一晃。"
        ] },
        { do: ["窗框上挂着一件烧剩的小孩外套。包裹照片里拍的，就是这扇窗。"] }
      ] },
      { id: "case", label: "宣传栏", rect: [67, 51, 17, 24], do: [
        "宣传栏的玻璃碎了，里面的照片和纸，早被雨水泡烂了。"
      ] },
      { id: "path", label: "后山的小路", rect: [91, 68, 9, 32], do: [
        "这条小路通往后山。当年全村人在山上找了好几个星期。",
        "他不在山上。"
      ] }
    ],
    exits: [
      { label: "教室", to: "classroom" },
      { label: "烧毁的宿舍楼", to: "duty_room" }
    ]
  },

  classroom: {
    name: "教室",
    bg: "scenes/classroom.jpg",
    props: [
      { type: "paper", rect: [16.5, 31, 6, 12] },
      { type: "lock", rect: [51.6, 67.5, 1.4, 2.4] }
    ],
    hotspots: [
      { id: "blackboard", label: "黑板", rect: [35, 40, 38, 20], do: [
        "黑板上的粉笔字几乎都擦掉了。",
        "右下角还留着一行日期：“11月23日　星期四”。",
        "火灾的第二天。"
      ] },
      { id: "lectern", label: "讲台", rect: [44, 62, 16, 16], cases: [
        { if: "!item:journal", do: [
          "讲台的抽屉上挂着一把四位数的密码锁。",
          "锁上贴着一小块发黄的胶布，上面写着两个字：“日期”。",
          { puzzle: { digits: 4, answer: "1123", hint: "锁上的胶布写着：日期" },
            ok: [
              "咔哒一声，锁开了。",
              "抽屉里是一叠周记本，最上面一本写着“小芳”。",
              { give: "journal" }, { fact: "journal" }
            ],
            fail: ["锁没有开。"] }
        ] },
        { do: ["抽屉里是其他同学的周记。"] }
      ] },
      { id: "roster", label: "墙上的旧表格", rect: [15, 29, 9, 16], cases: [
        { if: "!item:roster", do: [
          "墙上的表格被灰盖住了。我用袖子擦了擦。",
          { give: "roster" }, { fact: "ma_duty" }
        ] },
        { do: [{ show: "roster" }] }
      ] },
      { id: "desk", label: "前排的课桌", rect: [0, 80, 34, 20], do: [
        "这是弟弟的座位。",
        "桌面上，刻着一只歪歪扭扭的小鸟。"
      ] },
      { id: "window", label: "破窗", rect: [86, 25, 9, 42], cases: [
        { if: "!ghost_song", do: [
          "风从破窗吹进来……",
          "……我好像听见有个小孩在哼歌。",
          "是生日歌。",
          "我屏住呼吸再听，只剩下风声。",
          { set: "ghost_song" }
        ] },
        { do: ["风穿过破窗，呜呜地响。"] }
      ] }
    ],
    exits: [{ label: "回操场", to: "playground" }]
  },

  duty_room: {
    name: "宿舍楼·值班室",
    bg: "scenes/duty_room.jpg",
    props: [
      { type: "keybox", rect: [17, 27, 20, 24] },
      { type: "bricks", rect: [46, 80, 20, 12] }
    ],
    hotspots: [
      { id: "keybox", label: "铁皮钥匙箱", rect: [16, 25, 23, 30], cases: [
        { if: "!fact:keybox", do: [
          "墙上挂着一个烧黑的铁皮钥匙箱，箱门歪着。",
          "里面一排挂钩，钥匙都带着同样的小铁牌：“雾岭小学　教”“雾岭小学　厨”……",
          "只有一个挂钩是空的。挂钩上方，冲压着一个字：“储”。",
          "包裹里的钥匙……就是这一把。",
          { fact: "keybox" }
        ] },
        { do: ["钥匙箱里，“储”那一格是空的。"] }
      ] },
      { id: "floor", label: "地面", rect: [44, 76, 24, 18], cases: [
        { if: "!item:bricks", do: [
          "焦黑的地面上，有一块地方颜色不一样。",
          "是后来补上的新砖，大约一张桌子大小。",
          "我用手机拍了下来。",
          { give: "bricks" }, { fact: "bricks" }
        ] },
        { do: ["新砖用水泥封得很结实。"] }
      ] },
      { id: "doorway", label: "烧焦的门口", rect: [50, 24, 12, 48], cases: [
        { if: "!stair_memory", do: [
          "门后是塌掉的楼梯，上不去了。",
          { memory: ["点名的时候，老师喊了三次“林朗”。", "没有人回答。"] },
          { set: "stair_memory" }
        ] },
        { do: ["楼梯塌了，上不去。"] }
      ] },
      { id: "window", label: "破窗", rect: [76, 14, 24, 56], do: ["窗上的铁栏杆被烧得发黑。"] }
    ],
    exits: [{ label: "回操场", to: "playground" }]
  },

  // ============ 第三章 ============
  ward: {
    name: "村卫生院·病房",
    bg: "scenes/clinic_ward.jpg",
    firstEnter: ["卫生院很冷清。镇上盖了新医院以后，只剩几个走不动的老人还会来这里看病。"],
    hotspots: [
      { id: "chart", label: "墙上的旧名单", rect: [21, 19, 9, 22], do: [
        "一张褪色的旧名单：“雾岭小学医务室……护士　何秀兰”。",
        "这栋楼，以前是学校的医务室。"
      ] },
      { id: "bottles", label: "旧药瓶", rect: [5, 58, 13, 12], do: [
        "床头柜上的药瓶，有的还贴着当年学校医务室的标签。"
      ] },
      { id: "beds", label: "病床", rect: [20, 52, 50, 44], do: ["空着的病床，床单洗得发白。"] }
    ],
    people: [
      { id: "he_xiulan", label: "何医生",
        topics: [
          { label: "打招呼", if: "!met_he", do: [
            { he_xiulan: "……你是林家的姑娘吧。" },
            { he_xiulan: "老周走之前，一直在我这里看病。" },
            { me: "何医生，那晚你也在学校。" },
            { he_xiulan: "都过去了。" },
            "她低下头，不再说话。",
            { set: "met_he" }
          ] },
          { label: "问那晚的事", if: "met_he !he_open", do: [
            { he_xiulan: "那晚我在医务室，看见火光就去帮忙疏散……别的，我不记得了。" },
            "她在回避什么。也许我得给她看点什么。"
          ] },
          { label: "问院长室", if: "he_open", do: [
            { he_xiulan: "院长室以前是校长室。学校的旧文件柜，一直在里面。" }
          ] }
        ],
        show: {
          journal: [
            { if: "!he_open", then: [
              "我把小芳的周记递给何医生。",
              "她读了很久。拿着本子的手，开始发抖。",
              { he_xiulan: "……小黑屋。" },
              { he_xiulan: "那晚马老师回来的时候，一身酒气。我问他去哪了，他不说。" },
              { he_xiulan: "他说九点半就放了那孩子，还看见一个小孩往后山跑……我一直以为，孩子真跑到山上去了。" },
              { he_xiulan: "后来校长让我签一份证明，说校内没找到那孩子。我签了。我没写他喝酒的事。" },
              { he_xiulan: "这栋楼以前是学校的医务室和校长室。学校留下的旧文件柜，一直在院长室，没人动过。" },
              { he_xiulan: "钥匙给你。我当年的医务日志……也在里面。" },
              { give: "office_key" }, { fact: "he_confess" }, { solve: "q_he" }, { set: "he_open" },
              "她撕下一张处方笺，写了一串号码递给我。",
              { he_xiulan: "这是我的手机。我就住在卫生院后面，离学校几步路。有事，就找我。" },
              { fact: "he_phone" }
            ], else: [{ he_xiulan: "我都告诉你了。" }] }
          ]
        },
        showDefault: [{ he_xiulan: "……这个，我帮不了你。" }]
      }
    ],
    exits: [
      { label: "院长室", to: "office", if: "item:office_key" },
      { label: "院长室（锁着）", if: "!item:office_key", do: ["院长室的门锁着。"] }
    ]
  },

  office: {
    name: "院长室（原校长室）",
    bg: "scenes/principal_office.jpg",
    hotspots: [
      { id: "cabinet", label: "旧文件柜", rect: [66, 25, 18, 46], cases: [
        { if: "!item:report", do: [
          "文件柜比房间里其他东西都旧。抽屉里塞满了学校当年的文件。",
          "我一份一份地翻，找到了三份。",
          { give: "report" }, { give: "med_log" }, { give: "he_cert" },
          { fact: "report" }, { fact: "med_log" }
        ] },
        { do: ["文件柜里都是学校当年的旧文件。"] }
      ] },
      { id: "desk", label: "办公桌", rect: [42, 70, 18, 10], do: [
        "桌上摊着何医生的病历本。最上面一页写着：周德福。"
      ] },
      { id: "photo", label: "墙上的旧合影", rect: [42, 20, 16, 23], do: [
        "一张褪色的合影，是当年学校的老师们。照片里的脸，都已经看不清了。"
      ] }
    ],
    exits: [{ label: "回病房", to: "ward" }]
  },

  // ============ 第四章（夜） ============
  playground_night: {
    name: "学校操场（夜）",
    bg: "scenes/playground.jpg",
    night: true,
    firstEnter: ["夜里的学校，比白天更安静。手电筒的光只照得到眼前一小片。"],
    hotspots: [
      { id: "bell", label: "铜钟", rect: [7, 30, 20, 32], cases: [
        { if: "!item:chest_key", do: [
          "我用手电筒照进铜钟里面。",
          "钟壁上，用铁丝绑着一把小钥匙。",
          { give: "chest_key" }
        ] },
        { do: ["铜钟一动不动地挂着。"] }
      ] },
      { id: "window", label: "宿舍楼二楼的窗", rect: [44, 35, 8, 14], cases: [
        { if: "!ghost_bell", do: [
          "我抬头看二楼的那扇窗。",
          "……当。",
          "身后的铜钟，自己响了一下。",
          "我看了一眼手机：23:10。",
          "钟绳在风里轻轻晃着。",
          { set: "ghost_bell" }
        ] },
        { do: ["窗边那件外套，在风里晃着。"] }
      ] }
    ],
    exits: [{ label: "烧毁的宿舍楼", to: "duty_night" }]
  },

  hall_night: {
    name: "祠堂（夜）",
    bg: "scenes/ancestral_hall_night.jpg",
    firstEnter: ["夜深了。守灵的人大多回去了，只剩几位老人靠在凳子上打瞌睡。"],
    overlays: [{ image: "characters/zhou_portrait.png", rect: [50.3, 39.6, 8.5, 22], style: "portrait" }],
    hotspots: [
      { id: "chest", label: "老周的木箱", rect: [76, 73, 14, 22], cases: [
        { if: "item:chest_key !item:zhou_1123", do: [
          "我用铜钟里的小钥匙，打开了老周的木箱。",
          "箱子里是几件旧衣服，和一本翻得起毛的日记。",
          { give: "zhou_1123" }, { give: "zhou_1203" },
          { fact: "zhou_diary" }, { solve: "q_tonight" }, { ask: "q_down" }
        ] },
        { if: "!item:chest_key", do: ["木箱锁着。明天一早，它就要被烧掉了。"] },
        { do: ["箱子里只剩几件旧衣服。"] }
      ] },
      { id: "side", label: "花圈后面的侧屋", rect: [86, 48, 14, 40], cases: [
        { if: "!item:hammer", do: [
          "花圈后面有一扇小门，通往侧屋。里面堆着办丧事用的工具。",
          "我拿了一把铁锤。",
          { give: "hammer" }
        ] },
        { do: ["侧屋里堆着工具。"] }
      ] },
      { id: "portrait", label: "老周的遗像", rect: [49, 33, 11, 32], cases: [
        { if: "item:zhou_1123", do: ["遗像里的老周看着我。", "老周伯伯，你想说的，二十年都没说出口。"] },
        { do: ["遗像里的老周看着我。"] }
      ] },
      { id: "villagers", label: "打瞌睡的老人", rect: [0, 64, 15, 36], do: ["老人靠在凳子上睡着了。"] }
    ]
  },

  duty_night: {
    name: "值班室（夜）",
    bg: "scenes/duty_room.jpg",
    night: true,
    props: [
      { type: "keybox", rect: [17, 27, 20, 24] },
      { type: "bricks", rect: [46, 80, 20, 12] }
    ],
    hotspots: [
      { id: "steps", label: "地上的脚印", rect: [52, 64, 10, 14], cases: [
        { if: "!ghost_steps", do: [
          "手电筒照过地面，灰上有一串小小的脚印。",
          "像是小孩光着脚走过，一直走到那块新砖旁边，就不见了。",
          "……是野猫吧。",
          { set: "ghost_steps" }
        ] },
        { do: ["灰上的小脚印，停在新砖旁边。"] }
      ] },
      { id: "floor", label: "新砖", rect: [44, 78, 24, 18], cases: [
        { if: "!ma_met", do: [
          "我蹲下来，用手电筒照着新砖的缝。",
          "……",
          "身后，有脚步声。",
          { scare: "ma_guodong" },
          { ma_guodong: "林家闺女，这么晚了，你在这里干什么？" },
          { ma_guodong: "这楼随时会塌，危险。" },
          "我没有动。",
          { ma_guodong: "……老周跟你说了什么？他老糊涂了！二十年前的事，谁说得清？" },
          "他的声音软了下来。",
          { ma_guodong: "晴晴，算叔求你。你弟弟的事，我也难受了二十年。" },
          { ma_guodong: "这里马上要推平了。你回城里去，好好过日子。" },
          "他从口袋里掏出一个厚厚的信封。",
          { ma_guodong: "这些钱你拿着，就当是叔的一点心意。" },
          { choice: [
            { label: "收下钱，离开", do: ["我接过了那个信封。", { ending: "silence" }] },
            { label: "拒绝", do: [
              "我把信封推了回去。",
              { me: "我弟弟在下面，对不对？" },
              "马国栋的脸，在手电筒的光里一下子白了。",
              { ma_guodong: "你……你会后悔的。" },
              "他转身走了，脚步声消失在黑暗里。",
              { set: "ma_met" }
            ] }
          ] }
        ] },
        { if: "!item:zhou_1123", do: [
          "这块新砖下面，会有什么？",
          "我还不能确定。老周的箱子明天一早就要烧掉了……先去祠堂，看看他留下了什么。"
        ] },
        { if: "!item:hammer", do: ["新砖用水泥封得很结实，徒手根本撬不开。", "我需要工具。"] },
        // 保险：下去以后会被关住，所以证据不齐就不让下去
        { if: "!item:journal", do: ["下去之前，我想再确认一次……小芳的周记，我还没拿到。"] },
        { if: "!item:report", do: ["下去之前，我想再确认一次……院长室文件柜里的东西，我还没拿到。"] },
        { if: "!item:ledger", do: ["下去之前，我想再确认一次……陈姨的账本，我还没拿到。"] },
        { do: [
          { if: "!item:bricks", then: [
            "动手之前，我先用手机拍下了这块新砖。",
            { give: "bricks" }, { fact: "bricks" }
          ] },
          "我举起铁锤，砸向那块新砖。",
          "一下，两下……砖块碎开，下面露出一块锈死的铁盖板。",
          "我用铁锤撬开铁盖板。一股潮湿发霉的气味涌了上来。",
          "下面，是一段往下的楼梯。",
          { goto: "basement" }
        ] }
      ] },
      { id: "keybox", label: "铁皮钥匙箱", rect: [16, 25, 23, 30], do: ["钥匙箱里，“储”那一格还是空的。"] },
      { id: "doorway", label: "烧焦的门口", rect: [50, 24, 12, 40], do: ["楼梯塌了，上不去。"] }
    ],
    exits: [{ label: "回操场", to: "playground_night" }]
  },

  basement: {
    name: "地下储藏室",
    bg: "scenes/basement.jpg",
    night: true,
    noMap: true,
    firstEnter: [
      "楼梯尽头是一扇生锈的铁门。",
      "我拿出老周寄来的钥匙，插进锁孔。",
      "……转动了。",
      "这里，就是小黑屋。"
    ],
    hotspots: [
      { id: "corner", label: "角落", rect: [16, 79, 20, 21], cases: [
        { if: "!item:found_lang", do: [
          "角落里，一堆叠好的旧衣服。旁边是一双小小的布鞋。",
          "我认得这双鞋。是妈妈给他买的。",
          "……弟弟。",
          "二十年了。你一直在这里。",
          "我用手机拍了下来。",
          { give: "found_lang" }, { solve: "q_down" }
        ] },
        { do: ["我在他身边坐了一会儿。"] }
      ] },
      { id: "bird", label: "小鞋旁边", rect: [29, 88, 13, 12], if: "item:found_lang", cases: [
        { if: "!item:bird", do: [
          "小鞋旁边，有一样小小的东西。",
          { give: "bird" },
          { memory: ["原来，这就是你说的惊喜。"] },
          { run: "trapped" }
        ] },
        { do: [{ show: "bird" }] }
      ] },
      { id: "door", label: "铁门", rect: [45, 20, 22, 64], cases: [
        { if: "trapped !rescued", do: [
          "铁门下半部那些很低、很小的抓痕……",
          "二十年前，他也是这样被关在这里。",
          "他一定也拼命喊过。"
        ] },
        { do: ["铁门的下半部，有很多很低、很小的抓痕。", "……"] }
      ] },
      { id: "jars", label: "玻璃罐", rect: [83, 42, 17, 24], do: ["架子上的玻璃罐积满了灰。"] },
      { id: "crack", label: "盖板边上的缝", rect: [38, 13, 5, 9], if: "trapped !rescued", cases: [
        { if: "!signal", do: [
          "盖板边上有一道细细的缝，有风透进来。",
          "我踩着楼梯，把手机举到缝边……",
          "屏幕左上角，跳出了一格信号。",
          "只有一格。打电话肯定不行，也许能发出一条短信。",
          { set: "signal" }
        ] },
        { do: ["手机举在缝边，有一格信号，时有时无。"] }
      ] },
      { id: "hole", label: "上去的洞口", rect: [23, 8, 15, 15], cases: [
        { if: "rescued", do: [
          "该带你回家了。",
          "也该让所有人知道，那晚到底发生了什么。",
          { finalCase: true }
        ] },
        { if: "trapped", do: [
          "我爬上楼梯，用肩膀去顶那块铁盖板。",
          "纹丝不动。上面压着很重的东西。",
          "我用铁锤往上砸，只砸下来一些铁锈和灰。"
        ] },
        { do: ["我还不能走。"] }
      ] }
    ],
    props: [
      { type: "dim", rect: [0, 0, 100, 100], if: "trapped !rescued" },
      { type: "lid", rect: [22, 5, 19, 19], if: "trapped !rescued" }
    ],
    exits: [
      { label: "拿出手机", if: "trapped !rescued", do: [{ run: "phone" }] }
    ]
  }
};
