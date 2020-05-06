// Возможно стоит убрать подключение к smoothing объекту. а то проблем слишком дохуя??
// на заметку, потом посмотрим - Михаил

// Давно уже убрал, но комент забавный я оставил, пусть будет на память как и "var hello = 4"
// Шёл третий месяц, а мне до сих пор смешно - Никита

var hello = 4; // - Атаман Кирилл
class Fragment extends Component {
    static SCALE = -1;
    static downloadedImages = 0;
    static width = -1;
    static height = -1;
    static widthScale = -1;
    static heightScale = -1;
    static third_x = -1;
    static third_y = -1;
    static connectRange = -1;

    static widthPanel = -1;
    static heightPanel = -1;
    static third_xPanel = -1;
    static third_yPanel = -1;
    static widthWithoutSpacesPanel = -1;
    static heightWithoutSpacesPanel = -1;

    constructor(ind, src, srcBorder, x, y, left, top, bottomInd) {
        super();
        this.src = src; // путь до изображения пазла
        this.srcB = srcBorder; // путь до изображения с границами изображения
        this.x = x;
        this.y = y;

        // необходимо для вычисления нового положения при изменении размера элементов группы
        this.menuDX = 0; // расстояние от главного фрагмента в группе до текущего по X
        this.menuDY = 0; // расстояние от главного фрагмента в группе до текущего по Y
        this.img = new Image(); // изображение фрагмента
        this.imgB = new Image(); // image-border
        this.current_width = -1;
        this.current_height = -1;

        this.mainFragment = this; // для поддержки алгоритмов по работе с группами

        this.downloadImage();

        this.img.src = this.src;
        this.imgB.src = this.srcB;
        this.ind = ind;
        this.connectedToCorner = false;
        this.onBottomPanel = true;
        this.onMenu = false;
        this.onMenuLast = false; // проверка на нахождение в меню, выполненная ранее
        // нужна для неизменности некоторых данных, при условии
        // что объект так же как и в предыдущих находится/не находится
        // в области меню
        this.bottomPanelInd = bottomInd;

        this.current_third_x = -1;
        this.current_third_y = -1;

        /*
         * Для следуюих переменных в блоке
         * при истинности хотя бы одной из них
         * запрещается подключаться к другим фрагментам (не считая самой анимации)
         * запрещается выделять объекты мышкой
         */
        this.smoothing = false; // плавное автоматическое перемещение, не зависящее от мыши
        this.isConnecting = false; // объект ждет подключения к нему другого объекта
        this.resizing = false; // проигрывание анимации изменения размера

        this.animated = false;


        Fragment.third_x = Fragment.SCALE / 5;
        Fragment.third_y = Fragment.SCALE / 5;
        Fragment.connectRange = Fragment.third_x * 2; // ВРЕМЕННО

        /*
         * В данном блоке представлены ссылки на соседние пазлы
         * в цельном изображении. Соответственно верхний, нижний,
         * правый, левый. Если таких не существует - null
         */
        this.left = left;
        this.top = top;
        this.right = null;
        this.bottom = null;
        if (this.left != null)
            this.left.right = this;
        if (this.top != null)
            this.top.bottom = this;

        this.group = null; // ссылка на группу
        this.listElem = null; // ссылка на элемент двусвязного списка
    }

    init(img) {
        Fragment.width = img.width;
        Fragment.height = img.height;

        Fragment.SCALE = (
            Math.min(
                canvas.field.all_width / (imagesX / 5 * 3) / Fragment.width,
                canvas.field.all_height / (imagesY / 5 * 3) / Fragment.height
            )
        );
        Fragment.widthScale = Math.floor(Fragment.SCALE * Fragment.width);
        Fragment.heightScale = Math.floor(Fragment.SCALE * Fragment.height);

        Fragment.third_x = Fragment.widthScale / 5;
        Fragment.third_y = Fragment.heightScale / 5;
        Fragment.widthWithoutSpaces = Fragment.widthScale - 2 * Fragment.third_x;
        Fragment.heightWithoutSpaces = Fragment.heightScale - 2 * Fragment.third_y;

        Fragment.connectRange = 2.5 * Math.min(
            Fragment.third_x,
            Fragment.third_y
        );


    }

