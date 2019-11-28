function mousedown() {
  shouldConnect = true;

  var loc = getCoords(canvas, e.clientX, e.clientY);
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
          var ranges = lastSeenObject.value.rangeToStartImage(loc.x, loc.y);
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
          var ranges = arr[objInCoords].rangeToStartImage(loc.x, loc.y);
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
