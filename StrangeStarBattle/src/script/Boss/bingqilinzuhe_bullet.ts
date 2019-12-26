import tools from "../Tools/Tool"
import PlayingControl from "../playing/PlayingSceneControl";
export default class bullet extends Laya.Script {
    // boss_bingqilinzuhe大树人子弹运动轨迹
    private self;
    private selfFirstPoint;//自身当前位置
    private bossName: string;
    private group: number;//分组,高于this.list和row
    private row: number;//行，相当于列
    private line: number;//列
    private moveOnOff: boolean = false;//移动开关判断
    private parentSprite: Laya.Sprite;//动态创建的新的父节点
    private bossPosX: number//当前boss的位置
    private bossPosY: number//当前boss的位置
    private bossPoint;//boss位置点
    private boss;//boss本身

    constructor() { super(); }
    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this.selfFirstPoint = new Laya.Point(this.self.x, this.self.y);
        this.self['bingqilinzuhe_bullet'] = this;
        this.initProperty();//初始化,每次进入重新初始化
    }
    // 初始化各种属性
    initProperty(): void {
        //普通攻击1
        this.accelerated_01_01 = 0.06;//加速度

        //普通攻击2
        this.accelerated_02_01 = 0.05;//加速度1

        // 技能1_01
        // boss大招子弹类型1
        this.skill_accelerated_01_01 = 0.1;//加速度

        // 技能1_02
        this.skill_accelerated_01_02 = 0.1;//加速度

        // 技能1_03
        this.skill_accelerated_01_03 = 0.1;//加速度
    }

    //合集方法
    bingQiLinZuHe_Move(): void {

        if (this.moveOnOff && !PlayingControl.instance.isGamePause) {
            // 运动轨迹
            switch (this.self.name) {
                case 'attack_01_Bullet_01':
                    this.attack_01_01();
                    break;
                case 'attack_02_Bullet_01':
                    this.attack_02_01();
                    break;

                //skill
                case 'skill_01_Bullet_01':
                    this.skill_01_01();
                    break;
                case 'skill_01_Bullet_02':
                    this.skill_01_02();
                    break;
                case 'skill_01_Bullet_03':
                    this.skill_01_03();
                    break;
                default:
                    break;
            }
        }
    }

    // attack_01_Bullet_01普通攻击1的第一个子弹类型运动规则
    private accelerated_01_01: number = 0.06;//加速度
    private randomAngle: number;//随机速度
    attack_01_01(): void {
        let basedSpeed = 6;
        switch (this.row) {
            case 0:
                this.attack_01_01_move1(this.randomAngle + 45, basedSpeed);
                break;
            case 1:
                this.attack_01_01_move1(this.randomAngle + 30, basedSpeed);
                break;
            case 2:
                this.attack_01_01_move1(this.randomAngle + 15, basedSpeed);
                break;
            case 3:
                this.attack_01_01_move1(this.randomAngle, basedSpeed);
                break;
            case 4:
                this.attack_01_01_move1(this.randomAngle - 15, basedSpeed);
                break;
            case 5:
                this.attack_01_01_move1(this.randomAngle - 30, basedSpeed);
                break;
            case 6:
                this.attack_01_01_move1(this.randomAngle - 45, basedSpeed);
                break;
            default:
                break;
        }
        this.accelerated_01_01 += 0.05;
    }

    // 普通1移动
    attack_01_01_move1(angle1, basedSpeed) {
        this.self.x += tools.speedXYByAngle(angle1, basedSpeed + this.accelerated_01_01).x;
        this.self.y += tools.speedXYByAngle(angle1, basedSpeed + this.accelerated_01_01).y;
    }

    private accelerated_02_01: number = 0.05;//加速度1
    private firstAngle: number;//初始角度
    attack_02_01(): void {
        let basedSpeed = 4;
        this.self.x += tools.speedXYByAngle(this.firstAngle, basedSpeed + this.accelerated_02_01).x;
        this.self.y += tools.speedXYByAngle(this.firstAngle, basedSpeed + this.accelerated_02_01).y;
        this.accelerated_02_01 += 0.05;
    }

    // 第一阶段组移动
    attack_02_01_move1(angle, basedSpeed) {
        this.self.x += tools.speedXYByAngle(angle, basedSpeed).x;
        this.self.y += tools.speedXYByAngle(angle, basedSpeed).y;
    }

    // boss大招子弹类型1
    private skill_accelerated_01_01: number = 0.1;//加速度
    private skill_01_FirstAngle_01;//初始角度1
    // 直线发射子弹
    skill_01_01(): void {
        // // boss位置点初始化
        // let bossParent = (this.owner.scene as Laya.Sprite).getChildByName('EnemySpite');
        // this.boss = bossParent.getChildByName(this.bossName);
        // let bulletX = this.boss.x + this.boss.width * 1 / 3;
        // let bulletY = this.boss.y + this.boss.height * 1 / 3 + 50;
        // // this.bossPoint = new Laya.Point(bulletX, bulletY);
        // let bossLiftPoint = new Laya.Point(bulletX + 200, bulletY);
        // let bossRightPoint = new Laya.Point(bulletX - 200, bulletY);

        let basedSpeed = 4;
        this.self.x += tools.speedXYByAngle(this.skill_01_FirstAngle_01, 6 + this.skill_accelerated_01_01).x;
        this.self.y += tools.speedXYByAngle(this.skill_01_FirstAngle_01, 6 + this.skill_accelerated_01_01).y;

        this.skill_accelerated_01_01 += 0.05;
    }

    private skill_accelerated_01_02: number = 0.1;//加速度
    private skill_01_FirstAngle_02;//初始角度2
    skill_01_02(): void {
        let basedSpeed = 4;
        this.self.x += tools.speedXYByAngle(this.skill_01_FirstAngle_02, basedSpeed + this.skill_accelerated_01_02).x;
        this.self.y += tools.speedXYByAngle(this.skill_01_FirstAngle_02, basedSpeed + this.skill_accelerated_01_02).y;

        this.skill_accelerated_01_02 += 0.05;
    }

    private skill_accelerated_01_03: number = 0.1;//加速度
    private skill_01_FirstAngle_03;//初始角度3
    skill_01_03(): void {
        let basedSpeed;
        basedSpeed = 4;
        this.self.x += tools.speedXYByAngle(this.skill_01_FirstAngle_03, basedSpeed + this.skill_accelerated_01_03).x;
        this.self.y += tools.speedXYByAngle(this.skill_01_FirstAngle_03, basedSpeed + this.skill_accelerated_01_03).y;

        this.skill_accelerated_01_03 += 0.05;
    }

    onDisable(): void {
        // Laya.Pool.recover("bulltePrefab", this.owner);
    }

    onUpdate(): void {
    }
}