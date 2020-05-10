/*
 * Отрисовочный единый элемент.
 * Идея состоит в том, что отрисовываются элементы слоями, но слои у разных
 * групп фрагментов могут быть разными, а при взятии одного из них
 * чередование этих слоёв может измениться.
 *
 * Потому создан двусвязный список FragmentList, в котором объявлены ссылки
 * на начальные, конечные FragmentListElem.
 * Здесь быстро удаляются группы фрагментов в середине списка
 * и быстро добавляются в конец
 *
 * Используется 2 FragmentList, поэтому хранится элемент list
 */

class FragmentListElem {
  constructor(value) {
    this.value = value;
    this.prev = null;
    this.next = null;
    this.value.listElem = this;
    this.list = null; // заполняется из FragmentList.appendElem(element)
  }

  remove() {
    let text = this.value.onMenu ? "menu" : "field";
    // console.log("Удаляем элемент", text, this.list);

    if (this.prev != null) {
      if (this.next != null) {
        // середина
        this.prev.next = this.next;
        this.next.prev = this.prev;
      } else if (this.next == null) {
        // конец
        this.list.lastVisualObject = this.prev;
        this.prev.next = null;
      }
    } else {
      // начало
      if (this.next != null) {
        this.list.firstVisualObject = this.next;
        this.next.prev = null;
      } else {
        // единственный элемент в списке
        this.list.firstVisualObject = null;
        this.list.lastVisualObject = null;
      }
    }
  }

  replaceToTop() {
    if (this.list.lastVisualObject === this) {
      return;
    }

    this.remove();
    if (this.list.lastVisualObject !== this) {
      this.list.lastVisualObject.next = this;
      this.prev = this.list.lastVisualObject;
      this.next = null;
      this.list.lastVisualObject = this;
    }

  }
}
