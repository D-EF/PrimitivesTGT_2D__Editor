/*
 * @Date: 2022-02-14 21:12:46
 * @LastEditors: Darth_Eternalfaith
 * @LastEditTime: 2022-02-18 17:57:21
 * @FilePath: \def-web\js\visual\Editor\js\Editor.js
 */
import { Delegate } from "../../../basics/Basics.js";
import { stopPE } from "../../../basics/dom_tool.js";
import {
    DEF_VirtualElementList as VEL,
    ExCtrl
} from "../../../ControlLib/CtrlLib.js"
import { Matrix2x2T, Polygon, Rect_Data, Sector_Data } from "../../Math2d.js";
import { PrimitiveArcTGT, PrimitiveRectTGT, PrimitiveTGT_Group } from "../../PrimitivesTGT_2D.js";
import { Canvas2D_TGT_Renderer } from "../../PrimitivesTGT_2D_CanvasRenderingContext2D.js";

/**
 * 获取
 * @param {String} id 在dom中的id
 */
function getVEL_thenDeleteElement(id){
    var tgt=document.getElementById(id),
        rtn= VEL.xmlToVE(tgt.innerHTML);
    tgt.remove();
    return rtn;
}

class ToolBox extends ExCtrl {
    constructor(data){
        super(data);
        this.actIndex=0;
    }
    tabTool(i){
        this.actIndex=i;
        this.renderStyle();
    }
    
}
ToolBox.prototype.bluePrint=getVEL_thenDeleteElement("template_toolBox");

class CtrlBox extends ExCtrl{
    /**
     * 
     * @param {*} data 
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(data,canvas){
        super(data);
        this.canvas=canvas;
        this.ctx=canvas.getContext("2d");
        this.rootGroup=new PrimitiveTGT_Group();
    }
    /**
     * 
     * @param {*} path 
     */
    hidden_tgt(path){

    }
    ctrl_tgtAssets_dataFnc(){
        // todo 初始化对象
        this.rootGroup.addChildren(new PrimitiveTGT_Group());
        this.rootGroup.data[0].addChildren(new PrimitiveTGT_Group());
        this.rootGroup.data[0].addChildren(new PrimitiveTGT_Group());
        this.rootGroup.addChildren(new PrimitiveTGT_Group());
        this.rootGroup.data[1].addChildren(new PrimitiveTGT_Group());
        this.rootGroup.data[1].addChildren(new PrimitiveTGT_Group());
        this.rootGroup.data[1].data[1].addChildren(new PrimitiveTGT_Group());
        this.rootGroup.addChildren(new PrimitiveTGT_Group());
        this.rootGroup.data[2].addChildren(new PrimitiveRectTGT(0,0,100,100));
        return {
            rootGroup:this.rootGroup
        };
    }
}
CtrlBox.prototype.bluePrint=getVEL_thenDeleteElement("template_ctrlBox");

