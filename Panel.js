// init in Fragment.js

class Panel {
  constructor(imagesCount) {
    this.leftButton = new PanelButton(-1, function() {
      return BottomPanel.firstX
    })

    this.rightButton = new PanelButton(1, function() {
      return BottomPanel.lastX - BottomPanel.buttonWidth
    })
    this.buttons = [this.leftButton, this.rightButton]
    this.fragments = [];
    this.fragments.length = imagesCount;
  }

  isHadPoint(x, y) {
    return (
      x >= BottomPanel.firstX && x <= BottomPanel.firstX + BottomPanel.width &&
      y >= BottomPanel.firstY && y <= BottomPanel.firstY + BottomPanel.height
    )
  }

  onmousedown(loc) {
    for (var i = 0; i < this.buttons.length; i++) {
      if (this.buttons[i].isHadPoint(loc.x, loc.y)) {
        console.log("Button pressed");
        this.buttons[i].func();
        return true;
      }
    }
    return false;

  }

  draw(context) {
    context.beginPath();
    context.rect(
      BottomPanel.firstX,
      BottomPanel.firstY,
      BottomPanel.width,
      BottomPanel.height
    );
    context.strokeStyle = "blue";
    context.stroke();

    for (var i = 0; i < this.buttons.length; i++) {
      this.buttons[i].draw(context);
    }

    var start = BottomPanel.fragmentsCount * (BottomPanel.list - 1);
    var end = BottomPanel.fragmentsCount * BottomPanel.list;
    if(BottomPanel.list == BottomPanel.lists) {
      end = start + this.fragments.length % BottomPanel.fragmentsCount;
    }
    for(var i = start; i < end; i++) {
      var fr = arr[this.fragments[i]];
      context.drawImage(
      fr.img,
        BottomPanel.firstX + BottomPanel.buttonWidth + BottomPanel.paddingX + (BottomPanel.fragmentSpace + FragmentsGeneralCharacteristic.widthPanel) * (
          i % BottomPanel.fragmentsCount),
        BottomPanel.firstY + BottomPanel.paddingY,
        FragmentsGeneralCharacteristic.widthPanel,
        FragmentsGeneralCharacteristic.heightPanel
      );

      if (!fr.onBottomPanel) {
        // изобразить маску, если объект не на панели
        context.beginPath();
        context.fillStyle = "rgba(255,255,255,0.5)";
        context.rect(
          BottomPanel.firstX + BottomPanel.buttonWidth + BottomPanel.paddingX + (BottomPanel.fragmentSpace + FragmentsGeneralCharacteristic.widthPanel) * (
            i % BottomPanel.fragmentsCount),
          BottomPanel.firstY + BottomPanel.paddingY,
          FragmentsGeneralCharacteristic.widthPanel,
          FragmentsGeneralCharacteristic.heightPanel
        );
        context.fill();
      }
    }
  }
}
