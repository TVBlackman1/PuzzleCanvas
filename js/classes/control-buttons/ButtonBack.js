class ButtonBack extends Button {
  static name = "back";
  
  constructor() {
    super();
  }
  func() {
    super.func();
    console.log("You left the game");
  }
}
