/*
 * @Date: 2022-02-14 21:12:46
 * @LastEditors: Darth_Eternalfaith
 * @LastEditTime: 2022-05-09 16:01:00
 * @FilePath: \PrimitivesTGT-2D_Editor\js\components\Canvas_Main.js
 */
import { Act_History, add_DependencyListener, arrayDiff, arrayEqual, ArrayEqual_EqualObj, Delegate, dependencyMapping, Iterator__Tree } from "../import/basics/Basics.js";
import { addKeyEvent, KeyNotbook, stopPE } from "../import/basics/dom_tool.js";
import { deg } from "../import/basics/math_ex.js";
import { ExCtrl } from "../import/CtrlLib/CtrlLib.js"
import { Math2D,Matrix2x2, Matrix2x2T, Polygon, Data_Rect, Data_Sector, Vector2, Data_Arc, Data_Arc__Ellipse , matrixToCSS } from "../import/PrimitivesTGT_2D/Math2d.js";
import { Material, PrimitiveTGT__Arc, PrimitiveTGT__Rect, PrimitiveTGT__Group, PrimitiveTGT__Polygon, PrimitiveTGT__Path, PrimitiveTGT } from "../import/PrimitivesTGT_2D/PrimitivesTGT_2D.js";
import { Canvas2d__Material, Renderer_PrimitiveTGT__Canvas2D, CtrlCanvas2d } from "../import/PrimitivesTGT_2D/PrimitivesTGT_2D_CanvasRenderingContext2D.js";
import { AnimationCtrl } from "../import/PrimitivesTGT_2D/visual.js";
import { getVEL_ThenDeleteElement, global__primitiveTGT_editor, hotkey } from "../Global.js";
import { ContextMenu } from "./ContextMenu.js";
import { CtrlBox } from "./CtrlBox.js";
import { ToolBox } from "../import/CtrlLib__EXDEF_LIB/ToolBox.js";

/** 
 * @this {Canvas_Main}
 * @param {Number} o 
 * @param {Number} n 
 * @param {import("../Global.js").data_global__primitiveTGT_editor} root 
 * @param {import("../Global.js").data_global__primitiveTGT_editor} head 
 */
function onCanvasReSize(o,n,root,head){
    this._canvasBox.w=root.canvas_width
    this._canvasBox.h=root.canvas_height
}

class Canvas_Main extends ExCtrl{
    constructor(data){
        super(data);
        /** @type {Data_Rect} 画布的数学矩形*/
        this._canvasBox=new Data_Rect(0,0,0,0);
        /** @type {Data_Rect} 视口的数学矩形*/
        this.view_box=null;
        
        dependencyMapping(this,global__primitiveTGT_editor,["canvas","ctx","canvas_height","canvas_width"]);
        add_DependencyListener(this,"canvas_height",onCanvasReSize)
        this.canvas_height =500;
        this.canvas_width  =500;

        // 暂存事件 open
            this._view_onmouseup;
            this._view_onmousemove;
        // 暂存事件 end

        // view open
            /** @type {Vector2} 焦点坐标 */
            this._focus_point=new Vector2(0.5*this.canvas_width,0.5*this.canvas_height);
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
            /**@type {Vector2} 鼠标在视口中的坐标*/
            this._mouse_position__view=new Vector2();
            /**@type {Vector2} 鼠标在画布上的坐标*/
            this._mouse_position__canvas=new Vector2();
        // view end

        // tool open
            /** @type {String} 当前菜单状态*/
            this.ctrl_menu_type;
            dependencyMapping(this,this.data,["ctrl_menu_type"]);
            /**@type {String} 指示当前命令状态 */
            this.command_status="wait";
        // tool end
        
        // 图元对象tgt 相关 open
            this.root_group=new PrimitiveTGT__Group();
            this.canvas_renderer=new Renderer_PrimitiveTGT__Canvas2D([this.root_group],this.ctx);
            // this.change_history=new CQRS_History(this.root_group);
            /**@type {Number[][]}  当前选中的路径集合 */
            this.select_tgt_path=[];
            /**@type {Number[]}  当前焦点的路径 */
            this.focus_tgt_path=[];
            /** @type {Boolean} 新建对象是否使用视图缩放矩阵 */
            this.new_tgt_use_scale=false;
        // 图元对象tgt 相关 end
    }

