import BulletCommon from "../role/BulletCommon"
import Data2 from "../Data/JsonEnum"
import DataType = Data2.DataType;
import EnemyObject from "../role/EnemyObject";
import PlayingSceneControl from "../playing/PlayingSceneControl";
import Tool, { tools } from "../Tools/Tool"
import Enemy from "../playing/Enemy";
import MediumEnemy_bullet from "../MediumEnemy/MediumEnemy_bullet";//所有中级小怪子弹
export default class Boss_jinsenangua extends Laya.Script {
    constructor() {
        super();
    }
    /**自己*/
    private self;
    /**左右方向记录*/
    private left_right_Direction: string;
    /**上下方向记录*/
    private up_down_Direction: string;
    /**移动开关*/
    private moveOnOff_Boss: Boolean;
    /**怪物节点下的骨骼动画*/
    private skeleton: Laya.Skeleton;
    /**子弹父节点*/
    private bullteParent: Laya.Sprite;
    /**攻击时间间隔*/
    private attack_Interval: number;
    /**第一次攻击*/
    private firstAttack: boolean;
    /**第一次攻击的时间间隔*/
    private firstAttack_Interval: number;
    /**记录当前攻击发动后的时间，用于对比时间间隔*/
    private attack_NowTime;
    /**攻击次数计数器*/
    private attackCounter: number = 0;
    /**骨骼动画资源名*/
    private pic: string;
    /**计时器,通用一个，每次攻击需要重新初始化*/
    private delayed: number;
    /**时间线*/
    private timer: number;
    /**主角飞机*/
    private role: Laya.Sprite;

    onEnable(): void {
        // 需要每次初始化属性
        this.initProperty();
    }
    //初始化属性
    initProperty(): void {
        this.self = this.owner as Laya.Sprite;
        this.pic = this.self.vars_.propertyObj.pic;
        this.skeleton = this.self.getChildByName("EnemySK");
        this.moveOnOff_Boss = true;
        this.firstAttack = true;
        this.firstAttack_Interval = 2000;
        this.attackCounter = 0;
        this.attack_NowTime = Date.now();
        this.timer = 0;
        this.delayed = 0;
        this.role = this.self.scene.getChildByName('role_name');
        switch (this.pic) {
            case 'zhongji_hetun':
                this.firstAttack_Interval = 2800;
                this.attack_Interval = 2000;
                break;
            case 'zhongji_xiezi':
                this.firstAttack_Interval = 2800;
                this.attack_Interval = 5000;
                break;
            case 'zhongji_luobo':
                this.firstAttack_Interval = 2800;
                this.attack_Interval = 4000;
                break;
            case 'zhongji_feihou':
                this.attack_Interval = 1200;
                this.firstAttack_Interval = 2000;
                break;
            case 'zhongji_binghua':
                this.attack_Interval = 3000;
                this.firstAttack_Interval = 3000;
                break;
            case 'zhongji_bingqilin':
                this.attack_Interval = 2000;
                this.firstAttack_Interval = 2000;
                break;
            case 'zhongji_haiyao':
                this.attack_Interval = 4500;
                this.firstAttack_Interval = 2000;
                break;
            case 'zhongji_haisha':
                this.attack_Interval = 6000;
                this.firstAttack_Interval = 2000;
                break;
            case 'zhongji_huogui':
                this.attack_Interval = 3000;
                this.firstAttack_Interval = 2000;
                break;
            case 'zhongji_huomogu':
                this.attack_Interval = 3000;
                this.firstAttack_Interval = 2000;
                let number = Math.floor(Math.random() * 2);
                if (number === 1) {
                    this.self.x = Laya.stage.width / 3 - 80;
                } else {
                    this.self.x = Laya.stage.width * 2 / 3 - 80;
                }
                break;
            default:
                this.attack_Interval = 3000;
                break;
        }
        if (this.self.x > Laya.stage.width / 2 - 80) {
            this.left_right_Direction = 'left';
        } else {
            this.left_right_Direction = 'right';
        }

        this.up_down_Direction = 'down';
    }

