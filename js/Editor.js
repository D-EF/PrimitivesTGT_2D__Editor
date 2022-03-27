/*
 * @Date: 2022-02-14 21:12:46
 * @LastEditors: Darth_Eternalfaith
 * @LastEditTime: 2022-03-28 01:50:36
 * @FilePath: \def-web\js\visual\Editor\js\Editor.js
 */
import { Delegate } from "../../../basics/Basics.js";
import { stopPE } from "../../../basics/dom_tool.js";
import { deg } from "../../../basics/math_ex.js";
import {
    DEF_VirtualElementList as VEL,
    ExCtrl
} from "../../../ControlLib/CtrlLib.js"
import { Bezier_Polygon, Math2D,Matrix2x2, Matrix2x2T, Polygon, Data_Rect, Data_Sector, Vector2, Data_Arc, Data_Arc__Ellipse } from "../../Math2d.js";
import { Material, PrimitiveTGT__Arc, PrimitiveTGT__Bezier, PrimitiveTGT__Rect, PrimitiveTGT__Group, PrimitiveTGT__Polygon, PrimitiveTGT__Path } from "../../PrimitivesTGT_2D.js";
import { Canvas2d__Material, Renderer_PrimitiveTGT__Canvas2D, CtrlCanvas2d } from "../../PrimitivesTGT_2D_CanvasRenderingContext2D.js";
import { AnimationCtrl } from "../../visual.js";


// 阻止关闭页面
function addOnBeforeUnload(e) {
	var ev = e || event;
	// ev && (ev.returnValue = '浏览器不会保存你的内容, 你确定要离开?');
}
 
if(window.attachEvent){
	window.attachEvent('onbeforeunload', addOnBeforeUnload);
} else {
	window.addEventListener('beforeunload', addOnBeforeUnload, false);
}

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

/**
 * @param {Matrix2x2T} m 
 * @returns {String}
 */
function matrixToCSS(m){
    return "matrix("+
    [
        m.a,
        m.b,
        m.c,
        m.d,
        m.e,
        m.f,
    ].join(',')
    +")"
}

class Canvas_Main extends ExCtrl{
    constructor(data){
        super(data);
        this._view_martix=new Matrix2x2T();
        this._view_to_canvas_martix=null;
        this.canvas=document.createElement("canvas");
        this.canvas.className="canvas";
        this.canvas.width   =500;
        this.canvas.height  =500;
        this.viewCtrl_100Center();
        // <canvas ctrl-id="canvas" class="canvas" width="500" height="500"></canvas>
        this.addCtrlAction("callback",function(){
            this.elements["canvas_main"].appendChild(this.canvas)
        });
    }
    /** 最大化填充view并居中画布
     */
    viewCtrl_maxCenter(){
        this.canvas.style.transform=matrixToCSS(this._view_martix);
    }
    /** 线性变换并平移至居中位置
     */
    viewCtrl_100Center(){
        this.view_martix=new Matrix2x2T(1,0,0,1,this.canvas.width*-0.5,this.canvas.height*-0.5);
    }
    /**@type {Matrix2x2T} */
    set view_martix(m){
        this._view_martix.set_Matrix2x2(m);
        this._view_to_canvas_martix=null;
        this.canvas.style.transform=matrixToCSS(this._view_martix);
        return this._view_martix;
    }
    get view_martix(){
        return this._view_martix;
    }
    get view_to_canvas_martix(){
        if(!this._view_to_canvas_martix){
            this._view_to_canvas_martix=this._view_martix.copy().create_inverse();
            var tv=Vector2.linearMapping_base(new Vector2(-this.view_martix.e,-this.view_martix.f),this._view_martix);
            this._view_to_canvas_martix.set_translate(tv.x,tv.y);
        }
        return this._view_to_canvas_martix
    }
    /** view 的坐标 转换成 canvas 的坐标
     * @param {Number} x 坐标值
     * @param {Number} y 坐标值
     * @returns {Vector2} 返回相对坐标
     */
    transform_canvasViewToCanvas(x,y){
        var _x=x-this.canvas.offsetLeft,
            _y=y-this.canvas.offsetTop;
        return new Vector2(_x,_y).linearMapping(this.view_to_canvas_martix,true,true);
    }

    /** 使用事件对象创建相对于canvas的点
     * @param {MouseEvent} e 
     * @returns {Vector2} 
     */
    create_canvasPoint(e){
        if(e.target===this.canvas){
            return new Vector2(e.offsetX,e.offsetY);
        }
        return this.transform_canvasViewToCanvas(e.offsetX,e.offsetY);
    }
    /** 
     * @param {MouseEvent} e 
     */
    mousedownHand__canvas_main(e){
        var c_point=this.create_canvasPoint(e);
        console.log(c_point);

    }
    /** 
     * @param {MouseEvent} e 
     */
    mouseupHand__canvas_main(e){
        var c_point=this.transform_canvasViewToCanvas(e.offsetX,e.offsetY);
        
    }
    /**
     * @param {WheelEvent} e 
     */
    wheelHand__canvas_main(e){
        if(e.deltaY>0){
            // 缩小
        }else{
            // 放大
        }
        this.view_martix=Matrix2x2.create.rotate(45*deg);
        var c_point=this.create_canvasPoint(e);
        console.log(c_point);
    }

