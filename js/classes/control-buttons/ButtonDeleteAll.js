class ButtonDeleteAll extends Button {
  static name = "delete-all";
  
  constructor() {
    super();
  }
  func() {
    super.func();
    console.log("All deleted");
  }
}
