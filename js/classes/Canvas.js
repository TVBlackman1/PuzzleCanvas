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

  // sortZonesByFirstX() {
  //   this.fr_zones.sort((a, b) => (a.x > b.x) ? 1 : ((b.x > a.x) ? -1 : 0));
  // }

  // getBlankZones(start, top, bottom, type = null) {
  //
  //   // переписать потом на бинарный поиск
  //   var ind = -1;
  //   var last = -1;
  //   for (var i = 0; i < this.fr_zones.length; i++) {
  //     if (
  //       top < this.fr_zones[i].y && this.fr_zones[i].y < bottom ||
  //       top < this.fr_zones[i].lastY && this.fr_zones[i].lastY < bottom ||
  //       this.fr_zones[i].y < top && top < this.fr_zones[i].lastY ||
  //       this.fr_zones[i].y < bottom && bottom < this.fr_zones[i].lastY
  //     ) {
  //       if (this.fr_zones[i].x > start) {
  //         ind = i;
  //         last = this.fr_zones[ind].x;
  //         break;
  //       }
  //     }
  //   }
  //   if (ind == -1) { // дойти до края карты, если нет элемента
  //     last = this.canvas.width;
  //   }
  //   if (bottom > top) {
  //     // создать новый пустой прямоугольник
  //     this.blank_zones.push(new BlankField(
  //       start - 1, top - 1,
  //       last - start + 2, bottom - top + 2));
  //   }
  //
  //   if (ind != -1) { // продолжить, если ещё есть элемент справа
  //     this.getBlankZones(this.fr_zones[ind].x + 1, top, this.fr_zones[ind].y - 1); // верх
  //     this.getBlankZones(this.fr_zones[ind].lastX + 1, this.fr_zones[ind].y, this.fr_zones[ind].lastY); // бок
  //     this.getBlankZones(this.fr_zones[ind].x + 1, this.fr_zones[ind].lastY + 1, bottom - 1); // низ
  //   }
  // }
  //
  // createBlankZones() {
  //   this.sortZonesByFirstX();
  //   this.getBlankZones(0, 0, this.canvas.height, true);
  // }


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
    if (this.left_menu.smoothing)
      return;
    if (this.left_menu.isPlace) {
      Menu.includeInMenu();
    } else {
      Menu.removeFromMenu();
    }
  }

  draw(context) {
    this.field.draw(context);
    this.left_menu.draw(context);
    this.panel.draw(context);

  }

  // drawBlank(context) {
  //   var zones = this.blank_zones;
  //   for (var i = 0; i < zones.length; i++) {
  //     zones[i].draw(context)
  //   }
  // }
}
