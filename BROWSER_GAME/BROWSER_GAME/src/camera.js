"use strict";

export class Camera {
    constructor() {
        this.offset = vec3(0.2,0.8,1);
        this.up = vec3(0,1,0);

        this.viewHeight = 7;  //smaller viewheight will make it more zoomed in
        this.near = -5;   // near to -5 so the entire scene isnt cut off
        this.far = 200;   

        this.viewProjectionMatrix = mat4();
    }

    update(player, input, aspect) {
        this.target = player.position;

        this.position = add(this.target, this.offset);

        const halfHeight = this.viewHeight / 2;
        const halfWidth = halfHeight * aspect;

        const viewMatrix = lookAt(
            this.position,
            this.target,
            this.up
        );

        const projectionMatrix = ortho(
            -halfWidth, 
            halfWidth,
            -halfHeight, 
            halfHeight,
            this.near, 
            this.far
        );

        this.viewProjectionMatrix = mult(projectionMatrix, viewMatrix);

        input.mouseDeltaY = 0;
    }
}