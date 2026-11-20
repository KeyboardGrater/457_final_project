"use strict";

export class Floor_Planks {
    constructor(x=0, z=0) {
        this.position = vec3(x, 0, z);
        this.rotation = vec3(0, 0, 0); // X, Y, Z rotation in degrees
        
        this.scale = 1;

        this.color = randomBrown();
    }

    buildModelMatrix() {
        let modelMatrix = mat4();

        modelMatrix = mult(modelMatrix, translate(this.position[0], this.position[1], this.position[2]));

        modelMatrix = mult(modelMatrix, rotateY(this.rotation[1]));
        modelMatrix = mult(modelMatrix, scale(this.scale, this.scale, this.scale));

        return modelMatrix;
    }
}

function randomBrown() {
    let r=(Math.random() * (0.6 - 0.4) + 0.4);  // Mid-to-dark red
    let g=(Math.random() * (0.4 - 0.2) + 0.2);  // Lower green
    let b=(Math.random() * 0.15);      // Very little blue

    return vec4(r,g,b,1);
}


