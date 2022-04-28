/*
 * @Date: 2022-04-26 10:15:55
 * @LastEditors: Darth_Eternalfaith
 * @LastEditTime: 2022-04-26 12:07:03
 * @FilePath: \def-web\js\visual\Editor\js\components\TGTAssets.js
 */


import { arrayEqual, dependencyMapping, Iterator__Tree } from ".././import/basics/Basics.js";
import { ExCtrl } from "../import/CtrlLib/CtrlLib.js"
import { getVEL_ThenDeleteElement, global__primitiveTGT_editor } from "../Global.js";
class Ctrl_tgtAssets extends ExCtrl{
    /**
     * @param {CtrlBox_Data} data 
     */
    constructor(data){
        super(data);
        /** @type {CtrlBox_Data} */
        this.data;
        /**@type {PrimitiveTGT__Group} 图元根路径 */
        this.root_group;
        this.group_iterator=new Iterator__Tree(this.data.root_group,"data");
        dependencyMapping(this.data,global__primitiveTGT_editor,["root_group"]);
        dependencyMapping(this.group_iterator,this.data,["data"],["root_group"]);
        // 列表渲染使用的属性 open
            /**@type {Map<Number,{d:Number,ed:Number}>} 被折叠的 index : 深度  */
            this.folded_data=new Map();
            /** @type {String[]} 选中的项的id*/
            this.select_list=[];
            
        // 列表渲染使用的属性 end
    }
    set focus_tgt_path(val){this.data.focus_tgt_path=val;}
    get focus_tgt_path(   ){return this.data.focus_tgt_path;}
    set select_tgt_path(val){this.data.select_tgt_path=val;}
    get select_tgt_path(   ){return this.data.select_tgt_path;}
    /**重新定向操作对象
     * @param {(Number|String)[]} path root 对象的子 的 下标形式的路径
     * @param {Number} index 渲染到控件中时的下标
     * @param {Boolean} f 追加还是修改
     */
    redirect_EditTGT(_path,index,f){
        var ctrl_id="tgt_item-EX_for-tgt_list-C"+index;
        var path=_path;
        if(f){
            // 追加
            if(this.old_index===index){
                // 移除
                this.focus_tgt_path=[];
                this.select_list.remove(ctrl_id);
                this.old_index=-1;
            }else{
                if(this.select_list.indexOf(ctrl_id)===-1){
                    // 增加
                    this.select_list.unshift(ctrl_id);
                    this.focus_tgt_path=path;
                }else{
                    // 转移 focus_tgt_path
                    this.focus_tgt_path=path;
                }
                this.old_index=index;
            }
        }else{
            // 修改
            if((this.old_index===index)&&(this.select_tgt_path.length===1)){
                this.select_list.length=0;
                this.focus_tgt_path=[];
                this.old_index=-1;
            }else{
                this.select_list.length=1;
                this.select_list[0]=(ctrl_id);
                this.focus_tgt_path=path;
                this.old_index=index;
            }
        }
        this.refresh_SelectTGT();
        this.reRender();
    }
    refresh_SelectTGT(){
        // es6 排序
        var arr=Array.from(this.select_list);
        arr.sort();
        this.select_tgt_path=arr.map((item)=>{
            return this.elements[item].path;
        });
    }
    is_Focus(path){
        return arrayEqual(path,this.focus_tgt_path);
    }
    /** 路径在被选中的中在哪里
     * @param {Number[]} path 
     * @returns {Number} 返回下标+1
     */
    focusIndex(path){
        var i=this.select_tgt_path.length-1;
        for(;i>=0;--i){
            if(arrayEqual(path,this.select_tgt_path[i])){
                return i+1;
            }
        }
        return i+1;
    }
    /**隐藏对象 (不渲染)
     * @param {(Number|String)[]} path 
     */
    change_editTGT_Visibility(path){
        this.callParent(
        /**
         * @this {CtrlBox} 
         */
        function(){
            this.change_editTGT_Visibility(path);
        })
    }
    /**点击事件操作手柄
     * @param {MouseEvent} e
     */
    clickHand_Item(e){
        var element=e.target;
        var temp;
        if(Number(element.getAttribute("child_length"))){
            return this.fold_Item(element);
        }
        if(Number(element.className.indexOf("ctrlBox-tgtAssets-focusBtn")!==-1)){
            temp=element.parentElement;
            return this.redirect_EditTGT(temp.path,Number(temp.getAttribute("index")),e.shiftKey);
        }
        if(Number(element.className.indexOf("ctrlBox-tgtAssets-visibility")!==-1)){
            temp=element.parentElement;
            var iconElement=element.firstElementChild;
            if(iconElement.className==="iconSpritesSvg iconSpritesSvg-40"){
                iconElement.className="iconSpritesSvg iconSpritesSvg-30"
                return this.change_editTGT_Visibility(temp.path,Number(temp.getAttribute("index")),false);
            }else{
                iconElement.className="iconSpritesSvg iconSpritesSvg-40"
                return this.change_editTGT_Visibility(temp.path,Number(temp.getAttribute("index")),true);
            }
        }
    }
    /**
     * 折叠操作的函数
     * @param {Element} element 
     */
    fold_Item(element){
        var i=Number(element.getAttribute("index")),
            d,ed,temp_element=element;
        if(this.folded_data.has(i)){
            this.folded_data.delete(i);
        }else{
            ed=i;
            d=Number(element.getAttribute("depth"));

            while((temp_element=temp_element.nextElementSibling)&&Number(temp_element.getAttribute("depth"))>d){
                ++ed;
            }
            this.folded_data.set(i,{d:d,ed:ed});
            
        }
        this.renderStyle();
    }
    /**
     * 列表折叠样式
     */
    get folded_CSS_select(){
        /*ctrlBox-tgtAssets-item-depth(d):nth-child(index)~li:not(ctrlBox-tgtAssets-item-depth(d):nth-child(index+1)~li)*/
        var folded_data=this.folded_data,
            folded_CSS_selects=[],
            i,ed,data;
        for(data of folded_data){
            i=data[0];
            ed=data[1].ed;
            folded_CSS_selects.unshift(
                ',.CtrlLib-'+this.c__ctrl_lib_id+" .ctrlBox-tgtAssets-item:nth-child(n+"+(i+1)+").ctrlBox-tgtAssets-item:nth-child(-n+"+(ed)+")"
            );
        }
        return ".cnm"+folded_CSS_selects.join('');
    }
}
Ctrl_tgtAssets.prototype.bluePrint=getVEL_ThenDeleteElement("template_ctrl_tgtAssets");

export{
    Ctrl_tgtAssets
}