class Ctrl_Matrix2x2T extends ExCtrl{
    constructor(data){
        super(data);
        /**@type {{list:{name:String,u:Number,v:Number}[]}} */
        this.data;
        /**@type {String} 上一个被控制的input的ctrlID */
        this.lastF_ctrlid;
        /**@type {Delegate} 重写矩阵时的委托 会获得参数 m (矩阵) */
        this.reset_D=Delegate.ctrate();
        /**@type {Matrix2x2T} 编辑中的矩阵*/
        this.editing_matrix=new Matrix2x2T();
        this.reload(this.editing_matrix);
        
    }
    callback(){
        this.render_editing_matrix();
    }
    /**
     * 将矩阵渲染到input
     */
    render_editing_matrix(){
        this.elements.a.value   =this.editing_matrix.a;
        this.elements.b.value   =this.editing_matrix.b;
        this.elements.c.value   =this.editing_matrix.c;
        this.elements.d.value   =this.editing_matrix.d;
        this.elements.e.value   =this.editing_matrix.e;
        this.elements.f.value   =this.editing_matrix.f;
    }
    /**
     * 重新读取矩阵
     * @param {Matrix2x2T} m 传入矩阵
     */
    reload(m){
        this.editing_matrix.a=m.a;
        this.editing_matrix.b=m.b;
        this.editing_matrix.c=m.c;
        this.editing_matrix.d=m.d;
        this.editing_matrix.e=m.e;
        this.editing_matrix.f=m.f;
    }
    /**
     * 改动矩阵数据
     * @param {String} key Matrix2x2T 的属性的key
     */
    changeM(key,value){
        var temp=Number(value);
        if(!isNaN(temp)){
            this.editing_matrix[key]=this.elements[key].value=value;
        }else{
            this.elements[key].value=this.editing_matrix[key];
        }
    }
    /**
     * 写入矩阵 将会使用 reset_D
     */
    reset(){
        this.reset_D(m);
    }
    /**
     * 鼠标移入时 聚焦并选择input
     * @param {Element} tgt e.target
     */
    focus_input(tgt){
        if(tgt.tagName==="INPUT"){
            this.lastF_ctrlid=tgt.ctrlID;
            tgt.focus();
            tgt.select();
        }
    }
    /**使矩阵标准化
     */
    normalize(){
        this.editing_matrix.normalize();
        this.render_editing_matrix();
    }
    /**让input失去焦点
     */
    blur(){
        if(this.lastF_ctrlid){
            this.elements[this.lastF_ctrlid].blur();
            var k=Number(this.elements[this.lastF_ctrlid].value);
            if(isNaN(k)){
                this.elements[this.lastF_ctrlid].value=this.editing_matrix[this.lastF_ctrlid];
            }
            this.lastF_ctrlid="";
        }
    }
    /**鼠标滚轮操作矩阵的属性
     * @param {WheelEvent} e 
     */
    wheel(e){
        stopPE(e);
        if(this.lastF_ctrlid){
            var k=(e.deltaY<0?1:-1)*(e.ctrlKey?0.1:1)*(e.shiftKey?0.1:1)*(e.altKey?0.1:1);
            k+=Number(this.elements[this.lastF_ctrlid].value);
            
            this.changeM(this.lastF_ctrlid,k);
        }
    }
}
Ctrl_Matrix2x2T.prototype.bluePrint=getVEL_thenDeleteElement("template_ctrl_Matrix2x2T");

class Ctrl_tgtAssets extends ExCtrl{
    /**
     * 
     * @param {{rootGroup:PrimitiveTGT_Group}} data 
     */
    constructor(data){
        super(data);
        /** @type {{ctx:CanvasRenderingContext2D}} */
        this.data;
        console.log(data);
        this.renderer=new Canvas2D_TGT_Renderer(this.data.ctx);
        /**@type {PrimitiveTGT_Group} 图元根路径 */
        this.rootGroup=data.rootGroup;
        /**@type {PrimitiveTGT_Group[]} 遍历渲染时当前项的路径 */
        this.gg=[this.rootGroup.data[0]];
        /**@type {Number[]} 遍历渲染时当前项的路径(下标形式) */
        this.gi=[0];
        this.depth=0;
        this.t_depth=0;
        /**@type {Map<Number,{d:Number,ed:Number}>} 被折叠的 index : 深度  */
        this.folded_data=new Map();
    }
    resetWalker(){
        this.depth=0;
        this.t_depth=0;
        this.gi.length=1;
        this.gi[0]=0;
        this.gg.length=1;
        this.gg[0]=this.rootGroup.data[0];
        this.di=0;
        this.regress();
    }
    getParent(depth){
        return (depth?this.gg[depth-1]:this.rootGroup);
    }
    regress(){
        // debugger;
        ++this.di;
        var gg=this.gg,
        gi=this.gi,
        d=this.t_depth,
        od=this.depth;
        gg[d]=this.getParent(d).data[gi[d]];
        do{
            if(gg[d]!=undefined){
                od=d;
                if(gg[d].dataType==="Group" && gg[d].data.length){
                    console.log(gg[d].data.length)
                    ++d;
                    gi[d]=0;
                    gg[d]=this.getParent(d).data[gi[d]];
                }
                else{
                    gi[d]++;
                    if(this.getParent(d).data[gi[d]]===undefined){
                        break;
                    }
                }
                this.depth=od;
                this.t_depth=d;
                return;
            }
        }while(0);
        do{
            --d;
            ++gi[d];
        }while(d>=0&&(gg[d]===undefined));
        
        this.depth=od;
        this.t_depth=d;
    }
    
