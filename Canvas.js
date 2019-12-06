 // init in script.js

class Canvas {
  constructor(id) {
    console.log("Canvas created");
    this.canvas = document.getElementById(id);
    this.context = this.canvas.getContext('2d');

  }
  getCoords(x, y) {
    var bbox = this.canvas.getBoundingClientRect();
    return {
      x: (x - bbox.left) * (this.canvas.width / bbox.width),
      y: (y - bbox.top) * (this.canvas.height / bbox.height)
    };
  }
}
