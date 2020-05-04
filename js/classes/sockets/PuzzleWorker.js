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

            if (!task.onBottomPanel && selectedFragment.onBottomPanel) {
                selectedFragment.onBottomPanel = false;
                selectedFragment.moveToPanel();
            }

            if (!task.group) {
                await selectedFragment.smoothMove(task.x, task.y);
                if(task.shouldConnect){
                    selectedFragment.connectTo(selectedFragment.ind);
                }

            } else {
                await selectedFragment.group.smoothMove(task.x, task.y, selectedFragment);
                if(task.shouldConnect){
                    selectedFragment.group.connectTo(selectedFragment.ind);
                }
            }

            this.tasks.pop();
            this.execute(arr);
        }
    }

    error(error) {
        console.log("The error in worker: " + error);
    }
}
