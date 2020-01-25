class Timer extends Component {
  static width = 120;
  static height = 40;

  constructor() {
    super();
  }

  init(x, y) {
    this.firstX = x;
    this.firstY = y;
    this.width = Timer.width;
    this.height = Timer.height;
    this.lastX = this.firstX + this.width;
    this.lastY = this.firstY + this.height;
  }
}
