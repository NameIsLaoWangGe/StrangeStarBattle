import BulletCommon from "../role/BulletCommon"
import Data2 from "../Data/JsonEnum"
import DataType = Data2.DataType;
import EnemyObject from "../role/EnemyObject";
import PlayingSceneControl from "../playing/PlayingSceneControl";
import Tool, { tools } from "../Tools/Tool"
import Enemy from "../playing/Enemy";
import bingqilinzuhe_bullet from "../Boss/bingqilinzuhe_bullet";//石头巨人子弹
export default class Boss_jinsenangua extends Laya.Script {
    constructor() {
        super();
        // boss_shitoujuren石头巨人
    }
    private self;//自己
    private moveDirection: string;//方向记录
    private moveOnOff: Boolean;//移动开关
    private skeleton: Laya.Skeleton;//boss节点下的boss动画
    private bullteParent;//子弹父节点
    private attack_Interval;//时间间隔
    private firstAttack: boolean;
    private firstAttack_Interval;//第一次的时间间隔

    private attack_NowTime;//记录当前攻击发动后的时间，用于对比时间间隔
    private attackCounter = 0;//攻击次数计数器；


    onEnable(): void {
        // 需要每次初始化属性
        this.initProperty();
        this.creatBossAni();
    }
    //初始化属性
    initProperty(): void {
        this.self = this.owner as Laya.Sprite;
        this.moveOnOff = false;//移动开关
        this.attack_Interval = 8000;//时间间隔
        this.firstAttack = true;
        this.firstAttack_Interval = 2000//第一次的时间间隔
        this.attackCounter = 0;//攻击次数计数器；
        this.attack_NowTime = Date.now();

        this.attack_02_Delayed_01 = 0;


        //skill子弹类型1
        this.skill_01_Delayed_01 = 0;//延时时间
        this.skill_01_Angle_01 = 40;//角度记录

        //skill子弹类型2
        this.skill_01_Delayed_02 = 0;//延时时间
        this.skill_01_Angle_02 = 40;

        //skill子弹类型3
        this.skill_01_Delayed_03 = 0;//延时帧数

    }

    //创建boss
    private bossTemplet: Laya.Templet;
    creatBossAni(): void {
        //骨骼动画赋值
        const nick = (this.owner["vars_"].propertyObj as EnemyObject).nick;
        this.skeleton = this.owner.getChildByName("Boss_bingqilinzuhe") as Laya.Skeleton;
        this.skeleton.play('stand', true);
        // 打开移动开关
        this.moveOnOff = true;
        // 随机方向
        let number = Math.random() * 2;
        if (number === 1) {
            this.moveDirection = 'left';
        } else {
            this.moveDirection = 'right';
        }
        return;
        // this.bossTemplet = new Laya.Templet();
        // this.bossTemplet.on(Laya.Event.COMPLETE, this, this.parseComplete);
        // this.bossTemplet.on(Laya.Event.ERROR, this, this.onError);
        // this.bossTemplet.loadAni("dragonbones/boss_bingqilinzuhe.sk");
    }

    onError() {
        console.log("加载错误！");
    }

    parseComplete(): void {
        // 播放boss动画
        var skeleton: Laya.Skeleton;
        this.skeleton = this.bossTemplet.buildArmature(0);//模板0
        this.skeleton.play('stand', true);
        this.skeleton.playbackRate(1);
        //boss节点
        this.self.addChild(this.skeleton);

        this.skeleton.pos(205, 165);
        // 打开移动开关
        this.moveOnOff = true;
        // 随机方向
        let number = Math.random() * 2;
        if (number === 1) {
            this.moveDirection = 'left';
        } else {
            this.moveDirection = 'right';
        }
    }

    //boss的移动行为
    move() {
        // this.self.x = Laya.stage.width / 2 - 170;
        // return;
        if (this.moveDirection === "left") {
            this.self.x -= 5;
            if (this.self.x + this.self.width / 2 < Laya.stage.width * 1 / 4 + 50) {
                this.moveDirection = "right";
            }
        } else if (this.moveDirection === "right") {
            this.self.x += 5;
            if (this.self.x + this.self.width / 2 > Laya.stage.width * 3 / 4) {
                this.moveDirection = "left";
            }
        }
    }

