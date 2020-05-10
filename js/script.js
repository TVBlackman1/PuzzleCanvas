/*
  Главный файл, управляющий работой канваса
  Здесь установлены слушатели, а так же глобальные функции отрисовки,
  скачивания изображений, работы с различными классами и типами данных и
  инициализация размеров всех компонентов канваса.

*/
function drawAll(canvas, context) {
    context.lineWidth = "1";

    context.clearRect(
        0, 0,
        canvas.canvas.width,
        canvas.canvas.height
    );
    context.beginPath();
    context.rect(
        0, 0,
        canvas.canvas.width,
        canvas.canvas.height
    );
    context.fillStyle = "#373737";
    context.fill();
    canvas.draw(context);
    canvas.panel.drawFragments(context);
    if (arr[SelectFragmentHelper.translatedFragmentId])
        // рисование выбранного фрагмента поверх всего, рисует повторно
        if (SelectFragmentHelper.translatedFragmentId >= 0) {
            let el = arr[SelectFragmentHelper.translatedFragmentId]
            let selected = (el.group != null) ? el.group : el;
            selected.draw(context);
        }

}

function initializeFragmentList(arr) {
    for (let i = 0; i < countImages; i++) {
        var x = i % imagesX;
        var y = Math.floor(i / imagesX);

        var leftId = i % imagesX - 1;
        var topId = i - imagesX;

        arr.push(
            new Fragment(
                i,
                DIRECTORY + "puzzle/" + (i + 1) + '.png',
                DIRECTORY + "puzzle/" + (i + 1) + '_.png',
                100, 100,
                (leftId >= 0 ? arr[i - 1] : null), (topId >= 0 ? arr[topId] : null),
                i
            )
        );

        canvas.panel.fragments[i] = i; // для заполнения порядка индексов
        // фрагментов у нижней панели

        // инициализация двусвязного списка фрагментов
        canvas.field.fragmentList.appendElem(new FragmentListElem(
            arr[arr.length - 1]
        ));
    }
}

function initializeSizes(fragment, img) {

    canvas.field.all_width = canvas.canvas.width * FIELD_WIDTH;
    canvas.field.all_height = canvas.canvas.height * FIELD_HEIGHT;

    fragment.init(img);

    canvas.field.init();
    canvas.panel.init();
    canvas.left_menu.init();

    // canvas.createBlankZones();

    for (let i = 0; i < countImages; i++) {
        // изначально уменьшены, т.к. окно тоже изначально уменьшено
        arr[i].current_width = Fragment.widthScale * canvas.field.scale;
        arr[i].current_height = Fragment.heightScale * canvas.field.scale;

        // устанавливает треть объекта в зависимости
        arr[i].current_third_x = arr[i].current_width / 5;
        arr[i].current_third_y = arr[i].current_height / 5;
    }
}