    /**怪物的移动行为合集*/
    move() {
        switch (this.pic) {
            case 'zhongji_hetun':
                this.zhongji_hetun_move();
                break;
            case 'zhongji_xiezi':
                this.zhongji_xiezi_move();
                break;
            case 'zhongji_luobo':
                this.zhongji_luobo_move();
                break;
            case 'zhongji_feihou':
                this.zhongji_feihou_move();
                break;
            case 'zhongji_binghua':
                this.self.y += 2;
                break;
            case 'zhongji_bingqilin':
                this.zhongji_bingqilin_move();
                break;
            case 'zhongji_haiyao':
                this.self.y += 2;
                break;
            case 'zhongji_haisha':
                this.self.y += 2;
                break;
            case 'zhongji_huogui':
                this.self.y += 2;
                break;
            case 'zhongji_huomogu':
                this.zhongji_huomogu_move();
                break;
            default:
                this.self.y += 2;
                break;
        }
        this.timer += 1;
    }

    /**中级河豚移动规则，缓慢跟随*/
    zhongji_hetun_move() {
        // x,y分别相减是两点连线向量
        let point = new Laya.Point(this.role.x - this.self.x, this.role.y - this.self.y);
        // 归一化，向量长度为1。
        point.normalize();
        //向量相加
        this.self.x += point.x * 2;
        this.self.y += point.y * 2;
    }

    /**中级河豚移动规则，驻点不动*/
    zhongji_xiezi_move() {
        // if (this.self.y > Laya.stage.height / 3 - 200) {
        //     return;
        // } else {
        //     this.self.y += 8;
        // }
        this.self.y += 2;
    }

    /**中级萝卜移动规则，旋转*/
    zhongji_luobo_move() {
        this.self.y += 2;
        this.skeleton.rotation += 12;
        this.skeleton.playbackRate(0.1);
    }

    /**中级飞猴移动规则，左右徘徊*/
    zhongji_feihou_move() {
        if (this.left_right_Direction === "left") {
            this.self.x -= 5;
            if (this.self.x < Laya.stage.width * 1 / 4 - 120) {
                this.left_right_Direction = "right";
            }
        } else if (this.left_right_Direction === "right") {
            this.self.x += 5;
            if (this.self.x + this.self.width / 2 > Laya.stage.width * 3 / 4 - 30) {
                this.left_right_Direction = "left";
            }
        }
        if (this.self.y < 100) {
            this.self.y += 5;
        } else {
            this.self.y += 0.5;
        }
    }

    /**中级飞猴移动规则，上下徘徊，迂回向下*/
    zhongji_bingqilin_move() {
        // if (this.timer % 10 === 0) {
        //     if (this.up_down_Direction === "up") {
        //         this.up_down_Direction = "down";
        //     } else if (this.up_down_Direction === "down") {
        //         this.up_down_Direction = "up";
        //     }
        // }
        // if (this.up_down_Direction === "up") {
        //     this.self.y -= 10;
        // } else if (this.up_down_Direction === "down") {
        //     this.self.y += 12;
        // }
        this.self.y += 2;
    }

    /**中级火蘑菇移动规则，快速移动*/
    zhongji_huomogu_move() {
        this.self.y += 2;
        if (this.left_right_Direction === "left") {
            this.self.x += 10;
        } else if (this.left_right_Direction === "right") {
            this.self.x -= 10;
        }
        if (this.timer % 35 === 0) {
            if (this.left_right_Direction === "left") {
                this.left_right_Direction = "right";
            } else if (this.left_right_Direction === "right") {
                this.left_right_Direction = "left";
            }
        }
    }

    /**怪物发射子弹攻击合集，暂时没有攻击动作*/
    attack(): void {
        // 延时用于匹配动作
        switch (this.pic) {
            case 'zhongji_hetun':
                this.zhongji_hetun_01_01();
                break;
            case 'zhongji_xiezi':
                this.zhongji_xiezi_01_01();
                break;
            case 'zhongji_luobo':
                this.zhongji_luobo_01_01();
                break;
            case 'zhongji_feihou':
                this.zhongji_feihou_01_01();
                break;
            case 'zhongji_binghua':
                this.zhongji_binghua_01_01();
                break;
            case 'zhongji_bingqilin':
                this.zhongji_bingqilin_01_01();
                break;
            case 'zhongji_haiyao':
                this.zhongji_haiyao_01_01();
                break;
            case 'zhongji_haisha':
                this.zhongji_haisha_01_01();
                break;
            case 'zhongji_huogui':
                this.zhongji_huogui_01_01();
                break;
            case 'zhongji_huomogu':
                this.zhongji_huomogu_01_01();
                break;
            default:
                break;
        }
    }

