// кнопки между панелью и игровым полем

class Button extends Component {
  static width = 40;
  static height = 40;

  static function_delete() {
  }
  constructor(name, x, y) {
    super();
    this.name = name;
    this.fillColor = "#000000";
    this.src = DIRECTORY + "icons/" + "icon-"+ this.name + ".png";
    this.width = 40;
    this.height = 40;
    this.img = new Image();
    this.img.src = this.src;
  }

  init(x, y) {
    this.x = x;
    this.y = y;
    this.firstX = x;
    this.firstY = y;
  }
  // функция при нажатии на кнопку
  func() {
    console.log("Pressed", this.name);
  }

  draw(context) {
    super.draw(context);
    context.drawImage(
      this.img,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}
