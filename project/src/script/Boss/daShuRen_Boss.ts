import BulletCommon from "../role/BulletCommon"
import Data2 from "../Data/JsonEnum"
import DataType = Data2.DataType;
import EnemyObject from "../role/EnemyObject";
import PlayingSceneControl from "../playing/PlayingSceneControl";
import Tool, { tools } from "../Tools/Tool"
import Enemy from "../playing/Enemy";
import daShuRen_bullet from "./daShuRen_bullet";
export default class Boss_jinsenangua extends Laya.Script {
    constructor() {
        super();
        // boss_maoWangHou猫王后
    }
    private self;//自己
    private moveDirection: string;//方向记录
    private moveOnOff: Boolean = false;//移动开关
    private skeleton: Laya.Skeleton;//boss节点下的boss动画
    private bullteParent;//子弹父节点
    private attack_01Interval = 5000;//时间间隔
    private firstAttack: boolean = true;
    private firstAttack_Interval = 500//第一次的时间间隔
    private attack_01Time;//记录当前普通攻击1发动后的时间，用于对比时间间隔
    private attackCounter: number = 0;//攻击次数计数器；

    onEnable(): void {
        this.attack_01Time = Date.now();
        this.self = this.owner as Laya.Sprite;
        this.self.name = 'dashuren';
        this.self.markName = 'dashuren';
        this.creatBossAni();
    }