    /**子弹骨骼动画模板*/
    private bulletTemplet;
    /**实例化子弹*/
    initBullet(): Laya.Sprite {
        // 子弹父节点
        this.bullteParent = this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite;
        // 子弹预设
        let bulletObj = new BulletCommon(Data2.BulletType.bigEnemy);//中级怪物子弹类型统一
        const bullet_Attack = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
        // 赋予公用属性
        if (!bullet_Attack.vars_) {
            bullet_Attack.vars_ = {};
        }
        bullet_Attack.vars_.propertyObj = Tool.copydata(bulletObj);
        bullet_Attack.vars_.propertyObj.bossBulletType = Data2.bossBulletType.common;
        bullet_Attack.vars_.propertyObj.fromNick = this.owner["vars_"].propertyObj.nick;
        this.bullteParent.addChild(bullet_Attack);
        return bullet_Attack;
    }

    /**zhongji_hetun，中级河豚普通攻击1-1*/
    zhongji_hetun_01_01() {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        //计时器时间初始化,起始延时控制停顿
        this.delayed = 50;
        // 发射子弹的时候停顿
        this.moveOnOff_Boss = false;
        Laya.timer.frameOnce(this.delayed, this, function () {
            this.moveOnOff_Boss = true;
            //角度合集
            for (let l = 0; l < 12; l++) {
                //创建
                let zhongji_hetun_01_01 = this.initBullet();
                zhongji_hetun_01_01.name = "zhongji_hetun_01_01";
                // 修正位置
                let bulletX = this.self.x + this.self.width * 1 / 3 + 50;
                let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                zhongji_hetun_01_01.pos(bulletX, bulletY);
                //添加运动脚本，并且给予一些属性
                let MediumEnemy_Bullet = (zhongji_hetun_01_01 as Laya.Sprite).getComponent(MediumEnemy_bullet);
                if (!MediumEnemy_Bullet) {
                    zhongji_hetun_01_01.addComponent(MediumEnemy_bullet);
                }
                MediumEnemy_Bullet = (zhongji_hetun_01_01 as Laya.Sprite).getComponent(MediumEnemy_bullet);
                MediumEnemy_Bullet.line = l;//列
                MediumEnemy_Bullet.moveOnOff = true;//运动开关
                MediumEnemy_Bullet.bossName = this.owner.name; //boss名称
                MediumEnemy_Bullet.firstAngle = 30 * l;
            }
        })
    }

    /**zhongji_xiezi，中级蝎子普通攻击1-1*/
    zhongji_xiezi_01_01() {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        //计时器时间初始化,起始延时控制停顿
        this.delayed = 50;
        //发射子弹的时候停顿
        this.moveOnOff_Boss = false;
        for (let r = 0; r < 8; r++) {
            this.delayed += 15;
            Laya.timer.frameOnce(this.delayed, this, function () {
                if (this.owner.scene == null) {
                    return;
                }
                for (let l = 0; l < 2; l++) {
                    //创建
                    let zhongji_xiezi_01_01 = this.initBullet();
                    zhongji_xiezi_01_01.name = "zhongji_xiezi_01_01";
                    // 修正位置
                    let bulletX = this.self.x + this.self.width * 1 / 3 + 50;
                    let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                    zhongji_xiezi_01_01.pos(bulletX, bulletY);

                    //添加运动脚本，并且给予一些属性
                    let MediumEnemy_Bullet = (zhongji_xiezi_01_01 as Laya.Sprite).getComponent(MediumEnemy_bullet);
                    if (!MediumEnemy_Bullet) {
                        zhongji_xiezi_01_01.addComponent(MediumEnemy_bullet);
                    }
                    MediumEnemy_Bullet = (zhongji_xiezi_01_01 as Laya.Sprite).getComponent(MediumEnemy_bullet);

                    MediumEnemy_Bullet.row = r;//行
                    MediumEnemy_Bullet.line = l;//列
                    MediumEnemy_Bullet.moveOnOff = true;//运动开关
                    MediumEnemy_Bullet.bossName = this.owner.name; //boss名称
                    MediumEnemy_Bullet.firstAngle = r * 45 + l * 15;//初始角度
                    // 恢复移动
                    if (MediumEnemy_Bullet.row === 7 && MediumEnemy_Bullet.line === 1) {
                        this.moveOnOff_Boss = true;
                    }
                }
            })
        }
    }

