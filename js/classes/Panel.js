// init in Fragment.js


class Panel extends Component {
  constructor(imagesCount, cnv) {
    super();
    // this.borderColor = "blue";

    this.width = 900;
    this.height = 85;
    this.current_height = this.height;

    this.x = 200;
    this.stationar_x = this.x;
    this.lastX = 900;

    this.y = null;
    this.lastY = null;

    this.paddingX = 0;
    this.paddingY = 0;
    this.mainWidth = null; // длина без учета кнопок
    this.fragmentsCount = null; // фрагментов в 1 листе
    this.fragmentSpace = null; // расстояние между фрагментами
    this.lists = null; // количество листов
    this.list = 1; // текущий лист
    this.buttonWidth = 80;
    this.marginTop = 5;

    this.place = new PanelPlace();
    this.place.height = this.height;

    var th = this;
    this.leftButton = new PanelButton(-1, function() {
      return th.x;
    });
    this.rightButton = new PanelButton(1, function() {
      return th.lastX - th.buttonWidth;
    });

    this.buttons = [this.leftButton, this.rightButton]
    this.fragments = []; // id нужных фрагментов, может быть заданно в случайном порядке (теоретически)
    this.fragments.length = imagesCount;

    cnv.panel = this;
  }

  init() {
    this.width = Math.floor(canvas.field.width * 1.64); // ШИРИНА ПАНЕЛИ
    this.current_width = this.width;

    this.place.width = this.width;

    this.x = Math.floor(canvas.canvas.width / 2 - this.width / 2); // МЕСТОПОЛОЖЕНИЕ ПАНЕЛИ
    this.stationar_x = this.x;
    this.place.x = this.x;

    this.y = canvas.field.lastY + this.marginTop; // МЕСТОПОЛОЖЕНИЕ ПАНЕЛИ
    this.stationar_y = this.y;

    this.place.y = this.y;

    this.lastX = this.x + this.width;
    this.lastY = this.y + this.height;
    this.mainWidth = Math.floor(this.width - 2 * this.buttonWidth - 2 * this.paddingX);

    Fragment.heightPanel = Math.floor(this.height - 2 * this.paddingY);
    Fragment.widthPanel = Math.floor(Fragment.heightPanel / Fragment.height * Fragment.width);

    Fragment.third_xPanel = Math.floor(Fragment.widthPanel / 5);
    Fragment.third_yPanel = Math.floor(Fragment.heightPanel / 5);
    this.fragmentsCount = Math.floor(this.mainWidth / Fragment.widthPanel);
    this.fragmentSpace = Math.floor(
      (this.mainWidth - this.fragmentsCount * Fragment.widthPanel) /
      (this.fragmentsCount - 1)
    );

    this.lists = Math.floor(countImages / this.fragmentsCount) + 1;
  }

  hide() {
    this.smoothing = true;
    this.smoothMove(this.x, this.y + 100, function() {
      this.smoothing = false;;
    });
  }

  show() {
    this.smoothing = true;
    this.smoothMove(this.x, this.stationar_y, function() {
      this.smoothing = false;;
    });
  }

  onmousedown(loc) {
    for (var i = 0; i < this.buttons.length; i++) {
      if (this.buttons[i].isHadPoint(loc.x, loc.y)) {
        console.log("Button pressed");
        this.buttons[i].func();
        return true;
      }
    }
    return false;
  }

  onmousemove(x, y) {
    // if (!this.place.isHadPoint(x, y)) {
    //   this.height = this.place.height / 2;
    // } else {
    //   this.height = this.place.height;
    // }
  }

  draw(context) {
    super.draw(context);
    for (var i = 0; i < this.buttons.length; i++) {
      this.buttons[i].draw(context);
    }
  }

  drawFragments(context) {
    var start = this.fragmentsCount * (this.list - 1);
    var end = this.fragmentsCount * this.list;
    if (this.list == this.lists) {
      //  в случае, если на последнем листе неполное количество фрагментов
      // как правило это именно так
      end = start + this.fragments.length % this.fragmentsCount;
    }
    for (var i = start; i < end; i++) {
      var fr = arr[this.fragments[i]];
      context.drawImage(
        fr.img,
        this.x + this.buttonWidth + this.paddingX + (this.fragmentSpace + Fragment.widthPanel) * (
          i % this.fragmentsCount),
        this.y + this.paddingY,
        Fragment.widthPanel,
        Fragment.heightPanel
      );

      if (!fr.onBottomPanel) {
        // изобразить маску, если объект не на панели
        context.beginPath();
        context.fillStyle = "#f0f0f099";
        context.rect(
          this.x + this.buttonWidth + this.paddingX + (this.fragmentSpace + Fragment.widthPanel) * (
            i % this.fragmentsCount),
          this.y + this.paddingY,
          Fragment.widthPanel,
          Fragment.heightPanel
        );
        context.fill();
      } else {
        // если объект на панели, то нарисовать обводку вокруг него
        context.drawImage(
          fr.imgB,
          this.x + this.buttonWidth + this.paddingX + (this.fragmentSpace + Fragment.widthPanel) * (
            i % this.fragmentsCount),
          this.y + this.paddingY,
          Fragment.widthPanel,
          Fragment.heightPanel
        );
      }
    }
  }
}
