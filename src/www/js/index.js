/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with app work for additional information
 * regarding copyright ownership.  The ASF licenses app file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use app file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
 /* Add animation to the UI using a WebGL Framework: Three.js */

var container;
var camera;
var group, particle;
var scene, sceneCss;
var renderer, cssRenderer;
var iW = window.innerWidth;
var iH = window.innerHeight;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var cssObject, cssObject2;
var planeMesh;
var planeMesh2;
var xPos, yPos;
var imageSrcs = ['img/highway-traffic-icons/sign-1.png', 'img/highway-traffic-icons/sign-2.png',
                 'img/highway-traffic-icons/sign-3.png', 'img/highway-traffic-icons/sign-4.png', 
                 'img/highway-traffic-icons/sign-5.png', 'img/highway-traffic-icons/sign-6.png',
                 'img/highway-traffic-icons/sign-7.png', 'img/highway-traffic-icons/sign-8.png', 
                 'img/highway-traffic-icons/sign-9.png', 'img/highway-traffic-icons/sign-10.png', 
                 'img/highway-traffic-icons/sign-1.png', 'img/highway-traffic-icons/sign-2.png', 
                 'img/highway-traffic-icons/sign-3.png', 'img/highway-traffic-icons/sign-4.png', 
                 'img/highway-traffic-icons/sign-5.png', 'img/highway-traffic-icons/sign-6.png', 
                 'img/highway-traffic-icons/sign-7.png', 'img/highway-traffic-icons/sign-8.png', 
                 'img/highway-traffic-icons/sign-9.png', 'img/highway-traffic-icons/sign-10.png'];

var IPaddress = '192.168.42.1';
var port = '8081';
var deviceID;
var oscPort;
var watchID;

function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );
    //z position of the camera, put the following value equal to 800 if the scene needs to be seen more far away
    camera.position.z = 600;

    scene = new THREE.Scene();
    sceneCss = new THREE.Scene();

    group = new THREE.Group();
    scene.add( group );
    addSpritesInGroup(group);

    /* Create first plane mesh to position the central ball */
    var material = new THREE.MeshBasicMaterial({ wireframe: true });
    /* Add the plane mesh dimensions (width, height) if needed as it follows [allows to see the plane on the screen too] */
    //var geometry = new THREE.PlaneGeometry(window.innerWidth , (2/3)*window.innerHeight);
    var geometry = new THREE.PlaneGeometry();
    planeMesh = new THREE.Mesh( geometry, material );
    scene.add( planeMesh );

    // get the img dom Element -> cf index.html
    var element = document.getElementById('show');
    cssObject = new THREE.CSS2DObject( element );
    // we reference the same position and rotation than the plane mesh
    cssObject.position.x = planeMesh.position.x;
    cssObject.position.y = planeMesh.position.y;
    sceneCss.add( cssObject );

    /* Create second plane mesh to position the "Settings" button and be able to click on it  */
    var geometry2 = new THREE.PlaneGeometry();
    planeMesh2 = new THREE.Mesh( geometry2, material );
    planeMesh2.position.y = -(2/3)*window.innerHeight;
    scene.add( planeMesh2 );
    
    /* Create CSS2DObject for the button */
    var button = document.createElement( 'button' );
    button.innerHTML = "Settings";
    cssObject2 = new THREE.CSS2DObject( button );
    cssObject2.position.x = planeMesh2.position.x;
    cssObject2.position.y = planeMesh2.position.y;
    sceneCss.add( cssObject2 );

    /* Create the renderers that are going to create the scenes */
    createRenderers();

    /* Add Event Listeners */
    window.addEventListener( 'resize', onWindowResize, false );
    button.addEventListener("click", generatePopUp);
    var restartButton = document.getElementById('restart');
    restartButton.addEventListener("click", restartApplication);

}

