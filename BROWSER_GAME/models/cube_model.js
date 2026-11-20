"use strict";

export const cube_vertices = [];
export const cube_normals = [];

const depth = 4;

// Front corners (+Z)
const a = vec3(-0.5, -0.5,  0.5);
const b = vec3( 0.5, -0.5,  0.5);
const c = vec3( 0.5,  0.5,  0.5);
const d = vec3(-0.5,  0.5,  0.5);

// Back corners (-Z)
const e = vec3(-0.5, -0.5, -0.5);
const f = vec3( 0.5, -0.5, -0.5);
const g = vec3( 0.5,  0.5, -0.5);
const h = vec3(-0.5,  0.5, -0.5);

// Corners are counterclockwise when viewed from outside.

// Front
divideFace(a, b, c, d, vec3(0, 0, 1), depth);
// Back
//divideFace(f, e, h, g, vec3(0, 0, -1), depth);
// Right
divideFace(b, f, g, c, vec3(1, 0, 0), depth);
// Left
//divideFace(e, a, d, h, vec3(-1, 0, 0), depth);
// Top
divideFace(d, c, g, h, vec3(0, 1, 0), depth);
// Bottom Face
//divideFace(e, f, b, a, vec3(0, -1, 0), depth);

// Outer cube edges for LINE_LOOP.
export const cube_outline = [
    a, b, f, g, c, b, f, e,
    a, d, h, g, c, d, h, e
];

function divideFace(a, b, c, d, normal, depth) {
    if (depth == 0) {
        cube_vertices.push(a, b, c);
        cube_vertices.push(a, c, d);

        // One normal for each of the six vertex entries.
        cube_normals.push(normal, normal, normal);
        cube_normals.push(normal, normal, normal);
        return;
    }

    const ab = midpoint(a, b);
    const bc = midpoint(b, c);
    const cd = midpoint(c, d);
    const da = midpoint(d, a);
    const center = midpoint(a, c);

    divideFace(a, ab, center, da, normal, depth - 1);
    divideFace(ab, b, bc, center, normal, depth - 1);
    divideFace(center, bc, c, cd, normal, depth - 1);
    divideFace(da, center, cd, d, normal, depth - 1);
}

function midpoint(a, b) {
    return vec3(
        (a[0] + b[0]) / 2,
        (a[1] + b[1]) / 2,
        (a[2] + b[2]) / 2
    );
}

//free memory
divideFace = null;
midpoint = null;