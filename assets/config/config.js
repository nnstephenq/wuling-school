/*
 * 全局设定
 * 用记事本打开就能改，保存时编码选 UTF-8，改完按 F5 刷新。
 */
window.GAME_CONFIG = {
  title: "雾岭小学",
  subtitle: "二十年前的那场大火之后，弟弟再也没有回来",

  // 图片文件夹（相对于 index.html）
  imageRoot: "assets/images/",

  // 存档放在浏览器里的名字。改了这个名字，旧存档就读不到了
  saveKey: "wuling-school-save-v1",

  // 一开始就在地图上的地点
  startPlaces: ["village", "home"],

  // 调试用：设成 true，所有可点击的地方都会显示虚线框（对齐热区时用）
  showHotspots: false,

  // 打字效果的速度（每个字几毫秒）。设成 0 就一次显示整句
  typeSpeed: 28
};
