import GameConfig from "./GameConfig";
import PlayingVar from "./script/manage/Playing_var"
import HttpModel from "./script/Connect/HttpClass";
import HttpModel2 from "./script/Connect/HttpEnum"
import AdaptScene from "./script/manage/AdaptScene";
class Main {
	constructor() {
		
		//根据IDE设置初始化引擎		
		if (window["Laya3D"]) Laya3D.init(GameConfig.width, GameConfig.height);
		else Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);

		Laya["Physics"] && Laya["Physics"].enable();
		Laya["DebugPanel"] && Laya["DebugPanel"].enable();
		if (Laya.Browser.onPC) {
			const scaleMode: string = Laya.Stage.SCALE_SHOWALL;
			Laya.stage.scaleMode = scaleMode;
		} else {
			Laya.stage.scaleMode = GameConfig.scaleMode;
		}

		Laya.stage.screenMode = GameConfig.screenMode;
		//兼容微信不支持加载scene后缀场景
		Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
		UIConfig.closeDialogOnSide = true;
		//打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
		if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
		// if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
		if (GameConfig.stat) Laya.Stat.show();
		Laya.alertGlobalError = true;
		//可能是引擎的一个bug修正~
		// Laya.Physics.I['box2d'].DEBUG = false;
		// console.log("Laya.Physics.I['box2d']",Laya.Physics.I["box2d"]);
		//box2d.DEBUG=false
		// Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
		// Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
		Laya.stage.alignV = GameConfig.alignV;
		Laya.stage.alignH = GameConfig.alignH;
		//大图合集功能关闭
		// Config.atlasEnable = false;
		//加载界面
		PlayingVar.getInstance().gameStatus = "loading";
		// Laya.URL.basePath = "https://special-star-wx-1258119497.cos.ap-shanghai.myqcloud.com/";
		// Laya.URL.basePath = "https://ssl.xdieg.com/StaticFiles/wxgame/";
		//stage width 或者 height 改变的 监听
		Laya.stage.on(Laya.Event.RESIZE, this, this.onResize);
		//激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
		Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
	}
	onResize(arg: any) {
		console.log("onResize----:", arg, "stage.height", Laya.stage.height);
		AdaptScene.getInstance().setSceneAdaptHeight();
	}
	onVersionLoaded(): void {
		//激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
		Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
	}

	onConfigLoaded(): void {
		//加载IDE指定的场景
		//Laya.loader.load([{ url: "test/explode.ani" }, { url: "test.png", type: Laya.Loader.IMAGE }, { url: "test.atlas", type: Laya.Loader.ATLAS }]);

		if (Laya.Browser.onMiniGame) {
			this.handleMiniGame();
		} else {
			console.error("仅支持微信客户端");
			GameConfig.startScene && Laya.Scene.open(GameConfig.startScene, true);
		}
	}
	handleMiniGame() {
		Laya.Browser.window.wx.login(
			{
				success: (res) => {
					if (res.code) {
						let code = res.code;
						console.error("登陆成功,获取到code", code);
						PlayingVar.getInstance().wecode = code;

						// const url: string = HttpModel2.URLSERVER + HttpModel2.httpUrls.uuid;
						// let randonUserId: any;
						// randonUserId = { code: PlayingVar.getInstance().wecode };
						// const data: string = JSON.stringify(randonUserId);
						// new HttpModel.HttpClass(Laya.Handler.create(this, this.requestUUID), url, data)
						GameConfig.startScene && Laya.Scene.open(GameConfig.startScene, true);
					}
					// var button = Laya.Browser.window.wx.createUserInfoButton(
					// 	{
					// 		type: 'text',
					// 		text: '点击进入游戏',
					// 		style:
					// 			{
					// 				left: wx.getSystemInfoSync().windowWidth / 2 - 70,
					// 				top: wx.getSystemInfoSync().windowHeight / 2,
					// 				width: 140,
					// 				height: 40,
					// 				lineHeight: 40,
					// 				backgroundColor: '#ff0000',
					// 				color: '#ffffff',
					// 				textAlign: 'center',
					// 				fontSize: 16,
					// 				borderRadius: 4
					// 			}
					// 	})
					// button.onTap((res) => {
					// 	if (res.errMsg == "getUserInfo:ok") {
					// 		console.log("授权用户信息")
					// 		//获取到用户信息
					// 		// GameDataManager.PlayerImgUrl = res.userInfo.avatarUrl
					// 		// GameDataManager.PlayerName = res.userInfo.nickName
					// 		// GameDataManager.IsAuthSuccess = true
					// 		// console.log("player wechat imge "+GameDataManager.PlayerImgUrl)
					// 		console.error(res);
					// 		//清除微信授权按钮
					// 		button.destroy()
					// 	}
					// 	else {
					// 		console.log("授权失败")
					// 		// GameDataManager.IsAuthSuccess = false
					// 		console.error("授权失败");
					// 		//清除微信授权按钮
					// 		button.destroy()
					// 	}
					// })
					// button.show()
				}
			})
	}
	requestUUID(data: any) {
		console.error("~~~~~~~~~~~~dadadada111~~~~~~~~~", data);
	}
}

//激活启动类
new Main();
