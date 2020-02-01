// init in Fragment.js

class Menu extends Component {
  constructor(type, cnv) {
    super();
    // this.borderColor = "red";
    // при создании ставятся значения по умолчанию. Следует создать пост-конструктор

    // type = 1 или type = -1 для левого/правого меню
    this.type = type;
    this.place = new MenuPlace();
    this.width = 430;
    this.placeCoef = 1.18;
    this.margin = 15;


  }

  init() {
    this.center = canvas.canvas.width / 2;
    this.height = canvas.field.height * .85;
    this.firstY = canvas.field.firstY + canvas.field.height * .1;
    this.lastY = canvas.field.firstY + canvas.field.height * .95;

    this.place.width = this.width * this.placeCoef;
    if (this.type == 1) {
      this.firstX = this.center + (canvas.field.width / 2) + this.margin;
      this.lastX = this.firstX + this.width;
      this.place.firstX = this.firstX - (this.placeCoef - 1) * this.width;

    } else if (this.type == -1) {
      this.lastX = this.center - (canvas.field.width / 2) - this.margin;
      this.firstX = this.lastX - this.width;
      this.place.firstX = this.firstX
    }

    this.isPlace = false;
    this.lastIsPlace = false;
    this.place.firstY = this.firstY;
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

  draw(context) {
    super.draw(context);

    // если взятый объект на меню, то подсветить меню
    let ind = SelectFragmentHelper.translatedFragmentId;
    if (this.isPlace && ind >= 0) {
      context.beginPath();
      context.rect(
        this.firstX,
        this.firstY,
        this.width,
        this.height
      );

      context.fillStyle = "rgba(12, 155,155,0.15)";
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
      this.firstX,
      this.firstY,
      this.width,
      this.height
    );

    context.fillStyle = "white";
    context.fill();
  }
}