function addSpritesInGroup(group) {
    /* To add the moving particles in the background, we are going to use the array of images (their src)
    -> cf global variable "imageSrcs" defined at the beginning of index.js */
    for ( var i = 0; i < imageSrcs.length; i++ ) {
        var map = THREE.ImageUtils.loadTexture( imageSrcs[i] );
        var material = new THREE.SpriteMaterial( { map: map, color: 0xffffff} );
        particle = new THREE.Sprite( material );
        particle.position.x = Math.random() * 2000 - 1000;
        particle.position.y = Math.random() * 2000 - 1000;
        particle.position.z = Math.random() * 2000 - 1000;
        particle.scale.x = particle.scale.y = 200;
        group.add( particle );
    }
}

function createRenderers() {
    renderer = new THREE.CanvasRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0xffffff, 1);
    container.appendChild( renderer.domElement );

    cssRenderer = new THREE.CSS2DRenderer();
    cssRenderer.setSize( window.innerWidth, window.innerHeight );
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = '0';
    container.appendChild( cssRenderer.domElement );
}

function animate() {
    requestAnimationFrame( animate );
    render();
}

function render() {
    camera.lookAt( scene.position );
    group.rotation.x += 0.01;
    group.rotation.y += 0.02;
    renderer.render( scene, camera );
    cssRenderer.render( sceneCss, camera );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    cssRenderer.setSize( window.innerWidth, window.innerHeight );
}

var app = {

    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
        app.getAcceleration();
    },

    getAcceleration: function() {
        $(function() {
            deviceID = device.uuid;
            var cnt = 0;
            var addr = 'ws://' + IPaddress + ':' + port;

            oscPort = new osc.WebSocketPort({
                url: addr // URL to your Web Socket server.
            });
            oscPort.open();

            setTimeout(function() {
                var onSuccess = function (acceleration) {
                    updateAnimation(acceleration);
                    //$('#description').html('Acceleration X: ' + acceleration.x + '<br>' + 'Acceleration Y: ' + acceleration.y + '<br>' + 'Acceleration Z: ' + acceleration.z + '<br>' + 'Timestamp: '      + acceleration.timestamp + '<br>');
                    if (oscPort.readyState === oscPort.OPEN) {
                        oscPort.send({
                            timeTag: osc.timeTag(10),
                            packets: [
                                {
                                    address: "/acceleration/id/x/y/z",
                                    args: [deviceID, acceleration.x, acceleration.y, acceleration.z]
                                }
                            ]
                        });
                        cnt++;
                    } else {
                        delete oscPort;
                        oscPort = new osc.WebSocketPort({
                            url: addr // URL to your Web Socket server.
                        });
                        oscPort.open()
                    }

                };
                watchID = navigator.accelerometer.watchAcceleration(onSuccess, function() {}, { frequency: 20 });
            }, 1000);

        });
    },
    
};

/* Move the central Sprite around the screen when acceleration values change and following certain conditions */
function updateAnimation(acceleration) {

    var ball = new Image();
    ball.src = "../img/sprite.png";
    var xRadius = (ball.width)/2;
    var yRadius = (ball.height)/2;
    var W = window.innerWidth;
    var H = window.innerHeight;

    var dx = 0;
    var dy = 0;
    var newxPos = 0;
    var newyPos = 0;

    var oldxPos = cssObject.position.x;
    var oldyPos = cssObject.position.y;

    dx = -1*(acceleration.x * 1.5);
    dy = -1*(acceleration.y * 1.5);

    if (window.matchMedia("(orientation: portrait)").matches) {

        if ((Math.floor(Math.abs(acceleration.x)) == 0) && (Math.floor(Math.abs(acceleration.y)) == 0)) {
            cssObject.position.x = planeMesh.position.x;
            cssObject.position.y = planeMesh.position.y;
        }

        newxPos = oldxPos + dx;
        newyPos = oldyPos + dy;
        if ((Math.abs(newxPos) + xRadius) > W/2) { dx=0; }
            if (newyPos > 0) {
                if ((Math.abs(newyPos) + yRadius) > H/2) { dy=0; }
            } else {
                if ((Math.abs(newyPos) + yRadius) > (3/8)*H) { dy=0; } // note: H/3=(2/3)*H/2
            }
        /* decrease or increase the last number to change the speed of the central ball */
        cssObject.translateOnAxis( new THREE.Vector3(dx, dy, 0).normalize(), 5 );

    } else if (window.matchMedia("(orientation: landscape)").matches) {
        //if landscape orientation needed, invert axes (X becomes Y, Y becomes X)
    }
}

