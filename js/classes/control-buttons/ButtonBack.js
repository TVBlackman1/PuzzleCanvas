class ButtonBack extends Button {
  constructor(name) {
    super(name);
  }
  func() {
    super.func();
    console.log("You left the game");
  }
}
