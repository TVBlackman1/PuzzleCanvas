class FragmentGroup {
  constructor(src, x, y, left, top) {
    this.fragments = new Set();
    this.isConnecting = false; // группа в данный момент подключает другой объект, а потому не может перемещаться.
    // В противном случае нужно чёто рассматривать а мне лень
    this.smoothing = false;
    this.resizing = false;
    this.connectedToCorner = false;

    this.listElemGroup = null;
    this.mainFragment = null; // главный фрагмент группы, нужный для вычисления расстояния до
    // в уменьшенной группе в области меню и определения его новых координат
    this.onMenu = false;
    this.onMenuLast = false; // нужно при editMenuCoords, проверьте сами, мне лень

    /*
     * Нужны крайние значения
     * с помощью них можно получить крайние значения по осям X и Y для группы
     * и ограничить её перемещение по полю, а так же изменяет scale у resizeSelect
     * для меньшего изменения размера для каждого фрагмента. Т.е. чем больше длина
     * и высота фрагмента, тем меньше изменение размера
     */
    this.leftFragmentInd = -1;
    this.rightFragmentInd = -1;
    this.topFragmentInd = -1;
    this.bottomFragmentInd = -1;
  }

  isHadPoint(x, y) {
    var found = false;
    var ind_ans = -1;
    this.fragments.forEach(function(fragment, ind, arr) {
      if (found)
        return;
      found = fragment.isHadPoint(x, y);
      if (found)
        ind_ans = fragment.ind;
    });
    return ind_ans;
  }

  /**
   * Перемещает все фрагменты зависимо от того, куда переместился один из них
   *
   * @param x - координата по оси x выбранного фрагмента
   *
   * @param y - координата по оси y выбранного фрагмента
   *
   * @param selected - выбранный фрагмент, который перемещается.
   *                   относительно него вычисляются координаты других фрагментов
   *                   чтобы изображение не ломалось
   */
  move(x, y, selected) {
    this.fragments.forEach(function(fragment, ind, arr) {
      if (fragment !== selected) {
        fragment.move(
          x - selected.x + fragment.x,
          y - selected.y + fragment.y
        )
      }
    });
    selected.move(x, y); // обрабатывается последним, т.к. в цикле используются его данные
  }

  draw(context) {
    this.fragments.forEach(function(fragment, ind, arr) {
      fragment.draw(context);
    });
  }

  smoothMove(x, y, selected, connectingFragment) {
    // connectingFragment - фрагмент, к которому я конекчусь.
    // при измнении его координат мои подстраиваются
    this.fragments.forEach(function(fragment, ind, arr) {
      if (fragment !== selected) {
        fragment.smoothMove(
          x - selected.x + fragment.x,
          y - selected.y + fragment.y,
          connectingFragment
        )
      }
    });
    selected.smoothMove(x, y, connectingFragment, true);
    // true, можно работать с группой

  }

  changeGroup(newGroup) {
    this.fragments.forEach(function(fragment, ind, arr) {
      fragment.group = newGroup;
      newGroup.fragments.add(fragment);
      fragment.setMenuD(fragment, fragment.current_width, fragment.current_height,
        fragment.x, fragment.y, fragment.group.mainFragment.x,
        fragment.group.mainFragment.y
      );
    });
  }

  connectTo() {
    var minRange = -1;
    var minFragment = null;
    this.fragments.forEach(function(fragment, ind, arr) {

      // для каждого из фрагментов смотрим, можем ли мы присоединить его к другим фрагментам вне группы
      var res = fragment.connectTo(fragment.ind, false); // информация о возможности присоединения БЕЗ самого присоединения
      // res - null при объекте в меню или наведенном на меню => не стоит присоединяться

      // сортировка по расстоянию, если есть возможность присоединить. Выбор минимального из расстояний
      if (res && res.res) {
        if (minRange == -1) {
          minRange = res.range;
          minFragment = fragment;
        }
        if (res.range < minRange) {
          minRange = res.range;
          minFragment = fragment;
        }
      }
    });
    if (minFragment != null)
      minFragment.connectTo(minFragment.ind, true);

  }

  /*
   * Меняет размер, если объект на меню
   *
   */
  editMenuCoords(fr) {
    // fr - фрагмент, который мы взяли. Относительно него будут строиться остальные
    if (this.onMenuLast == this.onMenu) {
      return;
    }
    this.onMenuLast = this.onMenu;
    if (!this.onMenu) {
      // поставить по умолчанию
      this.smoothResize(
        Fragment.widthPanel, Fragment.heightPanel,
        Fragment.widthScale, Fragment.heightScale,
        false, true
      );
    } else {
      // поставить в зависимости от главного, в меню
      this.mainFragment = fr;
      this.smoothResize(
        Fragment.widthScale, Fragment.heightScale,
        Fragment.widthPanel, Fragment.heightPanel,
        false, true
      );
    }
  }

  /**
   * Меняет относительные координаты у фрагментов группы для
   * нормального уменьшения / увеличения изображения при добавлении в группу
   *
   * @param double - 4 длины пазлины, понятные из их названий
   *
   * @param bool back - повторяет анимацию задонаперед
   *
   * @param bool append_cursor - стоит ли отталкиваться от местоположения курсора
   *
   */
  smoothResize(old_x, old_y, new_x, new_y, back = false, append_cursor = false) {
    // append_cursor для группы обрабатывается отдельно
    // в здешнем if-e, т.к. иначе у mainFragment изменятся координаты
    // и они не правильно посчитаются в дальнейшем у некоторых фрагментов
    // изображение сместится, баг
    // Другими словами, сначала требуется изменить размер всех пазлов,
    // а потом переместить их. Это происходит быстро и без видимых проблем
    this.fragments.forEach(function(fragment, ind, arr) {
      // false - append_cursor здесь не рассматривается из-за if-а дальше
      fragment.smoothResize(old_x, old_y, new_x, new_y, back, false);
    });
    if (append_cursor) {
      this.fragments.forEach(function(fragment, ind, arr) {
        var b_x = SelectFragmentHelper.deltaX * (1 - new_x / old_x);
        var b_y = SelectFragmentHelper.deltaY * (1 - new_y / old_y);
        fragment.smoothMove(fragment.x + b_x, fragment.y + b_y);
      });
    }
  }

  /**
   * Выделяет группу изменением размера
   *
   * @param back - bool, стоит ли возвращать анимацию назад
   *
   * @param charact - увеличить или уменьшить (-1, 1)
   *
   * @param scale - double, во сколько раз стоит уменьшить/увеличить изображение
   *
   */
  resizeSelect(this_gr=this, back=true, charact=-1,scale=0.95) {
    let maxDif = Math.max(this_gr.rightFragmentInd - this_gr.leftFragmentInd,
      this_gr.topFragmentInd - this_gr.bottomFragmentInd);
    let scaleForFragment = 1 - (1-scale)/maxDif;
    // формула для нормального изменения размера всей группы.
    // Если поставить scale, то при большой длине или высоте изменения размера
    // в пиксилях будут велики, а в данном случае они будут одинаковы.
    this_gr.fragments.forEach(function(fragment, ind, arr) {
      fragment.resizeSelect(back, charact, scaleForFragment);
    });
  }
}