    /**zhongji_luobo，中级萝卜普通攻击1-1*/
    zhongji_luobo_01_01() {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        //角度重置0
        this.skeleton.rotation = 0;
        //播放速率正常
        this.skeleton.playbackRate(1);
        //计时器时间初始化,起始延时控制停顿
        this.delayed = 50;
        // 发射子弹的时候停顿
        this.moveOnOff_Boss = false;
        // 时间间隔
        let number = 20;
        for (let g = 0; g < 3; g++) {
            this.delayed += number;
            Laya.timer.frameOnce(this.delayed, this, function () {
                for (let r = 0; r < 4; r++) {
                    if (this.owner.scene == null) {
                        return;
                    }
                    for (let l = 0; l < 2; l++) {
                        //创建
                        let zhongji_luobo_01_01 = this.initBullet();
                        zhongji_luobo_01_01.name = "zhongji_luobo_01_01";
                        // 修正位置
                        let bulletX = this.self.x + this.self.width * 1 / 3 + 50;
                        let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                        zhongji_luobo_01_01.pos(bulletX, bulletY);
                        //添加运动脚本，并且给予一些属性
                        let MediumEnemy_Bullet = (zhongji_luobo_01_01 as Laya.Sprite).getComponent(MediumEnemy_bullet);
                        if (!MediumEnemy_Bullet) {
                            zhongji_luobo_01_01.addComponent(MediumEnemy_bullet);
                        }
                        MediumEnemy_Bullet = (zhongji_luobo_01_01 as Laya.Sprite).getComponent(MediumEnemy_bullet);
                        MediumEnemy_Bullet.group = g;//行
                        MediumEnemy_Bullet.row = r;//行
                        MediumEnemy_Bullet.line = l;//列
                        MediumEnemy_Bullet.moveOnOff = true;//运动开关
                        MediumEnemy_Bullet.bossName = this.owner.name; //boss名称
                        MediumEnemy_Bullet.firstAngle = r * 90 + l * 15 + g * 25;//初始角度
                        //停留时间,换算成加了多少次0.1，也就是timer+=0.1，和移动脚本匹配
                        MediumEnemy_Bullet.standingTime = 10 - g * number * 0.1;
                        // 打开移动
                        if (MediumEnemy_Bullet.group === 2 && MediumEnemy_Bullet.row === 3 && MediumEnemy_Bullet.line === 1) {
                            this.moveOnOff_Boss = true;
                        }
                    }
                }
            })
        }
    }

    /**zhongji_feihou，中级飞猴普通攻击1-1*/
    zhongji_feihou_01_01() {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        //计时器时间初始化,起始延时控制停顿
        this.delayed = 30;
        // 关掉移动
        this.moveOnOff_Boss = false;
        Laya.timer.frameOnce(this.delayed, this, function () {
            // 关掉移动
            this.moveOnOff_Boss = true;
            //计时器时间初始化
            for (let l = 0; l < 6; l++) {
                //创建
                let zhongji_feihou_01_01 = this.initBullet();
                zhongji_feihou_01_01.name = "zhongji_feihou_01_01";
                // 修正位置
                let bulletX = this.self.x + this.self.width * 1 / 3 + 50;
                let bulletY = this.self.y + this.self.height * 1 / 3 + 100;
                if (l === 0) {
                    zhongji_feihou_01_01.pos(bulletX, bulletY);
                } else if (l === 1) {
                    zhongji_feihou_01_01.pos(bulletX - 20, bulletY + 25);
                } else if (l === 2) {
                    zhongji_feihou_01_01.pos(bulletX + 20, bulletY + 25);
                } else if (l === 3) {
                    zhongji_feihou_01_01.pos(bulletX + 40, bulletY + 50);
                } else if (l === 4) {
                    zhongji_feihou_01_01.pos(bulletX, bulletY + 50);
                } else if (l === 5) {
                    zhongji_feihou_01_01.pos(bulletX - 40, bulletY + 50);
                }

                //添加运动脚本，并且给予一些属性
                let MediumEnemy_Bullet = (zhongji_feihou_01_01 as Laya.Sprite).getComponent(MediumEnemy_bullet);
                if (!MediumEnemy_Bullet) {
                    zhongji_feihou_01_01.addComponent(MediumEnemy_bullet);
                }
                MediumEnemy_Bullet = (zhongji_feihou_01_01 as Laya.Sprite).getComponent(MediumEnemy_bullet);
                MediumEnemy_Bullet.line = l;//列
                MediumEnemy_Bullet.moveOnOff = true;//运动开关
                MediumEnemy_Bullet.bossName = this.owner.name; //boss名称
            }
        })
    }

