class Field extends Component {
  constructor() {
    super();
    // this.borderColor = "steelblue"

    this.all_width = null; // tmp-размеры для вмещения туда поля
    this.all_height = null;

    this.width = null; // истинные размеры поля
    this.height = null;

    this.x = null; // крайние левые/правые координаты поля
    this.lastX = null;

    this.y = null; // крайние верхние/нижние координаты поля
    this.lastY = null;
    this.linesX = [];
    this.linesY = [];
    this.linesColor = "rgba(155,155,155, 0.7)";

  }

  init() {
    this.width = Math.floor(Fragment.widthScale / 5 * 3 * imagesX);
    this.height = Math.floor(Fragment.heightScale / 5 * 3 * imagesY);

    // ИЗМЕНИТЬ ДЛЯ МЕСТОПОЛОЖЕНИЯ ОКНА СБОРКИ
    this.x = Math.floor(canvas.canvas.width / 2 - this.width / 2);
    this.y = 25;

    this.lastX = this.x + this.width;
    this.lastY = this.y + this.height;
    for (var i = 1; i < imagesX; i++) {
      this.linesX.push(this.width / imagesX * i);
    }
    for (var i = 1; i < imagesY; i++) {
      this.linesY.push(this.height / imagesY * i);
    }
  }

  draw(context) {
    super.draw(context);

    // отрисовка линий на поле
    context.strokeStyle = this.linesColor;
    context.beginPath();
    for (var i = 0; i < this.linesX.length; i++) {
      // let x = Math.floor(this.x + this.linesX[i]);    // размытая версия
      let x = this.x + this.linesX[i];                // резкая версия
      context.moveTo(x, this.y);
      context.lineTo(x, this.y + this.height);
      // console.log(x, this.y);
    }

    for (var i = 0; i < this.linesY.length; i++) {
      let y = this.y + this.linesY[i];              // резкая версия
      // let y = Math.floor(this.y + this.linesY[i]);  // размытая версия
      context.moveTo(this.x, y);
      context.lineTo(this.x + this.width, y);
    }
    context.stroke();

  }
}