    downloadImage() {
        var fr = this;
        this.img.onload = function () {
            Fragment.downloadedImages++;
            if (Fragment.downloadedImages == 1) {
                initializeSizes(fr, this)
            }
        }
    }

    // Отображает изображение в заданных координатах
    draw(context) {
        if (!showSilhouette) {
            // не силуэт
            if (!this.onBottomPanel) {
                // изобразить элемент, если он не на панели
                let selected = (this.group != null) ? this.group : this;
                context.drawImage(
                    this.img,
                    this.x,
                    this.y,
                    this.current_width,
                    this.current_height
                );
                context.drawImage(
                    this.imgB,
                    this.x,
                    this.y,
                    this.current_width,
                    this.current_height
                );
            }
        } else {
            // изобразить силуэт
            let selected = (this.group != null) ? this.group : this;
            if (selected.onMenu) {
                context.beginPath();
                context.lineWidth = "3";
                context.strokeStyle = "black";
                context.rect(
                    this.x + 2 * Fragment.third_xPanel,
                    this.y + 2 * Fragment.third_yPanel,
                    Fragment.widthPanel - 2 * Fragment.third_xPanel,
                    Fragment.heightPanel - 2 * Fragment.third_yPanel
                );
                context.stroke();
                context.beginPath();
                context.rect(
                    this.x,
                    this.y,
                    Fragment.widthPanel,
                    Fragment.heightPanel
                );
                context.stroke();
            } else if (!this.onBottomPanel) {
                context.beginPath();
                context.rect(
                    this.x + this.current_third_x,
                    this.y + this.current_third_y,
                    this.current_width - 2 * this.current_third_x,
                    this.current_height - 2 * this.current_third_y
                );
                context.lineWidth = "2";
                context.strokeStyle = "black";
                context.stroke();

                context.beginPath();
                context.rect(
                    this.x + this.current_third_x,
                    this.y + this.current_third_y,
                    this.current_width - 2 * this.current_third_x,
                    this.current_height - 2 * this.current_third_y
                );

                context.lineWidth = "4";
                context.strokeStyle = "blue";
                context.stroke();
            }
        }
    }

    /**
     * Проверяет, есть ли точка с координатами x, y внутри фрагмента
     * универсально работает как для фрагмента, находящегося на главном поле
     * сборки, так и для фрагмента, находящегося внутри меню или на нижней панели.
     * Работает только для видимой части пазла
     *
     * @param x - координата по оси X
     *
     * @param y - координата по оси Y
     *
     * @return bool - лежит ли точка внутри видимой части фрагмента
     */
    isHadPoint(x, y) {
        if (this.onBottomPanel) {
            return (
                canvas.panel.fragmentsCount * (canvas.panel.list - 1) <= this.bottomPanelInd &&
                this.bottomPanelInd < canvas.panel.fragmentsCount * canvas.panel.list &&
                x >= (canvas.panel.x + canvas.panel.buttonWidth + canvas.panel.paddingX +
                    (canvas.panel.fragmentSpace + Fragment.widthPanel) * (
                        this.bottomPanelInd % canvas.panel.fragmentsCount)) &&
                x <= (canvas.panel.x + canvas.panel.buttonWidth + canvas.panel.paddingX +
                    (canvas.panel.fragmentSpace + Fragment.widthPanel) * (
                        this.bottomPanelInd % canvas.panel.fragmentsCount) + Fragment.widthPanel) &&
                y >= canvas.panel.y + canvas.panel.paddingY &&
                y <= canvas.panel.y + canvas.panel.paddingY + Fragment.heightPanel
            )
        }

        let selected = (this.group != null) ? this.group : this;
        if (selected.onMenu) {
            return (
                x >= (this.x + Fragment.third_xPanel) &&
                x <= (this.x + Fragment.widthPanel - Fragment.third_xPanel) &&
                y >= (this.y + Fragment.third_yPanel) &&
                y <= (this.y + Fragment.heightPanel - Fragment.third_yPanel)

            )
        }

        return (
            x >= this.x + this.current_third_x &&
            x <= (this.x + this.current_width - this.current_third_x) &&
            y >= (this.y + this.current_third_y) &&
            y <= (this.y + this.current_height - this.current_third_y)
        )
    }

