const FRAMES = 60;
const imagesX = 4;
const imagesY = 4;
const countImages = imagesX * imagesY;

const FIELD_WIDTH = 10 / 11; // Размеры поля
const FIELD_HEIGHT = 10 / 11; // Местоположение поля в Field.js -> (27, 28) строки

// const FIELD_WIDTH = 3 / 5; // Размеры поля
// const FIELD_HEIGHT = 9 / 11; // Местоположение поля в Field.js -> (27, 28) строки

const KEY_showSilhouette = 83; // S
const KEY_shouldConnect = 32; // SPACE

const DIRECTORY = "/js/PuzzleCanvas/images/";



// Вспомогательный объект, который необходим при удержании изображения мышью
// Способен определить индекс изображения в массиве, а так же запомнить
// Разницу между координатами курсора мыши и началом изображения в левом верхнем
// углу из метода "rangeToStartImage(x, y)" класса "Fragment"
let SelectFragmentHelper = {
  translatedFragmentId: -1,
  deltaX: 0,
  deltaY: 0
};

// Массив для изображений
const arr = [];

var shouldConnect = false;
var showSilhouette = false;

var canvas = undefined; // init in script.js

class Component {
    static tact = 21; // кол-во тактов анимации для всех компонентов канваса
    static frameTime = 10000 / FRAMES / Component.tact; // задержка перед
    // следующим тактом
    constructor() {
        this.borderColor = "#282828";
        this.fillColor = "#e4e4e4"

        this.smoothing = false; // для отсутствия взаимодействия при анимациях

        this.width = null; // размер
        this.height = null;

        this.current_width = null; // текущий размер с учетом функций его изменения
        this.current_height = null;

        this.x = null; // расположение
        this.y = null;

        this.lastX = null; // конечные координаты
        this.lastY = null;
    }

    isHadPoint(x, y) {
        return (
            x >= this.x && x <= this.x + this.current_width &&
            y >= this.y && y <= this.y + this.current_height
        )
    }

    move(x, y) {
        this.x = x;
        this.y = y;
        this.lastX = x + this.current_width;
        this.lastY = y + this.current_height;
    }

    shift(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.lastX += dx;
        this.lastY += dy;
    }

    /**
     *  Функция плавно перемещает компонент, не регулируя isConnecting, smoothing
     *  Требуется их явно поменять, т.к. это не будет правильно работать в случае
     *  передвижения группы фрагментов по одному (smoothing должен ставиться не
     *  каждому фрагменту в отдельности, а объекту группы)
     *
     *  @param int newX - новая координата x
     *
     *  @param int newY - новая координата y
     *
     *  @param function endFunction - функция, которая должна сработать по
     *                                завершению анимации
     *
     */
    async smoothMove(newX, newY, endFunction = ()=>{}) {
        let oldX = this.x;
        let oldY = this.y;
        let currentTact = 0;
        let dX = (newX - oldX) / (Component.tact);
        let dY = (newY - oldY) / (Component.tact);
        let component = this;

        // рекурсивная функция вызываемая с задержкой в самой себе
        function reDraw() {
            return new Promise((resolve => {
                component.move(
                    component.x + dX,
                    component.y + dY
                );
                setTimeout(()=>{resolve()}, Component.frameTime);
            }));
        }
        while(currentTact < Component.tact - 1){
           await reDraw();
           currentTact++;
        }
        component.move(
            newX,
            newY
        );
        endFunction();
    }


    /**
     * Функция сдвигает компонент на dx, dy
     * Нельзя полностью заменить smoothMove подсчётом разницы координат.
     * При одновременном работе двух smoothMove в обоих случаях подсчёт идет на
     * конкретные координаты. То есть в итоге компонент перемещается на те координаты,
     * которые были указаны в последнем вызванном smoothMove. Здесь сдвиг происходит
     * относительно текущего положения, все вызовы smoothShift сработают одинаково
     * без преимуществ одного вызова над другим
     *
     * @param int dx - на сколько сдвигается компонент по оси X:
     *
     * @param int dy - на сколько сдвигается компонент по оси Y
     *
     * @param function endFunction - функция, которая должна сработать по
     *                               завершению анимации.
     *
     *
     */
    smoothShift(dx, dy, endFunction = function () {
    }) {
        let oldX = this.x;
        let oldY = this.y;
        let currentTact = 0;
        let dX = dx / (Component.tact);
        let dY = dy / (Component.tact);
        let component = this;

        // рекурсивная функция вызываемая с задержкой в самой себе
        function reDraw() {
            component.shift(dX, dY);

            if (currentTact < Component.tact - 1) {
                setTimeout(reDraw, Component.frameTime);
                currentTact++;
            } else {
                component.shift(-dX * (Component.tact), -dY * (Component.tact));
                // component.move(oldX, oldY);
                component.shift(dx, dy);
                endFunction();
            }
        }

        reDraw();
    }


    /**
     * Функция для плавного изменения размера у компонента
     * Не меняет значения resizing
     *
     * @param double - 4 длины компонента, понятные из их названий
     *
     * @param back - стоит ли повторять анимацию задонаперед при истинности
     *
     */
    smoothResize(old_width, old_height, new_width, new_height, back = false) {
        let currentTact = 0;
        let dX = (new_width - old_width) / (Component.tact);
        let dY = (new_height - old_height) / (Component.tact);

        let component = this;

        // рекурсивная функция вызываемая с задержкой в самой себе
        function resize() {
            component.setSizes(component,
                component.current_width + dX,
                component.current_height + dY
            );

            if (currentTact < Component.tact - 1) {
                setTimeout(resize, Component.frameTime);
                currentTact++;
            } else {
                component.setSizes(component, new_width, new_height);
                component.move(component.x, component.y); // при resize меняются размеры
                // эта функция никуда не перемещает объект, но перезаписывает крайние координаты
                // которые зависят от размеров самого объекта

                if (back) {
                    // повторная анимация, возвращающая всё обратно
                    component.smoothResize(new_width, new_height, old_width, old_height, false, append_cursor);
                }
            }
        }

        resize();
    }

    /**
     * Функция предназначена для мгновенного изменения размера
     * Следует вызывать из smoothResize
     *
     * @param component - компонент, над которым выполняются действия
     *
     * @param current_width - текущая длина компонента
     *
     * @param current_height - текущая высота компонента
     *
     */
    setSizes(component, current_width, current_height) {
        component.current_width = current_width;
        component.current_height = current_height;
    }


    draw(context) {
        context.beginPath();
        context.rect(
            this.x,
            this.y,
            this.current_width,
            this.current_height
        );

        context.strokeStyle = this.borderColor;
        context.stroke();
        context.fillStyle = this.fillColor;
        context.fill();
    }
}

// кнопки между панелью и игровым полем

class Button extends Component {
  static width = 40;
  static height = 40;
  static name = null; // название, используемое для идентификации кнопки
                      // и для пути до исходного изображения

