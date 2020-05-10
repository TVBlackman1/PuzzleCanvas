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

    this.buttons.length = 3;
    this.buttons[0] = new ButtonBack();
    this.buttons[1] = new ButtonPlay();
    this.buttons[2] = new ButtonDeleteAll();

    this.timer = new Timer();
  }

  init() {
    this.x = canvas.canvas.width / 2 - this.width / 2; // МЕСТОПОЛОЖЕНИЕ ПАНЕЛИ
    this.y = canvas.field.lastY + this.marginTop; // МЕСТОПОЛОЖЕНИЕ ПАНЕЛИ
    this.timer.init(canvas.canvas.width / 2 - Timer.width / 2, this.y + this.paddingTop);

    for (var i = 0; i < this.buttons.length; i++) {
      this.buttons[i].init(
        this.timer.x - (i+1) * (this.space + Button.width), this.y + this.paddingTop
      );
    }
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
    for (var i = 0; i < this.buttons.length; i++) {
      this.buttons[i].draw(context);
    }
    this.timer.draw(context);
  }

}
