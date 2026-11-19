"use strict";

export const cylinder_vertices = [];
export const cylinder_normals = [];

const segments = 100;     // Divisions around the cylinder
const heightSteps = 5;   // Divisions vertically for per-vertex lighting
const radius = 0.5;
const height = 1;

for (let i = 0; i < segments; i++) {
    const angle0 = (i / segments) * 2 * Math.PI;
    const angle1 = ((i + 1) / segments) * 2 * Math.PI;

    // Side normals point horizontally outward.
    const normal0 = vec3(Math.cos(angle0), 0, Math.sin(angle0));
    const normal1 = vec3(Math.cos(angle1), 0, Math.sin(angle1));

    // Build the curved side.
    for (let j = 0; j < heightSteps; j++) {
        const y0 = -height / 2 + (j / heightSteps) * height;
        const y1 = -height / 2 + ((j + 1) / heightSteps) * height;

        const a = ringPoint(angle0, y0);
        const b = ringPoint(angle0, y1);
        const c = ringPoint(angle1, y1);
        const d = ringPoint(angle1, y0);

        addTriangle(a, b, c, normal0, normal0, normal1);
        addTriangle(a, c, d, normal0, normal1, normal1);
    }

    // Top cap: normals point upward.
    const topCenter = vec3(0, height / 2, 0);
    const top0 = ringPoint(angle0, height / 2);
    const top1 = ringPoint(angle1, height / 2);
    const up = vec3(0, 1, 0);

    addTriangle(topCenter, top1, top0, up, up, up);

    // Bottom cap: normals point downward.
    const bottomCenter = vec3(0, -height / 2, 0);
    const bottom0 = ringPoint(angle0, -height / 2);
    const bottom1 = ringPoint(angle1, -height / 2);
    const down = vec3(0, -1, 0);

    addTriangle(bottomCenter, bottom0, bottom1, down, down, down);
}

function ringPoint(angle, y) {
    return vec3(
        radius * Math.cos(angle),
        y,
        radius * Math.sin(angle)
    );
}

function addTriangle(a, b, c, normalA, normalB, normalC) {
    cylinder_vertices.push(a, b, c);
    cylinder_normals.push(normalA, normalB, normalC);
}

ringPoint = null;
addTriangle = null;