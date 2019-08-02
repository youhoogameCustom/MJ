import ILayer from "../ILayer";
import MJRoomData from "../roomData/MJRoomData";
import DlgActOpts from "./DlgActOpts/DlgActOpts";
import { eMJActType, eEatType } from "../roomDefine";
import DlgEatOpts from "./DlgEatOpts";
import DlgGangOpts from "./DlgGangOpts";
import DlgDismiss from "./DlgDimiss";
import PlayerInfoDataCacher from "../../../clientData/PlayerInfoDataCacher";
import Prompt from "../../../globalModule/Prompt";

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
export default class LayerDlg extends cc.Component implements ILayer {

    @property(DlgActOpts)
    mDlgActOpts: DlgActOpts = null;

    @property(DlgEatOpts)
    mDlgEatOpts : DlgEatOpts = null ;

    @property(DlgGangOpts)
    mDlgGangOpts : DlgGangOpts = null ;

    @property(DlgDismiss)
    mDlgDismiss : DlgDismiss = null ;

    protected mRoomData : MJRoomData = null ;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    refresh( data : MJRoomData ) : void
    {
        this.mRoomData = data ;
    }

    // dlg act opts 
    showDlgActOpts( actOpts : eMJActType[] )
    {
        this.mDlgActOpts.showDlg(actOpts);
    }

    onDlgActOptsResult( act : eMJActType )
    {
        this.mRoomData.doChosedAct(act) ;
    }

    // dlg eat opts ;
    showDlgEatOpts( vEatOpts : eEatType[], nTargetCard : number )
    {
        this.mDlgEatOpts.showDlg(vEatOpts,nTargetCard) ;
    }

    onDlgEatOptsResult( type : eEatType, nTargetCard : number )
    {
        this.mRoomData.doChoseEatType(type) ;
    }
    
    // dlg gang opts 
    showDlgGangOpts( gangOpts : number[] )
    {
        this.mDlgGangOpts.showDlg( gangOpts );
    }

    onDlgGangOptsResult( gangCard : number )
    {
        this.mRoomData.doChosedGangCard( gangCard ) ;
    }

    // dlg dimisss 
    showDlgDismiss( data : MJRoomData )
    {
        this.mDlgDismiss.showDlgDismiss(data);
    }

    onDlgDismissResult( isAgree : boolean )
    {
        this.mRoomData.doReplyDismiss( isAgree ) ;
    }

    onReplayDismissRoom( idx : number , isAgree : boolean ) : void
    {
        this.mDlgDismiss.onPlayerRespone(idx,isAgree) ;
        if ( isAgree == false )
        {
            let p = this.mRoomData.mPlayers[idx];
            if ( p == null )
            {
                cc.error( "player is null ? idx = " + idx );
                return ;
            }
            
            let pd = PlayerInfoDataCacher.getInstance().getPlayerInfoByID( p.mPlayerBaseData.uid ) ;
            let name = " uid = " + p.mPlayerBaseData.uid ;
            if ( pd != null )
            {
                name = pd.name ;
            }

            Prompt.promptText( "玩家【"+ name + "】拒绝解散房间" );
        }
    }
}
