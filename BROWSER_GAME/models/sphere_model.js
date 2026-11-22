"use strict";

export const sphere_vertices = [];
export const sphere_normals = [];

const depth = 3;
const radius = 0.5;

const top    = vec3(0, radius, 0);
const bottom = vec3(0, -radius, 0);
const front  = vec3(0, 0, radius);
const back   = vec3(0, 0, -radius);
const left   = vec3(-radius, 0, 0);
const right  = vec3(radius, 0, 0);

// Eight starting triangles, facing outward.
divideTriangle(top, front, right, depth);
divideTriangle(top, right, back, depth);
divideTriangle(top, back, left, depth);
divideTriangle(top, left, front, depth);

divideTriangle(bottom, right, front, depth);
divideTriangle(bottom, back, right, depth);
divideTriangle(bottom, left, back, depth);
divideTriangle(bottom, front, left, depth);

function divideTriangle(a, b, c, depth) {
    if (depth === 0) {
        sphere_vertices.push(a, b, c);

        // On a sphere, smooth normals point outward from its center.
        sphere_normals.push(
            vec3(a[0] / radius, a[1] / radius, a[2] / radius),
            vec3(b[0] / radius, b[1] / radius, b[2] / radius),
            vec3(c[0] / radius, c[1] / radius, c[2] / radius)
        );

        return;
    }

    const ab = sphereMidpoint(a, b);
    const bc = sphereMidpoint(b, c);
    const ca = sphereMidpoint(c, a);

    divideTriangle(a, ab, ca, depth - 1);
    divideTriangle(ab, b, bc, depth - 1);
    divideTriangle(ca, bc, c, depth - 1);
    divideTriangle(ab, bc, ca, depth - 1);
}

function sphereMidpoint(a, b) {
    const x = (a[0] + b[0]) / 2;
    const y = (a[1] + b[1]) / 2;
    const z = (a[2] + b[2]) / 2;

    const length = Math.sqrt(x * x + y * y + z * z);

    // Move the midpoint onto the sphere's surface.
    return vec3(
        radius * x / length,
        radius * y / length,
        radius * z / length
    );
}