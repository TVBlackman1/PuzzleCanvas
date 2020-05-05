// init in Fragment.js


class Panel extends Component {
  constructor(imagesCount, cnv) {
    super();
    // this.borderColor = "blue";

    this.width = 1400;
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
    this.marginBottom = 5;

    this.place = new PanelPlace();
    this.place.height = this.height;
    this.mark = new Component(); // мелкая пипка сверху
    this.shown = true; // показано или скрыто меню

    var th = this;
    this.leftButton = new PanelButton(-1, function() {
      return th.x;
    });
    this.rightButton = new PanelButton(1, function() {
      return th.lastX - th.buttonWidth;
    });

    this.buttons = [this.leftButton, this.rightButton];
    this.fragments = []; // id нужных фрагментов, может быть заданно в случайном порядке (теоретически)
    this.fragments.length = imagesCount;

    cnv.panel = this;
    this.wasHiden = false; // уже было когда-то скрыто, теперь можно скрывать и открывать по алгоритму
  }

  init() {
    // this.width = Math.floor(canvas.field.width * 1.64); // ШИРИНА ПАНЕЛИ
    this.current_width = this.width;

    this.x = Math.floor(canvas.canvas.width / 2 - this.width / 2); // МЕСТОПОЛОЖЕНИЕ ПАНЕЛИ
    this.stationar_x = this.x;

    this.lastY = canvas.canvas.height - this.marginBottom; // МЕСТОПОЛОЖЕНИЕ ПАНЕЛИ

    this.lastX = this.x + this.width;

    this.y = this.lastY - this.height;
    this.stationar_y = this.y;

    this.mainWidth = Math.floor(this.width - 2 * this.buttonWidth - 2 * this.paddingX);

    this.place.width = this.width;
    this.place.current_width = this.current_width;
    this.place.current_height = this.current_height * 0.9;

    this.place.x = this.x;
    this.place.y = this.y + this.place.current_height / 10;
    this.place.lastY = canvas.canvas.height;
    this.place.current_height = this.place.lastY - this.place.y;


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

    this.markInit();
  }

  markInit() {
    this.mark.height = 12;
    this.mark.current_height = this.mark.height;

    this.mark.width = 100;
    this.mark.current_width = this.mark.width;

    this.mark.x = Math.floor(canvas.canvas.width / 2 - this.mark.width / 2);
    this.mark.lastY = this.y;
    this.mark.y = this.mark.lastY - this.mark.current_height;
    this.mark.stationar_y = this.mark.y;
  }

  hide() {
    if (!this.shown || this.smoothing)
      return;
    this.smoothing = true;
    let panel = this;
    this.mark.smoothMove(this.mark.x, this.mark.y + 90).then(r=>{});
    this.shown = false;
    this.smoothMove(this.x, this.y + 90).then(()=>{
          this.smoothing = false;
      });
  }

  show() {
    if (this.shown || this.smoothing)
      return;
    this.smoothing = true;
    let panel = this;

    this.mark.smoothMove(this.mark.x, this.mark.stationar_y).then(r => {});
    this.shown = true;
    this.smoothMove(this.x, this.stationar_y).then(()=>{
        this.smoothing = false;
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
    if (this.place.isHadPoint(x, y)) {
      let ind = SelectFragmentHelper.translatedFragmentId;
      if (ind == -1 || arr[ind].group == null) {
        this.wasHiden = true;
        canvas.field.normalDecrease();
        canvas.panel.show();
      }
    } else {
      if (this.wasHiden) {
          canvas.field.normalIncrease();
          canvas.panel.hide();
      }
    }
  }

  draw(context) {
    super.draw(context);
    // this.place.draw(context);
    this.mark.draw(context);
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
        context.fillStyle = this.fillColor + "99"; // прозрачность
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
