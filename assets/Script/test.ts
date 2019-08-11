 
import { eMJCardType, eArrowDirect } from "./scene/roomScene/roomDefine";
 import * as _ from "lodash"
import PlayerInteractEmoji from "./scene/roomScene/layerPlayers/PlayerInteractEmoji";
import PlayerMJCard from "./scene/roomScene/layerCards/layerCards3D/cards/PlayerMJCard";
import MJCard from "./scene/roomScene/layerCards/layerCards3D/cards/MJCard";
import SeatIndicator from "./scene/roomScene/layerCards/SeatIndicator";
// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class test extends cc.Component {

    @property(PlayerMJCard)
    mPlayerCards : PlayerMJCard = null; 
    // LIFE-CYCLE CALLBACKS:

    @property(SeatIndicator)
    mIndicator : SeatIndicator = null ;
    // onLoad () {}

    start () {
        this.mPlayerCards.isSelf = true;
    }

    mValue = MJCard.makeCardNum(eMJCardType.eCT_Feng,1) ;
    onClick()
    {
        this.mIndicator.setSelfIdx(2);
        this.mIndicator.setCurActIdx(0,10 ) ;
        return ;
        cc.log( "distribute" );
        let v : number[] = [] ;
        v.push( this.mValue );
        v.push( this.mValue );
        v.push( this.mValue );
        v.push( this.mValue );
        v.push( this.mValue );
        this.mPlayerCards.onDistribute(v);

        //this.mPlayerCards.onMo( MJCard.makeCardNum(eMJCardType.eCT_Wan,1),null);
    }

    onClick2()
    {
        this.mIndicator.setSelfIdx(3);
        this.mIndicator.setCurActIdx(1,16 ) ;       
        return ;
        this.mPlayerCards.onChu(this.mValue);
    }

    onClick3()
    {
        this.mIndicator.setCurActIdx(2,16 ) ;           return ;
        this.mPlayerCards.onPeng(this.mValue,eArrowDirect.eDirect_Left);
    }

    onClick4()
    {
        this.mIndicator.setSelfIdx(0);
        this.mIndicator.setCurActIdx(3,16 ) ;           return ;
        this.mPlayerCards.onMingGang(this.mValue,eArrowDirect.eDirect_Left,this.mValue + 1,null);
    }
    // update (dt) {}
}
