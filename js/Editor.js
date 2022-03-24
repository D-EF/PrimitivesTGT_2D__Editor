/*
 * @Date: 2022-02-14 21:12:46
 * @LastEditors: Darth_Eternalfaith
 * @LastEditTime: 2022-03-24 21:15:53
 * @FilePath: \def-web\js\visual\Editor\js\Editor.js
 */
import { Delegate } from "../../../basics/Basics.js";
import { stopPE } from "../../../basics/dom_tool.js";
import { deg } from "../../../basics/math_ex.js";
import {
    DEF_VirtualElementList as VEL,
    ExCtrl
} from "../../../ControlLib/CtrlLib.js"
import { Bezier_Polygon, Math2D, Matrix2x2T, Polygon, Data_Rect, Data_Sector, Vector2, Data_Arc, Data_Arc__Ellipse } from "../../Math2d.js";
import { Material, PrimitiveTGT__Arc, PrimitiveTGT__Bezier, PrimitiveTGT__Rect, PrimitiveTGT__Group, PrimitiveTGT__Polygon, PrimitiveTGT__Path } from "../../PrimitivesTGT_2D.js";
import { Canvas2d__Material, Renderer_PrimitiveTGT__Canvas2D, CtrlCanvas2d } from "../../PrimitivesTGT_2D_CanvasRenderingContext2D.js";
import { AnimationCtrl } from "../../visual.js";


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


class Canvas_Main extends ExCtrl{
    constructor(data){
        super(data);
        this.canvas=document.createElement("canvas");
        this.canvas.className="canvas";
        this.canvas.width   =500;
        this.canvas.height  =500;
        // <canvas ctrl-id="canvas" class="canvas" width="500" height="500"></canvas>
        this.addCtrlAction("callback",function(){
            this.elements["canvas_main"].appendChild(this.canvas)
        });

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
        ]}
    }
    ctrlbox_init(){
        return [{},this.canvas];
    }
}
Canvas_Main.prototype.bluePrint=getVEL_thenDeleteElement("temolate_main");

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
        this.canvas_renderer=new Renderer_PrimitiveTGT__Canvas2D([],this.ctx);
        this.rootGroup=new PrimitiveTGT__Group();
        this.canvas_renderer.add(this.rootGroup);
        // test open
        
        // var etemp=new PrimitiveTGT__Path("M10 80 Q 52.5 10, 95 80 T 180 80");
        var etemp=new PrimitiveTGT__Path("M10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80 q 25 -80, 80 0 t 80 0 l 40 180 a 300 200 30 0 1 -320 -40z");
        // var etemp=new PrimitiveTGT__Path("M150 150 a 90 180 60 0 0 120 120z");
        console.log(window.temparc=etemp.data.get_mathData(etemp.data.command_length-2));
        // var etemp=new PrimitiveTGT__Path("");
        etemp.fill_Material=new Canvas2d__Material("#0000");
        this.rootGroup.addChildren(etemp);
        
        // var arc=new Data_Arc__Ellipse(100,100,40,80,0,999*deg);
        /**
         * @type {Data_Arc__Ellipse}
         */
        // var arc=Data_Arc__Ellipse.create_byEndPointRadiusRotate(
        //     {x:0,y:0},
        //     {x:100,y:100},
        //     100,200,60*deg,0,0
        //     );
        var arc=window.temparc;
        console.log(arc.bezier_curve_proxy);
        var ctx=this.ctx,
            that=this;
        var ani=new AnimationCtrl(
            function (t){
                ctx.clearRect(0,0,1000,1000);
                that.renderCanvas();
                CtrlCanvas2d.dot(that.ctx,etemp.data.sample(t));
                CtrlCanvas2d.dot(that.ctx,etemp.data.sample(t).sum(etemp.data.get_normal(t).np(20)));
            }
        )
        ani.start(3000);
        
        // var eetemp=new PrimitiveTGT__Bezier(arc.bezier_curve_proxy);
        // this.rootGroup.addChildren(eetemp);
        
        this.renderCanvas();
        // arc.endAngle=18;

        canvas.onclick=function(e){
            console.log(etemp.is_inside(e.offsetX,e.offsetY));
            console.log(arc.bezier_curve_proxy);
            console.log(e.offsetX,e.offsetY);
        }
        
        arc.refresh_cache();
        var temp=arc.bezier_curve_proxy;
        
        this.ctx.rect(etemp.data.get_min().x,etemp.data.get_min().y,
            etemp.data.get_max().x-etemp.data.get_min().x,
            etemp.data.get_max().y-etemp.data.get_min().y);
        this.ctx.stroke();
        
        for(var i=temp.length-1;i>=0;--i){
            CtrlCanvas2d.bezier3(this.ctx,temp[i]);
        }
        // CtrlCanvas2d.arc(this.ctx,arc)
        // CtrlCanvas2d.dot(this.ctx,etemp.data.sample(0.1));
        // CtrlCanvas2d.dot(this.ctx,etemp.data.sample(0.2));
        // CtrlCanvas2d.dot(this.ctx,etemp.data.sample(0.3));
        // CtrlCanvas2d.dot(this.ctx,etemp.data.sample(0.4));
        // CtrlCanvas2d.dot(this.ctx,etemp.data.sample(0.5));
        // CtrlCanvas2d.dot(this.ctx,etemp.data.sample(0.6));
        // CtrlCanvas2d.dot(this.ctx,etemp.data.sample(0.7));
        // CtrlCanvas2d.dot(this.ctx,etemp.data.sample(0.8));
        // CtrlCanvas2d.dot(this.ctx,etemp.data.sample(0.9));
        // CtrlCanvas2d.dot(this.ctx,etemp.data.sample(1.0));


        // test end
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