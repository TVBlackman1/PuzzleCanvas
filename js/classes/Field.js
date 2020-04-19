class Field extends Component {
  constructor() {
    super();
    // this.borderColor = "steelblue"

    this.all_width = null; // tmp-размеры для вмещения туда поля
    this.all_height = null;
    this.stationar_x = null;

    this.smoothing = false;

    this.linesX = [];
    this.linesY = [];
    this.linesColor = "rgba(155,155,155, 0.7)";
    this.scale = 0.9; // во сколько раз стоит уменьшить поле
    this.bigType = false;
    this.fragmentList = new FragmentList(); // все элементы на поле, кроме меню
    // формально принадлежат полю, если не принадлежат меню

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

  /**
   * Функция для вызова из normalIncrease и normalDecrease. Создана чисто чтобы
   * уменьшить количество одинакового кода. Суть её в изменении размера поля
   * и всех элементов, находящихся на нём.
   *
   * @param needToResize - bool, если изменить размер, то это true
   *
   */
  normalResize(needToResize) {
    // если необходимо изменить размер, то scale присутствует
    let scale = needToResize ? this.scale : 1;
    // используется ниже в smoothMove
    let scale2 = needToResize ? this.scale : 1 / this.scale;
    console.log(scale, scale2);

    var lastSeenObject = this.fragmentList.lastVisualObject;
    if (lastSeenObject != null)
      do {

        // если объект взят пользователем, то анимация другая используется
        // уменьшение идет от курсора, а изменения положения нет (кроме как от курсора)
        if (lastSeenObject.value.mainFragment.ind == SelectFragmentHelper.translatedFragmentId) {
          lastSeenObject.value.smoothResize(
            lastSeenObject.value.mainFragment.current_width,
            lastSeenObject.value.mainFragment.current_height,
            Fragment.widthScale * scale,
            Fragment.heightScale * scale,
            false, true
          );
          lastSeenObject = lastSeenObject.prev;
          continue;
        }

        lastSeenObject.value.smoothResize(
          lastSeenObject.value.mainFragment.current_width,
          lastSeenObject.value.mainFragment.current_height,
          Fragment.widthScale * scale,
          Fragment.heightScale * scale
        );

        let third_argument = null;
        if (lastSeenObject.value instanceof FragmentGroup) {
          // если группа, то необходимо передать фрагмент, относительно которого
          // следует перемещать группу фрагментов. Если же это не группа фрагментов,
          // а просто фрагмент, то передается null, это аргумент по-умолчанию для
          // метода класса Fragment.
          third_argument = lastSeenObject.value.mainFragment;
        }

        lastSeenObject.value.smoothMove(
          (lastSeenObject.value.mainFragment.x - this.x) * scale2 + this.x,
          (lastSeenObject.value.mainFragment.y - this.y) * scale2 + this.y,
          third_argument
        );

        lastSeenObject = lastSeenObject.prev;
      } while (lastSeenObject != null)

    if (needToResize) {
      super.smoothResize(this.width, this.height, this.width * this.scale, this.height * this.scale);
    } else {
      super.smoothResize(this.width * this.scale, this.height * this.scale, this.width, this.height);
    }
    this.smoothing = true;
    // super.smoothMove(Math.floor(canvas.canvas.width / 2 - this.width * this.scale / 2), this.y);
    super.smoothMove(this.x, this.y, function() {
      canvas.field.smoothing = false;
    });
    this.bigType = !this.bigType;
  }

  /*
   *  Функция для нормального уменьшения поля. Уменьшает поле на определенный
   *  процент, уменьшая и все пазлы, находящиеся на нём в это время.
   *  Так же поле переносится вверх.
   */
  normalDecrease() {
    if (!this.bigType || this.smoothing)
      return;
    this.normalResize(true);
  }

  /*
   *  Функция для нормального увеличения поля. Увеличивает поле на определенный
   *  процент, увеличивая и все пазлы, находящиеся на нём в это время.
   *  Так же поле переносится вверх.
   */
  normalIncrease() {
    if (this.bigType || this.smoothing)
      return;
    this.normalResize(false);
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

    // фрагменты поля отрисовываются отдельно, по логике они могут быть не только
    // на нём
    var lastSeenObject = canvas.field.fragmentList.firstVisualObject;
    if (lastSeenObject != null)
      do {
        lastSeenObject.value.draw(context);
        lastSeenObject = lastSeenObject.next;
      } while (lastSeenObject != null)
  }
}
