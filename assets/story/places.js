/*
 * 村子地图上的地点
 *   name   名字
 *   x, y   在地图上的位置（百分比）
 *   why    地图上显示的一句话：为什么要去
 *   scenes 进入哪个场景。可以按条件选：第一个条件成立的会被选中
 *   links  地图上画连线的地点
 * 地点要用 { unlock: "id" } 才会出现在地图上（一开始就有的写在 config.js 的 startPlaces）
 */
window.GAME_PLACES = {
  village: {
    name: "村口与小卖部", x: 22, y: 76, why: "陈姨的小卖部",
    scenes: [{ scene: "village" }],
    links: ["home", "hall", "school"]
  },
  home: {
    name: "老房子", x: 12, y: 40, why: "我家。二十年没人住了",
    scenes: [{ scene: "home" }],
    links: []
  },
  hall: {
    name: "祠堂", x: 44, y: 52, why: "老周的丧事",
    scenes: [{ if: "ch4", scene: "hall_night" }, { scene: "hall" }],
    links: ["school"]
  },
  school: {
    name: "雾岭小学（旧址）", x: 74, y: 24, why: "钥匙是学校的",
    scenes: [{ if: "ch4", scene: "playground_night" }, { scene: "playground" }],
    links: []
  },
  clinic: {
    name: "村卫生院", x: 88, y: 46, why: "原来学校的医务室楼",
    scenes: [{ scene: "ward" }],
    links: ["school"]
  }
};
