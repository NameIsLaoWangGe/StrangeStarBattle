module Data {
    /**
     * jsonZip的地址
     */
    export const url = "res/data/dataJson";
    /**
     * 非boos怪物得路径
     */
    export const monsterUrl = "monster/";
    /**
     * 副武器的url路径
     */
    export const urlSecondWeapon = "secondWeapon/";
    /**
     * 如果key为空表示key的值为"id"
     */
    export const DataJsonUrl = {
        battle: { file: "battle", key: "id" },
        buff: { file: "buff", key: "id" },
        buy_gold: { file: "buy_gold", key: "id" },
        buy_power: { file: "buy_power", key: "id" },
        endless: { file: "endless", key: "id" },
        endless_reward: { file: "endless_reward", key: "id" },
        endless_skill: { file: "endless_skill", key: "id" },
        endless_weapon: { file: "endless_weapon", key: "level" },
        endless_boss: { file: "endless_boss", key: "id" },
        item: { file: "item", key: "id" },
        misc: { file: "misc", key: "id" },
        monster: { file: "monster", key: "id" },
        secondaryWeapon: { file: "secondaryWeapon", key: "id" },
        shop: { file: "shop", key: "id" },
        sign: { file: "sign", key: "id" },
        tips: { file: "tips", key: "id" },
        weapon: { file: "weapon", key: "level" },
        wheel: { file: "wheel", key: "id" },
        bullet: { file: "bullet", key: "id" },
        achievement: { file: "achievement", key: "id" }

    }
    export const zipDataFileList = {
        jsonZip: DataJsonUrl
    }
    export enum DataType {
        battle = 1,
        buff,
        buy_gold,
        buy_power,
        endless,
        endless_reward,
        endless_skill,
        endless_weapon,
        endless_boss,
        item,
        misc,
        monster,
        secondaryWeapon,
        shop,
        sign,
        tips,
        weapon,
        wheel,
        bullet,
        achievement,
    }
    /**
     * 怪物类型对应的预设&&副武器子弹pic对应预设
     */
    export enum enemyToPerfab {
        "初始_怪物1" = "Enemy_blue",
        "初始_怪物2" = "Enemy_yellow",
        "初始_怪物3" = "Enemy_red",
        "怪物4" = "Enemy4",
        "怪物5" = "Enemy5",
        "怪物6" = "Enemy6",
        "怪物7" = "Enemy7",
        "怪物8" = "Enemy8",
        "怪物9" = "Enemy9",
        "怪物10" = "Enemy10",
        "怪物11" = "Enemy11",
        "怪物12" = "Enemy12",
        "怪物13" = "Enemy13",
        "怪物14" = "Enemy14",
        "怪物15" = "Enemy15",
        "特殊怪物1" = "enemy_special1",
        "特殊怪物2" = "enemy_special2",
        "特殊怪物3" = "enemy_special3",
        "特殊怪物4" = "enemy_special4",
        "特殊怪物5" = "enemy_special5",
        "boss1" = "Boss1",      //食人花
        "boss2" = "Boss2",    //飞天恶魔
        "boss3" = "Boss3",
        "boss4" = "Boss4",      //冰怪
        "boss5" = "Boss5",  // 火怪
        "boss_nanguawangzi" = "Boss_nanguawangzi",
        "boss_dashuren" = "Boss_dashuren",
        "boss_shitoujuren" = "Boss_shitoujuren",
        "boss_maowanghou" = "Boss_maowanghou",
        "boss_bingqilinzuhe" = "Boss_bingqilinzuhe",
        "boss_bingtouxiang" = "Boss_bingtouxiang",
        "boss_jibaobao" = "Boss_jibaobao",
        "boss_zhangyunvhuang" = "Boss_zhangyunvhuang",
        "bingshuanpao" = "Bullet_skill3",
        "jiguangpao" = "Bullet_skill4",
        "xuanfupao" = "Bullet_skill5",

        "bullet_blue" = "Bullet_blue",  //临时的boss子弹
    }
    /**
     * boss的状态
     */
    export enum bossStatus {
        "stand" = 1,
        "attack",
        "attacked",
    }
    /**
     * boss 动作对应的动画名称
     */
    export enum bossDragonAction {
        "attack" = "attack",
        "attacked" = "attacked",
        "skill" = "skill",
        "stand" = "stand",
        "skill1" = "skill1",    //只针对boss4冰怪
    }
    /**
     * 子弹的类型
     */
    export enum BulletType {
        "main" = 1,  //主武器子弹
        "second",   //副武器子弹
        "boss",     //boss子弹
        "bigEnemy", //终极小怪
    }
    /**
     * prefab类型
     */
    export enum prefabType {
        "role" = 1,
        "boss",
        "enemy",
        "bulletRole",
        "bulletSkill",      //副武器子弹
        "bullletBoss",  //boss子弹
        "muzzle",   //炮口
    }
    /**
     * 副武器技能状态
     */
    export enum secondSkill {
        "ice" = 1,
        "Laser",
        "flottant",
    }
    //副武器类型 type对应的预设~
    export enum muzzlePrefab {
        "Bullet_muzzle3" = 3,
        "Bullet_muzzle4",
        "Bullet_muzzle5",
    }
    //副武器类型 type对应的怪物身上效果的预设~
    export enum muzzlePrefabEnemy {
        "Bullet_skill3_enemy" = 3,
        "Bullet_skill4_enemy",
        "Bullet_skill5_enemy",
    }
    /**
     * monster表的字段
     */
    export interface monster {
        id: number;
        type: number;
        way: number;
        color: number;
        pic: string;
        level: number;   //怪物的等级
        hp: number;
        speed: string;
        fire: number;
        shootSpeed: number;
        gold: number;
        bulletSpeed: number;
        bullet: any;
        buff: any;
        scale: any;
        positiony: number;
        positionx: any;
    }
    /**
     * bullet 表字段
     */
    export interface bullet {
        type;
        bullet;
        scale;
        position;
        layer;
    }
    
    /**
     * buff表的字段
     */
    export interface buff {
        id: number;
        icon: string;
        type: number;
        value: number;
        time: number;
        time_lost: number;
        bullet: string;
        icon_buff: string;
        speed: number;
    }
    export interface sign {
        id: number;
        reward: string;
    }
    /**
     * SkeletonTempletManage 中的模板类型
     */
    export enum templetType {
        enemy = 1,
        other,
    }
    /**
     * baozha sk的动画name
     */
    export enum baozhaAni {
        "baozha" = 0,//打击到怪物身上的效果
        "gwbaozha",
        "fjbaozha",
        "xg_baozha",    //怪物死亡爆炸

    }
    /**
     * 中级怪物对应得sk name
     */
    export enum midEnemyNameToSK {
        "中级_河豚" = "zhongji_hetun",
        "中级_蝎子" = "zhongji_xiezi",
        "中级_飞猴" = "zhongji_feihou",
        "中级_萝卜" = "zhongji_luobo",
        "中级_冰花" = "zhongji_binghua",
        "中级_冰淇淋" = "zhongji_bingqilin",
        "中级_海鲨" = "zhongji_haisha",
        "中级_海妖" = "zhongji_haiyao",
        "中级_火鬼" = "zhongji_huogui",
        "中级_火蘑菇" = "zhongji_huomogu",
    }
    /**
     * boss的子弹的类型
     */
    export enum bossBulletType {
        "skill" = 1,
        "common",
        "common2",      //比如boss4
        "ion",     //boss2的离子炮
        "display",   //展示作用无其它任何效果
        "skill2",   //部分boss的技能2可能需要单独出来
    }

    /**
     * 副武器炮口特效的位置
     */
    /**
 *  - 35, 44   ||143 - 10-5, 44   203副武器位置
 *  - 35, 52  || 143 - 5, 52     201
 *  -32 ,52-8  ||  143,52-8       202
 */
    export const secondWeaponMuzzlePos = {
        5: { x: [- 35, 143 - 15], y: [44, 44] },
        3: { x: [-35, 143 - 5], y: [52, 52] },
        4: { x: [-32, 143], y: [52 - 8, 52 - 8] },

        6: { x: [-32, 143], y: [52 - 8, 52 - 8] },
        1: { x: [-32, 143], y: [52 - 8, 52 - 8] },  //流星炮
        7: { x: [-32, 143], y: [52 - 8, 52 - 8] },  //导弹炮
        8: { x: [-32, 143], y: [52 - 8, 52 - 8] },  //虚空引擎
        9: { x: [-32, 143], y: [52 - 8, 52 - 8] },  //飞刃
        10: { x: [-32, 143], y: [52 - 8, 52 - 8] },  //蘑菇炮
        11: { x: [-32, 143], y: [52 - 8, 52 - 8] },  //随机跟踪
    }
    /**
     * 副武器子弹发射的位置
     */
    /**
 * 203   x-34 y-20    ||  x+143 y-20
 * 201  x-34 y-80    ||   x+143 y-80
 * 202  x-34 y-80    ||   x+143 y-80
 */
    export const secondWeaponPos = {
        3: { x: [-34 - 35, 143 - 25], y: [-80 - 200, -80 - 200] },
        4: { x: [-34 - 15, 143 - 15 + 4], y: [-80 - 600 + 640, -80 - 600 + 640] },
        6: { x: [-34 - 15, 143 - 15 + 4], y: [-80 - 600 + 640, -80 - 600 + 640] },
        1: { x: [-34 - 15, 143 - 15 + 4], y: [-80 - 600 + 640, -80 - 600 + 640] },  //流星炮
        7: { x: [-34 - 15, 143 - 15 + 4], y: [-80 - 600 + 640, -80 - 600 + 640] },  //导弹炮
        8: { x: [-34 - 15, 143 - 15 + 4], y: [-80 - 600 + 640, -80 - 600 + 640] },  //虚空引擎
        9: { x: [-34 - 15, 143 - 15 + 4], y: [-80 - 600 + 640, -80 - 600 + 640] },  //飞刃
        10: { x: [-34 - 15, 143 - 15 + 4], y: [-80 - 600 + 640, -80 - 600 + 640] },  //蘑菇炮
        11: { x: [-34 - 15, 143 - 15 + 4], y: [-80 - 600 + 640, -80 - 600 + 640] },  //随机跟踪
        5: { x: [-34 - 52, 143 - 52 + 4], y: [-20 - 20, -20 - 20] },
    }
    export enum roleStatus {
        "controled" = 1,
    }
    /**
     * 圆形碰撞,圆形模拟
     */
    export interface Round {
        x: number;
        y: number;
        r: number;
    }
    /**
     * 矩形碰撞,矩形模拟
     */
    export interface Rect {
        x: number;
        y: number;
        w: number;
        h: number;
    }
    export enum dropHpStatus {
        "born" = 1,
        "ordinary",
        "second9",
        "second10",
        "second8",
    }
}
export default Data;