// Возможно стоит убрать подключение к smoothing объекту. а то проблем слишком дохуя??
// на заметку, потом посмотрим - Михаил

// Давно уже убрал, но комент забавный я оставил, пусть будет на память как и "var hello = 4"
// Шёл третий месяц, а мне до сих пор смешно - Никита

var hello = 4; // - Атаман Кирилл
class Fragment {
  static SCALE = -1;
  static downloadedImages = 0;
  static width = -1;
  static height = -1;
  static widthScale = -1;
  static heightScale = -1;
  static third_x = -1;
  static third_y = -1;
  static connectRange = -1;

  static widthPanel = -1;
  static heightPanel = -1;
  static third_xPanel = -1;
  static third_yPanel = -1;
  static widthWithoutSpacesPanel = -1;
  static heightWithoutSpacesPanel = -1;

  static tact = 21;
  static frame_time = 1000 / FRAMES / Fragment.tact;


  constructor(ind, src, srcBorder, x, y, left, top, bottomInd) {
    this.src = src; // путь до изображения пазла
    this.srcB = srcBorder; // путь до изображения с границами изображения
    this.x = x;
    this.y = y;

    // необходимо для вычисления нового положения при изменении размера элементов группы
    this.menuDX = 0; // расстояние от главного фрагмента в группе до текущего по X
    this.menuDY = 0; // расстояние от главного фрагмента в группе до текущего по Y
    this.img = new Image(); // изображение фрагмента
    this.imgB = new Image(); // image-border
    this.current_width = -1;
    this.current_height = -1;

    this.mainFragment = this;

    this.downloadImage();

    this.img.src = this.src;
    this.imgB.src = this.srcB;
    this.ind = ind;
    this.onBottomPanel = true;
    this.onMenu = false;
    this.onMenuLast = false; // проверка на нахождение в меню, выполненная ранее
    // нужна для неизменности некоторых данных, при условии
    // что объект так же как и в предыдущих находится/не находится
    // в области меню
    this.bottomPanelInd = bottomInd;

    /*
     * Для следуюих переменных в блоке
     * при истинности хотя бы одной из них
     * запрещается подключаться к другим фрагментам (не считая самой анимации)
     * запрещается выделять объекты мышкой
     */
    this.smoothing = false; // плавное автоматическое перемещение, не зависящее от мыши
    this.isConnecting = false; // объект ждет подключения к нему другого объекта
    this.resizing = false; // проигрывание анимации изменения размера

    this.animated = false;


    Fragment.third_x = Fragment.SCALE / 5;
    Fragment.third_y = Fragment.SCALE / 5;
    Fragment.connectRange = Fragment.third_x * 2; // ВРЕМЕННО

    /*
     * В данном блоке представлены ссылки на соседние пазлы
     * в цельном изображении. Соответственно верхний, нижний,
     * правый, левый. Если таких не существует - null
     */
    this.left = left;
    this.top = top;
    this.right = null;
    this.bottom = null;
    if (this.left != null)
      this.left.right = this;
    if (this.top != null)
      this.top.bottom = this;

    this.group = null; // ссылка на группу
    this.listElem = null; // ссылка на элемент двусвязного списка
  }

  init(img) {
    Fragment.width = img.width;
    Fragment.height = img.height;

    Fragment.SCALE = (
      Math.min(
        canvas.field.all_width / (imagesX / 5 * 3) / Fragment.width,
        canvas.field.all_height / (imagesY / 5 * 3) / Fragment.height
      )
    );
    Fragment.widthScale = Math.floor(Fragment.SCALE * Fragment.width);
    Fragment.heightScale = Math.floor(Fragment.SCALE * Fragment.height);

    Fragment.third_x = Fragment.widthScale / 5;
    Fragment.third_y = Fragment.heightScale / 5;
    Fragment.widthWithoutSpaces = Fragment.widthScale - 2 * Fragment.third_x;
    Fragment.heightWithoutSpaces = Fragment.heightScale - 2 * Fragment.third_y;

    Fragment.connectRange = 2.5 * Math.min(
      Fragment.third_x,
      Fragment.third_y
    );


  }

