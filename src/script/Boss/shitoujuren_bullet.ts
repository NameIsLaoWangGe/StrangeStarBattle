import tools from "../Tools/Tool"
export default class bullet extends Laya.Script {
    // boss_bingqilinzuhe大树人子弹运动轨迹
    private self;
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
    private rowName: string;
    constructor() { super(); }
    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this.initProperty();//初始化,每次进入重新初始化

    }
    // 初始化各种属性
    initProperty(): void {
        //普通攻击1
        this.accelerated_01_01 = 0.06;//加速度
        this.attack_01_timer_01 = 0.1;
        this.attack_01_02_angleChange = 1;

        //普通攻击2
        this.accelerated_02_01 = 0.05;//加速度1
        this.accelerated_02_02 = 0;//加速度2
        this.accelerated_02_03 = 0.1;//加速度3
        this.accelerated_02_04 = 0.1;//加速度4
        this.deceleration_02_01 = 0;//减速度1
        this.attack_02_timer_01 = 0.1;//计时器
        this.velocity_up//上升速度，随机值
        this.velocity_drop//下落速度，随机值
        this.basedTime//基础时间；

        // 技能1_01
        // boss大招子弹类型1
        this.skill_accelerated_01_01 = 0.1;//加速度
        this.skill_Row_timer_01 = 0;//第一阶段计时器,可随机
        this.stepSwitch_01 = true;//第一阶段开关
        this.velocityRandom;//速度随机数
        this.angleChange_01 = 1;//角度变化值

        this.angleRow_00 = 225//角度记录0
        this.angleRow_01 = 315//角度记录1
        this.angleRow_02 = 135//角度记录2
        this.angleRow_03 = 45//角度记录3

        this.radius_00 = 0;//旋转半径
        this.radius_01 = 0;//旋转半径
        this.radius_02 = 0;//旋转半径
        this.radius_03 = 0;//旋转半径

        // 技能1_02
        this.skill_accelerated_01_02 = 0.1;//加速度
    }

    //合集方法
    shiTouJuRen_Move(): void {
        if (this.moveOnOff) {
            // 运动轨迹
            if (this.rowName === 'skill_01_Row_B') {
                this.skill_01_01();
            } else {
                switch (this.self.name) {
                    case 'attack_01_Bullet_01':
                        this.attack_01_01();
                        break;
                    case 'attack_02_Bullet_01':
                        this.attack_02_01();
                        break;
                    //skill_01普通
                    case 'skill_01_Bullet_02':
                        this.skill_01_02();
                        break;
                }
            }
        }
    }

    // attack_01_Bullet_01普通攻击1的第一个子弹类型运动规则
    private accelerated_01_01: number = 0.06;//加速度
    private attack_01_timer_01: number = 0.1;//计时器
    attack_01_01(): void {
        this.attack_01_timer_01 += 0.1;
        let basedSpeed = 18;
        let angle1 = 160;
        let angle2 = 20;
        // 通过时间线控制行为
        if (this.attack_01_timer_01 < 0.5) {
            if (this.group === 0 || this.group === 1 || this.group === 2) {
                this.attack_01_01_move1(angle1, basedSpeed);
            } else if (this.group === 3 || this.group === 4 || this.group === 5) {
                this.attack_01_01_move1(angle2, basedSpeed);
            }
        } else if (this.attack_01_timer_01 >= 0.5 && this.attack_01_timer_01 < 1) {
            if (this.group === 1 || this.group === 2) {
                this.attack_01_01_move1(angle1, basedSpeed);
            } else if (this.group === 4 || this.group === 5) {
                this.attack_01_01_move1(angle2, basedSpeed);
            }
        } else if (this.attack_01_timer_01 >= 1 && this.attack_01_timer_01 < 1.5) {
            if (this.group === 2) {
                this.attack_01_01_move1(angle1, basedSpeed);
            } else if (this.group === 5) {
                this.attack_01_01_move1(angle2, basedSpeed);
            }
        }

        // 分段发射
        if (this.attack_01_timer_01 >= 2) {
            if (this.row === 0) {
                this.attack_01_02();
            }
        }
        if (this.attack_01_timer_01 >= 3 + 0.3) {
            if (this.row === 1) {
                this.attack_01_02();
            }
        }
        if (this.attack_01_timer_01 >= 4 + 0.6) {
            if (this.row === 2) {
                this.attack_01_02();
            }
        }
        if (this.attack_01_timer_01 >= 5 + 0.9) {
            if (this.row === 3) {
                this.attack_01_02();
            }
        }
        if (this.attack_01_timer_01 >= 6 + 1.2) {
            if (this.row === 4) {
                this.attack_01_02();
            }
        }
        if (this.attack_01_timer_01 >= 7 + 1.5) {
            if (this.row === 5) {
                this.attack_01_02();
            }
        }
        this.accelerated_01_01 += 0.01;
    }

    // 第一阶段组移动
    attack_01_01_move1(angle1, basedSpeed) {
        this.self.x += tools.speedXYByAngle(angle1, basedSpeed + this.accelerated_01_01).x;
        this.self.y += tools.speedXYByAngle(angle1, basedSpeed + this.accelerated_01_01).y;
    }

    // 第二阶段发射子弹
    private attack_01_02_angleChange: number = 1;
    attack_01_02() {
        this.attack_01_02_angleChange += 0.1;
        let basedSpeed = 12;
        let basedangle = 22.5 + this.attack_01_02_angleChange
        if (this.group === 0 || this.group === 1 || this.group === 2) {
            switch (this.line) {
                case 0:
                    this.attack_01_01_move1(basedangle, basedSpeed);
                    break;
                case 1:
                    this.attack_01_01_move1(basedangle * 2, basedSpeed);
                    break;
                case 2:
                    this.attack_01_01_move1(basedangle * 3, basedSpeed);
                    break;
                case 3:
                    this.attack_01_01_move1(basedangle + 180, basedSpeed);
                    break;
                case 4:
                    this.attack_01_01_move1(basedangle * 2 + 180, basedSpeed);
                    break;
                case 5:
                    this.attack_01_01_move1(basedangle * 3 + 180, basedSpeed);
                    break;
                default:
                    break;
            }
        } else if (this.group === 3 || this.group === 4 || this.group === 5) {
            switch (this.line) {
                case 0:
                    this.attack_01_01_move1(-basedangle, basedSpeed);
                    break;
                case 1:
                    this.attack_01_01_move1(-(basedangle * 2), basedSpeed);
                    break;
                case 2:
                    this.attack_01_01_move1(-(basedangle * 3), basedSpeed);
                    break;
                case 3:
                    this.attack_01_01_move1(-(basedangle + 180), basedSpeed);
                    break;
                case 4:
                    this.attack_01_01_move1(-(basedangle * 2 + 180), basedSpeed);
                    break;
                case 5:
                    this.attack_01_01_move1(-(basedangle * 3 + 180), basedSpeed);
                    break;
                default:
                    break;
            }

        }
    }

    // attack_02_Bullet_01普通攻击1的第一个子弹类型运动规则
    private accelerated_02_01: number = 0.05;//加速度1
    private accelerated_02_02: number = 0;//加速度2
    private accelerated_02_03: number = 0.1;//加速度3
    private accelerated_02_04: number = 0.1;//加速度4
    private deceleration_02_01: number = 0;//减速度1
    private attack_02_timer_01: number = 0.1;//计时器
    private velocity_up: number//上升速度，随机值
    private velocity_drop: number//下落速度，随机值
    private basedTime: number//基础时间；
    attack_02_01(): void {
        this.attack_02_timer_01 += 0.1;
        // 通过时间线控制行为
        if (this.attack_02_timer_01 < 0.8 + this.basedTime) {//向上加速
            this.accelerated_02_01 += 0.1;
            let angleGroup = 195;
            this.attack_02_01_move1(angleGroup + this.group * 15, this.velocity_up + this.accelerated_02_01);
        } else if (this.attack_02_timer_01 >= 0.8 + this.basedTime && this.attack_02_timer_01 < 1 + this.basedTime) {//向上减速
            this.deceleration_02_01 -= 0.3;
            let angleGroup = 200;
            this.attack_02_01_move1(angleGroup + this.group * 18, this.velocity_up - this.deceleration_02_01);

        } else if (this.attack_02_timer_01 >= 1 + this.basedTime && this.attack_02_timer_01 < 4 + this.basedTime) {//下落
            this.accelerated_02_02 += 0.4;
            this.self.y += (this.velocity_drop + this.accelerated_02_02);

        } else if (this.attack_02_timer_01 >= 4 + this.basedTime && this.attack_02_timer_01 < 7 + this.basedTime) {//行爆炸
            let angleRow = this.row * 90 + 45;
            this.accelerated_02_03 += 0.1;
            this.self.x += tools.speedXYByAngle(angleRow, 10 + this.accelerated_02_03).x;
            this.self.y += tools.speedXYByAngle(angleRow, 10 + this.accelerated_02_03).y;

        } else if (this.attack_02_timer_01 >= 7 + this.basedTime) {//列爆炸
            this.accelerated_02_04 += 0.05;
            let angleLine = this.line * 60 + 30;
            this.self.x += tools.speedXYByAngle(angleLine, this.velocity_up - 3 + this.accelerated_02_04).x;
            this.self.y += tools.speedXYByAngle(angleLine, this.velocity_up - 3 + this.accelerated_02_04).y;
        }
    }

    // 第一阶段组移动
    attack_02_01_move1(angle, basedSpeed) {
        this.self.x += tools.speedXYByAngle(angle, basedSpeed).x;
        this.self.y += tools.speedXYByAngle(angle, basedSpeed).y;
    }

    // boss大招子弹类型1
    private skill_accelerated_01_01: number = 0.1;//加速度
    private skill_Row_timer_01: number = 0;//第一阶段计时器,可随机
    private stepSwitch_01: boolean = true;//第一阶段开关
    private velocityRandom;//速度随机数
    private angleChange_01: number = 1;//角度变化值


    private angleRow_00: number = 225//角度记录0
    private angleRow_01: number = 315//角度记录1
    private angleRow_02: number = 135//角度记录2
    private angleRow_03: number = 45//角度记录3

    private radius_00: number = 0;//旋转半径
    private radius_01: number = 0;//旋转半径
    private radius_02: number = 0;//旋转半径
    private radius_03: number = 0;//旋转半径

    // 特殊子弹的移动
    skill_01_01(): void {
        // boss位置点初始化
        let bossParent = (this.owner.scene as Laya.Sprite).getChildByName('EnemySpite');
        this.boss = bossParent.getChildByName(this.bossName);
        if (this.boss === null) {
            return;
        }
        let bulletX = this.boss.x + this.boss.width * 1 / 3;
        let bulletY = this.boss.y + this.boss.height * 1 / 3 + 50;
        this.bossPoint = new Laya.Point(bulletX, bulletY);

        // 通过时间控制行为
        let basedSpeed = 10;
        let angle = 45;
        if (this.skill_Row_timer_01 >= 0 && this.skill_Row_timer_01 < 3) {
            if (this.row === 0) {
                this.radius_00 += 5;
                this.self.x = tools.getRoundPos(this.angleRow_00, this.radius_00, this.bossPoint).x;
                this.self.y = tools.getRoundPos(this.angleRow_00, this.radius_00, this.bossPoint).y;
            }
        } else if (this.skill_Row_timer_01 >= 3 && this.skill_Row_timer_01 < 6) {
            if (this.row === 1) {
                this.radius_01 += 5;
                this.self.x = tools.getRoundPos(this.angleRow_01, this.radius_01, this.bossPoint).x;
                this.self.y = tools.getRoundPos(this.angleRow_01, this.radius_01, this.bossPoint).y;
            }
        } else if (this.skill_Row_timer_01 >= 6 && this.skill_Row_timer_01 < 9) {
            if (this.row === 2) {
                this.radius_02 += 5;
                this.self.x = tools.getRoundPos(this.angleRow_02, this.radius_02, this.bossPoint).x;
                this.self.y = tools.getRoundPos(this.angleRow_02, this.radius_02, this.bossPoint).y
            }
        } else if (this.skill_Row_timer_01 >= 9 && this.skill_Row_timer_01 < 12) {
            if (this.row === 3) {
                this.radius_03 += 5;
                this.self.x = tools.getRoundPos(this.angleRow_03, this.radius_03, this.bossPoint).x;
                this.self.y = tools.getRoundPos(this.angleRow_03, this.radius_03, this.bossPoint).y
            }
            this.angleRow_03 = angle;
        } else if (this.skill_Row_timer_01 >= 12 && this.angleChange_01 < 360) {//正向旋转
            this.skill_01_01_Group_Move();
            this.angleRow_00 += 1;
            this.angleRow_01 += 1;
            this.angleRow_02 += 1;
            this.angleRow_03 += 1;
            this.angleChange_01 += 1;
        } else if (this.angleChange_01 >= 360 && this.angleChange_01 < 720) {//反向旋转
            this.skill_01_01_Group_Move();

            this.radius_00 += 0.08;
            this.radius_01 += 0.08;
            this.radius_02 += 0.08;
            this.radius_03 += 0.08;

            this.angleRow_00 -= 1;
            this.angleRow_01 -= 1;
            this.angleRow_02 -= 1;
            this.angleRow_03 -= 1;
            this.angleChange_01 += 0.5;
        } else if (this.angleChange_01 >= 720 && this.angleChange_01 < 900) {//半径扩大缓冲
            this.angleChange_01 += 1;
            this.radius_00 += 0.6;
            this.radius_01 += 0.6;
            this.radius_02 += 0.6;
            this.radius_03 += 0.6;
            this.skill_01_01_Group_Move();
        } else if (this.angleChange_01 >= 900 && this.angleChange_01 < 950) {//发射散开
            this.radius_00 += 20;
            this.radius_01 += 20;
            this.radius_02 += 20;
            this.radius_03 += 20;
            this.skill_01_01_Group_Move();
            this.angleChange_01 += 1;
        } else if (this.angleChange_01 >= 900) {
            this.angleChange_01 += 1;
            this.self.removeSelf();
        }
        this.skill_Row_timer_01 += 0.1;
    }

    //根据组进行运动规则
    skill_01_01_Group_Move() {
        switch (this.row) {
            case 0:
                this.self.x = tools.getRoundPos(this.angleRow_00, this.radius_00, this.bossPoint).x;
                this.self.y = tools.getRoundPos(this.angleRow_00, this.radius_00, this.bossPoint).y;
                break;
            case 1:
                this.self.x = tools.getRoundPos(this.angleRow_01, this.radius_01, this.bossPoint).x;
                this.self.y = tools.getRoundPos(this.angleRow_01, this.radius_01, this.bossPoint).y;
                break;
            case 2:
                this.self.x = tools.getRoundPos(this.angleRow_02, this.radius_02, this.bossPoint).x;
                this.self.y = tools.getRoundPos(this.angleRow_02, this.radius_02, this.bossPoint).y;
                break;
            case 3:
                this.self.x = tools.getRoundPos(this.angleRow_03, this.radius_03, this.bossPoint).x;
                this.self.y = tools.getRoundPos(this.angleRow_03, this.radius_03, this.bossPoint).y;
                break;
            default:
                break;
        }
    }

    private skill_accelerated_01_02: number = 0.1;//加速度
    private angleChange_02: number = 1;//角度变化值
    skill_01_02(): void {
        let angleRow = this.line * 45;
        let basedSpeed = 4;
        this.self.x += tools.speedXYByAngle(angleRow, basedSpeed + this.skill_accelerated_01_02).x;
        this.self.y += tools.speedXYByAngle(angleRow, basedSpeed + this.skill_accelerated_01_02).y;
        this.skill_accelerated_01_02 += 0.1;
    }

    onDisable(): void {
        // Laya.Pool.recover("bulltePrefab", this.owner);
    }

    onUpdate(): void {
    }
}