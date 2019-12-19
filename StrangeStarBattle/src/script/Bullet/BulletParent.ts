import Sprite = Laya.Sprite;
import Bullet from "./BulletInterface";
import collisionShape = Bullet.collisionShape;
import BulletType = Bullet.BulletType;
export default class BulletParent {
    //1 主武器子弹  2 副武器子弹  3 boss子弹 
    public bType: BulletType;
    //副武器 影响速度或者持续伤害的概率1-100 || null
    public affectBate: number;
    //副武器 效果持续的时间
    public keepTimeValue: number;
    public hurtValue: number;
    public bCollisionShape: collisionShape;
    public bulletSpeed: any;
    public w: number;
    public h: number;
    //碰撞矩形坐标偏移
    public offsetX: number;
    public offsetY: number;
    public prefabName: string;
    // 射击得角度
    public angle: number;
    //pos 开始创建得位置
    public startPos: any;
    protected pic: string;
    protected readonly path: string = "face/";
    // public isBuffBullet: boolean;
    public BuffType: number;
    //火力buff的类型  1:两发带角度  2:一发垂直  3:左右各两发导弹
    public fireBuffType: number;
    //部分副武器的子弹开始需要不能触发检测
    public canHitCollision: boolean = true;
}

