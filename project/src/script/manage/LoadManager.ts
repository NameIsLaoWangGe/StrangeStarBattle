/**
* 资源加载管理类(待优化丰富)
*/
import HashMap from "../Tools/HashMap"
module manage {
	export class LoadManager {
		private static myselfs = null;
		public hashMap: any;
		private FixedDataTablesDir = `res/data/dataJson`;
		constructor() {
			this.hashMap = new HashMap();
		}
		public static Instance(): LoadManager {
			if (this.myselfs == null) {
				this.myselfs = new LoadManager();
			}
			return this.myselfs;
		}

		/**
         * 加载资源
		 * JSON文件指向res/data/fixed_tables 可以不传路径，其他资源需要传路径
         * @param assetsList 资源列表 可以是单个资源名称，也可以是数组
         * @param complete 加载完成回调
		 * @param progress 加载进度回调
         */
		public loadAssets(assetsList: any, complete?: Laya.Handler, progress?: Laya.Handler) {
			if (!(assetsList instanceof Array)) {
				assetsList = [assetsList];
			}

			let loadList = [];
			assetsList.forEach(element => {
				// 先判断当前资源是否已经加载过
				if (!this.hashMap.has(element)) {
					const l = element.split('.');
					const assetsType = this.getAssetsType(l[l.length - 1]);
					if (!assetsType) {
						return false;
					}
					let data = {};
					if (assetsType === Laya.Loader.JSON || (assetsType === Laya.Loader.BUFFER && l[l.length - 1] === "zip")) {
						data = { url: `${this.FixedDataTablesDir}/` + element, type: assetsType };
					} else {
						data = { url: element, type: assetsType };
					}
					loadList.push(data);
				}
			});

			if (loadList.length <= 0) {
				if (complete) {
					complete.runWith(true);
				}
				return;
			}
			Laya.loader.load(loadList, Laya.Handler.create(this, (a, e) => {
				// 将加载的资源保存在本地
				let index = 0;
				assetsList.forEach(element => {
					this.hashMap.add(element, Laya.loader.getRes(a[index].url));
					index++;
				});
				if (complete) {
					complete.runWith(e);
				}
			}, [loadList]), progress);
		}

		/**
         * 释放内存资源
         * @param assetsList 资源名称 可以是数组也可以是单个字符串
         */
		public clearAssets(assetsList: any) {
			if (!(assetsList instanceof Array)) {
				assetsList = [assetsList];
			}
			assetsList.forEach((element, i) => {
				// 不强制销毁，比如某些正在使用的Texture调用销毁会无效
				const l = element.split('.');
				const assetsType = this.getAssetsType(l[l.length - 1]);
				if (!assetsType) {
					return false;
				}
				let dataUrl = '';
				if (assetsType === Laya.Loader.JSON) {
					dataUrl = `${this.FixedDataTablesDir}/` + element;
				} else {
					dataUrl = element;
				}
				Laya.loader.clearRes(dataUrl);
				this.hashMap.remove(assetsList[i]);
			});

		}

		/**
		  * 销毁Texture使用的图片资源
		  * 具体用法和效果可以参考 https://ldc.layabox.com/doc/?nav=zh-as-3-2-7
		  * @param assetsList 资源名称 可以是数组也可以是单个字符串
		  */
		public clearTextureRes(assetsList: any) {
			if (!(assetsList instanceof Array)) {
				assetsList = [assetsList];
			}
			assetsList.forEach(element => {
				const l = element.split('.');
				const assetsType = this.getAssetsType(l[l.length - 1]);
				if (!assetsType) {
					return false;
				}
				let dataUrl = '';
				if (assetsType === Laya.Loader.JSON) {
					dataUrl = `${this.FixedDataTablesDir}/` + element;
				} else {
					dataUrl = element;
				}
				Laya.loader.clearTextureRes(dataUrl);
			});
		}

		/**
		 * 获取加载到内存的资源数据
		 * @param url  加载的时候传进来的名称
		 */
		public getAssets(url: string) {
			return this.hashMap.get(url);	// Laya.loader.getRes(url);
		}

		private getAssetsType(suffixStr: any): string {
			let assetsType = null;
			switch (suffixStr) {
				case 'jpg':
				case 'png':
					assetsType = Laya.Loader.IMAGE;
					break;
				case 'fui':
				case 'txt':
				case 'sk':
					assetsType = Laya.Loader.BUFFER;
					break;
				case 'json':
					assetsType = Laya.Loader.JSON;
					break;
				case 'atlas':
					assetsType = Laya.Loader.ATLAS;
					break;
				case 'xml':
					assetsType = Laya.Loader.XML;
					break;
				case 'mp3':
				case 'wav':
					assetsType = Laya.Loader.SOUND;
					break;
				case 'csv':
					//新增加测试用
					assetsType = "csv";
					break;
				case 'zip':
					//新增加 zip
					assetsType = Laya.Loader.BUFFER;
					break;
				default:
					assetsType = null;
					break;
			}
			return assetsType;
		}

		/**
		 * 添加fgui资源包
		 * @param resKey 	可以是字符串可以是数组
		 * @param descData 	可以是字符串可以是数组
		 */
		public addPackage(resKey: any, descData: any) {
			if (resKey.constructor !== Array) {
				//fairygui.UIPackage.addPackage(resKey);
				return;
			}

			for (const key in resKey) {
				const element: string = resKey[key];
				const element2: string = descData[key];
				//fairygui.UIPackage.addPackage(element, Laya.loader.getRes(element2));
			}

		}
	}
}
export default manage;