const concat = require('gulp-concat');
const gulp = require("gulp");
gulp.task('scripts', function() {
    return gulp.src([
        './js/vars.js',
        './js/classes/base/Component.js',
        './js/classes/base/Button.js',
        './js/classes/BlankField.js',
        './js/classes/Field.js',
        './js/classes/Canvas.js',
        './js/classes/Panel.js',
        './js/classes/places/PanelPlace.js',
        './js/classes/PanelButton.js',
        './js/classes/Timer.js',
        './js/classes/control-buttons/ButtonBack.js',
        './js/classes/control-buttons/ButtonDelete.js',
        './js/classes/control-buttons/ButtonDeleteAll.js',
        './js/classes/control-buttons/ButtonPlay.js',
        './js/classes/ControlPanel.js',
        './js/classes/Menu.js',
        './js/classes/places/MenuPlace.js',
        './js/classes/FragmentGroup.js',
        './js/classes/Fragment.js',
        './js/classes/FragmentList.js',
        './js/classes/FragmentListElem.js',
        './js/script.js',])
        .pipe(concat('puzzle.js'))
        .pipe(gulp.dest('./dist/'));
});