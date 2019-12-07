class Component {
  constructor() {
    this.borderColor;
  }

  isHadPoint(x, y) {
    return (
      x >= this.firstX && x <= this.firstX + this.width &&
      y >= this.firstY && y <= this.firstY + this.height
    )
  }

  draw(context) {
    context.beginPath();
    context.rect(
      this.firstX,
      this.firstY,
      this.width,
      this.height
    );
    context.strokeStyle = this.borderColor;
    context.stroke();
  }
}
