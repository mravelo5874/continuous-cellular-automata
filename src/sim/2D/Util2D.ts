import Rand from "../../lib/rand-seed";

export function generate_random_alpha_state(width: number, height: number, seed: string) {
    let rng = new Rand(seed)
    let cells = new Uint8Array(height * width * 4)
    for(let i = 0; i < height*width*4; i+=4) {
        let r =  Math.floor(255 * rng.next())
        cells[i] = 0
        cells[i+1] = 0
        cells[i+2] = 0
        cells[i+3] = r
    }
    return cells;
}

export function generate_random_rgb_state(width: number, height: number, seed: string) {
    let rng = new Rand(seed)
    let cells = new Uint8Array(height * width * 4)
    for(let i = 0; i < height*width*4; i+=4) {
        let r =  Math.floor(255 * rng.next())
        let g =  Math.floor(255 * rng.next())
        let b =  Math.floor(255 * rng.next())
        cells[i] = r
        cells[i+1] = g
        cells[i+2] = b
        cells[i+3] = 255
    }
    return cells;
}

export function generate_random_binary_state(width: number, height: number, seed: string) {
    let rng = new Rand(seed)
    let cells = new Uint8Array(height * width * 4)
    for(let i = 0; i < height*width*4; i+=4) {
        let r = 0
        if (rng.next() > 0.5) r = 255
        cells[i] = 0
        cells[i+1] = 0
        cells[i+2] = 0
        cells[i+3] = r
    }
    return cells;
}

export function generate_empty_state(width: number, height: number) {
    let cells = new Uint8Array(height * width * 4)
    for(let i = 0; i < height*width*4; i+=4) {
        cells[i] = 0
        cells[i+1] = 0
        cells[i+2] = 0
        cells[i+3] = 0
    }
    return cells;
}