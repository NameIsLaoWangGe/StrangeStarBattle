import tools from "../Tools/Tool"
import PlayingControl from "../playing/PlayingSceneControl";
export default class bullet extends Laya.Script {
    // boss_dashuren大树人子弹运动轨迹
    private self;
    private bossName;
    private group: number;//分组,高于this.list和row
    private row: number;//行，相当于列
    private line: number;//列
    private moveOnOff: boolean = false;//移动开关判断
    private parentSprite: Laya.Sprite;//动态创建的新的父节点
    constructor() { super(); }

    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this.bossName = "dashuren";
        this.self['daShuRen_bullet'] = this;
        this.initProperty();//初始化,每次进入重新初始化
    }

    // 初始化各种属性
    initProperty(): void {
        //普通攻击1
        this.accelerated_01_01 = 0.06;//加速度
        //普通攻击2
        this.accelerated_02_01 = 0.05;
        this.stepSwitch = true;//阶段开关
        // 技能1
        this.timer_01 = 0;
        this.skill_accelerated_01_01 = 0.1;
        this.skill_stepSwitch_01 = true;
    }

    /**合集方法*/
    daShuRen_Move(): void {

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
            }
        }
    }

    // attack_01_Bullet_01普通攻击1的第一个子弹类型运动规则
    private accelerated_01_01: number = 0.06;//加速度
    private firstAngle: number;//初始角度
    attack_01_01(): void {
        let basedSpeed = 6;
        let angle = this.firstAngle;
        this.self.x += tools.speedXYByAngle(angle, basedSpeed + this.accelerated_01_01).x;
        this.self.y += tools.speedXYByAngle(angle, basedSpeed + this.accelerated_01_01).y;
        this.accelerated_01_01 += 0.01;
    }

    // attack_02_Bullet_01普通攻击1的第一个子弹类型运动规则
    private accelerated_02_01: number = 0.05;//加速度
    private stepSwitch: boolean = true;//阶段开关
    attack_02_01(): void {
        if (this.self.y < Laya.stage.height * 1 / 4 && this.stepSwitch) {
            // 第一阶段
            switch (this.row) {
                case 0:
                    this.self.x += tools.speedXYByAngle(130, 3 + this.accelerated_02_01).x;
                    this.self.y += tools.speedXYByAngle(130, 3 + this.accelerated_02_01).y;
                    break;
                case 1:
                    this.self.x += tools.speedXYByAngle(95, 2 + this.accelerated_02_01).x;
                    this.self.y += tools.speedXYByAngle(95, 2 + this.accelerated_02_01).y;
                    break;
                case 2:
                    this.self.x += tools.speedXYByAngle(85, 2 + this.accelerated_02_01).x;
                    this.self.y += tools.speedXYByAngle(85, 2 + this.accelerated_02_01).y;
                    break;
                case 3:
                    this.self.x += tools.speedXYByAngle(130, 3 + this.accelerated_02_01).x;
                    this.self.y += tools.speedXYByAngle(130, 3 + this.accelerated_02_01).y;
                    break;
                default:
                    break;
            }
        } else {
            // 第二阶段
            let basedSpeed = 10;
            this.stepSwitch = false;
            let angle = 32.5 + this.line * 25;
            this.self.x += tools.speedXYByAngle(angle, basedSpeed + this.accelerated_02_01).x;
            this.self.y += tools.speedXYByAngle(angle, basedSpeed + this.accelerated_02_01).y;
        }
        this.accelerated_02_01 += 0.01;
    }

    // boss大招子弹类型1
    // 混乱Z型
    private skill_accelerated_01_01: number = 0.1;//加速度
    private timer_01: number = 0;//第一阶段计时器,可随机
    private skill_stepSwitch_01: boolean = true;;// 第一阶段开关
    skill_01_01(): void {
        let basedSpeed = 4;
        if (this.timer_01 < 8 && this.skill_stepSwitch_01) {
            let angle = this.row * 36;
            this.self.x += tools.speedXYByAngle(angle, basedSpeed - 4 + this.skill_accelerated_01_01).x;
            this.self.y += tools.speedXYByAngle(angle, basedSpeed - 4 + this.skill_accelerated_01_01).y;
        } else {
            this.skill_stepSwitch_01 = false;
            let angle = 45 + this.line * 45;
            this.self.x += tools.speedXYByAngle(angle, basedSpeed + this.skill_accelerated_01_01).x;
            this.self.y += tools.speedXYByAngle(angle, basedSpeed + this.skill_accelerated_01_01).y;
        }
        this.timer_01 += 0.1;
        this.skill_accelerated_01_01 += 0.05;
    }

    onDisable(): void {
        // Laya.Pool.recover("bulltePrefab", this.owner);
    }

    onUpdate(): void {
    }
}