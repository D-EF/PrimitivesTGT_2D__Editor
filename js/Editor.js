/*
 * @Date: 2022-02-14 21:12:46
 * @LastEditors: Darth_Eternalfaith
 * @LastEditTime: 2022-03-28 21:50:24
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
        this.canvas=document.createElement("canvas");
        this.canvas.className="canvas";
        this.canvas_width   =500;
        this.canvas_height  =500;
        this.ctx=this.canvas.getContext("2d");
        /** @type {Data_Rect} */
        this._canvasBox=null;
        /** @type {Data_Rect} */
        this.view_box=null;

        // view
        /** @type {Vector2} 焦点坐标 */
        this._focus_Point=new Vector2(0.5*this.canvas_width,0.5*this.canvas_height);
        /** @type {Number} 缩放值 */
        this.scale=1;
        /** @type {Number} 旋转值*/
        this.rotate=0;
        /** @type {Matrix2x2T} 增量变换矩阵 */
        this.third_matrix=new Matrix2x2T;
        /** @type {Boolean} 是否可以在视口中完全呈现所有内容 */
        this._can_inside=true;
        /** @type {Boolean} 是否常驻可移动视图  */
        this.can_move_view=false;
        /** @type {Matrix2x2T} 画布to视口变换矩阵 */
        this._view_martix=new Matrix2x2T();
        /** @type {Matrix2x2T} 视口to画布变换矩阵 */
        this._view_to_canvas_martix=null;

        // tool
        /** @type {Number} 当前工具的 index */
        this.tool_index=0;
        /** @type {{name:String,u:Number,v:Number}[]} 工具列表 */
        this.tool_list=[
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
        ]

        // tgts
        this.root_group=new PrimitiveTGT__Group();
        this.canvas_renderer=new Renderer_PrimitiveTGT__Canvas2D([this.root_group],this.ctx);
    }
    callback(){
        this.elements["canvas_main"].appendChild(this.canvas);
        this.view_box=new Data_Rect(0,0,this.elements.canvas_main.offsetWidth,this.elements.canvas_main.offsetHeight);
        this.viewCtrl_100Center();
        document.addEventListener("mouseup",function(e){
            document._view_isMouseing=false;
            document.removeEventListener("mousemove",document._view_onmousemove);
            document.removeEventListener("mouseup",document._view_onmouseup);
        });
    }
    refresh_viewBox(e){
        this.view_box.w= this.elements.canvas_main.offsetWidth;
        this.view_box.h= this.elements.canvas_main.offsetHeight;
        this.view_martix=this.create_viewMartix();
    }
    get canvas_width(){
        return this.canvas.width;
    }
    get canvas_height(){
        return this.canvas.height;
    }
    set canvas_width(val){
        this.canvas.width=val;
        this._canvasBox=null;
        return val;
    }
    set canvas_height(val){
        this.canvas.height=val;
        this._canvasBox=null;
        return val;
    }
    get canvasBox(){
        if(!this._canvasBox){
            this._canvasBox=new Data_Rect(0,0,this.canvas_width,this.canvas_height);
        }
        return this._canvasBox;
    }
    /** @type {Vector2 ()} */
    set focus_Point(val){
        this._focus_Point.x=val.x;
        this._focus_Point.y=val.y;
    }
    get focus_Point(){ return this._focus_Point;}
    get canvas_core(){
        return new Vector2(this.canvas_width*0.5,this.canvas_height*0.5);
    }
    
    /** 使用属性计算视图矩阵
     * @return {Matrix2x2T} 返回一个 2x2T 矩阵 
     */
    create_viewMartix(){
        /** @type {Matrix2x2T} */
        var baseMatrix=new Matrix2x2T(this.scale,0,0,this.scale,0,0).rotate(this.rotate).multiplication(this.third_matrix);
        var t=this.focus_Point.copy().linearMapping(baseMatrix);
        baseMatrix.set_translate(this.view_box.w*0.5-t.y,this.view_box.h*0.5-t.x);
        return baseMatrix;
    }
    create_viewMartix__base(){
        /** @type {Matrix2x2T} */
        var baseMatrix=new Matrix2x2T(this.scale,0,0,this.scale,0,0).rotate(this.rotate).multiplication(this.third_matrix);
        return baseMatrix;
    }
    /** 清除线性变换并平移至居中位置
     */
    viewCtrl_100Center(){
        this.focus_Point={
            x:0.5*this.canvas_width,
            y:0.5*this.canvas_height
        }
        this.rotate=0;
        this.reload_viewCanvasTransform();
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
            this._view_to_canvas_martix=this.view_martix.create_inverse();
        }
        return this._view_to_canvas_martix;
    }
    /** view 的坐标 转换成 canvas 的坐标
     * @param {Number} x 坐标值
     * @param {Number} y 坐标值
     * @returns {Vector2} 返回相对坐标
     */
    transform_canvasViewToCanvas(x,y){
        return Vector2.linearMapping_beforeTranslate({x:x,y:y},this.view_to_canvas_martix);
    }
    transform_canvasTocanvasView(x,y){
        return Vector2.linearMapping_afterTranslate({x:x,y:y},this.view_martix);
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
    /** 渲染图元内容
     */
    renderCanvasTGT(){
        this.ctx.clearRect(0,0,this.canvasBox.w,this.canvasBox.h);
        this.canvas_renderer.render_all();
    }
    /** 
     * @param {MouseEvent} e 
     */
    mousedownHand__canvas_main(e){
        if(document._view_isMouseing){
            return;
        }
        document._view_isMouseing=true;
        
        var c_point=this.create_canvasPoint(e),
        t=new Vector2(e.screenX,e.screenY),
        that=this;

        if(e.button===1&&(!this._can_inside||this.can_move_view)){
            // 鼠标中键 拖动画面
            var old_point=this.focus_Point.copy();
            document._view_onmousemove=function(e){
                var temp_point=new Vector2(t.y-e.screenY,t.x-e.screenX);
                temp_point=Vector2.linearMapping_base(that.view_to_canvas_martix,temp_point);
                that.focus_Point=old_point.sum(temp_point);
                that.view_martix=that.create_viewMartix();
            }
            this.addMouseEventTodoc()
            return;
        }
        if(e.button===0){
            // 鼠标左键使用工具
            if(this.tool_index===1){
                var temptgt=new PrimitiveTGT__Rect(c_point.x,c_point.y,0,0);
                temptgt.transform_matrix=that.view_to_canvas_martix.copy().set_translate(0,0);

                this.root_group.addChildren(temptgt);
                this.callChild("ctrlBox",function(){
                    this.renderTGT_Assets();
                });
                var openPoint=this.transform_canvasViewToCanvas(t.x,t.y);
                // todo
                document._view_onmousemove=function(e){
                    
                    that.transform_canvasViewToCanvas(e.screenX-t.x,e.screenY-t.y)
                    temptgt.data.w=temp_point.x;
                    temptgt.data.h=temp_point.y;
                    that.renderCanvasTGT();
                }
            }
            this.addMouseEventTodoc();
            return;
        }
    }
    addMouseEventTodoc(){
        document.addEventListener("mouseup",document._view_onmouseup);
        document.addEventListener("mousemove",document._view_onmousemove);
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
        stopPE(e);
        if(e.ctrlKey){
            if(e.deltaY>0){
                // 缩小
                this.scale-=0.1
                this.reload_viewCanvasTransform();
            }else{
                // 放大
                this.scale+=0.1
                this.reload_viewCanvasTransform();
            }
        }
        if(e.shiftKey){
            var val=1;
            if(e.altKey){
                val*=10;
            }
            if(e.deltaY>0){
                // +旋转
                this.rotate+=val*deg;
                this.reload_viewCanvasTransform();
            }else{
                // -旋转
                this.rotate-=val*deg;
                this.reload_viewCanvasTransform();
            }
        }
    }
    reload_viewCanvasTransform(){
        var tempM,
            f=true,
            temp=this.canvasBox.create_polygonProxy(),
            view_box=this.view_box,
            tp;
        var old=this.focus_Point.copy();
        this.focus_Point=this.canvas_core;
        tempM=this.create_viewMartix();
        if(!this.can_move_view){
            for(var i=temp.nodes.length-1;f&&(i>=0);--i){
                tp=Vector2.linearMapping_afterTranslate(temp.nodes[i],tempM);
                f=view_box.is_inside(tp.x,tp.y);
            }
            if(!f){
                this.focus_Point=old;
                tempM=this.create_viewMartix();
            }
            this._can_inside=f;
        }
        this.view_martix=tempM;
    }

    toolbox_init(){
        return {list:this.tool_list}
    }
    ctrlbox_init(){
        return [this.root_group,this.canvas];
    }
}
Canvas_Main.prototype.bluePrint=getVEL_thenDeleteElement("temolate_main");