    //возвращает true если фрагмент был перенесен
    async tryMoveBeetwenLists() {
        if (this.onMenuLast == this.onMenu) {
            return false;
        }
        this.onMenuLast = this.onMenu;
        if (!this.onMenu) {
            // поставить по умолчанию относительно курсора

            let tmp = this.listElem;
            this.listElem.remove(); // удалиться из прошлого листа
            canvas.field.fragmentList.appendElem(tmp); // добавиться в новый

            this.scale = canvas.field.bigType ? 1 : canvas.field.scale;
            await this.smoothResize(
                Fragment.widthPanel, Fragment.heightPanel,
                Fragment.widthScale * this.scale, Fragment.heightScale * this.scale,
                false, true
            );
            return true; // menu -> field
        } else {
            // поставить в зависимости от главного, в меню
            // относительно курсора

            let tmp = this.listElem;
            this.listElem.remove(); // удалиться из прошлого листа
            canvas.left_menu.fragmentList.appendElem(tmp); // добавиться в новый

            await this.smoothResize(
                this.current_width, this.current_height,
                Fragment.widthPanel, Fragment.heightPanel,
                false, true
            );
            return true; // field -> menu
        }
    }

    /**
     * Добавляет отступ для элементов группы.
     * Необходимо при увеличении или уменьшении (в таком случае отступ отрицательный)
     * фрагмента. Тогда увеличенная группа увеличивается в размерах, правые фрагменты
     * перемещаются вправо, в этом суть
     * В аргументах - бывшие и новые размеры фрагмента для высчитывания отступа
     */
    async appendMargin(old_width, old_height, new_width, new_height) {
        let this_fr = this;
        if (this_fr.group == null) {
            return Promise.resolve();
        }
        let oneX = this_fr.ind % imagesX;
        let oneY = Math.floor(this_fr.ind / imagesX);

        let twoX = this_fr.group.mainFragment.ind % imagesX;
        let twoY = Math.floor(this_fr.group.mainFragment.ind / imagesX);

        let dx = (oneX - twoX) * (new_width - old_width) / 5 * 3;
        let dy = (oneY - twoY) * (new_height - old_height) / 5 * 3;
        await this_fr.smoothShift(dx, dy);
    }

    // Расстояниме от курсора мыши до старта изображения в левом верхнем углу в пикселях.
    // Если это расстояние не учитывать, то изображение при его взятии будет телепортировано
    // Левым верхним углом к положению курсора, а так к тому положению прибавляется разница
    // в координатах, обеспечивая тем самым отсутствие рывков
    rangeToStartImage(x, y) {
        let selected = (this.group != null) ? this.group : this;
        return {
            x: x - this.x,
            y: y - this.y
        };
    }

    moveToPanel() {
        var x = (canvas.panel.x + canvas.panel.buttonWidth + canvas.panel.paddingX +
            (canvas.panel.fragmentSpace + Fragment.widthPanel) * (
                this.bottomPanelInd % canvas.panel.fragmentsCount)) + Fragment.widthPanel / 2 - Fragment.widthScale / 2;
        var y = canvas.panel.y + canvas.panel.paddingY + Fragment.heightPanel / 2 - Fragment.heightScale / 2;
        this.move(x, y);
    }

