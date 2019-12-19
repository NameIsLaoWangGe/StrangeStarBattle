import BulletCommon from "../role/BulletCommon"
import Data2 from "../Data/JsonEnum"
import DataType = Data2.DataType;
import EnemyObject from "../role/EnemyObject";
import PlayingSceneControl from "../playing/PlayingSceneControl";
import Tool, { tools } from "../Tools/Tool"
import Enemy from "../playing/Enemy";
import zhangyunvhuang_bullet from "../Boss/zhangyunvhuang_bullet";//章鱼女皇子弹
export default class Boss_jinsenangua extends Laya.Script {
    constructor() {
        super();
        // boss_zhangyunvhuang//章鱼女皇
    }
    private self;//自己
    /**方向记录 */
    private moveDirection: string;//
    private moveOnOff: Boolean = false;//移动开关
    private skeleton: Laya.Skeleton;//boss节点下的boss动画
    private bullteParent;//子弹父节点
    private attack_Interval = 10000;//时间间隔
    private firstAttack: boolean = true;
    private firstAttack_Interval;//第一次的时间间隔
    private boosCurrentX: number;//boss当前x
    private boosCurrentY: number;//boss当前y

    private attack_NowTime;//记录当前攻击发动后的时间，用于对比时间间隔
    private attackCounter: number = 0;//攻击次数计数器；

    onEnable(): void {
        // 需要每次初始化属性
        this.initProperty();
        this.creatBossAni();
    }
    //初始化属性
    initProperty(): void {
        this.self = this.owner as Laya.Sprite;
        this.moveOnOff = false;//移动开关
        this.attack_Interval = 8500;//时间间隔
        this.firstAttack = true;
        this.firstAttack_Interval = 4000//第一次的时间间隔
        this.attackCounter = 0;//攻击次数计数器；
        this.attack_NowTime = Date.now();

        this.boosCurrentX = null;//boss当前x
        this.boosCurrentY = null;//boss当前y


        //普攻1子弹类型1
        this.attack_01_Delayed_01 = 0;//延时帧数

        // 普通攻击2子弹类型1
        this.attack_02_Delayed_01 = 0;//延时帧数

        //大招1—01

        //大招1—02
        this.S_01_Delayed_02 = 0;//延时帧数

        //大招1—03
        this.S_01_Delayed_03 = 0;//延时帧数

        //大招1—03
        this.S_01_Delayed_04 = 0;//延时帧数

    }

    //创建boss
    private bossTemplet: Laya.Templet;
    creatBossAni(): void {
        //骨骼动画赋值
        const nick = (this.owner["vars_"].propertyObj as EnemyObject).nick;
        this.skeleton = this.owner.getChildByName("Boss_zhangyunvhuang") as Laya.Skeleton;
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
        // this.bossTemplet.loadAni("dragonbones/boss_zhangyunvhuang.sk");
    }

    /**
     * 
     */
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

