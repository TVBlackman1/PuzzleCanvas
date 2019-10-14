class FragmentList {
  constructor(value, prev) {
    this.value = value;
    this.prev = null;
    if (prev != null) {
      this.prev = prev;
      this.prev.next = this;
    }
    this.next = null;

    this.value.listElem = this;
  }

  remove() {
    if (this.prev != null) {
      if (this.next != null) {
        this.prev.next = this.next;
        this.next.prev = this.prev;
      }
    } else {
      ListObjectHelper.firstVisualObject = this.next;
    }
  }

  replaceToTop() {
    this.remove();
    if (ListObjectHelper.lastVisualObject !== this) {
      ListObjectHelper.lastVisualObject.next = this;
      this.prev = ListObjectHelper.lastVisualObject;
      this.next = null;
      ListObjectHelper.lastVisualObject = this;
    }
  }
}