  constructor() {
    super();
    this.name = this.constructor.name; // получить название, статично прописанное
                                       // в классе. Такой подход работает и при
                                       // работе с производными классами
    this.fillColor = "#fff";
    this.src = DIRECTORY + "icons/" + "icon-"+ this.name + "4.png";
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

class BlankField extends Component{

  static fillColor = "rgba(152,152,192)";

  constructor(x, y, width, height) {
    super();
    this.firstX = x;
    this.firstY = y;
    this.width = width;
    this.height = height;
    this.borderColor = "#4e4e4e";
  }

  draw(context) {
    super.draw(context);
    context.fillStyle = "#4e4e4e";
    context.fill();
  }
}

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
    // console.log(scale, scale2);

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

        lastSeenObject.value.smoothShift(
          (lastSeenObject.value.mainFragment.x - this.x) * scale2 + this.x - lastSeenObject.value.mainFragment.x,
          (lastSeenObject.value.mainFragment.y - this.y) * scale2 + this.y - lastSeenObject.value.mainFragment.y,
          third_argument
        ); // TODO

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

// init in script.js

class Canvas {
  constructor(id, countImages) {
    console.log("Canvas created");
    this.canvas = document.getElementById(id);
    this.context = this.canvas.getContext('2d');

    // отключение сглаживания, хз нужно ли, но любое смазывание я хочу убрать
    // суть в том, что мелкое изображение пазла на нижней панели изначально
    // смазано, а после, при его взятии (и увеличении изображения соответственно)
    // но перестает быть смазанным и начинает быть супер резким. Такая смена
    // отображения должна быть пресечена
    this.context.mozImageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;

    this.context.imageSmoothingEnabled = false; // то же самое, но основное

    this.panel = null;
    this.left_menu = null;
    this.field = null;

    this.fr_zones = [];
    this.fr_zones.length = 3;

    this.blank_zones = [];

  }

  initElements() {
    this.field = new Field();
    this.panel = new Panel(countImages, this);
    this.left_menu = new Menu(this);

    this.fr_zones[0] = this.field;
    this.fr_zones[1] = this.left_menu;
    this.fr_zones[2] = this.panel;
  }

  getCoords(x, y) {
    var bbox = this.canvas.getBoundingClientRect();
    return {
      x: (x - bbox.left) * (this.canvas.width / bbox.width),
      y: (y - bbox.top) * (this.canvas.height / bbox.height)
    };
  }

  isInZones(x, y) {
    var zones = this.fr_zones;
    for (var i = 0; i < zones.length; i++) {
      if (zones[i].isHadPoint(x, y)) {
        console.log("!");
        return true;
      }
    }
    return false;
  }

  // переносить объект между меню и общим полем
  checkMoveBetweenLists() {
    if (this.left_menu.smoothing) {
      Menu.removeFromMenu();
      return;
    }
    if (this.left_menu.isPlace) {
      Menu.includeInMenu();
    } else {
      Menu.removeFromMenu();
    }
  }

  smoothShiftDelta(dx, dy) {
    let oldX = this.x;
    let oldY = this.y;
    let currentTact = 0;
    let dX = dx / (Component.tact);
    let dY = dy / (Component.tact);
    let component = this;
    // рекурсивная функция вызываемая с задержкой в самой себе
    function reDraw() {
      SelectFragmentHelper.deltaX += dX;
      SelectFragmentHelper.deltaY += dY;

      if (currentTact < Component.tact - 1) {
        setTimeout(reDraw, Component.frameTime);
        currentTact++;
      } else {
        SelectFragmentHelper.deltaX -= dX * (Component.tact);
        SelectFragmentHelper.deltaY -= dY * (Component.tact);

        SelectFragmentHelper.deltaX += dx;
        SelectFragmentHelper.deltaY += dy;
      }
    }
    reDraw();
  }

  draw(context) {
    this.field.draw(context);
    this.left_menu.draw(context);
    this.panel.draw(context);
  }
}

// init in Fragment.js


class Panel extends Component {
  constructor(imagesCount, cnv) {
    super();
    // this.borderColor = "blue";

    this.width = 1400;
    this.height = 85;
    this.current_height = this.height;

    this.x = 200;
    this.stationar_x = this.x;
    this.lastX = 900;

    this.y = null;
    this.lastY = null;

    this.paddingX = 0;
    this.paddingY = 0;
    this.mainWidth = null; // длина без учета кнопок
    this.fragmentsCount = null; // фрагментов в 1 листе
    this.fragmentSpace = null; // расстояние между фрагментами
    this.lists = null; // количество листов
    this.list = 1; // текущий лист
    this.buttonWidth = 80;
    this.marginBottom = 5;

    this.place = new PanelPlace();
    this.place.height = this.height;
    this.mark = new Component(); // мелкая пипка сверху
    this.shown = true; // показано или скрыто меню

    var th = this;
    this.leftButton = new PanelButton(-1, function() {
      return th.x;
    });
    this.rightButton = new PanelButton(1, function() {
      return th.lastX - th.buttonWidth;
    });

    this.buttons = [this.leftButton, this.rightButton];
    this.fragments = []; // id нужных фрагментов, может быть заданно в случайном порядке (теоретически)
    this.fragments.length = imagesCount;

    cnv.panel = this;
    this.wasHiden = false; // уже было когда-то скрыто, теперь можно скрывать и открывать по алгоритму
  }

  init() {
    // this.width = Math.floor(canvas.field.width * 1.64); // ШИРИНА ПАНЕЛИ
    this.current_width = this.width;

    this.x = Math.floor(canvas.canvas.width / 2 - this.width / 2); // МЕСТОПОЛОЖЕНИЕ ПАНЕЛИ
    this.stationar_x = this.x;

    this.lastY = canvas.canvas.height - this.marginBottom; // МЕСТОПОЛОЖЕНИЕ ПАНЕЛИ

    this.lastX = this.x + this.width;

    this.y = this.lastY - this.height;
    this.stationar_y = this.y;

    this.mainWidth = Math.floor(this.width - 2 * this.buttonWidth - 2 * this.paddingX);

    this.place.width = this.width;
    this.place.current_width = this.current_width;
    this.place.current_height = this.current_height * 0.9;

    this.place.x = this.x;
    this.place.y = this.y + this.place.current_height / 10;
    this.place.lastY = canvas.canvas.height;
    this.place.current_height = this.place.lastY - this.place.y;


    Fragment.heightPanel = Math.floor(this.height - 2 * this.paddingY);
    Fragment.widthPanel = Math.floor(Fragment.heightPanel / Fragment.height * Fragment.width);

    Fragment.third_xPanel = Math.floor(Fragment.widthPanel / 5);
    Fragment.third_yPanel = Math.floor(Fragment.heightPanel / 5);
    this.fragmentsCount = Math.floor(this.mainWidth / Fragment.widthPanel);
    this.fragmentSpace = Math.floor(
      (this.mainWidth - this.fragmentsCount * Fragment.widthPanel) /
      (this.fragmentsCount - 1)
    );

    this.lists = Math.floor(countImages / this.fragmentsCount) + 1;

    this.markInit();
  }

  markInit() {
    this.mark.height = 12;
    this.mark.current_height = this.mark.height;

    this.mark.width = 100;
    this.mark.current_width = this.mark.width;

    this.mark.x = Math.floor(canvas.canvas.width / 2 - this.mark.width / 2);
    this.mark.lastY = this.y;
    this.mark.y = this.mark.lastY - this.mark.current_height;
    this.mark.stationar_y = this.mark.y;
  }

  hide() {
    if (!this.shown || this.smoothing)
      return;
    this.smoothing = true;
    let panel = this;
    this.smoothMove(this.x, this.y + 90, function() {
      panel.smoothing = false;
    });
    this.mark.smoothMove(this.mark.x, this.mark.y + 90);
    this.shown = false;

  }

  show() {
    if (this.shown || this.smoothing)
      return;
    this.smoothing = true;
    let panel = this;
    this.smoothMove(this.x, this.stationar_y, function() {
      panel.smoothing = false;
    });
    this.mark.smoothMove(this.mark.x, this.mark.stationar_y);
    this.shown = true;
  }

  onmousedown(loc) {
    for (var i = 0; i < this.buttons.length; i++) {
      if (this.buttons[i].isHadPoint(loc.x, loc.y)) {
        console.log("Button pressed");
        this.buttons[i].func();
        return true;
      }
    }
    return false;
  }

  onmousemove(x, y) {
    if (this.place.isHadPoint(x, y)) {
      let ind = SelectFragmentHelper.translatedFragmentId;
      if (ind == -1 || arr[ind].group == null) {
        this.wasHiden = true;
        canvas.field.normalDecrease();
        canvas.panel.show();
      }
    } else {
      if (this.wasHiden) {
        canvas.field.normalIncrease();
        canvas.panel.hide();
      }
    }
  }

  draw(context) {
    super.draw(context);
    // this.place.draw(context);
    this.mark.draw(context);
    for (var i = 0; i < this.buttons.length; i++) {
      this.buttons[i].draw(context);
    }
  }

  drawFragments(context) {
    var start = this.fragmentsCount * (this.list - 1);
    var end = this.fragmentsCount * this.list;
    if (this.list == this.lists) {
      //  в случае, если на последнем листе неполное количество фрагментов
      // как правило это именно так
      end = start + this.fragments.length % this.fragmentsCount;
    }
    for (var i = start; i < end; i++) {
      var fr = arr[this.fragments[i]];
      context.drawImage(
        fr.img,
        this.x + this.buttonWidth + this.paddingX + (this.fragmentSpace + Fragment.widthPanel) * (
          i % this.fragmentsCount),
        this.y + this.paddingY,
        Fragment.widthPanel,
        Fragment.heightPanel
      );

      if (!fr.onBottomPanel) {
        // изобразить маску, если объект не на панели
        context.beginPath();
        context.fillStyle = this.fillColor + "99"; // прозрачность
        context.rect(
          this.x + this.buttonWidth + this.paddingX + (this.fragmentSpace + Fragment.widthPanel) * (
            i % this.fragmentsCount),
          this.y + this.paddingY,
          Fragment.widthPanel,
          Fragment.heightPanel
        );
        context.fill();
      } else {
        // если объект на панели, то нарисовать обводку вокруг него
        context.drawImage(
          fr.imgB,
          this.x + this.buttonWidth + this.paddingX + (this.fragmentSpace + Fragment.widthPanel) * (
            i % this.fragmentsCount),
          this.y + this.paddingY,
          Fragment.widthPanel,
          Fragment.heightPanel
        );
      }
    }
  }
}

class PanelPlace extends Component {}

class PanelButton {
  constructor(inc, pos) {
    this.inc = inc;
    this.getPos = pos // функция для получения, т.к. соответствующие переменные объявлены позже
  }

  isHadPoint(x, y) {
    return (
      x >= this.getPos() &&
      x <= this.getPos() + canvas.panel.buttonWidth &&
      y >= canvas.panel.y &&
      y <= canvas.panel.y + canvas.panel.height
    )
  }

  draw(context) {
    //  данном случае нецелочисленное значение улучшает резкость
    context.beginPath();
    context.rect(
      this.getPos() + 0.5,
      canvas.panel.y + 0.5,
      canvas.panel.buttonWidth,
      canvas.panel.height
    );
    context.strokeStyle = "#4e4e4e";
    context.stroke();
  }

  // onclick
  // увеличивает номер страницы на заданный инкремент (увеличивает или уменьшает на 1, разное для левой и правой кнопок)
  func() {
    canvas.panel.list += this.inc
    if (canvas.panel.list == 0) canvas.panel.list = 1;
    if (canvas.panel.list == canvas.panel.lists + 1) canvas.panel.list = canvas.panel.lists;
  }
}

class Timer extends Component {
  static width = 120;
  static height = 40;

  constructor() {
    super();
  }

  init(x, y) {
    this.x = x;
    this.y = y;
    this.width = Timer.width;
    this.height = Timer.height;
    this.lastX = this.x + this.width;
    this.lastY = this.y + this.height;
  }
}

class ButtonBack extends Button {
  static name = "back";
  
  constructor() {
    super();
  }
  func() {
    super.func();
    console.log("You left the game");
  }
}

class ButtonDelete extends Button {
  static name = "delete";

  constructor() {
    super();
  }
  func() {
    super.func();
    console.log("Deleted");
  }
}

class ButtonDeleteAll extends Button {
  static name = "delete-all";
  
  constructor() {
    super();
  }
  func() {
    super.func();
    console.log("All deleted");
  }
}

class ButtonPlay extends Button {
  static name = "play";
  constructor() {
    super();
  }
  func() {
    super.func();
    console.log("Play!");
  }
}

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

// init in Fragment.js

class Menu extends Component {
  constructor(cnv) {
    super();
    this.fillColor = "#e3e3e3"

    this.place = new MenuPlace(); // чтобы улавливать коннект при близком наведении
    this.startShowedWidth = 30; // пикселей длины показано в свёрнутом виде
    this.width = 1420;
    this.current_width = this.width;
    this.placeCoef = 1.0; // на сколько заходит onmouse за зону Menu
    this.margin = 10;

    this.shown = false; // меню скрыто изначально
    this.fragmentList = new FragmentList(); // все элементы в меню


  }

  init() {
    this.center = Math.floor(canvas.canvas.width / 2);
    this.height = Math.floor(canvas.field.height * .86); // высота
    this.current_height = this.height;
    this.y = Math.floor(canvas.field.y + canvas.field.height * .07); // отступ сверху
    this.lastY = Math.floor(canvas.field.y + canvas.field.height * 1.0);


    this.lastX = this.startShowedWidth;
    this.x = this.lastX - this.width;
    this.stationar_x = this.x // стандартные координаты для возврата после анимации

    this.isPlace = false;
    this.lastIsPlace = false; // не помню причину добавления ???

    this.place.height = this.height;
    this.place.width = this.width * this.placeCoef;
    this.place.current_width = this.place.width;
    this.place.current_height = this.place.height;

    this.place.x = this.x;
    this.place.lastX = this.lastX;
    this.place.y = this.y;
    this.place.lastY = this.lastY;
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

  toogleMenu() {
    if (this.shown)
      this.smoothMove(this.stationar_x, this.y);
    else
      this.smoothMove(0, this.y);
    this.shown = !this.shown;
  }

  smoothMove(newX, newY) {
    this.smoothing = true;
    let menu = this;

    // Значения меняются раньше, чем используются. Сохранение для передвижения
    // фрагментов в цикле ниже
    let lastX = menu.x;
    let lastY = menu.y;
    super.smoothMove(newX, newY, function() {
      menu.smoothing = false;
    });
    this.place.smoothMove(newX, newY);

    // переместить все элементы меню как и само меню
    var lastSeenObject = this.fragmentList.lastVisualObject;
    if (lastSeenObject != null)
      do {

        // если объект взят пользователем, то анимацией не следует его убирать
        if (lastSeenObject.value.mainFragment.ind == SelectFragmentHelper.translatedFragmentId) {
          lastSeenObject = lastSeenObject.prev;
          continue;
        }

        // иначе убираем его
        if (lastSeenObject.value instanceof Fragment) {
          lastSeenObject.value.smoothMove(
            lastSeenObject.value.x + newX - lastX,
            lastSeenObject.value.y + newY - lastY,
          );
        } else if (lastSeenObject.value instanceof FragmentGroup) {
          // перемещение группы относительно mainFragment
          lastSeenObject.value.smoothMove(
            lastSeenObject.value.mainFragment.x + newX - lastX,
            lastSeenObject.value.mainFragment.y + newY - lastY,
            lastSeenObject.value.mainFragment
          );
        }
        lastSeenObject = lastSeenObject.prev;
      } while (lastSeenObject != null)
  }
  draw(context) {
    super.draw(context);

    // условие потом
    // отрисовка элементов на меню
    var lastSeenObject = this.fragmentList.firstVisualObject;
    if (lastSeenObject != null) // может не быть элементов
      do {
        lastSeenObject.value.draw(context);
        lastSeenObject = lastSeenObject.next;
      } while (lastSeenObject != null)

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

      // выделяет анимацией элемент, не работает
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
    // context.beginPath();
    // context.rect(
    //   this.place.x,
    //   this.place.y,
    //   this.place.width,
    //   this.place.height
    // );
    //
    // context.fillStyle = "rgb(19, 235, 235)";
    // context.fill();

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

class MenuPlace extends Component {}

class FragmentGroup {
    constructor(src, x, y, left, top) {
        this.fragments = new Set();
        this.isConnecting = false; // группа в данный момент подключает другой объект, а потому не может перемещаться.
        // В противном случае нужно чёто рассматривать а мне лень
        this.smoothing = false;
        this.resizing = false;
        this.connectedToCorner = false;

        this.listElem = null; // ссылка на соответстующий элемент в листе
        this.mainFragment = null; // главный фрагмент группы, нужный для вычисления расстояния до
        // в уменьшенной группе в области меню и определения его новых координат
        this.onMenu = false;
        this.onMenuLast = false; // нужно при tryMoveBeetwenLists, проверьте сами, мне лень

        /*
         * Нужны крайние значения
         * с помощью них можно получить крайние значения по осям X и Y для группы
         * и ограничить её перемещение по полю, а так же изменяет scale у resizeSelect
         * для меньшего изменения размера для каждого фрагмента. Т.е. чем больше длина
         * и высота фрагмента, тем меньше изменение размера
         */
        this.leftFragmentInd = -1;
        this.rightFragmentInd = -1;
        this.topFragmentInd = -1;
        this.bottomFragmentInd = -1;
    }

    /**
     * Прошлые версии возвращали индекс, в этой не стоит, т.к.
     * сейчас взятым фрагментом считается mainFragment, а не по-настоящему взятый
     * это решается несколько проблем с "телепортацией" группы при работе с
     * увеличением и уменьшением элементов
     *
     * @return bool found
     *
     */
    isHadPoint(x, y) {
        var found = false;
        this.fragments.forEach(function (fragment, ind, arr) {
            found = found || fragment.isHadPoint(x, y); // если нашлось, не проверяется
        });
        return found;
    }

    /**
     * Перемещает все фрагменты зависимо от того, куда переместился один из них
     *
     * @param x - координата по оси x выбранного фрагмента
     *
     * @param y - координата по оси y выбранного фрагмента
     *
     * @param selected - выбранный фрагмент, который перемещается.
     *                   относительно него вычисляются координаты других фрагментов
     *                   чтобы изображение не ломалось
     */
    move(x, y, selected) {
        this.fragments.forEach(function (fragment, ind, arr) {
            if (fragment !== selected) {
                fragment.move(
                    x - selected.x + fragment.x,
                    y - selected.y + fragment.y
                )
            }
        });
        selected.move(x, y); // обрабатывается последним, т.к. в цикле используются его данные
    }

    draw(context) {
        this.fragments.forEach(function (fragment, ind, arr) {
            fragment.draw(context);
        });
    }

    async smoothMove(x, y, selected, connectingFragment = null) {
        // connectingFragment - фрагмент, к которому я конекчусь.
        let smoothMoves = [];
        for (const fragment of this.fragments) {
            if (fragment !== selected) {
                smoothMoves.push(fragment.smoothMove(
                    x - selected.x + fragment.x,
                    y - selected.y + fragment.y,
                    connectingFragment
                ));
            }
        }
        smoothMoves.push(selected.smoothMove(x, y, connectingFragment, true));
        await Promise.all(smoothMoves);
        // true, можно работать с группой
    }


    /**
     * Функция сдвигает компонент на dx, dy
     * Подробности в описании функции класса Component
     * @param int dx - на сколько сдвигается компонент по оси X:
     *
     * @param int dy - на сколько сдвигается компонент по оси Y
     *
     * @param function endFunction - функция, которая должна сработать по
     *                               завершению анимации.
     *
     *
     */
    smoothShift(dx, dy) {
        console.log("!smoothShiftGroup");
        // connectingFragment - фрагмент, к которому я конекчусь.
        this.fragments.forEach(function (fragment, ind, arr) {
            fragment.smoothShift(dx, dy)
        });
        // true, можно работать с группой
    }

    changeGroup(newGroup) {
        this.fragments.forEach(function (fragment, ind, arr) {
            fragment.group = newGroup;
            newGroup.fragments.add(fragment);
        });
    }

    connectTo() {
        var minRange = -1;
        var minFragment = null;
        let result = {res: false}; // информация о том, нужно ли группе присоеденятся
        this.fragments.forEach(function (fragment, ind, arr) {

            // для каждого из фрагментов смотрим, можем ли мы присоединить его к другим фрагментам вне группы
            var res = fragment.connectTo(fragment.ind, false); // информация о возможности присоединения БЕЗ самого присоединения
            // res - null при объекте в меню или наведенном на меню => не стоит присоединяться
            console.log(res);
            // сортировка по расстоянию, если есть возможность присоединить. Выбор минимального из расстояний
            if (res && res.res) {
                if (minRange == -1) {
                    minRange = res.range;
                    minFragment = fragment;
                }
                if (res.range < minRange) {
                    minRange = res.range;
                    minFragment = fragment;
                }
            }
        });
        if (minFragment != null) {
            result = minFragment.connectTo(minFragment.ind, true);
        }
        return result;
    }

    /*
     * Меняет размер, если объект на меню
     *
     */
    tryMoveBeetwenLists(fr) {
        // fr - фрагмент, который мы взяли. Относительно него будут строиться остальные
        if (this.onMenuLast == this.onMenu) {
            return;
        }
        this.onMenuLast = this.onMenu;
        console.log(canvas.left_menu.smoothing);
        if (!this.onMenu) {
            // поставить по умолчанию

            let tmp = this.listElem;
            this.listElem.remove(); // удалиться из прошлого листа
            canvas.field.fragmentList.appendElem(tmp); // добавиться в новый

            this.scale = canvas.field.bigType ? 1 : canvas.field.scale;
            this.smoothResize(
                Fragment.widthPanel, Fragment.heightPanel,
                Fragment.widthScale * this.scale, Fragment.heightScale * this.scale,
                false, true
            );
        } else {
            // поставить в зависимости от главного, в меню

            let tmp = this.listElem;
            this.listElem.remove(); // удалиться из прошлого листа
            canvas.left_menu.fragmentList.appendElem(tmp); // добавиться в новый

            // this.mainFragment = fr;
            this.smoothResize(
                fr.current_width, fr.current_height,
                Fragment.widthPanel, Fragment.heightPanel,
                false, true
            );
            console.log();
        }
    }

    /**
     * Меняет относительные координаты у фрагментов группы для
     * нормального уменьшения / увеличения изображения при добавлении в группу
     *
     * @param double - 4 длины пазлины, понятные из их названий
     *
     * @param bool back - повторяет анимацию задонаперед
     *
     * @param bool append_cursor - стоит ли отталкиваться от местоположения курсора
     *
     */
    smoothResize(old_x, old_y, new_x, new_y, back = false, append_cursor = false) {
        // append_cursor для группы обрабатывается отдельно
        // в здешнем if-e, т.к. иначе у mainFragment изменятся координаты
        // и они не правильно посчитаются в дальнейшем у некоторых фрагментов
        // изображение сместится, баг
        // Другими словами, сначала требуется изменить размер всех пазлов,
        // а потом переместить их. Это происходит быстро и без видимых проблем
        this.fragments.forEach(function (fragment, ind, arr) {
            // false - append_cursor здесь не рассматривается из-за if-а дальше
            // ведь должно обрабатываться одноразово
            fragment.smoothResize(old_x, old_y, new_x, new_y, back, false);
        });
        if (append_cursor) {
            let b_x = SelectFragmentHelper.deltaX * (1 - new_x / old_x);
            let b_y = SelectFragmentHelper.deltaY * (1 - new_y / old_y);
            SelectFragmentHelper.deltaX -= b_x;
            SelectFragmentHelper.deltaY -= b_y;
            this.fragments.forEach(function (fragment, ind, arr) {
                fragment.smoothShift(b_x, b_y);
            });
        }
    }

    /**
     * Выделяет группу изменением размера
     *
     * @param back - bool, стоит ли возвращать анимацию назад
     *
     * @param charact - увеличить или уменьшить (-1, 1)
     *
     * @param scale - double, во сколько раз стоит уменьшить/увеличить изображение
     *
     */
    resizeSelect(this_gr = this, back = true, charact = -1, scale = 0.95) {
        let maxDif = Math.max(this_gr.rightFragmentInd - this_gr.leftFragmentInd,
            this_gr.topFragmentInd - this_gr.bottomFragmentInd);
        let scaleForFragment = 1 - (1 - scale) / maxDif;
        // формула для нормального изменения размера всей группы.
        // Если поставить scale, то при большой длине или высоте изменения размера
        // в пиксилях будут велики, а в данном случае они будут одинаковы.
        this_gr.fragments.forEach(function (fragment, ind, arr) {
            fragment.resizeSelect(back, charact, scaleForFragment);
        });
    }

    smoothMoveWithCallback(x, y, selected, callback, connectingFragment = null) {
        let observer = new Proxy(this, {
            set: (target, p, value) => {
                if (p === "smoothing" && value === false) {
                    callback();
                }
                return true;
            }
        });
        observer.smoothMove(x, y, selected, connectingFragment);
        this.smoothMove(x, y, selected, connectingFragment);
    }
}

// Возможно стоит убрать подключение к smoothing объекту. а то проблем слишком дохуя??
// на заметку, потом посмотрим - Михаил

// Давно уже убрал, но комент забавный я оставил, пусть будет на память как и "var hello = 4"
// Шёл третий месяц, а мне до сих пор смешно - Никита

var hello = 4; // - Атаман Кирилл
class Fragment extends Component {
  static SCALE = -1;
  static downloadedImages = 0;
  static width = -1;
  static height = -1;
  static widthScale = -1;
  static heightScale = -1;
  static third_x = -1;
  static third_y = -1;
  static connectRange = -1;

  static widthPanel = -1;
  static heightPanel = -1;
  static third_xPanel = -1;
  static third_yPanel = -1;
  static widthWithoutSpacesPanel = -1;
  static heightWithoutSpacesPanel = -1;
  constructor(ind, src, srcBorder, x, y, left, top, bottomInd) {
    super();
    this.src = src; // путь до изображения пазла
    this.srcB = srcBorder; // путь до изображения с границами изображения
    this.x = x;
    this.y = y;

    // необходимо для вычисления нового положения при изменении размера элементов группы
    this.menuDX = 0; // расстояние от главного фрагмента в группе до текущего по X
    this.menuDY = 0; // расстояние от главного фрагмента в группе до текущего по Y
    this.img = new Image(); // изображение фрагмента
    this.imgB = new Image(); // image-border
    this.current_width = -1;
    this.current_height = -1;

    this.mainFragment = this; // для поддержки алгоритмов по работе с группами

    this.downloadImage();

    this.img.src = this.src;
    this.imgB.src = this.srcB;
    this.ind = ind;
    this.connectedToCorner = false;
    this.onBottomPanel = true;
    this.onMenu = false;
    this.onMenuLast = false; // проверка на нахождение в меню, выполненная ранее
    // нужна для неизменности некоторых данных, при условии
    // что объект так же как и в предыдущих находится/не находится
    // в области меню
    this.bottomPanelInd = bottomInd;

    this.current_third_x = -1;
    this.current_third_y = -1;

    /*
     * Для следуюих переменных в блоке
     * при истинности хотя бы одной из них
     * запрещается подключаться к другим фрагментам (не считая самой анимации)
     * запрещается выделять объекты мышкой
     */
    this.smoothing = false; // плавное автоматическое перемещение, не зависящее от мыши
    this.isConnecting = false; // объект ждет подключения к нему другого объекта
    this.resizing = false; // проигрывание анимации изменения размера

    this.animated = false;


    Fragment.third_x = Fragment.SCALE / 5;
    Fragment.third_y = Fragment.SCALE / 5;
    Fragment.connectRange = Fragment.third_x * 2; // ВРЕМЕННО

    /*
     * В данном блоке представлены ссылки на соседние пазлы
     * в цельном изображении. Соответственно верхний, нижний,
     * правый, левый. Если таких не существует - null
     */
    this.left = left;
    this.top = top;
    this.right = null;
    this.bottom = null;
    if (this.left != null)
      this.left.right = this;
    if (this.top != null)
      this.top.bottom = this;

    this.group = null; // ссылка на группу
    this.listElem = null; // ссылка на элемент двусвязного списка
  }

  init(img) {
    Fragment.width = img.width;
    Fragment.height = img.height;

    Fragment.SCALE = (
      Math.min(
        canvas.field.all_width / (imagesX / 5 * 3) / Fragment.width,
        canvas.field.all_height / (imagesY / 5 * 3) / Fragment.height
      )
    );
    Fragment.widthScale = Math.floor(Fragment.SCALE * Fragment.width);
    Fragment.heightScale = Math.floor(Fragment.SCALE * Fragment.height);

    Fragment.third_x = Fragment.widthScale / 5;
    Fragment.third_y = Fragment.heightScale / 5;
    Fragment.widthWithoutSpaces = Fragment.widthScale - 2 * Fragment.third_x;
    Fragment.heightWithoutSpaces = Fragment.heightScale - 2 * Fragment.third_y;

    Fragment.connectRange = 2.5 * Math.min(
      Fragment.third_x,
      Fragment.third_y
    );


  }

  downloadImage() {
    var fr = this;
    this.img.onload = function() {
      Fragment.downloadedImages++;
      if (Fragment.downloadedImages == 1) {
        initializeSizes(fr, this)
      }
    }
  }

  // Отображает изображение в заданных координатах
  draw(context) {
    if (!showSilhouette) {
      // не силуэт
      if (!this.onBottomPanel) {
        // изобразить элемент, если он не на панели
        let selected = (this.group != null) ? this.group : this;
        context.drawImage(
          this.img,
          this.x,
          this.y,
          this.current_width,
          this.current_height
        );
        context.drawImage(
          this.imgB,
          this.x,
          this.y,
          this.current_width,
          this.current_height
        );
      }
    } else {
      // изобразить силуэт
      let selected = (this.group != null) ? this.group : this;
      if (selected.onMenu) {
        context.beginPath();
        context.lineWidth = "3";
        context.strokeStyle = "black";
        context.rect(
          this.x + 2 * Fragment.third_xPanel,
          this.y + 2 * Fragment.third_yPanel,
          Fragment.widthPanel - 2 * Fragment.third_xPanel,
          Fragment.heightPanel - 2 * Fragment.third_yPanel
        );
        context.stroke();
        context.beginPath();
        context.rect(
          this.x,
          this.y,
          Fragment.widthPanel,
          Fragment.heightPanel
        );
        context.stroke();
      } else if (!this.onBottomPanel) {
        context.beginPath();
        context.rect(
          this.x + this.current_third_x,
          this.y + this.current_third_y,
          this.current_width - 2 * this.current_third_x,
          this.current_height - 2 * this.current_third_y
        );
        context.lineWidth = "2";
        context.strokeStyle = "black";
        context.stroke();

        context.beginPath();
        context.rect(
          this.x + this.current_third_x,
          this.y + this.current_third_y,
          this.current_width - 2 * this.current_third_x,
          this.current_height - 2 * this.current_third_y
        );

        context.lineWidth = "4";
        context.strokeStyle = "blue";
        context.stroke();
      }
    }
  }

  /**
   * Проверяет, есть ли точка с координатами x, y внутри фрагмента
   * универсально работает как для фрагмента, находящегося на главном поле
   * сборки, так и для фрагмента, находящегося внутри меню или на нижней панели.
   * Работает только для видимой части пазла
   *
   * @param x - координата по оси X
   *
   * @param y - координата по оси Y
   *
   * @return bool - лежит ли точка внутри видимой части фрагмента
   */
  isHadPoint(x, y) {
    if (this.onBottomPanel) {
      return (
        canvas.panel.fragmentsCount * (canvas.panel.list - 1) <= this.bottomPanelInd &&
        this.bottomPanelInd < canvas.panel.fragmentsCount * canvas.panel.list &&
        x >= (canvas.panel.x + canvas.panel.buttonWidth + canvas.panel.paddingX +
          (canvas.panel.fragmentSpace + Fragment.widthPanel) * (
            this.bottomPanelInd % canvas.panel.fragmentsCount)) &&
        x <= (canvas.panel.x + canvas.panel.buttonWidth + canvas.panel.paddingX +
          (canvas.panel.fragmentSpace + Fragment.widthPanel) * (
            this.bottomPanelInd % canvas.panel.fragmentsCount) + Fragment.widthPanel) &&
        y >= canvas.panel.y + canvas.panel.paddingY &&
        y <= canvas.panel.y + canvas.panel.paddingY + Fragment.heightPanel
      )
    }

    let selected = (this.group != null) ? this.group : this;
    if (selected.onMenu) {
      return (
        x >= (this.x + Fragment.third_xPanel) &&
        x <= (this.x + Fragment.widthPanel - Fragment.third_xPanel) &&
        y >= (this.y + Fragment.third_yPanel) &&
        y <= (this.y + Fragment.heightPanel - Fragment.third_yPanel)

      )
    }

    return (
      x >= this.x + this.current_third_x &&
      x <= (this.x + this.current_width - this.current_third_x) &&
      y >= (this.y + this.current_third_y) &&
      y <= (this.y + this.current_height - this.current_third_y)
    )
  }

  tryMoveBeetwenLists() {
    if (this.onMenuLast == this.onMenu) {
      return;
    }
    this.onMenuLast = this.onMenu;
    if (!this.onMenu) {
      // поставить по умолчанию относительно курсора

      let tmp = this.listElem;
      this.listElem.remove(); // удалиться из прошлого листа
      canvas.field.fragmentList.appendElem(tmp); // добавиться в новый

      this.scale = canvas.field.bigType ? 1 : canvas.field.scale;
      this.smoothResize(
        Fragment.widthPanel, Fragment.heightPanel,
        Fragment.widthScale * this.scale, Fragment.heightScale * this.scale,
        false, true
      );
    } else {
      // поставить в зависимости от главного, в меню
      // относительно курсора

      let tmp = this.listElem;
      this.listElem.remove(); // удалиться из прошлого листа
      canvas.left_menu.fragmentList.appendElem(tmp); // добавиться в новый

      this.smoothResize(
        this.current_width, this.current_height,
        Fragment.widthPanel, Fragment.heightPanel,
        false, true
      );
    }
  }

  /**
   * Добавляет отступ для элементов группы.
   * Необходимо при увеличении или уменьшении (в таком случае отступ отрицательный)
   * фрагмента. Тогда увеличенная группа увеличивается в размерах, правые фрагменты
   * перемещаются вправо, в этом суть
   * В аргументах - бывшие и новые размеры фрагмента для высчитывания отступа
   */
  appendMargin(old_width, old_height, new_width, new_height) {
    let this_fr = this;
    if (this_fr.group == null) {
      return;
    }
    let oneX = this_fr.ind % imagesX;
    let oneY = Math.floor(this_fr.ind / imagesX);

    let twoX = this_fr.group.mainFragment.ind % imagesX;
    let twoY = Math.floor(this_fr.group.mainFragment.ind / imagesX);

    let dx = (oneX - twoX) * (new_width - old_width) / 5 * 3;
    let dy = (oneY - twoY) * (new_height - old_height) / 5 * 3;
    this_fr.smoothShift(dx, dy);
  }

  // Расстояниме от курсора мыши до старта изображения в левом верхнем углу в пикселях.
  // Если это расстояние не учитывать, то изображение при его взятии будет телепортировано
  // Левым верхним углом к положению курсора, а так к тому положению прибавляется разница
  // в координатах, обеспечивая тем самым отсутствие рывков
  rangeToStartImage(x, y) {
    let selected = (this.group != null) ? this.group : this;
    return {
      x: x - this.x,
      y: y - this.y
    };
  }

  moveToPanel() {
    var x = (canvas.panel.x + canvas.panel.buttonWidth + canvas.panel.paddingX +
      (canvas.panel.fragmentSpace + Fragment.widthPanel) * (
        this.bottomPanelInd % canvas.panel.fragmentsCount)) + Fragment.widthPanel / 2 - Fragment.widthScale / 2;
    var y = canvas.panel.y + canvas.panel.paddingY + Fragment.heightPanel / 2 - Fragment.heightScale / 2;
    this.move(x, y);
  }

  /**
   * Функция работает с фрагментами или группами, объединяют их в одну группу
   *
   * @param selected - группа или фрагмент
   *
   * @param other - группа или фрагмент
   *
   * @param animated - анимация будет воспроизведена
   *
   * @param animationDelay - анимация с задержкой
   *
   */
  workGroups(selected, other, animated = false, animationDelay = .0) {
    if (selected.group == null) {
      if (other.group == null) {
        // создание группы
        selected.group = new FragmentGroup();
        other.group = selected.group;
        selected.group.fragments.add(selected);
        selected.group.fragments.add(other);

        let oneX = selected.ind % imagesX;
        let twoX = other.ind % imagesX;
        let oneY = Math.floor(selected.ind / imagesX);
        let twoY = Math.floor(other.ind / imagesX);

        if (oneX < twoX || oneY < twoY) {
          selected.group.mainFragment = selected;
        } else {
          selected.group.mainFragment = other;
          let tmp = other;
          other = selected;
          selected = tmp;
        }

        // console.log(selected.group.mainFragment.src);

        // если другой фрагмент присоединен к углу, то вся группа в итоге будет
        // к нему присоединена
        selected.group.connectedToCorner = other.connectedToCorner; // исправить
        /*
         * Дальнейшие элементы oneX, oneY, twoX, twoY
         * являются координатами данных элементов в цельном изображении.
         * Они сортируются для получения максимальных/минимальных крайних
         * элементов группы.
         */
        if (oneX < twoX) {
          selected.group.leftFragmentInd = oneX;
          selected.group.rightFragmentInd = twoX;
        } else {
          selected.group.leftFragmentInd = twoX;
          selected.group.rightFragmentInd = oneX;
        }
        if (oneY < twoY) {
          selected.group.bottomFragmentInd = oneY;
          selected.group.topFragmentInd = twoY;
        } else {
          selected.group.bottomFragmentInd = twoY;
          selected.group.topFragmentInd = oneY;
        }

        selected.listElem.value = selected.group; // ссылка на фрагмент заменяется на ссылку на группу
        selected.listElem.src = null; // убрать путь до картинки, а то некрасиво
        selected.group.listElem = selected.listElem;
        other.listElem.remove(); // удаление "лишнего" объекта из очереди на запись,
        // т.к. он уже отрисовывается в группе
      } else {
        console.log("!!!!");
        // selected - not group;
        // other - group

        selected.group = other.group;
        selected.group.fragments.add(selected);
        selected.listElem.remove();

        /*
         * Дальнейшие элементы oneX, oneY
         * являются координатами selected фрагмента в цельном изображении.
         * В ходе следующей части кода меняются крайние индексы для группы
         */
        let oneX = selected.ind % imagesX;
        let oneY = Math.floor(selected.ind / imagesX);
        if (oneX > selected.group.rightFragmentInd) {
          selected.group.rightFragmentInd = oneX;
        }
        if (oneX < selected.group.leftFragmentInd) {
          selected.group.leftFragmentInd = oneX;
        }
        if (oneY > selected.group.topFragmentInd) {
          selected.group.topFragmentInd = oneY;
        }
        if (oneY < selected.group.bottomFragmentInd) {
          selected.group.bottomFragmentInd = oneY;
        }


      }
    } else {
      if (other.group == null) {
        console.log("!");
        other.group = selected.group;
        selected.group.fragments.add(other);
        selected.group.connectedToCorner = other.connectedToCorner;
        // если другой фрагмент присоединен к углу, то вся группа в итоге
        // будет присоединена к этому углу

        selected.listElem.value = selected.group; // ссылка на фрагмент заменяется на ссылку на чужую группу
        other.listElem.remove();

        /*
         * Дальнейшие элементы oneX, oneY
         * являются координатами selected фрагмента в цельном изображении.
         * В ходе следующей части кода меняются крайние индексы для группы
         */
        let twoX = other.ind % imagesX;
        let twoY = Math.floor(other.ind / imagesX);
        if (twoX > selected.group.rightFragmentInd) {
          selected.group.rightFragmentInd = twoX;
        }
        if (twoX < selected.group.leftFragmentInd) {
          selected.group.leftFragmentInd = twoX;
        }
        if (twoY > selected.group.topFragmentInd) {
          selected.group.topFragmentInd = twoY;
        }
        if (twoY < selected.group.bottomFragmentInd) {
          selected.group.bottomFragmentInd = twoY;
        }


        if (selected.group.leftFragmentInd < twoX || selected.group.topFragmentInd < twoY) {} else {
          selected.group.mainFragment = other;
          // let tmp = other;
          // other = selected;
          // selected = tmp;
        }

        let b = (other.group.mainFragment.x / other.x + 1) / (2)
        let t = canvas.field.scale * (1 - b) + b;

        if (twoX > selected.group.rightFragmentInd) {
          selected.group.rightFragmentInd = twoX;
        }
        if (twoX < selected.group.leftFragmentInd) {
          selected.group.leftFragmentInd = twoX;
        }
        if (twoY > selected.group.topFragmentInd) {
          selected.group.topFragmentInd = twoY;
        }
        if (twoY < selected.group.bottomFragmentInd) {
          selected.group.bottomFragmentInd = twoY;
        }


      } else {
        // в ходе кода группа selected удаляется
        // остается группа other

        if (other.group.rightFragmentInd < selected.group.rightFragmentInd) {
          other.group.rightFragmentInd = selected.group.rightFragmentInd;
        }
        if (other.group.leftFragmentInd > selected.group.leftFragmentInd) {
          other.group.leftFragmentInd = selected.group.leftFragmentInd;
        }
        if (other.group.topFragmentInd < selected.group.topFragmentInd) {
          other.group.topFragmentInd = selected.group.topFragmentInd;
        }
        if (other.group.bottomFragmentInd > selected.group.bottomFragmentInd) {
          other.group.bottomFragmentInd = selected.group.bottomFragmentInd;
        }

        selected.group.listElem.remove();
        selected.group.changeGroup(other.group); //setMenuD внутри
        // т.к. элементы становятся членами другой группы, то нет необходимости
        // заботиться об connectedToCorner. Он всегда определяется other.
      }
    }
    if (animated && !other.group.connectedToCorner) {
      setTimeout(selected.group.resizeSelect, animationDelay, selected.group, true);
    }

  }

  rightTop() {
    let selected = (this.group != null) ? this.group : this;
    return {
      x: this.x + this.current_width - this.current_third_x,
      y: this.y + this.current_third_y
    }
  }

  leftTop() {
    let selected = (this.group != null) ? this.group : this;
    return {
      x: this.x + this.current_third_x,
      y: this.y + this.current_third_y
    }
  }

  rightBot() {
    return {
      x: this.x + this.current_width - this.current_third_x,
      y: this.y + this.current_height - this.current_third_y
    }
  }

  leftBot() {
    return {
      x: this.x + this.current_third_x,
      y: this.y + this.current_height - this.current_third_y
    }
  }

  canConnectRightFragment() {
    var leftTopOfRightFragment = this.right.leftTop();
    var tmpRes = this.rangeFromRightTop(leftTopOfRightFragment.x, leftTopOfRightFragment.y);

    if (tmpRes <= Fragment.connectRange)
      return {
        res: true,
        range: tmpRes
      };
    return {
      res: false,
        range: tmpRes,
        right:true,

    };
  }

  rangeFromRightTop(x, y) {
    var rT = this.rightTop()
    return Math.sqrt((rT.y - y) * (rT.y - y) +
      (rT.x - x) * (rT.x - x))
  }

  canConnectLeftFragment() {
    var rightTopOfLeftFragment = this.left.rightTop();
    var tmpRes = this.rangeFromLeftTop(rightTopOfLeftFragment.x, rightTopOfLeftFragment.y);
    if (tmpRes <= Fragment.connectRange)
      return {
        res: true,
        range: tmpRes
      };
    return {
      res: false,
        range: tmpRes,
        left:true,
    };
  }

  rangeFromLeftTop(x, y) {
    var lT = this.leftTop();
    return Math.sqrt((lT.y - y) * (lT.y - y) +
      (lT.x - x) * (lT.x - x))
  }

  canConnectBottomFragment() {
    var leftTopOfBottomFragment = this.bottom.leftTop();
    var tmpRes = this.rangeFromLeftBottom(leftTopOfBottomFragment.x, leftTopOfBottomFragment.y);
    if (tmpRes <= Fragment.connectRange)
      return {
        res: true,
        range: tmpRes
      };
    return {
      res: false,
        range: tmpRes,
    };
  }

  rangeFromLeftBottom(x, y) {
    var lB = this.leftBot();
    return Math.sqrt((lB.y - y) * (lB.y - y) +
      (lB.x - x) * (lB.x - x))
  }

  canConnectTopFragment() {
    var leftBotOfTopFragment = this.top.leftBot();
    var tmpRes = this.rangeFromLeftTop(leftBotOfTopFragment.x, leftBotOfTopFragment.y);
    if (tmpRes <= Fragment.connectRange)
      return {
        res: true,
        range: tmpRes
      };
    return {
      res: false,
        range: tmpRes,

    };
  }

  rangeFromRightBottom(x, y) {
    var rB = this.rightBot();
    return Math.sqrt((rB.y - y) * (rB.y - y) +
      (rB.x - x) * (rB.x - x))
  }

  smoothmoveOneOrGroup(fr, x, y, connectingFragment) {
    if (fr.group == null) {
      fr.smoothMove(x, y, connectingFragment);
    } else {
      fr.group.smoothMove(x, y, fr, connectingFragment); // допилим позже
    }
  }

  /**
   * Функция реализует присоединение к чему либо либо информирует о возможности этого события
   *
   *  @param int  newInd - индекс фрагмента, для которого стоит проверить возможность
   *                       присоединения, по умолчанию выбирается индекс фрагмента,
   *                       передвигаемого игроком (SelectFragmentHelper.translatedFragmentId).
   *                       Рассмотрение от других фрагментов нужно при проверке подсоединения
   *                       для нескольких фрагментов от одной группы
   *
   *  @param bool withConnect - выполнить присоединение после подтверждения соответствующей проверки,
   *                            по умолчанию присоединяет один фрагмент к другому
   *                            Проверка необходима при подсоединении группы к фрагментам,
   *                            где сначала узнается вся информация о возможных
   *                            подсоединениях, а потом полученые данные сортируются
   *                            по неубыванию, выполняя подсоединение к самому
   *                            близкому из возможных
   *
   *  @return object {
   *           res
   *           range
   *          }
   *
   */
  connectTo(newInd = null, withConnect = true) {
    var i = null;
    if (newInd == null) {
      i = SelectFragmentHelper.translatedFragmentId
    } else {
      i = newInd;
    }

    if (arr[i].onMenu || (arr[i].group != null && arr[i].group.onMenu)) {
      return;
    }
    let connectArray = [];

    let leftFragment = this.left;
    let rightFragment = this.right;
    let topFragment = this.top;
    let bottomFragment = this.bottom;
    let inner_this = this;
    let x = i % imagesX;
    let y = Math.floor(i / imagesX);

    let selected = (this.group != null) ? this.group : this;


    /**
     *  @param int needX, needY - необходимые конечные координаты пазла
     *                            в изображении, соответствующие заданному углу
     *
     *  @param float range - расстояние до заданного угла
     *
     *  @param int newX, newY - место, куда необходимо перенести пазл при
     *                          выполнении всех условий
     *
     */
    function connectToCorner(needX, needY, range, newX, newY) {
      if (x == needX && y == needY && range <= Fragment.connectRange) {
        connectArray.push({
          range: range,
          x: newX,
          y: newY,
          fr: null
        });
      }
    }
    // let selected = (this.group != null) ? this.group : this;
    connectToCorner(0, 0, this.rangeFromLeftTop(canvas.field.x, canvas.field.y),
      canvas.field.x - this.current_third_x,
      canvas.field.y - this.current_third_y);
    connectToCorner(imagesX - 1, 0, this.rangeFromRightTop(canvas.field.lastX, canvas.field.y),
      canvas.field.lastX + this.current_third_x - this.current_width,
      canvas.field.y - this.current_third_y);
    connectToCorner(imagesX - 1, imagesY - 1, this.rangeFromRightBottom(canvas.field.lastX, canvas.field.lastY),
      canvas.field.lastX + this.current_third_x - this.current_width,
      canvas.field.lastY + this.current_third_y - this.current_height);
    connectToCorner(0, imagesY - 1, this.rangeFromLeftBottom(canvas.field.x, canvas.field.lastY),
      canvas.field.x - this.current_third_x,
      canvas.field.lastY + this.current_third_y - this.current_height);


    /**
     * Предназначено для заполнения массива ConnectArray,
     * заполняет его объектами, хранящими расстояние до фрагмента
     * а так же числа, необходимые добавить к координатам фрагмента
     * для нормального присоединения одного к другому
     *
     *  @param other - фрагмент, к которому идет подсоединение
     *
     *  @param getInfo - объект, показывающий о возможности присоединения
     *                   фрагмента и расстояние до него
     *  @param getCoordinates - объект с координатами одного из углов другого фрагмента
     *
     *  @param newX - число, необходимое добавить к getCoordinates.x для получения
     *                новых координат для текущего фрагмента вдоль оси X
     *  @param newY - число, необходимое добавить к getCoordinates.y для получения
     *                новых координат для текущего фрагмента вдоль оси Y
     *
     */
    function connectToFragment(other, getInfo, getCoordinates, newX, newY) {
        if (
        getInfo.res && (inner_this.group == null || !inner_this.group.fragments.has(other)) &&
        !other.onBottomPanel && ((other.group != null && !other.group.onMenu) || (other.group == null && !other.onMenu))
      ) {
        // работает только на объекты, отсутствующие в группе, панели и меню
        let scale = canvas.field.bigType ? 1 : canvas.field.scale;
        connectArray.push({
          range: getInfo.range,
          x: getCoordinates.x,
          y: getCoordinates.y,
          dX: newX,
          dY: newY,
          fr: other
        })
      }
    }
    if (topFragment != null)
      connectToFragment(topFragment, topFragment.canConnectBottomFragment(),
        topFragment.leftBot(),
        -this.current_third_x, -this.current_third_y);
    if (leftFragment != null)
      connectToFragment(leftFragment, leftFragment.canConnectRightFragment(),
        leftFragment.rightTop(),
        -this.current_third_x, -this.current_third_y);
    if (bottomFragment != null)
      connectToFragment(bottomFragment, bottomFragment.canConnectTopFragment(),
        bottomFragment.leftTop(),
        -this.current_third_x,
        -this.current_height + this.current_third_y);
    if (rightFragment != null)
      connectToFragment(rightFragment, rightFragment.canConnectLeftFragment(),
        rightFragment.leftTop(),
        -this.current_width + this.current_third_x,
        -this.current_third_y);

    connectArray.sort(function(a, b) {
      return a.range - b.range;
    });
    if (connectArray.length > 0) {
      var near = connectArray[0];
      if (withConnect) {
        if (near.fr == null) {
          // идет присоединение к углу, а не к фрагменту
          this.smoothmoveOneOrGroup(this, near.x, near.y);
          if (this.group != null) {
            this.group.connectedToCorner = true;
          } else {
            this.connectedToCorner = true;
          }

        } else {
          // подсоединение к фрагменту
          let near_frg = (near.fr.group == null) ? near.fr : near.fr.group;

          if (!near_frg.smoothing && !near_frg.isConnecting && !near_frg.resizing) {
            this.smoothmoveOneOrGroup(this, near.x + near.dX, near.y + near.dY, near.fr);
            // console.log(near.x + near.dX, near.y + near.dY);
          }
        }
      }

      return {
        res: true,
        range: near.range
      };
    }
    return {
      res: false
    };
  }


  /**
   *  @param int newX - новая координата x
   *
   *  @param int newY - новая координата y
   *
   *  @param Fragment connectingFragment - фрагмент, к которому, возможно,
   *                                       подключается наш фрагмент
   *  @param bool shouldWorkGroups - должно ли сработать присоединение к
   *                                 несмотря на присутствие группы у фрагмента
   *                                 Срабатывает у одного фрагмента из всей
   *                                 группы, нет повторений
   */
 async smoothMove(newX, newY, connectingFragment = null, shouldWorkGroups = false) {
    let near = null;
    let this_frg = (this.group == null) ? this : this.group;
    // группа или одиночный фрагмент, к которому идет подключение
    let this_fr = this; // сам фрагмент
    this_frg.smoothing = true;
    if (connectingFragment != null) {
      near = (connectingFragment.group == null) ? connectingFragment : connectingFragment.group;
      near.isConnecting = true;
    }

    await super.smoothMove(newX, newY, function() {
      // при окончании перемещения требуется проверить, стоит ли объединить
      // фрагменты в единую группу
      if (connectingFragment != null) {
        if (this_fr.group == null || shouldWorkGroups) // для работы один раз,
          // чтобы не выполнялось для каждого
          // элемента в группе
          this_fr.workGroups(this_fr, connectingFragment, true, 0);
        near.isConnecting = false;
      }
      this_frg.smoothing = false;
    });
  }

  smoothShift(dx, dy) {
    let this_frg = (this.group == null) ? this : this.group;
    // группа или одиночный фрагмент, к которому идет подключение
    let this_fr = this; // сам фрагмент
    this_frg.smoothing = true;

    super.smoothShift(dx, dy, function() {
      // при окончании перемещения требуется проверить, стоит ли объединить
      // фрагменты в единую группу
      this_frg.smoothing = false;
    });
  }

  /**
   * Самописная, хотя и есть одноименная функция в суперклассе
   *
   * Вызывается из группы или фрагмента в процессе onmouseup
   * Меняет относительные координаты у фрагментов группы для
   * нормального уменьшения / увеличения изображения при добавлении в группу
   * и изменяет сам размер изображения
   *
   * @param double - 4 длины пазлины, понятные из их названий
   *
   * @param back - стоит ли повторять анимацию задонаперед при истинности
   *
   * @param append_cursor - стоит ли отталкиваться от местоположения курсора
   */
  smoothResize(old_width, old_height, new_width, new_height, back = false, append_cursor = false) {
    let this_frg = (this.group == null) ? this : this.group;
    this_frg.resizing = true;
    let currentTact = 0;
    let dX = (new_width - old_width) / (Component.tact);
    let dY = (new_height - old_height) / (Component.tact);

    var current_width = old_width;
    var current_height = old_height;

    let this_fr = this;

    if (append_cursor) {
      // высчитывает на сколько стоит сместить объект, чтобы он якобы масштабировался
      // относительно курсора
      // работает только для одиначных объектов, т.к. в группе обрабатывается отдельно
      let b_x = SelectFragmentHelper.deltaX * (1 - new_width / old_width);
      let b_y = SelectFragmentHelper.deltaY * (1 - new_height / old_height);
      canvas.smoothShiftDelta(-b_x, -b_y)
      this_fr.smoothShift(b_x, b_y);
    }

    this.appendMargin(old_width, old_height, new_width, new_height);
    // рекурсивная функция вызываемая с задержкой в самой себе
    function resize() {
      current_width += dX;
      current_height += dY;
      this_fr.setSizes(this_fr, current_width, current_height);

      if (currentTact < Component.tact - 1) {
        setTimeout(resize, Component.frameTime);
        currentTact++;
      } else {
        this_fr.setSizes(this_fr, new_width, new_height);
        this_fr.current_third_x = this_fr.current_width / 5;
        this_fr.current_third_y = this_fr.current_height / 5;
        if (back) {
          // повторная анимация, возвращающая всё обратно
          this_fr.smoothResize(new_width, new_height, old_width, old_height, false, append_cursor);
        } else {
          this_frg.resizing = false;
        }
      }
    }

    resize();
  }

  /**
   * Вызывается из группы resizeSelect(this_gr)
   *
   * @param back - bool, стоит ли возвращать анимацию назад
   *
   * @param charact - увеличить или уменьшить (-1, 1)
   *
   * @param scale - double, во сколько раз стоит уменьшить/увеличить изображение
   *
   */
  resizeSelect(back, charact = -1, scale = .95) {
    if (charact == -1) {
      this.smoothResize(
        this.current_width, this.current_height,
        this.current_width * scale, this.current_height * scale,
        back
      );
    } else {
      this.smoothResize(
        this.current_width * scale, this.current_height * scale,
        this.current_width, this.current_height,
        back
      );
    }
  }

  smoothMoveWithCallback(x, y, callback,connectingFragment = null, shouldWorkGroups = false){
      let observer = new Proxy(this, {
          set: (target, p, value) => {
              if (p === "smoothing" && value === false) {
                  let got = callback();
                  console.log(got);
              }
              return true;
          }
      });
      observer.smoothMove(x,y,connectingFragment);
      this.smoothMove(x,y,connectingFragment, shouldWorkGroups);
  }
}

class FragmentList {
  constructor() {
    this.firstVisualObject = null;
    this.lastVisualObject = null;
  }

  appendElem(element) {
    // очистка на случай получения объекта из другого FragmentList
    element.prev = null;
    element.next = null;
    if (this.lastVisualObject == null) {
      // если нет последнего, то нет и первого, ибо инициализация проходит у обоих
      this.lastVisualObject = element;
      this.firstVisualObject = element;
    } else {
      // вставка
      this.lastVisualObject.next = element;
      element.prev = this.lastVisualObject;

      // замена понятия "последнего"
      this.lastVisualObject = element;
    }
    element.list = this;
  }
}

/*
 * Отрисовочный единый элемент.
 * Идея состоит в том, что отрисовываются элементы слоями, но слои у разных
 * групп фрагментов могут быть разными, а при взятии одного из них
 * чередование этих слоёв может измениться.
 *
 * Потому создан двусвязный список FragmentList, в котором объявлены ссылки
 * на начальные, конечные FragmentListElem.
 * Здесь быстро удаляются группы фрагментов в середине списка
 * и быстро добавляются в конец
 *
 * Используется 2 FragmentList, поэтому хранится элемент list
 */

class FragmentListElem {
  constructor(value) {
    this.value = value;
    this.prev = null;
    this.next = null;
    this.value.listElem = this;
    this.list = null; // заполняется из FragmentList.appendElem(element)
  }

  remove() {
    let text = this.value.onMenu ? "menu" : "field";
    // console.log("Удаляем элемент", text, this.list);

    if (this.prev != null) {
      if (this.next != null) {
        // середина
        this.prev.next = this.next;
        this.next.prev = this.prev;
      } else if (this.next == null) {
        // конец
        this.list.lastVisualObject = this.prev;
        this.prev.next = null;
      }
    } else {
      // начало
      if (this.next != null) {
        this.list.firstVisualObject = this.next;
        this.next.prev = null;
      } else {
        // единственный элемент в списке
        this.list.firstVisualObject = null;
        this.list.lastVisualObject = null;
      }
    }
  }

  replaceToTop() {
    if (this.list.lastVisualObject === this) {
      return;
    }

    this.remove();
    if (this.list.lastVisualObject !== this) {
      this.list.lastVisualObject.next = this;
      this.prev = this.list.lastVisualObject;
      this.next = null;
      this.list.lastVisualObject = this;
    }

  }
}

class Broadcaster {
    constructor(room){
        this.room = room;
    }
    broadcast(broadcastEvent, data){
        setTimeout(()=>{
            let channel = Echo.private('room.'+this.room.uid);
            channel.whisper(broadcastEvent, data);
        },100);
    }
}

class PuzzleWorker {

    constructor(canvas) {
        this.tasks = [];
        this.canvas = canvas;
        this.fragment = null;
    }

    push(task) {
        this.tasks.push(task);
    }

    async execute(arr) {
        if (this.tasks.length !== 0) {
            let task = this.tasks[this.tasks.length - 1];
            let selectedFragment = arr[task.ind];

            if (!task.onBottomPanel && selectedFragment.onBottomPanel) {
                selectedFragment.onBottomPanel = false;
                selectedFragment.moveToPanel();
            }

            if (!task.group) {
                await selectedFragment.smoothMove(task.x, task.y);
                if(task.shouldConnect){
                    selectedFragment.connectTo(selectedFragment.ind);
                }

            } else {
                await selectedFragment.group.smoothMove(task.x, task.y, selectedFragment);
                if(task.shouldConnect){
                    selectedFragment.group.connectTo(selectedFragment.ind);
                }
            }

            this.tasks.pop();
            this.execute(arr);
        }
    }

    error(error) {
        console.log("The error in worker: " + error);
    }
}

//инициализация подключения и слушателя действий оппонента
async function initializeSockets(puzzleworker){
    let uid = $(location).attr('href').split('/').pop();
    let token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    let response = await axios.get('/puzzle/info/room/'+uid+'?_token='+token);
    let room = response.data;
    let channel = Echo.private('room.' + room.uid);
    channel.listen('.client-move', (response) => {
        console.log("received" ,response);
        puzzleworker.push(response);
        puzzleworker.execute(arr); // arr - массив пазлов
    });
    return room;
}

//создаем по передаваемому фрагменту задание для воркера оппонента
function formExecutableTask(fragment, shouldConnectOnOtherSide) {
    return  {
        ind:fragment.ind,
        x:fragment.x,
        y:fragment.y,
        group:!!fragment.group,
        shouldConnect:shouldConnectOnOtherSide,
        onBottomPanel:fragment.onBottomPanel,
        onMenu:!!fragment.group ? fragment.group.onMenu : fragment.onMenu,
    };
}

/*
  Главный файл, управляющий работой канваса
  Здесь установлены слушатели, а так же глобальные функции отрисовки,
  скачивания изображений, работы с различными классами и типами данных и
  инициализация размеров всех компонентов канваса.

*/
function drawAll(canvas, context) {
    context.lineWidth = "1";

    context.clearRect(
        0, 0,
        canvas.canvas.width,
        canvas.canvas.height
    );
    context.beginPath();
    context.rect(
        0, 0,
        canvas.canvas.width,
        canvas.canvas.height
    );
    context.fillStyle = "#373737";
    context.fill();
    canvas.draw(context);
    canvas.panel.drawFragments(context);
    if (arr[SelectFragmentHelper.translatedFragmentId])
        // рисование выбранного фрагмента поверх всего, рисует повторно
        if (SelectFragmentHelper.translatedFragmentId >= 0) {
            let el = arr[SelectFragmentHelper.translatedFragmentId]
            let selected = (el.group != null) ? el.group : el;
            selected.draw(context);
        }

}

function initializeFragmentList(arr) {
    for (let i = 0; i < countImages; i++) {
        var x = i % imagesX;
        var y = Math.floor(i / imagesX);

        var leftId = i % imagesX - 1;
        var topId = i - imagesX;

        arr.push(
            new Fragment(
                i,
                DIRECTORY + "puzzle/" + (i + 1) + '.png',
                DIRECTORY + "puzzle/" + (i + 1) + '_.png',
                100, 100,
                (leftId >= 0 ? arr[i - 1] : null), (topId >= 0 ? arr[topId] : null),
                i
            )
        );

        canvas.panel.fragments[i] = i; // для заполнения порядка индексов
        // фрагментов у нижней панели

        // инициализация двусвязного списка фрагментов
        canvas.field.fragmentList.appendElem(new FragmentListElem(
            arr[arr.length - 1]
        ));
    }
}

function initializeSizes(fragment, img) {

    canvas.field.all_width = canvas.canvas.width * FIELD_WIDTH;
    canvas.field.all_height = canvas.canvas.height * FIELD_HEIGHT;

    fragment.init(img);

    canvas.field.init();
    canvas.panel.init();
    canvas.left_menu.init();

    // canvas.createBlankZones();

    for (let i = 0; i < countImages; i++) {
        // изначально уменьшены, т.к. окно тоже изначально уменьшено
        arr[i].current_width = Fragment.widthScale * canvas.field.scale;
        arr[i].current_height = Fragment.heightScale * canvas.field.scale;

        // устанавливает треть объекта в зависимости
        arr[i].current_third_x = arr[i].current_width / 5;
        arr[i].current_third_y = arr[i].current_height / 5;
    }
}

window.onload = async function () {

    console.log("Started");
    canvas = new Canvas("canvas-puzzle", countImages);
    canvas.initElements();

    let puzzleWorker = new PuzzleWorker(canvas);
    let room = await initializeSockets(puzzleWorker);
    let broadcaster = new Broadcaster(room);

    initializeFragmentList(arr);

    canvas.canvas.onmousedown = function (e) {
        var loc = canvas.getCoords(e.clientX, e.clientY);
        shouldConnect = true;
        if (canvas.panel.onmousedown(loc)) {
            console.log("!");
            return;
        }

        let iterFunction = function (lastSeenObject) {
            var value = lastSeenObject.value;
            var objInCoords = value.isHadPoint(loc.x, loc.y); // у группы или фрагмента
            if (objInCoords) {
                if (!value.smoothing && !value.isConnecting && !value.resizing) {
                    /*
                     * объект под мышкой, не выполняет анимацию и не подсоединяет к себе чужой объект одновременно
                     * если рассматривается группа фрагментов (FragmentGroup), то:
                     *  -- расчитывает расстояние от mainFragment группы, а потому
                     *  -- delta значения могут быть очень большими или даже отрицательными
                     *  -- взятым фрагментом в этом случае считается mainFragment группы
                     *
                     */

                    // не имеет смысла для групп, undefined для них, не выполняется
                    if (value.onBottomPanel) {
                        value.onBottomPanel = false;
                        value.moveToPanel();
                    }
                    value.connectedToCorner = false;
                    let ranges = value.mainFragment.rangeToStartImage(loc.x, loc.y);
                    SelectFragmentHelper.deltaX = ranges.x;
                    SelectFragmentHelper.deltaY = ranges.y;
                    SelectFragmentHelper.translatedFragmentId = value.mainFragment.ind;
                    lastSeenObject.replaceToTop(); // отображать поверх других объектов
                    return true; // если сработал объект - вернуть истину, обрабатывается далее
                }
            }
        }

        lastSeenObject = canvas.left_menu.fragmentList.lastVisualObject;
        if (lastSeenObject != null)
            do {
                // если этот объект подходит под условия, то цикл останавливается
                if (iterFunction(lastSeenObject))
                    break;
                lastSeenObject = lastSeenObject.prev;
            } while (lastSeenObject != null)

        // Если жмякаем по меню, то фрагменты далее не будут обрабатываться
        // т.е. из-под меню их не достать, собственно без проверки они достаются
        if (canvas.left_menu.isHadPoint(loc.x, loc.y))
            return;

        var lastSeenObject = canvas.field.fragmentList.lastVisualObject;
        if (lastSeenObject != null)
            do {
                // если этот объект подходит под условия, то цикл останавливается
                if (iterFunction(lastSeenObject))
                    break;
                lastSeenObject = lastSeenObject.prev;
            } while (lastSeenObject != null)

        // TODO выход из функции при выполнении верхнего блока
    }

    canvas.canvas.onmousemove = function (e) {
        var loc = canvas.getCoords(e.clientX, e.clientY);
        if (SelectFragmentHelper.translatedFragmentId >= 0) {
            var newX = loc.x - SelectFragmentHelper.deltaX;
            var newY = loc.y - SelectFragmentHelper.deltaY;
            if (arr[SelectFragmentHelper.translatedFragmentId].group == null) {
                arr[SelectFragmentHelper.translatedFragmentId].move(newX, newY);
            } else if (arr[SelectFragmentHelper.translatedFragmentId].group != null) {
                arr[SelectFragmentHelper.translatedFragmentId].group.move(
                    newX, newY,
                    arr[SelectFragmentHelper.translatedFragmentId]
                );
            }
        }

        canvas.panel.onmousemove(loc.x, loc.y);
        canvas.left_menu.onmousemove(loc.x, loc.y);
    };

    canvas.canvas.onmouseup = function (e) {
        var loc = canvas.getCoords(e.clientX, e.clientY);

        canvas.left_menu.onmousemove(loc.x, loc.y);
        // проверка, если мы не двигали элемент, но под ним что-то изменилось
        // например, ушло меню в сторону или, наоборот, появилось

        if (SelectFragmentHelper.translatedFragmentId >= 0) {

            let wasOnMenu = ((arr[SelectFragmentHelper.translatedFragmentId].group != null) ?
                    arr[SelectFragmentHelper.translatedFragmentId].group :
                    arr[SelectFragmentHelper.translatedFragmentId]
            ).onMenu; // если спустилось с меню, запретить коннект
            canvas.checkMoveBetweenLists() // проверка на вхождение в зону меню + изменение состояния объектов
            var selectedFragment = arr[SelectFragmentHelper.translatedFragmentId];
            if (selectedFragment.group != null) {
                selectedFragment.group.tryMoveBeetwenLists(selectedFragment);
            } else {
                selectedFragment.tryMoveBeetwenLists();
            }
            console.log(`send coords ${arr[SelectFragmentHelper.translatedFragmentId].x} ${arr[SelectFragmentHelper.translatedFragmentId].y}`);

            let shouldConnectOnOtherSide = {res: false};
            if (selectedFragment.group == null && canvas.panel.isHadPoint(loc.x, loc.y)) {
                selectedFragment.onBottomPanel = true;
            } else if (shouldConnect) {
                let selected = (selectedFragment.group != null) ? selectedFragment.group : selectedFragment;
                if (!wasOnMenu)
                    shouldConnectOnOtherSide = selected.connectTo(); // проверка и дальнейшая попытка
            }
            broadcaster.broadcast('move', formExecutableTask(selectedFragment, shouldConnectOnOtherSide.res)); //formTask->sockets.js

            SelectFragmentHelper.translatedFragmentId = -1;
        }
    }

    canvas.canvas.onmousewheel = function (e) {
        // return;
        canvas.left_menu.onmousewheel(e.wheelDelta);
    }

    // document.addEventListener('mousedown', function(event) {
    //   if (lastDownTarget != event.target) {
    //     showSilhouette = false;
    //   }
    //   lastDownTarget = event.target;
    // }, false);

    document.addEventListener('keydown', function (event) {
        if (event.keyCode == KEY_shouldConnect) {
            if (shouldConnect)
                shouldConnect = false;
            else shouldConnect = true;
            console.log("shouldConnect is", shouldConnect);
        }
        if (event.keyCode == KEY_showSilhouette) {
            showSilhouette = true;
        }
        if (event.keyCode == 9) {
            canvas.left_menu.toogleMenu();
        }
        if (event.keyCode == 49) {
            canvas.field.normalDecrease();
            canvas.panel.show();
        }
        if (event.keyCode == 50) {
            canvas.field.normalIncrease();
            canvas.panel.hide();
        }
        if (event.keyCode == 51) {
            console.log(canvas.field.fragmentList.lastVisualObject.value.listElem);
        }
        if (event.keyCode == 52) {
            let gr = canvas.field.fragmentList.lastVisualObject.value;
            let fr = gr.mainFragment;
            // gr.smoothResize(
            //   fr.current_width, fr.current_height,
            //   Fragment.widthPanel, Fragment.heightPanel,
            //   false, true
            // );
            gr.smoothResize(
                fr.current_width, fr.current_height,
                fr.current_width * 0.8, fr.current_height * 0.8,
                false, true
            );
        }
    }, false);

    document.addEventListener('keyup', function (event) {
        if (event.keyCode == KEY_showSilhouette) {
            showSilhouette = false;
        }
    }, false);

    // Анимация с определённой частотой для обновления экрана
    setInterval(update, 1000 / FRAMES);
}

// Обновление экрана
function update() {
    drawAll(canvas, canvas.context);
}
