/*
 * @Date: 2022-04-19 09:28:02
 * @LastEditors: Darth_Eternalfaith
 * @LastEditTime: 2022-04-19 15:31:47
 * @FilePath: \def-web\js\visual\Editor\js\Editor_config.js
 */

import { ArrayEqual_EqualObj, dependencyMapping } from "../../../basics/Basics.js";


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
            {hotkey:['KeyM'],tip:"Linear mapping" ,cmd:"rotate" ,u:6,v:5},
            {hotkey:['Ctrl',"KeyJ"],tip:"Copy" ,cmd:"copy" ,u:4,v:3},
            {hotkey:['Ctrl','Shift',"KeyJ"],tip:"Copy_SameReference" ,cmd:"copy_SameReference" ,u:8,v:4},
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
var hotkey={};
dependencyMapping(hotkey,_hotkey,Object.keys(_hotkey));

export {
    hotkey
}