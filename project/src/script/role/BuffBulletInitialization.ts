import Data2 from "../Data/JsonEnum"
import MainWeaponData from "../manage/MainWeaponData"
import Buff from "../role/Buff"
import PlayingSceneControl from "../playing/PlayingSceneControl"
import BulletMain from "../Bullet/BulletMain";
import { Bullet } from "../Bullet/BulletInterface";
export default class BuffBulletInitialization {
    /**
     * buff子弹  金币子弹  加速子弹等
     */
    private buffData: { [key: string]: Buff };
    //飞机
    private roleObj: Laya.Sprite;
    //飞机中坐标
    private rolePos: Laya.Point;
    //imgPlane
    private imgPlane: Laya.Image;
    private static _instance: BuffBulletInitialization;
    private bulletRed: Laya.Prefab;
    constructor() {
        this.roleObj = PlayingSceneControl.instance.roleObj;
        this.bulletRed = PlayingSceneControl.instance.bullet_red;
        const imgPlane: Laya.Image = this.roleObj.getChildAt(0) as Laya.Image;
        this.imgPlane = imgPlane;
        this.setRolePos();
    }
    setRolePos() {
        const newPoint: Laya.Point = new Laya.Point(this.imgPlane.x, this.imgPlane.y);
        this.roleObj.localToGlobal(newPoint);
        this.rolePos = newPoint;
    }
    public static getInstance(): BuffBulletInitialization {
        if (!BuffBulletInitialization._instance) {
            BuffBulletInitialization._instance = new BuffBulletInitialization();
        }
        return BuffBulletInitialization._instance;
    }
    initBuffData(value: any): void {
        this.buffData = value;
    }
    //已经创建了几种类型的弹幕,金币弹幕除外
    private bulletIndex: number;
    onUpdate() {
        const buffData = this.buffData;
        if (buffData && Object.keys(buffData).length) {
            this.bulletIndex = 0;
            this.createBuffBullet();
        }
    }

