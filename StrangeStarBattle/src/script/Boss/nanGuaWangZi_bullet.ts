import tools from "../Tools/Tool"
import PlayingControl from "../playing/PlayingSceneControl";
export default class bullet extends Laya.Script {
    // boss_nanguawangzi南瓜王子子弹运动轨迹
    private self;
    private group: number;//分组,高于list和row
    private row: number;//行，相当于列
    private line: number;//列
    // private moveOnOff: boolean;//移动开关
    constructor() { super(); }
    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this.initProperty();//初始化,每次进入重新初始化
    }
    // 初始化各种属性
    initProperty(): void {
        //普通攻击1
        this.accelerated_01_01 = 0.06;//加速度
        //普通攻击2
        this.accelerated_02_01 = 0.06;//加速度
        // 技能1_01
        this.skill_accelerated_01_01 = 0.06;
    }

    //合集方法
    nanGuaWangZi_Move(): void {
        if (!PlayingControl.instance.isGamePause) {
            return;
        }
        // 运动轨迹
        switch (this.self.name) {
            case 'attack_01_Bullet_01':
                this.attack_01_01();
                break;
            case 'attack_02_Bullet_01':
                this.attack_02_01();
                break;
            case 'skill_01_Bullet_01':
                this.skill_01_01();
                break;
        }
    }

    // attack_01_Bullet_01普通攻击1的第一个子弹类型运动规则
    private accelerated_01_01: number = 0.06;//加速度
    attack_01_01(): void {
        let angle = 22.5 + this.line * 9;
        if (this.line % 3 === 0) {
            this.self.x += tools.speedXYByAngle(angle, 4 + this.accelerated_01_01).x;
            this.self.y += tools.speedXYByAngle(angle, 4 + this.accelerated_01_01).y;
        } else if (this.line % 2 === 0) {
            this.self.x += tools.speedXYByAngle(angle, 6 + this.accelerated_01_01).x;
            this.self.y += tools.speedXYByAngle(angle, 6 + this.accelerated_01_01).y;
        } else {
            this.self.x += tools.speedXYByAngle(angle, 8 + this.accelerated_01_01).x;
            this.self.y += tools.speedXYByAngle(angle, 8 + this.accelerated_01_01).y;
        }
        this.accelerated_01_01 += 0.01;
    }

    // attack_02_Bullet_01普通攻击1的第一个子弹类型运动规则
    private accelerated_02_01: number = 0.06;//加速度
    attack_02_01(): void {
        let baseSpeed = 6;
        if (this.row === 0 || this.row === 2 || this.row === 4) {
            let angle = 60;
            this.self.x += tools.speedXYByAngle(angle, baseSpeed + this.accelerated_02_01).x / 3;
            this.self.y += tools.speedXYByAngle(angle, baseSpeed + this.accelerated_02_01).y;
        } else {
            let angle = 120;
            this.self.x += tools.speedXYByAngle(angle, baseSpeed + this.accelerated_02_01).x / 3;
            this.self.y += tools.speedXYByAngle(angle, baseSpeed + this.accelerated_02_01).y;
        }
        this.accelerated_02_01 += 0.01;
    }

    // boss大招子弹类型1
    private skill_accelerated_01_01: number = 0.06;//加速度
    skill_01_01(): void {
        let angle;
        let baseSpeed = 4;
        if (this.row % 2 !== 0) {
            angle = this.line * 18;
            this.self.x += tools.speedXYByAngle(angle, baseSpeed + this.skill_accelerated_01_01).x;
            this.self.y += tools.speedXYByAngle(angle, baseSpeed + this.skill_accelerated_01_01).y;
        } else {
            angle = this.line * 18 + 9;
            this.self.x += tools.speedXYByAngle(angle, baseSpeed + this.skill_accelerated_01_01).x;
            this.self.y += tools.speedXYByAngle(angle, baseSpeed + this.skill_accelerated_01_01).y;
        }
        this.skill_accelerated_01_01 += 0.05;
    }

    onDisable(): void {
        Laya.Pool.recover("bulltePrefab", this.owner);
    }

    onUpdate(): void {
    }
}