    toolbox_init(){
        return {list:[
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
            {
                name:"path",
                u:5,
                v:5,
            },
        ]}
    }
    ctrlbox_init(){
        return [{},this.canvas];
    }
}
Canvas_Main.prototype.bluePrint=getVEL_thenDeleteElement("temolate_main");

class CtrlBox extends ExCtrl{
    /**
     * @param {*} data 
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(data,canvas){
        super(data);
        this.canvas=canvas;
        this.ctx=canvas.getContext("2d");
        this.canvas_renderer=new Renderer_PrimitiveTGT__Canvas2D([],this.ctx);
        this.rootGroup=new PrimitiveTGT__Group();
        this.canvas_renderer.add(this.rootGroup);
    }
    renderTGT_Assets(){
        this.callChild("_tgtAssets",
        /** @param {Ctrl_tgtAssets} that */
        function(that){
            that.reRender();
        })
    }
    /** 渲染 图元内容 到画布上
     */
    renderCanvas(){
        this.canvas_renderer.render_all();
    }
    /**更改对象隐藏
     * @param {*} path 
     */
    change_editTGT_visibility(path){

    }
    ctrl_tgtAssets_dataFnc(){
        return {
            rootGroup:this.rootGroup
        };
    }
    /** 用当前焦点对象刷新 matrix
     */
    reRender_matrix(){
        if(this.focused_tgt){
            this.callChild("")
        }
    }
}
CtrlBox.prototype.bluePrint=getVEL_thenDeleteElement("template_ctrlBox");

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

class Ctrl_Matrix2x2T extends ExCtrl{
    constructor(data){
        super(data);
        /**@type {Matrix2x2T} */
        this.data;
        /**@type {String} 上一个被控制的input的ctrl_id */
        this.lastF_ctrlid;
        /**@type {Delegate} 重写矩阵时的委托 会获得参数 m (矩阵) */
        this.reset_D=Delegate.create();
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
            this.lastF_ctrlid=tgt.ctrl_id;
            tgt.focus();
            tgt.select();
        }
    }
    /**使矩阵标准化
     */
    normalize(){
        // this.editing_matrix.normalize();
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
     * @param {{rootGroup:PrimitiveTGT__Group}} data 
     */
    constructor(data){
        super(data);
        /** @type {{ctx:CanvasRenderingContext2D}} */
        this.data;
        console.log(data);
        this.renderer=new Renderer_PrimitiveTGT__Canvas2D(this.data.ctx);
        /**@type {PrimitiveTGT__Group} 图元根路径 */
        this.rootGroup=data.rootGroup;
        /**@type {PrimitiveTGT__Group[]} 遍历渲染时当前项的路径 */
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
        if(!this.rootGroup.data.length){
            this.depth=-1;
        }
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
        if(d<0){
            this.depth=d;
            return;
        }
        gg[d]=this.getParent(d).data[gi[d]];
        do{
            if(gg[d]!=undefined){
                od=d;
                this.depth=od;
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
                this.t_depth=d;
                return;
            }
        }while(0);
        do{
            --d;
            ++gi[d];
        }while(d>=0&&((gg[d]=this.getParent(d).data[gi[d]])===undefined));
        // this.depth=od;
        this.t_depth=d;
    }
    /**重新定向操作对象
     * @param {Array<Number,String>} path root 对象的子 的 下标形式的路径
     * @param {Number} index 渲染到控件中时的下标
     */
    redirect_editTGT(path,index){
        var ctrl_id="isEditingBtn-EX_for-tgt_list-C"+index;
        console.log(ctrl_id);
        if(this.old_id!==ctrl_id){
            this.elements[ctrl_id].classList.add("ctrlBox-tgtAssets-isEditingBtn-editing");
            this.elements[this.old_id]&&this.elements[this.old_id].classList.remove("ctrlBox-tgtAssets-isEditingBtn-editing");
            this.old_id=ctrl_id;
        }

    }
    /**隐藏对象 (不渲染)
     * @param {路径} path 
     */
    change_editTGT_visibility(path){
        this.callParent(
        /**
         * @this {CtrlBox} 
         */
        function(){
            this.change_editTGT_visibility(path);
        })

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
        if(Number(element.className.indexOf("ctrlBox-tgtAssets-visibility")!==-1)){
            temp=element.parentElement;
            var iconElement=element.firstElementChild;
            if(iconElement.className==="iconSpritesSvg iconSpritesSvg-40"){
                iconElement.className="iconSpritesSvg iconSpritesSvg-30"
                return this.change_editTGT_visibility(temp.getAttribute("path").split(","),temp.getAttribute("index"),false);
            }else{
                iconElement.className="iconSpritesSvg iconSpritesSvg-40"
                return this.change_editTGT_visibility(temp.getAttribute("path").split(","),temp.getAttribute("index"),true);
            }
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

Canvas_Main.prototype.childCtrlType={
    ToolBox,
    CtrlBox
}
function main(){
    var canvasMain=new Canvas_Main();
    canvasMain.addend(document.body);
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