    // 成员变量封装, 缓存刷新函数 open
        /**@type {HTMLDivElement} */
        get canvas_view(){
            return this.elements.canvas_view;
        }
        refresh_ViewBox(){
            this.view_box.w= this.canvas_view.offsetWidth;
            this.view_box.h= this.canvas_view.offsetHeight;
            this.view_martix=this.create_ViewMartix();
        }
        get canvasBox(){
            if(!this._canvasBox){
                this._canvasBox=new Data_Rect(0,0,this.canvas_width,this.canvas_height);
            }
            return this._canvasBox;
        }
        /** @type {Vector2 ()} */
        set focus_point(val){
            this._focus_point.x=val.x;
            this._focus_point.y=val.y;
        }
        get focus_point(){ return this._focus_point;}
        get canvas_core(){
            return new Vector2(this.canvas_width*0.5,this.canvas_height*0.5);
        }
        set mouse_Position__view    (val){
            this._mouse_position__view.x=val.x;
            this._mouse_position__view.y=val.y;
        }
        set mouse_Position__canvas  (val){
            this._mouse_position__canvas.x=val.x;
            this._mouse_position__canvas.y=val.y;
        }
        
        get mouse_Position__view(){
            return this._mouse_position__view;
        }
        get mouse_Position__canvas(){
            return this._mouse_position__canvas;
        }
    // 成员变量封装, 缓存刷新函数 end

    //控件动作 open
        callback(){
            this.canvas_view.appendChild(this.canvas);
            this.elements["root_hand"].focus();
            this.view_box=new Data_Rect(0,0,this.canvas_view.offsetWidth,this.canvas_view.offsetHeight);
            this.viewCtrl_100Center();
            var that=this;
            document.addEventListener("mouseup",function(e){
                document._view_isMouseing=false;
                document.removeEventListener("mousemove",that._view_onmousemove);
                document.removeEventListener("mouseup",that._view_onmouseup);
            });
            
            // 全局热键 key 注册 
            addKeyEvent(this.parent_node,false,true,["ctrl","KeyG"],function(e){
                stopPE(e);that.hyperplasia_Group();
            });
            // 全局热键 key 注册 
            addKeyEvent(this.parent_node,false,true,["F2"],function(e){
                stopPE(e);that.rename();
            });
            
        }
        /** 鼠标右键时的事件
         * @param {PointerEvent} e 
         */
        mouseMunuHand(e){
            this.call_CtrlMenu("mouse");
        }
        /** 呼出菜单
         * @param {String} type 菜单类型
         */
        call_CtrlMenu(type){
            this.ctrl_menu_type=type;
        }
        /** 绘制区域鼠标按下事件
         * @param {MouseEvent} e 
         */
        mousedownHand__canvas_Main(e){
            if(document._view_isMouseing){
                return;
            }
            document._view_isMouseing=true;
            
            var c_point=this.create_CanvasPoint(e),
                startPoint=this.create_ViewPoint(e),
                t=new Vector2(e.screenX,e.screenY),
                that=this;
    
            if(e.button===1&&(!this._can_inside||this.can_move_view)){
                // 鼠标中键 拖动画面
                var old_point=this.focus_point.copy();
                this._view_onmousemove=function(e){
                    var temp_point=new Vector2(t.y-e.screenY,t.x-e.screenX);
                    temp_point=Vector2.linearMapping__Base(that.view_to_canvas_martix,temp_point);
                    that.focus_point=old_point.sum(temp_point);
                    that.view_martix=that.create_ViewMartix();
                }
                this.addMouseEventTodoc()
                return;
            }
            console.log(c_point);
    
            // 鼠标左键使用工具
            if(e.button===0){
                if(this.tool_index===0){
                    this._view_onmouseup    = null;
                    this._view_onmousemove  = null;
                    return;
                }
                var tgtM;
                tgtM=this.root_group.get_DescendantTransformMatrix__I(this.focus_tgt_path);
                if(!this.new_tgt_use_scale){
                    // 不使用缩放值 新建一个矩阵
                    tgtM.multiplication_Before(new Matrix2x2T().rotate(this.rotate).multiplication(this.third_matrix).create_Inverse());
                }else{
                    tgtM.multiplication_Before(that.view_to_canvas_martix.copy());
                }
    
                if(this.tool_index===1){
                    // 矩形
                    var temptgt=new PrimitiveTGT__Rect(0,0,0,0);
                    // todo 日志化操作
                    temptgt.transform_matrix=tgtM;
                    
                    var newpath=this.root_group.add_ByPath(this.focus_tgt_path,temptgt);
                    var temp_point=this.root_group.worldToDescendant(newpath,c_point);
                    temptgt.data.x=temp_point.x;
                    temptgt.data.y=temp_point.y;
                    this.select_tgt_path.length=1;
                    this.select_tgt_path[0]=this.focus_tgt_path=newpath;
                    this.callChild("ctrlBox",function(){
                        this.renderTGT_Assets();
                    });
                    
                    this._view_onmousemove=function(e){
                        var movePoint=startPoint.sum(new Vector2(e.screenX-t.x,e.screenY-t.y)),
                            move_c_point=that.transform_CanvasViewToCanvas(movePoint.x,movePoint.y);
                        // 画布相对坐标偏移量
                        // var pt=move_c_point.dif(c_point);
    
                        // 矩形内部相对坐标偏移量
                        var movePoint_canvas=that.root_group.worldToDescendant(newpath,move_c_point);
                        temptgt.data.w=movePoint_canvas.x-temptgt.data.x;
                        temptgt.data.h=movePoint_canvas.y-temptgt.data.y;
                        that.renderCanvasTGT();
                        CtrlCanvas2d.dot(that.ctx,c_point,3,"#0f0");
                        CtrlCanvas2d.dot(that.ctx,move_c_point,3,"#ff0");
                    }
                    this._view_onmouseup=function(e){
                        var movePoint=startPoint.sum(new Vector2(e.screenX-t.x,e.screenY-t.y)),
                            move_c_point=that.transform_CanvasViewToCanvas(movePoint.x,movePoint.y);
                        // 相对坐标偏移量
                        // var pt=move_c_point.dif(c_point);
    
                        var movePoint_canvas=temptgt.worldToLocal(move_c_point);
                        // that.change_history.add_Command(new CQRS_Command__PrimitiveTGT(true,))
                    }
                }
                this.addMouseEventTodoc();
                this.tool_index=0;
                return;
            }
            // todo
        }
        /** 给document 添加鼠标事件用的函数 */
        addMouseEventTodoc(){
            document.addEventListener("mouseup",this._view_onmouseup);
            document.addEventListener("mousemove",this._view_onmousemove);
        }
        /** 绘制区域 鼠标滚轮事件
         * @param {WheelEvent} e 
         */
        wheelHand__canvas_Main(e){
            stopPE(e);
            if(e.ctrlKey){
                if(e.deltaY>0){
                    // 缩小
                    this.scale-=0.1
                    this.reload_ViewCanvasTransform();
                }else{
                    // 放大
                    this.scale+=0.1
                    this.reload_ViewCanvasTransform();
                }
                return;
            }
            if(e.shiftKey){
                var val=1;
                if(e.altKey){
                    val*=10;
                }
                if(e.deltaY>0){
                    // +旋转
                    this.rotate+=val*deg;
                    this.reload_ViewCanvasTransform();
                }else{
                    // -旋转
                    this.rotate-=val*deg;
                    this.reload_ViewCanvasTransform();
                }
                return;
            }
        }
    // 控件动作 end

