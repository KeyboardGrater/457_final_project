"use strict";

//game is like a middleman for all of the src files. It will call update
import {Player} from "./entities/player.js";
import {Floor_Planks} from "./entities/floor_planks.js";
import {ConeLight, PointLight} from "./entities/light.js";

//game class contains an instance the renderer, camera, and input classes.
export class Game {
    constructor(renderer, camera, input) {
        // create objects for input and rendering
        this.renderer = renderer;
        this.camera = camera;
        this.input = input;
        this.ambient = 0;

        this.player = new Player(); //create new player

        //generate floor grid consisting of floor objects
        this.Floor = [];
        for (let x = 0; x < 10; x++) {
            for (let z = 0; z < 10; z++) {
                this.Floor.push(new Floor_Planks(x,z));
            }
        }

        //Array containing lighting objects from "/entities/light.js"
        this.Lights = [
            new ConeLight(vec3(0,10,0),vec3(1,1,1),2),
            new PointLight(vec3(0,10,0),vec3(1,1,1),2),
        ];
    }

    // update our world before sending our objects through the graphics pipeline.
    update(deltaTime) {
        //update player based on position
        this.player.update(this.input, deltaTime);

        //update main cone light position to stay above and follow player.
        this.Lights[0].follow(this.player);

        //find aspect of window after resize
        const aspect = this.renderer.resizeCanvasToDisplaySize();

        //update the camera
        this.camera.update(this.player, this.input, aspect);
    }

    draw() {
        this.renderer.clear();  // call renderer function to clear all depth and line and framebuffer.

        //THE NEXT 3 FUNCTIONS ARE IN DRAW() BECAUSE THEY ARE THE SAME FOR EVERYTHING THAT IS RENDERED IN THE SCENE.
        //set the viewProjectionMatrix uniforms here because it will be the same for the entire board in a draw call
        this.renderer.gl.uniformMatrix4fv(this.renderer.viewProjectionLoc, false, flatten(this.camera.viewProjectionMatrix));
        //call setConeLight to fill the uniforms needed for lighting. Camera is needed for Blinn-Phong shading.
        this.renderer.setLightUniforms(this.Lights, this.camera, this.ambient);

        //next 2 lines call renderer functions to draw the player and the floor. Every shape is made from squares and cubes added together.
        this.renderer.drawPlayer(this.player, this.camera);
        for (const planks of this.Floor) {
            this.renderer.drawFloorPlanks(planks, this.camera);  
        }
    }
}