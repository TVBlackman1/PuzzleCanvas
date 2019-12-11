// Возможно стоит убрать подключение к smoothing объекту. а то проблем слишком дохуя??
// на заметку, потом посмотрим


var hello = 4;
class Fragment {
  constructor(ind, src, srcBorder, x, y, left, top, bottomInd) {
    this.src = src;
    this.srcB = srcBorder;
    this.x = x;
    this.y = y;
    this.img = new Image();
    this.imgB = new Image();

    this.downloadImage();

    this.img.src = this.src;
    this.imgB.src = this.srcB;
    this.ind = ind;
    this.onBottomPanel = true;
    this.onMenu = false;
    this.bottomPanelInd = bottomInd;

    this.smoothing = false; // для ограничения движения объекта во время анимации
    this.isConnecting = false; // объект конектит другой, а потому не может быть выбран. Необходим int, т.к. можно подключать несколько сразу
    // После первого isConnecting станет false, хотя подключается ещё второй объект, а потому будет


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
    this.listElem = null; // заполняется
  }

  init(img) {
    FragmentsGeneralCharacteristic.width = img.width;
    FragmentsGeneralCharacteristic.height = img.height;

    FragmentsGeneralCharacteristic.SCALE = (
      Math.min(
        canvas.field.all_width / (imagesX / 5 * 3) / FragmentsGeneralCharacteristic.width,
        canvas.field.all_height / (imagesY / 5 * 3) / FragmentsGeneralCharacteristic.height
      )
    );
    FragmentsGeneralCharacteristic.widthScale = Math.floor(FragmentsGeneralCharacteristic.SCALE * FragmentsGeneralCharacteristic.width);
    FragmentsGeneralCharacteristic.heightScale = Math.floor(FragmentsGeneralCharacteristic.SCALE * FragmentsGeneralCharacteristic.height);

    FragmentsGeneralCharacteristic.third_x = FragmentsGeneralCharacteristic.widthScale / 5;
    FragmentsGeneralCharacteristic.third_y = FragmentsGeneralCharacteristic.heightScale / 5;

    FragmentsGeneralCharacteristic.connectRange = 2.5 * Math.min(
      FragmentsGeneralCharacteristic.third_x,
      FragmentsGeneralCharacteristic.third_y
    );
  }

  downloadImage() {
    var fr = this;
    this.img.onload = function() {
      FragmentsGeneralCharacteristic.downloadedImages++;
      if (FragmentsGeneralCharacteristic.downloadedImages == 1) {
        console.log("Downloaded all images");
        initializeSizes(fr, this)
        // panel = new Panel();
      }
    }
  }

