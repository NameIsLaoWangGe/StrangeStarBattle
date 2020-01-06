import tools from "../Tools/Tool"
import PlayingControl from "../playing/PlayingSceneControl";
export default class bullet extends Laya.Script {
    /**自己*/
    private self;
    /**自身当前位置*/
    private selfFirstPoint;
    /**boss的名称*/
    private bossName: string;
    /**分组标记,高于line和row*/
    private group: number;
    /**行标记*/
    private row: number;
    /**行标记*/
    private line: number;
    /**移动开关，需要在怪物脚本内打开*/
    private moveOnOff: boolean = false;
    /**当前怪物的位置X*/
    private bossPosX: number;
    /**当前怪物的位置Y*/
    private bossPosY: number;
    /**boss位置点*/
    private bossPoint;
    /**boss本身*/
    private boss;
    /**特殊名称标记*/
    private groupName;
    /**加速度，每种攻击的加速度不一样*/
    private accelerated: number;
    /**初始角度*/
    private firstAngle: number;
    /**初始速度*/
    private firsSpeed: number;
    /**时间线，用于分段执行子弹行为*/
    private timer: number;
    /**一个时间节点，在某个特定时机发生的移动*/
    private timeNode_01: boolean;
    /**停留时间，控制每颗子弹的第一次停留时间*/
    private standingTime: number;

