"use strict";

export class Floor_Planks {
    constructor(x=0, z=0) {
        this.position = vec3(x, 0, z);
        this.rotation = vec3(0, 0, 0); // X, Y, Z rotation in degrees
        this.scale = 1;
        this.color = vec4(1, 1, 1, 1);
    }

    buildModelMatrix() {
        let modelMatrix = mat4();

        modelMatrix = mult(modelMatrix, translate(this.position[0], this.position[1], this.position[2]));

        modelMatrix = mult(modelMatrix, rotateY(this.rotation[1]));
        modelMatrix = mult(modelMatrix, scale(this.scale, this.scale, this.scale));

        return modelMatrix;
    }

    //render this entity.
    render(renderer, exposedX=false, exposedZ=false) {
        const modelMatrix = this.buildModelMatrix();
        const depth = 0.08;

        // Horizontal top surface.
        renderer.drawSquare(
            modelMatrix,
            this.color,
            true,
            8,
            0.02,
            false,
            vec4(1, 1, 1, 1),
            renderer.textures.wood
        );

        // Vertical side facing +x.
        if (exposedX) {
            let edgeMatrix = mult(
                modelMatrix,
                translate(0.5, -depth / 2, 0)
            );

            edgeMatrix = mult(edgeMatrix, rotateZ(-90));
            edgeMatrix = mult(edgeMatrix, scale(depth, 1, 1));

            renderer.drawSquare(
                edgeMatrix,
                vec4(1, 1, 1, 1),
                true,
                8,
                0.02,
                false,
                vec4(1, 1, 1, 1),
                renderer.textures.wood_edge
            );
        }

        // Vertical side facing +z.
        if (exposedZ) {
            let edgeMatrix = mult(
                modelMatrix,
                translate(0, -depth / 2, 0.5)
            );

            edgeMatrix = mult(edgeMatrix, rotateX(90));
            edgeMatrix = mult(edgeMatrix, scale(1, 1, depth));

            renderer.drawSquare(
                edgeMatrix,
                vec4(1, 1, 1, 1),
                true,
                8,
                0.02,
                false,
                vec4(1, 1, 1, 1),
                renderer.textures.wood_edge
            );
        }
    }
}


