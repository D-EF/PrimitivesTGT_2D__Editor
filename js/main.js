/*
 * @Date: 2022-04-25 14:52:40
 * @LastEditors: Darth_Eternalfaith
 * @LastEditTime: 2022-05-05 15:16:40
 * @FilePath: \Editor\PrimitivesTGT-2D_Editor\js\main.js
 */
import {Canvas_Main} from "./components/Canvas_Main.js"
import { Viewport_Frame } from "./import/CtrlLib__EXDEF_LIB/Viewport_Frame.js";

// 阻止关闭页面
function addOnBeforeUnload(e){
	var ev = e || event;
	// ev && (ev.returnValue = '浏览器不会保存你的内容, 你确定要离开?');
}
if(window.attachEvent){
	window.attachEvent('onbeforeunload', addOnBeforeUnload);
} else {
	window.addEventListener('beforeunload', addOnBeforeUnload, false);
}

var canvasMain=new Viewport_Frame();
canvasMain.addend(document.body);

window.cnmd=canvasMain.child_ctrl.toolBox;