    /**
    * 创建boss
    */
    private bossTemplet: Laya.Templet;
    creatBossAni(): void {
        const nick = (this.owner["vars_"].propertyObj as EnemyObject).nick;
        this.skeleton = this.owner.getChildByName("Boss_dashuren") as Laya.Skeleton;
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

    /**boss的移动行为*/
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

    /**普通攻击
    *两种普通攻击根据攻击次数交替进行*/
    attack(random): void {
        this.skeleton.play('attack', false);
        this.moveOnOff = false;//攻击时候停止移动
        this.attackCounter++;
        this.skeleton.on(Laya.Event.STOPPED, this, function () {
            this.skeleton.play('stand', true);
            this.moveOnOff = true;
        })

        // 如果参数是随机random,那么随机发动普通攻击一次,否则按照攻击次数决定
        if (random === "random") {
            let number = Math.floor(Math.random() * 2);
            if (number === 1) {
                this.attack_02_Bullet_01();//普通攻击2
            } else {
                this.attack_01_Bullet_01();//普通攻击1
            }
        } else {
            if (this.attackCounter % 2 !== 0) {
                this.attack_01_Bullet_01();//普通攻击1
            } else {
                this.attack_02_Bullet_01();//普通攻击2
            }
        }
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

    private attack_01_01_Delayed = 0;
    /**普攻1子弹类型1*/
    attack_01_Bullet_01(): void {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        let key = 8;
        for (let r = 0; r < 10; r++) {
            // 延时创建
            Laya.timer.frameOnce(this.attack_01_01_Delayed, this, function () {
                //如果场景被清掉，就不会在执行
                if (this.owner.scene === null) {
                    return;
                }
                for (let l = 0; l < 8; l++) {
                    let bullet_attack01 = this.initBullet('enemyBullet/common_bullet.png');
                    bullet_attack01.name = 'attack_01_Bullet_01';
                    // 修正位置
                    let bulletX = this.self.x + this.self.width * 1 / 3;
                    let bulletY = this.self.y + this.self.height * 1 / 3 + 100;
                    // 注意每次位置参考的层次属性都不尽相同
                    bullet_attack01.pos(bulletX, bulletY);

                    // 判断是否有了这个脚本
                    let daShuRen_Bullet = (bullet_attack01 as Laya.Sprite).getComponent(daShuRen_bullet);
                    if (!daShuRen_Bullet) {
                        (bullet_attack01 as Laya.Sprite).addComponent(daShuRen_bullet);
                    }
                    daShuRen_Bullet = (bullet_attack01 as Laya.Sprite).getComponent(daShuRen_bullet);
                    ;
                    daShuRen_Bullet.row = r;//组
                    daShuRen_Bullet.line = l;//列
                    daShuRen_Bullet.moveOnOff = true;//运动开关
                    let number = 10;
                    let baseAngle = 80;
                    daShuRen_Bullet.firstAngle = (l * 35 - baseAngle) + r * number;
                }
            });
            this.attack_01_01_Delayed += 10;
        }
        this.attack_01_01_Delayed = 0;
    }

    //普攻2子弹生成类型1
    private attack_Delayed = 10;//延时帧数
    attack_02_Bullet_01(): void {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        for (let g = 0; g < 5; g++) {
            Laya.timer.frameOnce(this.attack_Delayed, this, function () {
                //如果场景被清掉，就不会在执行
                if (this.owner.scene === null) {
                    return;
                }
                for (let r = 0; r < 4; r++) {
                    for (let l = 0; l < 5; l++) {
                        let bullet_attack01 = this.initBullet('enemyBullet/common_bullet.png');
                        bullet_attack01.name = 'attack_02_Bullet_01';
                        // 每列位置要和zOrder对应查找；
                        // 位置需要修正
                        let bulletX = this.self.x + this.self.width * 1 / 3;
                        let bulletY = this.self.y + this.self.height * 1 / 3 + 100;
                        // 注意每次位置参考的层次属性都不尽相同
                        switch (r) {
                            case 0:
                                bullet_attack01.pos(bulletX - 100, bulletY);
                                break;
                            case 1:
                                bullet_attack01.pos(bulletX - 50, bulletY);
                                break;
                            case 2:
                                bullet_attack01.pos(bulletX + 50, bulletY);
                                break;
                            case 3:
                                bullet_attack01.pos(bulletX + 100, bulletY);
                                break;
                            default:
                                break;
                        }
                        // 判断是否有了这个脚本
                        let daShuRen_Bullet = (bullet_attack01 as Laya.Sprite).getComponent(daShuRen_bullet);
                        if (!daShuRen_Bullet) {
                            (bullet_attack01 as Laya.Sprite).addComponent(daShuRen_bullet);
                        }
                        daShuRen_Bullet = (bullet_attack01 as Laya.Sprite).getComponent(daShuRen_bullet);

                        daShuRen_Bullet.group = g//组
                        daShuRen_Bullet.row = r;//行
                        daShuRen_Bullet.line = l;//列
                        daShuRen_Bullet.moveOnOff = true;//运动开关
                        daShuRen_Bullet.velocityRandom = Math.random() * 15 + 5;//运动速度随机
                    }
                }
            })
            this.attack_Delayed += 15;
        }
        this.attack_Delayed = 0;//每一列循环结束之后延时重置；
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
    private skill_Delayed = 0;//延时时间
    skill_01_Bullet_01(): void {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        for (let g = 0; g < 5; g++) {
            Laya.timer.frameOnce(this.skill_Delayed, this, function () {
                //如果场景被清掉，就不会在执行
                if (this.owner.scene === null) {
                    return;
                }
                for (let r = 0; r < 10; r++) {
                    for (let l = 0; l < 8; l++) {
                        let bullet_attack01 = this.initBullet('enemyBullet/common_bullet.png');
                        if (bullet_attack01["testvar"]) {
                            console.error("创建标记zidan");
                        }
                        bullet_attack01.name = 'skill_01_Bullet_01';
                        // 每列位置要和zOrder对应查找；
                        // 位置需要修正
                        let bulletX = this.self.x + this.self.width * 1 / 3;
                        let bulletY = this.self.y + this.self.height * 1 / 3;
                        // 注意每次位置参考的层次属性都不尽相同
                        bullet_attack01.pos(bulletX, bulletY);

                        // 判断是否有了这个脚本
                        let daShuRen_Bullet = (bullet_attack01 as Laya.Sprite).getComponent(daShuRen_bullet);
                        if (!daShuRen_Bullet) {
                            (bullet_attack01 as Laya.Sprite).addComponent(daShuRen_bullet);
                        }
                        daShuRen_Bullet = (bullet_attack01 as Laya.Sprite).getComponent(daShuRen_bullet);
                        ;

                        daShuRen_Bullet.group = g;//组
                        daShuRen_Bullet.row = r;//组
                        daShuRen_Bullet.line = l;//列
                        daShuRen_Bullet.moveOnOff = true;//运动开关
                        daShuRen_Bullet.velocityRandom = Math.random() * 15 + 5;
                    }
                }
            })
            this.skill_Delayed += 10;
        }
        this.skill_Delayed = 0;//延时时间在结束之后重置为0
    }

    onUpdate() {

        if (this.moveOnOff && !PlayingSceneControl.instance.isGamePause) {
            this.move();
            //通过时间间隔发动攻击
            let nowTime = Date.now();
            // 首次攻击很快
            if (this.firstAttack && nowTime - this.attack_01Time > this.firstAttack_Interval) {
                this.attack('null');
                this.firstAttack = false;
                this.attack_01Time = nowTime;//重置时间
            }
            if (nowTime - this.attack_01Time > this.attack_01Interval) {
                this.attack_01Time = nowTime;//重置时间
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
                            this.skill();//大招1
                        } else {
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