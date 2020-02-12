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