    /**
     * Функция работает с фрагментами или группами, объединяют их в одну группу
     *
     * @param selected - группа или фрагмент
     *
     * @param other - группа или фрагмент
     *
     * @param animated - анимация будет воспроизведена
     *
     * @param animationDelay - анимация с задержкой
     *
     */
    workGroups(selected, other, animated = false, animationDelay = .0) {
        if (selected.group == null) {
            if (other.group == null) {
                // создание группы
                selected.group = new FragmentGroup();
                other.group = selected.group;
                selected.group.fragments.add(selected);
                selected.group.fragments.add(other);

                let oneX = selected.ind % imagesX;
                let twoX = other.ind % imagesX;
                let oneY = Math.floor(selected.ind / imagesX);
                let twoY = Math.floor(other.ind / imagesX);

                if (oneX < twoX || oneY < twoY) {
                    selected.group.mainFragment = selected;
                } else {
                    selected.group.mainFragment = other;
                    let tmp = other;
                    other = selected;
                    selected = tmp;
                }

                // console.log(selected.group.mainFragment.src);

                // если другой фрагмент присоединен к углу, то вся группа в итоге будет
                // к нему присоединена
                selected.group.connectedToCorner = other.connectedToCorner; // исправить
                /*
                 * Дальнейшие элементы oneX, oneY, twoX, twoY
                 * являются координатами данных элементов в цельном изображении.
                 * Они сортируются для получения максимальных/минимальных крайних
                 * элементов группы.
                 */
                if (oneX < twoX) {
                    selected.group.leftFragmentInd = oneX;
                    selected.group.rightFragmentInd = twoX;
                } else {
                    selected.group.leftFragmentInd = twoX;
                    selected.group.rightFragmentInd = oneX;
                }
                if (oneY < twoY) {
                    selected.group.bottomFragmentInd = oneY;
                    selected.group.topFragmentInd = twoY;
                } else {
                    selected.group.bottomFragmentInd = twoY;
                    selected.group.topFragmentInd = oneY;
                }

                selected.listElem.value = selected.group; // ссылка на фрагмент заменяется на ссылку на группу
                selected.listElem.src = null; // убрать путь до картинки, а то некрасиво
                selected.group.listElem = selected.listElem;
                other.listElem.remove(); // удаление "лишнего" объекта из очереди на запись,
                // т.к. он уже отрисовывается в группе
            } else {
                console.log("!!!!");
                // selected - not group;
                // other - group

                selected.group = other.group;
                selected.group.fragments.add(selected);
                selected.listElem.remove();

                /*
                 * Дальнейшие элементы oneX, oneY
                 * являются координатами selected фрагмента в цельном изображении.
                 * В ходе следующей части кода меняются крайние индексы для группы
                 */
                let oneX = selected.ind % imagesX;
                let oneY = Math.floor(selected.ind / imagesX);
                if (oneX > selected.group.rightFragmentInd) {
                    selected.group.rightFragmentInd = oneX;
                }
                if (oneX < selected.group.leftFragmentInd) {
                    selected.group.leftFragmentInd = oneX;
                }
                if (oneY > selected.group.topFragmentInd) {
                    selected.group.topFragmentInd = oneY;
                }
                if (oneY < selected.group.bottomFragmentInd) {
                    selected.group.bottomFragmentInd = oneY;
                }


            }
        } else {
            if (other.group == null) {
                console.log("!");
                other.group = selected.group;
                selected.group.fragments.add(other);
                selected.group.connectedToCorner = other.connectedToCorner;
                // если другой фрагмент присоединен к углу, то вся группа в итоге
                // будет присоединена к этому углу

                selected.listElem.value = selected.group; // ссылка на фрагмент заменяется на ссылку на чужую группу
                other.listElem.remove();

                /*
                 * Дальнейшие элементы oneX, oneY
                 * являются координатами selected фрагмента в цельном изображении.
                 * В ходе следующей части кода меняются крайние индексы для группы
                 */
                let twoX = other.ind % imagesX;
                let twoY = Math.floor(other.ind / imagesX);
                if (twoX > selected.group.rightFragmentInd) {
                    selected.group.rightFragmentInd = twoX;
                }
                if (twoX < selected.group.leftFragmentInd) {
                    selected.group.leftFragmentInd = twoX;
                }
                if (twoY > selected.group.topFragmentInd) {
                    selected.group.topFragmentInd = twoY;
                }
                if (twoY < selected.group.bottomFragmentInd) {
                    selected.group.bottomFragmentInd = twoY;
                }


                if (selected.group.leftFragmentInd < twoX || selected.group.topFragmentInd < twoY) {
                } else {
                    selected.group.mainFragment = other;
                    // let tmp = other;
                    // other = selected;
                    // selected = tmp;
                }

                let b = (other.group.mainFragment.x / other.x + 1) / (2)
                let t = canvas.field.scale * (1 - b) + b;

                if (twoX > selected.group.rightFragmentInd) {
                    selected.group.rightFragmentInd = twoX;
                }
                if (twoX < selected.group.leftFragmentInd) {
                    selected.group.leftFragmentInd = twoX;
                }
                if (twoY > selected.group.topFragmentInd) {
                    selected.group.topFragmentInd = twoY;
                }
                if (twoY < selected.group.bottomFragmentInd) {
                    selected.group.bottomFragmentInd = twoY;
                }


            } else {
                // в ходе кода группа selected удаляется
                // остается группа other

                if (other.group.rightFragmentInd < selected.group.rightFragmentInd) {
                    other.group.rightFragmentInd = selected.group.rightFragmentInd;
                }
                if (other.group.leftFragmentInd > selected.group.leftFragmentInd) {
                    other.group.leftFragmentInd = selected.group.leftFragmentInd;
                }
                if (other.group.topFragmentInd < selected.group.topFragmentInd) {
                    other.group.topFragmentInd = selected.group.topFragmentInd;
                }
                if (other.group.bottomFragmentInd > selected.group.bottomFragmentInd) {
                    other.group.bottomFragmentInd = selected.group.bottomFragmentInd;
                }

                selected.group.listElem.remove();
                selected.group.changeGroup(other.group); //setMenuD внутри
                // т.к. элементы становятся членами другой группы, то нет необходимости
                // заботиться об connectedToCorner. Он всегда определяется other.
            }
        }
        if (animated && !other.group.connectedToCorner) {
            setTimeout(selected.group.resizeSelect, animationDelay, selected.group, true);
        }

    }