    /**zhongji_binghua，中级冰花普通攻击1-1*/
    zhongji_binghua_01_01() {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        //计时器时间初始化,起始延时控制停顿
        this.delayed = 50;
        // 关掉移动
        this.moveOnOff_Boss = false;
        for (let r = 0; r < 15; r++) {
            this.delayed += 7;
            Laya.timer.frameOnce(this.delayed, this, function () {
                for (let l = 0; l < 2; l++) {
                    //创建
                    let zhongji_binghua_01_01 = this.initBullet();
                    zhongji_binghua_01_01.name = "zhongji_binghua_01_01";
                    // 修正位置
                    let bulletX = this.self.x + this.self.width * 1 / 3 + 50;
                    let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                    zhongji_binghua_01_01.pos(bulletX, bulletY);
                    //添加运动脚本，并且给予一些属性
                    let MediumEnemy_Bullet = (zhongji_binghua_01_01 as Laya.Sprite).getComponent(MediumEnemy_bullet);
                    if (!MediumEnemy_Bullet) {
                        zhongji_binghua_01_01.addComponent(MediumEnemy_bullet);
                    }
                    MediumEnemy_Bullet = (zhongji_binghua_01_01 as Laya.Sprite).getComponent(MediumEnemy_bullet);
                    MediumEnemy_Bullet.row = r;//行
                    MediumEnemy_Bullet.line = l;//列
                    MediumEnemy_Bullet.moveOnOff = true;//运动开关
                    MediumEnemy_Bullet.bossName = this.owner.name; //boss名称
                    MediumEnemy_Bullet.firstAngle = r * 36;

                    // 恢复移动
                    if (MediumEnemy_Bullet.row === 14 && MediumEnemy_Bullet.line === 1) {
                        this.moveOnOff_Boss = true;
                    }
                }
            })
        }
    }

    /**zhongji_bingqilin，中级冰淇淋普通攻击1-1*/
    zhongji_bingqilin_01_01() {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        //计时器时间初始化,起始延时控制停顿
        this.delayed = 40;
        // 关掉移动
        this.moveOnOff_Boss = false;
        for (let g = 0; g < 2; g++) {
            this.delayed += 10;
            Laya.timer.frameOnce(this.delayed, this, function () {
                for (let r = 0; r < 4; r++) {
                    for (let l = 0; l < 4; l++) {
                        //创建
                        let zhongji_bingqilin_01_01 = this.initBullet();
                        zhongji_bingqilin_01_01.name = "zhongji_bingqilin_01_01";
                        //修正位置
                        let bulletX = this.self.x + this.self.width * 1 / 3 + 50;
                        let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                        zhongji_bingqilin_01_01.pos(bulletX, bulletY);
                        //添加运动脚本，并且给予一些属性
                        let MediumEnemy_Bullet = (zhongji_bingqilin_01_01 as Laya.Sprite).getComponent(MediumEnemy_bullet);
                        if (!MediumEnemy_Bullet) {
                            zhongji_bingqilin_01_01.addComponent(MediumEnemy_bullet);
                        }
                        MediumEnemy_Bullet = (zhongji_bingqilin_01_01 as Laya.Sprite).getComponent(MediumEnemy_bullet);
                        MediumEnemy_Bullet.group = g;//组
                        MediumEnemy_Bullet.row = r;//行
                        MediumEnemy_Bullet.line = l;//列
                        MediumEnemy_Bullet.moveOnOff = true;//运动开关
                        MediumEnemy_Bullet.bossName = this.owner.name; //boss名称
                        MediumEnemy_Bullet.firstAngle = r * 90 + g * 45;
                        if (MediumEnemy_Bullet.group === 1 && MediumEnemy_Bullet.row === 3 && MediumEnemy_Bullet.line === 3) {
                            this.moveOnOff_Boss = true;
                        }
                    }
                }
            })
        }
    }

