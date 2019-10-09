var hello = 4;
class Fragment {
  constructor(ind, src, x, y, left, top) {
    this.src = src;
    this.x = x;
    this.y = y;
    this.img = new Image();
    this.img.src = this.src;
    this.ind = ind;
    this.downloadImage();

    FragmentsGeneralCharacteristic.third_x = FragmentsGeneralCharacteristic.SCALE / 5;
    FragmentsGeneralCharacteristic.third_y = FragmentsGeneralCharacteristic.SCALE / 5;
    FragmentsGeneralCharacteristic.connectRange = FragmentsGeneralCharacteristic.third_x * 2; // ВРЕМЕННО

    this.left = left;
    this.top = top;
    this.right = null;
    this.bottom = null;
    if (this.left != null)
      this.left.right = this;
    if (this.top != null)
      this.top.bottom = this;

    this.group = null;
  }

  downloadImage() {
    this.img.onload = function() {
      FragmentsGeneralCharacteristic.downloadedImages++;
      if (FragmentsGeneralCharacteristic.downloadedImages == countImages) {
        console.log("Downloaded all images");

        FragmentsGeneralCharacteristic.width = this.width;
        FragmentsGeneralCharacteristic.height = this.height;

        FragmentsGeneralCharacteristic.SCALE = (
          Math.min(
            CanvasCharacteristic.all_width / (imagesX / 5 * 3) / FragmentsGeneralCharacteristic.width,
            CanvasCharacteristic.all_height / (imagesY / 5 * 3) / FragmentsGeneralCharacteristic.height
          )
        );
        FragmentsGeneralCharacteristic.widthScale = Math.floor(FragmentsGeneralCharacteristic.SCALE * FragmentsGeneralCharacteristic.width);
        FragmentsGeneralCharacteristic.heightScale = Math.floor(FragmentsGeneralCharacteristic.SCALE * FragmentsGeneralCharacteristic.height);

        FragmentsGeneralCharacteristic.third_x = FragmentsGeneralCharacteristic.widthScale / 5;
        FragmentsGeneralCharacteristic.third_y = FragmentsGeneralCharacteristic.heightScale / 5;

        FragmentsGeneralCharacteristic.connectRange = 3 * Math.min(
          FragmentsGeneralCharacteristic.third_x,
          FragmentsGeneralCharacteristic.third_y
        );
        CanvasCharacteristic.width = FragmentsGeneralCharacteristic.widthScale / 5 * 3 * imagesX;
        CanvasCharacteristic.height = FragmentsGeneralCharacteristic.heightScale / 5 * 3 * imagesY;

        CanvasCharacteristic.firstX = canvas.width / 2 - CanvasCharacteristic.width / 2;
        CanvasCharacteristic.firstY = 60;

        CanvasCharacteristic.lastX = CanvasCharacteristic.firstX + CanvasCharacteristic.width;
        CanvasCharacteristic.lastY = CanvasCharacteristic.firstY + CanvasCharacteristic.height;
      }
    }
  }


  // Отображает изображение в заданных координатах
  draw() {
    if (!showSilhouette) {
      context.drawImage(this.img,
        this.x,
        this.y,
        FragmentsGeneralCharacteristic.widthScale,
        FragmentsGeneralCharacteristic.heightScale
      )
    } else {
      context.beginPath();
      context.rect(
        this.x + FragmentsGeneralCharacteristic.third_x,
        this.y + FragmentsGeneralCharacteristic.third_y,
        FragmentsGeneralCharacteristic.widthScale - 2 * FragmentsGeneralCharacteristic.third_x,
        FragmentsGeneralCharacteristic.heightScale - 2 * FragmentsGeneralCharacteristic.third_y
      );
      context.lineWidth = "7";
      context.strokeStyle = "black";
      context.stroke();
    }
  }

  // Проверяет, есть ли в границах изображения заданная точка или нет
  // Нужно для проверки наведения курсора мыши на изображение
  isHadPoint(x, y) {
    return (
      x >= this.x + FragmentsGeneralCharacteristic.third_x &&
      x <= (this.x + FragmentsGeneralCharacteristic.widthScale - FragmentsGeneralCharacteristic.third_x) &&
      y >= (this.y + FragmentsGeneralCharacteristic.third_y) &&
      y <= (this.y + FragmentsGeneralCharacteristic.heightScale - FragmentsGeneralCharacteristic.third_y)

    )
  }

  // Расстояниме от курсора мыши до старта изображения в левом верхнем углу в пикселях.
  // Если это расстояние не учитывать, то изображение при его взятии будет телепортировано
  // Левым верхним углом к положению курсора, а так к тому положению прибавляется разница
  // в координатах, обеспечивая тем самым отсутствие рывков
  rangeToStartImage(x, y) {
    return {
      x: x - this.x,
      y: y - this.y
    };
  }