    rightTop() {
        let selected = (this.group != null) ? this.group : this;
        return {
            x: this.x + this.current_width - this.current_third_x,
            y: this.y + this.current_third_y
        }
    }

    leftTop() {
        let selected = (this.group != null) ? this.group : this;
        return {
            x: this.x + this.current_third_x,
            y: this.y + this.current_third_y
        }
    }

    rightBot() {
        return {
            x: this.x + this.current_width - this.current_third_x,
            y: this.y + this.current_height - this.current_third_y
        }
    }

    leftBot() {
        return {
            x: this.x + this.current_third_x,
            y: this.y + this.current_height - this.current_third_y
        }
    }

    canConnectRightFragment() {
        var leftTopOfRightFragment = this.right.leftTop();
        var tmpRes = this.rangeFromRightTop(leftTopOfRightFragment.x, leftTopOfRightFragment.y);

        if (tmpRes <= Fragment.connectRange)
            return {
                res: true,
                range: tmpRes
            };
        return {
            res: false,
            range: tmpRes,
            right: true,

        };
    }

    rangeFromRightTop(x, y) {
        var rT = this.rightTop()
        return Math.sqrt((rT.y - y) * (rT.y - y) +
            (rT.x - x) * (rT.x - x))
    }

    canConnectLeftFragment() {
        var rightTopOfLeftFragment = this.left.rightTop();
        var tmpRes = this.rangeFromLeftTop(rightTopOfLeftFragment.x, rightTopOfLeftFragment.y);
        if (tmpRes <= Fragment.connectRange)
            return {
                res: true,
                range: tmpRes
            };
        return {
            res: false,
            range: tmpRes,
            left: true,
        };
    }

    rangeFromLeftTop(x, y) {
        var lT = this.leftTop();
        return Math.sqrt((lT.y - y) * (lT.y - y) +
            (lT.x - x) * (lT.x - x))
    }

    canConnectBottomFragment() {
        var leftTopOfBottomFragment = this.bottom.leftTop();
        var tmpRes = this.rangeFromLeftBottom(leftTopOfBottomFragment.x, leftTopOfBottomFragment.y);
        if (tmpRes <= Fragment.connectRange)
            return {
                res: true,
                range: tmpRes
            };
        return {
            res: false,
            range: tmpRes,
        };
    }

    rangeFromLeftBottom(x, y) {
        var lB = this.leftBot();
        return Math.sqrt((lB.y - y) * (lB.y - y) +
            (lB.x - x) * (lB.x - x))
    }

