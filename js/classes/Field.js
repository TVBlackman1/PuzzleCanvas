class Field extends Component {
  constructor() {
    super();
    // this.borderColor = "steelblue"

    this.all_width = null; // tmp-размеры для вмещения туда поля
    this.all_height = null;
    this.stationar_x = null;

    this.linesX = [];
    this.linesY = [];
    this.linesColor = "rgba(155,155,155, 0.7)";
    this.scale = 0.9; // во сколько раз стоит уменьшить поле
    this.bigType = false;

  }

  init() {
    this.width = Math.floor(Fragment.widthScale / 5 * 3 * imagesX);
    this.height = Math.floor(Fragment.heightScale / 5 * 3 * imagesY);

    this.current_width = this.width * this.scale;
    this.current_height = this.height * this.scale;

    // ИЗМЕНИТЬ ДЛЯ МЕСТОПОЛОЖЕНИЯ ОКНА СБОРКИ
    this.x = Math.floor(canvas.canvas.width / 2 - this.current_width / 2); // для уменьшенного
    // начальное расположение
    this.stationar_x = Math.floor(canvas.canvas.width / 2 - this.width / 2); // для увеличенного
    // расположение будет потом
    this.y = 25;

    this.lastX = this.x + this.current_width;
    this.lastY = this.y + this.current_height;

    // в цикле используются обычные width и height, т.к. в отрисовке используется
    // scale для изменения размера и расположения полосок
    for (var i = 1; i < imagesX; i++) {
      this.linesX.push(this.width / imagesX * i);
    }
    for (var i = 1; i < imagesY; i++) {
      this.linesY.push(this.height / imagesY * i);
    }
  }

  /*
  *  Функция для нормального уменьшения поля. Уменьшает поле на определенный
  *  процент, уменьшая и все пазлы, находящиеся на нём в это время.
  *  Так же поле переносится вверх.
  */
  normalDecrease() {
    if(!this.bigType)
      return;
    super.smoothResize(this.width, this.height, this.width * this.scale, this.height * this.scale);
    super.smoothMove(Math.floor(canvas.canvas.width / 2 - this.width * this.scale / 2), this.y);
    this.bigType = false;
  }

  /*
  *  Функция для нормального увеличения поля. Увеличивает поле на определенный
  *  процент, увеличивая и все пазлы, находящиеся на нём в это время.
  *  Так же поле переносится вверх.
  */
  normalIncrease() {
    if(this.bigType)
      return;
    super.smoothResize(this.width * this.scale, this.height * this.scale, this.width, this.height);
    super.smoothMove(this.stationar_x, this.y);
    this.bigType = true;
  }

  draw(context) {
    super.draw(context);

    // отрисовка линий на поле
    let scale = this.current_height / this.height; // уменьшение линий при
    // уменьшении размеров поля
    context.strokeStyle = this.linesColor;
    context.beginPath();
    for (var i = 0; i < this.linesX.length; i++) {
      // let x = Math.floor(this.x + this.linesX[i]);    // размытая версия
      let x = this.x + this.linesX[i] * scale; // резкая версия
      context.moveTo(x, this.y);
      context.lineTo(x, this.y + this.height * scale);
    }

    for (var i = 0; i < this.linesY.length; i++) {
      let y = this.y + this.linesY[i] * scale; // резкая версия
      // let y = Math.floor(this.y + this.linesY[i]);  // размытая версия
      context.moveTo(this.x, y);
      context.lineTo(this.x + this.width * scale, y);
    }
    context.stroke();
  }
}
