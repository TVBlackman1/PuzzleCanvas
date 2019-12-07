// init in Fragment.js


class Panel extends Component {
  constructor(imagesCount, cnv) {
    super();
    this.borderColor = "blue";

    this.width = 900;
    this.height = 120;

    this.firstX = 200;
    this.lastX = 900;

    this.firstY = null;
    this.lastY = null;

    this.paddingX = 0;
    this.paddingY = 0;
    this.mainWidth = null; // длина без учета кнопок
    this.fragmentsCount = null; // фрагментов в 1 листе
    this.fragmentSpace = null; // расстояние между фрагментами
    this.lists = null; // количество листов
    this.list = 1; // текущий лист
    this.buttonWidth = 90;

    var th = this;
    this.leftButton = new PanelButton(-1, function() {
      return th.firstX
    });
    this.rightButton = new PanelButton(1, function() {
      return th.lastX - th.buttonWidth
    });

    this.buttons = [this.leftButton, this.rightButton]
    this.fragments = []; // id нужных фрагментов, может быть заданно в случайном порядке (теоретически)
    this.fragments.length = imagesCount;

    cnv.panel = this;
  }

  init() {
    this.width = canvas.field.width * 1.6; // ШИРИНА ПАНЕЛИ
    this.firstX = canvas.canvas.width / 2 - this.width / 2; // МЕСТОПОЛОЖЕНИЕ ПАНЕЛИ
    this.firstY = canvas.field.lastY + 15; // МЕСТОПОЛОЖЕНИЕ ПАНЕЛИ
    this.lastX = this.firstX + this.width;
    this.lastY = this.firstY + this.height;
    this.mainWidth = this.width - 2 * this.buttonWidth - 2 * this.paddingX;

    FragmentsGeneralCharacteristic.heightPanel = this.height - 2 * this.paddingY;
    FragmentsGeneralCharacteristic.widthPanel = FragmentsGeneralCharacteristic.heightPanel / FragmentsGeneralCharacteristic.height * FragmentsGeneralCharacteristic.width;
    this.fragmentsCount = Math.floor(this.mainWidth / FragmentsGeneralCharacteristic.widthPanel);
    this.fragmentSpace = (this.mainWidth - this.fragmentsCount * FragmentsGeneralCharacteristic.widthPanel) / (this.fragmentsCount - 1);

    this.lists = Math.floor(countImages / this.fragmentsCount) + 1;
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

  draw(context) {
    super.draw(context);

    for (var i = 0; i < this.buttons.length; i++) {
      this.buttons[i].draw(context);
    }

    var start = this.fragmentsCount * (this.list - 1);
    var end = this.fragmentsCount * this.list;
    if(this.list == this.lists) {
      end = start + this.fragments.length % this.fragmentsCount;
    }
    for(var i = start; i < end; i++) {
      var fr = arr[this.fragments[i]];
      context.drawImage(
      fr.img,
        this.firstX + this.buttonWidth + this.paddingX + (this.fragmentSpace + FragmentsGeneralCharacteristic.widthPanel) * (
          i % this.fragmentsCount),
        this.firstY + this.paddingY,
        FragmentsGeneralCharacteristic.widthPanel,
        FragmentsGeneralCharacteristic.heightPanel
      );

      if (!fr.onBottomPanel) {
        // изобразить маску, если объект не на панели
        context.beginPath();
        context.fillStyle = "rgba(255,255,255,0.5)";
        context.rect(
          this.firstX + this.buttonWidth + this.paddingX + (this.fragmentSpace + FragmentsGeneralCharacteristic.widthPanel) * (
            i % this.fragmentsCount),
          this.firstY + this.paddingY,
          FragmentsGeneralCharacteristic.widthPanel,
          FragmentsGeneralCharacteristic.heightPanel
        );
        context.fill();
      }
    }
  }
}