    canConnectTopFragment() {
        var leftBotOfTopFragment = this.top.leftBot();
        var tmpRes = this.rangeFromLeftTop(leftBotOfTopFragment.x, leftBotOfTopFragment.y);
        if (tmpRes <= Fragment.connectRange)
            return {
                res: true,
                range: tmpRes
            };
        return {
            res: false,
            range: tmpRes,

        };
    }

    rangeFromRightBottom(x, y) {
        var rB = this.rightBot();
        return Math.sqrt((rB.y - y) * (rB.y - y) +
            (rB.x - x) * (rB.x - x))
    }

    smoothmoveOneOrGroup(fr, x, y, connectingFragment) {
        if (fr.group == null) {
            fr.smoothMove(x, y, connectingFragment);
        } else {
            fr.group.smoothMove(x, y, fr, connectingFragment); // допилим позже
        }
    }

    /**
     * Функция реализует присоединение к чему либо либо информирует о возможности этого события
     *
     *  @param int  newInd - индекс фрагмента, для которого стоит проверить возможность
     *                       присоединения, по умолчанию выбирается индекс фрагмента,
     *                       передвигаемого игроком (SelectFragmentHelper.translatedFragmentId).
     *                       Рассмотрение от других фрагментов нужно при проверке подсоединения
     *                       для нескольких фрагментов от одной группы
     *
     *  @param bool withConnect - выполнить присоединение после подтверждения соответствующей проверки,
     *                            по умолчанию присоединяет один фрагмент к другому
     *                            Проверка необходима при подсоединении группы к фрагментам,
     *                            где сначала узнается вся информация о возможных
     *                            подсоединениях, а потом полученые данные сортируются
     *                            по неубыванию, выполняя подсоединение к самому
     *                            близкому из возможных
     *
     *  @return object {
     *           res
     *           range
     *          }
     *
     */
    connectTo(newInd = null, withConnect = true) {
        var i = null;
        if (newInd == null) {
            i = SelectFragmentHelper.translatedFragmentId
        } else {
            i = newInd;
        }

        if (arr[i].onMenu || (arr[i].group != null && arr[i].group.onMenu)) {
            return {res:false};
        }
        let connectArray = [];

        let leftFragment = this.left;
        let rightFragment = this.right;
        let topFragment = this.top;
        let bottomFragment = this.bottom;
        let inner_this = this;
        let x = i % imagesX;
        let y = Math.floor(i / imagesX);

        let selected = (this.group != null) ? this.group : this;


        /**
         *  @param int needX, needY - необходимые конечные координаты пазла
         *                            в изображении, соответствующие заданному углу
         *
         *  @param float range - расстояние до заданного угла
         *
         *  @param int newX, newY - место, куда необходимо перенести пазл при
         *                          выполнении всех условий
         *
         */
        function connectToCorner(needX, needY, range, newX, newY) {
            if (x == needX && y == needY && range <= Fragment.connectRange) {
                connectArray.push({
                    range: range,
                    x: newX,
                    y: newY,
                    fr: null
                });
            }
        }

        // let selected = (this.group != null) ? this.group : this;
        connectToCorner(0, 0, this.rangeFromLeftTop(canvas.field.x, canvas.field.y),
            canvas.field.x - this.current_third_x,
            canvas.field.y - this.current_third_y);
        connectToCorner(imagesX - 1, 0, this.rangeFromRightTop(canvas.field.lastX, canvas.field.y),
            canvas.field.lastX + this.current_third_x - this.current_width,
            canvas.field.y - this.current_third_y);
        connectToCorner(imagesX - 1, imagesY - 1, this.rangeFromRightBottom(canvas.field.lastX, canvas.field.lastY),
            canvas.field.lastX + this.current_third_x - this.current_width,
            canvas.field.lastY + this.current_third_y - this.current_height);
        connectToCorner(0, imagesY - 1, this.rangeFromLeftBottom(canvas.field.x, canvas.field.lastY),
            canvas.field.x - this.current_third_x,
            canvas.field.lastY + this.current_third_y - this.current_height);


        /**
         * Предназначено для заполнения массива ConnectArray,
         * заполняет его объектами, хранящими расстояние до фрагмента
         * а так же числа, необходимые добавить к координатам фрагмента
         * для нормального присоединения одного к другому
         *
         *  @param other - фрагмент, к которому идет подсоединение
         *
         *  @param getInfo - объект, показывающий о возможности присоединения
         *                   фрагмента и расстояние до него
         *  @param getCoordinates - объект с координатами одного из углов другого фрагмента
         *
         *  @param newX - число, необходимое добавить к getCoordinates.x для получения
         *                новых координат для текущего фрагмента вдоль оси X
         *  @param newY - число, необходимое добавить к getCoordinates.y для получения
         *                новых координат для текущего фрагмента вдоль оси Y
         *
         */
        function connectToFragment(other, getInfo, getCoordinates, newX, newY) {
            if (
                getInfo.res && (inner_this.group == null || !inner_this.group.fragments.has(other)) &&
                !other.onBottomPanel && ((other.group != null && !other.group.onMenu) || (other.group == null && !other.onMenu))
            ) {
                // работает только на объекты, отсутствующие в группе, панели и меню
                let scale = canvas.field.bigType ? 1 : canvas.field.scale;
                connectArray.push({
                    range: getInfo.range,
                    x: getCoordinates.x,
                    y: getCoordinates.y,
                    dX: newX,
                    dY: newY,
                    fr: other
                })
            }
        }

        if (topFragment != null)
            connectToFragment(topFragment, topFragment.canConnectBottomFragment(),
                topFragment.leftBot(),
                -this.current_third_x, -this.current_third_y);
        if (leftFragment != null)
            connectToFragment(leftFragment, leftFragment.canConnectRightFragment(),
                leftFragment.rightTop(),
                -this.current_third_x, -this.current_third_y);
        if (bottomFragment != null)
            connectToFragment(bottomFragment, bottomFragment.canConnectTopFragment(),
                bottomFragment.leftTop(),
                -this.current_third_x,
                -this.current_height + this.current_third_y);
        if (rightFragment != null)
            connectToFragment(rightFragment, rightFragment.canConnectLeftFragment(),
                rightFragment.leftTop(),
                -this.current_width + this.current_third_x,
                -this.current_third_y);

        connectArray.sort(function (a, b) {
            return a.range - b.range;
        });
        if (connectArray.length > 0) {
            var near = connectArray[0];
            if (withConnect) {
                if (near.fr == null) {
                    // идет присоединение к углу, а не к фрагменту
                    this.smoothmoveOneOrGroup(this, near.x, near.y);
                    if (this.group != null) {
                        this.group.connectedToCorner = true;
                    } else {
                        this.connectedToCorner = true;
                    }

                } else {
                    // подсоединение к фрагменту
                    let near_frg = (near.fr.group == null) ? near.fr : near.fr.group;

                    if (!near_frg.smoothing && !near_frg.isConnecting && !near_frg.resizing) {
                        this.smoothmoveOneOrGroup(this, near.x + near.dX, near.y + near.dY, near.fr);
                        // console.log(near.x + near.dX, near.y + near.dY);
                    }
                }
            }

            return {
                res: true,
                range: near.range
            };
        }
        return {
            res: false
        };
    }


