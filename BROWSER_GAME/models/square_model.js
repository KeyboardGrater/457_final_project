"use strict";

export const square_vertices = [];

const depth = 4;

const a = vec3(-0.5, 0,  0.5);
const b = vec3( 0.5, 0,  0.5);
const c = vec3( 0.5, 0, -0.5);
const d = vec3(-0.5, 0, -0.5);
export const square_outline = [a, b, c, d];

divideSquare(a, b, c, d, depth);

function divideSquare(a, b, c, d, depth) {
    if (depth == 0) {
        square_vertices.push(a, b, c);
        square_vertices.push(a, c, d);
        return;
    }

    const ab = midpoint(a, b);
    const bc = midpoint(b, c);
    const cd = midpoint(c, d);
    const da = midpoint(d, a);
    const center = midpoint(a, c);

    divideSquare(a, ab, center, da, depth-1);
    divideSquare(ab, b, bc, center, depth-1);
    divideSquare(center, bc, c, cd, depth-1);
    divideSquare(da, center, cd, d, depth-1);
}

function midpoint(a, b) {
    return vec3(
        (a[0] + b[0]) / 2,
        (a[1] + b[1]) / 2,
        (a[2] + b[2]) / 2
    );
}

midpoint = null;
divideSquare = null;