    //普通攻击
    //两种普通攻击根据攻击次数交替进行
    attack(random): void {
        this.skeleton.play('attack', false);
        this.moveOnOff = false;//攻击时候停止移动
        this.attackCounter++;
        this.skeleton.on(Laya.Event.STOPPED, this, function () {
            this.skeleton.play('stand', true);
            this.moveOnOff = true;
        })
        // 延时用于匹配动作
        Laya.timer.frameOnce(10, this, function () {
            if (this.owner.scene === null) {
                return;
            }
            // 如果参数是随机random,那么随机发动普通攻击一次,否则按照攻击次数决定
            if (random === "random") {
                let number = Math.floor(Math.random() * 2);
                if (number === 1) {
                    this.attack_01_Bullet_01();//普通攻击1
                } else {
                    this.attack_02_Bullet_01();//普通攻击2
                }
            } else {
                if (this.attackCounter % 2 !== 0) {
                    this.attack_01_Bullet_01();//普通攻击1
                } else {
                    this.attack_02_Bullet_01();//普通攻击2
                }
            }
        })
    }

    // 实例化子弹
    private bulletTemplet;//子弹骨骼动画模板
    initBullet(): Laya.Sprite {
        // 子弹父节点
        if (this.owner.scene == null) {
            let bullet_null = new Laya.Sprite();
            return bullet_null;
        }
        this.bullteParent = this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite;
        // 子弹预设
        let bulletObj = new BulletCommon(Data2.BulletType.boss, 30732);//30470
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

    private attack_Delayed_01 = 0;//延时帧数
    //普攻1子弹类型1
    attack_01_Bullet_01() {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        let randomAngleArr = [];
        for (let k = 0; k < 30; k++) {
            let randomAngle = 30 + Math.floor(Math.random() * 120);
            randomAngleArr.push(randomAngle);
        }
        for (let r = 0; r < 6; r++) {
            for (let l = 0; l < 30; l++) {
                // 随机一个角度
                let randomAngle = 50 + Math.floor(Math.random() * 80);
                this.attack_Delayed_01 += 12;
                Laya.timer.frameOnce(this.attack_Delayed_01, this, function () {
                    if (this.owner.scene == null) {
                        return;
                    }
                    let attack_01_Bullet_01 = this.initBullet();
                    attack_01_Bullet_01.name = 'attack_01_Bullet_01';
                    // 修正位置
                    let bulletX = this.self.x + this.self.width * 1 / 3;
                    let bulletY = this.self.y + this.self.height * 1 / 3 + 150;
                    attack_01_Bullet_01.pos(bulletX, bulletY);

                    //先判断是否有了这个脚本
                    let bingqilinzuhe_Bullet = (attack_01_Bullet_01 as Laya.Sprite).getComponent(bingqilinzuhe_bullet);
                    if (!bingqilinzuhe_Bullet) {
                        (attack_01_Bullet_01 as Laya.Sprite).addComponent(bingqilinzuhe_bullet);
                    }
                    bingqilinzuhe_Bullet = (attack_01_Bullet_01 as Laya.Sprite).getComponent(bingqilinzuhe_bullet);

                    bingqilinzuhe_Bullet.row = r;//行
                    bingqilinzuhe_Bullet.line = l;//列
                    bingqilinzuhe_Bullet.moveOnOff = true;//运动开关
                    bingqilinzuhe_Bullet.bossName = this.owner.name; //boss名称
                    bingqilinzuhe_Bullet.randomAngle = randomAngleArr[l];//随机角度
                })
            }
            this.attack_Delayed_01 = 0;
        }
    }

    //普攻2子弹生成类型1
    private attack_02_Delayed_01 = 0;//延时帧数
    attack_02_Bullet_01(): void {
        // 改变子弹父节点的层级，要大于boss
        // (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 1;
        // this.self.parent.zOrder = 2;
        for (let r = 0; r < 2; r++) {
            for (let l = 0; l < 180; l++) {
                this.attack_02_Delayed_01 += 2;
                Laya.timer.frameOnce(this.attack_02_Delayed_01, this, function () {
                    if (this.owner.scene == null) {
                        return;
                    }
                    let attack_02_Bullet_01 = this.initBullet();
                    attack_02_Bullet_01.name = 'attack_02_Bullet_01';
                    // 位置需要修正
                    let bulletX = this.self.x + this.self.width * 1 / 3;
                    let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                    attack_02_Bullet_01.pos(bulletX, bulletY);

                    //先判断是否有了这个脚本
                    let bingqilinzuhe_Bullet = (attack_02_Bullet_01 as Laya.Sprite).getComponent(bingqilinzuhe_bullet);
                    if (!bingqilinzuhe_Bullet) {
                        (attack_02_Bullet_01 as Laya.Sprite).addComponent(bingqilinzuhe_bullet);
                    }
                    bingqilinzuhe_Bullet = (attack_02_Bullet_01 as Laya.Sprite).getComponent(bingqilinzuhe_bullet);

                    bingqilinzuhe_Bullet.group = l//组
                    switch (r) {
                        case 0:
                            bingqilinzuhe_Bullet.firstAngle = l * 12;
                            break;
                        case 1:
                            bingqilinzuhe_Bullet.firstAngle = l * 12 + 45;
                            break;
                        default:
                            break;
                    }
                    bingqilinzuhe_Bullet.moveOnOff = true;//运动开关
                    bingqilinzuhe_Bullet.bossName = this.owner.name; //boss名称
                })
            }
            this.attack_02_Delayed_01 = 0;//每一列循环结束之后延时重置；
        }
    }

    // 大招
    skill(): void {
        this.skeleton.play('skill', false);
        this.moveOnOff = false;//攻击时候停止移动
        this.attackCounter++;
        this.skeleton.on(Laya.Event.STOPPED, this, function () {
            this.skeleton.play('stand', true);
            this.moveOnOff = true;
        })
        this.skill_01_Bullet_01();
        // Laya.timer.frameOnce(200, this, function () {
        //     if (this.owner.scene === null) {
        //         return;
        //     }
        //     console.log('第二种子弹发射');
        //     this.skill_01_Bullet_02();
        // })
    }

    //skill子弹类型1
    private skill_01_Delayed_01 = 0;//延时时间
    private skill_01_Angle_01 = 40;//角度记录
    skill_01_Bullet_01(): void {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        for (let r = 0; r < 2; r++) {
            for (let l = 0; l < 100; l++) {
                this.skill_01_Delayed_01 += 2;
                Laya.timer.frameOnce(this.skill_01_Delayed_01, this, function () {
                    if (this.owner.scene == null) {
                        return;
                    }
                    let skill_01_Bullet_01 = this.initBullet();
                    // 位置需要修正
                    let bulletX = this.self.x + this.self.width * 1 / 3;
                    let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                    // 注意每次位置参考的层次属性都不尽相同
                    switch (r) {
                        case 0:
                            skill_01_Bullet_01.pos(bulletX + 200, bulletY);
                            break;
                        case 1:
                            skill_01_Bullet_01.pos(bulletX - 200, bulletY);
                            break;
                        default:
                            break;
                    }
                    skill_01_Bullet_01.name = 'skill_01_Bullet_01';

                    //先判断是否有了这个脚本
                    let bingqilinzuhe_Bullet = (skill_01_Bullet_01 as Laya.Sprite).getComponent(bingqilinzuhe_bullet);
                    if (!bingqilinzuhe_Bullet) {
                        (skill_01_Bullet_01 as Laya.Sprite).addComponent(bingqilinzuhe_bullet);
                    }
                    bingqilinzuhe_Bullet = (skill_01_Bullet_01 as Laya.Sprite).getComponent(bingqilinzuhe_bullet);

                    bingqilinzuhe_Bullet.moveOnOff = true;//运动开关
                    bingqilinzuhe_Bullet.row = r;
                    bingqilinzuhe_Bullet.bossName = this.owner.name; //boss名称
                    bingqilinzuhe_Bullet.bossPosX = bulletX;
                    bingqilinzuhe_Bullet.bossPosY = bulletY;
                    if ((l >= 0 && l < 10) || (l >= 20 && l < 30) || (l >= 40 && l < 50) || (l >= 60 && l < 70) || (l >= 80 && l < 90)) {
                        if (bingqilinzuhe_Bullet.row === 0) {
                            this.skill_01_Angle_01 -= 6;
                        } else if (bingqilinzuhe_Bullet.row === 1) {
                            this.skill_01_Angle_01 -= (6 + 40);
                        }
                        bingqilinzuhe_Bullet.skill_01_FirstAngle_01 = this.skill_01_Angle_01;
                    } else if ((l >= 10 && l < 20) || (l >= 30 && l < 40) || (l >= 50 && l < 60) || (l >= 70 && l < 80) || (l >= 90 && l < 100)) {
                        if (bingqilinzuhe_Bullet.row === 0) {
                            this.skill_01_Angle_01 -= (6 + 40);
                        } else if (bingqilinzuhe_Bullet.row === 1) {
                            this.skill_01_Angle_01 += 6;
                        }
                        bingqilinzuhe_Bullet.skill_01_FirstAngle_01 = this.skill_01_Angle_01;
                    }
                    if (r === 1 && l === 99) {
                        this.skill_01_Bullet_02();//全部播放完毕之后接上第二种子弹
                    }
                })
            }
            this.skill_01_Angle_01 = 40;
            this.skill_01_Delayed_01 = 0;//每一列循环结束之后延时重置；
        }
    }

    //skill子弹类型2
    private skill_01_Delayed_02: number = 0;//延时时间
    private skill_01_Angle_02: number = 40;
    skill_01_Bullet_02(): void {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        for (let r = 0; r < 1; r++) {
            for (let l = 0; l < 100; l++) {
                this.skill_01_Delayed_02 += 2;
                Laya.timer.frameOnce(this.skill_01_Delayed_02, this, function () {
                    if (this.owner.scene == null) {
                        return;
                    }
                    let skill_01_Bullet_02 = this.initBullet();
                    // 位置需要修正
                    let bulletX = this.self.x + this.self.width * 1 / 3;
                    let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                    // 注意每次位置参考的层次属性都不尽相同
                    switch (r) {
                        case 0:
                            skill_01_Bullet_02.pos(bulletX, bulletY);
                            break;
                        case 1:
                            skill_01_Bullet_02.pos(bulletX, bulletY);
                            break;
                        default:
                            break;
                    }
                    skill_01_Bullet_02.name = 'skill_01_Bullet_02';

                    //先判断是否有了这个脚本
                    let bingqilinzuhe_Bullet = (skill_01_Bullet_02 as Laya.Sprite).getComponent(bingqilinzuhe_bullet);
                    if (!bingqilinzuhe_Bullet) {
                        (skill_01_Bullet_02 as Laya.Sprite).addComponent(bingqilinzuhe_bullet);
                    }
                    bingqilinzuhe_Bullet = (skill_01_Bullet_02 as Laya.Sprite).getComponent(bingqilinzuhe_bullet);

                    bingqilinzuhe_Bullet.moveOnOff = true;//运动开关
                    bingqilinzuhe_Bullet.row = r;
                    bingqilinzuhe_Bullet.bossName = this.owner.name; //boss名称
                    bingqilinzuhe_Bullet.bossPosX = bulletX;
                    bingqilinzuhe_Bullet.bossPosY = bulletY;
                    if ((l >= 0 && l < 10) || (l >= 20 && l < 30) || (l >= 40 && l < 50) || (l >= 60 && l < 70) || (l >= 80 && l < 90)) {
                        this.skill_01_Angle_02 += 12;
                        bingqilinzuhe_Bullet.skill_01_FirstAngle_02 = this.skill_01_Angle_02;
                    } else if ((l >= 10 && l < 20) || (l >= 30 && l < 40) || (l >= 50 && l < 60) || (l >= 70 && l < 80) || (l >= 90 && l < 100)) {
                        this.skill_01_Angle_02 -= 12;
                        bingqilinzuhe_Bullet.skill_01_FirstAngle_02 = this.skill_01_Angle_02;
                    }
                    if (r === 0 && l === 99) {
                        this.skill_01_Bullet_03();//全部播放完毕之后接上第三种子弹
                    }
                })
            }
            this.skill_01_Angle_02 = 40;
            this.skill_01_Delayed_02 = 0;//每一列循环结束之后延时重置；
        }
    }

    //普攻2子弹生成类型1
    private skill_01_Delayed_03 = 0;//延时帧数
    skill_01_Bullet_03(): void {
        // 改变子弹父节点的层级，要大于boss
        // (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 1;
        // this.self.parent.zOrder = 2;
        for (let r = 0; r < 6; r++) {
            for (let l = 0; l < 150; l++) {
                this.skill_01_Delayed_03 += 2;
                Laya.timer.frameOnce(this.skill_01_Delayed_03, this, function () {
                    if (this.owner.scene == null) {
                        return;
                    }
                    let skill_01_Bullet_03 = this.initBullet();
                    skill_01_Bullet_03.name = 'skill_01_Bullet_03';
                    // 位置需要修正
                    let bulletX = this.self.x + this.self.width * 1 / 3;
                    let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                    skill_01_Bullet_03.pos(bulletX, bulletY);
                    //先判断是否有了这个脚本
                    let bingqilinzuhe_Bullet = (skill_01_Bullet_03 as Laya.Sprite).getComponent(bingqilinzuhe_bullet);
                    if (!bingqilinzuhe_Bullet) {
                        (skill_01_Bullet_03 as Laya.Sprite).addComponent(bingqilinzuhe_bullet);
                    }
                    bingqilinzuhe_Bullet = (skill_01_Bullet_03 as Laya.Sprite).getComponent(bingqilinzuhe_bullet);

                    bingqilinzuhe_Bullet.group = l//组
                    switch (r) {
                        case 0:
                            bingqilinzuhe_Bullet.skill_01_FirstAngle_03 = l * 12 - 12;
                            break;
                        case 1:
                            bingqilinzuhe_Bullet.skill_01_FirstAngle_03 = l * 12;
                            break;
                        case 2:
                            bingqilinzuhe_Bullet.skill_01_FirstAngle_03 = l * 12 + 108;
                            break;
                        case 3:
                            bingqilinzuhe_Bullet.skill_01_FirstAngle_03 = l * 12 + 120;
                            break;
                        case 4:
                            bingqilinzuhe_Bullet.skill_01_FirstAngle_03 = l * 12 + 228;
                            break;
                        case 5:
                            bingqilinzuhe_Bullet.skill_01_FirstAngle_03 = l * 12 + 240;
                            break;

                        default:
                            break;
                    }
                    bingqilinzuhe_Bullet.moveOnOff = true;//运动开关
                    bingqilinzuhe_Bullet.bossName = this.owner.name; //boss名称
                })
            }
            this.skill_01_Delayed_03 = 0;//每一列循环结束之后延时重置；
        }
    }


    onUpdate() {
        if (this.moveOnOff && !PlayingSceneControl.instance.isGamePause) {
            this.move();
            //通过时间间隔发动攻击
            let nowTime = Date.now();
            if (this.firstAttack && nowTime - this.attack_NowTime > this.firstAttack_Interval) {
                this.attack_NowTime = nowTime;//重置时间
                this.firstAttack = false;
                this.attack('null');
            } else if (nowTime - this.attack_NowTime > this.attack_Interval) {
                this.attack_NowTime = nowTime;//重置时间
                //场景切换后立即结束子弹的创建和发射
                if (this.owner.scene !== null) {
                    // 子弹发射规则
                    // 血量高于50%以上，两种普通子弹随机发射
                    // 血量低于50%，大招和两种普通子弹随机一个切换；
                    // 通过攻击次数控制子弹发射类型
                    let bate = this.self.vars_.propertyObj.hp / this.self.vars_.propertyObj.startHp;
                    if (bate > 0.5) {
                        this.attack('null');
                    } else {
                        if (this.attackCounter % 2 !== 0) {
                            this.attack_Interval = 15000;
                            this.skill();//大招1
                            // 延长下次技能释放时间间隔
                        } else {
                            // 做预防，防止时间错乱
                            if (this.attack_Interval !== 8000) {
                                this.attack_Interval = 8000;
                            }
                            this.attack('random');
                        }
                    }
                } else {
                    this.moveOnOff = false;
                }
            }
        }
    }

    onDisable(): void {
        Laya.timer.clearAll(this);
    }
}