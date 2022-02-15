/*
 * @Date: 2022-02-14 21:12:46
 * @LastEditors: Darth_Eternalfaith
 * @LastEditTime: 2022-02-15 21:22:27
 * @FilePath: \def-web\js\visual\Editor\js\Editor.js
 */
import { Delegate } from "../../../basics/Basics.js";
import { stopPE } from "../../../basics/dom_tool.js";
import {
    DEF_VirtualElementList as VEL,
    ExCtrl
} from "../../../ControlLib/CtrlLib.js"
import { Matrix2x2T, Polygon, Rect_Data, Sector_Data } from "../../Math2d.js";
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
    constructor(data){
        super(data);
    }
}
CtrlBox.prototype.bluePrint=getVEL_thenDeleteElement("template_ctrlBox");

class Ctrl_Matrix2x2T extends ExCtrl{
    constructor(data){
        super(data);
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
    constructor(data){
        super();
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
    ctrlBox = new CtrlBox();
    toolBox.addend(document.getElementById("toolBox-box"));
    ctrlBox.addend(document.getElementById("ctrlBox-box"));


    var canvas = document.getElementById("canvas");
    var ctx=canvas.getContext("2d");
    var renderer=new Canvas2D_TGT_Renderer();
    
    
}

main();