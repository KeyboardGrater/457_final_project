"use strict";

export class ConeLight {
    constructor(position, color, intensity) {
        this.position = position;
        this.color = color;
        this.intensity = intensity;

        this.direction = vec3(0, -1, 0);
        this.innerAngle = 10; // Full brightness within this angle
        this.outerAngle = 15; // Fade to zero at this angle

        this.lightOffset = vec3(0.5,5,3);
    }

    follow(object){
        this.position = add(object.position, this.lightOffset);
        this.direction = normalize(subtract(object.position, this.position));
    }
}

export class PointLight {
    constructor(position, color, intensity) {
        this.position = position;
        this.color = color;
        this.intensity = intensity;

        this.lightOffset = vec3(0, 3, 0);
    }

    follow(object) {
        this.position = add(object.position, this.lightOffset);
    }
}