"use strict";

// using boolean logic to allow for animations instead of just raw movement.
export function setupInput(canvas) {
    const input = {
        wPressed: false,
        aPressed: false,
        sPressed: false,
        dPressed: false
    };

    //WASD inputs
    window.addEventListener("keydown", (event) => {
        if ((event.key === "w" || event.key === "ArrowUp") && !event.repeat) input.wPressed = true;
        if ((event.key === "a" || event.key === "ArrowLeft") && !event.repeat) input.aPressed = true;
        if ((event.key === "s" || event.key === "ArrowDown") && !event.repeat) input.sPressed = true;
        if ((event.key === "d" || event.key === "ArrowRight") && !event.repeat) input.dPressed = true;
    });

    return input;
}