const FRAMES = 45;
const imagesX = 4;
const imagesY = 4;
const countImages = imagesX*imagesY;

const KEY_showSilhouette = 83; // S
const KEY_shouldConnect = 32; // SPACE

const DIRECTORY = "images/"

var downloadedImages = 0;


// Вспомогательный объект, который необходим при удержании изображения мышью
// Способен определить индекс изображения в массиве, а так же запомнить
// Разницу между координатами курсора мыши и началом изображения в левом верхнем
// углу из метода "rangeToStartImage(x, y)" класса "Fragment"
var SelectFragmentHelper = {
  translatedFragmentId: -1,
  deltaX: 0,
  deltaY: 0
};

var FragmentsGeneralCharacteristic = {
  SCALE: -1,
  downloadedImages: 0,
  width: -1,
  height: -1,
  widthScale: -1,
  heightScale: -1,
  third_x: -1,
  third_y: -1,
  connectRange: -1
}

var CanvasCharacteristic = {
  all_width: -1,
  all_height: -1,
  width: -1,
  height: -1,
  lastX: -1,
  lastY: -1,
  firstX: -1,
  firstY: -1,
}


// Массив для изображений
arr = [];

// Функция для очистки экрана и вывода всех элементов
// Работает с определённой частотой
function drawAll() {
  context.clearRect(0,
    0,
    canvas.width,
    canvas.height
  );
  context.beginPath();
  context.rect(
    CanvasCharacteristic.firstX,
    CanvasCharacteristic.firstY,
    CanvasCharacteristic.width,
    CanvasCharacteristic.height
  );
  context.lineWidth = "10";
  context.strokeStyle = "green";
  context.stroke();
  context.beginPath();
  context.rect(
    CanvasCharacteristic.firstX,
    CanvasCharacteristic.firstY,
    CanvasCharacteristic.width,
    CanvasCharacteristic.height
  );
  context.lineWidth = "10";
  context.strokeStyle = "green";
  context.stroke();
  for (i = 0; i < arr.length; i++) {
    arr[i].draw();
  }
}

// Не рабочая функция
function getColor(x, y) {
  context.getImageData(x, y, 1, 1).data
}

// Определяет координаты пользователя в границах canvas
function getCoords(canvas, x, y) {
  var bbox = canvas.getBoundingClientRect();
  return {
    x: (x - bbox.left) * (canvas.width / bbox.width),
    y: (y - bbox.top) * (canvas.height / bbox.height)
  };
}
//рандом чисел
function getRandomArbitary(min, max) {
  return Math.ceil(Math.random() * (max - min) + min);
}
// При загрузке экрана

