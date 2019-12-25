import PlayingVar from "../manage/Playing_var"
import manage from "../manage/BitmapFontMananage"
import EnemyObject from "../role/EnemyObject"
import Data2 from "../Data/JsonEnum"
import PlayingControl from "../playing/PlayingSceneControl"
import Music from "../manage/Music"
import MusicEnum from "../Data/MusicEnum"
import musicToUrl = MusicEnum.musicToUrl;
import OpenWx from "../manage/OpenWx";
import UpBlackEffect from "../Effect/UpBlackEffect";
import LYsprite = Laya.Sprite;
import SkeletonTempletManage from "../manage/SkeletonTempletManage";
import EndlessParseSkill from "../manage/EndlessParseSkill";
export default class role extends Laya.Script {
    public static instance: role;
    private self: Laya.Sprite;
    private local: any;
    //无敌  
    public noHurt: boolean;
    private markNoHurtStartTime: number;
    constructor() {
        super();
        role.instance = this;
    }
    private hurtedBg: Laya.Image;
    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this.hurtedBg = PlayingControl.instance.owner["hurted_img"];
        if (!this.self["vars_"]) {
            this.self["vars_"] = {};
        }
        this.self["vars_"].propertyObj = { "prefabType": Data2.prefabType.role };
        //阵营
        this.self["vars_"].propertyObj.camp = 2;
        //碰撞半径
        this.self["vars_"].propertyObj.hitRadius = { w: 60, h: 55 };
        // this.noHurt = false;
        this.noHurt = false;
        this.haveSheild = false;
        // Laya.stage.addChild(this.hurtedBg);
    }
    private markShowAndHideIndex: number;
    onUpdate() {

        if (this.noHurt) {
            if (Date.now() - this.markNoHurtStartTime <= 3000) {
                this.markShowAndHideIndex == void 0 && (this.markShowAndHideIndex = 0);
                if (this.markShowAndHideIndex % 10 === 0) {
                    this.self.visible = !this.self.visible;
                }
                if (this.markShowAndHideIndex % 25 === 0) {
                    this.hurtedBg.visible = !this.hurtedBg.visible;
                    !this.hurtedBg.parent && Laya.stage.addChild(this.hurtedBg);

                }
                this.markShowAndHideIndex++;
            } else {
                this.noHurt = false;
                this.self.visible = true;
                this.hurtedBg && (this.hurtedBg.visible = false);
                delete this.markShowAndHideIndex;
            }
        }
        if (this.haveSheild) {
            if (Date.now() - this.markHaveSheildStartTime >= this.keepSheildTime) {
                this.haveSheild = false;
                this.cancelSheildEffect();
            }
        }

        this.updateWuDiSkill();

    }
    private isWuDiSkill: boolean;
    private wuDiStartTime: number;
    private wuDiEndTime: number;
    private wuDiKeepTime: number;
    /**
     * 间隔一段时间无敌的技能
     */
    updateWuDiSkill() {
        if (PlayingVar.getInstance().gameModel === "endless") {
            if (EndlessParseSkill.getInstance().isUpgraded(5)) {
                if (this.isWuDiSkill == (void 0)) {
                    this.initWudiSkill();
                }
                if (this.isWuDiSkill) {
                    if (Date.now() - this.wuDiStartTime >= this.wuDiKeepTime) {
                        this.isWuDiSkill = false;
                        this.wuDiEndTime = Date.now();
                    }
                } else {
                    if (Date.now() - this.wuDiEndTime >= 10 * 1000) {
                        this.wuDiStartTime = Date.now();
                        this.isWuDiSkill = true;
                    }
                }
            }
        }
    }
    initWudiSkill() {
        this.wuDiStartTime = Date.now();
        this.isWuDiSkill = true;
    }
    updateWuDiKeepTime() {
        const seconds = EndlessParseSkill.getInstance().getSkillNum(5);
        this.wuDiKeepTime = 1000 * seconds;
    }
    onTriggerEnter(other: any, self: any): void {
        if (PlayingVar.getInstance().gameStatus !== "playing") {
            return;
        }
        const local = other.owner.vars_ && other.owner.vars_.propertyObj;
        if (!(local && local.prefabType)) {
            return;
        }
        if (!other.owner.visible || !other.owner.parent) {
            return;
        }
        const collisionEnemy: boolean = (local.prefabType === Data2.prefabType.bullletBoss || local.prefabType === Data2.prefabType.enemy);
        const collisionBossBullet: boolean = local.prefabType === "bullet";
        if ((collisionEnemy || collisionBossBullet) && PlayingVar.getInstance().invincible && !this.noHurt) {
            const otherHurtValue = other.owner["vars_"].propertyObj.hurtValue;
            PlayingControl.instance.roleHp -= otherHurtValue;
            if (PlayingControl.instance.roleHp <= 0) {
                this.setRoleDead();
                // this.createEffectInEneny(Data2.baozhaAni.fjbaozha);
                // console.log("游戏失败~!");
                // PlayingVar.getInstance().gameStatus = "settlement";
                // this.self.visible = false;
                // PlayingControl.instance.mainPlane.visible = false;
                // PlayingControl.instance.leftSecondWeapon.visible = false;
                // PlayingControl.instance.rightSecondWeapon.visible = false;
                // //Laya.Event.VISIBILITY_CHANGE
                // PlayingControl.instance.fighting = false;
                // //失败
                // Laya.Browser.window.game.overLevel = false;
                // Laya.timer.once(1200, this, this.openFailScene);
                // //游戏暂停
                // // PlayingControl.instance.pauseAndResumeGame();

            } else {
                this.startRoleNoHurt();
            }
            const nowHp: number = PlayingControl.instance.roleHp <= 0 ? 0 : PlayingControl.instance.roleHp;
            const mark_graphics = PlayingControl.instance.hpBar.mask.graphics;
            mark_graphics.clear();
            const markWidth = 49 + (213 / PlayingControl.instance.roleTotal) * nowHp;
            mark_graphics.drawRect(0, 0, markWidth, 44, "#ff0000");
            PlayingControl.instance.delayHpBar2(markWidth);
        }
    }
    /**
     * 
     * @param hurtValue 伤害值
     * @param from 子弹||敌人
     */
    setRoleHp(hurtValue: number, from?: string) {
        //设置无敌测试
        // hurtValue = 0;
        if (hurtValue > 0) {
            if (this.haveSheild) {
                return;
            }
            if (this.isWuDiSkill) {
                return;
            }
        }
        if (hurtValue > 0) {
            const reduceHurt = this.getReduceHurt(from);
            hurtValue -= reduceHurt;
        }
        hurtValue < 0 && (hurtValue = 0);
        const P_instance = PlayingControl.instance;
        P_instance.roleHp -= hurtValue;
        if (P_instance.roleHp <= 0) {
            this.setRoleDead();
        } else {
            hurtValue > 0 && this.startRoleNoHurt();
        }
        let nowHp: number;
        if (P_instance.roleHp <= 0) {
            nowHp = 0;
        } else if (P_instance.roleHp > P_instance.roleTotal) {
            nowHp = P_instance.roleTotal;
        } else {
            nowHp = P_instance.roleHp;
        }
        const mark_graphics = P_instance.hpBar.mask.graphics;
        mark_graphics.clear();
        const markWidth = 49 + (213 / P_instance.roleTotal) * nowHp;
        mark_graphics.drawRect(0, 0, markWidth, 44, "#ff0000");
        P_instance.delayHpBar2(markWidth);
        PlayingControl.instance.label_hpNum.text = "" + nowHp + "/" + P_instance.roleTotal;
    }
    startRoleNoHurt() {
        this.noHurt = true;
        this.markNoHurtStartTime = Date.now();
    }
    /**
     * 无尽模式减伤技能
     */
    getReduceHurt(from?: string) {
        let reduceNum: number = 0;
        const skillInstance = EndlessParseSkill.getInstance();
        if (PlayingVar.getInstance().gameModel === "endless") {
            if (((from && from === "子弹") || !from) && skillInstance.isUpgraded(6)) {
                reduceNum += skillInstance.getSkillNum(6);
            }
            if (from && from === "敌人" && skillInstance.isUpgraded(7)) {
                reduceNum += skillInstance.getSkillNum(7);
            }
            if (skillInstance.isUpgraded(8)) {
                reduceNum += skillInstance.getSkillNum(8);
            }
            return reduceNum;
        }
        return reduceNum;
    }
    private haveSheild: boolean;   //护盾技能
    private markHaveSheildStartTime: number;
    private keepSheildTime: number;
    startRoleSheild(keepTime: number) {
        this.keepSheildTime = keepTime * 1000;
        this.haveSheild = true;
        this.markHaveSheildStartTime = Date.now();
        this.createSheildEffect();
    }
    setRoleDead() {
        //微信小游戏震动~
        Laya.Browser.onMiniGame && OpenWx.getInstance().vibrateShort();
        this.createEffectInEneny(Data2.baozhaAni.fjbaozha);
        console.log("游戏失败~!");
        PlayingVar.getInstance().gameStatus = "settlement";
        this.self.visible = false;
        PlayingControl.instance.mainPlane.visible = false;
        PlayingControl.instance.leftSecondWeapon.visible = false;
        PlayingControl.instance.rightSecondWeapon.visible = false;
        //Laya.Event.VISIBILITY_CHANGE
        PlayingControl.instance.fighting = false;
        //失败
        Laya.Browser.window.game.overLevel = false;
        Laya.timer.once(1200, this, this.openFailScene);
        //游戏暂停
        // PlayingControl.instance.pauseAndResumeGame();
        Music.getInstance().playSound(musicToUrl.bomb_hero);
        UpBlackEffect.getInstance().setHide();
    }

    openFailScene(): void {
        Laya.timer.clear(this, this.openFailScene);
        new manage.BitmapManage("bitmapFont/settlement_number.fnt", "settlement_number", Laya.Handler.create(this, () => {
            Laya.Scene.open("test/GameFail_dialog.scene", false);
        }));
        PlayingControl.instance.clearObjParent();
        PlayingControl.instance.clearObjectPool();
        PlayingControl.instance.clearStageSprite();
    }

    onDisable(): void {
    }

    /**
     * @param type up上 down回到原位
     */
    moveRoleInMain(type: string) {
        let posY: number = type === "up" ? 637 + 100 : 1012;
        if (this.self.y === posY) {
            return;
        }
        Laya.Tween.to(this.self, { y: type === "up" ? 637 + 100 : 1012 }, 200, null, null, null, null, true);
        //this.self.on(Laya.Event.SELECT)
    }
    /**
 * 主角死亡的效果
 * @param type
 */
    createEffectInEneny(type: Data2.baozhaAni) {
        const baozhaPrefab: Laya.Prefab = Laya.loader.getRes("prefab/xg_baozha.json");
        const baozhaSprite = Laya.Pool.getItemByCreateFun("xg_baozha", baozhaPrefab.create, baozhaPrefab);
        baozhaSprite.aniName = "baozha1";
        baozhaSprite.prefabName = "xg_baozha";
        baozhaSprite.pos(this.self.x, this.self.y + 55);
        Laya.stage.addChild(baozhaSprite);
    }

    createSheildEffect() {
        const mark_sk = this.self.getChildByName("fanghudun") as Laya.Skeleton;
        if (mark_sk) {
            mark_sk.visible = true;
            return;
        }
        const sk = Laya.Pool.getItemByCreateFun("fanghudun", () => {
            const templet: Laya.Templet = SkeletonTempletManage.getInstance().templets["fanghudun"];
            const sk = templet.buildArmature(0);
            return sk;
        }, this);
        sk.pos(62, 22);
        sk.visible = true;
        sk.name = "fanghudun";
        sk.play(0, true);
        this.self.addChild(sk);
    }
    cancelSheildEffect() {
        const sk = this.self.getChildByName("fanghudun") as Laya.Skeleton;
        sk && (sk.visible = false);
    }
}