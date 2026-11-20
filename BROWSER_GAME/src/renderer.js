"use strict";

import {cube_vertices,cube_outline, cube_normals} from "../models/cube_model.js";
import {square_vertices, square_outline} from "../models/square_model.js";
import {cylinder_vertices, cylinder_normals} from "../models/cylinder_model.js";

export class Renderer {
    constructor(gl) {
        this.gl = gl;
        //initialize shaders
        this.program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(this.program);

        //create different object buffers
        this.cube_buffer = this.createModelBuffer(cube_vertices.concat(cube_outline).concat(cube_normals));
        this.square_buffer = this.createModelBuffer(square_vertices.concat(square_outline));
        this.cylinder_buffer = this.createModelBuffer(cylinder_vertices.concat(cylinder_normals));

        //initialize shader variables
        this.viewProjectionLoc = gl.getUniformLocation(this.program, "uViewProjection");
        this.positionLoc = gl.getAttribLocation(this.program, "aPosition");
        this.modelLoc = gl.getUniformLocation(this.program, "uModel");
        this.colorLoc = gl.getUniformLocation(this.program, "uColor");
        this.isDirectionalLoc = gl.getUniformLocation(this.program, "uIsDirectional");

        //BEGIN SHADER VARIABLES FOR LIGHTING
        this.normalLoc = gl.getAttribLocation(this.program, "aNormal");
        this.normalMatrixLoc = gl.getUniformLocation(this.program, "uNormalMatrix");
        this.lightPositionLoc = gl.getUniformLocation(this.program, "uLightPosition");
        this.lightColorLoc = gl.getUniformLocation(this.program, "uLightColor");
        this.ambientLoc = gl.getUniformLocation(this.program, "uAmbient");
        this.useLightingLoc = gl.getUniformLocation(this.program, "uUseLighting");
        //conelighting
        this.lightDirectionLoc = gl.getUniformLocation(this.program, "uLightDirection");
        this.innerCutoffLoc = gl.getUniformLocation(this.program, "uInnerCutoff");
        this.outerCutoffLoc = gl.getUniformLocation(this.program, "uOuterCutoff");
        //phong bling shading
        this.viewDirectionLoc = gl.getUniformLocation(this.program, "uViewDirection");
        this.shininessLoc = gl.getUniformLocation(this.program, "uShininess");
        this.specularStrengthLoc = gl.getUniformLocation(this.program, "uSpecularStrength");
        //END LIGHTING

        //configure webGL for rendering
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CCW);
        gl.clearColor(0,0,0,1);

    }

    //draw object functions
    drawPlayer(player) {
        const playerMatrix = player.buildModelMatrix();

        // Body
        let bodyMatrix = mult(playerMatrix, translate(0, 0.25, 0));
        bodyMatrix = mult(bodyMatrix, scale(0.7, 1.5, 0.7));

        this.drawCylinder(bodyMatrix, vec4(0.83, 0.58, 0.08, 1), true, 16, 10);

        // Head
        let headMatrix = mult(playerMatrix, translate(0, 1.3, 0));
        headMatrix = mult(headMatrix, scale(0.4, 0.4, 0.4));

        this.drawCube(headMatrix, vec4(0.76, 0.55, 0.38, 1), true, 16, 0.2);
    }

    drawFloorPlanks(planks) {
        const modelMatrix = planks.buildModelMatrix()
        this.drawSquare(modelMatrix, planks.color, true);
    }

    //draw basic shapes (cube,squares) that are used to make larger objects like player
    drawCube(modelMatrix, color, lighting=true, shininess=40, specularStrength=0.3, outline=false, outlineColor=vec4(1,1,1,1),) {
        const gl = this.gl;

        gl.uniform1f(this.shininessLoc, shininess);
        gl.uniform1f(this.specularStrengthLoc, specularStrength);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cube_buffer);

        // Positions begin at the start of the buffer.
        gl.vertexAttribPointer(this.positionLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.positionLoc);

        // Normals come after the filled vertices and outline vertices. START OF LIGHTING CODE
        const normalOffset =
            (cube_vertices.length + cube_outline.length) * 3 * Float32Array.BYTES_PER_ELEMENT;

        gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, normalOffset);
        gl.enableVertexAttribArray(this.normalLoc);

        gl.uniformMatrix4fv(this.modelLoc, false, flatten(modelMatrix));
        gl.uniformMatrix3fv(this.normalMatrixLoc, false, flatten(normalMatrix(modelMatrix)));
        gl.uniform4fv(this.colorLoc, flatten(color));
        gl.uniform1i(this.useLightingLoc, lighting ? 1 : 0);
        //END OF LIGHTING CODE

        // Filled faces
        if (outline) {
            gl.enable(gl.POLYGON_OFFSET_FILL);
            gl.polygonOffset(1, 1);
        }

        gl.drawArrays(gl.TRIANGLES, 0, cube_vertices.length);

        // Outline
        if (outline) {
            gl.disable(gl.POLYGON_OFFSET_FILL);

            // Outlines have no normal data and do not receive lighting.
            gl.disableVertexAttribArray(this.normalLoc);
            gl.vertexAttrib3f(this.normalLoc, 0, 1, 0);
            gl.uniform1i(this.useLightingLoc, 0);

            gl.uniform4fv(this.colorLoc, flatten(outlineColor));
            gl.drawArrays(gl.LINE_LOOP, cube_vertices.length, cube_outline.length);
        }
    }

    drawSquare(modelMatrix, color, lighting=true, shininess=40, specularStrength=0.3, outline=false, outlineColor=vec4(1,1,1,1)) {
        const gl = this.gl;

        gl.uniform1f(this.shininessLoc, shininess);
        gl.uniform1f(this.specularStrengthLoc, specularStrength);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.square_buffer);
        gl.vertexAttribPointer(this.positionLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.positionLoc);

        gl.uniformMatrix4fv(this.modelLoc, false, flatten(modelMatrix));
        // LIGHTING START
        gl.disableVertexAttribArray(this.normalLoc);
        gl.vertexAttrib3f(this.normalLoc, 0, 1, 0);

        gl.uniformMatrix3fv(this.normalMatrixLoc, false, flatten(normalMatrix(modelMatrix)));
        gl.uniform4fv(this.colorLoc, flatten(color));
        gl.uniform1i(this.useLightingLoc, lighting ? 1 : 0);
        //LIGHTING END

        // Filled face
        if (outline) {
            gl.enable(gl.POLYGON_OFFSET_FILL);
            gl.polygonOffset(1, 1);
        }

        gl.drawArrays(gl.TRIANGLES, 0, square_vertices.length);

        // Outline
        if (outline) {
            gl.disable(gl.POLYGON_OFFSET_FILL);
            gl.uniform1i(this.useLightingLoc, 0);

            gl.uniform4fv(this.colorLoc, flatten(outlineColor));
            gl.drawArrays(gl.LINE_LOOP, square_vertices.length, square_outline.length);
        }
    }

    drawCylinder(modelMatrix, color, lighting=true, shininess=32, specularStrength=0.5) {
        const gl = this.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.cylinder_buffer);

        // Positions start at the beginning of the buffer.
        gl.vertexAttribPointer(this.positionLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.positionLoc);

        // Normals follow the positions.
        const normalOffset =
            cylinder_vertices.length * 3 * Float32Array.BYTES_PER_ELEMENT;

        gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, normalOffset);
        gl.enableVertexAttribArray(this.normalLoc);

        gl.uniformMatrix4fv(this.modelLoc, false, flatten(modelMatrix));
        gl.uniformMatrix3fv(
            this.normalMatrixLoc,
            false,
            flatten(normalMatrix(modelMatrix))
        );

        gl.uniform4fv(this.colorLoc, flatten(color));
        gl.uniform1i(this.useLightingLoc, lighting ? 1 : 0);
        gl.uniform1f(this.shininessLoc, shininess);
        gl.uniform1f(this.specularStrengthLoc, specularStrength);

        gl.drawArrays(gl.TRIANGLES, 0, cylinder_vertices.length);
    }
    
    //helper functions
    setLightUniforms(Lights, camera, ambient) {
        const gl = this.gl;

        const viewDirection = normalize(subtract(camera.position, camera.target));
        gl.uniform3fv(this.viewDirectionLoc, flatten(viewDirection));
        gl.uniform1f(this.ambientLoc, ambient);

        //hovering cone (main) light
        gl.uniform3fv(this.lightPositionLoc, flatten(Lights[0].position));
        gl.uniform3fv(this.lightColorLoc, new Float32Array(Lights[0].color.map(value => value * Lights[0].intensity)));
        gl.uniform3fv(this.lightDirectionLoc, flatten(Lights[0].direction));
        gl.uniform1f(this.innerCutoffLoc, Math.cos(Lights[0].innerAngle * Math.PI / 180));
        gl.uniform1f(this.outerCutoffLoc, Math.cos(Lights[0].outerAngle * Math.PI / 180));
    }

    resizeCanvasToDisplaySize() {
        const gl = this.gl;
        const canvas = gl.canvas;
        const pixelRatio = window.devicePixelRatio || 1;
        const newWidth = Math.round(canvas.clientWidth * pixelRatio);
        const newHeight = Math.round(canvas.clientHeight * pixelRatio);

        if (canvas.width !== newWidth || canvas.height !== newHeight) {
            canvas.width = newWidth;
            canvas.height = newHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }

        return canvas.width / canvas.height;
    }

    createModelBuffer(vertices) {
        const gl = this.gl;

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

        return buffer;
    }

    clear() {
        const gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

}