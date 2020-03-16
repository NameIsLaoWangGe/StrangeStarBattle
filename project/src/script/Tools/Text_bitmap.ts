/**
 * 注册位图字体
 */
import Text = Laya.Text;
import Browser = Laya.Browser;
import Handler = Laya.Handler;
import BitmapFont = Laya.BitmapFont;
export default class Text_BitmapFont {
    private fontName: string;
    constructor(fontName: string, fontFile: string) {
        this.fontName = fontName;
        this.loadFont(fontName, fontFile);
    }
    loadFont(fontName: string, fontFile: string): void {
        var bitmapFont: BitmapFont = new BitmapFont();
        bitmapFont.loadFont("test.fnt"/*fontFile*/, new Handler(this,this.onFontLoaded,[bitmapFont]));
    }
    onFontLoaded(bitmapFont: BitmapFont): void {
        bitmapFont.setSpaceWidth(10);
        Text.registerBitmapFont("test"/*this.fontName*/, bitmapFont)

    }
}