/*
 * @Date: 2022-02-14 21:12:46
 * @LastEditors: Darth_Eternalfaith
 * @LastEditTime: 2022-04-15 20:57:23
 * @FilePath: \def-web\js\visual\Editor\js\Editor.js
 */
import { add_DependencyListener, arrayDiff, arrayEqual, CQRS_History, Delegate, dependencyMapping, Iterator__Tree } from "../../../basics/Basics.js";
import { addKeyEvent, KeyNotbook, stopPE } from "../../../basics/dom_tool.js";
import { deg } from "../../../basics/math_ex.js";
import {
    DEF_VirtualElementList as VEL,
    ExCtrl
} from "../../../ControlLib/CtrlLib.js"
import { Bezier_Polygon, Math2D,Matrix2x2, Matrix2x2T, Polygon, Data_Rect, Data_Sector, Vector2, Data_Arc, Data_Arc__Ellipse } from "../../Math2d.js";
import { Material, PrimitiveTGT__Arc, PrimitiveTGT__Bezier, PrimitiveTGT__Rect, PrimitiveTGT__Group, PrimitiveTGT__Polygon, PrimitiveTGT__Path, CQRS_Command__PrimitiveTGT } from "../../PrimitivesTGT_2D.js";
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
function getVEL_ThenDeleteElement(id){
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

        // 暂存事件 open
            this._view_onmouseup
            this._view_onmousemove
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
            this.tool_list={
                cmd:"base",
                child:[
                    {hotkey:["KeyQ"],tip:"Cursor",cmd:null,u:5,v:3},
                    {hotkey:["KeyA"],tip:"Create",cmd:"create",u:3,v:1,
                        child:[
                            {hotkey:["KeyR"],tip:"Rect"   ,cmd:"create rect"   ,u:0,v:5},
                            {hotkey:["KeyA"],tip:"Arc"    ,cmd:"create arc"    ,u:1,v:5},
                            {hotkey:["KeyS"],tip:"Sector" ,cmd:"create sector" ,u:2,v:5},
                            {hotkey:["KeyD"],tip:"Polygon",cmd:"create polygon",u:3,v:5},
                            {hotkey:["KeyB"],tip:"Bezier" ,cmd:"create bezier" ,u:4,v:5},
                            {hotkey:["KeyC"],tip:"Path"   ,cmd:"create path"   ,u:5,v:5},
                        ]
                    },
                    {hotkey:['Ctrl','KeyG'],tip:"Group" ,cmd:"create Group"   ,u:7,v:3},
                    {hotkey:['Ctrl','KeyJ'],tip:"CV"    ,cmd:"CV"   ,u:4,v:3,},
                    {hotkey:['F2']  ,tip:"Rename" ,cmd:"rename" ,u:1,v:3,},
                    {hotkey:['KeyG'],tip:"Move"   ,cmd:"move"   ,u:9,v:3,},
                    {hotkey:['KeyS'],tip:"Scale"  ,cmd:"scale"  ,u:6,v:2,},
                    {hotkey:['KeyR'],tip:"Rotate" ,cmd:"rotate" ,u:1,v:1,},
                ]
            };
            /** @type {String} 当前菜单状态*/
            this.ctrl_menu_type;
            dependencyMapping(this,this.data,["ctrl_menu_type"]);
            /**@type {String} 指示当前命令状态 */
            this.command_status="待命";
        // tool end
        
        // 图元对象tgt 相关 open
            this.root_group=new PrimitiveTGT__Group();
            this.canvas_renderer=new Renderer_PrimitiveTGT__Canvas2D([this.root_group],this.ctx);
            this.change_history=new CQRS_History(this.root_group);
            /**@type {Number[][]}  当前选中的路径集合 */
            this.select_tgt_path=[];
            /**@type {Number[]}  当前焦点的路径 */
            this.focus_tgt_path=[];
            /** @type {Boolean} 新建对象是否使用视图缩放矩阵 */
            this.new_tgt_use_scale=false;
        // 图元对象tgt 相关 end
    }

    // 成员变量封装, 缓存刷新函数 open
        get canvas_main(){
            return this.elements.canvas_main;
        }
        refresh_ViewBox(){
            this.view_box.w= this.canvas_main.offsetWidth;
            this.view_box.h= this.canvas_main.offsetHeight;
            this.view_martix=this.create_ViewMartix();
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
            this.canvas_main.appendChild(this.canvas);
            this.elements["root_hand"].focus();
            this.view_box=new Data_Rect(0,0,this.canvas_main.offsetWidth,this.canvas_main.offsetHeight);
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
                    
                    var newpath=this.root_group.insert_ByPath(this.focus_tgt_path,temptgt);
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
            temp_p1="-1";
            temp_p2="";
            for(i=l-1;i>=0;--i){
                path=this.select_tgt_path[i];
                temp_p2=path.join(',');
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
            var d={};
            dependencyMapping(d,this,["list"],["tool_list"]);
            return d ;
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

class CtrlBox extends ExCtrl{
    /**
     * @typedef  {Object} CtrlBox_Data
     * @property {Number[][]} select_tgt_path  选中的路径集合
     * @property {PrimitiveTGT__Group} root_group 根节点
     * @property {CanvasRenderingContext2D} ctx 渲染上下文
     * @property {Number[]} focus_tgt_path 当前焦点的路径
     */   
    /**
     * @param {CtrlBox_Data} data 
     */
    constructor(data){     
        super(data);
        /**@type {CtrlBox_Data} */
        this.data;
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
            this.canvas_renderer.render_All();
        });
    }
    /**更改对象隐藏
     * @param {*} path 
     */
    change_editTGT_Visibility(path){

    }
    tgtAssets_Init(){
        var d={};
        dependencyMapping(d,this.data,["root_group","focus_tgt_path","select_tgt_path"]);
        return d ;
    }
    /** 用当前焦点对象刷新 matrix
     */
    reRender_Matrix(){
        if(this.focused_tgt){
            this.callChild("")
        }
    }
}
CtrlBox.prototype.bluePrint=getVEL_ThenDeleteElement("template_ctrlBox");


