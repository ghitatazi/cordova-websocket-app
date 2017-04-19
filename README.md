# cordova-websocket-app

## Technos

To develop the mobile application, I used a WebGL Framework called Three.js, that helps display 2D or 3D objects and animate them with special geometries, materials, effects and controls; on multiple Web platforms.

## How it works

The idea is to make the mobile device act as a connected object (in an IoT environment).

When the application is launched, a set of sprites appear in the background, rotating in the space.
In the center of the screen, there is a central object, that moves along with the acceleration values, when orientating the device on the right/left sides or on the front/back. When the device is put in a flat surface, the central object is positioned in the center of the screen.

At the bottom of the screen, there is a « Settings » button. When we click on it, a pop-up window appears. It shows the device identification (uuid), the current IP address and port used by the mobile device to send data to a sink gateway. There are also two inputs that enables the user to change these last values of IP address and port. He/She can also decide to restart the application without modifying the parameters. In this case, he/she has to simply click on the button « Restart ».
