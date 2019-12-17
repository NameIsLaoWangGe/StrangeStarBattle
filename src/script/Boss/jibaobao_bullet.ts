import tools from "../Tools/Tool"
import Bullet_boss from "../playing/Bullet_boss";
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
        this.initProperty();//初始化,每次进入重新初始化
    }

    // 初始化各种属性
    initProperty(): void {
        //普通攻击1-1
        this.A_accelerated_01_01 = 0.06;//加速度

        //普通攻击2
        this.accelerated_02_01 = 0.05;//加速度1
        this.A_02_01_changeAngle = 0.1;//半径变化值
        this.A_02_01_longRadius = 0;//椭圆长半径
        this.A_02_01_timer = 0.1//时间线

        // 技能1_01
        // boss大招子弹类型1
        this.S_01_01_accelerated = 0.1;//加速度

        // 技能1_02
        this.S_01_02_accelerated = 0.1;//加速度
        this.S_01_02_timer = 0;//时间线


        // 技能1_03
        this.S_accelerated_01_03 = 0.1;//加速度

        // 技能1_04
        this.S_accelerated_01_04 = 0.1;//加速度
    }

    //合集方法
    jibaobao_Move(): void {
        if (this.moveOnOff) {


            // 运动轨迹
            switch (this.self.name) {
                //普通攻击1-01
                case 'attack_01_Bullet_01':
                    this.attack_01_01();
                    break;
                //普通攻击2_01
                case 'attack_02_Bullet_01':
                    this.attack_02_01();
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
    attack_01_01(): void {
        let Angle = this.line * 20;
        let basedSpeed = 5;
        this.attack_01_01_move(Angle, basedSpeed);
        this.A_accelerated_01_01 += 0.03;
    }

    attack_01_01_move(angle, basedSpeed): void {
        this.self.x += tools.speedXYByAngle(angle, basedSpeed + this.A_accelerated_01_01).x;
        this.self.y += tools.speedXYByAngle(angle, basedSpeed + this.A_accelerated_01_01).y;
    }

    attack_01_02_move(angle, radius): void {
        // boss位置点初始化
        let bossParent = (this.owner.scene as Laya.Sprite).getChildByName('EnemySpite');
        this.boss = bossParent.getChildByName(this.bossName);
        if (this.boss === null) {
            return;
        }
        let bulletX = this.boss.x + this.boss.width * 1 / 3;
        let bulletY = this.boss.y + this.boss.height * 1 / 3 + 50;
        this.bossPoint = new Laya.Point(bulletX, bulletY);

        this.self.x = tools.getRoundPos(angle, radius, this.bossPoint).x;
        this.self.y = tools.getRoundPos(angle, radius, this.bossPoint).y
    }

    // 普通攻击2-1
    private accelerated_02_01: number = 0.05;//加速度1
    private A_02_01_firstAngle: number;//初始角度
    private A_02_01_changeAngle: number = 0.1;//半径变化值
    private A_02_01_longRadius: number = 0;//椭圆长半径
    private A_02_01_timer: number = 0.1//时间线
    attack_02_01(): void {
        // boss位置点初始化
        let bossParent = (this.owner.scene as Laya.Sprite).getChildByName('EnemySpite');
        this.boss = bossParent.getChildByName(this.bossName);
        if (this.boss === null) {
            return;
        }
        let bulletX = this.boss.x + this.boss.width * 1 / 3;
        let bulletY = this.boss.y + this.boss.height * 1 / 3 + 100;
        this.bossPoint = new Laya.Point(bulletX, bulletY);

        this.A_02_01_timer += 0.1;
        let angle = this.A_02_01_firstAngle + this.line * 18 + this.A_02_01_changeAngle;
        let radius;
        if (this.A_02_01_timer > 0 && this.A_02_01_timer < 3) {
            if (this.line % 2 !== 0) {
                this.A_02_01_longRadius += 1.3;
            }
            else {
                this.A_02_01_longRadius += 2;
            }
            radius = this.A_02_01_longRadius;
            this.attack_02_01_move2(angle, radius, this.bossPoint);
        }
        else if (this.A_02_01_timer >= 3 && this.A_02_01_timer < 7) {

            //下落时间 
            this.self.x += tools.speedXYByAngle(90, 5).x;
            this.self.y += tools.speedXYByAngle(90, 5).y
        }
        else if (this.A_02_01_timer >= 7 && this.A_02_01_timer < 10) {
            // 等待时间
        }
        else {
            this.accelerated_02_01 += 0.1;
            let basedSpeed;
            if (this.line % 2 !== 0) {
                basedSpeed = 2;
                this.self.x += tools.speedXYByAngle(angle, basedSpeed + this.accelerated_02_01).x;
                this.self.y += tools.speedXYByAngle(angle, basedSpeed + this.accelerated_02_01).y
            } else {
                basedSpeed = 4;
                this.self.x += tools.speedXYByAngle(angle, basedSpeed + this.accelerated_02_01).x;
                this.self.y += tools.speedXYByAngle(angle, basedSpeed + this.accelerated_02_01).y
            }
        }
    }

    attack_02_01_move1(angle, basedSpeed) {
        this.self.x += tools.speedXYByAngle(angle, basedSpeed + this.accelerated_02_01).x;
        this.self.y += tools.speedXYByAngle(angle, basedSpeed + this.accelerated_02_01).y;
    }

    attack_02_01_move2(angle, radius, point) {
        this.self.x = tools.getRoundPos(angle, radius, point).x;
        this.self.y = tools.getRoundPos(angle, radius, point).y
    }

    // boss大招子弹类型1
    private S_01_01_accelerated: number = 0.1;//加速度
    // 直线发射子弹
    skill_01_01(): void {
        let basedSpeed = 5;
        let angle = this.line * 18;
        this.S_01_01_move(angle, basedSpeed);
        this.S_01_01_accelerated += 0.03;
    }

    // S_01_01基本移动
    S_01_01_move(angle, basedSpeed): void {
        this.self.x += tools.speedXYByAngle(angle, basedSpeed + this.S_01_01_accelerated).x;
        this.self.y += tools.speedXYByAngle(angle, basedSpeed + this.S_01_01_accelerated).y;
    }

    // boss大招子弹类型2
    private S_01_02_accelerated: number = 0.1;//加速度
    private S_01_02_firstAngle//初始角度2
    private S_01_02_timer = 0;//时间线
    skill_01_02(): void {
        let basedSpeed;
        this.S_01_02_timer += 0.1;
        if (this.S_01_02_timer >= 0 && this.S_01_02_timer < 2) {
            basedSpeed = 1;
            this.S_01_02_move_01(this.S_01_02_firstAngle, basedSpeed - this.line * 0.4);

        } else if (this.S_01_02_timer >= 2 && this.S_01_02_timer < 4) {
            basedSpeed = 1;
            this.S_01_02_move_01(this.S_01_02_firstAngle, basedSpeed + this.line * 0.4);

        } else if (this.S_01_02_timer >= 4 && this.S_01_02_timer < 5) {

        } else if (this.S_01_02_timer >= 5) {
            basedSpeed = 4;
            this.S_01_02_move_01(this.S_01_02_firstAngle, basedSpeed - this.line * 0.6 + this.S_01_02_accelerated);
        }

        this.S_01_02_accelerated += 0.03;
    }

    S_01_02_move_01(angle, basedSpeed) {
        this.self.x += tools.speedXYByAngle(angle, basedSpeed + this.S_01_02_accelerated).x;
        this.self.y += tools.speedXYByAngle(angle, basedSpeed + this.S_01_02_accelerated).y;
    }

    // boss大招子弹类型3
    private S_accelerated_01_03: number = 0.1;//加速度
    skill_01_03(): void {
        let basedSpeed = 6;
        this.S_01_03_move(90, basedSpeed);
        this.S_accelerated_01_03 += 0.03;
    }

    // S_01_03基本移动
    S_01_03_move(angle, basedSpeed): void {
        this.self.x += tools.speedXYByAngle(angle, basedSpeed + this.S_accelerated_01_03).x;
        this.self.y += tools.speedXYByAngle(angle, basedSpeed + this.S_accelerated_01_03).y;
    }

    // boss大招子弹类型2
    private S_accelerated_01_04: number = 0.1;//加速度
    private S_01_firstAngle_04 = 0.1;//初始角度3
    skill_01_04(): void {
        let angle = this.line * 15 + this.S_01_firstAngle_04;
        let basedSpeed = 10;
        this.S_01_04_move(angle, basedSpeed);
        this.S_accelerated_01_04 += 0.03;
    }

    // S_01_02基本移动
    S_01_04_move(angle, basedSpeed): void {
        this.self.x += tools.speedXYByAngle(angle, basedSpeed + this.S_accelerated_01_04).x;
        this.self.y += tools.speedXYByAngle(angle, basedSpeed + this.S_accelerated_01_04).y;
    }

    onDisable(): void {
    }

    onUpdate(): void {
    }
}