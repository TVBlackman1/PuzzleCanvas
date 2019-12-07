// init in Fragment.js

class Menu extends Component{
  constructor(type, cnv) {
    super();
    this.borderColor = "red";
    // при создании ставятся значения по умолчанию. Следует создать пост-конструктор

    // type = 1 или type = -1 для левого/правого меню
    this.type = type;


  }

  init() {
    this.center = canvas.canvas.width / 2;
    this.height = canvas.field.height * .8;
    this.firstY = canvas.field.firstY + canvas.field.height * .1;
    this.lastY = canvas.field.firstY + canvas.field.height * .9;

    this.width = 400;
    if (this.type == 1) {
      this.firstX = this.center + (canvas.field.width / 2) + 20;
      this.lastX = this.firstX + this.width;

    } else if (this.type == -1) {
      this.lastX = this.center - (canvas.field.width / 2) - 20;
      this.firstX = this.lastX - this.width;
    }
  }
}
