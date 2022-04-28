/*
 * @Date: 2022-04-26 10:10:01
 * @LastEditors: Darth_Eternalfaith
 * @LastEditTime: 2022-04-26 10:20:07
 * @FilePath: \def-web\js\visual\Editor\js\components\ToolBox.js
 */

import { dependencyMapping, Iterator__Tree } from ".././import/basics/Basics.js";
import { ExCtrl } from "../import/CtrlLib/CtrlLib.js";
import { getVEL_ThenDeleteElement, hotkey } from "../Global.js";


class ToolBox extends ExCtrl {
    constructor(data){
        super(data);
        /**@type {Tool_Node} */
        this.data.list;
        dependencyMapping(this.data,hotkey,["list"],["tool_list"]);
        this.list_iterator=new Iterator__Tree(this.data.list,"child");
        /**@type {Tool_Node} */
        this._now_tool;
        this._now_tool_path;
        this.eg=[];
        this.folded_open_CSS_select=".cnm";
    }
    /** 切换工具
     * @param {Tool_Node} tool 
     */
    tab_Tool(tool,path){
        // todo
        this._now_tool=tool;
    }
    /** 让 item 和祖先和儿子出现
     * @param {HTMLElement} tgt 
     */
    showHand(tgt){
        var temp=tgt,
            foldedClassList=[],
            f=new Array();
        for(var i=tgt.depth;i>=0;--i){
            f[i]=true;
        }
        do{
            if(f[temp.depth]){
                foldedClassList.push(".toolBox-item:nth-child(n+"+temp.di+')'+
                    ".toolBox-item:nth-child(-n+"+(temp.next_same_depth_Di||999)+')'+
                    ".toolBox-item-d"+(temp.depth+1));
                f[temp.depth]=false;
            }
            temp=temp.previousElementSibling;
        }while(f[0]);
        
        this.folded_open_CSS_select=foldedClassList.join(",.CtrlLib-"+this.c__ctrl_lib_id+' ');
        this.renderStyle();
    }
    hiddenHand(){
        this.folded_open_CSS_select="cnm";
        this.renderStyle();
    }
    get folded_CSS_select(){
        if(!this._folded_CSS_select){
            var i,
                folded=[];
            for(i=this._maxDepth;i>0;--i){
                folded.push(".toolBox-item-d"+i);
            }
            this._folded_CSS_select=folded.join(",.CtrlLib-"+this.c__ctrl_lib_id+' ');
        }
        return this._folded_CSS_select;
    }
    get maxDepth(){
        return this._maxDepth;
    }
    set maxDepth(val){
        this._maxDepth=val;
        this._folded_CSS_select="";
    }
}
ToolBox.prototype.bluePrint=getVEL_ThenDeleteElement("template_toolBox");


export {
    ToolBox
}