window.onload = async function () {

    console.log("Started");
    canvas = new Canvas("canvas-puzzle", countImages);
    canvas.initElements();

    let puzzleWorker = new PuzzleWorker(canvas);
    let room = await initializeSockets(puzzleWorker);
    let broadcaster = new Broadcaster(room);

    initializeFragmentList(arr);

    canvas.canvas.onmousedown = function (e) {
        var loc = canvas.getCoords(e.clientX, e.clientY);
        shouldConnect = true;
        if (canvas.panel.onmousedown(loc)) {
            console.log("!");
            return;
        }

        let iterFunction = function (lastSeenObject) {
            var value = lastSeenObject.value;
            var objInCoords = value.isHadPoint(loc.x, loc.y); // у группы или фрагмента
            if (objInCoords) {
                if (!value.smoothing && !value.isConnecting && !value.resizing) {
                    /*
                     * объект под мышкой, не выполняет анимацию и не подсоединяет к себе чужой объект одновременно
                     * если рассматривается группа фрагментов (FragmentGroup), то:
                     *  -- расчитывает расстояние от mainFragment группы, а потому
                     *  -- delta значения могут быть очень большими или даже отрицательными
                     *  -- взятым фрагментом в этом случае считается mainFragment группы
                     *
                     */

                    // не имеет смысла для групп, undefined для них, не выполняется
                    if (value.onBottomPanel) {
                        value.onBottomPanel = false;
                        value.moveToPanel();
                    }
                    value.connectedToCorner = false;
                    let ranges = value.mainFragment.rangeToStartImage(loc.x, loc.y);
                    SelectFragmentHelper.deltaX = ranges.x;
                    SelectFragmentHelper.deltaY = ranges.y;
                    SelectFragmentHelper.translatedFragmentId = value.mainFragment.ind;
                    lastSeenObject.replaceToTop(); // отображать поверх других объектов
                    return true; // если сработал объект - вернуть истину, обрабатывается далее
                }
            }
        }

        lastSeenObject = canvas.left_menu.fragmentList.lastVisualObject;
        if (lastSeenObject != null)
            do {
                // если этот объект подходит под условия, то цикл останавливается
                if (iterFunction(lastSeenObject))
                    break;
                lastSeenObject = lastSeenObject.prev;
            } while (lastSeenObject != null)

        // Если жмякаем по меню, то фрагменты далее не будут обрабатываться
        // т.е. из-под меню их не достать, собственно без проверки они достаются
        if (canvas.left_menu.isHadPoint(loc.x, loc.y))
            return;

        var lastSeenObject = canvas.field.fragmentList.lastVisualObject;
        if (lastSeenObject != null)
            do {
                // если этот объект подходит под условия, то цикл останавливается
                if (iterFunction(lastSeenObject))
                    break;
                lastSeenObject = lastSeenObject.prev;
            } while (lastSeenObject != null)

        // TODO выход из функции при выполнении верхнего блока
    }

    canvas.canvas.onmousemove = function (e) {
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

        canvas.panel.onmousemove(loc.x, loc.y);
        canvas.left_menu.onmousemove(loc.x, loc.y);
    };

    canvas.canvas.onmouseup = async function (e) {
        var loc = canvas.getCoords(e.clientX, e.clientY);

        canvas.left_menu.onmousemove(loc.x, loc.y);
        // проверка, если мы не двигали элемент, но под ним что-то изменилось
        // например, ушло меню в сторону или, наоборот, появилось

        if (SelectFragmentHelper.translatedFragmentId >= 0) {

            let wasOnMenu = ((arr[SelectFragmentHelper.translatedFragmentId].group != null) ?
                    arr[SelectFragmentHelper.translatedFragmentId].group :
                    arr[SelectFragmentHelper.translatedFragmentId]
            ).onMenu; // если спустилось с меню, запретить коннект
            canvas.checkMoveBetweenLists() // проверка на вхождение в зону меню + изменение состояния объектов
            var selectedFragment = arr[SelectFragmentHelper.translatedFragmentId];
            if (selectedFragment.group != null) {
                await selectedFragment.group.tryMoveBeetwenLists(selectedFragment);
            } else {
                await selectedFragment.tryMoveBeetwenLists();
            }

            let shouldConnectOnOtherSide = {res: false};
            if (selectedFragment.group == null && canvas.panel.isHadPoint(loc.x, loc.y)) {
                selectedFragment.onBottomPanel = true;
            } else if (shouldConnect) {
                let selected = (selectedFragment.group != null) ? selectedFragment.group : selectedFragment;
                if (!wasOnMenu)
                    shouldConnectOnOtherSide = selected.connectTo(); // проверка и дальнейшая попытка
            }
            broadcaster.broadcast('move', formExecutableTask(selectedFragment, shouldConnectOnOtherSide.res)); //formTask->sockets.js

            SelectFragmentHelper.translatedFragmentId = -1;
        }
    }

    canvas.canvas.onmousewheel = function (e) {
        // return;
        canvas.left_menu.onmousewheel(e.wheelDelta);
    }

    // document.addEventListener('mousedown', function(event) {
    //   if (lastDownTarget != event.target) {
    //     showSilhouette = false;
    //   }
    //   lastDownTarget = event.target;
    // }, false);

    document.addEventListener('keydown', function (event) {
        if (event.keyCode == KEY_shouldConnect) {
            if (shouldConnect)
                shouldConnect = false;
            else shouldConnect = true;
            console.log("shouldConnect is", shouldConnect);
        }
        if (event.keyCode == KEY_showSilhouette) {
            showSilhouette = true;
        }
        if (event.keyCode == 9) {
            canvas.left_menu.toogleMenu();
        }
        if (event.keyCode == 49) {
            canvas.field.normalDecrease();
            canvas.panel.show();
        }
        if (event.keyCode == 50) {
            canvas.field.normalIncrease();
            canvas.panel.hide();
        }
        if (event.keyCode == 51) {
            console.log(canvas.field.fragmentList.lastVisualObject.value.listElem);
        }
        if (event.keyCode == 52) {
            let gr = canvas.field.fragmentList.lastVisualObject.value;
            let fr = gr.mainFragment;
            // gr.smoothResize(
            //   fr.current_width, fr.current_height,
            //   Fragment.widthPanel, Fragment.heightPanel,
            //   false, true
            // );
            gr.smoothResize(
                fr.current_width, fr.current_height,
                fr.current_width * 0.8, fr.current_height * 0.8,
                false, true
            );
        }
    }, false);

    document.addEventListener('keyup', function (event) {
        if (event.keyCode == KEY_showSilhouette) {
            showSilhouette = false;
        }
    }, false);

    // Анимация с определённой частотой для обновления экрана
    setInterval(update, 1000 / FRAMES);
}

// Обновление экрана
function update() {
    drawAll(canvas, canvas.context);
}