/**
 * @typedef ctrl_menu_node
 * @property {String} text 当前的菜单显示文本
 * @property {ctrl_menu_node[]} child 子菜单
 */
/**
 * @typedef ContextMenuData
 * @property {String} ctrl_menu_type 当前的菜单type
 * @property {ctrl_menu_node} ctrl_menu_data 当前的菜单type
 */
// todo
class ContextMenu extends ExCtrl{
    constructor(data){
        super(data);
        /**@type {ContextMenuData} */
        this.data;
    }
    // 逻辑动作 open
        /**通过路径执行动作
         * @param {Number[]} parh 路径
         */
        do_byPath(parh){
            
        }
    // 逻辑动作end

    // 控件动作 open
        callback(){
            var that=this;
            add_DependencyListener(this.data,"ctrl_menu_type",function(){
                document.addEventListener("click",function(){
                    that.hiddend
                })
            });
        }
        hidden(){
            this.parent_node.style.display="none";
        }
        show(){
            this.parent_node.style.display="block";
        }
        /**
         * @param {PointerEvent} e 
         */
        clickHand(e){
            this.path=e.target.path;
            this.do_byPath(path);
        }
        /**
         * @param {MouseEvent} e 
         */
        mouseoverHand(e){
            this.path=e.target.path;
        }
    // 控件动作end
}
ContextMenu.prototype.bluePrint=getVEL_ThenDeleteElement("template_contextMenu");

/**
 * @typedef Tool_Node 工具
 * @property {String} hotkey    热键
 * @property {String} tip       提示
 * @property {String} cmd     用于 cqrs 的命令
 * @property {Number} u         图标在精灵图的坐标
 * @property {Number} v         图标在精灵图的坐标
 * @property {Tool_Node[]} chlid 子节点
 */
