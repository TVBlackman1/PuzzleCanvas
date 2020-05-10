class ButtonDelete extends Button {
  static name = "delete";

  constructor() {
    super();
  }
  func() {
    super.func();
    console.log("Deleted");
  }
}