    /**重新定向操作对象
     * @param {Array<Number,String>} path root 对象的子 的 下标形式的路径
     * @param {Number} index 渲染到控件中时的下标
     */
    redirect_editTGT(path,index){
        var ctrlID="isEditingBtn-EX_for-tgt_list-C"+index;
        if(this.old_id!==ctrlID){
            this.elements[ctrlID].classList.add("ctrlBox-tgtAssets-isEditingBtn-editing");
            this.elements[this.old_id]&&this.elements[this.old_id].classList.remove("ctrlBox-tgtAssets-isEditingBtn-editing");
            this.old_id=ctrlID;
        }
    }
    redirect_editTGT(path,index){
        this.callParent(
        /**
         * @this {CtrlBox} 
         */
        function(){
            this.hidden_tgt()
        },)
    }


    /**点击事件操作手柄
     * @param {Element} element 
     */
    listClick_hand(element){
        var temp;
        if(Number(element.getAttribute("child_length"))){
            return this.fold_item(element);
        }
        if(Number(element.className.indexOf("ctrlBox-tgtAssets-isEditingBtn")!==-1)){
            temp=element.parentElement;
            return this.redirect_editTGT(temp.getAttribute("path").split(","),temp.getAttribute("index"));
        }
        if(Number(element.className.indexOf("ctrlBox-tgtAssets-want_render")!==-1)){
            temp=element.parentElement;
            return this.redirect_editTGT(temp.getAttribute("path").split(","),temp.getAttribute("index"));
        }
    }
    /**
     * 折叠操作的函数
     * @param {Element} element 
     */
    fold_item(element){
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
     * 刷新列表折叠样式
     */
    get folded_CSS_Select(){
        /*ctrlBox-tgtAssets-item-depth(d):nth-child(index)~li:not(ctrlBox-tgtAssets-item-depth(d):nth-child(index+1)~li)*/
        var folded_data=this.folded_data,
            folded_CSS_Selects=[],
            i,ed,data;
        for(data of folded_data){
            i=data[0];
            ed=data[1].ed;
            console.log(data);
            folded_CSS_Selects.unshift(',.CtrlLib-'+this.ctrlLibID+" .ctrlBox-tgtAssets-item:nth-child(n+"+(i+1)+").ctrlBox-tgtAssets-item:nth-child(-n+"+(ed)+")");
        }
        return ".cnm"+folded_CSS_Selects.join('');
    }
    
}
Ctrl_tgtAssets.prototype.bluePrint=getVEL_thenDeleteElement("template_ctrl_tgtAssets");

window.Ctrl_tgtAssets=Ctrl_tgtAssets;
CtrlBox.prototype.childCtrlType={
    Ctrl_Matrix2x2T:Ctrl_Matrix2x2T,
    Ctrl_tgtAssets:Ctrl_tgtAssets
}

function main(){
    var toolBox = new ToolBox({
        list:[
            {
                name:"cursor",
                u:5,
                v:3,
            },
            {
                name:"ract",
                u:0,
                v:5,
            },
            {
                name:"arc",
                u:1,
                v:5,
            },
            {
                name:"sector",
                u:2,
                v:5,
            },
            {
                name:"polygon",
                u:3,
                v:5,
            },
            {
                name:"bezier",
                u:4,
                v:5,
            },
        ]
    }),
    canvas = document.getElementById("canvas"),
    ctrlBox = new CtrlBox({},canvas);

    toolBox.addend(document.getElementById("toolBox-box"));
    ctrlBox.addend(document.getElementById("ctrlBox-box"));
}

main();

// // 复制图片
// onCopyImg() {
//     let dom = document.getElementsByClassName("screenLeft")[0];
//     html2canvas(dom, { useCORS: true }).then((canvasFull) => {
//       console.log(canvasFull);
//       canvasFull.toBlob((blob) => {
//         const item = new ClipboardItem({ "image/png": blob });
//         navigator.clipboard.write([item]);
//         this.$message({
//           showClose: true,
//           message: "复制成功",
//         });
//       });
//     });
//   }