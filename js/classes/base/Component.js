class Component {
  constructor() {
    this.borderColor = "#4e4e4e";
    this.fillColor = "#f0f0f0"

    this.width = null;
    this.height = null;

    this.firstX = null;
    this.lastX = null;

    this.firstY = null;
    this.lastY = null;
  }

  isHadPoint(x, y) {
    return (
      x >= this.firstX && x <= this.firstX + this.width
      &&
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
    context.fillStyle = this.fillColor;
    context.fill();
  }
}
