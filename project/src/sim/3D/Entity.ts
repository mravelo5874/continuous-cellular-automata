import { Vec3 } from "src/lib/TSM";

export { Entity }

class Entity {

    private pos: Vec3 = new Vec3([0.0, 0.0, 0.0]);
    private vel: Vec3 = new Vec3([0.0, 0.0, 0.0]);
    private acc: Vec3 = new Vec3([0.0, 0.0, 0.0]);
    private max_acc: number = 0.02; // default = 0.00002    
    private speed: number = 0.01; // default = 0.005

    constructor(_init_pos: Vec3) { 
        this.pos = _init_pos;
    }

    update(_move_dir: Vec3, _delta_time: number) {
        _delta_time *= 0.1;
        // calculate velocity
        let des_vel: Vec3 = _move_dir.copy().add(this.acc.copy().scale(_delta_time)).scale(this.speed);

        // apply velocity to player
        const max_delta_speed: number = this.max_acc * _delta_time;
        // x vel
        if (this.vel.x < des_vel.x) { this.vel.x = Math.min(this.vel.x + max_delta_speed, des_vel.x) }
        else if (this.vel.x > des_vel.x) { this.vel.x = Math.max(this.vel.x - max_delta_speed, des_vel.x) }
        // y vel
        if (this.vel.y < des_vel.y) { this.vel.y = Math.min(this.vel.y + max_delta_speed, des_vel.y) }
        else if (this.vel.y > des_vel.y) { this.vel.y = Math.max(this.vel.y - max_delta_speed, des_vel.y) }
        // z vel
        if (this.vel.z < des_vel.z) { this.vel.z = Math.min(this.vel.z + max_delta_speed, des_vel.z) }
        else if (this.vel.z > des_vel.z) { this.vel.z = Math.max(this.vel.z - max_delta_speed, des_vel.z) }

        // calc displacement
        const disp: Vec3 = this.vel.copy().scale(_delta_time);
        this.pos.add(disp.copy());
    }

    get_pos(): Vec3 { return this.pos.copy(); }
}