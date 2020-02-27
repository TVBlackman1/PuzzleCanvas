class FragmentList {
  constructor() {
    this.firstVisualObject = null;
    this.lastVisualObject = null;
  }

  appendElem(element) {
    if (this.lastVisualObject == null) {
      // если нет последнего, то нет и первого, ибо инициализация проходит у обоих
      this.lastVisualObject = element;
      this.firstVisualObject = element;
    } else {
      // вставка
      this.lastVisualObject.next = element;
      element.prev = this.lastVisualObject;

      // замена понятия "последнего"
      this.lastVisualObject = element;
    }
    element.list = this;
  }
}
