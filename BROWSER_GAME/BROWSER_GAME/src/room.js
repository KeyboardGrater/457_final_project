"use strict";

import {Floor_Planks} from "./entities/floor_planks.js";
import {FuseBox} from "./entities/fuse_box.js";

export class Room {
    constructor(player, entrance={x:7, z:0}) {
        const size = 23;
        this.size = size;
        this.objectGrid = Array.from({length:size},() => Array(size).fill(9));
        this.player = player;


        this.fuseBoxes = [];
        this.entrance = {x: entrance.x, z: entrance.z};
        this.exit = null;
        
        //INIT THE FLOOR AND WALLS, ETC.
        //init just the floor planks
        this.floor = Array.from({length:size},() => Array(size).fill(0));
        for (let x = 0; x < size; x++) {
            for (let z = 0; z < size; z++) {
                this.floor[x][z] = new Floor_Planks(x,z);
            }
        }
        //END FLOOR AND WALLS

        this.generateRoom();
    }

    //PROCEDURAL GENERATION
    generateRoom(){            
        this.generateEntrance();  // 1 is enterance
        this.generateExit();      // 2 is exit
        this.generateFuseBoxes(); // 3 is fuse box
        this.generateKey();       // 4 is key

        this.generatePath();      // 0 means the spot remains clear(required path)
        this.generateLoop();
        this.generateFalseBranches();
        this.fillHoles();
        this.connectIsolatedPlanks();

        console.table(this.objectGrid);
    }
    generateEntrance() {
        const x = this.entrance.x;
        const z = this.entrance.z;
        const last = this.size - 1;

        let frontX = x;
        let frontZ = z;

        if (z === 0) {
            this.entranceWall = 0;
            frontZ = 1;
        }
        else if (z === last) {
            this.entranceWall = 1;
            frontZ = last - 1;
        }
        else if (x === 0) {
            this.entranceWall = 2;
            frontX = 1;
        }
        else if (x === last) {
            this.entranceWall = 3;
            frontX = last - 1;
        }

        this.player.position = vec3(x, 0, z);

        // Cancel any unfinished movement from the previous room.
        this.player.moveRemaining = 0;
        this.player.moveDirection = vec3(0, 0, 0);

        this.objectGrid[x][z] = 1;
        this.objectGrid[frontX][frontZ] = 0;
    }
    generateExit() {
        const walls = [0, 1, 2, 3];
        walls.splice(walls.indexOf(this.entranceWall), 1);

        this.exitWall = walls[
            Math.floor(Math.random() * walls.length)
        ];

        const start = Math.ceil(this.size / 3);
        const end = Math.floor(2 * this.size / 3) - 1;
        const along = start + Math.floor(Math.random() * (end - start + 1));

        const last = this.size - 1;
        let x, z, frontX, frontZ;

        switch (this.exitWall) {
            case 0:
                x = along;
                z = 0;
                frontX = x;
                frontZ = 1;
                break;
            case 1:
                x = along;
                z = last;
                frontX = x;
                frontZ = last - 1;
                break;
            case 2:
                x = 0;
                z = along;
                frontX = 1;
                frontZ = z;
                break;
            case 3:
                x = last;
                z = along;
                frontX = last - 1;
                frontZ = z;
                break;
        }

        this.exit = {x: x, z: z};

        this.objectGrid[x][z] = 2;
        this.objectGrid[frontX][frontZ] = 0;
    }
    generateFuseBoxes() {
        this.fuseBoxes = [];

        const last = this.size - 1;
        const start = Math.ceil(this.size / 3);
        const end = Math.floor(2 * this.size / 3) - 1;

        // Wall numbers: 0 = back, 1 = front, 2 = left, 3 = right
        const walls = [0, 1, 2, 3].filter(wall =>
            wall !== this.entranceWall &&
            wall !== this.exitWall
        );

        for (const wall of walls) {
            const along = start + Math.floor(
                Math.random() * (end - start + 1)
            );

            let x, z, frontX, frontZ, rotation;

            switch (wall) {
                case 0: // Back
                    x = along;
                    z = 0;
                    frontX = x;
                    frontZ = 1;
                    rotation = 0;
                    break;

                case 1: // Front
                    x = along;
                    z = last;
                    frontX = x;
                    frontZ = last - 1;
                    rotation = 180;
                    break;

                case 2: // Left
                    x = 0;
                    z = along;
                    frontX = 1;
                    frontZ = z;
                    rotation = 90;
                    break;

                case 3: // Right
                    x = last;
                    z = along;
                    frontX = last - 1;
                    frontZ = z;
                    rotation = -90;
                    break;
            }

            this.fuseBoxes.push(new FuseBox(x, z, rotation));

            this.objectGrid[x][z] = 3;           // Fuse box
            this.objectGrid[frontX][frontZ] = 0; // Reserved access
        }
    }
    generateKey() {
        const available = [];
        const minDistance = 14;

        for (let x = 1; x < this.size - 1; x++) {
            for (let z = 1; z < this.size - 1; z++) {
                const type = this.objectGrid[x][z];

                const distance =
                    Math.abs(x - this.entrance.x) +
                    Math.abs(z - this.entrance.z);

                if ((type === 9 || type === 999) &&
                    distance >= minDistance) {
                    available.push({x: x, z: z});
                }
            }
        }

        if (available.length === 0) {
            this.key = null;
            return;
        }

        const index = Math.floor(Math.random() * available.length);
        this.key = available[index];

        this.objectGrid[this.key.x][this.key.z] = 4;
    }
    generatePath() {
        const last = this.size - 1;

        const randomInt = (min, max) =>
            min + Math.floor(Math.random() * (max - min + 1));

        // Keep waypoints toward the outer part of each quadrant.
        const lowMin = 2;
        const lowMax = Math.floor((this.size - 1) / 3);
        const highMin = last - lowMax;
        const highMax = last - lowMin;

        const waypoints = [
            {x: randomInt(lowMin, lowMax),
            z: randomInt(lowMin, lowMax)},

            {x: randomInt(highMin, highMax),
            z: randomInt(lowMin, lowMax)},

            {x: randomInt(highMin, highMax),
            z: randomInt(highMin, highMax)},

            {x: randomInt(lowMin, lowMax),
            z: randomInt(highMin, highMax)}
        ];

        // Randomly choose the direction around the room.
        if (Math.random() < 0.5) {
            waypoints.reverse();
        }

        // Randomly choose which quadrant starts the route.
        const first = randomInt(0, waypoints.length - 1);
        const ordered = waypoints.slice(first).concat(
            waypoints.slice(0, first)
        );

        const mainPath = [];

        // Connect two interior points using short runs and turns.
        const connect = (start, end, recordMainPath = false) => {
            let x = start.x;
            let z = start.z;
            let moveX = Math.random() < 0.5;

            const markTile = () => {
                const type = this.objectGrid[x][z];

                // Preserve important object markers.
                if (type !== 1 && type !== 2 && type !== 3 && type !== 4) {
                    this.objectGrid[x][z] = 0;
                }

                if (recordMainPath) {
                    mainPath.push({x: x, z: z});
                }
            };

            markTile();

            while (x !== end.x || z !== end.z) {
                // If one axis is finished, use the other.
                if (x === end.x) {
                    moveX = false;
                }
                else if (z === end.z) {
                    moveX = true;
                }

                const remaining = moveX
                    ? Math.abs(end.x - x)
                    : Math.abs(end.z - z);

                const steps = Math.min(randomInt(1, 3), remaining);

                for (let i = 0; i < steps; i++) {
                    if (moveX) {
                        x += Math.sign(end.x - x);
                    }
                    else {
                        z += Math.sign(end.z - z);
                    }

                    markTile();
                }

                // Try the other axis for the next run.
                moveX = !moveX;
            }
        };

        // Build one main route through all four quadrants.
        // Leave the last-to-first connection out.
        for (let i = 0; i < ordered.length - 1; i++) {
            connect(ordered[i], ordered[i + 1], true);
        }

        // Connect each important object to the main route.
        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                const type = this.objectGrid[x][z];

                if (type !== 1 && type !== 2 && type !== 3 && type != 4) {
                    continue;
                }

                // Use the interior tile in front of the object.
                const start = {x: x, z: z};

                if (z === 0) {
                    start.z = 1;
                }
                else if (z === last) {
                    start.z = last - 1;
                }
                else if (x === 0) {
                    start.x = 1;
                }
                else if (x === last) {
                    start.x = last - 1;
                }

                // Find the closest main-route tile.
                let nearest = mainPath[0];
                let bestDistance = Infinity;

                for (const tile of mainPath) {
                    const distance =
                        Math.abs(tile.x - start.x) +
                        Math.abs(tile.z - start.z);

                    if (distance < bestDistance) {
                        bestDistance = distance;
                        nearest = tile;
                    }
                }

                connect(start, nearest);
            }
        }
    }
    generateLoop() {
        const directions = [
            {x: 1, z: 0},
            {x: -1, z: 0},
            {x: 0, z: 1},
            {x: 0, z: -1}
        ];

        const inside = (x, z) =>
            x >= 1 && x < this.size - 1 &&
            z >= 1 && z < this.size - 1;

        const isPath = (x, z) => {
            const type = this.objectGrid[x][z];
            return type === 0 || type === 4;
        };

        const isUnused = (x, z) => {
            const type = this.objectGrid[x][z];
            return type === 9 || type === 999;
        };

        const makeGrid = () =>
            Array.from({length: this.size}, () =>
                Array(this.size).fill(-1)
            );

        const minSeparation = Math.max(3, Math.floor(this.size / 3));
        const minSaving = Math.max(4, Math.floor(this.size / 3));

        let bestConnection = null;
        let bestSaving = -1;

        for (let x = 1; x < this.size - 1; x++) {
            for (let z = 1; z < this.size - 1; z++) {
                if (!isPath(x, z)) continue;

                const start = {x, z};

                // Measure walking distances along existing paths.
                const walking = makeGrid();
                const queue = [start];
                walking[x][z] = 0;

                for (let head = 0; head < queue.length; head++) {
                    const current = queue[head];

                    for (const direction of directions) {
                        const nx = current.x + direction.x;
                        const nz = current.z + direction.z;

                        if (!inside(nx, nz)) continue;
                        if (!isPath(nx, nz)) continue;
                        if (walking[nx][nz] !== -1) continue;

                        walking[nx][nz] =
                            walking[current.x][current.z] + 1;

                        queue.push({x: nx, z: nz});
                    }
                }

                // Search for a new connection through unused tiles.
                const distance = makeGrid();
                const parent = Array.from({length: this.size}, () =>
                    Array(this.size).fill(null)
                );

                const search = [start];
                distance[x][z] = 0;

                for (let head = 0; head < search.length; head++) {
                    const current = search[head];

                    // Shuffle directions to vary the route's bends.
                    const choices = directions.slice();

                    for (let i = choices.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [choices[i], choices[j]] = [choices[j], choices[i]];
                    }

                    for (const direction of choices) {
                        const nx = current.x + direction.x;
                        const nz = current.z + direction.z;

                        if (!inside(nx, nz)) continue;
                        if (distance[nx][nz] !== -1) continue;
                        if (!isUnused(nx, nz) && !isPath(nx, nz)) continue;

                        distance[nx][nz] =
                            distance[current.x][current.z] + 1;

                        parent[nx][nz] = current;

                        if (isUnused(nx, nz)) {
                            search.push({x: nx, z: nz});
                            continue;
                        }

                        // Reached another existing path.
                        // Do not search through it.
                        const separation =
                            Math.abs(nx - x) + Math.abs(nz - z);

                        if (separation < minSeparation) continue;
                        if (walking[nx][nz] === -1) continue;

                        const saving =
                            walking[nx][nz] - distance[nx][nz];

                        if (saving < minSaving || saving <= bestSaving) {
                            continue;
                        }

                        // Reconstruct the proposed connection.
                        const route = [];
                        let tile = {x: nx, z: nz};

                        while (tile !== null) {
                            route.push(tile);
                            tile = parent[tile.x][tile.z];
                        }

                        // Require movement on both axes: no straight line.
                        let usesX = false;
                        let usesZ = false;

                        for (let i = 1; i < route.length; i++) {
                            if (route[i].x !== route[i - 1].x) usesX = true;
                            if (route[i].z !== route[i - 1].z) usesZ = true;
                        }

                        if (!usesX || !usesZ) continue;

                        bestSaving = saving;
                        bestConnection = route;
                    }
                }
            }
        }

        if (bestConnection === null) {
            return false;
        }

        // Draw only the new connecting path.
        for (const tile of bestConnection) {
            if (isUnused(tile.x, tile.z)) {
                this.objectGrid[tile.x][tile.z] = 0;
            }
        }

        return true;
    }
    generateFalseBranches(count=3) {
        const directions = [
            {x: 1, z: 0},
            {x: -1, z: 0},
            {x: 0, z: 1},
            {x: 0, z: -1}
        ];

        const inside = (x, z) =>
            x >= 1 && x < this.size - 1 &&
            z >= 1 && z < this.size - 1;

        const isFloor = (x, z) => {
            const type = this.objectGrid[x][z];
            return type >= 0 && type <= 4;
        };

        // Require at least 18 unused tiles in the surrounding 5x5 area.
        const minOpenSpace = 18;

        const openSpace = Array.from({length: this.size}, () =>
            Array(this.size).fill(0)
        );

        // Measure gaps before adding branches.
        for (let x = 1; x < this.size - 1; x++) {
            for (let z = 1; z < this.size - 1; z++) {
                for (let dx = -2; dx <= 2; dx++) {
                    for (let dz = -2; dz <= 2; dz++) {
                        const nx = x + dx;
                        const nz = z + dz;

                        if (!inside(nx, nz)) continue;

                        const type = this.objectGrid[nx][nz];

                        if (type === 9 || type === 999) {
                            openSpace[x][z]++;
                        }
                    }
                }
            }
        }

        // Branches start from existing paths.
        const starts = [];

        for (let x = 1; x < this.size - 1; x++) {
            for (let z = 1; z < this.size - 1; z++) {
                if (this.objectGrid[x][z] === 0) {
                    starts.push({x, z});
                }
            }
        }

        if (starts.length === 0) return 0;

        let created = 0;

        for (let attempt = 0; attempt < 100 && created < count; attempt++) {
            let current = starts[
                Math.floor(Math.random() * starts.length)
            ];

            const targetLength = 4 + Math.floor(Math.random() * 4);
            const branch = [];

            for (let step = 0; step < targetLength; step++) {
                const choices = [];

                for (const direction of directions) {
                    const x = current.x + direction.x;
                    const z = current.z + direction.z;

                    if (!inside(x, z)) continue;

                    const type = this.objectGrid[x][z];

                    if (type !== 9 && type !== 999) continue;
                    if (openSpace[x][z] < minOpenSpace) continue;

                    // Only the previous tile may touch the new tile.
                    let floorNeighbors = 0;

                    for (const neighbor of directions) {
                        if (isFloor(x + neighbor.x, z + neighbor.z)) {
                            floorNeighbors++;
                        }
                    }

                    if (floorNeighbors === 1) {
                        choices.push({x, z, original: type});
                    }
                }

                if (choices.length === 0) break;

                const next = choices[
                    Math.floor(Math.random() * choices.length)
                ];

                this.objectGrid[next.x][next.z] = 0;
                branch.push(next);
                current = next;
            }

            if (branch.length >= 4) {
                created++;
            }
            else {
                // Undo branches shorter than 4 tiles.
                for (const tile of branch) {
                    this.objectGrid[tile.x][tile.z] = tile.original;
                }
            }
        }

        return created;
    }
    fillHoles(percentFilled=0.5) {
        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                const type = this.objectGrid[x][z];

                if (type !== 9 && type !== 999) continue;

                if (Math.random() <  percentFilled) {
                    this.objectGrid[x][z] = 0;
                }
            }
        }
    }
    connectIsolatedPlanks() {
        const directions = [
            {x: 1, z: 0},
            {x: -1, z: 0},
            {x: 0, z: 1},
            {x: 0, z: -1}
        ];

        const inside = (x, z) =>
            x >= 0 && x < this.size &&
            z >= 0 && z < this.size;

        const isFloor = (x, z) => {
            const type = this.objectGrid[x][z];
            return type >= 0 && type <= 4;
        };

        const makeVisited = () =>
            Array.from({length: this.size}, () =>
                Array(this.size).fill(false)
            );

        // Collect all floor tiles connected to a starting tile.
        const collectGroup = (start, visited) => {
            const group = [start];
            visited[start.x][start.z] = true;

            for (let head = 0; head < group.length; head++) {
                const current = group[head];

                for (const direction of directions) {
                    const x = current.x + direction.x;
                    const z = current.z + direction.z;

                    if (!inside(x, z)) continue;
                    if (visited[x][z] || !isFloor(x, z)) continue;

                    visited[x][z] = true;
                    group.push({x, z});
                }
            }

            return group;
        };

        // Find the largest existing floor group.
        const visited = makeVisited();
        let mainGroup = [];

        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                if (visited[x][z] || !isFloor(x, z)) continue;

                const group = collectGroup({x, z}, visited);

                if (group.length > mainGroup.length) {
                    mainGroup = group;
                }
            }
        }

        if (mainGroup.length === 0) return;

        const root = mainGroup[0];

        while (true) {
            const searched = makeVisited();
            const parent = Array.from({length: this.size}, () =>
                Array(this.size).fill(null)
            );

            // Search outward from every tile in the main group.
            const queue = mainGroup.slice();

            for (const tile of mainGroup) {
                searched[tile.x][tile.z] = true;
            }

            let target = null;

            for (let head = 0; head < queue.length && target === null; head++) {
                const current = queue[head];

                for (const direction of directions) {
                    const x = current.x + direction.x;
                    const z = current.z + direction.z;

                    if (!inside(x, z) || searched[x][z]) continue;

                    const type = this.objectGrid[x][z];

                    // Cross holes, but leave other tile types untouched.
                    if (!isFloor(x, z) && type !== 9 && type !== 999) {
                        continue;
                    }

                    searched[x][z] = true;
                    parent[x][z] = current;

                    if (isFloor(x, z)) {
                        target = {x, z};
                        break;
                    }

                    queue.push({x, z});
                }
            }

            // No disconnected floor remains reachable through holes.
            if (target === null) break;

            // Follow the connection back to the main group.
            let tile = target;

            while (tile !== null) {
                if (!isFloor(tile.x, tile.z)) {
                    this.objectGrid[tile.x][tile.z] = 0;
                }

                tile = parent[tile.x][tile.z];
            }

            // Include the newly connected island in the main group.
            mainGroup = collectGroup(root, makeVisited());
        }
    }

    //helper functions
    isOpen(x,z){
        return (this.objectGrid[x][z] == 0);
    }

    //rendering functions
    render(renderer){
        this.renderFloorPlanks(renderer);
    }
    renderFloorPlanks(renderer) {
        const hasFloor = (x, z) => {
            if (x < 0 || x >= this.size ||
                z < 0 || z >= this.size) {
                return false;
            }

            const type = this.objectGrid[x][z];
            return type >= 0 && type <= 4;
        };

        for (let x = 0; x < this.size; x++) {
            for (let z = 0; z < this.size; z++) {
                if (!hasFloor(x, z)) continue;

                this.floor[x][z].render(
                    renderer,
                    !hasFloor(x + 1, z),
                    !hasFloor(x, z + 1)
                );
            }
        }
    }
}
