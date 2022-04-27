/*
 * @Date: 2022-04-26 10:11:42
 * @LastEditors: Darth_Eternalfaith
 * @LastEditTime: 2022-04-26 10:21:04
 * @FilePath: \def-web\js\visual\Editor\js\components\ContextMenu.js
 */

import { add_DependencyListener } from "../../../../basics/Basics.js";
import { ExCtrl } from "../CtrlLib/CtrlLib.js";
import { getVEL_ThenDeleteElement } from "../Global.js";

/**
 * @typedef ctrl_menu_node
 * @property {String} text 当前的菜单显示文本
 * @property {ctrl_menu_node[]} child 子菜单
 */
/**
 * @typedef ContextMenuData
 * @property {String} ctrl_menu_type 当前的菜单type
 * @property {ctrl_menu_node} ctrl_menu_data 当前的菜单type
 */
// todo
class ContextMenu extends ExCtrl{
    constructor(data){
        super(data);
        /**@type {ContextMenuData} */
        this.data;
    }
    // 逻辑动作 open
        /**通过路径执行动作
         * @param {Number[]} parh 路径
         */
        do_byPath(parh){
            
        }
    // 逻辑动作end

    // 控件动作 open
        callback(){
            var that=this;
            add_DependencyListener(this.data,"ctrl_menu_type",function(){
                document.addEventListener("click",function(){
                    that.hiddend
                })
            });
        }
        hidden(){
            this.parent_node.style.display="none";
        }
        show(){
            this.parent_node.style.display="block";
        }
        /**
         * @param {PointerEvent} e 
         */
        clickHand(e){
            this.path=e.target.path;
            this.do_byPath(path);
        }
        /**
         * @param {MouseEvent} e 
         */
        mouseoverHand(e){
            this.path=e.target.path;
        }
    // 控件动作end
}
ContextMenu.prototype.bluePrint=getVEL_ThenDeleteElement("template_contextMenu");

export{
    ContextMenu
}