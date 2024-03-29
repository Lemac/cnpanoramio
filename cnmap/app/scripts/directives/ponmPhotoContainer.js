/**
 * Created by any on 2014/5/5.
 */
'use strict';

angular.module('ponmApp.directives')
    .directive('ponmPhotoContainer', ['$window', '$parse', '$animate', '$log', '$q',
        function ($window, $parse, $animate, $log, $q) {

            function Photosphere(image, maxSize){
                this.image = image;
                this.maxSize = maxSize;// || gl.getParameter(gl.MAX_TEXTURE_SIZE);
                //this.worker = new Worker("worker.js");
            }
            Photosphere.prototype.loadPhotosphere = function(holder){
                holder.innerHTML = "wait...";

                this.defer = $q.defer();

                this.holder = holder;

                if(this.canUseCanvas()){
                    var self = this;
                    this.canDoWebGL();
                    this.loadEXIF(function(){
                        self.cropImage();
                    });
                } else{
                    // this is the ugly scroll backup.
                    // for silly people on a really old browser!
                    holder.innerHTML = "<div style='width:100%;height:100%;overflow-x:scroll;overflow-y:hidden'><div style='margin: 10px; background: #ddd; opacity: 0.6; width: 300px; height: 20px; padding: 4px; position: relative'>If you upgrade to a better browser this is 3D!</div><img style='height:100%;margin-top: -48px' src='"+this.image+"' /></div>";
                }

                return this.defer.promise;
            };

            Photosphere.prototype.canUseCanvas = function() {
                // return false; // debugging! i don't have a non-supporting browser :$
                // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/canvas.js

                var elem = document.createElement('canvas');
                var ctx = elem.getContext && elem.getContext('2d');
                return !!ctx;
            };

            Photosphere.prototype.cropImage = function(){
                var self = this;
                // if have crop or resize
                if(self.exif && ((self.exif['crop_width'] != self.exif['full_width'])
                    || (self.maxSize &&
                        (self.maxSize < self.exif['full_width'] || self.maxSize < self.exif['full_height'])))) {
                    if(this.image instanceof Image) {
//                        this.image.crossOrigin = "anonymous"; //"Anonymous";
                        self.start3D( resize(this.image) );
                    }else {
                        var img = new Image();
                        img.crossOrigin = "anonymous";
                        img.onload = function(){
                            self.start3D( resize(img) );
                        };
                        img.src = this.image;
                    }
                }else {
                    if(this.image instanceof Image) {
//                        this.image.crossOrigin = "anonymous"; //"Anonymous";
                        self.start3D( resize(this.image) );
                    }else{
                        var img = new Image();
                        img.crossOrigin = "anonymous";
                        img.onload = function(){
                            self.start3D( img );
                        };
                        img.src = this.image;
                    }
                }

                function resize(img) {
                    var canvas = document.createElement('canvas');
                    canvas.width = self.exif['full_width'];
                    canvas.height = self.exif['full_height'];

                    if(self.maxSize != undefined){
                        // Now check the size (too big and it'll fail)
                        // http://snipplr.com/view/753/create-a-thumbnail-maintaining-aspect-ratio-using-gd/
                        if(self.maxSize < canvas.width || self.maxSize < canvas.height){
                            var wRatio = self.maxSize / canvas.width;
                            var hRatio = self.maxSize / canvas.height;
                            if( (wRatio * canvas.height) < self.maxSize){
                                // Horizontal
                                canvas.height = Math.ceil(wRatio * canvas.height);
                                canvas.width = self.maxSize;
                            } else{ // Vertical
                                canvas.width = Math.ceil(hRatio * canvas.width);
                                canvas.height = self.maxSize;
                            }
                        }
                    }

                    var context = canvas.getContext("2d");

                    context.fillStyle = "#000";
                    context.fillRect(0,0,canvas.width,canvas.height);
                    context.drawImage(img,
                            (self.exif['x'] / self.exif['full_width']) * canvas.width,
                            (self.exif['y'] / self.exif['full_height']) * canvas.height,
                            (self.exif['crop_width'] / self.exif['full_width']) * canvas.width,
                            (self.exif['crop_height'] / self.exif['full_height']) * canvas.height
                    );
                    return canvas.toDataURL("image/png");
                }
            };

            Photosphere.prototype.canDoWebGL = function(){
                // Modified mini-Modernizr
                // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/webgl-extensions.js
                var canvas, ctx, exts;
                if(this.isCanDoWebGL === undefined) {
                    try {
                        canvas  = document.createElement('canvas');
                        ctx     = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                        exts    = ctx.getSupportedExtensions();

                        this.maxSize = ctx.getParameter(ctx.MAX_TEXTURE_SIZE);
                    }catch (e) {
                        return false;
                    }
                    this.isCanDoWebGL = !!ctx;
                }
                return this.isCanDoWebGL;
            };

            Photosphere.prototype.start3D = function(image){
                if(window['THREE'] == undefined){ alert("Please make sure three.js is loaded"); }

                // Start Three.JS rendering
                this.target = new THREE.Vector3();
                this.lat = 0; this.lon = 90;
                this.onMouseDownMouseX = 0,
                    this.onMouseDownMouseY = 0,
                    this.isUserInteracting = false,
                    this.onMouseDownLon = 0,
                    this.onMouseDownLat = 0;

                this.camera = new THREE.PerspectiveCamera( 75, parseInt(this.holder.innerWidth()) / parseInt(this.holder.innerHeight()), 1, 1100 );
                this.scene = new THREE.Scene();
                var mesh = new THREE.Mesh( new THREE.SphereGeometry( 200, 20, 40 ), this.loadTexture( image ) );
                mesh.scale.x = - 1;
                this.scene.add( mesh );

                // Check for WebGL
//                console.log(this.canDoWebGL());
                if(this.canDoWebGL()){
                    // This is for nice browsers + computers
                    try{
                        this.renderer = new THREE.WebGLRenderer();
//                        this.maxSize = this.renderer.context.getParameter(this.renderer.context.MAX_TEXTURE_SIZE);
                    } catch(e){
                        this.renderer = new THREE.CanvasRenderer();
                    }
                } else {
                    this.renderer = new THREE.CanvasRenderer();
                }

                this.renderer.setSize( parseInt(this.holder.innerWidth()), parseInt(this.holder.innerHeight()) );
                this.holder.innerHTML = "";
                this.holder.append( this.renderer.domElement );

                this.defer.resolve();

                var self = this;
                this.renderer.domElement.addEventListener( 'touchstart', function(event){ self.onDocumentTouchStart(event, self); }, false );
                this.renderer.domElement.addEventListener( 'touchmove', function(event){ self.onDocumentTouchMove(event, self); }, false );
                this.renderer.domElement.addEventListener( 'mousedown', function(event){self.onDocumentMouseDown(event, self); }, false );

                // 第三种做法：用单独的插件
                jQuery(this.renderer.domElement).mousewheel(function(event) {
                    self.onMouseWheel(event, self);
                });
                // 第二种做法：event参数不同 不好取事件参数
//                var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel"; //FF doesn't recognize mousewheel as of FF3.x
//                if (this.renderer.domElement.attachEvent) //if IE (and Opera depending on user setting)
//                    this.renderer.domElement.attachEvent("on"+mousewheelevt, function(event){self.onMouseWheel(event, self); });
//                else if (this.renderer.domElement.addEventListener) //WC3 browsers
//                    this.renderer.domElement.addEventListener(mousewheelevt, function(event){self.onMouseWheel(event, self); }, false);
                // 第一种做法：仅chrome支持
//                this.renderer.domElement.addEventListener( 'mousewheel', function(event){self.onMouseWheel(event, self); }, false );

                document.addEventListener( 'mousemove', function(event){self.onDocumentMouseMove(event, self); }, false );
                document.addEventListener( 'mouseup', function(event){self.onDocumentMouseUp(event, self); }, false );

                this.restart();
            };

            Photosphere.prototype.restart = function() {
                this.resetTimer(this);
                var self = this;
                this.stopTimer = setTimeout(function(){
                        self.stop();
                    }, 3000);
            };

            Photosphere.prototype.stop = function() {
                if(this.timer != undefined){ clearTimeout(this.timer); }
                if(this.interval != undefined){ clearInterval(this.interval); }
                if(this.stopTimer != undefined){ clearTimeout(this.stopTimer); }
            };

            Photosphere.prototype.startMoving = function(){
                var self = this;
                this.interval = setInterval(function(){
                    self.lon = self.lon - 0.1;

                    if( -3 < self.lat && self.lat < 3){}
                    else if(self.lat > 10){ self.lat -= 0.1 }
                    else if(self.lat > 0){ self.lat -= 0.04; }
                    else if(self.lat < 0 && self.lat > 10) { self.lat += 0.1; }
                    else if(self.lat < 0) { self.lat += 0.04;  }

                    self.render();
                }, 10);
            };

            Photosphere.prototype.resetTimer = function(self, t){
                if(self.timer != undefined){ clearTimeout(self.timer); }
                if(self.interval != undefined){ clearInterval(self.interval); }

                self.startMoving();

//                self.timer = setTimeout(function(){
//                    self.startMoving();
//                }, t);
            };

            Photosphere.prototype.onWindowResize = function(self) {
                self = self || this;
                self.camera.aspect = parseInt(self.holder.innerWidth()) / parseInt(self.holder.innerHeight());
                self.camera.updateProjectionMatrix();

                self.renderer.setSize( parseInt(self.holder.innerWidth()), parseInt(self.holder.innerHeight()) );

                self.render();

            };

            Photosphere.prototype.onMouseWheel = function( event, self ) {

                var proposed = self.camera.fov - (event.wheelDeltaY || event.detail || event.deltaY)  * 3;
                if(proposed > 10 && proposed < 100){
                    self.camera.fov = proposed;
                    self.camera.updateProjectionMatrix();

                    self.render();

                    event.preventDefault();
                }

            };

            Photosphere.prototype.onDocumentMouseDown = function( event, self ) {

                event.preventDefault();

                self.isUserInteracting = true;

                self.onPointerDownPointerX = event.clientX;
                self.onPointerDownPointerY = event.clientY;

                self.onPointerDownLon = self.lon;
                self.onPointerDownLat = self.lat;

                self.stop();
            };

            Photosphere.prototype.onDocumentMouseMove = function( event, self ) {

                if ( self.isUserInteracting ) {

                    self.lon = ( self.onPointerDownPointerX - event.clientX ) * 0.1 + self.onPointerDownLon;
                    self.lat = ( event.clientY - self.onPointerDownPointerY ) * 0.1 + self.onPointerDownLat;
                    self.render();

                    self.stop();
//                    self.resetTimer(self, 9000);

                }

            };

            Photosphere.prototype.onDocumentTouchStart = function( event, self ) {

                if ( event.touches.length == 1 ) {

                    event.preventDefault();

                    self.onPointerDownPointerX = event.touches[ 0 ].pageX;
                    self.onPointerDownPointerY = event.touches[ 0 ].pageY;

                    self.onPointerDownLon = lon;
                    self.onPointerDownLat = lat;

                }

            };

            Photosphere.prototype.onDocumentTouchMove = function( event, self ) {

                if ( event.touches.length == 1 ) {

                    event.preventDefault();

                    self.lon = ( self.onPointerDownPointerX - event.touches[0].pageX ) * 0.1 + self.onPointerDownLon;
                    self.lat = ( event.touches[0].pageY - self.onPointerDownPointerY ) * 0.1 + self.onPointerDownLat;

                    self.render();

                    self.stop();
//                    self.resetTimer(self, 9000);

                }

            };

            Photosphere.prototype.onDocumentMouseUp = function( event, self ) {

                self.isUserInteracting = false;
                self.render();

            };

            Photosphere.prototype.loadTexture = function( path ) {
                var texture = new THREE.Texture(  );
                var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: true } );
                var self = this;
                if(path instanceof Image) {
                    texture.needsUpdate = true;
                    material.map.image = path;

                    setTimeout(function(){ self.render(); }, 100);
                }else {
                    texture.needsUpdate = true;
                    THREE.ImageUtils.crossOrigin = "anonymous";
                    material.map = THREE.ImageUtils.loadTexture( path );
                    setTimeout(function(){ self.render(); }, 100);
//                    var image = new Image();
//                    image.onload = function () {
//                        texture.needsUpdate = true;
//                        material.map.image = this;
//                        setTimeout(function(){ self.render(); }, 100);
//                    };
//                    image.src = path;
                }
                return material;
            };

            Photosphere.prototype.render = function(){
                this.lat = Math.max( - 85, Math.min( 85, this.lat ) );
                var phi = ( 90 - this.lat ) * Math.PI / 180,
                    theta = this.lon * Math.PI / 180;

                this.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
                this.target.y = 500 * Math.cos( phi );
                this.target.z = 500 * Math.sin( phi ) * Math.sin( theta );

                this.camera.lookAt( this.target );

                this.renderer.render( this.scene, this.camera );
            };

            Photosphere.prototype.setEXIF = function(data){
                this.exif = data;
                return this;
            };

            Photosphere.prototype.loadEXIF = function(callback){
                if(this.exif != undefined){ callback(); return; }
                var self = this;
                this.loadBinary(function(data){
                    var xmpEnd = "</x:xmpmeta>";
                    var xmpp = data.substring(data.indexOf("<x:xmpmeta"), data.indexOf(xmpEnd) + xmpEnd.length);

                    var getAttr = function(attr){
                        var x = xmpp.indexOf(attr+'="') + attr.length + 2;
                        return xmpp.substring( x, xmpp.indexOf('"', x) );
                    };

                    self.exif = {
                        "full_width" : getAttr("GPano:FullPanoWidthPixels"),
                        "full_height" : getAttr("GPano:FullPanoHeightPixels"),
                        "crop_width" : getAttr("GPano:CroppedAreaImageWidthPixels"),
                        "crop_height" : getAttr("GPano:CroppedAreaImageHeightPixels"),
                        "x" : getAttr("GPano:CroppedAreaLeftPixels"),
                        "y" : getAttr("GPano:CroppedAreaTopPixels")
                    };
                    console.log(self.exif);
                    callback();
                });
            };
/**
            var draw360 = function(container, imageSrc, width, height) {
                var camera, scene, renderer;

                var onPointerDownPointerX,
                    onPointerDownPointerY,
                    onPointerDownLon,
                    onPointerDownLat;

                var texture_placeholder,
                    isUserInteracting = false,
                    isAutoWheel = true,
                    onMouseDownMouseX = 0, onMouseDownMouseY = 0,
                    lon = 0, onMouseDownLon = 0,
                    lat = 0, onMouseDownLat = 0,
                    phi = 0, theta = 0;

                init();
                animate();

                function init() {

                    var mesh;

                    camera = new THREE.PerspectiveCamera( 75, 2, 1, 1100 );
                    camera.target = new THREE.Vector3( 0, 0, 0 );

                    scene = new THREE.Scene();

                    var geometry = new THREE.SphereGeometry( 500, 60, 40 );
                    geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );

                    var material = new THREE.MeshBasicMaterial( {
                        map: THREE.ImageUtils.loadTexture( imageSrc )
                    } );

                    mesh = new THREE.Mesh( geometry, material );

                    scene.add( mesh );

                    renderer = new THREE.WebGLRenderer();
                    renderer.setSize( container.innerWidth(), container.innerHeight());

//                    $animate.removeClass(container.find(".flat-image"), 'show');
                    container.append( renderer.domElement );
                    $animate.addClass(angular.element(renderer.domElement), 'show');
//                    $animate.addClass(container.find(".flat-image-button"), 'show');

                    renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
                    renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
                    renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
                    renderer.domElement.addEventListener( 'mouseleave', onDocumentMouseUp, false );
                    renderer.domElement.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
                    renderer.domElement.addEventListener( 'DOMMouseScroll', onDocumentMouseWheel, false);

                    //
                    renderer.domElement.addEventListener( 'click', function ( event ) {

                        event.preventDefault();
                        isAutoWheel = !isAutoWheel;

                    }, false );

                    renderer.domElement.addEventListener( 'dragover', function ( event ) {

                        event.preventDefault();
                        event.dataTransfer.dropEffect = 'copy';

                    }, false );

                    renderer.domElement.addEventListener( 'dragenter', function ( event ) {

                        document.body.style.opacity = 0.5;

                    }, false );

                    renderer.domElement.addEventListener( 'dragleave', function ( event ) {

                        document.body.style.opacity = 1;

                    }, false );

                    renderer.domElement.addEventListener( 'drop', function ( event ) {

                        event.preventDefault();

                        var reader = new FileReader();
                        reader.addEventListener( 'load', function ( event ) {

                            material.map.image.src = event.target.result;
                            material.map.needsUpdate = true;

                        }, false );
                        reader.readAsDataURL( event.dataTransfer.files[ 0 ] );

                        document.body.style.opacity = 1;

                    }, false );

                    //
                    window.addEventListener( 'resize', onWindowResize, false );

                }

                function onWindowResize() {

//                    camera.aspect = width / height;
                    camera.updateProjectionMatrix();

                    renderer.setSize( container.innerWidth(), container.innerHeight());

                }

                function onDocumentMouseDown( event ) {

                    event.preventDefault();

                    isUserInteracting = true;

                    onPointerDownPointerX = event.clientX;
                    onPointerDownPointerY = event.clientY;

                    onPointerDownLon = lon;
                    onPointerDownLat = lat;

                }

                function onDocumentMouseMove( event ) {

                    if ( isUserInteracting === true ) {

                        lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
                        lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;

                    }
                }

                function onDocumentMouseUp( event ) {
                    isUserInteracting = false;
                }

                function onDocumentMouseWheel( event ) {

                    event.preventDefault();

                    var fov = camera.fov;
                    // WebKit
                    if ( event.wheelDeltaY ) {

                        fov -= event.wheelDeltaY * 0.05;

                        // Opera / Explorer 9
                    } else if ( event.wheelDelta ) {

                        fov -= event.wheelDelta * 0.05;

                        // Firefox
                    } else if ( event.detail ) {

                        fov += event.detail * 1.0;

                    }

                    if(fov > 10 && fov < 150) {
                        camera.fov = fov;
                    }
                    $log.debug("camera.fov " + camera.fov);
                    camera.updateProjectionMatrix();

                }

                function animate() {

                    requestAnimationFrame( animate );
                    update();

                }

                function update() {

                    if ( isUserInteracting === false && isAutoWheel ) {

                        lon += 0.1;

                    }

                    lat = Math.max( - 85, Math.min( 85, lat ) );
                    phi = THREE.Math.degToRad( 90 - lat );
                    theta = THREE.Math.degToRad( lon );

                    camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
                    camera.target.y = 500 * Math.cos( phi );
                    camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );

                    camera.lookAt( camera.target );


                     // distortion
//                     camera.position.copy( camera.target ).negate();


//                    renderer.render( scene, camera );
//
//                }
//
//                return renderer.domElement;
//            };
*/
            return {
                restrict: 'EA',
                templateUrl: "views/ponmPhotoContainer.html",
                link: function (scope, element, attrs, ngModel) {

                    var image1 = null,
                        image2 = null;
                    var imgWidth = 1,
                        imgHeight = 1;
                    var ponmPhotoContainer = element.find(".ponm-photo-container"),
                        loading = element.find(".loading"),
                        imgContainer = element.find(".flat-image"),
                        canvas = element.find(".p360-image"),
                        clickCreateP360 = element.find(".flat-image .image-button"),
                        clickBackFlat   = element.find(".p360-image .image-button");
                    var photosphere = null;

                    // 360度全景图标
                    clickCreateP360.on("click", function(e) {
                        e.preventDefault();
                        hide(imgContainer);
                        show(canvas);

                        if(canvas.find("canvas").length && clickCreateP360.ponmPhotoSrcL == attrs.ponmPhotoSrcL1) {
                            show(canvas);
                            photosphere.restart();
                        }else {
                            clickCreateP360.ponmPhotoSrcL = attrs.ponmPhotoSrcL1;
                            canvas.find(".p360-canvas").empty();
                            $animate.removeClass(loading, "ponm-hide");
                            photosphere = new Photosphere(attrs.ponmPhotoSrcP360)
                                .setEXIF({
                                    "full_width" : attrs.ponmPhotoWidth,
                                    "full_height" : attrs.ponmPhotoHeight,
                                    "crop_width" : attrs.ponmPhotoWidth,
                                    "crop_height" : attrs.ponmPhotoHeight,
                                    "x" : 0,
                                    "y" : 0
                                });
                            photosphere.loadPhotosphere(canvas.find(".p360-canvas"))
                                .then(function() {
                                    $animate.addClass(loading, "ponm-hide");
                                });

                        }
                    });
                    clickCreateP360.mouseenter(function(e) {
                        clickCreateP360.find(".icon-p360").css("opacity", 1);
                    });
                    clickCreateP360.mouseout(function(e) {
                        clickCreateP360.find(".icon-p360").css("opacity", 0.5);
                    });

                    // 平面图标
                    clickBackFlat.on("click", function(e) {
                        e.preventDefault();
                        $log.debug("click on image360");
//                        $animate.removeClass(canvas, "show");
//                        $animate.addClass(imgContainer, 'ponm-show');
                        hide(canvas);
                        show(imgContainer);
                        photosphere.stop();
                    });
                    clickBackFlat.mouseenter(function(e) {
                        clickBackFlat.find(".icon-pflat").css("opacity", 1);
                    });
                    clickBackFlat.mouseout(function(e) {
                        clickBackFlat.find(".icon-pflat").css("opacity", 0.5);
                    });

                    element.css("width", "100%");
                    element.css("height", "100%");
                    element.css("background-color", attrs.ponmPhotoColor);

                    var containerWidth = element.innerWidth(),
                        containerHeight = element.innerHeight();

                    attrs.$observe('ponmPhotoIs360', function ( data ) {
                        if ( angular.isDefined( data ) ) {
                            changeP360(data);
                        }
                    });

                    attrs.$observe('ponmPhotoSrcL1', function ( data ) {
                        if ( angular.isDefined( data ) ) {
                            drawImage();
                        }
                    });

                    function getImgWidthHeight() {
                        imgWidth = attrs.ponmPhotoWidth;
                        imgHeight = attrs.ponmPhotoHeight;
                        imgScale = imgHeight / imgWidth;
                    }

                    function changeP360(is360) {
                        $log.debug("changeP360: " + is360);
                        if(angular.isString(is360)) {
                            is360 = angular.lowercase(is360);
                            is360 = is360 == "true";
                        }

                        if(is360) {
                            $animate.addClass(imgContainer, 'p360');
                            show(clickCreateP360);
                        }else {
                            hide(clickCreateP360);
                        }
                    }
                    var $panzoom = null;
                    function panzoom(panzoomDom) {
                        $panzoom = angular.element(panzoomDom).panzoom({
                            $zoomIn: element.parent().find(".zoom-in"),
                            $zoomOut: element.parent().find(".zoom-out"),
                            $zoomRange: element.parent().find(".zoom-range"),
                            $reset: element.parent().find(".reset"),
                            transition: true
                        });
                        $panzoom.parent().on('mousewheel.focal', function( e ) {
                            e.preventDefault();
                            var delta = e.delta || e.originalEvent.wheelDelta;
                            var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
                            $panzoom.panzoom('zoom', zoomOut, {
                                increment: 0.1,
                                animate: true,
                                focal: e
                            });
                        });
                        $panzoom.on('panzoomzoom', function(e, panzoom, scale, changed) {
                            if(scale < 1) {
                                $panzoom.panzoom("resetZoom");
                                $panzoom.panzoom("resetPan");
                            }else if(Math.abs(scale - 1) < 0.05) {
                                if(scale != 1) {
                                    $panzoom.panzoom("resetZoom");
                                }
                                $panzoom.panzoom("resetPan");
                            }
                        });
                    }

                    function panzoomReset() {
                        $panzoom.panzoom("reset");
                    }

                    function drawImage() {

                        if (!attrs.ponmPhotoSrcL1) {
                            $animate.addClass(loading, "ponm-hide");
                            return;
                        }

                        var is360 = attrs.ponmPhotoIs360 && attrs.ponmPhotoIs360 != "false";

                        if(imgContainer) {
                            imgContainer.find(".flat-canvas").empty();

                            changeP360(is360);

                            hide(canvas);

                            $animate.removeClass(loading, "ponm-hide");
                        }
                        if (attrs.ponmPhotoSrcL1) {
                            image1 = new Image();
                            image1.onload = function () {
                                var img = angular.element(image1);
                                imgWidth = img.outerWidth();
                                imgHeight = img.outerHeight();
                                imgScale = imgHeight / imgWidth;
//                                $log.debug("image: "+ imgWidth + "x" + imgHeight);

                                setImageWidthHeight();
                                show(imgContainer);
                                if (image2) {
                                    hide(angular.element(image2));
                                }
                                $animate.addClass(loading, "ponm-hide");
                            };
                            if (image2) {
                                angular.element(image1).css("position", "absolute");
                                angular.element(image1).css("top", "0");
                            }
                            image1.src = attrs.ponmPhotoSrcL1;

                            imgContainer.find(".flat-canvas").append(image1);

                            panzoom(imgContainer.find(".flat-canvas"));
                            panzoomReset();

                        }
                    }
                    angular.element($window).resize(function (e) {
                        setImageWidthHeight();
                        photosphere && photosphere.onWindowResize();
                    });

                    // 图片高宽比例
                    var imgScale = null;
                    function setImageWidthHeight() {

                        containerWidth = element.innerWidth();
                        containerHeight = element.innerHeight();

                        ponmPhotoContainer.css("line-height", containerHeight+"px");
                    }

                    function show(element) {
                        $animate.addClass(element, "ponm-show");
                    }

                    function hide(element) {
                        $animate.removeClass(element, "ponm-show");
                    }
                }
            };
    }])
;