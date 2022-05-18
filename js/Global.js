/*
 * @Date: 2022-04-25 15:34:16
 * @LastEditors: Darth_Eternalfaith
 * @LastEditTime: 2022-05-18 14:28:36
 * @FilePath: \PrimitivesTGT-2D_Editor\js\Global.js
 */


import {
    DEF_VirtualElementList as VEL
} from "./import/CtrlLib/CtrlLib.js"

import { Act_History, ArrayEqual_EqualObj, dependencyMapping } from "./import/basics/Basics.js";
import { PrimitiveTGT__Group } from "./import/PrimitivesTGT_2D/PrimitivesTGT_2D.js";

/** @typedef {import("./import/CtrlLib__EXDEF_LIB/ToolBox.js").Tool_Node} Tool_Node */

/** @type {Act_History} 操作的历史记录 */
var primitiveTGT_act_history=new Act_History(new PrimitiveTGT__Group);

var _hotkey={
    /**@type {Tool_Node} 工具栏 */
    tool_list:{
        cmd:"base",
        child:[
            {hotkey:["KeyQ"],tip:"Cursor",cmd:null,icon_key:"53"},
            {hotkey:["KeyA"],tip:"Create",cmd:"create",icon_key:"31",
                back_all_key_flag:true,
                child:[
                    {hotkey:["KeyR"],tip:"Rect"   ,cmd:"create rect"   ,icon_key:"05"},
                    {hotkey:["KeyA"],tip:"Arc"    ,cmd:"create arc"    ,icon_key:"15"},
                    {hotkey:["KeyS"],tip:"Sector" ,cmd:"create sector" ,icon_key:"25"},
                    {hotkey:["KeyD"],tip:"Polygon",cmd:"create polygon",icon_key:"35"},
                    {hotkey:["KeyC"],tip:"Path"   ,cmd:"create path"   ,icon_key:"55"},
                ]
            },
            {hotkey:['F2']  ,tip:"Rename" ,cmd:"rename" ,icon_key:"24",},
            {hotkey:['Ctrl',"Space"]  ,tip:"Edit" ,cmd:"Edit" ,icon_key:"13",
                child:[
                    {hotkey:['KeyG'],tip:"Move"   ,cmd:"move"   ,icon_key:"93",},
                    {hotkey:['KeyS'],tip:"Scale"  ,cmd:"scale"  ,icon_key:"62",},
                    {hotkey:['KeyR'],tip:"Rotate" ,cmd:"rotate" ,icon_key:"11",},
                ]
            },
            // {hotkey:['KeyM'],tip:"Linear mapping" ,cmd:"rotate" ,icon_key:"65"},
            {hotkey:['Ctrl','KeyG'],tip:"Group" ,cmd:"create Group"   ,icon_key:"73"},
            {hotkey:['Ctrl','KeyJ'],tip:"Copy & Paste"    ,cmd:"CV"   ,icon_key:"43",},
            {hotkey:['Ctrl','Shift',"KeyJ"],tip:"Copy & Paste (SameReference)" ,cmd:"copy_SameReference" ,icon_key:"84"},
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
canvas.className="canvas";
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