var lastDownTarget = null;
var shouldConnect = false;
var showSilhouette = false;
window.onload = function() {

  console.log("Started");
  canvas = document.getElementById("canvas-puzzle");
  context = canvas.getContext('2d');

  CanvasCharacteristic.all_width = canvas.width / 3*2; // ЗАМЕНИТЬ
  CanvasCharacteristic.all_height = canvas.height; // ЗАМЕНИТЬ
  CanvasCharacteristic.firstX = 0;
  CanvasCharacteristic.firstY = 0;

  // Заполнение массива изображениями
  for (i = 0; i < countImages; i++) {
    x = i % imagesX;
    y = Math.floor(i / imagesY);

    leftId = i % imagesX - 1; // ИСПРАВЛЕНИЕ БАГА в todoist (leftId = i - 1;)
    topId = i - imagesY;

    console.log(i, x, y, leftId, topId);
    // console.log(getRandomArbitary(0, 1900));
    //getRandomArbitary(320,1520), getRandomArbitary(280,880),
    arr.push(
      new Fragment(
        DIRECTORY + (i + 1) + '.png',
        getRandomArbitary(1940, 3020), getRandomArbitary(80, 880),
        (leftId >= 0 ? arr[i - 1] : null), (topId >= 0 ? arr[topId] : null)  // ЗАМЕНИТЬ
      )
    );
  }


  // Отслеживать перемещение курсора мыши
  canvas.onmousemove = function(e) {
    var loc = getCoords(canvas, e.clientX, e.clientY);
    if (SelectFragmentHelper.translatedFragmentId >= 0) {
      arr[SelectFragmentHelper.translatedFragmentId].move(loc.x - SelectFragmentHelper.deltaX,
        loc.y - SelectFragmentHelper.deltaY);
    }
  };

  // Отслеживать нажатие на кнопки мыши
  canvas.onmousedown = function(e) {
    shouldConnect = true;
    for (i = arr.length - 1; i >= 0; i--) {
      var loc = getCoords(canvas, e.clientX, e.clientY);
      if (arr[i].isHadPoint(loc.x, loc.y)) {
        ranges = arr[i].rangeToStartImage(loc.x, loc.y);
        SelectFragmentHelper.deltaX = ranges.x;
        SelectFragmentHelper.deltaY = ranges.y;
        SelectFragmentHelper.translatedFragmentId = i;
        console.log("Image number", SelectFragmentHelper.translatedFragmentId);
        break;
      }
    }
  }


  // Отслеживать отжатие кнопок мыши
  canvas.onmouseup = function(e) {
    if (SelectFragmentHelper.translatedFragmentId >= 0) {
      selectedFragment = arr[SelectFragmentHelper.translatedFragmentId];
      leftFragment = selectedFragment.left;
      rightFragment = selectedFragment.right;
      topFragment = selectedFragment.top;
      bottomFragment = selectedFragment.bottom;

      // координатный номер пазла
      i = SelectFragmentHelper.translatedFragmentId;
      x = i % imagesX;
      y = Math.floor(i / imagesY);
      if (shouldConnect) {
        try {
          console.log(selectedFragment);
        } catch {}
        if (x == 0 && y == 0 && arr[i].rangeFromLeftTop(CanvasCharacteristic.firstX, CanvasCharacteristic.firstY) <= FragmentsGeneralCharacteristic.connectRange) {
          console.log("!");
          selectedFragment.smoothMove(
            CanvasCharacteristic.firstX - FragmentsGeneralCharacteristic.third_x,
            CanvasCharacteristic.firstY - FragmentsGeneralCharacteristic.third_y
          );
        } else if (x == imagesX - 1 && y == 0 && arr[i].rangeFromRightTop(CanvasCharacteristic.lastX, CanvasCharacteristic.firstY) <= FragmentsGeneralCharacteristic.connectRange) {
          console.log("!");
          selectedFragment.smoothMove(
            CanvasCharacteristic.lastX + FragmentsGeneralCharacteristic.third_x - FragmentsGeneralCharacteristic.widthScale,
            CanvasCharacteristic.firstY -FragmentsGeneralCharacteristic.third_y
          );
        } else if (x == imagesX - 1 && y == imagesY - 1 && arr[i].rangeFromRightBottom(CanvasCharacteristic.lastX, CanvasCharacteristic.lastY) <= FragmentsGeneralCharacteristic.connectRange) {
          console.log("!");
          selectedFragment.smoothMove(
            CanvasCharacteristic.lastX + FragmentsGeneralCharacteristic.third_x - FragmentsGeneralCharacteristic.widthScale,
            CanvasCharacteristic.lastY + FragmentsGeneralCharacteristic.third_y - FragmentsGeneralCharacteristic.heightScale
          );
        } else if (x == 0 && y == imagesY - 1 && arr[i].rangeFromLeftBottom(CanvasCharacteristic.firstX, CanvasCharacteristic.lastY) <= FragmentsGeneralCharacteristic.connectRange) {
          console.log("!");
          selectedFragment.smoothMove(
            CanvasCharacteristic.firstX - FragmentsGeneralCharacteristic.third_x,
            CanvasCharacteristic.lastY + FragmentsGeneralCharacteristic.third_y - FragmentsGeneralCharacteristic.heightScale
          );
        } else if (topFragment != null && topFragment.canConnectBottomFragment()) {
          coords = topFragment.leftBot();
          x = coords.x;
          y = coords.y;

          selectedFragment.smoothMove(
            x - FragmentsGeneralCharacteristic.third_x,
            y - FragmentsGeneralCharacteristic.third_y
          );
        } else if (leftFragment != null && leftFragment.canConnectRightFragment()) {
          console.log("canConnectRightFragment");
          coords = leftFragment.rightTop();
          x = coords.x;
          y = coords.y;

          selectedFragment.smoothMove(
            x - FragmentsGeneralCharacteristic.third_x,
            y - FragmentsGeneralCharacteristic.third_y
          );
        } else if (bottomFragment != null && bottomFragment.canConnectTopFragment()) {
          console.log("canConnectTopFragment");
          coords = bottomFragment.leftTop();
          x = coords.x;
          y = coords.y;

          selectedFragment.smoothMove(
            x - FragmentsGeneralCharacteristic.third_x,
            y - FragmentsGeneralCharacteristic.heightScale + FragmentsGeneralCharacteristic.third_y
          );
        } else if (rightFragment != null && rightFragment.canConnectLeftFragment()) {
          coords = rightFragment.leftTop();
          x = coords.x;
          y = coords.y;

          selectedFragment.smoothMove(
            x - FragmentsGeneralCharacteristic.widthScale + FragmentsGeneralCharacteristic.third_x,
            y - FragmentsGeneralCharacteristic.third_y
          );
        }
      }

      SelectFragmentHelper.translatedFragmentId = -1;

    }
  }

  document.addEventListener('mousedown', function(event) {
    if(lastDownTarget != event.target) {
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
  drawAll();
}