    createBuffBullet(): void {
        const buffData = this.buffData;
        let i: string;
        for (i in buffData) {
            const type: number = buffData[i].type;
            switch (type) {
                case 4:
                    //创建旋转的圆形子弹  
                    if (Date.now() - buffData[i].nowTime_otherBuff >= 1000) {
                        buffData[i].nowTime_otherBuff = Date.now();
                        this.createBulletCircle(buffData[i]);
                    }
                    break;
                case 3:
                    //火力弹幕
                    this.createBulletFire(buffData[i]);
                    break;
                case 2:
                    //加速buff现在只会影响当前所有的子弹的速度, 不会再重新加入速度子弹;
                    break;
                    //速度弹幕  
                    const bulletSpeed: number = (0.15 - (MainWeaponData.getInstance().speed * buffData[i].buffValue - 9) * 0.001) * 1000;
                    if (Date.now() - buffData[i].nowTime_otherBuff >= bulletSpeed) {
                        // console.log("事件差---------:" + (Date.now() - buffData[i].nowTime_otherBuff) + "-----" + bulletSpeed)

                        buffData[i].nowTime_otherBuff = Date.now();
                        this.bulletIndex++;
                        this.createBulletFire(buffData[i]);
                        // console.error("进入了创建子弹的createBuffBullet---", this.buffData);
                    }
                    break;
                default:
                    break;
            }
        }
    }
    /**
     * 创建类型3  或者4
     */
    createBulletFire(data: Buff) {
        const repeatNum = Object.keys(data["repeatJsonNum"]).length;
        if (!repeatNum) {
            debugger
        }
        this.setRolePos();
        var speedArra = data.speedBate.split("#");
        let angle: number = this.bulletIndex == 1 ? (85 + 1.5) : 80;
        let leftAngle: number = this.bulletIndex == 1 ? (270 - 5 + 1.5) : (270 - 10);
        if (Date.now() - data.nowTime_fireBuff[0] >= Number(speedArra[0]) * PlayingSceneControl.instance.bulletSpeed) {
            //两边紫色
            let i = 0;
            for (i; i < 2; i++) {
                const posX = i === 1 ? (this.roleObj.x - 26 + 15) : (this.rolePos.x + 26 - 15);
                const paraAngle = i === 1 ? 266.5 : (360 - 86.5);
                const obj = new BulletMain(Bullet.BulletType.roleMainBullet, { x: posX + 30, y: this.rolePos.y - 40 - 15 }, "火力增强子弹_02" || data.bullet, paraAngle, data, 0);
            }
            data.nowTime_fireBuff[0] = Date.now();
        }
        if (Date.now() - data.nowTime_fireBuff[1] >= Number(speedArra[1]) * PlayingSceneControl.instance.bulletSpeed && repeatNum >= 2) {
            //中间黄色
            const obj = new BulletMain(Bullet.BulletType.roleMainBullet, { x: this.roleObj.x + 59, y: this.rolePos.y - 40 - 15 - 30 }, "火力增强子弹_01" || data.bullet, 360 - 90, data, 1);
            data.nowTime_fireBuff[1] = Date.now();
        }
        if (Date.now() - data.nowTime_fireBuff[2] >= Number(speedArra[2]) * PlayingSceneControl.instance.bulletSpeed && repeatNum >= 3) {
            this.createBulletFire_missile(data, repeatNum);
            data.nowTime_fireBuff[2] = Date.now();
        }
        return;
        for (var i = 0; i < 3; i++) {
            // const huDu = angle;
            // const speedY: number = MainWeaponData.getInstance().bulletSpeed;
            // const speedX: number = speedY / Math.tan(huDu * Math.PI / 180);
            // const bullet: Laya.Sprite = PlayingSceneControl.instance.createBulletObj(data.bullet);
            let posX: number;
            let paraAngle: number;
            if (i === 0) {
                posX = this.rolePos.x + 26;
                paraAngle = 360 - angle;
                // bullet.pos(this.rolePos.x + 26, this.rolePos.y - 40, true);
            } else if (i === 1) {
                posX = this.roleObj.x - 26;
                paraAngle = leftAngle;
                // bullet.pos(this.rolePos.x - 26, this.rolePos.y - 40, true);
            }
            // bullet["vars_"].propertyObj = { prefabType: Data2.prefabType.bulletRole };
            // bullet["vars_"].type = data.type;
            // if (data.type === 3) {
            //     bullet["vars_"].propertyObj.hurtValue = data.buffValue * Number(MainWeaponData.getInstance().getShowFire());
            // } else {
            //     bullet["vars_"].propertyObj.hurtValue = Number(MainWeaponData.getInstance().getShowFire());
            // }
            // PlayingSceneControl.instance.bulletParent.addChild(bullet);
            // (bullet.getComponent(Laya.RigidBody) as Laya.RigidBody).setVelocity({ x: i === 0 ? speedX : -speedX, y: -speedY });
            let obj: BulletMain;
            if (i === 2) {
                obj = new BulletMain(Bullet.BulletType.roleMainBullet, { x: this.roleObj.x + 59, y: this.rolePos.y - 40 - 15 - 30 }, "火力增强子弹_01" || data.bullet, 360 - 90, data, 1);
            } else {

                obj = new BulletMain(Bullet.BulletType.roleMainBullet, { x: posX + 30, y: this.rolePos.y - 40 - 15 }, "火力增强子弹_02" || data.bullet, paraAngle, data, 0);
            }
            // obj.setBuff(data.type, data.buffValue * Number(MainWeaponData.getInstance().getShowFire()), data.buffValue);
        }
        this.createBulletFire_missile(data, repeatNum);
    }
    /**
     * 创立火力增强中的子弹
     */
    createBulletFire_missile(data: Buff, repeatNum: number) {
        const missileNum = repeatNum >= 3 ? 4 : 2;
        let i: number = 0;
        for (i; i < 4; i++) {
            let startAngle = { 0: 30, 1: -30, 2: 60, 3: -60 };
            let startPosX = { 0: { x: 130 - 20, y: 39 }, 1: { x: -8 + 20, y: 39 }, 2: { x: 153 - 20, y: 57 }, 3: { x: -26 + 20, y: 57 } };
            const obj = new BulletMain(Bullet.BulletType.roleMainBullet, { x: this.roleObj.x + startPosX[i].x, y: startPosX[i].y + this.roleObj.y }, "火力增强导弹", startAngle[i], data, 2);
        }
    }
    /**
     * 创建类型4
     */
    createBulletCircle(data: Buff) {
        // x1 = x0 + r * cos(ao * 3.14 / 180)
        // y1 = y0 + r * sin(ao * 3.14 / 180)
        // Laya.Browser.window.markBullet = [];
        const r = 100;
        const repeatNum = Object.keys(data["repeatJsonNum"]).length;
        if (!repeatNum) {
            debugger
        }
        const bulletNums = repeatNum * 4;
        const anglePlus: number = 360 / bulletNums;

        let i: number = 0;
        for (i = 0; i < bulletNums; i++) {
            const x1: number = this.imgPlane.x + r * Math.cos(anglePlus * i * Math.PI / 180);
            const y1: number = this.imgPlane.y + r * Math.sin(anglePlus * i * Math.PI / 180);
            const posxy = this.getXiangDuiPos(x1, y1);
            const obj = new BulletMain(Bullet.BulletType.roleMainBullet, posxy, data.bullet, null, data);
            const hurtValue = data.buffValue * Number(MainWeaponData.getInstance().getShowFire());
            obj.setBuff({ x: x1, y: y1 });
        }
    }
    getXiangDuiPos(posx, posy): Laya.Point {
        const newPoint: Laya.Point = new Laya.Point(posx, posy);
        this.roleObj.localToGlobal(newPoint);
        return newPoint;
    }
}