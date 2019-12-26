import tools from "../Tools/Tool"
import PlayingControl from "../playing/PlayingSceneControl";
export default class bullet extends Laya.Script {
    // boss_maoWangHou猫王后子弹运动轨迹
    private self;
    private bossName;
    private group: number;//分组,高于list和row
    private row: number;//行，相当于列
    private line: number;//列
    private moveOnOff: boolean = false;//移动开关判断
    private parentSprite: Laya.Sprite;//动态创建的新的父节点
    constructor() { super(); }
    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this.bossName = "maoWangHou";
        this.initProperty();//初始化,每次进入重新初始化
        this.self["maoWangHou_bullet"] = this;
    }
    // 初始化各种属性
    initProperty(): void {
        //普通攻击1
        this.attack_01_01_Accelerated = 0.06;//加速度
        //普通攻击2
        this.attack_02_01_Accelerated = 0.06;//加速度
        this.stepSwitch = true;//阶段开关
        this.velocityRandom;//速度随机数
        // 技能1_01
        this.skill_01_01_accelerated = 0.1;
        // 技能1_02
        this.skill_01_02_accelerated = 0.1;
    }

    //合集方法
    maoWangHou_Move(): void {
        if (this.moveOnOff && !PlayingControl.instance.isGamePause) {
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
                case 'skill_01_Bullet_02':
                    this.skill_01_02();
                    break;
            }
        }
    }

    // attack_01_Bullet_01普通攻击1的第一个子弹类型运动规则
    private attack_01_01_Accelerated: number = 0.06;//加速度
    attack_01_01(): void {
        if (this.line === 0 || this.line === 5) {
            this.self.x += tools.speedXYByAngle(130, 6 + this.attack_01_01_Accelerated).x;
            this.self.y += tools.speedXYByAngle(130, 6 + this.attack_01_01_Accelerated).y;
        } else if (this.line === 1 || this.line === 6) {
            this.self.x += tools.speedXYByAngle(110, 6 + this.attack_01_01_Accelerated).x;
            this.self.y += tools.speedXYByAngle(110, 6 + this.attack_01_01_Accelerated).y;
        } else if (this.line === 2 || this.line === 7) {
            this.self.x += tools.speedXYByAngle(90, 6 + this.attack_01_01_Accelerated).x;
            this.self.y += tools.speedXYByAngle(90, 6 + this.attack_01_01_Accelerated).y;
        } else if (this.line === 3 || this.line === 8) {
            this.self.x += tools.speedXYByAngle(70, 6 + this.attack_01_01_Accelerated).x;
            this.self.y += tools.speedXYByAngle(70, 6 + this.attack_01_01_Accelerated).y;
        } else if (this.line === 4 || this.line === 9) {
            this.self.x += tools.speedXYByAngle(50, 6 + this.attack_01_01_Accelerated).x;
            this.self.y += tools.speedXYByAngle(50, 6 + this.attack_01_01_Accelerated).y;
        }
        this.attack_01_01_Accelerated += 0.01;
    }

    // attack_02_Bullet_01普通攻击1的第一个子弹类型运动规则
    private attack_02_01_Accelerated: number = 0.06;//加速度
    private stepSwitch: boolean = true;//阶段开关
    private velocityRandom;//速度随机数
    attack_02_01(): void {
        if (this.self.y < Laya.stage.height * 1 / 2 - 150 && this.stepSwitch) {
            // 第一阶段
            this.self.y += 3 + this.attack_02_01_Accelerated;
        } else {
            // 第一阶段
            this.stepSwitch = false;
            let angle = this.line * 20;
            this.self.x += tools.speedXYByAngle(angle, this.velocityRandom + this.attack_02_01_Accelerated).x;
            this.self.y += tools.speedXYByAngle(angle, this.velocityRandom + this.attack_02_01_Accelerated).y;
        }
        this.attack_02_01_Accelerated += 0.01;
    }

    // boss大招1子弹类型1
    // 复合型子弹
    private skill_01_01_accelerated: number = 0.1;//加速度
    skill_01_01(): void {
        let baseSpeed = 10;
        if (this.line === 0 || this.line === 1) {
            this.self.x += tools.speedXYByAngle(120, baseSpeed + this.skill_01_01_accelerated).x;
            this.self.y += tools.speedXYByAngle(120, baseSpeed + this.skill_01_01_accelerated).y;
        } else if (this.line === 2 || this.line === 3) {
            this.self.x += tools.speedXYByAngle(90, baseSpeed + this.skill_01_01_accelerated).x;
            this.self.y += tools.speedXYByAngle(90, baseSpeed + this.skill_01_01_accelerated).y;
        } else if (this.line === 4 || this.line === 5) {
            this.self.x += tools.speedXYByAngle(60, baseSpeed + this.skill_01_01_accelerated).x;
            this.self.y += tools.speedXYByAngle(60, baseSpeed + this.skill_01_01_accelerated).y;
        }
    }

    // boss大招1子弹类型2
    // 复合型子弹
    private skill_01_02_accelerated: number = 0.1;//加速度
    skill_01_02(): void {
        let baseSpeed = 6;
        let Angle = this.line * 14 - 30;
        this.self.x += tools.speedXYByAngle(Angle, baseSpeed + this.skill_01_02_accelerated).x;
        this.self.y += tools.speedXYByAngle(Angle, baseSpeed + this.skill_01_02_accelerated).y;
        this.skill_01_02_accelerated += 0.05;
    }

    onDisable(): void {
        Laya.Pool.recover("bulltePrefab", this.owner);
    }

    onUpdate(): void {
    }
}