  downloadImage() {
    var fr = this;
    this.img.onload = function() {
      Fragment.downloadedImages++;
      if (Fragment.downloadedImages == 1) {
        initializeSizes(fr, this)
      }
    }
  }

  // Отображает изображение в заданных координатах
  draw(context) {
    if (!showSilhouette) {
      // не силуэт
      if (!this.onBottomPanel) {
        // изобразить элемент, если он не на панели
        let selected = (this.group != null) ? this.group : this;
        context.drawImage(
          this.img,
          selected.mainFragment.x + this.menuDX,
          selected.mainFragment.y + this.menuDY,
          this.current_width,
          this.current_height
        );
        context.drawImage(
          this.imgB,
          selected.mainFragment.x + this.menuDX,
          selected.mainFragment.y + this.menuDY,
          this.current_width,
          this.current_height
        );
      }
    } else {
      // изобразить силуэт
      let selected = (this.group != null) ? this.group : this;
      if (selected.onMenu) {
        context.beginPath();
        // context.rect(
        //   selected.mainFragment.x + this.menuDX + 2 * Fragment.third_xPanel,
        //   selected.mainFragment.y + this.menuDY + 2 * Fragment.third_yPanel,
        //   Fragment.widthPanel - 2 * Fragment.third_xPanel,
        //   Fragment.heightPanel - 2 * Fragment.third_yPanel
        // );
        context.rect(
          selected.mainFragment.x + this.menuDX,
          selected.mainFragment.y + this.menuDY,
          Fragment.widthPanel,
          Fragment.heightPanel
        );
        context.lineWidth = "3";
        context.strokeStyle = "black";
        context.stroke();
      } else if (!this.onBottomPanel) {
        context.beginPath();
        // context.rect(
        //   this.x + Fragment.third_x,
        //   this.y + Fragment.third_y,
        //   Fragment.widthScale - 2 * Fragment.third_x,
        //   Fragment.heightScale - 2 * Fragment.third_y
        // );
        context.rect(
          selected.mainFragment.x + this.menuDX,
          selected.mainFragment.y + this.menuDY,
          Fragment.widthScale,
          Fragment.heightScale
        );
        context.lineWidth = "5";
        context.strokeStyle = "black";
        context.stroke();
      }
    }
  }

  // Проверяет, есть ли в границах изображения заданная точка или нет
  // Нужно для проверки наведения курсора мыши на изображение
  isHadPoint(x, y) {
    if (this.onBottomPanel) {
      return (
        canvas.panel.fragmentsCount * (canvas.panel.list - 1) <= this.bottomPanelInd &&
        this.bottomPanelInd < canvas.panel.fragmentsCount * canvas.panel.list &&
        x >= (canvas.panel.firstX + canvas.panel.buttonWidth + canvas.panel.paddingX +
          (canvas.panel.fragmentSpace + Fragment.widthPanel) * (
          this.bottomPanelInd % canvas.panel.fragmentsCount)) &&
        x <= (canvas.panel.firstX + canvas.panel.buttonWidth + canvas.panel.paddingX +
          (canvas.panel.fragmentSpace + Fragment.widthPanel) * (
          this.bottomPanelInd % canvas.panel.fragmentsCount) + Fragment.widthPanel) &&
        y >= canvas.panel.firstY + canvas.panel.paddingY &&
        y <= canvas.panel.firstY + canvas.panel.paddingY + Fragment.heightPanel
      )
    }

    let selected = (this.group != null) ? this.group : this;
    if (selected.onMenu) {
      return (
        x >= (selected.mainFragment.x + this.menuDX + Fragment.third_xPanel) &&
        x <= (selected.mainFragment.x + this.menuDX + Fragment.widthPanel - Fragment.third_xPanel) &&
        y >= (selected.mainFragment.y + this.menuDY + Fragment.third_yPanel) &&
        y <= (selected.mainFragment.y + this.menuDY + Fragment.heightPanel - Fragment.third_yPanel)

      )
    }

    return (
      x >= this.x + Fragment.third_x &&
      x <= (this.x + Fragment.widthScale - Fragment.third_x) &&
      y >= (this.y + Fragment.third_y) &&
      y <= (this.y + Fragment.heightScale - Fragment.third_y)

    )
  }