function restartApplication() {
    var newIPaddress = document.getElementById('newIPaddress').value;
    var newPort = document.getElementById('newPort').value;
    /* stop watching acceleration */
    if (watchID) {
        navigator.accelerometer.clearWatch(watchID);
    }
    /* delete WebSocket */
    delete oscPort;
    /* put the central ball back to the initial position */
    cssObject.position.x = planeMesh.position.x;
    cssObject.position.y = planeMesh.position.y;
    /* close pop up */
    popup('popUpDiv');
    /* reset inputs to blank */
    document.getElementById('newIPaddress').value = "";
    document.getElementById('newPort').value = "";
    
    if (newIPaddress== null || newIPaddress=="") {
        //use of old IP @
    } else {
        //use of new IP @
        IPaddress = newIPaddress;
    }

    if (newPort== null || newPort=="") {
        //use of old port
    } else {
        port = newPort;
    }
    app.getAcceleration();
}

/* Methods related to pop-up */

function generatePopUp() {
    popup('popUpDiv');
    document.getElementById('deviceID').innerText = "Device uuid : " + deviceID;
    document.getElementById('currentIPaddress').innerText = "Current IP address : " + IPaddress;
    document.getElementById('currentPort').innerText = "Current port : " + port;
}

function toggle(div_id) {
    var el = document.getElementById(div_id);
    if ( el.style.display == 'none' ) { el.style.display = 'block';}
    else {el.style.display = 'none';}
}

function popup(windowname) {
    blanket_size(windowname);
    window_pos(windowname);
    toggle('blanket');
    toggle(windowname);     
}

function blanket_size(popUpDivVar) {
    if (typeof window.innerWidth != 'undefined') {
        viewportheight = window.innerHeight;
    } else {
        viewportheight = document.documentElement.clientHeight;
    }
    if ((viewportheight > document.body.parentNode.scrollHeight) && (viewportheight > document.body.parentNode.clientHeight)) {
        blanket_height = viewportheight;
    } else {
        if (document.body.parentNode.clientHeight > document.body.parentNode.scrollHeight) {
            blanket_height = document.body.parentNode.clientHeight;
        } else {
            blanket_height = document.body.parentNode.scrollHeight;
        }
    }
    var blanket = document.getElementById('blanket');
    blanket.style.height = blanket_height + 'px';
    var popUpDiv = document.getElementById(popUpDivVar);
    popUpDiv_height=blanket_height/2-200;//200 is half popup's height -> cf css
    popUpDiv.style.top = popUpDiv_height + 'px';
}

function window_pos(popUpDivVar) {
    if (typeof window.innerWidth != 'undefined') {
        viewportwidth = window.innerWidth;
    } else {
        viewportwidth = document.documentElement.clientHeight;
    }
    if ((viewportwidth > document.body.parentNode.scrollWidth) && (viewportwidth > document.body.parentNode.clientWidth)) {
        window_width = viewportwidth;
    } else {
        if (document.body.parentNode.clientWidth > document.body.parentNode.scrollWidth) {
            window_width = document.body.parentNode.clientWidth;
        } else {
            window_width = document.body.parentNode.scrollWidth;
        }
    }
    var popUpDiv = document.getElementById(popUpDivVar);
    window_width=window_width/2-175; //175 is half popup's width -> cf css
    popUpDiv.style.left = window_width + 'px';
}

/* Call the three following methods to launch and start the application */

app.initialize();
init();
animate();