  rightTop() {
    return {
      x: this.x + FragmentsGeneralCharacteristic.widthScale - FragmentsGeneralCharacteristic.third_x,
      y: this.y + FragmentsGeneralCharacteristic.third_y
    }
  }

  leftTop() {
    // console.log(this.x, this.y);
    return {
      x: this.x + FragmentsGeneralCharacteristic.third_x,
      y: this.y + FragmentsGeneralCharacteristic.third_y
    }
  }

  rightBot() {
    return {
      x: this.x + FragmentsGeneralCharacteristic.widthScale - FragmentsGeneralCharacteristic.third_x,
      y: this.y + FragmentsGeneralCharacteristic.heightScale - FragmentsGeneralCharacteristic.third_y
    }
  }

  leftBot() {
    return {
      x: this.x + FragmentsGeneralCharacteristic.third_x,
      y: this.y + FragmentsGeneralCharacteristic.heightScale - FragmentsGeneralCharacteristic.third_y
    }
  }
  canConnectRightFragment() {
    var leftTopOfRightFragment = this.right.leftTop();
    var tmpRes = this.rangeFromRightTop(leftTopOfRightFragment.x, leftTopOfRightFragment.y);
    if (tmpRes <= FragmentsGeneralCharacteristic.connectRange)
      return {
        res: true,
        range: tmpRes
      };
    return {
      res: false
    };
  }

  rangeFromRightTop(x, y) {
    var rT = this.rightTop()
    return Math.sqrt((rT.y - y) * (rT.y - y) +
      (rT.x - x) * (rT.x - x))
  }

  canConnectLeftFragment() {
    var rightTopOfLeftFragment = this.left.rightTop();
    var tmpRes = this.rangeFromLeftTop(rightTopOfLeftFragment.x, rightTopOfLeftFragment.y);
    if (tmpRes <= FragmentsGeneralCharacteristic.connectRange)
      return {
        res: true,
        range: tmpRes
      };
    return {
      res: false
    };
  }

  rangeFromLeftTop(x, y) {
    var lT = this.leftTop();
    return Math.sqrt((lT.y - y) * (lT.y - y) +
      (lT.x - x) * (lT.x - x))
  }

  canConnectBottomFragment() {
    var leftTopOfBottomFragment = this.bottom.leftTop();
    var tmpRes = this.rangeFromLeftBottom(leftTopOfBottomFragment.x, leftTopOfBottomFragment.y);
    if (tmpRes <= FragmentsGeneralCharacteristic.connectRange)
      return {
        res: true,
        range: tmpRes
      };
    return {
      res: false
    };
  }

  rangeFromLeftBottom(x, y) {
    var lB = this.leftBot();
    return Math.sqrt((lB.y - y) * (lB.y - y) +
      (lB.x - x) * (lB.x - x))
  }

  canConnectTopFragment() {
    var leftBotOfTopFragment = this.top.leftBot();
    var tmpRes = this.rangeFromLeftTop(leftBotOfTopFragment.x, leftBotOfTopFragment.y);
    if (tmpRes <= FragmentsGeneralCharacteristic.connectRange)
      return {
        res: true,
        range: tmpRes
      };
    return {
      res: false
    };
  }

  rangeFromRightBottom(x, y) {
    var rB = this.rightBot();
    return Math.sqrt((rB.y - y) * (rB.y - y) +
      (rB.x - x) * (rB.x - x))
  }

  smoothmoveOneOrGroup(fr, selected, x, y) {
    if (fr.group == null) {
      fr.smoothMove(x, y);
    } else {
      fr.group.smoothMove(x, y, this);
    }
  }