  editMenuCoords() {
    if (this.onMenuLast == this.onMenu) {
      return;
    }
    this.onMenuLast = this.onMenu;
    if (!this.onMenu) {
      // поставить по умолчанию относительно курсора
      this.smoothResize(
        Fragment.widthPanel, Fragment.heightPanel,
        Fragment.widthScale, Fragment.heightScale,
        false, true
      );
    } else {
      // поставить в зависимости от главного, в меню
      // относительно курсора
      this.smoothResize(
        Fragment.widthScale, Fragment.heightScale,
        Fragment.widthPanel, Fragment.heightPanel,
        false, true
      );
    }
  }

  /**
   * Вызывается из smoothResize
   * для высчитывания нового положения фрагментов при изменении размеров
   * Без плавного изменения размера выглядит слишком резко (неожиданно)
   *
   * @param this_fr - фрагмент, над которым выполняются действия
   *
   * @param current_width - текущая длина фрагмента
   *
   * @param current_height - текущая высота фрагмента
   *
   *  Далее перечень аргументов, которые следует передать, т.к.
   *  переменная меняется в smoothMove, которая может быть вызвана
   *  при истинности append_cursor из smoothResize
   *
   * @param x - координата по оси x, равная this_fr.x,
   *
   * @param y - координата по оси y, равная this_fr.y
   *
   * @param mx - координата по оси y, равная selected.mainFragment.x
   *
   * @param my - координата по оси y, равная selected.mainFragment.y
   *
   */
  setMenuD(this_fr, current_width, current_height, x, y, mx, my) {
    let selected = (this_fr.group != null) ? this_fr.group : this_fr;
    this_fr.menuDX = (
      (x - mx) / Fragment.widthScale * current_width
    );
    this_fr.menuDY = (
      (y - my) / Fragment.heightScale * current_height
    );
    this_fr.current_width = current_width;
    this_fr.current_height = current_height;
  }

  // Расстояниме от курсора мыши до старта изображения в левом верхнем углу в пикселях.
  // Если это расстояние не учитывать, то изображение при его взятии будет телепортировано
  // Левым верхним углом к положению курсора, а так к тому положению прибавляется разница
  // в координатах, обеспечивая тем самым отсутствие рывков
  rangeToStartImage(x, y) {
    let selected = (this.group != null) ? this.group : this;
    return {
      x: x - selected.mainFragment.x - this.menuDX,
      y: y - selected.mainFragment.y - this.menuDY
    };
  }

  moveToPanel() {
    var x = (canvas.panel.firstX + canvas.panel.buttonWidth + canvas.panel.paddingX +
      (canvas.panel.fragmentSpace + Fragment.widthPanel) * (
      this.bottomPanelInd % canvas.panel.fragmentsCount)) + Fragment.widthPanel / 2 - Fragment.widthScale / 2;
    var y = canvas.panel.firstY + canvas.panel.paddingY + Fragment.heightPanel / 2 - Fragment.heightScale / 2;
    this.move(x, y);
  }

  /**
   * Функция работает с фрагментами или группами, объединяют их в одну группу
   *
   * @param selected - группа или фрагмент
   *
   * @param other - группа или фрагмент
   *
   * @param animated - анимация будет воспроизведена
   *
   * @param animationDelay - анимация с задержкой
   *
   */
  workGroups(selected, other, animated = false, animationDelay = .0) {
    if (selected.group == null) {
      if (other.group == null) {
        // создание группы
        selected.group = new FragmentGroup();
        other.group = selected.group;
        selected.group.fragments.add(selected);
        selected.group.fragments.add(other);
        selected.group.mainFragment = this;

        selected.listElem.value = selected.group; // ссылка на фрагмент заменяется на ссылку на группу
        selected.listElem.src = null; // убрать путь до картинки, а то некрасиво
        selected.group.listElemGroup = selected.listElem;
        other.listElem.remove(); // удаление "лишнего" объекта из очереди на запись,
                                 // т.к. он уже отрисовывается в группе
        other.setMenuD(other, other.current_width, other.current_height,
          other.x, other.y, other.group.mainFragment.x, other.group.mainFragment.y
        );
      } else {
        // selected - not group;
        // other - group

        selected.group = other.group;
        selected.group.fragments.add(selected);
        selected.listElem.remove();

        selected.setMenuD(selected, selected.current_width, selected.current_height,
          selected.x, selected.y, selected.group.mainFragment.x, selected.group.mainFragment.y
        );

      }
    } else {
      if (other.group == null) {
        other.group = selected.group;
        selected.group.fragments.add(other);

        selected.listElem.value = selected.group; // ссылка на фрагмент заменяется на ссылку на чужую группу
        other.listElem.remove();

        other.setMenuD(other, other.current_width, other.current_height,
          other.x, other.y, other.group.mainFragment.x, other.group.mainFragment.y
        );

      } else {
        selected.group.listElemGroup.remove();
        selected.group.changeGroup(other.group); //setMenuD внутри
      }
    }
    if (animated) {
      setTimeout(selected.group.resizeSelect, animationDelay, selected.group, true);
    }

  }

