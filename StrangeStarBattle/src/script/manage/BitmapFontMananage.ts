
module manage {

    import BitmapFont = Laya.BitmapFont;
    import LYHandler = Laya.Handler;
    import Text = Laya.Text;
    export class BitmapManage extends BitmapFont {
        /**
         * 
         * @param url fnt路径 
         * @param name fntname 
         * @param hander 回调
         */
        constructor(url: any, name: any, hander: LYHandler) {
            super();
            this.loadFont(url, LYHandler.create(this, this.loaded, [name, hander]));
        }
        loaded(arg1: string, arg2: LYHandler) {
            Text.registerBitmapFont(arg1, this);
            if (arg2) {
                arg2.run();
            }
        }
    }
}
export default manage;