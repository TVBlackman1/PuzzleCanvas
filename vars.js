const FRAMES = 45;
const imagesX = 4;
const imagesY = 4;
const countImages = imagesX * imagesY;

const FIELD_WIDTH = 3 / 5; // Размеры поля
const FIELD_HEIGHT = 9 / 11; // Местоположение поля в Fragment.js -> (61, 62) строки

const KEY_showSilhouette = 83; // S
const KEY_shouldConnect = 32; // SPACE

const DIRECTORY = "images/";



// Вспомогательный объект, который необходим при удержании изображения мышью
// Способен определить индекс изображения в массиве, а так же запомнить
// Разницу между координатами курсора мыши и началом изображения в левом верхнем
// углу из метода "rangeToStartImage(x, y)" класса "Fragment"
let SelectFragmentHelper = {
  translatedFragmentId: -1,
  deltaX: 0,
  deltaY: 0
};


// Ссылки на первый, последний элементы двусвязного списка фрагментов или групп фрагментов для правильного
// отображения поверх остальных элементов на экране
let ListObjectHelper = {
  lastVisualObject: null,
  firstVisualObject: null
}

let FragmentsGeneralCharacteristic = {
  SCALE: -1,
  downloadedImages: 0,
  width: -1,
  height: -1,
  widthScale: -1,
  heightScale: -1,
  third_x: -1,
  third_y: -1,
  connectRange: -1,

  widthPanel: -1,
  heightPanel: -1,
  third_xPanel: -1,
  third_yPanel: -1
};

let MainFieldCharacteristic = {
  all_width: -1,
  all_height: -1,
  width: -1,
  height: -1,
  lastX: -1,
  lastY: -1,
  firstX: -1,
  firstY: -1,
};

let BottomPanel = {
  height: 120,
  width: 900,
  firstX: 200,
  firstY: 900,
  lastX: -1,
  lastY: -1,
  buttonWidth: 90,
  paddingX: 0,
  paddingY: 0,
  mainWidth: -1,
  fragmentsCount: -1,
  fragmentSpace: -1,
  lists: -1,
  list: 1

};


// Массив для изображений
arr = [];
arrButtons = [];

var lastDownTarget = null;
var shouldConnect = false;
var showSilhouette = false;
var panel = undefined;
