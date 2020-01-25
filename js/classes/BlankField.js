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