    // 坐标变换相关 open

        /** 使用属性计算视图矩阵
         * @return {Matrix2x2T} 返回一个 2x2T 矩阵 
         */
        create_ViewMartix(){
            /** @type {Matrix2x2T} */
            var baseMatrix=this.create_ViewMartix__Base();
            var t=this.focus_point.copy().linearMapping(baseMatrix);
            baseMatrix.set_Translate(this.view_box.w*0.5-t.y,this.view_box.h*0.5-t.x);
            return baseMatrix;
        }
        /** 使用属性计算视图矩阵
         * @return {Matrix2x2T} 返回一个 2x2T 矩阵  但是没有计算平移量
         */
        create_ViewMartix__Base(){
            /** @type {Matrix2x2T} */
            var baseMatrix=new Matrix2x2T(this.scale,0,0,this.scale,0,0).rotate(this.rotate).multiplication(this.third_matrix);
            return baseMatrix;
        }
        /** 清除线性变换并平移至居中位置
         */
        viewCtrl_100Center(){
            this.focus_point={
                x:0.5*this.canvas_width,
                y:0.5*this.canvas_height
            };
            this.rotate=0;
            this.reload_ViewCanvasTransform();
        }
        /**@type {Matrix2x2T} 画布变换到视口的矩阵*/
        set view_martix(m){
            this._view_martix.set_Matrix2x2(m);
            this._view_to_canvas_martix=null;
            this.canvas.style.transform=matrixToCSS(this._view_martix);
            return this._view_martix;
        }
        /**@type {Matrix2x2T} 画布变换到视口的矩阵*/
        get view_martix(){
            return this._view_martix;
        }
        /**@type {Matrix2x2T} 视口变换到画布的矩阵*/
        get view_to_canvas_martix(){
            if(!this._view_to_canvas_martix){
                this._view_to_canvas_martix=this.view_martix.create_Inverse();
            }
            return this._view_to_canvas_martix;
        }
        /** view 的坐标 转换成 canvas 的坐标
         * @param {Number} x 坐标值
         * @param {Number} y 坐标值
         * @returns {Vector2} 返回相对坐标
         */
        transform_CanvasViewToCanvas(x,y){
            return Vector2.linearMapping__BeforeTranslate(new Vector2(x,y),this.view_to_canvas_martix);
        }
        transform_CanvasTocanvasView(x,y){
            return Vector2.linearMapping__AfterTranslate(new Vector2(x,y),this.view_martix);
        }

