import tools from "../Tools/Tool"
import Bullet_boss from "../playing/Bullet_boss";
import PlayingControl from "../playing/PlayingSceneControl";
export default class bullet extends Laya.Script {
    private self;
    /**自身当前位置*/
    private selfFirstPoint;
    /**boss的名字*/
    private bossName: string;
    /**分组,高于this.list和row*/
    private group: number;
    /**行，相当于列*/
    private row;
    /**列*/
    private line: number;
    /**移动开关判断*/
    private moveOnOff: boolean = false;
    private parentSprite: Laya.Sprite;//动态创建的新的父节点
    private bossPosX: number//当前boss的位置
    private bossPosY: number//当前boss的位置
    private bossPoint;//boss位置点
    private boss;//boss本身

    private specialName;//特殊名称标记

    constructor() { super(); }
    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this.self['bingtouxiang_bullet'] = this;
        this.initProperty();//初始化,每次进入重新初始化
    }

    // 初始化各种属性
    initProperty(): void {
        //普通攻击1-1
        this.A_accelerated_01_01 = 0.06;//加速度

        //普通攻击1-2
        this.attack_01_02_radius_00 = 0;//半径1
        this.attack_01_02_radius_01 = 0;//半径2
        this.attack_01_02_radius_02 = 0;//半径
        this.A_accelerated_01_02 = 0.05;

        //普通攻击2
        this.accelerated_02_01 = 0.05;//加速度1

        // 技能1_01
        // boss大招子弹类型1
        this.radius_01 = 0;//半径拉长速度
        this.radius_01Variable = 0;
        this.S_accelerated_01_01 = 0.1;//加速度

        // 技能1_02
        this.S_accelerated_01_02 = 0.1;//加速度

        // 技能1_03
        this.S_accelerated_01_03 = 0.1;//加速度

        // 技能1_04
        this.S_accelerated_01_04 = 0.1;//加速度
    }

    //合集方法
    bingTouXiang_Move(): void {

        if (this.moveOnOff && !PlayingControl.instance.isGamePause) {
            if (this.specialName === 'attack_01_01_Special') {
                //普通攻击1-1
                this.attack_01_01_Special();
            }
            // 运动轨迹
            switch (this.self.name) {
                //普通攻击1-2
                case 'attack_01_Bullet_02':
                    this.attack_01_02();
                    break;
                //普通攻击2
                case 'attack_02_Bullet_01':
                    this.attack_02_01();
                    break;
                //大招1
                case 'skill_01_Bullet_01':
                    this.skill_01_01();
                    break;
                case 'skill_01_Bullet_02':
                    this.skill_01_02();
                    break;
                case 'skill_01_Bullet_03':
                    this.skill_01_03();
                    break;
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
    private randomAngle: number;//随机角度
    private A_01_02_FirstAngle: number;//随机角度
    attack_01_01_Special(): void {
        let basedSpeed = 4;
        this.self.x += tools.speedXYByAngle(this.randomAngle, basedSpeed + this.A_accelerated_01_01).x;
        this.self.y += tools.speedXYByAngle(this.randomAngle, basedSpeed + this.A_accelerated_01_01).y;
        this.A_accelerated_01_01 += 0.05;
    }

    // 普通攻击1子弹类型2
    private attack_01_02_firstAngle: number;//初始角度
    private attack_01_02_radius_00: number = 0;//半径
    private attack_01_02_radius_01: number = 0;//半径
    private attack_01_02_radius_02: number = 0;//半径
    private A_accelerated_01_02: number = 0.05;
    attack_01_02(): void {
        //父节点
        let bullteParent = this.self.parent as Laya.Sprite;
        // 特殊组节点
        let rowNdoe = bullteParent.getChildByName('attack_01_Group_0' + this.group.toString()) as Laya.Sprite;
        // 当组节点消失则进行第二种路径
        if (this.self.name === "attack_01_Bullet_02" && rowNdoe === null) {
            this.A_accelerated_01_02 += 0.05;
            this.self.x += tools.speedXYByAngle(90, 10 + this.A_accelerated_01_02).x;
            this.self.y += tools.speedXYByAngle(90, 10 + this.A_accelerated_01_02).y;
        } else {
            let x = rowNdoe.x;
            let y = rowNdoe.y;
            // 给予出生位置
            let rowPoint = new Laya.Point(x, y);
            //实时更新位置
            if (this.row === 0) {
                this.attack_01_02_move(this.attack_01_02_firstAngle, this.attack_01_02_radius_00, rowPoint);
            } else if (this.row === 1) {
                this.attack_01_02_move(this.attack_01_02_firstAngle, this.attack_01_02_radius_01, rowPoint);
            } else if (this.row === 2) {
                this.attack_01_02_move(this.attack_01_02_firstAngle, this.attack_01_02_radius_02, rowPoint);
            }
            this.attack_01_02_firstAngle += 1;
            this.attack_01_02_radius_00 += 0.62;
            this.attack_01_02_radius_01 += 0.65;
            this.attack_01_02_radius_01 += 0.68;
        }
    }

    //attack_01_02运动
    attack_01_02_move(firstAngle, radius, rowPoint): void {
        this.self.x = tools.getRoundPos(firstAngle, radius, rowPoint).x;
        this.self.y = tools.getRoundPos(firstAngle, radius, rowPoint).y;
    }


    private accelerated_02_01: number = 0.05;//加速度1
    private A_02_01_firstAngle: number;//初始角度
    attack_02_01(): void {
        let basedSpeed = 8;
        switch (this.line) {
            case 0:
                this.attack_02_01_move1(this.A_02_01_firstAngle - 6, basedSpeed - 2);
                break;
            case 1:
                this.attack_02_01_move1(this.A_02_01_firstAngle - 3, basedSpeed - 1);
                break;
            case 2:
                this.attack_02_01_move1(this.A_02_01_firstAngle, basedSpeed);
                break;
            case 3:
                this.attack_02_01_move1(this.A_02_01_firstAngle + 3, basedSpeed - 1);
                break;
            case 4:
                this.attack_02_01_move1(this.A_02_01_firstAngle + 6, basedSpeed - 2);
                break;
            case 5:
                this.attack_02_01_move1(this.A_02_01_firstAngle + 10, basedSpeed - 2);
                break;
            case 6:
                this.attack_02_01_move1(this.A_02_01_firstAngle + 15, basedSpeed - 3);
                break;
            default:
                break;
        }
        this.accelerated_02_01 += 0.05;
    }

    // 第一阶段组移动
    attack_02_01_move1(angle, basedSpeed) {
        this.self.x += tools.speedXYByAngle(angle, basedSpeed + this.accelerated_02_01).x;
        this.self.y += tools.speedXYByAngle(angle, basedSpeed + this.accelerated_02_01).y;
    }

    // boss大招子弹类型1
    private radius_01: number = 0;//旋转半径
    private radius_01Variable: number = 0;//递增变量
    private S_accelerated_01_01: number = 0.1;//加速度
    private S_01_FirstAngle_01;//初始角度1
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
        let basedSpeed = 10;
        switch (this.line) {
            case 0:
                this.S_01_01_move(this.S_01_FirstAngle_01 - 3, basedSpeed - 3);
                break;
            case 1:
                this.S_01_01_move(this.S_01_FirstAngle_01 - 6, basedSpeed - 2);
                break;
            case 2:
                this.S_01_01_move(this.S_01_FirstAngle_01 - 3, basedSpeed - 1);
                break;
            case 3:
                this.S_01_01_move(this.S_01_FirstAngle_01, basedSpeed);
                break;
            case 4:
                this.S_01_01_move(this.S_01_FirstAngle_01, basedSpeed - 4);
                break;
            case 5:
                this.S_01_01_move(this.S_01_FirstAngle_01 + 3, basedSpeed - 1);
                break;
            case 6:
                this.S_01_01_move(this.S_01_FirstAngle_01 + 6, basedSpeed - 2);
                break;
            case 7:
                this.S_01_01_move(this.S_01_FirstAngle_01 + 3, basedSpeed - 3);
                break;
            default:
                break;
        }
        this.S_accelerated_01_01 += 0.05;
    }

    // S_01_01基本移动
    S_01_01_move(FirstAngle, basedSpeed): void {
        this.self.x += tools.speedXYByAngle(FirstAngle, basedSpeed + this.S_accelerated_01_01).x;
        this.self.y += tools.speedXYByAngle(FirstAngle, basedSpeed + this.S_accelerated_01_01).y;
    }

    // boss大招子弹类型2
    private S_accelerated_01_02: number = 0.1;//加速度
    private S_01_FirstAngle_02//初始角度2
    skill_01_02(): void {
        let basedSpeed = 5;
        switch (this.line) {
            case 0:
                this.S_01_02_move(this.S_01_FirstAngle_02 - 22, basedSpeed - 0.6);
                break;
            case 1:
                this.S_01_02_move(this.S_01_FirstAngle_02 - 11, basedSpeed - 0.3);
                break;
            case 2:
                this.S_01_02_move(this.S_01_FirstAngle_02, basedSpeed);
                break;
            case 3:
                this.S_01_02_move(this.S_01_FirstAngle_02 + 11, basedSpeed - 0.3);
                break;
            case 4:
                this.S_01_02_move(this.S_01_FirstAngle_02 + 22, basedSpeed - 0.6);
                break;
            default:
                break;
        }
        this.S_accelerated_01_02 += 0.05;
    }

    // S_01_02基本移动
    S_01_02_move(FirstAngle, basedSpeed): void {
        this.self.x += tools.speedXYByAngle(FirstAngle, basedSpeed + this.S_accelerated_01_02).x;
        this.self.y += tools.speedXYByAngle(FirstAngle, basedSpeed + this.S_accelerated_01_02).y;
    }

    // boss大招子弹类型3
    private S_accelerated_01_03: number = 0.1;//加速度
    private S_01_FirstAngle_03 = 0.1;//初始角度3
    skill_01_03(): void {
        let basedSpeed = 8;
        this.S_01_03_move(this.S_01_FirstAngle_03, basedSpeed);
        this.S_accelerated_01_03 += 0.05;
    }

    // S_01_03基本移动
    S_01_03_move(FirstAngle, basedSpeed): void {
        this.self.x += tools.speedXYByAngle(FirstAngle, basedSpeed + this.S_accelerated_01_03).x;
        this.self.y += tools.speedXYByAngle(FirstAngle, basedSpeed + this.S_accelerated_01_03).y;
    }

    // boss大招子弹类型2
    private S_accelerated_01_04: number = 0.1;//加速度
    private S_01_FirstAngle_04 = 0.1;//初始角度3
    skill_01_04(): void {
        if (this.line === 5 || this.line === 10 || this.line === 15 || this.line === 20) {
            this.S_01_04_move(this.S_01_FirstAngle_04, 9);
        } else if (this.line === 4 || this.line === 6 || this.line === 9 || this.line === 11 || this.line === 14 || this.line === 16 || this.line === 19 || this.line === 1) {
            this.S_01_04_move(this.S_01_FirstAngle_04, 8);
        } else {
            this.S_01_04_move(this.S_01_FirstAngle_04, 7);
        }
        this.S_accelerated_01_04 += 0.05;
    }

    // S_01_02基本移动
    S_01_04_move(FirstAngle, basedSpeed): void {
        this.self.x += tools.speedXYByAngle(FirstAngle, basedSpeed + this.S_accelerated_01_04).x;
        this.self.y += tools.speedXYByAngle(FirstAngle, basedSpeed + this.S_accelerated_01_04).y;
    }

    onDisable(): void {
    }

    onUpdate(): void {
    }
}