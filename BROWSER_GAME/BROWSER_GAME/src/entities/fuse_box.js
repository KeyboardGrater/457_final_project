"use strict";

export class FuseBox {
    constructor(x=0, z=0, rotation=0) {
        this.position = vec3(x, 1.3, z);
        this.rotation = vec3(0, rotation, 0);
        this.active = false;
    }

    buildModelMatrix() {
        let modelMatrix = translate(this.position[0], this.position[1], this.position[2]);

        modelMatrix = mult(modelMatrix, rotateY(this.rotation[1]));

        return modelMatrix;
    }

    render(renderer) {
        const modelMatrix = this.buildModelMatrix();

        // Main housing
        let boxMatrix = mult(modelMatrix, scale(0.6, 0.8, 0.2));
        renderer.drawCube(boxMatrix, vec4(0.35, 0.35, 0.38, 1));

    }
}