        /** 使用事件对象创建相对于canvas的点
         * @param {MouseEvent} e 
         * @returns {Vector2} 
         */
        create_CanvasPoint(e){
            if(e.target===this.canvas){
                return new Vector2(e.offsetX,e.offsetY);
            }
            return this.transform_CanvasViewToCanvas(e.offsetX,e.offsetY);
        }
        /** 使用事件对象得到view坐标
         * @param {MouseEvent} e view或者canvas上发生的鼠标事件
         * @returns 
         */
        create_ViewPoint(e){
            if(e.target===this.canvas){
                return this.transform_CanvasTocanvasView(e.offsetX,e.offsetY);
            }
            return new Vector2(e.offsetX,e.offsetY);
        }
        /** 使用成员变量 重新加载(刷新) 当前画布变换
         */
        reload_ViewCanvasTransform(){
            var tempM,
                f=true,
                temp=this.canvasBox.create_PolygonProxy(),
                view_box=this.view_box,
                tp;
            var old=this.focus_point.copy();
            this.focus_point=this.canvas_core;
            tempM=this.create_ViewMartix();
            if(!this.can_move_view){
                for(var i=temp.nodes.length-1;f&&(i>=0);--i){
                    tp=Vector2.linearMapping__AfterTranslate(temp.nodes[i],tempM);
                    f=view_box.is_Inside(tp.x,tp.y);
                }
                if(!f){
                    this.focus_point=old;
                    tempM=this.create_ViewMartix();
                }
                this._can_inside=f;
            }
            this.view_martix=tempM;
        }
    // 坐标变换相关 end

    // 图元 tgt 操作相关 open
        /** 重命名当前焦点的tgt
         */
        rename(){
            if(this.focus_tgt_path&&this.focus_tgt_path.length){   
                var tgt=this.root_group.get_DescendantByPath(this.focus_tgt_path);
                tgt.name=window.prompt("重命名",tgt.name);
                this.callChild("ctrlBox",function(){
                    this.renderTGT_Assets();
                })                
            }
        }
        /** 新建组 如果当前有焦点，将会把焦点的tgt移动到新组内
         */
        hyperplasia_Group(){
            // todo
            var temp_group=new PrimitiveTGT__Group([]);
            var i,
                path,
                l=this.select_tgt_path.length,
                temp_p1="-1",
                temp_p2="";
            var pGroup=this.root_group.get_ParentByPath(this.select_tgt_path[0]);
            for(i=0;i<l;++i){
                path=this.select_tgt_path[i];
                temp_p2=path.join(',');
                if((path.length)&&(temp_p2.indexOf(temp_p1)===-1)){
                    temp_group.add_Children(this.root_group.get_DescendantByPath(path));
                    temp_p1=temp_p2;
                }
            }
            temp_p1=null;
            temp_p2=null;
            for(i=l-1;i>=0;--i){
                path=this.select_tgt_path[i];
                temp_p2=path.join(',');
                if(this.select_tgt_path[i-1]){
                    temp_p1=this.select_tgt_path[i-1].join(',');
                }else{
                    temp_p1='-1';
                }
                if((path.length)&&(temp_p2.indexOf(temp_p1)===-1)){
                    this.root_group.remove_DescendantByPath(path);
                    temp_p1=temp_p2;
                }
            }
            if(this.select_tgt_path.length){
                pGroup.insert(this.select_tgt_path[0][this.select_tgt_path[0].length-1],temp_group);
                this.select_tgt_path.length=1;
                this.focus_tgt_path=this.select_tgt_path[0];
            }else{
                this.select_tgt_path[0]=this.focus_tgt_path=[pGroup.add_Children(temp_group)-1];
            }
            this.renderCanvasTGT();
            this.reRender();
        }
        /** 渲染图元内容
         */
        renderCanvasTGT(){
            this.ctx.clearRect(0,0,this.canvasBox.w,this.canvasBox.h);
            this.canvas_renderer.render_All();
        }

    // 图元tgt操作相关 end

    // 子控件初始化函数 open
        toolbox_Init(){
            return hotkey;
        }
        ctrlbox_Init(){
            var d={};
            dependencyMapping(d,this,["focus_tgt_path","root_group","ctx","select_tgt_path"]);
            return d;
        }
        contextMenu_Init(){
            var d={};
            dependencyMapping(d,this,["mouse_Position__Canvas","mouse_position__view","ctrl_menu_type"]);
            return d;
        }
    // 子控件初始化函数 end
}
Canvas_Main.prototype.bluePrint=getVEL_ThenDeleteElement("template_main");

Canvas_Main.prototype.childCtrlType={
    ToolBox,
    CtrlBox,
    ContextMenu
}

export {
    Canvas_Main
}