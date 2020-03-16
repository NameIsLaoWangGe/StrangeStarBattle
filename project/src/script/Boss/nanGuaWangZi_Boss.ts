import nanGuaWangZi_bullet from "./nanGuaWangZi_bullet";
import BulletCommon from "../role/BulletCommon"
import Data2 from "../Data/JsonEnum"
import DataType = Data2.DataType;
import EnemyObject from "../role/EnemyObject";
import PlayingSceneControl from "../playing/PlayingSceneControl";
import Tool, { tools } from "../Tools/Tool"
import Enemy from "../playing/Enemy";
export default class Boss_jinsenangua extends Laya.Script {
    constructor() {
        super();
        // boss_nanguawangzi南瓜王子
    }
    private self;//自己
    private moveDirection: string;//方向记录
    private moveOnOff: Boolean = false;//移动开关
    private skeleton: Laya.Skeleton;//boss节点下的boss动画
    private bullteParent;//子弹父节点
    private attack_01Interval = 3000;//时间间隔

    private firstAttack: boolean = true;
    private firstAttack_Interval = 500//第一次的时间间隔

    private attack_01Time;//记录当前普通攻击1发动后的时间，用于对比时间间隔
    private attackCounter: number = 0;//攻击次数计数器；

    onEnable(): void {
        this.initProperty();
        this.creatBossAni();
    }

    initProperty(): void {
        this.attack_01Time = Date.now();
        this.self = this.owner as Laya.Sprite;
        this.moveOnOff = false;//移动开关
        this.attack_01Interval = 3000;//时间间隔
        this.firstAttack = true;
        this.firstAttack_Interval = 500//第一次的时间间隔
        this.attackCounter = 0;//攻击次数计数器；
        this.self.name = "nanguawangzi";
        this.self.markName = "nanguawangzi";
    }


    //创建boss
    private bossTemplet: Laya.Templet;
    creatBossAni(): void {
        const nick = (this.owner["vars_"].propertyObj as EnemyObject).nick;
        this.skeleton = this.owner.getChildByName("Boss_nanguawangzi") as Laya.Skeleton;
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

        this.skeleton.pos(200, 150);
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
            if (this.self.x + this.self.width / 2 < Laya.stage.width * 1 / 4 + 80) {
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

    /**子弹脚本属性赋值
    * @param bullet 子弹本身
 * @param syncRotation 子弹本身的角度是和移动方向相同
    * @param row 子弹属于那一排
    * @param line 子弹属于那一列
    * @param dirRotation 初始移动方向
    * @param firstAngle 初始速度
   */
    bulletProperties(bullet, syncRotation, row, line, dirRotation, firstAngle): void {
        //添加运动脚本，并且给予一些属性
        if (!bullet['nanGuaWangZi_bullet']) {
            bullet.addComponent(nanGuaWangZi_bullet);
        }
        let MediumEnemy_Bullet = bullet['nanGuaWangZi_bullet'];
        MediumEnemy_Bullet.row = row;
        MediumEnemy_Bullet.line = line;
        MediumEnemy_Bullet.dirRotation = dirRotation;
        MediumEnemy_Bullet.firstAngle = firstAngle;
        MediumEnemy_Bullet.bossName = this.owner.name;
        if (syncRotation === 'sync') {
            bullet.rotation = firstAngle - 90;
        } else {
            bullet.rotation = 0;
        }

    }

    //普攻1子弹类型1
    attack_01_Bullet_01(): void {
        for (let l = 0; l < 15; l++) {
            let bullet_attack01 = this.initBullet('enemyBullet/boss_nanguawangzi_b_01.png');
            bullet_attack01.name = 'attack_01_Bullet_01';
            bullet_attack01.pos(this.self.x + this.self.width * 1 / 3, this.self.y + this.self.height * 1 / 3);
            //添加运动脚本，并且给予一些属性
            let dirRotation = Math.floor(Math.random() * 2) === 1 ? 'left' : 'right';
            this.bulletProperties(bullet_attack01, 'no', null, l, dirRotation, null);
        }
    }

    //普攻1子弹生成类型2
    private attack_Delayed = 0;//延时帧数
    attack_02_Bullet_01(): void {
        for (let r = 0; r < 6; r++) {
            for (let l = 0; l < 5; l++) {
                Laya.timer.frameOnce(this.attack_Delayed, this, function () {
                    //如果场景被清掉，就不会在执行
                    if (this.owner.scene === null) {
                        return;
                    }
                    let bullet_attack01 = this.initBullet('enemyBullet/boss_nanguawangzi_b_02.png');
                    bullet_attack01.name = 'attack_02_Bullet_01';
                    // 位置需要修正
                    let bulletX = this.self.x + this.self.width * 1 / 3;
                    let bulletY = this.self.y + this.self.height * 1 / 3;
                    switch (r) {
                        case 0:
                            bullet_attack01.pos(bulletX - 200, bulletY);
                            break;
                        case 1:
                            bullet_attack01.pos(bulletX - 175, bulletY);
                            break;
                        case 2:
                            bullet_attack01.pos(bulletX - 0, bulletY);
                            break;
                        case 3:
                            bullet_attack01.pos(bulletX - 0, bulletY);
                            break;
                        case 4:
                            bullet_attack01.pos(bulletX + 175, bulletY);
                            break;
                        case 5:
                            bullet_attack01.pos(bulletX + 200, bulletY);
                            break;
                        default:
                            break;
                    }
                    //添加运动脚本，并且给予一些属性
                    this.bulletProperties(bullet_attack01, 'no', r, l, null, null);
                })
                this.attack_Delayed += 10;
            }
            this.attack_Delayed = 0;//每一列循环结束之后延时重置；
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
    }

    //skill子弹类型1
    private skill_Delayed = 0;//延时时间
    skill_01_Bullet_01(): void {
        for (let r = 0; r < 10; r++) {
            Laya.timer.frameOnce(this.skill_Delayed, this, function () {
                //如果场景被清掉，就不会在执行
                if (this.owner.scene === null) {
                    return;
                }
                for (let l = 0; l < 20; l++) {
                    let bullet_attack01 = this.initBullet('enemyBullet/boss_nanguawangzi_b_03.png');
                    bullet_attack01.name = 'skill_01_Bullet_01';
                    // 位置需要修正；
                    let bulletX = this.self.x + this.self.width * 1 / 3;
                    let bulletY = this.self.y + this.self.height * 1 / 3;
                    bullet_attack01.pos(bulletX, bulletY);

                    //添加运动脚本，并且给予一些属性
                    let firstAngle;
                    if (r % 2 !== 0) {
                        firstAngle = l * 18;
                    } else {
                        firstAngle = l * 18 + 9;
                    }
                    this.bulletProperties(bullet_attack01, 'sync', r, l, null, firstAngle);
                }
            })
            this.skill_Delayed += 20;
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
                            this.attack_01Interval = 5000;
                            this.skill();//大招1
                        } else {
                            if (this.attack_01Interval !== 3000) {
                                this.attack_01Interval = 3000;
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

