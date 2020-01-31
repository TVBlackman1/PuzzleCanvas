class ButtonMute extends Button {
  constructor(name) {
    super(name);
  }
  func() {
    super.func();
    console.log("Opponent has been muted");
  }
}
