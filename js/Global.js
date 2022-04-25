/*
 * @Date: 2022-04-25 15:34:16
 * @LastEditors: Darth_Eternalfaith
 * @LastEditTime: 2022-04-25 21:59:57
 * @FilePath: \def-web\js\visual\Editor\js\Global.js
 */


import {
    DEF_VirtualElementList as VEL,
    ExCtrl
} from "../../../ControlLib/CtrlLib.js"

import { Act_History, ArrayEqual_EqualObj, dependencyMapping } from "../../../basics/Basics.js";
import { PrimitiveTGT__Group } from "../../PrimitivesTGT_2D.js";

/** @type {Act_History} 操作的历史记录 */
var primitiveTGT_act_history=new Act_History(new PrimitiveTGT__Group);

/**
 * @typedef Tool_Node 工具
 * @property {String} hotkey    热键
 * @property {String} tip       提示
 * @property {String} cmd     用于 cqrs 的命令
 * @property {Number} u         图标在精灵图的坐标
 * @property {Number} v         图标在精灵图的坐标
 * @property {Tool_Node[]} [chlid] 子节点
 */
var _hotkey={
    /**@type {Tool_Node} 工具栏 */
    tool_list:{
        cmd:"base",
        child:[
            {hotkey:["KeyQ"],tip:"Cursor",cmd:null,u:5,v:3},
            {hotkey:["KeyA"],tip:"Create",cmd:"create",u:3,v:1,
                back_all_key_flag:true,
                child:[
                    {hotkey:["KeyR"],tip:"Rect"   ,cmd:"create rect"   ,u:0,v:5},
                    {hotkey:["KeyA"],tip:"Arc"    ,cmd:"create arc"    ,u:1,v:5},
                    {hotkey:["KeyS"],tip:"Sector" ,cmd:"create sector" ,u:2,v:5},
                    {hotkey:["KeyD"],tip:"Polygon",cmd:"create polygon",u:3,v:5},
                    {hotkey:["KeyC"],tip:"Path"   ,cmd:"create path"   ,u:5,v:5},
                ]
            },
            {hotkey:['F2']  ,tip:"Rename" ,cmd:"rename" ,u:2,v:4,},
            {hotkey:['Ctrl',"Space"]  ,tip:"Edit" ,cmd:"Edit" ,u:1,v:3,
                child:[
                    {hotkey:['KeyG'],tip:"Move"   ,cmd:"move"   ,u:9,v:3,},
                    {hotkey:['KeyS'],tip:"Scale"  ,cmd:"scale"  ,u:6,v:2,},
                    {hotkey:['KeyR'],tip:"Rotate" ,cmd:"rotate" ,u:1,v:1,},
                ]
            },
            // {hotkey:['KeyM'],tip:"Linear mapping" ,cmd:"rotate" ,u:6,v:5},
            {hotkey:['Ctrl','KeyG'],tip:"Group" ,cmd:"create Group"   ,u:7,v:3},
            {hotkey:['Ctrl','KeyJ'],tip:"Copy & Paste"    ,cmd:"CV"   ,u:4,v:3,},
            {hotkey:['Ctrl','Shift',"KeyJ"],tip:"Copy & Paste (SameReference)" ,cmd:"copy_SameReference" ,u:8,v:4},
        ]
    },

    /** @type {Tool_Node[]} 工具栏子项的热键 用于返回 base 状态 */
    tool_child_hotkey:[
        {hotkey:ArrayEqual_EqualObj,tip:"hotkey back base" ,cmd:"",u:0,v:0}
    ],

    /**@type {Tool_Node[]} */
    global_hotkey:[
        {hotkey:['Ctrl'] ,tip:"nothing" ,cmd:"",u:0,v:0},
        {hotkey:['Shift'],tip:"nothing" ,cmd:"",u:0,v:0},
        {hotkey:['Ctrl','Shift'],tip:"nothing" ,cmd:"",u:0,v:0}
    ]
}
/** @type {{tool_list:Tool_Node,tool_child_hotkey:Tool_Node[],global_hotkey:Tool_Node[]}} 热键和工具列表 */
var hotkey={};
dependencyMapping(hotkey,_hotkey,Object.keys(_hotkey));

var canvas=document.createElement("canvas");
var ctx=canvas.getContext("2d");

/**
 * @typedef  data_global__primitiveTGT_editor
 * @property {Number[][]}               select_tgt_path  选中的路径集合
 * @property {PrimitiveTGT__Group}      root_group 根节点
 * @property {Number[]}                 focus_tgt_path 当前焦点的路径
 * @property {HTMLCanvasElement}        canvas  画布dom元素
 * @property {CanvasRenderingContext2D} ctx  canvas 的 2d画布渲染上下文
 * @property {Number}                   canvas_width  画布宽度
 * @property {Number}                   canvas_height 画布高度
 */
/** @type {data_global__primitiveTGT_editor} */
var _global__primitiveTGT_editor={
    select_tgt_path:[[]],
    focus_tgt_path:[],
    canvas:canvas,
    ctx:ctx,
};
dependencyMapping(_global__primitiveTGT_editor,canvas,["canvas_width","canvas_height"],["width","height"]);
dependencyMapping(_global__primitiveTGT_editor,primitiveTGT_act_history,["root_group"],["now_data"]);

/** @type {data_global__primitiveTGT_editor} */
var global__primitiveTGT_editor={},
    global__primitiveTGT_editor_keys=[
        "select_tgt_path",
        "root_group",
        "focus_tgt_path",
        "canvas",
        "ctx",
        "canvas_width",
        "canvas_height"
    ];
dependencyMapping(global__primitiveTGT_editor,_global__primitiveTGT_editor,global__primitiveTGT_editor_keys);


/** 获取template创建虚拟dom
 * @param {String} id 在dom中的id
 */
function getVEL_ThenDeleteElement(id){
    var tgt=document.getElementById(id),
        rtn= VEL.xmlToVE(tgt.innerHTML);
    tgt.remove();
    return rtn;
}



export{
    getVEL_ThenDeleteElement,
    hotkey,
    global__primitiveTGT_editor,
    global__primitiveTGT_editor_keys
}