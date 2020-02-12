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
