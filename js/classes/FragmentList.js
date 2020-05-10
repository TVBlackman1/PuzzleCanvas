class FragmentList {
  constructor() {
    this.firstVisualObject = null;
    this.lastVisualObject = null;
  }

  appendElem(element) {
    // очистка на случай получения объекта из другого FragmentList
    element.prev = null;
    element.next = null;
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