class ToolBox extends ExCtrl {
    constructor(data){
        super(data);
        /**@type {Tool_Node} */
        this.data.list;
        console.log(this.data.list)
        this.list_iterator=new Iterator__Tree(this.data.list,"child");
        /**@type {Tool_Node} */
        this._now_tool;
        this._now_tool_path;
        this.eg=[];
        this.folded_open_CSS_select=".cnm";
    }
    /** 切换工具
     * @param {Tool_Node} tool 
     */
    tab_Tool(tool,path){
        // todo
        this._now_tool=tool;
    }
    /** 让 item 和祖先和儿子出现
     * @param {HTMLElement} tgt 
     */
    showHand(tgt){
        var temp=tgt,
            foldedClassList=[],
            f=new Array();
        for(var i=tgt.depth;i>=0;--i){
            f[i]=true;
        }
        do{
            if(f[temp.depth]){
                foldedClassList.push(".toolBox-item:nth-child(n+"+temp.di+')'+
                    ".toolBox-item:nth-child(-n+"+(temp.next_same_depth_Di||999)+')'+
                    ".toolBox-item-d"+(temp.depth+1));
                f[temp.depth]=false;
            }
            temp=temp.previousElementSibling;
        }while(f[0]);
        
        this.folded_open_CSS_select=foldedClassList.join(",.CtrlLib-"+this.c__ctrl_lib_id+' ');
        this.renderStyle();
    }
    hiddenHand(){
        this.folded_open_CSS_select="cnm";
        this.renderStyle();
    }
    get folded_CSS_select(){
        if(!this._folded_CSS_select){
            var i,
                folded=[];
            for(i=this._maxDepth;i>0;--i){
                folded.push(".toolBox-item-d"+i);
            }
            this._folded_CSS_select=folded.join(",.CtrlLib-"+this.c__ctrl_lib_id+' ');
        }
        return this._folded_CSS_select;
    }
    get maxDepth(){
        return this._maxDepth;
    }
    set maxDepth(val){
        this._maxDepth=val;
        this._folded_CSS_select="";
    }
}
ToolBox.prototype.bluePrint=getVEL_ThenDeleteElement("template_toolBox");

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
        this.render_editing_Matrix();
    }
    /**
     * 将矩阵渲染到input
     */
    render_editing_Matrix(){
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
    focus_Input(tgt){
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
        this.render_editing_Matrix();
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
Ctrl_Matrix2x2T.prototype.bluePrint=getVEL_ThenDeleteElement("template_ctrl_Matrix2x2T");

class Ctrl_tgtAssets extends ExCtrl{
    /**
     * @param {CtrlBox_Data} data 
     */
    constructor(data){
        super(data);
        /** @type {CtrlBox_Data} */
        this.data;
        this.group_iterator=new Iterator__Tree(this.data.root_group,"data");
        // 列表渲染使用的属性 open
            /**@type {Map<Number,{d:Number,ed:Number}>} 被折叠的 index : 深度  */
            this.folded_data=new Map();
            /** @type {String[]} 选中的项的id*/
            this.select_list=[];
            
        // 列表渲染使用的属性 end
    }
    /**@type {PrimitiveTGT__Group} 图元根路径 */
    get root_group(){return this.data.root_group;}
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
        console.log(".cnm"+folded_CSS_selects.join(''));
        return ".cnm"+folded_CSS_selects.join('');
    }
}
Ctrl_tgtAssets.prototype.bluePrint=getVEL_ThenDeleteElement("template_ctrl_tgtAssets");

window.Ctrl_tgtAssets=Ctrl_tgtAssets;
CtrlBox.prototype.childCtrlType={
    Ctrl_Matrix2x2T:Ctrl_Matrix2x2T,
    Ctrl_tgtAssets:Ctrl_tgtAssets
}

Canvas_Main.prototype.childCtrlType={
    ToolBox,
    CtrlBox,
    ContextMenu
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