    /**
     * boss的移动行为
     */
    move() {
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

        // // 延时用于匹配动作
        Laya.timer.frameOnce(30, this, function () {
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
        let bulletObj = new BulletCommon(Data2.BulletType.boss, 31148);//30470
        const bullet_Attack = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
        // 赋予公用属性
        if (!bullet_Attack.vars_) {
            bullet_Attack.vars_ = {};
        }
        bullet_Attack.vars_.propertyObj = Tool.copydata(bulletObj);
        bullet_Attack.vars_.propertyObj.bossBulletType = Data2.bossBulletType.common;
        //发射子弹的boss的nick,名称，目前这个子弹出来就会被消除。
        bullet_Attack.vars_.propertyObj.fromNick = this.owner["vars_"].propertyObj.nick;
        this.bullteParent.addChild(bullet_Attack);
        return bullet_Attack;
    }

    //普攻1子弹类型1
    private attack_01_Delayed_01 = 0;//延时帧数
    private attack_01_Launches_01: number = 1;
    attack_01_Bullet_01() {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        //角度合集
        for (let g = 0; g < 8; g++) {
            if (g === 4) {
                this.attack_01_Delayed_01 += 80;
            } else {
                this.attack_01_Delayed_01 += 30;
            }
            Laya.timer.frameOnce(this.attack_01_Delayed_01, this, function () {
                if (this.owner.scene == null) {
                    return;
                }
                for (let r = 0; r < 12; r++) {
                    for (let l = 0; l < 6; l++) {
                        let attack_01_Bullet_01 = this.initBullet();
                        // 释放次数，让名称每轮都唯一
                        attack_01_Bullet_01.name = "attack_01_Bullet_01";
                        // // 修正位置
                        let bulletX = this.self.x + this.self.width * 1 / 3;
                        let bulletY = this.self.y + this.self.height * 1 / 3 + 50;

                        attack_01_Bullet_01.pos(bulletX, bulletY);

                        //先判断是否已经有了这个脚本
                        let zhangyunvhuang_Bullet = (attack_01_Bullet_01 as Laya.Sprite).getComponent(zhangyunvhuang_bullet);
                        if (!zhangyunvhuang_Bullet) {
                            (attack_01_Bullet_01 as Laya.Sprite).addComponent(zhangyunvhuang_bullet);
                        }
                        zhangyunvhuang_Bullet = (attack_01_Bullet_01 as Laya.Sprite).getComponent(zhangyunvhuang_bullet);

                        zhangyunvhuang_Bullet.group = g;
                        zhangyunvhuang_Bullet.row = r;
                        zhangyunvhuang_Bullet.line = l;
                        zhangyunvhuang_Bullet.moveOnOff = true;//运动开关
                        zhangyunvhuang_Bullet.bossName = this.owner.name; //boss名称
                        zhangyunvhuang_Bullet.A_01_01_firstAngle = r * 36;
                    }
                }
            })
        }
        this.attack_01_Delayed_01 = 0;
    }


    //普攻2子弹生成类型1
    private attack_02_Delayed_01 = 0;//延时帧数
    attack_02_Bullet_01(): void {
        // 改变子弹父节点的层级
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        for (let l = 0; l < 250; l++) {
            Laya.timer.frameOnce(this.attack_02_Delayed_01, this, function () {
                if (this.owner.scene == null) {
                    return;
                }
                let attack_02_Bullet_01 = this.initBullet();
                attack_02_Bullet_01.name = 'attack_02_Bullet_01';
                // 位置需要修正
                let bulletX = this.self.x + this.self.width * 1 / 3;
                let bulletY = this.self.y + this.self.height * 1 / 3 + 150;

                //先判断是否已经有了这个脚本
                let zhangyunvhuang_Bullet = (attack_02_Bullet_01 as Laya.Sprite).getComponent(zhangyunvhuang_bullet);
                if (!zhangyunvhuang_Bullet) {
                    (attack_02_Bullet_01 as Laya.Sprite).addComponent(zhangyunvhuang_bullet);
                }
                zhangyunvhuang_Bullet = (attack_02_Bullet_01 as Laya.Sprite).getComponent(zhangyunvhuang_bullet);

                zhangyunvhuang_Bullet.line = l//行
                //位置
                if (l % 2 === 0) {
                    zhangyunvhuang_Bullet.A_02_01_firstAngle = l * 12;//初始角度
                    attack_02_Bullet_01.pos(Laya.stage.width * 1 / 4 - 25, bulletY);
                } else {
                    attack_02_Bullet_01.pos(Laya.stage.width * 3 / 4 - 25, bulletY);
                    zhangyunvhuang_Bullet.A_02_01_firstAngle = -l * 12;//初始角度
                }
                zhangyunvhuang_Bullet.moveOnOff = true;//运动开关
                zhangyunvhuang_Bullet.bossName = this.owner.name; //boss名称
                zhangyunvhuang_Bullet.bossPosX = bulletX;
                zhangyunvhuang_Bullet.bossPosX = bulletY;
                // 技能释放完毕之后把位置清掉
                if (zhangyunvhuang_Bullet.line === 249) {
                    this.attack_02_Bullet_02();
                }
            })
            this.attack_02_Delayed_01 += 1;
        }
        this.attack_02_Delayed_01 = 0;//环结束之后延时重置；
    }

    //普攻2子弹生成类型1
    private attack_02_Delayed_02 = 0;//延时帧数
    attack_02_Bullet_02(): void {
        // 改变子弹父节点的层级
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        for (let l = 0; l < 100; l++) {
            Laya.timer.frameOnce(this.attack_02_Delayed_02, this, function () {
                if (this.owner.scene == null) {
                    return;
                }
                let attack_02_Bullet_02 = this.initBullet();
                attack_02_Bullet_02.name = 'attack_02_Bullet_02';
                // 位置需要修正
                let bulletX = this.self.x + this.self.width * 1 / 3;
                let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                attack_02_Bullet_02.pos(bulletX, bulletY);

                //先判断是否已经有了这个脚本
                let zhangyunvhuang_Bullet = (attack_02_Bullet_02 as Laya.Sprite).getComponent(zhangyunvhuang_bullet);
                if (!zhangyunvhuang_Bullet) {
                    (attack_02_Bullet_02 as Laya.Sprite).addComponent(zhangyunvhuang_bullet);
                }
                zhangyunvhuang_Bullet = (attack_02_Bullet_02 as Laya.Sprite).getComponent(zhangyunvhuang_bullet);

                zhangyunvhuang_Bullet.line = l//行
                zhangyunvhuang_Bullet.moveOnOff = true;//运动开关
                zhangyunvhuang_Bullet.bossName = this.owner.name; //boss名称
                zhangyunvhuang_Bullet.bossPosX = bulletX;
                zhangyunvhuang_Bullet.bossPosX = bulletY;
                zhangyunvhuang_Bullet.A_02_02_firstAngle = l * 12;//初始角度
                // 技能释放完毕之后把位置清掉
            })
            this.attack_02_Delayed_02 += 1;
        }
        this.attack_02_Delayed_02 = 0;//环结束之后延时重置；
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
    }

    //skill子弹类型1
    private S_01_Delayed_01 = 0;
    skill_01_Bullet_01(): void {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        for (let g = 0; g < 28; g++) {
            this.S_01_Delayed_01 += 45;
            Laya.timer.frameOnce(this.S_01_Delayed_01, this, function () {
                if (this.owner.scene == null) {
                    return;
                }
                for (let r = 0; r < 6; r++) {
                    for (let l = 0; l < 4; l++) {
                        let skill_01_Bullet_01 = this.initBullet();
                        // 位置需要修正,这次是在boss的四周
                        let bulletX = this.self.x + this.self.width * 1 / 3;
                        let bulletY = this.self.y + this.self.height * 1 / 3 + 150;
                        skill_01_Bullet_01.pos(bulletX, bulletY);
                        // 注意每次位置参考的层次属性都不尽相同
                        skill_01_Bullet_01.name = 'skill_01_Bullet_01';

                        //先判断是否已经有了这个脚本
                        let zhangyunvhuang_Bullet = (skill_01_Bullet_01 as Laya.Sprite).getComponent(zhangyunvhuang_bullet);
                        if (!zhangyunvhuang_Bullet) {
                            (skill_01_Bullet_01 as Laya.Sprite).addComponent(zhangyunvhuang_bullet);
                        }
                        zhangyunvhuang_Bullet = (skill_01_Bullet_01 as Laya.Sprite).getComponent(zhangyunvhuang_bullet);

                        zhangyunvhuang_Bullet.moveOnOff = true;//运动开关
                        zhangyunvhuang_Bullet.group = g;
                        zhangyunvhuang_Bullet.row = r;
                        zhangyunvhuang_Bullet.line = l;
                        zhangyunvhuang_Bullet.bossName = this.owner.name; //boss名称
                        zhangyunvhuang_Bullet.bossPosX = bulletX;
                        zhangyunvhuang_Bullet.bossPosY = bulletY;
                        zhangyunvhuang_Bullet.S_01_01_firstAngle = r * 60;
                        if (zhangyunvhuang_Bullet.group === 3 && zhangyunvhuang_Bullet.row === 5 && zhangyunvhuang_Bullet.line === 3) {
                            this.skill_01_Bullet_04();
                        } else if (zhangyunvhuang_Bullet.group === 12 && zhangyunvhuang_Bullet.row === 5 && zhangyunvhuang_Bullet.line === 3) {
                            this.skill_01_Bullet_03();
                        } else if (zhangyunvhuang_Bullet.group === 23 && zhangyunvhuang_Bullet.row === 5 && zhangyunvhuang_Bullet.line === 3) {
                            this.skill_01_Bullet_02();
                        }
                    }
                }
            })
        }
        this.S_01_Delayed_01 = 0;
    }

    //skill子弹类型2
    private S_01_Delayed_02: number = 0;//延时时间
    skill_01_Bullet_02(): void {
        // 改变子弹父节点的层级
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        for (let g = 0; g < 60; g++) {
            this.S_01_Delayed_02 += 5;
            Laya.timer.frameOnce(this.S_01_Delayed_02, this, function () {
                if (this.owner.scene == null) {
                    return;
                }
                for (let r = 0; r < 8; r++) {
                    let number;
                    if (g > 40) {
                        number = 9;
                    } else {
                        number = 1;
                    }
                    for (let l = 0; l < number; l++) {
                        let skill_01_Bullet_02 = this.initBullet();
                        // 位置需要修正
                        // let bulletX = this.self.x + this.self.width * 1 / 3;
                        let bulletX = Laya.stage.width / 2 - 25;
                        let bulletY = this.self.y + this.self.height * 1 / 3 + 100;
                        skill_01_Bullet_02.pos(bulletX, bulletY);
                        skill_01_Bullet_02.name = 'skill_01_Bullet_02';

                        //先判断是否已经有了这个脚本
                        let zhangyunvhuang_Bullet = (skill_01_Bullet_02 as Laya.Sprite).getComponent(zhangyunvhuang_bullet);
                        if (!zhangyunvhuang_Bullet) {
                            (skill_01_Bullet_02 as Laya.Sprite).addComponent(zhangyunvhuang_bullet);
                        }
                        zhangyunvhuang_Bullet = (skill_01_Bullet_02 as Laya.Sprite).getComponent(zhangyunvhuang_bullet);

                        zhangyunvhuang_Bullet.moveOnOff = true;//运动开关
                        zhangyunvhuang_Bullet.group = g;
                        zhangyunvhuang_Bullet.row = r;
                        zhangyunvhuang_Bullet.line = l;
                        zhangyunvhuang_Bullet.bossName = this.owner.name; //boss名称s
                        zhangyunvhuang_Bullet.bossPosX = bulletX;
                        zhangyunvhuang_Bullet.bossPosY = bulletY;
                        zhangyunvhuang_Bullet.S_01_02_firstAngle = r * 45 + g * 2;
                    }
                }
            })
        }
        this.S_01_Delayed_02 = 0;//每一列循环结束之后延时重置；
    }

    //普攻2子弹生成类型1
    private S_01_Delayed_03 = 0;//延时帧数
    skill_01_Bullet_03(): void {
        // 改变子弹父节点的层级
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        for (let r = 0; r < 20; r++) {
            this.S_01_Delayed_03 += (40 - r * 1);
            Laya.timer.frameOnce(this.S_01_Delayed_03, this, function () {
                if (this.owner.scene == null) {
                    return;
                }
                for (let l = 0; l < 30; l++) {
                    let skill_01_Bullet_03 = this.initBullet();
                    skill_01_Bullet_03.name = 'skill_01_Bullet_03';
                    // 位置需要修正
                    let bulletX = Laya.stage.width / 2 - 25;
                    let bulletY = this.self.y + this.self.height * 1 / 3 + 100;
                    skill_01_Bullet_03.pos(bulletX, bulletY);

                    //先判断是否已经有了这个脚本
                    let zhangyunvhuang_Bullet = (skill_01_Bullet_03 as Laya.Sprite).getComponent(zhangyunvhuang_bullet);
                    if (!zhangyunvhuang_Bullet) {
                        (skill_01_Bullet_03 as Laya.Sprite).addComponent(zhangyunvhuang_bullet);
                    }
                    zhangyunvhuang_Bullet = (skill_01_Bullet_03 as Laya.Sprite).getComponent(zhangyunvhuang_bullet);

                    zhangyunvhuang_Bullet.row = r;//行
                    zhangyunvhuang_Bullet.line = l;//列
                    zhangyunvhuang_Bullet.moveOnOff = true;//运动开关
                    zhangyunvhuang_Bullet.bossName = this.owner.name; //boss名称
                    zhangyunvhuang_Bullet.S_01_03_firstAngle = l * 12;
                }
            })
        }
        this.S_01_Delayed_03 = 0;//每一列循环结束之后延时重置；
    }

    //普攻2子弹生成类型1
    private S_01_Delayed_04 = 0;//延时帧数
    skill_01_Bullet_04(): void {
        // 改变子弹父节点的层级
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        //节点g
        let key = 50;
        this.S_01_Delayed_04 = 0;//每一列循环结束之后延时重置；
        for (let g = 0; g < 100; g++) {
            if (g === key) {
                this.S_01_Delayed_04 += 15;
            } else {
                this.S_01_Delayed_04 += 6;
            }
            Laya.timer.frameOnce(this.S_01_Delayed_04, this, function () {
                if (this.owner.scene == null) {
                    return;
                }
                for (let r = 0; r < 2; r++) {
                    this.S_01_Delayed_04 += 5;
                    for (let l = 0; l < 3; l++) {
                        let skill_01_Bullet_04 = this.initBullet();
                        skill_01_Bullet_04.name = 'skill_01_Bullet_04';
                        // 位置需要修正
                        let bulletX = this.self.x + this.self.width * 1 / 3;
                        let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                        //位置
                        if (r === 0) {
                            skill_01_Bullet_04.pos(Laya.stage.width * 1 / 4 - 25, bulletY);
                        } else {
                            skill_01_Bullet_04.pos(Laya.stage.width * 3 / 4 - 25, bulletY);
                        }

                        //先判断是否已经有了这个脚本
                        let zhangyunvhuang_Bullet = (skill_01_Bullet_04 as Laya.Sprite).getComponent(zhangyunvhuang_bullet);
                        if (!zhangyunvhuang_Bullet) {
                            (skill_01_Bullet_04 as Laya.Sprite).addComponent(zhangyunvhuang_bullet);
                        }
                        zhangyunvhuang_Bullet = (skill_01_Bullet_04 as Laya.Sprite).getComponent(zhangyunvhuang_bullet);

                        zhangyunvhuang_Bullet.group = g;//行
                        zhangyunvhuang_Bullet.row = r;//行
                        zhangyunvhuang_Bullet.line = l//列
                        zhangyunvhuang_Bullet.moveOnOff = true;//运动开关
                        zhangyunvhuang_Bullet.bossName = this.owner.name; //boss名称

                        // 角度变量
                        let number = 3;
                        let baseAngle = 25;
                        if (g >= 0 && g < key) {
                            if (r === 0) {
                                zhangyunvhuang_Bullet.S_01_firstAngle_04 = (l * 30 + baseAngle) + g * number;
                            } else {
                                zhangyunvhuang_Bullet.S_01_firstAngle_04 = ((180 - baseAngle) - l * 30) - g * number;
                            }
                        } else {
                            if (r === 0) {
                                zhangyunvhuang_Bullet.S_01_firstAngle_04 = (l * 30 + baseAngle) + key * number - (g - key) * number * 2;
                            } else {
                                zhangyunvhuang_Bullet.S_01_firstAngle_04 = ((180 - baseAngle) - l * 30) - key * number + (g - key) * number * 2;
                            }
                        }
                    }
                }
            })
        }
    }

    //普攻2子弹生成类型1
    private S_01_Delayed_05 = 0;//延时帧数
    skill_01_Bullet_05(): void {
        // 改变子弹父节点的层级
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        for (let g = 0; g < 60; g++) {
            this.S_01_Delayed_05 += 5;
            Laya.timer.frameOnce(this.S_01_Delayed_05, this, function () {
                if (this.owner.scene == null) {
                    return;
                }
                for (let r = 0; r < 2; r++) {
                    this.S_01_Delayed_04 += 5;
                    for (let l = 0; l < 3; l++) {
                        let skill_01_Bullet_05 = this.initBullet();
                        skill_01_Bullet_05.name = 'skill_01_Bullet_05';
                        // 位置需要修正
                        let bulletX = this.self.x + this.self.width * 1 / 3;
                        let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                        //位置
                        if (r === 0) {
                            skill_01_Bullet_05.pos(Laya.stage.width * 1 / 4 - 25, bulletY);
                        } else {
                            skill_01_Bullet_05.pos(Laya.stage.width * 3 / 4 - 25, bulletY);
                        }

                        //先判断是否已经有了这个脚本
                        let zhangyunvhuang_Bullet = (skill_01_Bullet_05 as Laya.Sprite).getComponent(zhangyunvhuang_bullet);
                        if (!zhangyunvhuang_Bullet) {
                            (skill_01_Bullet_05 as Laya.Sprite).addComponent(zhangyunvhuang_bullet);
                        }
                        zhangyunvhuang_Bullet = (skill_01_Bullet_05 as Laya.Sprite).getComponent(zhangyunvhuang_bullet);

                        zhangyunvhuang_Bullet.group = g;//行
                        zhangyunvhuang_Bullet.row = r;//行
                        zhangyunvhuang_Bullet.line = l//列
                        zhangyunvhuang_Bullet.moveOnOff = true;//运动开关
                        zhangyunvhuang_Bullet.bossName = this.owner.name; //boss名称
                        if (r === 0) {
                            zhangyunvhuang_Bullet.S_01_firstAngle_04 = (l * 30 + 60) + g * 1.5;
                        } else {
                            zhangyunvhuang_Bullet.S_01_firstAngle_04 = (l * 30 + 60) - g * 1.5;
                        }
                    }
                }
            })
        }
        this.S_01_Delayed_05 = 0;//每一列循环结束之后延时重置；
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
                            this.attack_Interval = 26000;
                            this.skill();//大招1
                            // 延长下次技能释放时间间隔
                        } else {
                            // 做预防，防止时间错乱
                            if (this.attack_Interval !== 8500) {
                                this.attack_Interval = 8500;
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