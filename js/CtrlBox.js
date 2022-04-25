/*
 * @Date: 2022-04-25 16:16:28
 * @LastEditors: Darth_Eternalfaith
 * @LastEditTime: 2022-04-25 17:49:29
 * @FilePath: \def-web\js\visual\Editor\js\CtrlBox.js
 */

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