  connectToOther(newInd = null, withConnect = true) {
    // возвращает объект, чтобы в будущем добавить сортировку по расстоянию для групп
    // newInd чтобы сравнивать объекты, на которые мы Не нажали, но которые обрабатываются
    // внутри группы на сближение с углами

    // withConnect - для проверки ближайшего конекта без конекта лол


    var i = null;
    if (newInd == null) {
      i = SelectFragmentHelper.translatedFragmentId
    } else {
      i = newInd;
    }
    x = i % imagesX;
    y = Math.floor(i / imagesY);

    if (x == 0 && y == 0 && this.rangeFromLeftTop(CanvasCharacteristic.firstX, CanvasCharacteristic.firstY) <= FragmentsGeneralCharacteristic.connectRange) {
      if (withConnect) {
        this.smoothmoveOneOrGroup(
          this, this,
          CanvasCharacteristic.firstX - FragmentsGeneralCharacteristic.third_x,
          CanvasCharacteristic.firstY - FragmentsGeneralCharacteristic.third_y
        );
      }
      return {
        res: true,
        range: 0
      };
    } else if (x == imagesX - 1 && y == 0 && this.rangeFromRightTop(CanvasCharacteristic.lastX, CanvasCharacteristic.firstY) <= FragmentsGeneralCharacteristic.connectRange) {
      if (withConnect) {
        this.smoothmoveOneOrGroup(
          this, this,
          CanvasCharacteristic.lastX + FragmentsGeneralCharacteristic.third_x - FragmentsGeneralCharacteristic.widthScale,
          CanvasCharacteristic.firstY - FragmentsGeneralCharacteristic.third_y
        );
      }
      return {
        res: true,
        range: 0
      };
    } else if (x == imagesX - 1 && y == imagesY - 1 && this.rangeFromRightBottom(CanvasCharacteristic.lastX, CanvasCharacteristic.lastY) <= FragmentsGeneralCharacteristic.connectRange) {
      if (withConnect) {
        this.smoothmoveOneOrGroup(
          this, this,
          CanvasCharacteristic.lastX + FragmentsGeneralCharacteristic.third_x - FragmentsGeneralCharacteristic.widthScale,
          CanvasCharacteristic.lastY + FragmentsGeneralCharacteristic.third_y - FragmentsGeneralCharacteristic.heightScale
        );
      }
      return {
        res: true,
        range: 0
      };
    } else if (x == 0 && y == imagesY - 1 && this.rangeFromLeftBottom(CanvasCharacteristic.firstX, CanvasCharacteristic.lastY) <= FragmentsGeneralCharacteristic.connectRange) {
      if (withConnect) {
        this.smoothmoveOneOrGroup(
          this, this,
          CanvasCharacteristic.firstX - FragmentsGeneralCharacteristic.third_x,
          CanvasCharacteristic.lastY + FragmentsGeneralCharacteristic.third_y - FragmentsGeneralCharacteristic.heightScale
        );
      }
      return {
        res: true,
        range: 0
      };
    } else {
      let leftFragment = this.left;
      let rightFragment = this.right;
      let topFragment = this.top;
      let bottomFragment = this.bottom;

      let connectArray = [];
      let inner_this = this;

      function connectToFragment(other, getInfo, getCoordinates, newX, newY) {
        if (getInfo.res && (inner_this.group == null || !inner_this.group.fragments.has(other))) {
          connectArray.push({
            range: getInfo.range,
            x: getCoordinates.x,
            y: getCoordinates.y,
            dX: newX,
            dY: newY,
            fr: other
          })
        }
      }
      if (topFragment != null)
        connectToFragment(
          topFragment,
          topFragment.canConnectBottomFragment(),
          topFragment.leftBot(),
          -FragmentsGeneralCharacteristic.third_x,
          -FragmentsGeneralCharacteristic.third_y
        );
      if (leftFragment != null)
        connectToFragment(
          leftFragment,
          leftFragment.canConnectRightFragment(),
          leftFragment.rightTop(),
          -FragmentsGeneralCharacteristic.third_x,
          -FragmentsGeneralCharacteristic.third_y
        );
      if (bottomFragment != null)
        connectToFragment(
          bottomFragment,
          bottomFragment.canConnectTopFragment(),
          bottomFragment.leftTop(),
          -FragmentsGeneralCharacteristic.third_x,
          -FragmentsGeneralCharacteristic.heightScale + FragmentsGeneralCharacteristic.third_y
        );
      if (rightFragment != null)
        connectToFragment(
          rightFragment,
          rightFragment.canConnectLeftFragment(),
          rightFragment.leftTop(),
          -FragmentsGeneralCharacteristic.widthScale + FragmentsGeneralCharacteristic.third_x,
          -FragmentsGeneralCharacteristic.third_y
        );

      connectArray.sort(function(a, b) {
        return a.range - b.range
      });
      if (connectArray.length > 0) {
        var near = connectArray[0];
        if (withConnect) {
          this.smoothmoveOneOrGroup(this, this, near.x + near.dX, near.y + near.dY)
          if (this.group == null) {
            if (near.fr.group == null) {
              this.group = new FragmentGroup();
              near.fr.group = this.group;
              this.group.fragments.add(this);
              this.group.fragments.add(near.fr);
            } else {
              this.group = near.fr.group;
              this.group.fragments.add(this);
            }
          } else {
            if (near.fr.group == null) {
              near.fr.group = this.group;
              this.group.fragments.add(near.fr);
            } else {
              this.group.changeGroup(near.fr.group)
            }
          }
        }
        return {
          res: true,
          range: near.range
        };
      }
      return {
        res: false
      };
    }
  }

  // Изменяет местоположение изображения
  move(x, y) {
    this.x = x;
    this.y = y;
  }
  smoothMove(newX, newY) {
    let oldX = this.x;
    let oldY = this.y;
    let tact = 21;
    let currentTact = 0;
    let dX = (newX - oldX) / (tact);
    let dY = (newY - oldY) / (tact);
    let fragment = this;
    //тактовая отрисовка
    function reDraw() {
      fragment.x += dX;
      fragment.y += dY;
      if (currentTact < tact) {
        setTimeout(reDraw, 1000 / FRAMES / tact); //ИЗМЕНЕНО
        currentTact++;
      } else {
        fragment.x = newX;
        fragment.y = newY;
      }
    }
    reDraw();
  }
}
