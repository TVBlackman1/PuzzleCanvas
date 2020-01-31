class ControlPanel extends Component {
  static buttonsNames = [
    "delete",
    "delete-all",
    "back",
    "play",
    "add-friend",
    "mute"
  ];
  constructor() {
    super();
    this.fillColor = "#796c6c";
    this.width = 900;
    this.marginTop = 20;
    this.height = 60;
    this.buttons = [];
    this.paddingTop = 10;
    this.space = 52;

    this.buttons.length = ControlPanel.buttonsNames.length;
    this.buttons[0] = new ButtonDelete(ControlPanel.buttonsNames[0]);
    this.buttons[1] = new ButtonDeleteAll(ControlPanel.buttonsNames[1]);
    this.buttons[2] = new ButtonBack(ControlPanel.buttonsNames[2]);
    this.buttons[3] = new ButtonPlay(ControlPanel.buttonsNames[3]);
    this.buttons[4] = new ButtonAddFriend(ControlPanel.buttonsNames[4]);
    this.buttons[5] = new ButtonMute(ControlPanel.buttonsNames[5]);

    this.timer = new Timer();
  }

  init() {
    this.firstX = canvas.canvas.width / 2 - this.width / 2; // МЕСТОПОЛОЖЕНИЕ ПАНЕЛИ
    this.firstY = canvas.field.lastY + this.marginTop; // МЕСТОПОЛОЖЕНИЕ ПАНЕЛИ
    this.timer.init(canvas.canvas.width / 2 - Timer.width / 2, this.firstY + this.paddingTop);

    var i = 0;
    var pos = 1; //  для местоположения, i не обнулится для другого цикла,
                 //  а pos обнулится, это вся разница
    this.buttons.length = ControlPanel.buttonsNames.length;
    for (i = 0; i < Math.floor(ControlPanel.buttonsNames.length / 2); i++) {
      this.buttons[i].init(
        this.timer.firstX - (pos++) * (this.space + Button.width), this.firstY + this.paddingTop
      );
    }
    pos = 1; // обещанное обнуление
    for (; i < ControlPanel.buttonsNames.length; i++) {
      this.buttons[i].init(
        this.timer.lastX + (pos++) * (this.space + Button.width) - Button.width, this.firstY + this.paddingTop
      );
    }
    // местоположение определяется от центра, а потому во втором случае в
    // вычислениях участвует Buttom.width

  }

  isHadPoint(x, y) {
    if(super.isHadPoint(x, y)) {
      for (var i = 0; i < ControlPanel.buttonsNames.length; i++) {
        if(this.buttons[i].isHadPoint(x, y)) {
          this.buttons[i].func();
          break;
        };
      }
      return true;
    }
    return false;
  }

  draw(context) {
    super.draw(context);
    for (var i = 0; i < ControlPanel.buttonsNames.length; i++) {
      this.buttons[i].draw(context);
    }
    this.timer.draw(context);
  }

}
