class BlankField extends Component{
  constructor(x, y, width, height) {
    super();
    this.firstX = x;
    this.firstY = y;
    this.width = width;
    this.height = height;
    this.borderColor = "rgba(155,155,200)";
    this.fillColor = "rgba(155,155,200)";
    // "rgba(155,155,200,0.7)";

  }

  draw(context) {
    super.draw(context);
    context.fillStyle = this.fillColor;
    context.fill();
  }
}
