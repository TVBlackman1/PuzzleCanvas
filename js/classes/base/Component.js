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
  smoothMove(newX, newY, endFunction = function() {}) {
    let oldX = this.x;
    let oldY = this.y;
    let currentTact = 0;
    let dX = (newX - oldX) / (Component.tact);
    let dY = (newY - oldY) / (Component.tact);
    let component = this;

    // рекурсивная функция вызываемая с задержкой в самой себе
    function reDraw() {
      component.move(
        component.x + dX,
        component.y + dY
      );

      if (currentTact < Component.tact - 1) {
        setTimeout(reDraw, Component.frameTime);
        currentTact++;
      } else {
        component.move(newX, newY);
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
