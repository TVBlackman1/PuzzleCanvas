class Panel {
  constructor() {

  }

  isHadPoint(x, y) {
    return (
      x >= BottomPanel.firstX && x <= BottomPanel.firstX + BottomPanel.width &&
      y >= BottomPanel.firstY && y <= BottomPanel.firstY + BottomPanel.height
    )
  }
}
