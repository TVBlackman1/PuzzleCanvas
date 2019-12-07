class Field extends Component{
  constructor() {
    super();
    this.borderColor = "steelblue"

    this.all_width = null; // tmp-размеры для вмещения туда поля
    this.all_height = null;

    this.width = null; // истинные размеры поля
    this.height = null;

    this.firstX = null; // крайние левые/правые координаты поля
    this.lastX = null;

    this.firstY = null; // крайние верхние/нижние координаты поля
    this.lastY = null;

  }

  init() {
    this.width = FragmentsGeneralCharacteristic.widthScale / 5 * 3 * imagesX;
    this.height = FragmentsGeneralCharacteristic.heightScale / 5 * 3 * imagesY;

    this.firstX = canvas.canvas.width / 2 - this.width / 2; // ИЗМЕНИТЬ ДЛЯ МЕСТОПОЛОЖЕНИЯ ОКНА СБОРКИ
    this.firstY = 40; // ИЗМЕНИТЬ ДЛЯ МЕСТОПОЛОЖЕНИЯ ОКНА СБОРКИ

    this.lastX = this.firstX + this.width;
    this.lastY = this.firstY + this.height;
  }
}