  // Отображает изображение в заданных координатах
  draw(context) {
    if (!showSilhouette) {
      if (!this.onBottomPanel) {
        // изобразить элемент, если он не на панели
        if (!this.onMenu) {
          context.drawImage(
            this.img,
            this.x,
            this.y,
            FragmentsGeneralCharacteristic.widthScale,
            FragmentsGeneralCharacteristic.heightScale
          );
          context.drawImage(
            this.imgB,
            this.x,
            this.y,
            FragmentsGeneralCharacteristic.widthScale,
            FragmentsGeneralCharacteristic.heightScale
          );
        } else {
          context.drawImage(
            this.img,
            this.x + FragmentsGeneralCharacteristic.third_x * 5 / 3,
            this.y + FragmentsGeneralCharacteristic.third_y * 5 / 3,
            FragmentsGeneralCharacteristic.widthPanel,
            FragmentsGeneralCharacteristic.heightPanel
          );
        }
      }
    } else {
      // изобразить силуэт
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
    if (this.onBottomPanel) {
      return (
        canvas.panel.fragmentsCount * (canvas.panel.list - 1) <= this.bottomPanelInd &&
        this.bottomPanelInd < canvas.panel.fragmentsCount * canvas.panel.list &&
        x >= (canvas.panel.firstX + canvas.panel.buttonWidth + canvas.panel.paddingX + (canvas.panel.fragmentSpace + FragmentsGeneralCharacteristic.widthPanel) * (
          this.bottomPanelInd % canvas.panel.fragmentsCount)) &&
        x <= (canvas.panel.firstX + canvas.panel.buttonWidth + canvas.panel.paddingX + (canvas.panel.fragmentSpace + FragmentsGeneralCharacteristic.widthPanel) * (
          this.bottomPanelInd % canvas.panel.fragmentsCount) + FragmentsGeneralCharacteristic.widthPanel) &&
        y >= canvas.panel.firstY + canvas.panel.paddingY &&
        y <= canvas.panel.firstY + canvas.panel.paddingY + FragmentsGeneralCharacteristic.heightPanel

      )
    } else
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

  moveToPanel() {
    // edit
    var x = (canvas.panel.firstX + canvas.panel.buttonWidth + canvas.panel.paddingX + (canvas.panel.fragmentSpace + FragmentsGeneralCharacteristic.widthPanel) * (
      this.bottomPanelInd % canvas.panel.fragmentsCount)) + FragmentsGeneralCharacteristic.widthPanel / 2 - FragmentsGeneralCharacteristic.widthScale / 2;
    var y = canvas.panel.firstY + canvas.panel.paddingY + FragmentsGeneralCharacteristic.heightPanel / 2 - FragmentsGeneralCharacteristic.heightScale / 2;
    this.move(x, y);
  }

  workGroups(selected, other) {
    if (selected.group == null) {
      if (other.group == null) {
        // создание группы
        selected.group = new FragmentGroup();
        other.group = selected.group;
        selected.group.fragments.add(selected);
        selected.group.fragments.add(other);

        selected.listElem.value = selected.group; // ссылка на фрагмент заменяется на ссылку на группу
        selected.listElem.src = null; // убрать путь до картинки, а то некрасиво
        selected.group.listElemGroup = selected.listElem;
        other.listElem.remove(); // удаление "лишнего" объекта из очереди на запись, т.к. он уже отрисовывается в группе

      } else {
        // selected - not group;
        // other - group

        // меняем все элементы бОльшей группы, а не наооброт, т.к. ебанутый баг: плохо идет коннект одиночных к группе, если та группа не пред верхняя
        selected.group = other.group;
        selected.group.fragments.add(selected);

        selected.listElem.remove();

      }
    } else {
      if (other.group == null) {
        other.group = selected.group;
        selected.group.fragments.add(other);

        selected.listElem.value = selected.group; // ссылка на фрагмент заменяется на ссылку на чужую группу
        other.listElem.remove();

      } else {
        selected.group.listElemGroup.remove();
        selected.group.changeGroup(other.group);
      }
    }
  }

  rightTop() {
    return {
      x: this.x + FragmentsGeneralCharacteristic.widthScale - FragmentsGeneralCharacteristic.third_x,
      y: this.y + FragmentsGeneralCharacteristic.third_y
    }
  }

  leftTop() {
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

  smoothmoveOneOrGroup(fr, x, y, connectingFragment) {
    if (fr.group == null) {
      fr.smoothMove(x, y, connectingFragment);
    } else {
      fr.group.smoothMove(x, y, this, connectingFragment); // допилим позже
    }
  }


  /**
   *  @param int  newInd - индекс фрагмента, для которого стоит проверить возможность присоединения,
   *                       по умолчанию выбирается индекс фрагмента, передвигаемого игроком (SelectFragmentHelper.translatedFragmentId).
   *                       Рассмотрение от других фрагментов нужно при проверке подсоединения для нескольких фрагментов от одной группы
   *
   *  @param bool withConnect - выполнить присоединение после подтверждения соответствующей проверки,
   *                            по умолчанию присоединяет один фрагмент к другому
   *                            Проверка необходима при подсоединении группы к фрагментам, где сначала узнается вся информация о возможных
   *                            подсоединениях, а потом полученые данные сортируются по неубыванию, выполняя подсоединение к самому
   *                            близкому из возможных
   *
   *  @return object {
   *           res
   *           range
   *          }
   *
   */
  connectTo(newInd = null, withConnect = true) {
    var i = null;
    if (newInd == null) {
      i = SelectFragmentHelper.translatedFragmentId
    } else {
      i = newInd;
    }
    let connectArray = [];

    let leftFragment = this.left;
    let rightFragment = this.right;
    let topFragment = this.top;
    let bottomFragment = this.bottom;
    let inner_this = this;

    let x = i % imagesX;
    let y = Math.floor(i / imagesY);

    /**
     *  @param int  needX, needY - необходимые конечные координаты пазла в изображении, соответствующие заданному углу
     *
     *  @param float range - расстояние до заданного угла
     *
     *  @param int newX, newY - место, куда необходимо перенести пазл при выполнении всех условий
     *
     */
    function connectToCorner(needX, needY, range, newX, newY) {
      if (x == needX && y == needY && range <= FragmentsGeneralCharacteristic.connectRange) {
        connectArray.push({
          range: range,
          x: newX,
          y: newY,
          fr: null
        });
      }
    }
    connectToCorner(0, 0, this.rangeFromLeftTop(canvas.field.firstX, canvas.field.firstY),
      canvas.field.firstX - FragmentsGeneralCharacteristic.third_x,
      canvas.field.firstY - FragmentsGeneralCharacteristic.third_y);
    connectToCorner(imagesX - 1, 0, this.rangeFromRightTop(canvas.field.lastX, canvas.field.firstY),
      canvas.field.lastX + FragmentsGeneralCharacteristic.third_x - FragmentsGeneralCharacteristic.widthScale,
      canvas.field.firstY - FragmentsGeneralCharacteristic.third_y);
    connectToCorner(imagesX - 1, imagesY - 1, this.rangeFromRightBottom(canvas.field.lastX, canvas.field.lastY),
      canvas.field.lastX + FragmentsGeneralCharacteristic.third_x - FragmentsGeneralCharacteristic.widthScale,
      canvas.field.lastY + FragmentsGeneralCharacteristic.third_y - FragmentsGeneralCharacteristic.heightScale);
    connectToCorner(0, imagesY - 1, this.rangeFromLeftBottom(canvas.field.firstX, canvas.field.lastY),
      canvas.field.firstX - FragmentsGeneralCharacteristic.third_x,
      canvas.field.lastY + FragmentsGeneralCharacteristic.third_y - FragmentsGeneralCharacteristic.heightScale);


    /**
     *  @param Fragment other - фрагмент, к которому идет подсоединение
     *
     *  @param object getInfo - расстояние до другого фрагмента
     *
     *  @param object getCoordinates - координаты одного из углов другого фрагмента
     *
     *  @param int newX, newY - координаты, которые необходимо добавить к третьему аргументу
     *                          для получения новых координат текущего фрагмента (this)
     *
     */
    function connectToFragment(other, getInfo, getCoordinates, newX, newY) {
      if ((getInfo.res && (inner_this.group == null || !inner_this.group.fragments.has(other)) && !other.onBottomPanel)) {
        // работает только на объекты, отсутствующие в группе
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
      connectToFragment(topFragment, topFragment.canConnectBottomFragment(),
        topFragment.leftBot(),
        -FragmentsGeneralCharacteristic.third_x, -FragmentsGeneralCharacteristic.third_y);
    if (leftFragment != null)
      connectToFragment(leftFragment, leftFragment.canConnectRightFragment(),
        leftFragment.rightTop(),
        -FragmentsGeneralCharacteristic.third_x, -FragmentsGeneralCharacteristic.third_y);
    if (bottomFragment != null)
      connectToFragment(bottomFragment, bottomFragment.canConnectTopFragment(),
        bottomFragment.leftTop(),
        -FragmentsGeneralCharacteristic.third_x,
        -FragmentsGeneralCharacteristic.heightScale + FragmentsGeneralCharacteristic.third_y);
    if (rightFragment != null)
      connectToFragment(rightFragment, rightFragment.canConnectLeftFragment(),
        rightFragment.leftTop(),
        -FragmentsGeneralCharacteristic.widthScale + FragmentsGeneralCharacteristic.third_x,
        -FragmentsGeneralCharacteristic.third_y);


    connectArray.sort(function(a, b) {
      return a.range - b.range
    });

    if (connectArray.length > 0) {
      var near = connectArray[0];
      if (withConnect) {
        if (near.fr == null) {
          // идет присоединение к углу, а не к фрагменту
          this.smoothmoveOneOrGroup(this, near.x, near.y);
        } else {
          // подсоединение к фрагменту
          if (!near.fr.smoothing && !near.fr.isConnecting && (near.fr.group == null || !near.fr.group.isConnecting)) {
            this.smoothmoveOneOrGroup(this, near.x + near.dX, near.y + near.dY, near.fr);
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

  // Изменяет местоположение изображения
  move(x, y) {
    this.x = x;
    this.y = y;
  }
  smoothMove(newX, newY, connectingFragment = null) {
    // тупо вызвать в аргументаъ объект, если идет смув к нему. Он может двигаться, в этом проблема
    // перемещаемся с его скоростью и без проблем настигаем нахуй хохо Снова пишу в час ночи а завтра 1 пара
    // охуенно.

    // connectingFragment - фрагмент, к которому я конекчусь.
    // при измнении его координат мои подстраиваются

    // Во время проведения анимации запрещается его двигать как либо!!!
    // это приведет к нереальному пиздецу

    // если объект ещё смувится, а к нему смув другого закончился, то надо тот пододвигать

    if (this.group != null) {
      this.group.smoothing = true;
    } else {
      this.smoothing = true;
    }
    if (connectingFragment != null) {
      if (connectingFragment.group != null) {
        connectingFragment.group.isConnecting = true;
      } else {
        connectingFragment.isConnecting = true;
      }
    }


    let oldX = this.x;
    let oldY = this.y;
    let tact = 21;
    let currentTact = 0;
    let dX = (newX - oldX) / (tact);
    let dY = (newY - oldY) / (tact);
    let fragment = this;

    let speedAnimation = 1000 / FRAMES / tact;

    var connectingX = -1;
    var connectingY = -1;
    var connectingX_start = -1;
    var connectingY_start = -1;
    if (connectingFragment != null) {
      connectingX = connectingFragment.x;
      connectingY = connectingFragment.y;
      connectingX_start = connectingX;
      connectingY_start = connectingY;
    }
    //тактовая отрисовка
    function reDraw() {
      fragment.x += dX;
      fragment.y += dY;
      // при изменении координат присоединяющего элемента следуем за ним
      // по разнице координат
      if (connectingFragment != null &&
        (
          connectingX != connectingFragment.x ||
          connectingY != connectingFragment.y)
      ) {
        fragment.x += connectingFragment.x - connectingX;
        fragment.y += connectingFragment.y - connectingY;

        connectingX = connectingFragment.x;
        connectingY = connectingFragment.y;
      }

      if (currentTact < tact - 1) {
        setTimeout(reDraw, speedAnimation); //ИЗМЕНЕНО
        currentTact++;
      } else {
        fragment.x = newX;
        fragment.y = newY;
        if (connectingFragment != null) {

          // Если объект подошёл к родителю, но тот ещё смувится, то копировать его перемещение до конца смува последнего.
          function copyPositionIfNotSmoothmove() {
            fragment.x += connectingFragment.x - connectingX;
            fragment.y += connectingFragment.y - connectingY;

            connectingX = connectingFragment.x;
            connectingY = connectingFragment.y;

            if (connectingFragment.smoothing) {
              // проверка для повтора смува
              setTimeout(copyPositionIfNotSmoothmove, speedAnimation);
            } else {
              // при окончании убрать смув и добавить возможность к управлению элементов мышкой, убрав isConnecting и smoothing у всех элементов

              // движется до тех пор, пока движется родитель
              if (fragment.group != null) {
                fragment.group.smoothing = false;
              } else {
                fragment.smoothing = false;
              }
              if (connectingFragment != null) {
                if (connectingFragment.group != null) {
                  connectingFragment.group.isConnecting = false;
                }
                connectingFragment.isConnecting = false;
              }
            }
          }
          copyPositionIfNotSmoothmove()

          // установка финальных координат
          fragment.x += connectingX - connectingX_start;
          fragment.y += connectingY - connectingY_start;
          if (fragment.group == null) // для работы один раз, чтобы не выполнялось для каждого элемента в группе
            fragment.workGroups(fragment, connectingFragment); // для группы отдельно обрабатывается в группе

        } else {
          // нет родителя, незачем двигаться
          if (fragment.group != null) {
            fragment.group.smoothing = false;
          } else {
            fragment.smoothing = false;
          }
        }
      }
    }
    reDraw();
  }
}
