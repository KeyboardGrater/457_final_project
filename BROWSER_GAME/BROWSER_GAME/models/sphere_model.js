"use strict";

export const sphere_vertices = [];

const segments = 32;     // Divisions around the sphere
const heightSteps = 16;  // Divisions from top to bottom
const radius = 0.5;

for (let i = 0; i < heightSteps; i++) {
    const latitude0 = (i / heightSteps) * Math.PI;
    const latitude1 = ((i + 1) / heightSteps) * Math.PI;

    for (let j = 0; j <= segments; j++) {
        // Repeat the starting angle exactly to close the seam.
        const angle = j == segments ? 0 : (j / segments) * 2 * Math.PI;

        const a = spherePoint(angle, latitude1);
        const b = spherePoint(angle, latitude0);

        // Join this band to the previous one with zero-area triangles.
        if (i > 0 && j == 0) sphere_vertices.push(sphere_vertices[sphere_vertices.length - 1], a);

        // Lower point, then upper point: faces point outward.
        sphere_vertices.push(a, b);
    }
}

function spherePoint(angle, latitude) {
    // Exact pole positions.
    if (latitude == 0) {
        return vec3(0, radius, 0);
    }

    if (latitude == Math.PI) {
        return vec3(0, -radius, 0);
    }

    return vec3(
        radius * Math.sin(latitude) * Math.cos(angle),
        radius * Math.cos(latitude),
        radius * Math.sin(latitude) * Math.sin(angle)
    );
}

spherePoint = null;