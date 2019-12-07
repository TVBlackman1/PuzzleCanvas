 // init in script.js

 class Canvas {
   constructor(id, countImages) {
     console.log("Canvas created");
     this.canvas = document.getElementById(id);
     this.context = this.canvas.getContext('2d');

     this.panel = null;
     this.left_menu = null;
     this.right_menu = null;
     this.field = null;

     this.fr_zones = [this.left_menu, this.right_menu];

   }

   initElements() {
     this.field = new Field();
     this.panel = new Panel(countImages, this);
     this.left_menu = new Menu(-1, this);
     this.right_menu = new Menu(1, this);

     this.fr_zones[0] = this.left_menu;
     this.fr_zones[1] = this.right_menu;


   }

   initField() {
     this.field = new Field();
   }

   initPanel() {
     this.panel = new Panel(countImages, this);
   }

   initMenu() {
     this.left_menu = new Menu(-1, this);
     this.right_menu = new Menu(1, this);
   }

   getCoords(x, y) {
     var bbox = this.canvas.getBoundingClientRect();
     return {
       x: (x - bbox.left) * (this.canvas.width / bbox.width),
       y: (y - bbox.top) * (this.canvas.height / bbox.height)
     };
   }

   isInZones(x, y) {
     // переписать на функцию класса для field
     if (
       x >= canvas.field.firstX && x <= canvas.field.lastX &&
       y >= canvas.field.firstY && y <= canvas.field.lastY
     ) {
       return true;
     }
     var zones = this.fr_zones;
     for (var i = 0; i < zones.length; i++) {
       console.log(zones[i]);
       if (zones[i].isHadPoint(x, y)) {
         return true;
       }
     }
     return false;
   }

   draw(context) {
     this.left_menu.draw(context);
     this.right_menu.draw(context)
     this.panel.draw(context);
     this.field.draw(context);
   }
 }