class CtrlBox extends ExCtrl{
    /**
     * @param {PrimitiveTGT__Group} root_group 
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(root_group){
        super();
        this.root_group=root_group;
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
        this.callParent(function(){
            this.canvas_renderer.render_all();
        })
    }
    /**更改对象隐藏
     * @param {*} path 
     */
    change_editTGT_visibility(path){

    }
    ctrl_tgtAssets_dataFnc(){
        return {
            root_group:this.root_group
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
        this.callParent(function(){
            this.tool_index=i;
        })
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
     * @param {{root_group:PrimitiveTGT__Group}} data 
     */
    constructor(data){
        super(data);
        /** @type {{ctx:CanvasRenderingContext2D}} */
        this.data;
        console.log(data);
        this.renderer=new Renderer_PrimitiveTGT__Canvas2D(this.data.ctx);
        /**@type {PrimitiveTGT__Group} 图元根路径 */
        this.root_group=data.root_group;
        /**@type {PrimitiveTGT__Group[]} 遍历渲染时当前项的路径 */
        this.gg=[this.root_group.data[0]];
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
        this.gg[0]=this.root_group.data[0];
        this.di=0;
        this.regress();
        if(!this.root_group.data.length){
            this.depth=-1;
        }
    }
    getParent(depth){
        return (depth?this.gg[depth-1]:this.root_group);
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