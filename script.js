function drawAll(canvas, context) {
  context.lineWidth = "1";

  context.clearRect(0,
    0,
    canvas.width,
    canvas.height
  );


  // context.beginPath();
  // context.rect(
  //   MainFieldCharacteristic.firstX,
  //   MainFieldCharacteristic.firstY,
  //   MainFieldCharacteristic.all_width,
  //   MainFieldCharacteristic.all_height
  // );
  // context.strokeStyle = "red";
  // context.stroke();


  context.beginPath();
  context.rect(
    MainFieldCharacteristic.firstX,
    MainFieldCharacteristic.firstY,
    MainFieldCharacteristic.width,
    MainFieldCharacteristic.height
  );
  context.strokeStyle = "green";
  context.stroke();

  panel.draw(context);

  var lastSeenObject = ListObjectHelper.firstVisualObject;
  do {
    lastSeenObject.value.draw(context);
    lastSeenObject = lastSeenObject.next;
  } while (lastSeenObject != null)

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

    panel.fragments[i] = i;
    console.log(panel.fragments[i]);

    if (ListObjectHelper.lastVisualObject == null) {
      ListObjectHelper.lastVisualObject = new FragmentList(arr[arr.length - 1], null);
      ListObjectHelper.firstVisualObject = ListObjectHelper.lastVisualObject;
    } else {
      ListObjectHelper.lastVisualObject = new FragmentList(arr[arr.length - 1], ListObjectHelper.lastVisualObject);
    }
  }
}

function initializeSizesByImageSize(fragment) {
  MainFieldCharacteristic.all_width = canvas.canvas.width * FIELD_WIDTH;
  MainFieldCharacteristic.all_height = canvas.canvas.height * FIELD_HEIGHT;

  FragmentsGeneralCharacteristic.width = fragment.width;
  FragmentsGeneralCharacteristic.height = fragment.height;

  FragmentsGeneralCharacteristic.SCALE = (
    Math.min(
      MainFieldCharacteristic.all_width / (imagesX / 5 * 3) / FragmentsGeneralCharacteristic.width,
      MainFieldCharacteristic.all_height / (imagesY / 5 * 3) / FragmentsGeneralCharacteristic.height
    )
  );
  FragmentsGeneralCharacteristic.widthScale = Math.floor(FragmentsGeneralCharacteristic.SCALE * FragmentsGeneralCharacteristic.width);
  FragmentsGeneralCharacteristic.heightScale = Math.floor(FragmentsGeneralCharacteristic.SCALE * FragmentsGeneralCharacteristic.height);

  FragmentsGeneralCharacteristic.third_x = FragmentsGeneralCharacteristic.widthScale / 5;
  FragmentsGeneralCharacteristic.third_y = FragmentsGeneralCharacteristic.heightScale / 5;

  FragmentsGeneralCharacteristic.connectRange = 2 * Math.min(
    FragmentsGeneralCharacteristic.third_x,
    FragmentsGeneralCharacteristic.third_y
  );
  // ДЛИНА КОННЕКТ-РАССТОЯНИЯ

  MainFieldCharacteristic.width = FragmentsGeneralCharacteristic.widthScale / 5 * 3 * imagesX;
  MainFieldCharacteristic.height = FragmentsGeneralCharacteristic.heightScale / 5 * 3 * imagesY;

  MainFieldCharacteristic.firstX = canvas.canvas.width / 2 - MainFieldCharacteristic.width / 2; // ИЗМЕНИТЬ ДЛЯ МЕСТОПОЛОЖЕНИЯ ОКНА СБОРКИ
  MainFieldCharacteristic.firstY = 40; // ИЗМЕНИТЬ ДЛЯ МЕСТОПОЛОЖЕНИЯ ОКНА СБОРКИ

  MainFieldCharacteristic.lastX = MainFieldCharacteristic.firstX + MainFieldCharacteristic.width;
  MainFieldCharacteristic.lastY = MainFieldCharacteristic.firstY + MainFieldCharacteristic.height;


  BottomPanel.width = MainFieldCharacteristic.width * 1.6; // ШИРИНА ПАНЕЛИ
  BottomPanel.firstX = canvas.canvas.width / 2 - BottomPanel.width / 2; // МЕСТОПОЛОЖЕНИЕ ПАНЕЛИ
  BottomPanel.firstY = MainFieldCharacteristic.lastY + 15; // МЕСТОПОЛОЖЕНИЕ ПАНЕЛИ
  BottomPanel.lastX = BottomPanel.firstX + BottomPanel.width;
  BottomPanel.lastY = BottomPanel.firstY + BottomPanel.height;
  BottomPanel.mainWidth = BottomPanel.width - 2 * BottomPanel.buttonWidth - 2 * BottomPanel.paddingX;

  FragmentsGeneralCharacteristic.heightPanel = BottomPanel.height - 2 * BottomPanel.paddingY;
  FragmentsGeneralCharacteristic.widthPanel = FragmentsGeneralCharacteristic.heightPanel / FragmentsGeneralCharacteristic.height * FragmentsGeneralCharacteristic.width;
  BottomPanel.fragmentsCount = Math.floor(BottomPanel.mainWidth / FragmentsGeneralCharacteristic.widthPanel);
  BottomPanel.fragmentSpace = (BottomPanel.mainWidth - BottomPanel.fragmentsCount * FragmentsGeneralCharacteristic.widthPanel) / (BottomPanel.fragmentsCount - 1);

  BottomPanel.lists = Math.floor(countImages / BottomPanel.fragmentsCount) + 1
}

// function getRandomArbitary(min, max) {
//   return Math.ceil(Math.random() * (max - min) + min);
// }


window.onload = function() {

  console.log("Started");
  canvas = new Canvas("canvas-puzzle");
  panel = new Panel(countImages);
  initializeFragmentList(arr);

  canvas.canvas.onmousemove = function(e) {
    var loc = canvas.getCoords(e.clientX, e.clientY);
    if (SelectFragmentHelper.translatedFragmentId >= 0) {
      var newX = loc.x - SelectFragmentHelper.deltaX;
      var newY = loc.y - SelectFragmentHelper.deltaY;
      if (arr[SelectFragmentHelper.translatedFragmentId].group == null) {
        arr[SelectFragmentHelper.translatedFragmentId].move(newX, newY);

      } else if (arr[SelectFragmentHelper.translatedFragmentId].group != null) {
        arr[SelectFragmentHelper.translatedFragmentId].group.move(
          newX, newY,
          arr[SelectFragmentHelper.translatedFragmentId]
        );
      }
    }
  };

  canvas.canvas.onmousedown = function(e) {
    shouldConnect = true;

    var loc = canvas.getCoords(e.clientX, e.clientY);

    // если панель существует и нажата клавиша - не обрабатывать пазлы
    if (panel.onmousedown(loc)) {
      return;
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


  canvas.canvas.onmouseup = function(e) {
    if (SelectFragmentHelper.translatedFragmentId >= 0) {
      var loc = canvas.getCoords(e.clientX, e.clientY);
      var selectedFragment = arr[SelectFragmentHelper.translatedFragmentId];

      if (selectedFragment.group == null && panel.isHadPoint(loc.x, loc.y)) {
        selectedFragment.onBottomPanel = true;
      }

      if (shouldConnect) {
        ListObjectHelper.lastVisualObject.value.connectTo();
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
    if (lastDownTarget == canvas.canvas) {
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
    if (lastDownTarget == canvas.canvas) {
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
  drawAll(canvas.canvas, canvas.context);
}
