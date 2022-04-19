/*
 * @Date: 2022-04-19 15:51:20
 * @LastEditors: Darth_Eternalfaith
 * @LastEditTime: 2022-04-19 17:12:57
 * @FilePath: \def-web\js\visual\Editor\js\comand.js
 */

class CQRS_Command__PrimitiveTGT extends CQRS_Command{
    /**
     * 
     * @param {Boolean} type       执行什么操作 false 赋值, true 运行成员函数
     * @param {Number[]} tgtpath   子对象路径
     * @param {String[]} path      执行路径
     * @param {*[]} _arguments     执行参数
     */
    constructor(type,tgtpath,path,_arguments){
        super(type,path,_arguments);
        this.tgtpath=tgtpath;
    }
    /** 执行动作
     * @param {PrimitiveTGT__Group} root_tgt 
     */
    do(root_tgt){
        var temp=root_tgt,
            i=0,
            l=this.tgtpath.length;
        while(i<l){
            temp=temp.data[this.path[i]];
            ++i;
        }
        super.do(temp);
    }
}