    /**zhongji_haiyao，中级海妖普通攻击1-1*/
    zhongji_haiyao_01_01() {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        //计时器时间初始化,起始延时控制停顿
        this.delayed = 30;
        // 关掉移动
        this.moveOnOff_Boss = false;
        for (let g = 0; g < 2; g++) {
            this.delayed += 30;
            let numberR;
            let numberL;
            if (g === 0) {
                numberR = 5;
                numberL = 5;
            } else {
                numberR = 4;
                numberL = 4;
            }
            Laya.timer.frameOnce(this.delayed, this, function () {
                for (let r = 0; r < numberR; r++) {
                    for (let l = 0; l < numberL; l++) {
                        //创建
                        let zhongji_haiyao_01_01 = this.initBullet();
                        zhongji_haiyao_01_01.name = "zhongji_haiyao_01_01";
                        // 修正位置
                        let bulletX = this.self.x + this.self.width * 1 / 3 + 50;
                        let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                        zhongji_haiyao_01_01.pos(bulletX, bulletY);
                        //添加运动脚本，并且给予一些属性
                        let MediumEnemy_Bullet = (zhongji_haiyao_01_01 as Laya.Sprite).getComponent(MediumEnemy_bullet);
                        if (!MediumEnemy_Bullet) {
                            zhongji_haiyao_01_01.addComponent(MediumEnemy_bullet);
                        }
                        MediumEnemy_Bullet = (zhongji_haiyao_01_01 as Laya.Sprite).getComponent(MediumEnemy_bullet);
                        MediumEnemy_Bullet.group = g;//行
                        MediumEnemy_Bullet.row = r;//行
                        MediumEnemy_Bullet.line = l;//列
                        MediumEnemy_Bullet.moveOnOff = true;//运动开关
                        if (g === 0) {
                            MediumEnemy_Bullet.firstAngle = r * 72 + l * 10;
                        } else {
                            MediumEnemy_Bullet.firstAngle = r * 90 + l * 15 + 45;
                        }
                        MediumEnemy_Bullet.bossName = this.owner.name; //boss名称
                        if (MediumEnemy_Bullet.group === 1 && MediumEnemy_Bullet.row === 3 && MediumEnemy_Bullet.line === 3) {
                            this.moveOnOff_Boss = true;
                        }
                    }
                }
            })
        }
    }

    /**zhongji_haisha，中级海妖普通攻击1-1*/
    zhongji_haisha_01_01() {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        //计时器时间初始化,起始延时控制停顿
        this.delayed = 30;
        // 关掉移动
        this.moveOnOff_Boss = false;
        //时间间隔
        let number = 3;
        for (let l = 0; l < 40; l++) {
            this.delayed += number;
            Laya.timer.frameOnce(this.delayed, this, function () {
                //创建
                let zhongji_haisha_01_01 = this.initBullet();
                zhongji_haisha_01_01.name = "zhongji_haisha_01_01";
                // 修正位置
                let bulletX = this.self.x + this.self.width * 1 / 3 + 50;
                let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                zhongji_haisha_01_01.pos(bulletX, bulletY);

                //添加运动脚本，并且给予一些属性
                let MediumEnemy_Bullet = (zhongji_haisha_01_01 as Laya.Sprite).getComponent(MediumEnemy_bullet);
                if (!MediumEnemy_Bullet) {
                    zhongji_haisha_01_01.addComponent(MediumEnemy_bullet);
                }
                MediumEnemy_Bullet = (zhongji_haisha_01_01 as Laya.Sprite).getComponent(MediumEnemy_bullet);
                MediumEnemy_Bullet.line = l;//列
                MediumEnemy_Bullet.moveOnOff = true;//运动开关
                MediumEnemy_Bullet.firstAngle = l * 20;
                MediumEnemy_Bullet.bossName = this.owner.name; //boss名称
                //停留时间,换算成加了多少次0.1，也就是timer+=0.1，和移动脚本匹配
                MediumEnemy_Bullet.standingTime = 15 - l * number * 0.1;
                if (MediumEnemy_Bullet.line === 39) {
                    this.moveOnOff_Boss = true;
                }
            })
        }
    }

