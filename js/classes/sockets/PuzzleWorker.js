class PuzzleWorker {

    constructor(canvas) {
        this.tasks = [];
        this.canvas = canvas;
        this.fragment = null;
    }

    push(task) {
        this.tasks.push(task);
    }

    async execute(arr) {

        if (this.tasks.length !== 0) {

            let task = this.tasks[this.tasks.length - 1];
            let selectedFragment = arr[task.ind];

//тут уже NAN

            if (!task.onBottomPanel && selectedFragment.onBottomPanel) {
                selectedFragment.onBottomPanel = false;
                selectedFragment.moveToPanel();
            }

            if (!task.group) {
                await this.executeMove(task, selectedFragment);
                await this.executeConnection(task, selectedFragment, selectedFragment)
            } else {

                await this.executeMove(task, selectedFragment.group, selectedFragment);

                await this.executeConnection(task, selectedFragment.group, selectedFragment)
            }
            this.tasks.pop();
            this.execute(arr);
        }
    }

    error(error) {
        console.log("The error in worker: " + error);
    }

    /**
     *
     * @param task - executable task
     * @param elem - Fragment/Fragment group
     * @param selected - SelectedFragment для корректной работы группы
     * @returns {Promise<void>}
     */
    async executeMove(task, elem, selected = null) {
        const onMenuLast = elem.onMenu;
        elem.onMenu = task.onMenu;
        await elem.tryMoveBeetwenLists(selected);

        if (this.canvas.left_menu.shown) {
            //меню открыто, переносим по обычным координатам
            await elem.smoothMove(task.x, task.y, selected);
        } else {
            //меню закрыто, если нужно перенестить на меню, необходимо пересчитать координаты
            if (task.onMenu) {
                const coords = elem.toMenuPos(task.x, task.y);
                await elem.smoothMove(coords.x, coords.y, selected);
            } else {
                await elem.smoothMove(task.x, task.y, selected);
            }
        }
    }

    async executeConnection(task, elem, selected = null){
        if (task.shouldConnect) {
            await elem.connectTo(selected.ind);
        }
    }
}
