import BulletCommon from "../role/BulletCommon"
import Data2 from "../Data/JsonEnum"
import DataType = Data2.DataType;
import EnemyObject from "../role/EnemyObject";
import PlayingSceneControl from "../playing/PlayingSceneControl";
import Tool, { tools } from "../Tools/Tool"
import Enemy from "../playing/Enemy";
import shitoujuren_bullet from "../Boss/shitoujuren_bullet";//石头巨人子弹
export default class Boss_jinsenangua extends Laya.Script {
    constructor() {
        super();
        // boss_shitoujuren石头巨人
    }
    private self;//自己
    private moveDirection: string;//方向记录
    private moveOnOff: Boolean = false;//移动开关
    private skeleton: Laya.Skeleton;//boss节点下的boss动画
    private bullteParent;//子弹父节点
    private attack_Interval = 6000;//时间间隔
    private firstAttack: boolean = true;
    private firstAttack_Interval = 500//第一次的时间间隔

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
        this.attack_Interval = 6000;//时间间隔
        this.firstAttack = true;
        this.firstAttack_Interval = 500//第一次的时间间隔
        this.attackCounter = 0;//攻击次数计数器；
        this.attack_NowTime = Date.now();
        this.self.name = 'shitoujuren';
    }

    //创建boss
    private bossTemplet: Laya.Templet;
    creatBossAni(): void {
        const nick = (this.owner["vars_"].propertyObj as EnemyObject).nick;
        this.skeleton = this.owner.getChildByName("Boss_shitoujuren") as Laya.Skeleton;
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
        // this.bossTemplet.loadAni("dragonbones/boss_shitoujuren.sk");
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
        let bulletObj = new BulletCommon(Data2.BulletType.boss, 30524);//30470
        const bullet_Attack = Laya.Pool.getItemByCreateFun(bulletObj.nick, bulletObj.res.create, bulletObj.res);
        // 赋予公用属性
        if (!bullet_Attack.vars_) {
            bullet_Attack.vars_ = {};
        }
        bullet_Attack.vars_.propertyObj = Tool.copydata(bulletObj);

        bullet_Attack.vars_.propertyObj.bossBulletType = Data2.bossBulletType.common;
        bullet_Attack.vars_.propertyObj.fromNick = this.self.name;
        this.bullteParent.addChild(bullet_Attack);
        return bullet_Attack;
    }

    //普攻1子弹类型1
    attack_01_Bullet_01() {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        for (let g = 0; g < 6; g++) {
            for (let r = 0; r < 6; r++) {
                for (let l = 0; l < 6; l++) {
                    let attack_01_Bullet_01 = this.initBullet();
                    attack_01_Bullet_01.name = 'attack_01_Bullet_01';
                    // 修正位置
                    let bulletX = this.self.x + this.self.width * 1 / 3;
                    let bulletY = this.self.y + this.self.height * 1 / 3 + 150;
                    attack_01_Bullet_01.pos(bulletX, bulletY);

                    //先是否有了这个脚本
                    let shitoujuren_Bullet = (attack_01_Bullet_01 as Laya.Sprite).getComponent(shitoujuren_bullet);
                    if (!shitoujuren_Bullet) {
                        (attack_01_Bullet_01 as Laya.Sprite).addComponent(shitoujuren_bullet);
                    }
                    shitoujuren_Bullet = (attack_01_Bullet_01 as Laya.Sprite).getComponent(shitoujuren_bullet);

                    shitoujuren_Bullet.group = g;//组
                    shitoujuren_Bullet.row = r;//行
                    shitoujuren_Bullet.line = l;//列
                    shitoujuren_Bullet.moveOnOff = true;//运动开关
                    shitoujuren_Bullet.bossName = this.owner.name; //boss名称
                    // 分配组
                    // 最后改变层级关系
                    if (r === 5 && l === 10) {
                        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 0;
                        this.self.parent.zOrder = 1;
                    }
                }
            }
        }
    }

    //普攻2子弹生成类型1
    private attack_Delayed = 130;//延时帧数
    attack_02_Bullet_01(): void {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        // 位置需要修正
        let bulletX = this.self.x + this.self.width * 1 / 3;
        let bulletY = this.self.y + this.self.height * 1 / 3 + 150;
        for (let g = 0; g < 11; g++) {
            //随机一个向上高度
            let distance_up = bulletY - (Math.floor(Math.random() * 50) + 50);
            // 随机一个向下高度
            let distance_drop = Math.floor(Math.random() * 300) + 300 + bulletY;
            let velocity_up = Math.random() * 5 + 10//随机一个向上速度值
            let velocity_drop = Math.random() * 5 + 5//随机一个向下速度值
            let basedTime = Math.random() * 1 + 0.5//随机一个基础时间
            for (let r = 0; r < 4; r++) {
                for (let l = 0; l < 6; l++) {
                    let attack_02_Bullet_01 = this.initBullet();
                    attack_02_Bullet_01.name = 'attack_02_Bullet_01';
                    attack_02_Bullet_01.pos(bulletX, bulletY);

                    //先是否有了这个脚本
                    let shitoujuren_Bullet = (attack_02_Bullet_01 as Laya.Sprite).getComponent(shitoujuren_bullet);
                    if (!shitoujuren_Bullet) {
                        (attack_02_Bullet_01 as Laya.Sprite).addComponent(shitoujuren_bullet);
                    }
                    shitoujuren_Bullet = (attack_02_Bullet_01 as Laya.Sprite).getComponent(shitoujuren_bullet);

                    shitoujuren_Bullet.group = g//组
                    shitoujuren_Bullet.row = r;//行
                    shitoujuren_Bullet.line = l;//列
                    shitoujuren_Bullet.moveOnOff = true;//运动开关
                    shitoujuren_Bullet.bossName = this.owner.name; //boss名称
                    //随机一个向上高度
                    shitoujuren_Bullet.distance_up = distance_up;
                    // 随机一个向下高度
                    shitoujuren_Bullet.distance_drop = distance_drop;
                    shitoujuren_Bullet.velocity_up = velocity_up//随机一个向上速度值
                    shitoujuren_Bullet.velocity_drop = velocity_drop//随机一个向下速度值
                    shitoujuren_Bullet.basedTime = basedTime;
                }
            }
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
        // 延时用于匹配动作
        this.skill_01_Bullet_01();
    }

    //skill子弹类型1
    private skill_01_Delayed_01 = 0;//延时时间
    private tag = 0;//标签，放在名称的前面
    skill_01_Bullet_01(): void {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        for (let r = 0; r < 4; r++) {
            if (this.owner.scene === null) {
                return;
            }
            let skill_01_Row = this.initBullet();
            switch (r) {
                case 0:
                    skill_01_Row.name = 'skill_01_Row_B_00';
                    break;
                case 1:
                    skill_01_Row.name = 'skill_01_Row_B_01';
                    break;
                case 2:
                    skill_01_Row.name = 'skill_01_Row_B_02';
                    break;
                case 3:
                    skill_01_Row.name = 'skill_01_Row_B_03';
                    break;
                default:
                    break;
            }
            // 每列位置要和zOrder对应查找；
            // 位置需要修正
            let bulletX = this.self.x + this.self.width * 1 / 3;
            let bulletY = this.self.y + this.self.height * 1 / 3 + 50;
            // 注意每次位置参考的层次属性都不尽相同
            skill_01_Row.pos(bulletX, bulletY);

            //先是否有了这个脚本
            let shitoujuren_Bullet = (skill_01_Row as Laya.Sprite).getComponent(shitoujuren_bullet);
            if (!shitoujuren_Bullet) {
                (skill_01_Row as Laya.Sprite).addComponent(shitoujuren_bullet);
            }
            shitoujuren_Bullet = (skill_01_Row as Laya.Sprite).getComponent(shitoujuren_bullet);

            shitoujuren_Bullet.row = r;//列
            shitoujuren_Bullet.rowName = 'skill_01_Row_B';
            shitoujuren_Bullet.moveOnOff = true;//运动开关
            shitoujuren_Bullet.bossName = this.owner.name; //boss名称
            shitoujuren_Bullet.bossPosX = bulletX;
            shitoujuren_Bullet.bossPosY = bulletY;

        }
        Laya.timer.frameOnce(140, this, function () {
            this.skill_01_Bullet_02();//类型一结束之后发射类型2
        })
    }


    //skill子弹类型2
    private skill_01_Delayed_02: number = 0;//延时时间
    private launches: number = 0;//发射次数计数器
    skill_01_Bullet_02(): void {
        // 改变子弹父节点的层级，要大于boss
        (this.owner.scene.getChildByName("bulletParent_enemy") as Laya.Sprite).zOrder = 2;
        this.self.parent.zOrder = 1;
        this.launches = 0;
        for (let g = 0; g < 48; g++) {
            Laya.timer.frameOnce(this.skill_01_Delayed_02, this, function () {
                if (this.owner.scene === null) {
                    return;
                }
                for (let r = 0; r < 4; r++) {
                    for (let l = 0; l < 8; l++) {
                        let skill_01_Bullet_02 = this.initBullet();
                        skill_01_Bullet_02.name = 'skill_01_Bullet_02';
                        //预防父节点不存在
                        let bullteParent = skill_01_Bullet_02.parent as Laya.Sprite;
                        if (bullteParent === null) {
                            return;
                        }
                        // 根据特殊子弹定位组顺序
                        switch (r) {
                            case 0:
                                if (bullteParent.getChildByName('skill_01_Row_B_00') === null) {
                                    return;
                                }
                                let x0 = (bullteParent.getChildByName('skill_01_Row_B_00') as Laya.Sprite).x;
                                let y0 = (bullteParent.getChildByName('skill_01_Row_B_00') as Laya.Sprite).y;
                                skill_01_Bullet_02.pos(x0, y0);
                                break;
                            case 1:
                                if (bullteParent.getChildByName('skill_01_Row_B_01') === null) {
                                    return;
                                }
                                let x1 = (bullteParent.getChildByName('skill_01_Row_B_01') as Laya.Sprite).x;
                                let y1 = (bullteParent.getChildByName('skill_01_Row_B_01') as Laya.Sprite).y;
                                skill_01_Bullet_02.pos(x1, y1);
                                break;
                            case 2:
                                if (bullteParent.getChildByName('skill_01_Row_B_02') === null) {
                                    return;
                                }
                                let x2 = (bullteParent.getChildByName('skill_01_Row_B_02') as Laya.Sprite).x;
                                let y2 = (bullteParent.getChildByName('skill_01_Row_B_02') as Laya.Sprite).y;
                                skill_01_Bullet_02.pos(x2, y2);
                                break;
                            case 3:
                                if (bullteParent.getChildByName('skill_01_Row_B_03') === null) {
                                    return;
                                }
                                let x3 = (bullteParent.getChildByName('skill_01_Row_B_03') as Laya.Sprite).x;
                                let y3 = (bullteParent.getChildByName('skill_01_Row_B_03') as Laya.Sprite).y;
                                skill_01_Bullet_02.pos(x3, y3);
                                break;
                            default:
                                break;
                        }

                        //先是否有了这个脚本
                        let shitoujuren_Bullet = (skill_01_Bullet_02 as Laya.Sprite).getComponent(shitoujuren_bullet);
                        if (!shitoujuren_Bullet) {
                            (skill_01_Bullet_02 as Laya.Sprite).addComponent(shitoujuren_bullet);
                        }
                        shitoujuren_Bullet = (skill_01_Bullet_02 as Laya.Sprite).getComponent(shitoujuren_bullet);

                        shitoujuren_Bullet.group = g;//组
                        shitoujuren_Bullet.row = r;//行
                        shitoujuren_Bullet.line = l;//列
                        shitoujuren_Bullet.moveOnOff = true;//运动开关
                        shitoujuren_Bullet.bossName = this.owner.name; //boss名称
                    }

                }
            })
            // 发射频率根据发射次数改变
            // 这个值不够精确，只是相对整个特殊子弹的运动时间
            this.launches += 1;
            if (this.launches < 10) {
                this.skill_01_Delayed_02 += 36;
            } else if (this.launches >= 10 && this.launches < 11) {
                //停顿
                this.skill_01_Delayed_02 += 100;
            } else if (this.launches >= 11 && this.launches < 40) {
                this.skill_01_Delayed_02 += 18;
            } else if (this.launches >= 40 && this.launches < 41) {
                //停顿
                this.skill_01_Delayed_02 += 100;
            } else if (this.launches >= 41 && this.launches < 48) {
                this.skill_01_Delayed_02 += 9;
            }
        }
        this.skill_01_Delayed_02 = 0;
        this.launches = 0;
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
                            if (this.attack_Interval !== 6000) {
                                this.attack_Interval = 6000;
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