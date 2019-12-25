import MainWeaponData from "../manage/MainWeaponData"
import BulletCommon from "../role/BulletCommon"
import Data from "../Data/JsonEnum"
import PlayingSceneControl from "../playing/PlayingSceneControl"
import tools from "../Tools/Tool"
import BulletMain from "../Bullet/BulletMain";
export default class Bullet_face extends Laya.Script {
    private self: Laya.Sprite;
    // private propertyObj: BulletCommon;
    constructor() {
        super();
    }
    private plane: Laya.Image;
    private propertyObj: BulletMain;
    private bulletSpeed: any;
    private canMove: boolean;
    //导弹的尾焰
    private tail: Laya.Sprite;
    onEnable() {
        this.self = this.owner as Laya.Sprite;
        this.plane = PlayingSceneControl.instance.mainPlane;
        this.propertyObj = this.self["property"];
        this.bulletSpeed = this.propertyObj.bulletSpeed;
        this.self.scaleX = 1;
        this.self.scaleY = 1;
        this.tail = this.self.getChildByName("tail") as Laya.Sprite;
        this.tail.visible = false;
        if (this.propertyObj.BuffType && this.propertyObj.BuffType === 4) {
            this.canMove = false;
            this.calBulletShotSpeed();
            Laya.timer.once(400, this, this.bulletShotType4);
        } else if (this.propertyObj.BuffType && this.propertyObj.BuffType === 3) {
            if (this.propertyObj.fireBuffType === 2) {
                //火力增强的导弹
                this.canMove = false;
                this.self.scaleX = 0.4;
                this.self.scaleY = 0.4;
                this.tail.visible = true;
                this.tail.x = (this.self.getChildByName("img_pic") as Laya.Image).x + 1 - 7;
                this.tail.scaleY = 0;
                this.bulletShotFire();
            } else if (!this.propertyObj.fireBuffType) {
                this.self.rotation = this.propertyObj.angle - 90 + 180;
                this.canMove = true;
            } else {
                this.canMove = true;
            }
        } else {
            this.self.rotation = this.propertyObj.angle - 90 + 180;
            this.canMove = true;
        }
    }
    calBulletShotSpeed() {
        const newPoint: Laya.Point = new Laya.Point(this.plane.x, this.plane.y);
        PlayingSceneControl.instance.roleObj.localToGlobal(newPoint);
        // const pointObj = new Laya.Point(this.self.x - this.plane.x, this.self.y - this.plane.y);
        const pointObj = new Laya.Point(this.self.x - newPoint.x, this.self.y - newPoint.y);
        const mainSpeed = MainWeaponData.getInstance().bulletSpeed;
        pointObj.normalize();
        this.bulletSpeed.x = mainSpeed * pointObj.x;
        this.bulletSpeed.y = mainSpeed * pointObj.y;
    }
    /**
     * 火力增强的导弹技能
     */
    private isLeft: boolean;
    private isMissionIn: boolean;
    bulletShotFire() {
        this.isLeft = this.propertyObj.angle < 0;
        this.self.rotation = this.propertyObj.angle;
        if (this.propertyObj.angle === 30 || this.propertyObj.angle === -30) {
            this.isMissionIn = true;
        } else {
            this.isMissionIn = false;
        }
        if (!Laya.Browser.window.daodan) {
            Laya.Browser.window.daodan = [];
        }
        Laya.Browser.window.daodan.push(this.self);
    }
    bulletShotType4(): void {
        // this.calBulletShotSpeed();
        Laya.timer.clear(this, this.bulletShotType4);
        this.canMove = true;
        Laya.timer.once(3100, this, () => {
            this.self.removeSelf();
        });
    }
    private nextFrameCheckTrigger: boolean;
    onTriggerEnter(other: any, self: any): void {
        this.nextFrameCheckTrigger = true;
        const otherSprite = other.owner;
        const propertyObj = otherSprite.vars_ && otherSprite.vars_.propertyObj;

        if (!otherSprite.visible) {
            return;
        }
        if (!(otherSprite as Laya.Sprite).parent) {
            return;
        }
        if (propertyObj && propertyObj.prefabType && propertyObj.prefabType === Data.prefabType.boss && this.self && this.self["vars_"] && this.self["vars_"].propertyObj && this.self["vars_"].propertyObj.prefabType === Data.prefabType.bullletBoss) {
            return;
        }
        if (this.self["vars_"] && this.self["vars_"].disAbleRemove) {
            return;
        }
        if (this.self["vars_"].type && this.self["vars_"].type === 4) {
            // console.log("");
        }

        this.owner.removeSelf();

    }
    onUpdate(): void {
        if (PlayingSceneControl.instance.isGamePause) {
            return;
        }
        if (!this.self.visible) {
            return;
        }
        if (!this.canMove && this.propertyObj.BuffType === 4) {
            // this.propertyObj.markX + PlayingSceneControl.instance.roleObj.x = this.self.x;
            this.self.x = this.propertyObj.markX + PlayingSceneControl.instance.roleObj.x;
            this.self.y = this.propertyObj.markY + PlayingSceneControl.instance.roleObj.y;
        }

        if (this.canMove) {
            if (this.propertyObj.BuffType !== 4) {
                if ((this.self.x + this.propertyObj.w) < 0 || this.self.x > Laya.stage.width || (this.self.y + this.self.height / 2) < 0) {
                    this.self.removeSelf();
                    return;
                }
            }
            this.setBulletMove();
        }
        if (!this.canMove && this.propertyObj.BuffType === 3 && this.propertyObj.fireBuffType === 2) {
            const scaleValue = (this.self.scaleX + 0.1) > 1 ? 1 : (this.self.scaleX + 0.1);
            this.self.scaleX = scaleValue;
            const tailScaleValue = (this.tail.scaleY + 0.15) > 1 ? 1 : (this.tail.scaleY + 0.15);
            this.tail.scaleY = tailScaleValue;
            if (this.isLeft) {
                if (this.isMissionIn) {
                    this.self.x -= 10;
                } else {
                    this.self.x -= 7;
                }

                this.self.y -= 3 + 3;
                this.self.rotation += 2 + 2;
                if (this.self.rotation >= 0) {
                    this.canMove = true;
                    this.self.rotation = 0;
                    this.self.scaleX = 1;
                    this.self.scaleY = 1;
                    this.tail.scaleY = 1;
                }
            } else {
                if (this.isMissionIn) {
                    this.self.x += 10;

                } else {
                    this.self.x += 7;

                }
                this.self.y -= 3 + 3;
                this.self.rotation -= 2 + 2;
                if (this.self.rotation <= 0) {
                    this.canMove = true;
                    this.self.rotation = 0;
                    this.self.scaleX = 1;
                    this.self.scaleY = 1;
                    this.tail.scaleY = 1;
                }
            }
        }
    }
    setBulletMove() {
        if (this.canMove) {
            this.self.x += PlayingSceneControl.instance.bSpeedRateByBuff2 * this.bulletSpeed.x;
            this.self.y += PlayingSceneControl.instance.bSpeedRateByBuff2 * this.bulletSpeed.y;
        }
    }
    onDisable(): void {
        this.self.visible = false;
        this.propertyObj = null;
        Laya.Pool.recover(this.owner.name, this.owner);
    }
}