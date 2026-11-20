"use strict";

//main.js configures webGL and runs the game loop. Also inti + assigns src.js objects to game object.
//To start new game reassign renderer, camera, input, and game.

import {Renderer} from "./renderer.js";
import {Camera} from "./camera.js";
import {setupInput} from "./input.js";
import {Game} from "./game.js";

window.onload = function () {
    const canvas = document.getElementById("gl-canvas");
    const gl = canvas.getContext("webgl2");

    if (!gl) {
        alert("WebGL2 is not available.");
        return;}

    const renderer = new Renderer(gl);
    const camera = new Camera();
    const input = setupInput(canvas);

    const game = new Game(renderer, camera, input);

    let previousTime = 0;
    requestAnimationFrame(gameLoop);
    //This loop calls game.js functions to update and then draw the board. 
    function gameLoop(currentTime) {
         //deltaTime is used later so player speed doesnt increase with frame rate.
        const deltaTime = (currentTime - previousTime)/1000; 
        previousTime = currentTime;

        game.update(deltaTime);
        game.draw();

        requestAnimationFrame(gameLoop);
    }
};