    constructor() { super(); }
    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this.self['MediumEnemy_bullet'] = this;
        this.initProperty();
    }

    /**初始化一些属性*/
    initProperty(): void {
        this.accelerated = 0.06;
        this.timer = 0;
    }

    /**怪物子弹移动合集*/
    bullet_Move(): void {
        if (this.moveOnOff && !PlayingControl.instance.isGamePause) {
            // 运动轨迹
            switch (this.self.name) {
                //zhongji_hetun 01_01
                case 'zhongji_hetun_01_01':
                    this.zhongji_hetun_01_01();
                    break;

                //zhongji_xieizi 01_01
                case 'zhongji_xiezi_01_01':
                    this.zhongji_xiezi_01_01();
                    break;

                //zhongji_luobo_01_01
                case 'zhongji_luobo_01_01':
                    this.zhongji_luobo_01_01();
                    break;

                //zhongji_luobo_01_01
                case 'zhongji_feihou_01_01':
                    this.zhongji_feihou_01_01();
                    break;

                //zhongji_bingqilin
                case 'zhongji_bingqilin_01_01':
                    this.zhongji_bingqilin_01_01();
                    break;

                //zhongji_binghua
                case 'zhongji_binghua_01_01':
                    this.zhongji_binghua_01_01();
                    break;

                //zhongji_bingqilin
                case 'zhongji_haiyao_01_01':
                    this.zhongji_haiyao_01_01();
                    break;

                //zhongji_binghua
                case 'zhongji_haisha_01_01':
                    this.zhongji_haisha_01_01();
                    break;

                //zhongji_huogui
                case 'zhongji_huogui_01_01':
                    this.zhongji_huogui_01_01();
                    break;

                //zhongji_huomogu
                case 'zhongji_huomogu_01_01':
                    this.zhongji_huomogu_01_01();
                    break;

                default:
                    break;
            }
        }
        this.accelerated += 0.05;
        this.timer += 0.1;
    }

    /**
     * 通用子弹移动，按单一角度移动
     * @param angle 角度
     *  @param basedSpeed 基础速度
    */
    commonSpeedXYByAngle(angle, basedSpeed) {
        this.self.x += tools.speedXYByAngle(angle, basedSpeed + this.accelerated).x;
        this.self.y += tools.speedXYByAngle(angle, basedSpeed + this.accelerated).y;
    }

    /**中级河豚1-01*/
    zhongji_hetun_01_01(): void {
        let angle = this.firstAngle;
        let basedSpeed;
        if (this.line % 2 !== 0) {
            basedSpeed = 5;
        } else {
            basedSpeed = 3;
        }
        this.commonSpeedXYByAngle(angle, basedSpeed);
    }

    /**中级蝎子1-01*/
    zhongji_xiezi_01_01(): void {
        let angle = this.firstAngle;
        let basedSpeed;
        if (this.line === 1) {
            basedSpeed = 6.3;
        } else {
            basedSpeed = 6;
        }
        this.commonSpeedXYByAngle(angle, basedSpeed);
    }

    /**中级萝卜1-01*/
    zhongji_luobo_01_01(): void {
        let angle = this.firstAngle;
        let basedSpeed;
        let number = 1;
        if (this.timer >= 0 && this.timer < number) {
            if (this.group === 0) {
                basedSpeed = 10;
            } else if (this.group === 1) {
                basedSpeed = 7;
            } else {
                basedSpeed = 4;
            }
            this.commonSpeedXYByAngle(angle, basedSpeed);
        } else if (this.timer >= number && this.timer <= this.standingTime + number) {
            this.accelerated = 0.06;
            return;
        } else if (this.timer >= this.standingTime + number) {
            basedSpeed = 7 - this.line * 0.4;
            this.commonSpeedXYByAngle(angle, basedSpeed);
        }
    }

    /**中级飞猴1-01*/
    zhongji_feihou_01_01(): void {
        let angle = 90;
        let basedSpeed = 5;
        if (this.line === 0) {
            basedSpeed = 7;
        } else if (this.line === 1 || this.line === 2) {
            basedSpeed = 6;
        } else if (this.line === 3 || this.line === 4 || this.line === 5) {
            basedSpeed = 5;
        }
        this.commonSpeedXYByAngle(angle, basedSpeed);
    }

    /**中级冰花1-01*/
    zhongji_binghua_01_01(): void {
        let angle;
        let basedSpeed = 5;
        if (this.timer > 0 && this.timer > 5) {

        }
        if (this.line === 0) {
            angle = this.firstAngle + 10;
        } else {
            angle = this.firstAngle - 10;
        }
        this.commonSpeedXYByAngle(angle, basedSpeed);
    }

    /**中级冰淇淋1-01*/
    zhongji_bingqilin_01_01(): void {
        let angle = this.firstAngle;
        let basedSpeed;
        if (this.timer >= 0 && this.timer < 1) {
            basedSpeed = 5;
            this.commonSpeedXYByAngle(angle, basedSpeed - this.line * 0.3);
        } else if (this.timer >= 1 && this.timer < 2) {
            return;
        } else if (this.timer >= 2) {
            basedSpeed = 5;
            this.commonSpeedXYByAngle(angle, basedSpeed - this.line * 0.4);
        }
    }

    /**中级海妖1-01*/
    zhongji_haiyao_01_01(): void {
        let angle = this.firstAngle;
        let basedSpeed;
        if (this.group === 0) {
            if (this.line === 0 || this.line === 4) {
                basedSpeed = 3.6;
            } else if (this.line === 2) {
                basedSpeed = 4;
            } else if (this.line === 1 || this.line === 3) {
                basedSpeed = 3.9;
            }
        } else {
            if (this.line === 0 || this.line === 3) {
                basedSpeed = 3.5;
            } else if (this.line === 1 || this.line === 2) {
                basedSpeed = 3.8;
            }
        }
        this.commonSpeedXYByAngle(angle, basedSpeed);

    }

    /**中级海鲨1-01*/
    zhongji_haisha_01_01(): void {
        let angle = this.firstAngle;
        let basedSpeed;
        let number = 0.7;
        if (this.timer >= 0 && this.timer < number) {
            basedSpeed = 14 - this.line * 0.3;
            this.commonSpeedXYByAngle(angle, basedSpeed);
        } else if (this.timer >= number && this.timer <= this.standingTime + number) {
            this.accelerated = 0.06;
            return;
        } else if (this.timer >= this.standingTime + number) {
            basedSpeed = 7;
            this.commonSpeedXYByAngle(angle, basedSpeed);
        }
    }

    /**中级火鬼1-01*/
    zhongji_huogui_01_01(): void {
        let angle = this.firstAngle;
        let basedSpeed = this.firsSpeed;
        this.commonSpeedXYByAngle(angle, basedSpeed);
    }

    /**中级火蘑菇1-01*/
    zhongji_huomogu_01_01(): void {
        let angle = this.firstAngle;
        let basedSpeed;
        if (this.timer >= 0 && this.timer < 1.5) {
            basedSpeed = 10;
        } else {
            basedSpeed = 2.5;
        }
        this.commonSpeedXYByAngle(angle, basedSpeed);
    }


    onDisable(): void {

    }

    onUpdate(): void {
    }
}