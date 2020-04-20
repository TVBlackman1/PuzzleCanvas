// init in script.js

class Canvas {
  constructor(id, countImages) {
    console.log("Canvas created");
    this.canvas = document.getElementById(id);
    this.context = this.canvas.getContext('2d');

    // отключение сглаживания, хз нужно ли, но любое смазывание я хочу убрать
    // суть в том, что мелкое изображение пазла на нижней панели изначально
    // смазано, а после, при его взятии (и увеличении изображения соответственно)
    // но перестает быть смазанным и начинает быть супер резким. Такая смена
    // отображения должна быть пресечена
    this.context.mozImageSmoothingEnabled = false;
    this.context.webkitImageSmoothingEnabled = false;
    this.context.msImageSmoothingEnabled = false;

    this.context.imageSmoothingEnabled = false; // то же самое, но основное

    this.panel = null;
    this.left_menu = null;
    this.field = null;

    this.fr_zones = [];
    this.fr_zones.length = 3;

    this.blank_zones = [];

  }

  initElements() {
    this.field = new Field();
    this.panel = new Panel(countImages, this);
    this.left_menu = new Menu(this);

    this.fr_zones[0] = this.field;
    this.fr_zones[1] = this.left_menu;
    this.fr_zones[2] = this.panel;
  }

  getCoords(x, y) {
    var bbox = this.canvas.getBoundingClientRect();
    return {
      x: (x - bbox.left) * (this.canvas.width / bbox.width),
      y: (y - bbox.top) * (this.canvas.height / bbox.height)
    };
  }

  isInZones(x, y) {
    var zones = this.fr_zones;
    for (var i = 0; i < zones.length; i++) {
      if (zones[i].isHadPoint(x, y)) {
        console.log("!");
        return true;
      }
    }
    return false;
  }

  // переносить объект между меню и общим полем
  checkMoveBetweenLists() {
    if (this.left_menu.smoothing) {
      Menu.removeFromMenu();
      return;
    }
    if (this.left_menu.isPlace) {
      Menu.includeInMenu();
    } else {
      Menu.removeFromMenu();
    }
  }

  smoothShiftDelta(dx, dy) {
    let oldX = this.x;
    let oldY = this.y;
    let currentTact = 0;
    let dX = dx / (Component.tact);
    let dY = dy / (Component.tact);
    let component = this;
    // рекурсивная функция вызываемая с задержкой в самой себе
    function reDraw() {
      SelectFragmentHelper.deltaX += dX;
      SelectFragmentHelper.deltaY += dY;

      if (currentTact < Component.tact - 1) {
        setTimeout(reDraw, Component.frameTime);
        currentTact++;
      } else {
        SelectFragmentHelper.deltaX -= dX * (Component.tact);
        SelectFragmentHelper.deltaY -= dY * (Component.tact);

        SelectFragmentHelper.deltaX += dx;
        SelectFragmentHelper.deltaY += dy;
      }
    }
    reDraw();
  }

  draw(context) {
    this.field.draw(context);
    this.left_menu.draw(context);
    this.panel.draw(context);
  }
}
