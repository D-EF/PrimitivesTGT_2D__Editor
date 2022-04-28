/*
 * @Date: 2022-04-25 16:16:28
 * @LastEditors: Darth_Eternalfaith
 * @LastEditTime: 2022-04-26 10:19:14
 * @FilePath: \def-web\js\visual\Editor\js\components\CtrlBox.js
 */

import { ExCtrl } from "../import/CtrlLib/CtrlLib.js";
import { getVEL_ThenDeleteElement } from "../Global.js";
import { Ctrl_tgtAssets } from "./TGTAssets.js";
class CtrlBox extends ExCtrl{
    /**
     * @param {CtrlBox_Data} data 
     */
    constructor(data){     
        super(data);
    }
    renderTGT_Assets(){
        this.callChild("_tgtAssets",
        /** @param {Ctrl_tgtAssets} that */
        function(that){
            that.reRender();
        })
    }
    tgtAssets_Init(){
    }
}
CtrlBox.prototype.bluePrint=getVEL_ThenDeleteElement("template_ctrlBox");

CtrlBox.prototype.childCtrlType={
    Ctrl_tgtAssets:Ctrl_tgtAssets
}
export{
    CtrlBox
}