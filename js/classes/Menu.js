// init in Fragment.js

class Menu extends Component {
  constructor(cnv) {
    super();
    this.fillColor = "#e3e3e3"

    this.place = new MenuPlace();
    this.startShowedWidth = 30; // пикселей длины показано в свёрнутом виде
    this.width = 1420;
    this.current_width = this.width;
    this.placeCoef = 1.0; // на сколько заходит onmouse за зону Menu
    this.margin = 10;

    this.shown = false; // меню скрыто изначально


  }

  init() {
    this.center = Math.floor(canvas.canvas.width / 2);
    this.height = Math.floor(canvas.field.height * .86); // высота
    this.current_height = this.height;
    this.y = Math.floor(canvas.field.y + canvas.field.height * .07); // отступ сверху
    this.lastY = Math.floor(canvas.field.y + canvas.field.height * 1.0);

    this.place.width = this.width * this.placeCoef;

    this.lastX = this.startShowedWidth;
    this.x = this.lastX - this.width;
    this.place.x = this.x;

    this.stationar_x = this.x // стандартные координаты для возврата после анимации

    this.isPlace = false;
    this.lastIsPlace = false;
    this.place.y = this.y;
    this.place.height = this.height;
  }

  /*
   * Добавляет фрагмент или группу фрагментов в левое/правое меню
   * Меняя булеву переменную, дальнейшая логика в классах
   * дает элементам меньший размер и убирает способность
   * присоединяться
   */
  static includeInMenu = function() {
    const selected = ((arr[SelectFragmentHelper.translatedFragmentId].group != null) ?
      arr[SelectFragmentHelper.translatedFragmentId].group :
      arr[SelectFragmentHelper.translatedFragmentId]
    );
    selected.onMenu = true;
  }

  /*
   * Удаляет фрагмент или группу фрагментов с левого/правого меню
   * Меняя булеву переменную, дальнейшая логика в классах
   * возвращает элементам прежний размер и прежнюю способность
   * присоединяться
   */
  static removeFromMenu = function() {
    const selected = ((arr[SelectFragmentHelper.translatedFragmentId].group != null) ?
      arr[SelectFragmentHelper.translatedFragmentId].group :
      arr[SelectFragmentHelper.translatedFragmentId]
    );
    selected.onMenu = false;
  }

  /*
   * Срабатывает при БЛИЗКОМ наведении мышкой на меню
   * Проверяется вхождение координат мыши внутрь поля
   * вокруг меню (больше него)
   */
  onmousemove(x, y) {
    this.lastIsPlace = this.isPlace;
    if (this.place.isHadPoint(x, y)) {
      this.isPlace = true;
    } else {
      this.isPlace = false;
    }
  }

  onmousewheel(wheel) {
    if (wheel < 0 && !this.shown) {
      // вниз
      this.shown = true;
      // canvas.canvas.width / 2 - this.width / 2
      this.smoothMove(0, this.y);
    } else {
      if (wheel > 0 && this.shown) {
        // вверх
        this.shown = false;
        this.smoothMove(this.stationar_x, this.y);
      }
    }
  }

  smoothMove(newX, newY) {
    this.smoothing = true;
    let menu = this;
    super.smoothMove(newX, newY, function() {
      menu.smoothing = false;
    });
    this.place.smoothMove(newX, newY);

  }
  draw(context) {
    super.draw(context);

    // если взятый объект на меню, то подсветить меню
    let ind = SelectFragmentHelper.translatedFragmentId;
    if (this.isPlace && ind >= 0) {
      context.beginPath();
      context.rect(
        this.x,
        this.y,
        this.width,
        this.height
      );

      context.fillStyle = "rgba(33, 157, 157, 0.05)";
      context.fill();

      // выделяет анимацией элемент
      // if(this.isPlace != this.lastIsPlace) {
      //   console.log("replace");
      //   let selected = (arr[ind].group != null) ? arr[ind].group : arr[ind];
      //   if(this.isPlace) {
      //     selected.resizeSelect(false, -1);
      //   } else {
      //     selected.resizeSelect(false, 1);
      //   }
      // }
    }
  }

  /*
   * Рисует маску для скрытия объектов внутри
   * Вдальнейшем TODO
   *
   */
  drawMask(context) {
    context.beginPath();
    context.rect(
      this.x,
      this.y,
      this.width,
      this.height
    );

    context.fillStyle = "white";
    context.fill();
  }
}