  rightTop() {
    return {
      x: this.x + Fragment.widthScale - Fragment.third_x,
      y: this.y + Fragment.third_y
    }
  }

  leftTop() {
    return {
      x: this.x + Fragment.third_x,
      y: this.y + Fragment.third_y
    }
  }

  rightBot() {
    return {
      x: this.x + Fragment.widthScale - Fragment.third_x,
      y: this.y + Fragment.heightScale - Fragment.third_y
    }
  }

  leftBot() {
    return {
      x: this.x + Fragment.third_x,
      y: this.y + Fragment.heightScale - Fragment.third_y
    }
  }

  canConnectRightFragment() {
    var leftTopOfRightFragment = this.right.leftTop();
    var tmpRes = this.rangeFromRightTop(leftTopOfRightFragment.x, leftTopOfRightFragment.y);
    if (tmpRes <= Fragment.connectRange)
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
    if (tmpRes <= Fragment.connectRange)
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
    if (tmpRes <= Fragment.connectRange)
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
    if (tmpRes <= Fragment.connectRange)
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
   * Функция реализует присоединение к чему либо либо информирует о возможности этого события
   *
   *  @param int  newInd - индекс фрагмента, для которого стоит проверить возможность
   *                       присоединения, по умолчанию выбирается индекс фрагмента,
   *                       передвигаемого игроком (SelectFragmentHelper.translatedFragmentId).
   *                       Рассмотрение от других фрагментов нужно при проверке подсоединения
   *                       для нескольких фрагментов от одной группы
   *
   *  @param bool withConnect - выполнить присоединение после подтверждения соответствующей проверки,
   *                            по умолчанию присоединяет один фрагмент к другому
   *                            Проверка необходима при подсоединении группы к фрагментам,
   *                            где сначала узнается вся информация о возможных
   *                            подсоединениях, а потом полученые данные сортируются
   *                            по неубыванию, выполняя подсоединение к самому
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

    if (arr[i].onMenu || (arr[i].group != null && arr[i].group.onMenu)) {
      return;
    }

    let connectArray = [];

    let leftFragment = this.left;
    let rightFragment = this.right;
    let topFragment = this.top;
    let bottomFragment = this.bottom;
    let inner_this = this;

    let x = i % imagesX;
    let y = Math.floor(i / imagesX);

    /**
     *  @param int  needX, needY - необходимые конечные координаты пазла
     *                             в изображении, соответствующие заданному углу
     *
     *  @param float range - расстояние до заданного угла
     *
     *  @param int newX, newY - место, куда необходимо перенести пазл при
     *                          выполнении всех условий
     *
     */
    function connectToCorner(needX, needY, range, newX, newY) {
      if (x == needX && y == needY && range <= Fragment.connectRange) {
        connectArray.push({
          range: range,
          x: newX,
          y: newY,
          fr: null
        });
      }
    }
    connectToCorner(0, 0, this.rangeFromLeftTop(canvas.field.firstX, canvas.field.firstY),
      canvas.field.firstX - Fragment.third_x,
      canvas.field.firstY - Fragment.third_y);
    connectToCorner(imagesX - 1, 0, this.rangeFromRightTop(canvas.field.lastX, canvas.field.firstY),
      canvas.field.lastX + Fragment.third_x - Fragment.widthScale,
      canvas.field.firstY - Fragment.third_y);
    connectToCorner(imagesX - 1, imagesY - 1, this.rangeFromRightBottom(canvas.field.lastX, canvas.field.lastY),
      canvas.field.lastX + Fragment.third_x - Fragment.widthScale,
      canvas.field.lastY + Fragment.third_y - Fragment.heightScale);
    connectToCorner(0, imagesY - 1, this.rangeFromLeftBottom(canvas.field.firstX, canvas.field.lastY),
      canvas.field.firstX - Fragment.third_x,
      canvas.field.lastY + Fragment.third_y - Fragment.heightScale);


    /**
     * Предназначено для заполнения массива ConnectArray,
     * заполняет его объетами, хранящими расстояние до фрагмента
     * а так же числа, необходимые добавить к координатам фрагмента
     * для нормального присоединения одного к другому
     *
     *  @param other - фрагмент, к которому идет подсоединение
     *
     *  @param getInfo - объект, показывающий о возможности присоединения
     *                   фрагмента и расстояние до него
     *  @param getCoordinates - объект с координатами одного из углов другого фрагмента
     *
     *  @param newX - число, необходимое добавить к getCoordinates.x для получения
     *                новых координат для текущего фрагмента вдоль оси X
     *  @param newY - число, необходимое добавить к getCoordinates.y для получения
     *                новых координат для текущего фрагмента вдоль оси Y
     *
     */
    function connectToFragment(other, getInfo, getCoordinates, newX, newY) {
      if (
        getInfo.res && (inner_this.group == null || !inner_this.group.fragments.has(other)) &&
        !other.onBottomPanel && ((other.group != null && !other.group.onMenu) || (other.group == null && !other.onMenu))
      ) {
        // работает только на объекты, отсутствующие в группе, панели и меню
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
    if (topFragment != null) {
      connectToFragment(topFragment, topFragment.canConnectBottomFragment(),
        topFragment.leftBot(),
        -Fragment.third_x, -Fragment.third_y);
      }
    if (leftFragment != null)
      connectToFragment(leftFragment, leftFragment.canConnectRightFragment(),
        leftFragment.rightTop(),
        -Fragment.third_x, -Fragment.third_y);
    if (bottomFragment != null)
      connectToFragment(bottomFragment, bottomFragment.canConnectTopFragment(),
        bottomFragment.leftTop(),
        -Fragment.third_x,
        -Fragment.heightScale + Fragment.third_y);
    if (rightFragment != null)
      connectToFragment(rightFragment, rightFragment.canConnectLeftFragment(),
        rightFragment.leftTop(),
        -Fragment.widthScale + Fragment.third_x,
        -Fragment.third_y);

    connectArray.sort(function(a, b) {
      return a.range - b.range;
    });

    if (connectArray.length > 0) {
      var near = connectArray[0];
      if (withConnect) {
        if (near.fr == null) {
          // идет присоединение к углу, а не к фрагменту
          this.smoothmoveOneOrGroup(this, near.x, near.y);
        } else {
          // подсоединение к фрагменту
          let near_frg = (near.fr.group == null) ? near.fr : near.fr.group;
          if (!near_frg.smoothing && !near_frg.isConnecting && !near_frg.resizing) {
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

  move(x, y) {
    this.x = x;
    this.y = y;
  }


  /**
   *  @param int newX - новая координата x
   *
   *  @param int newY - новая координата y
   *
   *  @param Fragment connectingFragment - фрагмент, к которому, возможно,
   *                                       подключается наш фрагмент
   *  @param bool shouldWorkGroups - должно ли сработать присоединение к
   *                                 несмотря на присутствие группы у фрагмента
   *                                 Срабатывает у одного фрагмента из всей
   *                                 группы, нет повторений
   */
  smoothMove(newX, newY, connectingFragment=null, shouldWorkGroups=false) {
    let near = null;
    let this_frg = (this.group == null) ? this : this.group;
    // группа или одиночный фрагмент, к которому идет подключение

    this_frg.smoothing = true;
    if (connectingFragment != null) {
      near = (connectingFragment.group == null) ? connectingFragment : connectingFragment.group;
      near.isConnecting = true;
    }

    let oldX = this.x;
    let oldY = this.y;
    let currentTact = 0;
    let dX = (newX - oldX) / (Fragment.tact);
    let dY = (newY - oldY) / (Fragment.tact);
    let this_fr = this; // сам фрагмент (отличие с this_frg)

    // рекурсивная функция вызываемая с задержкой в самой себе
    function reDraw() {
      this_fr.x += dX;
      this_fr.y += dY;

      if (currentTact < Fragment.tact - 1) {
        setTimeout(reDraw, Fragment.frame_time);
        currentTact++;
      } else {
        this_fr.x = newX;
        this_fr.y = newY;
        if (connectingFragment != null) {
          // connectingFragment.setMenuD(connectingFragment, Fragment.widthScale, Fragment.heightScale);
          if (this_fr.group == null || shouldWorkGroups) // для работы один раз,
                                                         // чтобы не выполнялось для каждого
                                                         // элемента в группе
            this_fr.workGroups(this_fr, connectingFragment, true, 0);
          near.isConnecting = false;
        }
        this_frg.smoothing = false;
      }
    }
    reDraw();
  }

  /**
   * Вызывается из группы или фрагмента в процессе onmouseup
   * Меняет относительные координаты у фрагментов группы для
   * нормального уменьшения / увеличения изображения при добавлении в группу
   * и изменяет сам размер изображения
   *
   * @param double - 4 длины пазлины, понятные из их названий
   *
   * @param back - стоит ли повторять анимацию задонаперед при истинности
   *
   * @param append_cursor - стоит ли отталкиваться от местоположения курсора
   */
  smoothResize(old_width, old_height, new_width, new_height, back = false, append_cursor=false) {
    let this_frg = (this.group == null) ? this : this.group;
    this_frg.resizing = true;
    let currentTact = 0;
    let dX = (new_width - old_width) / (Fragment.tact);
    let dY = (new_height - old_height) / (Fragment.tact);

    var current_width = old_width;
    var current_height = old_height;

    let this_fr = this;

    // для передачи в setMenuD, константные аргументы
    // следует передать, т.к. могут быть изменены в smoothMove
    // вызванной при истинности append_cursor
    let x = this_fr.x;
    let y = this_fr.y;
    let mx = this_frg.mainFragment.x;
    let my = this_frg.mainFragment.y;

    if(append_cursor) {
      // высчитывает на сколько стоит сместить объект, чтобы он якобы масштабировался
      // относительно курсора
      // работает только для одиначных объектов, т.к. в группе обрабатывается отдельно
      var b_x = SelectFragmentHelper.deltaX * (1 - new_width / old_width);
      var b_y = SelectFragmentHelper.deltaY * (1 - new_height / old_height);
      this_fr.smoothMove(this_fr.x+b_x, this_fr.y+b_y);
    }
    // рекурсивная функция вызываемая с задержкой в самой себе
    function resize() {
      current_width += dX;
      current_height += dY;
      this_fr.setMenuD(this_fr, current_width, current_height, x, y, mx, my);

      if (currentTact < Fragment.tact - 1) {
        setTimeout(resize, Fragment.frame_time);
        currentTact++;
      } else {
        this_fr.setMenuD(this_fr, new_width, new_height, x, y, mx, my);
        if (back) {
          // повторная анимация, возвращающая всё обратно
          this_fr.smoothResize(new_width, new_height, old_width, old_height, false, append_cursor);
        } else {
          this_frg.resizing = false;
        }
      }
    }

    resize();
  }

  /**
  * Вызывается из группы resizeSelect(this_gr)
  *
  * @param back - bool, стоит ли возвращать анимацию назад
  *
  * @param charact - увеличить или уменьшить (-1, 1)
  *
  */
  resizeSelect(back, charact=-1) {
    if(charact == -1) {
      this.smoothResize(
        this.current_width, this.current_height,
        this.current_width * 0.95, this.current_height * 0.95,
        back
      );
    }
    else {
      this.smoothResize(
        this.current_width * 0.95, this.current_height * 0.95,
        this.current_width, this.current_height,
        back
      );
    }
  }
}