    /**
     *  @param int newX - новая координата x
     *
     *  @param int newY - новая координата y
     *
     *  @param Fragment connectingFragment - фрагмент, к которому, возможно,
     *                                       подключается наш фрагмент
     *  @param bool shouldWorkGroups - должно ли сработать присоединение к
     *                                 несмотря на присутствие группы у фрагмента
     *                                 Срабатывает у одного фрагмента из всей
     *                                 группы, нет повторений
     */
    async smoothMove(newX, newY, connectingFragment = null, shouldWorkGroups = false) {
        let near = null;
        let this_frg = (this.group == null) ? this : this.group;
        // группа или одиночный фрагмент, к которому идет подключение
        let this_fr = this; // сам фрагмент
        this_frg.smoothing = true;
        if (connectingFragment != null) {
            near = (connectingFragment.group == null) ? connectingFragment : connectingFragment.group;
            near.isConnecting = true;
        }

        await super.smoothMove(newX, newY,).then(() => {
            // при окончании перемещения требуется проверить, стоит ли объединить
            // фрагменты в единую группу
            if (connectingFragment != null) {
                if (this_fr.group == null || shouldWorkGroups) // для работы один раз,
                    // чтобы не выполнялось для каждого
                    // элемента в группе
                    this_fr.workGroups(this_fr, connectingFragment, true, 0);
                near.isConnecting = false;
            }
            this_frg.smoothing = false;
        });
    }

