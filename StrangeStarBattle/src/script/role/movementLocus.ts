import role from "./role"
import Tools from "../Tools/Tool";
import Data from "../Data/DataTables"
import Data2 from "../Data/JsonEnum"
import EnemyObject from "../role/EnemyObject"
import DataType = Data2.DataType;
import secondSkill = Data2.secondSkill;
import FixedDataTables = Data.FixedDataTables;
import random = Tools.random;
export default class movementLocus extends Laya.Script {
    /** @prop {name:boolType, tips:"布尔类型示例", type:Bool, default:true}*/
    public boolType: boolean = true;
    private propertyObj: EnemyObject;

    constructor() { super(); }
    private _role: Laya.Sprite
    private _number: number
    private script_enemy: Laya.Script;
    private self: Laya.Sprite;
    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this._role = role.instance.owner as Laya.Sprite;//主角
        this.propertyObj = this.owner["vars_"].propertyObj;
        this.monsterTypeJudgment();
        this.script_enemy = this.owner.getComponent(Laya.Script);
    }

    onDisable(): void {
        this.clearTimeline();
    }

    //整体判断
    monsterTypeJudgment(): void {
        let way = this.propertyObj.way;
        switch (way) {
            case 1:
                this.snakeLikeMobile();
                break;
            case 3:
                this.wirelessTracking();
                break;
            case 2:
                this.fixedCrash();

                break;


            default:
                break;
        }
    }

    //定点撞击
    fixedCrash(): void {
        let owner = this.owner as Laya.Sprite;//自己节点
        Laya.Tween.to(owner, { x: owner.x, y: Laya.stage.height / 4 }, 2000, Laya.Ease.elasticInOut, Laya.Handler.create(this, function () {
            Laya.Tween.to(owner, { x: this._role.x, y: this._role.y }, 500, Laya.Ease.sineIn, Laya.Handler.create(this, function () {
                Laya.Tween.to(owner, { x: owner.x, y: Laya.stage.height }, 1000, Laya.Ease.sineIn, Laya.Handler.create(this, function () {
                }, []), 0);
            }, []), 0);
        }, []), 0);
    }

    //蛇型走位
    snakeLikeMobile(): void {
        let owner = this.owner as Laya.Sprite;//自己节点
        this._number = 1;
        this._number += 1 / 4;
        Laya.Tween.to(owner, { x: Laya.stage.width - this.propertyObj.mark_w, y: Laya.stage.height / 4 }, 1000, Laya.Ease.linearIn, Laya.Handler.create(this, function () {

            Laya.Tween.to(owner, { x: 0, y: Laya.stage.height * 2 / 4 }, 1000, Laya.Ease.linearIn, Laya.Handler.create(this, function () {

                Laya.Tween.to(owner, { x: Laya.stage.width - this.propertyObj.mark_w, y: Laya.stage.height * 3 / 4 }, 1000, Laya.Ease.linearIn, Laya.Handler.create(this, function () {

                    Laya.Tween.to(owner, { x: 0, y: Laya.stage.height }, 1000, Laya.Ease.linearIn, Laya.Handler.create(this, function () {

                        Laya.Tween.to(owner, { x: Laya.stage.width - this.propertyObj.mark_w, y: Laya.stage.height * 5 / 4 }, 1000, Laya.Ease.linearIn, Laya.Handler.create(this, function () {
                        }, []), 0);

                    }, []), 0);

                }, []), 0);

            }, []), 0);

        }, []), 0);
    }

    // 无限跟踪
    wirelessTracking(): void {
        let owner = this.owner as Laya.Sprite;//自己节点
        let point = new Laya.Point(this._role.x - owner.x, this._role.y - owner.y);//算出长宽差值
        point.normalize();//归一化成比例便于控制缩放
        //放大这个比例
        Laya.Tween.to(owner, { x: owner.x + point.x * 3, y: owner.y + point.y * 3 }, 10, Laya.Ease.linearIn, Laya.Handler.create(this, function () {
            this.wirelessTracking();
        }, []), 0);
    }


    //综合清理
    clearTimeline() {
        Laya.Tween.clearAll(this.owner);
        Laya.timer.clearAll(this);
    }

    onUpdate(): void {

        if (this.propertyObj.e_type !== 2 && !this.propertyObj.way) {
            if (this.script_enemy["_moveOff"]) {
                //不超过边缘
                if (this.self.x >= (Laya.stage.width - this.propertyObj.mark_w)) {
                    this.script_enemy["_steering"] = 'left';
                    this.script_enemy["setSpeedRecover"]();
                } else if (this.self.x < 0) {
                    this.script_enemy["_steering"] = 'right';
                    this.script_enemy["setSpeedRecover"]();
                }
            }
        }


        // const self: Laya.Sprite = this.owner as Laya.Sprite;
        if (this.self["vars_"].skillType && this.self["vars_"].skillType === secondSkill.flottant) {
            if (this.self.y < 0) {
                this.self.getComponent(Laya.RigidBody).setVelocity({ x: 0, y: 0 });
                return;
            }
        }
        if (this.self.y >= (Laya.stage.height + this.propertyObj.mark_h + 10)) {
            this.clearTimeline();
            //到底部后再次回到屏幕的上方
            this.self.pos(random(0, Laya.stage.width - this.propertyObj.mark_w - 5), random(-30 - this.propertyObj.mark_h, -5 - this.propertyObj.mark_h));
            this.script_enemy["setSpeedRecover"]();
            this.monsterTypeJudgment();
        }
    }
}