    /**zhongji_huogui，中级火鬼普通攻击1-1*/
    zhongji_huogui_01_01() {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        //计时器时间初始化,起始延时控制停顿
        this.delayed = 30;
        // 关掉移动
        this.moveOnOff_Boss = false;
        for (let r = 0; r < 5; r++) {
            this.delayed += 15;
            Laya.timer.frameOnce(this.delayed, this, function () {
                for (let l = 0; l < 8; l++) {
                    //创建
                    let zhongji_huogui_01_01 = this.initBullet();
                    zhongji_huogui_01_01.name = "zhongji_huogui_01_01";
                    // 修正位置
                    let bulletX = this.self.x + this.self.width * 1 / 3 + 50;
                    let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                    zhongji_huogui_01_01.pos(bulletX + 20, bulletY);
                    //添加运动脚本，并且给予一些属性
                    let MediumEnemy_Bullet = (zhongji_huogui_01_01 as Laya.Sprite).getComponent(MediumEnemy_bullet);
                    if (!MediumEnemy_Bullet) {
                        zhongji_huogui_01_01.addComponent(MediumEnemy_bullet);
                    }
                    MediumEnemy_Bullet = (zhongji_huogui_01_01 as Laya.Sprite).getComponent(MediumEnemy_bullet);
                    MediumEnemy_Bullet.row = r;//行
                    MediumEnemy_Bullet.line = l;//列
                    MediumEnemy_Bullet.firstAngle = Math.floor(Math.random() * 60) + l * 45;
                    MediumEnemy_Bullet.firsSpeed = Math.floor(Math.random() * 3) + 5;
                    MediumEnemy_Bullet.moveOnOff = true;//运动开关
                    MediumEnemy_Bullet.bossName = this.owner.name; //boss名称

                    if (MediumEnemy_Bullet.row === 4 && MediumEnemy_Bullet.line === 5) {
                        this.moveOnOff_Boss = true;
                    }
                }
            })
        }
    }

    /**zhongji_huomogu，中级火蘑菇普通攻击1-1*/
    zhongji_huomogu_01_01() {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        //计时器时间初始化,起始延时控制停顿
        this.delayed = 30;
        // 关掉移动
        this.moveOnOff_Boss = false;
        for (let r = 0; r < 6; r++) {
            this.delayed += 15;
            Laya.timer.frameOnce(this.delayed, this, function () {
                for (let l = 0; l < 10; l++) {
                    //创建
                    let zhongji_huomogu_01_01 = this.initBullet();
                    zhongji_huomogu_01_01.name = "zhongji_huomogu_01_01";
                    // 修正位置
                    let bulletX = this.self.x + this.self.width * 1 / 3 + 50;
                    let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                    zhongji_huomogu_01_01.pos(bulletX, bulletY);
                    //添加运动脚本，并且给予一些属性
                    let MediumEnemy_Bullet = (zhongji_huomogu_01_01 as Laya.Sprite).getComponent(MediumEnemy_bullet);
                    if (!MediumEnemy_Bullet) {
                        zhongji_huomogu_01_01.addComponent(MediumEnemy_bullet);
                    }
                    MediumEnemy_Bullet = (zhongji_huomogu_01_01 as Laya.Sprite).getComponent(MediumEnemy_bullet);
                    MediumEnemy_Bullet.row = r;//行
                    MediumEnemy_Bullet.line = l;//列
                    if (l >= 0 && l < 5) {
                        MediumEnemy_Bullet.firstAngle = -45 + 22.5 * l + r * 60;
                    } else if (l >= 5 && l < 10) {
                        MediumEnemy_Bullet.firstAngle = 225 - (22.5 * (l - 5)) + r * 60;
                    }
                    MediumEnemy_Bullet.moveOnOff = true;//运动开关
                    MediumEnemy_Bullet.bossName = this.owner.name; //boss名称
                    if (MediumEnemy_Bullet.row === 5 && MediumEnemy_Bullet.line === 9) {
                        this.moveOnOff_Boss = true;
                    }
                }
            })
        }
    }

    onUpdate() {
        if (this.moveOnOff_Boss) {
            this.move();
            //通过时间间隔发动攻击
            let nowTime = Date.now();
            if (this.firstAttack && nowTime - this.attack_NowTime > this.firstAttack_Interval) {
                this.attack_NowTime = nowTime;//重置时间
                this.firstAttack = false;
                this.attack();
            } else if (nowTime - this.attack_NowTime > this.attack_Interval) {
                this.attack_NowTime = nowTime;//重置时间
                this.attack();
            }
        }
    }

    onDisable(): void {
        Laya.timer.clearAll(this);

    }
}