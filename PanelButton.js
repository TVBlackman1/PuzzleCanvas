class PanelButton {
  constructor(inc, pos) {
    this.inc = inc;
    this.getPos = pos // функция для получения, т.к. соответствующие переменные объявлены позже
  }

  isHadPoint(x, y) {
    return (
      x >= this.getPos() &&
      x <= this.getPos() + BottomPanel.buttonWidth &&
      y >= BottomPanel.firstY &&
      y <= BottomPanel.firstY + BottomPanel.height
    )
  }

  draw() {
    context.beginPath();
    context.rect(
      this.getPos(),
      BottomPanel.firstY,
      BottomPanel.buttonWidth,
      BottomPanel.height
    );
    context.strokeStyle = "blue";
    context.stroke();
  }

  func() {
    BottomPanel.list += this.inc
    if(BottomPanel.list == 0) BottomPanel.list = 1;
    if(BottomPanel.list == BottomPanel.lists + 1) BottomPanel.list = BottomPanel.lists;
  }
}
