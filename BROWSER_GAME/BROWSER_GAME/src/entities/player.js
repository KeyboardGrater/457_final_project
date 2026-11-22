"use strict";

export class Player {
    constructor() {
        this.position = vec3(0, 0, 0);
        this.rotation = vec3(0, 0, 0); // X, Y, Z rotation in degrees
        
        this.scale = 1;
        this.health = 100;
        this.color = (vec4(0.1,0.5,0.6,1));

        //control animation to move one block
        this.moveDuration = 0.2; // One second per step
        this.moveRemaining = 0;
        this.moveDirection = vec3(0, 0, 0);
    }

    buildModelMatrix() {
        const progress = 1 - this.moveRemaining;
        const bounce = this.moveRemaining > 0 ? Math.sin(progress * Math.PI) : 0;

        let modelMatrix = translate(this.position[0], this.position[1] + bounce * 0.2, this.position[2]);

        const shear = mat4();
        shear[0][1] = -this.moveDirection[0] * bounce * 0.2;
        shear[2][1] = -this.moveDirection[2] * bounce * 0.2;

        modelMatrix = mult(modelMatrix, shear);
        modelMatrix = mult(modelMatrix, rotateY(this.rotation[1]));
        modelMatrix = mult(modelMatrix, scale(this.scale, this.scale, this.scale));

        return modelMatrix;
    }

    update(input, deltaTime) {
        this.initiateMovement(input);

        if (this.moveRemaining > 0) {
            const distance = Math.min(
                deltaTime / this.moveDuration,
                this.moveRemaining
            );

            this.position[0] += this.moveDirection[0] * distance;
            this.position[2] += this.moveDirection[2] * distance;

            this.moveRemaining -= distance;
        }
    }

    startMovement(direction) {
        if (this.moveRemaining > 0) return;

        this.moveDirection = direction;
        this.moveRemaining = 1;
    }

    //movement helper functions
    initiateMovement(input){
        if (input.wPressed) this.startMovement(vec3(0, 0, -1));
        else if (input.sPressed) this.startMovement(vec3(0, 0, 1));
        else if (input.aPressed) this.startMovement(vec3(-1, 0, 0));
        else if (input.dPressed) this.startMovement(vec3(1, 0, 0));

        input.wPressed = false;
        input.sPressed = false;
        input.aPressed = false;
        input.dPressed = false;
    }

    //render player object.
    render(renderer) {
        const playerMatrix = this.buildModelMatrix();

        // Body: y = 0 to 1.5
        let bodyMatrix = mult(playerMatrix, translate(0, 0.75, 0));
        bodyMatrix = mult(bodyMatrix, scale(0.8, 1.3, 0.8));
        renderer.drawCylinder(
            bodyMatrix, vec4(0.83, 0.58, 0.08, 1), true, 16, 0.1
        );

        // Rounded shoulders: y = 1.5 to 1.8
        let shoulderMatrix = mult(playerMatrix, translate(0, 1.5, 0));
        shoulderMatrix = mult(shoulderMatrix, scale(0.7, 0.6, 0.7));
        renderer.drawSphere(
            shoulderMatrix, vec4(0.83, 0.58, 0.08, 1), true, 16, 0.1, "top"
        );

        // Head: y = 1.8 to 2.2
        let headMatrix = mult(playerMatrix, translate(0, 2.0, 0));
        headMatrix = mult(headMatrix, scale(0.4, 0.4, 0.4));
        renderer.drawSphere(
            headMatrix, vec4(0.76, 0.55, 0.38, 1), true, 16, 0.2, "full"
        );
    }
}
   