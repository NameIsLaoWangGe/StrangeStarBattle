import BulletCommon from "../role/BulletCommon"
import Data2 from "../Data/JsonEnum"
import DataType = Data2.DataType;
import EnemyObject from "../role/EnemyObject";
import PlayingSceneControl from "../playing/PlayingSceneControl";
import Tool, { tools } from "../Tools/Tool"
import Enemy from "../playing/Enemy";
import bingtouxiang_bullet from "../Boss/bingtouxiang_bullet";//石头巨人子弹
export default class Boss_jinsenangua extends Laya.Script {
    constructor() {
        super();
        // boss_bingtouxiang石头巨人
    }
    private self;//自己
    private moveDirection: string;//方向记录
    private moveOnOff: Boolean;//移动开关
    private skeleton: Laya.Skeleton;//boss节点下的boss动画
    private bullteParent;//子弹父节点
    private attack_Interval;//时间间隔
    private firstAttack: boolean;
    private firstAttack_Interval: number;//第一次的时间间隔

    private attack_NowTime;//记录当前攻击发动后的时间，用于对比时间间隔
    private attackCounter;//攻击次数计数器；

    onEnable(): void {
        // 需要每次初始化属性
        this.initProperty();
        this.creatBossAni();
    }
    //初始化属性
    initProperty(): void {
        this.attack_NowTime = Date.now();
        this.self = this.owner as Laya.Sprite;
        this.moveOnOff = false;//移动开关
        this.attack_Interval = 8000;//时间间隔
        this.firstAttack = true;
        this.firstAttack_Interval = 2000;//第一次的时间间隔
        this.attackCounter = 0;//攻击次数计数器；
        this.self.name = 'bingtouxiang';
        this.self.markName = 'bingtouxiang';

        //普攻1子弹类型1
        this.attack_01_Delayed_01 = 0;//延时帧数

        // 普通攻击2子弹类型1
        this.attack_02_Delayed_01 = 0;//延时帧数

        //大招1—01
        this.S_01_Delayed_01 = 0;//延时帧数

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
        this.skeleton = this.owner.getChildByName("Boss_bingtouxiang") as Laya.Skeleton;
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

    /**
     * boss的移动行为
     */
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

    /**
     * 两种普通攻击根据攻击次数交替进行
     */
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

    /**实例化子弹
       * @param skin 子弹图片地址
       * */
    initBullet(skin): Laya.Sprite {
        // 子弹父节点
        if (this.owner.scene == null) {
            let bullet_null = new Laya.Sprite();
            return bullet_null;
        }
        this.bullteParent = this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite;
        // 子弹预设
        let bulletObj = new BulletCommon(Data2.BulletType.boss, 30108);//30470
        const bullet_Attack = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
        // 赋予公用属性
        if (!bullet_Attack.vars_) {
            bullet_Attack.vars_ = {};
        }
        bullet_Attack.vars_.propertyObj = Tool.copydata(bulletObj);
        bullet_Attack.vars_.propertyObj.fromNick = this.self.name;
        this.bullteParent.addChild(bullet_Attack);
        bullet_Attack.rotation = 0;
        // 子弹样式替换
        let img = bullet_Attack.getChildByName('img') as Laya.Image;
        img.skin = skin;
        img.pivotX = img.width / 2;
        img.pivotY = img.height / 2;
        img.rotation = 0;

        return bullet_Attack;
    }
    
    /**
     * 普攻1子弹类型1
     */
    private attack_01_Delayed_01 = 0;//延时帧数
    private attack_01_Launches_01: number = 1;//组名复合字符串，使每次创建出来的都是唯一名称
    attack_01_Bullet_01() {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        //角度合集
        let randomAngleArr = [60, 70, 90, 100, 110, 120];
        for (let g = 0; g < 18; g++) {
            this.attack_01_Launches_01 += 35;
            this.attack_01_Delayed_01 += 20;
            Laya.timer.frameOnce(this.attack_01_Delayed_01, this, function () {
                if (this.owner.scene == null) {
                    return;
                }
                let attack_01_Bullet_01 = this.initBullet('enemyBullet/common_bullet.png');
                // 修正位置
                let bulletX = this.self.x + this.self.width * 1 / 3;
                let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                attack_01_Bullet_01.pos(bulletX, bulletY);

                // 名称+释放次数，让名称每轮都唯一
                attack_01_Bullet_01.name = "attack_01_Group_0" + g.toString() + this.attack_01_Launches_01.toString();

                //判断是否有了这个脚本
                let bingtouxiang_Bullet = (attack_01_Bullet_01 as Laya.Sprite).getComponent(bingtouxiang_bullet);
                if (!bingtouxiang_Bullet) {
                    attack_01_Bullet_01.addComponent(bingtouxiang_bullet);
                }
                bingtouxiang_Bullet = (attack_01_Bullet_01 as Laya.Sprite).getComponent(bingtouxiang_bullet);

                bingtouxiang_Bullet.group = g;//组
                bingtouxiang_Bullet.moveOnOff = true;//运动开关
                bingtouxiang_Bullet.bossName = this.owner.name; //boss名称
                bingtouxiang_Bullet.randomAngle = randomAngleArr[Math.floor(Math.random() * randomAngleArr.length)];
                bingtouxiang_Bullet.specialName = 'attack_01_01_Special';
                //附属子弹attack_01_Bullet_02生成，他们组相同
                this.attack_01_Bullet_02(g.toString() + this.attack_01_Launches_01.toString());
            })
        }
        this.attack_01_Delayed_01 = 0;
    }

    //普攻1子弹类型2
    attack_01_Bullet_02(g) {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        for (let r = 0; r < 3; r++) {
            for (let l = 0; l < 6; l++) {
                // 初始化
                let attack_01_Bullet_02 = this.initBullet('enemyBullet/common_bullet.png');
                attack_01_Bullet_02.name = 'attack_01_Bullet_02';
                // 修正位置
                let bulletX = this.self.x + this.self.width * 1 / 3;
                let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                attack_01_Bullet_02.pos(bulletX, bulletY);

                //判断是否有了这个脚本
                let bingtouxiang_Bullet = (attack_01_Bullet_02 as Laya.Sprite).getComponent(bingtouxiang_bullet);
                if (!bingtouxiang_Bullet) {
                    attack_01_Bullet_02.addComponent(bingtouxiang_bullet);
                }
                bingtouxiang_Bullet = (attack_01_Bullet_02 as Laya.Sprite).getComponent(bingtouxiang_bullet);

                bingtouxiang_Bullet.group = g;//组
                bingtouxiang_Bullet.row = r;//组
                bingtouxiang_Bullet.line = l;//列
                bingtouxiang_Bullet.moveOnOff = true;//运动开关
                bingtouxiang_Bullet.bossName = this.owner.name; //boss名称
                bingtouxiang_Bullet.attack_01_02_firstAngle = l * 60;
                //如果boss有特殊子弹，那么其他子弹必须为空
                bingtouxiang_Bullet.specialName = null;
            }
        }
    }

    //普攻2子弹生成类型1
    private attack_02_Delayed_01 = 0;//延时帧数
    attack_02_Bullet_01(): void {
        // 改变子弹父节点的层级
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        for (let g = 0; g < 15; g++) {
            this.attack_02_Delayed_01 += 20;
            Laya.timer.frameOnce(this.attack_02_Delayed_01, this, function () {
                if (this.owner.scene == null) {
                    return;
                }
                for (let r = 0; r < 6; r++) {
                    for (let l = 0; l < 5; l++) {
                        let attack_02_Bullet_01 = this.initBullet('enemyBullet/common_bullet.png');
                        attack_02_Bullet_01.name = 'attack_02_Bullet_01';
                        // 位置需要修正
                        let bulletX = this.self.x + this.self.width * 1 / 3;
                        let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                        attack_02_Bullet_01.pos(bulletX, bulletY);

                        //判断是否有了这个脚本
                        let bingtouxiang_Bullet = (attack_02_Bullet_01 as Laya.Sprite).getComponent(bingtouxiang_bullet);
                        if (!bingtouxiang_Bullet) {
                            attack_02_Bullet_01.addComponent(bingtouxiang_bullet);
                        }
                        bingtouxiang_Bullet = (attack_02_Bullet_01 as Laya.Sprite).getComponent(bingtouxiang_bullet);

                        bingtouxiang_Bullet.group = g//组
                        bingtouxiang_Bullet.row = r//行
                        bingtouxiang_Bullet.line = l//行
                        bingtouxiang_Bullet.A_02_01_firstAngle = r * 60 + 45 + g * 24;//初始角度
                        bingtouxiang_Bullet.moveOnOff = true;//运动开关
                        bingtouxiang_Bullet.bossName = this.owner.name; //boss名称
                        //如果boss有特殊子弹，那么其他子弹必须为空
                        bingtouxiang_Bullet.specialName = null;
                    }
                }
            })
        }
        this.attack_02_Delayed_01 = 0;//环结束之后延时重置；
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
        this.skill_01_Bullet_03();
    }

    /**
     * skill子弹类型1
     * */
    private S_01_Delayed_01 = 0;//延时时间
    skill_01_Bullet_01(): void {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        for (let r = 0; r < 10; r++) {
            this.S_01_Delayed_01 += 30;
            Laya.timer.frameOnce(this.S_01_Delayed_01, this, function () {
                if (this.owner.scene == null) {
                    return;
                }
                for (let l = 0; l < 8; l++) {
                    let skill_01_Bullet_01 = this.initBullet('enemyBullet/common_bullet.png');
                    // 位置需要修正
                    let bulletX = this.self.x + this.self.width * 1 / 3;
                    let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                    skill_01_Bullet_01.pos(bulletX, bulletY);
                    // 注意每次位置参考的层次属性都不尽相同
                    skill_01_Bullet_01.name = 'skill_01_Bullet_01';
                    //判断是否有了这个脚本
                    let bingtouxiang_Bullet = (skill_01_Bullet_01 as Laya.Sprite).getComponent(bingtouxiang_bullet);
                    if (!bingtouxiang_Bullet) {
                        skill_01_Bullet_01.addComponent(bingtouxiang_bullet);
                    }
                    bingtouxiang_Bullet = (skill_01_Bullet_01 as Laya.Sprite).getComponent(bingtouxiang_bullet);

                    bingtouxiang_Bullet.moveOnOff = true;//运动开关
                    bingtouxiang_Bullet.row = r;
                    bingtouxiang_Bullet.line = l;
                    bingtouxiang_Bullet.bossName = this.owner.name; //boss名称
                    bingtouxiang_Bullet.bossPosX = bulletX;
                    bingtouxiang_Bullet.bossPosY = bulletY;
                    bingtouxiang_Bullet.S_01_FirstAngle_01 = 90;
                    //如果boss有特殊子弹，那么其他子弹必须为空
                    bingtouxiang_Bullet.specialName = null;
                }
            })
        }
        this.S_01_Delayed_01 = 0;//每一列循环结束之后延时重置；
    }

    /**延时时间*/
    private S_01_Delayed_02: number = 0;
    /**skill子弹类型2*/
    skill_01_Bullet_02(): void {
        // 改变子弹父节点的层级
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        for (let g = 0; g < 14; g++) {
            this.S_01_Delayed_02 += 25;
            Laya.timer.frameOnce(this.S_01_Delayed_02, this, function () {
                if (this.owner.scene == null) {
                    return;
                }
                for (let r = 0; r < 4; r++) {
                    for (let l = 0; l < 5; l++) {
                        let skill_01_Bullet_02 = this.initBullet('enemyBullet/common_bullet.png');
                        // 位置需要修正
                        let bulletX = this.self.x + this.self.width * 1 / 3;
                        let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                        skill_01_Bullet_02.pos(bulletX, bulletY);
                        // 注意每次位置参考的层次属性都不尽相同
                        skill_01_Bullet_02.name = 'skill_01_Bullet_02';

                        //判断是否有了这个脚本
                        let bingtouxiang_Bullet = (skill_01_Bullet_02 as Laya.Sprite).getComponent(bingtouxiang_bullet);
                        if (!bingtouxiang_Bullet) {
                            skill_01_Bullet_02.addComponent(bingtouxiang_bullet);
                        }
                        bingtouxiang_Bullet = (skill_01_Bullet_02 as Laya.Sprite).getComponent(bingtouxiang_bullet);

                        bingtouxiang_Bullet.moveOnOff = true;//运动开关
                        bingtouxiang_Bullet.row = r;
                        bingtouxiang_Bullet.line = l;
                        bingtouxiang_Bullet.bossName = this.owner.name; //boss名称
                        bingtouxiang_Bullet.bossPosX = bulletX;
                        bingtouxiang_Bullet.bossPosY = bulletY;
                        bingtouxiang_Bullet.S_01_FirstAngle_02 = r * 90 + g * 45;
                        //如果boss有特殊子弹，那么其他子弹必须为空
                        bingtouxiang_Bullet.specialName = null;
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
        for (let r = 0; r < 80; r++) {
            if (r > 60) {
                this.S_01_Delayed_03 += 5;
            } else {
                this.S_01_Delayed_03 += 15;
            }
            Laya.timer.frameOnce(this.S_01_Delayed_03, this, function () {
                if (this.owner.scene == null) {
                    return;
                }
                for (let l = 0; l < 8; l++) {
                    let skill_01_Bullet_03 = this.initBullet('enemyBullet/common_bullet.png');
                    skill_01_Bullet_03.name = 'skill_01_Bullet_03';
                    // 位置需要修正
                    let bulletX = this.self.x + this.self.width * 1 / 3;
                    let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                    skill_01_Bullet_03.pos(bulletX, bulletY);

                    //判断是否有了这个脚本
                    let bingtouxiang_Bullet = (skill_01_Bullet_03 as Laya.Sprite).getComponent(bingtouxiang_bullet);
                    if (!bingtouxiang_Bullet) {
                        skill_01_Bullet_03.addComponent(bingtouxiang_bullet);
                    }
                    bingtouxiang_Bullet = (skill_01_Bullet_03 as Laya.Sprite).getComponent(bingtouxiang_bullet);

                    bingtouxiang_Bullet.row = r;//行
                    bingtouxiang_Bullet.line = l//列
                    bingtouxiang_Bullet.S_01_FirstAngle_03 = l * 45 + 45;
                    // 角度偏差值
                    switch (l) {
                        case 0:
                            bingtouxiang_Bullet.S_01_FirstAngle_03 = 45;
                            break;
                        case 1:
                            bingtouxiang_Bullet.S_01_FirstAngle_03 = 45 - 15;
                            break;
                        case 2:
                            bingtouxiang_Bullet.S_01_FirstAngle_03 = 135;
                            break;
                        case 3:
                            bingtouxiang_Bullet.S_01_FirstAngle_03 = 135 - 15;
                            break;
                        case 4:
                            bingtouxiang_Bullet.S_01_FirstAngle_03 = 225;
                            break;
                        case 5:
                            bingtouxiang_Bullet.S_01_FirstAngle_03 = 225 - 15;
                            break;
                        case 6:
                            bingtouxiang_Bullet.S_01_FirstAngle_03 = 315;
                            break;
                        case 7:
                            bingtouxiang_Bullet.S_01_FirstAngle_03 = 315 - 15;
                            break;
                        default:
                            break;
                    }
                    bingtouxiang_Bullet.S_01_FirstAngle_03 += 30;
                    bingtouxiang_Bullet.S_01_FirstAngle_03 += r * 45;
                    bingtouxiang_Bullet.moveOnOff = true;//运动开关
                    bingtouxiang_Bullet.bossName = this.owner.name; //boss名称
                    //如果boss有特殊子弹，那么其他子弹必须为空
                    bingtouxiang_Bullet.specialName = null;

                    //03作为时间线，分别释放其他子弹
                    if (bingtouxiang_Bullet.row === 0 && bingtouxiang_Bullet.line === 7) {
                        this.skill_01_Bullet_01();//接上第一种子弹
                    } else if (bingtouxiang_Bullet.row === 22 && bingtouxiang_Bullet.line === 7) {
                        this.skill_01_Bullet_02();//接上第二种子弹
                    } else if (bingtouxiang_Bullet.row === 50 && bingtouxiang_Bullet.line === 7) {
                        this.skill_01_Bullet_04();//接上第四种子弹
                    }
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
        for (let r = 0; r < 15; r++) {
            if (r <= 10) {
                this.S_01_Delayed_04 += 20;
            } else {
                this.S_01_Delayed_04 += 10;
            }
            Laya.timer.frameOnce(this.S_01_Delayed_04, this, function () {
                if (this.owner.scene == null) {
                    return;
                }
                for (let l = 0; l < 20; l++) {
                    let skill_01_Bullet_04 = this.initBullet('enemyBullet/common_bullet.png');
                    skill_01_Bullet_04.name = 'skill_01_Bullet_04';
                    // 位置需要修正
                    let bulletX = this.self.x + this.self.width * 1 / 3;
                    let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
                    skill_01_Bullet_04.pos(bulletX, bulletY);

                    //判断是否有了这个脚本
                    let bingtouxiang_Bullet = (skill_01_Bullet_04 as Laya.Sprite).getComponent(bingtouxiang_bullet);
                    if (!bingtouxiang_Bullet) {
                        skill_01_Bullet_04.addComponent(bingtouxiang_bullet);
                    }
                    bingtouxiang_Bullet = (skill_01_Bullet_04 as Laya.Sprite).getComponent(bingtouxiang_bullet);

                    bingtouxiang_Bullet.row = r;//行
                    bingtouxiang_Bullet.group = l//列
                    bingtouxiang_Bullet.S_01_FirstAngle_04 = l * 18;
                    bingtouxiang_Bullet.moveOnOff = true;//运动开关
                    bingtouxiang_Bullet.bossName = this.owner.name; //boss名称
                    //如果boss有特殊子弹，那么其他子弹必须为空
                    bingtouxiang_Bullet.specialName = null;
                }
            })
        }
        this.S_01_Delayed_04 = 0;//每一列循环结束之后延时重置；
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
                            this.attack_Interval = 20000;
                            this.skill();//大招1
                            // 延长下次技能释放时间间隔
                        } else {
                            // 做预防，防止时间错乱
                            if (this.attack_Interval !== 7000) {
                                this.attack_Interval = 7000;
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