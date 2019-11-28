function drawAll(canvas, context) {
  context.lineWidth = "1";

  context.clearRect(0,
    0,
    canvas.width,
    canvas.height
  );


  context.beginPath();
  context.rect(
    MainFieldCharacteristic.firstX,
    MainFieldCharacteristic.firstY,
    MainFieldCharacteristic.all_width,
    MainFieldCharacteristic.all_height
  );
  context.strokeStyle = "red";
  context.stroke();


  context.beginPath();
  context.rect(
    MainFieldCharacteristic.firstX,
    MainFieldCharacteristic.firstY,
    MainFieldCharacteristic.width,
    MainFieldCharacteristic.height
  );
  context.strokeStyle = "green";
  context.stroke();


  var lastSeenObject = ListObjectHelper.firstVisualObject;
  do {
    lastSeenObject.value.draw();
    lastSeenObject = lastSeenObject.next;
  } while (lastSeenObject != null)


  context.beginPath();
  context.rect(
    BottomPanel.firstX,
    BottomPanel.firstY,
    BottomPanel.width,
    BottomPanel.height
  );
  context.strokeStyle = "blue";
  context.stroke();

  for (var i = 0; i < arrButtons.length; i++) {
    arrButtons[i].draw();
  }


  // console.log(BottomPanel.fragmentsCount);
  // for(var i = 0; i < BottomPanel.fragmentsCount; i++) {
  //   context.beginPath();
  //   context.rect(
  //     BottomPanel.firstX + BottomPanel.buttonWidth + BottomPanel.paddingX + (BottomPanel.fragmentSpace + FragmentsGeneralCharacteristic.widthPanel) * i,
  //     BottomPanel.firstY + BottomPanel.paddingY,
  //     FragmentsGeneralCharacteristic.widthPanel,
  //     FragmentsGeneralCharacteristic.heightPanel
  //   );
  //   context.lineWidth = "3";
  //   context.strokeStyle = "black";
  //   context.stroke();
  // }

}

function initializeFragmentList(arr) {
  for (i = 0; i < countImages; i++) {
    var x = i % imagesX;
    var y = Math.floor(i / imagesY);

    var leftId = i % imagesX - 1;
    var topId = i - imagesY;

    arr.push(
      new Fragment(
        i,
        DIRECTORY + (i + 1) + '.png',
        100, 100,
        (leftId >= 0 ? arr[i - 1] : null), (topId >= 0 ? arr[topId] : null),
        i
      )
    );

    if (ListObjectHelper.lastVisualObject == null) {
      ListObjectHelper.lastVisualObject = new FragmentList(arr[arr.length - 1], null);
      ListObjectHelper.firstVisualObject = ListObjectHelper.lastVisualObject;
    } else {
      ListObjectHelper.lastVisualObject = new FragmentList(arr[arr.length - 1], ListObjectHelper.lastVisualObject);
    }
  }
}

function getCoords(canvas, x, y) {
  var bbox = canvas.getBoundingClientRect();
  return {
    x: (x - bbox.left) * (canvas.width / bbox.width),
    y: (y - bbox.top) * (canvas.height / bbox.height)
  };
}

function getRandomArbitary(min, max) {
  return Math.ceil(Math.random() * (max - min) + min);
}


