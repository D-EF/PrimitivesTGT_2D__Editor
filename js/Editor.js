/*
 * @Date: 2022-02-14 21:12:46
 * @LastEditors: Darth_Eternalfaith
 * @LastEditTime: 2022-02-16 21:40:34
 * @FilePath: \def-web\js\visual\Editor\js\Editor.js
 */
import { Delegate } from "../../../basics/Basics.js";
import { stopPE } from "../../../basics/dom_tool.js";
import {
    DEF_VirtualElementList as VEL,
    ExCtrl
} from "../../../ControlLib/CtrlLib.js"
import { Matrix2x2T, Polygon, Rect_Data, Sector_Data } from "../../Math2d.js";
import { PrimitiveRectTGT, PrimitiveTGT_Group } from "../../PrimitivesTGT_2D.js";
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
    ctrl_tgtAssets_dataFnc(){
        // todo
        this.rootGroup.addChildren(new PrimitiveTGT_Group());
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
        /**@type {PrimitiveTGT_Group[]} 遍历渲染时当前项的路径 */
        this.gg=[data.rootGroup];
        /**@type {Number[]} 遍历渲染时当前项的路径(下标形式) */
        this.gi=[0];
        this.depth=0;
    }
    resetWalker(){
        this.depth=0 , this.gi.length=1 , this.gi[0]=0 , this.gg.length=1;
    }
    regress(){
        this.depth=-1;
        debugger;
        return;
        console.log(this.depth);
        this.gg[this.depth]=this.gg[this.depth-1].data[++this.gi[this.depth]];
        if(this.gg[this.depth]){
            if(this.gg[this.depth].dataType==="Group"){
                ++this.depth;
            }
            return;
        }
        do{
            this.gi[this.depth]=0;
            --this.depth;
        }while(!this.gg[this.depth].data[++this.gi[this.depth]]);
    }
    /**
     * 折叠操作的函数
     * @param {HTMLLIElement} element 
     */
    folded(e,tgt){

    }
    /**
     * 刷新列表折叠
     */
    re_folded_css(){
        /*ctrlBox-tgtAssets-item-depth(d):nth-of-type(index)~li:not(ctrlBox-tgtAssets-item-depth(d):nth-of-type(index+1)~li)*/
        var folded_CSS_Selects=[],
            unhidden_CSS_Selects=[];
        
        this.folded_CSS_Select=folded_CSS_Selects.join();
        this.unhidden_CSS_Selects=unhidden_CSS_Selects.join();
        this.renderStyle();
    }
    
}
Ctrl_tgtAssets.prototype.bluePrint=getVEL_thenDeleteElement("template_ctrl_tgtAssets");

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