    async smoothShift(dx, dy) {
        let this_frg = (this.group == null) ? this : this.group;
        // группа или одиночный фрагмент, к которому идет подключение
        let this_fr = this; // сам фрагмент
        this_frg.smoothing = true;

        await super.smoothShift(dx, dy).then(()=> {
            // при окончании перемещения требуется проверить, стоит ли объединить
            // фрагменты в единую группу
            this_frg.smoothing = false;
        });
    }

    /**
     * Самописная, хотя и есть одноименная функция в суперклассе
     *
     * Вызывается из группы или фрагмента в процессе onmouseup
     * Меняет относительные координаты у фрагментов группы для
     * нормального уменьшения / увеличения изображения при добавлении в группу
     * и изменяет сам размер изображения
     *
     * @param double - 4 длины пазлины, понятные из их названий
     *
     * @param back - стоит ли повторять анимацию задонаперед при истинности
     *
     * @param append_cursor - стоит ли отталкиваться от местоположения курсора
     */
    async smoothResize(old_width, old_height, new_width, new_height, back = false, append_cursor = false) {
        let this_frg = (this.group == null) ? this : this.group;
        this_frg.resizing = true;
        let currentTact = 0;
        let dX = (new_width - old_width) / (Component.tact);
        let dY = (new_height - old_height) / (Component.tact);

        var current_width = old_width;
        var current_height = old_height;

        let this_fr = this;

        if (append_cursor) {
            // высчитывает на сколько стоит сместить объект, чтобы он якобы масштабировался
            // относительно курсора
            // работает только для одиначных объектов, т.к. в группе обрабатывается отдельно
            let b_x = SelectFragmentHelper.deltaX * (1 - new_width / old_width);
            let b_y = SelectFragmentHelper.deltaY * (1 - new_height / old_height);
            await Promise.all([canvas.smoothShiftDelta(-b_x, -b_y),
            this_fr.smoothShift(b_x, b_y)]);
        }

        await this.appendMargin(old_width, old_height, new_width, new_height);

        // рекурсивная функция вызываемая с задержкой в самой себе
        function resize() {
            return new Promise(resolve=> {
                current_width += dX;
                current_height += dY;
                this_fr.setSizes(this_fr, current_width, current_height);
                setTimeout(()=>{resolve()}, Component.frameTime);
            });
        }

        while(currentTact < Component.tact - 1){
            currentTact++;
            await resize();
        }

        this_fr.setSizes(this_fr, new_width, new_height);
        this_fr.current_third_x = this_fr.current_width / 5;
        this_fr.current_third_y = this_fr.current_height / 5;
        if (back) {
            // повторная анимация, возвращающая всё обратно
            await this_fr.smoothResize(new_width, new_height, old_width, old_height, false, append_cursor);
        } else {
            this_frg.resizing = false;
        }
    }

    /**
     * Вызывается из группы resizeSelect(this_gr)
     *
     * @param back - bool, стоит ли возвращать анимацию назад
     *
     * @param charact - увеличить или уменьшить (-1, 1)
     *
     * @param scale - double, во сколько раз стоит уменьшить/увеличить изображение
     *
     */
    resizeSelect(back, charact = -1, scale = .95) {
        if (charact == -1) {
            this.smoothResize(
                this.current_width, this.current_height,
                this.current_width * scale, this.current_height * scale,
                back
            );
        } else {
            this.smoothResize(
                this.current_width * scale, this.current_height * scale,
                this.current_width, this.current_height,
                back
            );
        }
    }

    //функция, пересчитывающая текущие координаты в координаты меню
    toMenuPos(x, y) {
        let menu = canvas.left_menu;
        let dx = menu.current_width - menu.startShowedWidth;
        return {x:x-dx, y:y};
    }
}