window.onload = function() {

  console.log("Started");
  canvas = document.getElementById("canvas-puzzle");
  context = canvas.getContext('2d');

  MainFieldCharacteristic.all_width = canvas.width * FIELD_WIDTH;
  MainFieldCharacteristic.all_height = canvas.height * FIELD_HEIGHT;
  initializeFragmentList(arr);

  arrButtons.push(new PanelButton(-1, function() { // функция для получения, т.к. соответствующие переменные объявлены позже
    return BottomPanel.firstX
  }));
  arrButtons.push(new PanelButton(1, function() {
    return BottomPanel.lastX - BottomPanel.buttonWidth
  }));


  canvas.onmousemove = function(e) {
    var loc = getCoords(canvas, e.clientX, e.clientY);
    if (SelectFragmentHelper.translatedFragmentId >= 0) {
      if (arr[SelectFragmentHelper.translatedFragmentId].group == null) {
        arr[SelectFragmentHelper.translatedFragmentId].move(loc.x - SelectFragmentHelper.deltaX,
          loc.y - SelectFragmentHelper.deltaY);
      } else if (arr[SelectFragmentHelper.translatedFragmentId].group != null) {
        var newX = loc.x - SelectFragmentHelper.deltaX;
        var newY = loc.y - SelectFragmentHelper.deltaY;
        arr[SelectFragmentHelper.translatedFragmentId].group.move(
          newX, newY,
          arr[SelectFragmentHelper.translatedFragmentId]
        );
      }
    }
  };

  canvas.onmousedown = function(e) {
    shouldConnect = true;

    var loc = getCoords(canvas, e.clientX, e.clientY);
    for (var i = 0; i < arrButtons.length; i++) {
      console.log("!");
      if (arrButtons[i].isHadPoint(loc.x, loc.y)) {
        console.log("!!!");
        arrButtons[i].func();
        return;
      }
    }


    var lastSeenObject = ListObjectHelper.lastVisualObject;
    do {
      var objInCoords = lastSeenObject.value.isHadPoint(loc.x, loc.y); // у группы или фрагмента
      if (lastSeenObject.value instanceof Fragment) {
        if (objInCoords) {
          if (
            lastSeenObject.value.smoothing == false &&
            lastSeenObject.value.isConnecting == false &&
            (lastSeenObject.value.group == null || lastSeenObject.value.group.isConnecting == false)
          ) {
            // объект под мышкой, не выполняет анимацию и не подсоединяет к себе чужой объект одновременно
            if (lastSeenObject.value.onBottomPanel) {
              lastSeenObject.value.onBottomPanel = false;
              lastSeenObject.value.moveToPanel();

            }
              ranges = lastSeenObject.value.rangeToStartImage(loc.x, loc.y);
              SelectFragmentHelper.deltaX = ranges.x;
              SelectFragmentHelper.deltaY = ranges.y;
              SelectFragmentHelper.translatedFragmentId = lastSeenObject.value.ind;
              lastSeenObject.replaceToTop(); // отображать поверх других объектов
            console.log("Image number", SelectFragmentHelper.translatedFragmentId);
            break;
          }
        }
      } else if (lastSeenObject.value instanceof FragmentGroup) {
        if (objInCoords > -1) {
          if (
            arr[objInCoords].smoothing == false &&
            arr[objInCoords].isConnecting == false &&
            lastSeenObject.value.isConnecting == false
          ) {
            // объект под мышкой, не выполняет анимацию и не подсоединяет к себе чужой объект одновременно
            ranges = arr[objInCoords].rangeToStartImage(loc.x, loc.y);
            SelectFragmentHelper.deltaX = ranges.x;
            SelectFragmentHelper.deltaY = ranges.y;
            SelectFragmentHelper.translatedFragmentId = objInCoords;
            lastSeenObject.replaceToTop(); // отображать поверх других объектов
            console.log("Image number", SelectFragmentHelper.translatedFragmentId);
            break;
          }
        }
      }
      lastSeenObject = lastSeenObject.prev;
    } while (lastSeenObject != null)
  }


  canvas.onmouseup = function(e) {
    if (SelectFragmentHelper.translatedFragmentId >= 0) {
      var selectedFragment = arr[SelectFragmentHelper.translatedFragmentId];
      var loc = getCoords(canvas, e.clientX, e.clientY);
      if(selectedFragment.group == null && panel.isHadPoint(loc.x, loc.y)) {
        selectedFragment.onBottomPanel = true;
      }
      if (shouldConnect) {
        if (selectedFragment.group == null) {
          selectedFragment.connectToOther();
        } else {
          selectedFragment.group.connectTo()
        }
      }
      SelectFragmentHelper.translatedFragmentId = -1;
    }
  }

  document.addEventListener('mousedown', function(event) {
    if (lastDownTarget != event.target) {
      showSilhouette = false;
    }
    lastDownTarget = event.target;
  }, false);

  document.addEventListener('keydown', function(event) {
    if (lastDownTarget == canvas) {
      if (event.keyCode == KEY_shouldConnect) {
        if (shouldConnect)
          shouldConnect = false;
        else shouldConnect = true;
        console.log("shouldConnect is", shouldConnect);
      }
      if (event.keyCode == KEY_showSilhouette) {
        showSilhouette = true;
      }
      if (event.keyCode == 49) {
        var lastSeenObject = ListObjectHelper.lastVisualObject;
        do {
          console.log(lastSeenObject);
          lastSeenObject = lastSeenObject.prev;
        } while (lastSeenObject != null)
        console.log("\nEND\n")
      }

      if (event.keyCode == 50) {
        console.log(ListObjectHelper.firstVisualObject);
        console.log(ListObjectHelper.lastVisualObject);
      }
    }
  }, false);

  document.addEventListener('keyup', function(event) {
    if (lastDownTarget == canvas) {
      if (event.keyCode == KEY_showSilhouette) {
        showSilhouette = false;
      }
    }
  }, false);

  // Анимация с определённой частотой для обновления экрана
  setInterval(update, 1000 / FRAMES);

}

// Функция для анимации с определённой частотой для обновления экрана
function update() {
  drawAll(canvas, context);
}
