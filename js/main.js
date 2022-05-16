/*
 * @Date: 2022-04-25 14:52:40
 * @LastEditors: Darth_Eternalfaith
 * @LastEditTime: 2022-05-16 15:08:47
 * @FilePath: \PrimitivesTGT-2D_Editor\js\main.js
 */
import {Canvas_Main} from "./components/Canvas_Main.js"
import { ImgList } from "./import/CtrlLib__EXDEF_LIB/ImgList.js";
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
// Viewport_Frame.prototype.childCtrlType.null=ImgList;
// Viewport_Frame.prototype.null_Init=function(){
// 	return {
// 		"list":[
// 			{
// 				"title":"asd1",
// 				"imgurl":"/css/DEF_UI/img/iconSprites.svg",
// 				"url":"#"
// 			},
// 			{
// 				"title":"asd2",
// 				"imgurl":"/css/DEF_UI/img/iconSprites.svg",
// 				"url":"#"
// 			},
// 			{
// 				"title":"asd3",
// 				"imgurl":"/css/DEF_UI/img/iconSprites.svg",
// 				"url":"#"
// 			},
// 			{
// 				"title":"asd4",
// 				"imgurl":"/css/DEF_UI/img/iconSprites.svg",
// 				"url":"#"
// 			}
// 		]
// 	}
// };
canvasMain.addend(document.body);

window.cnmd=canvasMain.child_ctrl.toolBox;