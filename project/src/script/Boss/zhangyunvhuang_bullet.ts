import tools from "../Tools/Tool"
import Bullet_boss from "../playing/Bullet_boss";
import PlayingControl from "../playing/PlayingSceneControl";
export default class bullet extends Laya.Script {
    // boss_bingqilinzuhe大树人子弹运动轨迹
    private self;
    private selfFirstPoint;//自身当前位置
    private bossName: string;
    private group: number;//分组,高于this.list和row
    private row;//行，相当于列
    private line: number;//列
    private moveOnOff: boolean = false;//移动开关判断
    private parentSprite: Laya.Sprite;//动态创建的新的父节点
    private bossPosX: number//当前boss的位置
    private bossPosY: number//当前boss的位置
    private bossPoint;//boss位置点
    private boss;//boss本身

    private groupName;//特殊名称标记

    constructor() { super(); }
    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this.self['zhangyunvhuang_bullet'] = this;
        this.initProperty();//初始化,每次进入重新初始化
    }

    // 初始化各种属性
    initProperty(): void {
        //普通攻击1-1
        this.A_accelerated_01_01 = 0.05;//加速度
        this.A_01_01_timer = 0;//时间线

        //普通攻击2-1
        this.accelerated_02_01 = 0.05;//加速度1

        //普通攻击2-2
        this.accelerated_02_02 = 0.05;//加速度1

        // 技能1_01
        // boss大招子弹类型1
        this.S_01_01_accelerated = 0.05;//加速度
        this.S_01_01_timer = 0;//时间线 

        // 技能1_02
        this.S_01_02_timer = 0;//时间线
        this.S_01_02_accelerated = 0.05;//加速度

        // 技能1_03
        this.S_01_03_timer = 0;//时间线
        this.S_01_03_accelerated = 0.05;//加速度

        // 技能1_04
        this.S_accelerated_01_04 = 0.05;//加速度
    }

    //合集方法
    zhangyunvhuang_Move(): void {
        if (this.moveOnOff && !PlayingControl.instance.isGamePause) {
            // 运动轨迹
            switch (this.self.name) {
                //普通攻击1-01
                case 'attack_01_Bullet_01':
                    this.attack_01_01();
                    break;

                //普通攻击2-01
                case 'attack_02_Bullet_01':
                    this.attack_02_01();
                    break;
                //普通攻击2_02
                case 'attack_02_Bullet_02':
                    this.attack_02_02();
                    break;

                //大招1-01
                case 'skill_01_Bullet_01':
                    this.skill_01_01();
                    break;
                //大招1-02
                case 'skill_01_Bullet_02':
                    this.skill_01_02();
                    break;
                //大招1-03
                case 'skill_01_Bullet_03':
                    this.skill_01_03();
                    break;
                //大招1-04
                case 'skill_01_Bullet_04':
                    this.skill_01_04();
                    break;
                default:
                    break;
            }
        }
    }

    // attack_01_Bullet_01普通攻击1的第一个子弹类型运动规则
    private A_accelerated_01_01: number = 0.06;//加速度
    private A_01_01_firstAngle;//初始角度
    private A_01_01_timer = 0;//时间线
    attack_01_01(): void {
        let angle = this.A_01_01_firstAngle;
        let basedSpeed;
        this.A_01_01_timer += 0.1;
        if (this.group >= 0 && this.group < 4) {
            if (this.A_01_01_timer >= 0 && this.A_01_01_timer < 4) {
                basedSpeed = 1.5;
                this.self.x += tools.speedXYByAngle(angle, basedSpeed - this.group * 0.2).x;
                this.self.y += tools.speedXYByAngle(angle, basedSpeed - this.group * 0.2).y;
            } else if (this.A_01_01_timer >= 4 && this.A_01_01_timer < 6) {
                // 等待
            } else if (this.A_01_01_timer >= 6) {
                this.A_accelerated_01_01 += 0.05;
                basedSpeed = 3;
                this.attack_01_01_move(this.line * 60 + 45, basedSpeed - this.line * 0.2);
            }
        } else {
            if (this.A_01_01_timer >= 0 && this.A_01_01_timer < 5) {
                basedSpeed = 1.5;
                this.self.x += tools.speedXYByAngle(angle, basedSpeed - (this.group - 4) * 0.2).x;
                this.self.y += tools.speedXYByAngle(angle, basedSpeed - (this.group - 4) * 0.2).y;
            } else if (this.A_01_01_timer >= 5 && this.A_01_01_timer < 6) {
                // 等待
            } else if (this.A_01_01_timer >= 6) {
                this.A_accelerated_01_01 += 0.05;
                basedSpeed = 6;
                this.attack_01_01_move(this.A_01_01_firstAngle - this.line * 12, basedSpeed - this.line * 0.5);
            }
        }

    }

    attack_01_01_move(angle, basedSpeed): void {
        this.self.x += tools.speedXYByAngle(angle, basedSpeed + this.A_accelerated_01_01).x;
        this.self.y += tools.speedXYByAngle(angle, basedSpeed + this.A_accelerated_01_01).y;
    }

    // 普通攻击2-1
    private accelerated_02_01: number = 0.05;//加速度1
    private A_02_01_firstAngle: number;//初始角度
    attack_02_01(): void {
        let basedSpeed = 4;
        this.self.x += tools.speedXYByAngle(this.A_02_01_firstAngle, basedSpeed).x;
        this.self.y += tools.speedXYByAngle(this.A_02_01_firstAngle, basedSpeed).y;
    }

    // 普通攻击2-2
    private accelerated_02_02: number = 0.05;//加速度1
    private A_02_02_firstAngle: number;//初始角度
    attack_02_02(): void {
        let basedSpeed = 8;
        this.self.x += tools.speedXYByAngle(this.A_02_02_firstAngle, basedSpeed + this.accelerated_02_02).x;
        this.self.y += tools.speedXYByAngle(this.A_02_02_firstAngle, basedSpeed + this.accelerated_02_02).y;
        this.accelerated_02_02 += 0.05;
    }

    // boss大招子弹类型1
    private S_01_01_accelerated: number = 0.05;//加速度
    private S_01_01_firstAngle: number = 0.05;//初始角度
    private S_01_01_timer: number = 0;//时间线 
    skill_01_01(): void {
        let basedSpeed;
        let angle;
        this.S_01_01_timer += 0.1;
        if (this.S_01_01_timer >= 0 && this.S_01_01_timer < 4) {
            angle = this.S_01_01_firstAngle - this.line * 5;
            basedSpeed = 5 - this.line * 0.4;
            this.self.x += tools.speedXYByAngle(angle, basedSpeed).x;
            this.self.y += tools.speedXYByAngle(angle, basedSpeed).y;
        } else if (this.S_01_01_timer >= 4) {
            basedSpeed = 6;
            angle = this.S_01_01_firstAngle - this.line * 5;
            this.S_01_01_accelerated += 0.05;
            this.self.x += tools.speedXYByAngle(angle, basedSpeed + this.line * 2).x;
            this.self.y += tools.speedXYByAngle(angle, basedSpeed + this.line * 2).y;
        }
    }

    // S_01_01基本移动
    S_01_01_move(angle, basedSpeed): void {
        this.self.x += tools.speedXYByAngle(angle, basedSpeed).x;
        this.self.y += tools.speedXYByAngle(angle, basedSpeed).y;
    }

    // boss大招子弹类型2
    private S_01_02_accelerated: number = 0.1;//加速度
    private S_01_02_firstAngle;//初始角度2
    private S_01_02_timer = 0;//时间线
    skill_01_02(): void {
        let basedSpeed;
        let angle;
        this.S_01_01_timer += 0.1;
        if (this.line === 0) {
            basedSpeed = 6 + this.S_01_02_accelerated;
            angle = this.S_01_02_firstAngle;
            this.self.x += tools.speedXYByAngle(angle, basedSpeed).x;
            this.self.y += tools.speedXYByAngle(angle, basedSpeed).y;
        } else {
            if (this.S_01_02_timer > 0 && this.S_01_02_timer <= 5) {
                angle = this.S_01_02_firstAngle;
                basedSpeed = 6 + this.S_01_02_accelerated;
                this.self.x += tools.speedXYByAngle(angle, basedSpeed).x;
                this.self.y += tools.speedXYByAngle(angle, basedSpeed).y;
            } else {
                if (this.line > 0 && this.line <= 4) {
                    let angle1 = this.S_01_02_firstAngle + 60;
                    basedSpeed = 6 + this.S_01_02_accelerated + this.line * 1;
                    this.self.x += tools.speedXYByAngle(angle1, basedSpeed).x;
                    this.self.y += tools.speedXYByAngle(angle1, basedSpeed).y;
                } else {
                    let angle2 = this.S_01_02_firstAngle + 120;
                    basedSpeed = 6 + this.S_01_02_accelerated + (this.line - 4) * 1;
                    this.self.x += tools.speedXYByAngle(angle2, basedSpeed).x;
                    this.self.y += tools.speedXYByAngle(angle2, basedSpeed).y;
                }
            }
        }
        this.S_01_02_accelerated += 0.05;
    }

    S_01_02_move_01(angle, basedSpeed) {
        this.self.x += tools.speedXYByAngle(angle, basedSpeed + this.S_01_02_accelerated).x;
        this.self.y += tools.speedXYByAngle(angle, basedSpeed + this.S_01_02_accelerated).y;
    }

    // boss大招子弹类型3
    private S_01_03_accelerated: number = 0.1;//加速度
    private S_01_03_timer = 0;//时间线
    private S_01_03_firstAngle;//初始角度
    skill_01_03(): void {
        let basedSpeed;
        let angle = this.S_01_03_firstAngle;
        this.S_01_03_timer += 0.1;
        if (this.S_01_03_timer >= 0 && this.S_01_03_timer < 3) {
            basedSpeed = 8;
        } else if (this.S_01_03_timer >= 3 && this.S_01_03_timer < 4) {
            return;
        } else if (this.S_01_03_timer >= 4) {
            basedSpeed = 6;
        }
        this.S_01_03_move(angle, basedSpeed);
        this.S_01_03_accelerated += 0.05;
    }

    // S_01_03基本移动
    S_01_03_move(angle, basedSpeed): void {
        this.self.x += tools.speedXYByAngle(angle, basedSpeed).x;
        this.self.y += tools.speedXYByAngle(angle, basedSpeed).y;
    }

    // boss大招子弹类型2
    private S_accelerated_01_04: number = 0.1;//加速度
    private S_01_firstAngle_04 = 0.1;//初始角度3
    skill_01_04(): void {
        let angle = this.S_01_firstAngle_04;
        let basedSpeed = 4 + this.S_accelerated_01_04;
        this.S_01_04_move(angle, basedSpeed);
        this.S_accelerated_01_04 += 0.05;
    }

    // S_01_02基本移动
    S_01_04_move(angle, basedSpeed): void {
        this.self.x += tools.speedXYByAngle(angle, basedSpeed).x;
        this.self.y += tools.speedXYByAngle(angle, basedSpeed).y;
    }

    onDisable(): void {
    }

    onUpdate(): void {
    }
}