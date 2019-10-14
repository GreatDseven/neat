const gulp = require('gulp');
const uglify = require('gulp-uglify'); //压缩js文件
const htmlmin = require('gulp-htmlmin'); //压缩html,可以压缩页面js、css
const minifycss = require('gulp-minify-css'); //压缩css文件,并给引用url添加版本号避免缓存
const htmlreplace = require('gulp-html-replace');
//const clean = require('gulp-clean'); //清理目标目录用

//var Autoprefixer = require('gulp-autoprefixer');//自动添加浏览器前缀
//var imagemin = require('gulp-imagemin');//压缩图片文件（包括PNG、JPEG、GIF和SVG图片）
//var spritesmith = require('gulp.spritesmith');//生成sprites图片和样式表
//var less = require('gulp-less');//编译Less
//var csslint = require('gulp-csslint');//检查css有无报错或警告
//var jshint = require('gulp-jshint');//检查js有无报错或警告
//var concat = require('gulp-concat');//合并js文件
//var babel = require('gulp-babel');//转换代码为ES6最新语法形式
//const revappend = require('gulp-rev-append'); //给页面的引用添加版本号，清除页面引用缓存


const outputDir="output/";

//// 清理目标文件夹
//function cleanDir(cb){
//  gulp.src(outputDir,{allowEmpty:true})
//  .pipe(clean(outputDir));
//  cb();
//}

//获取显示版本号的script
function getVersionScriptContent() {
    var today = new Date();
    var version = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + " "
        + today.getHours() + ":" + today.getMinutes();

    var scriptContent = "console.group('版本:');console.info('" + version + "');console.groupEnd('版本:')";
    return scriptContent;
}

// 压缩html
function minHTML(cb) {
    var options = {
        removeComments: true, //清除HTML注释
        collapseWhitespace: true, //压缩HTML
        collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
        minifyJS: true, //压缩页面JS
        minifyCSS: true //压缩页面CSS
    };
    gulp.src(['*.html'])
        .pipe(htmlmin(options))
        .pipe(gulp.dest(outputDir));

    gulp.src(["pages/**/*.html", "!pages/board.html"])
        .pipe(htmlmin(options))
        .pipe(gulp.dest(outputDir + "pages/"));


    

    gulp.src(["pages/board.html"])
        
        .pipe(htmlreplace(
            {
                versionTag:  {
                    src: getVersionScriptContent(),
                    tpl: '<script type="text/javascript">%s</script>'
                }
            }
        ))
        .pipe(htmlmin(options))
        .pipe(gulp.dest(outputDir + "pages/"));

    

    cb();
}

// 压缩css
function minCss(cb){
  gulp.src(["content/neat/css/*.css"])
  .pipe(minifycss())
  .pipe(gulp.dest(outputDir+"content/neat/css/"));
  cb();
}

// 压缩js
function minJS(cb){
  gulp.src(['content/neat/**/*.js',"!content/neat/modules/3rdmod/*.js"])
  .pipe(uglify())
        .on('error', function (err) {
            console.log( err.toString()+"\n");
        })
  .pipe(gulp.dest(outputDir+"content/neat/"));
  cb();
}

// 复制其他文件
function copyFiles(cb){

  gulp.src(["config.js","favicon.ico"])
  .pipe(gulp.dest(outputDir));

  gulp.src(["content/neat/images/**/*"])
  .pipe(gulp.dest(outputDir+"content/neat/images/"));

  gulp.src(["content/3rd/**/*"])
  .pipe(gulp.dest(outputDir+"content/3rd/"));

  gulp.src(["content/neat/modules/3rdmod/**/*"])
  .pipe(gulp.dest(outputDir+"content/neat/modules/3rdmod/"));

  cb();
}

exports.default =  gulp.parallel(minCss, minJS, minHTML, copyFiles);
