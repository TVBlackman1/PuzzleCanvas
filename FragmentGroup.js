class FragmentGroup {
  constructor(src, x, y, left, top) {
    this.fragments = new Set();
  }

  getFragmentsCopy() {
    var copied = new Set();
    this.fragments.forEach(function(fragment, ind, arr) { // ЕЛЕ РАБОЧАЯ ХУЕТА
      copied.add(fragment);
    });
    return copied;
  }

  move(x, y, selected) {
    this.fragments.forEach(function(fragment, ind, arr) { // ЕЛЕ РАБОЧАЯ ХУЕТА
      if (fragment !== selected) {
        fragment.move(
          x - selected.x + fragment.x,
          y - selected.y + fragment.y
        )
      }
    });
    selected.move(x, y);
  }

  smoothMove(x, y, selected) {
    this.fragments.forEach(function(fragment, ind, arr) { // ЕЛЕ РАБОЧАЯ ХУЕТА
      if (fragment !== selected) {
        fragment.smoothMove(
          x - selected.x + fragment.x,
          y - selected.y + fragment.y
        )
      }
    });
    selected.smoothMove(x, y);
  }

  changeGroup(newGroup) {
    this.fragments.forEach(function(fragment, ind, arr) { // ЕЛЕ РАБОЧАЯ ХУЕТА
      fragment.group = newGroup;
      newGroup.fragments.add(fragment);
    });
  }

  connectTo() {
    // нужно сделать копию, потому что в Fragment.js другие фрагменты добавятся к этому классу и пройдут в цикл,
    // а они могут конектиться к другим и так всё сломается к хуям

    // копия нахуй не нужна, если к ним не конектиться, а только их проверять. Конект потом
    // второй аргумент проверяет
    var minRange = -1;
    var minFragment = null;
    this.fragments.forEach(function(fragment, ind, arr) { // ЕЛЕ РАБОЧАЯ ХУЕТА
      var res = fragment.connectToOther(fragment.ind, false);
      if (res.res) {
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
      minFragment.connectToOther(minFragment.ind);

  }
}
