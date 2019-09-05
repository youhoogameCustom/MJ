import ILayer from "../ILayer";
import MJRoomData from "../roomData/MJRoomData";
import RoomPlayer, { eRoomPlayerState } from "./RoomPlayer";
import { eChatMsgType } from "../roomDefine";
import MJPlayerData from "../roomData/MJPlayerData";
import Prompt from "../../../globalModule/Prompt";
import VoiceManager from "../../../sdk/VoiceManager";
import PlayerInteractEmoji from "./PlayerInteractEmoji";
import MJRoomScene from "../MJRoomScene";

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
export default class LayerPlayers extends ILayer {

    @property( [RoomPlayer] )
    mPlayers : RoomPlayer[] = [] ;

    @property(cc.Node)
    mBankIcon : cc.Node = null ;

    @property(cc.Node)
    mBtnReady : cc.Node = null ;

    @property(PlayerInteractEmoji)
    mInteractEmoji : PlayerInteractEmoji = null ;
    
    protected mRoomData : MJRoomData = null ;
    mScene : MJRoomScene = null ;
    // LIFE-CYCLE CALLBACKS:

    onLoad () 
    {
        cc.systemEvent.on(VoiceManager.EVENT_QUEUE_START_PLAY,this.onEvent,this) ;
        cc.systemEvent.on(VoiceManager.EVENT_QUEUE_PLAY_FINISH,this.onEvent,this) ;
    }

    onDestroy()
    {
        cc.systemEvent.targetOff(this);
    }

    protected onEvent( event : cc.Event.EventCustom )
    {
        let eventID = event.getEventName();
        let jsDetail = event.detail ;
        switch (eventID )
        {
            case VoiceManager.EVENT_QUEUE_START_PLAY:
            case VoiceManager.EVENT_QUEUE_PLAY_FINISH:
            {
                let uid : number = jsDetail["uid"] ;
                let p = this.mRoomData.getPlayerDataByUID( uid );
                if ( p == null )
                {
                    cc.error( "player is null , how to play voice" );
                    return ;
                }
                let clientIdx = this.mRoomData.svrIdxToClientIdx(p.mPlayerBaseData.svrIdx);

                if ( eventID == VoiceManager.EVENT_QUEUE_START_PLAY )
                {
                    this.mPlayers[clientIdx].startChatVoice();
                }
                else
                {
                    this.mPlayers[clientIdx].stopChatVoice();
                }
                
            }
            default:
            console.error( "unknown event voice = " + eventID );
        }
    }

    start () {

    }

    refresh( data : MJRoomData ) : void 
    {
        this.mRoomData = data ;
        let nselfIdx = data.getSelfIdx();
        let isSelfSitDown = nselfIdx != -1 ;
        for ( let svrIdx = 0 ; svrIdx < this.mPlayers.length ; ++svrIdx )
        {
            let clientIdx = data.svrIdxToClientIdx(svrIdx);
            if ( clientIdx >= this.mPlayers.length )
            {
                cc.error( "invlid svridx and client idx " + svrIdx + " c = " + clientIdx );
                continue ;
            }
            
            this.mPlayers[clientIdx].mSvrIdx = svrIdx;
            if ( data.mPlayers[svrIdx] == null || data.mPlayers[svrIdx].isEmpty() )
            {
                this.mPlayers[clientIdx].state = isSelfSitDown == false ? eRoomPlayerState.RPS_WaitSitDown : eRoomPlayerState.RPS_Empty ;
            }
            else
            {
                this.mPlayers[clientIdx].state = eRoomPlayerState.RPS_Normal ;
                this.mPlayers[clientIdx].setInfo( data.mPlayers[svrIdx].mPlayerBaseData );
                this.mPlayers[clientIdx].isReady = data.mBaseData.isInGamingState() == false  && data.mPlayers[svrIdx].mPlayerBaseData.isReady ;
            }
        }

        if ( this.mRoomData.mBaseData.isInGamingState() )
        {
            this.setBankerIdx( data.mBaseData.bankerIdx ) ;
        }
        this.mBtnReady.active = this.mRoomData.mBaseData.isInGamingState() == false && isSelfSitDown && data.mPlayers[nselfIdx].mPlayerBaseData.isReady == false ;

        this.refreshPlayerChips();
    }

    refreshPlayerChips()
    {
        for ( let svrIdx = 0 ; svrIdx < this.mPlayers.length ; ++svrIdx )
        {
            let clientIdx = this.mRoomData.svrIdxToClientIdx(svrIdx);
            if ( clientIdx >= this.mPlayers.length || this.mRoomData.mPlayers[svrIdx] == null || this.mRoomData.mPlayers[svrIdx].isEmpty() )
            {
                cc.error( "invlid svridx and client idx " + svrIdx + " c = " + clientIdx );
                continue ;
            }
            
            this.mPlayers[clientIdx].mSvrIdx = this.mRoomData.mPlayers[svrIdx].mPlayerBaseData.chip;
 
        }
    }

    setBankerIdx( svrIdx : number )
    {
        let clientIdx = this.mRoomData.svrIdxToClientIdx(svrIdx);
        if ( clientIdx >= this.mPlayers.length )
        {
            return ;
        }
        let targetPos = this.mBankIcon.parent.convertToNodeSpaceAR( this.mPlayers[clientIdx].bankIconWorldPos ) ; 
        cc.tween(this.mBankIcon).to(0.3, { position: targetPos }, { easing: 'sineOut'}).start() ;
    }

    onPlayerStandUp( idx : number ) : void
    {
        let nselfIdx = this.mRoomData.getSelfIdx();
        if ( idx == nselfIdx || -1 == nselfIdx )
        {
            this.refresh(this.mRoomData);
            return ;
        }

        let clientIdx = this.mRoomData.svrIdxToClientIdx( nselfIdx );
        this.mPlayers[clientIdx].state = nselfIdx == -1 ? eRoomPlayerState.RPS_WaitSitDown : eRoomPlayerState.RPS_Empty ;
    }

    onPlayerReady( idx : number ) : void 
    {
        let clientIdx = this.mRoomData.svrIdxToClientIdx( idx );
        this.mPlayers[clientIdx].isReady = true ;
        if ( idx == this.mRoomData.getSelfIdx() )
        {
            this.mBtnReady.active = false ;
        }
    }

    onPlayerNetStateChanged( playerIdx : number , isOnline : boolean ) : void 
    {
        let clientIdx = this.mRoomData.svrIdxToClientIdx( playerIdx );
        this.mPlayers[clientIdx].isOnline = isOnline ;
    }

    onPlayerChatMsg( playerIdx : number , type : eChatMsgType , strContent : string ) : void 
    {
        let clientIdx = this.mRoomData.svrIdxToClientIdx(playerIdx);
        if ( clientIdx >= this.mPlayers.length )
        {
            Prompt.promptText( "没有坐下的玩家不能说话" );
            return ;
        }

        switch ( type )
        {
            case eChatMsgType.eChatMsg_Emoji:
            {
                this.mPlayers[clientIdx].setChatEmoji(strContent);
            }
            break ;
            case eChatMsgType.eChatMsg_SysText:
            {
                this.mPlayers[clientIdx].setChatText(strContent);
            }
            break ;
            case eChatMsgType.eChatMsg_Voice:
            {

            }
            break ;
            default:
            Prompt.promptText( "unknown type = " + type + " c = " + strContent );
        }
    }

    onPlayerInteractEmoji( InvokeIdx : number , targetIdx : number , emoji : string ) : void 
    {
        let orgPos : cc.Vec2 = null ;
        let dstPos : cc.Vec2 = null ;
        for ( let clientIdx = 0 ; clientIdx < this.mPlayers.length && ( orgPos == null || dstPos == null ); ++clientIdx )
        {
            let p = this.mPlayers[clientIdx];
            if ( p.mSvrIdx == InvokeIdx )
            {
                orgPos = p.worldPosEmoji;
                continue ;
            }

            if ( p.mSvrIdx == targetIdx )
            {
                dstPos = p.worldPosEmoji ;
            }
        }

        if ( dstPos == null || null == dstPos )
        {
            cc.error( "some pos is null" );
            return ;
        }

        this.mInteractEmoji.playInteractEmoji(emoji,orgPos,dstPos) ;
    }

    onPlayerSitDown( p : MJPlayerData ) : void
    {
        if ( p.mPlayerBaseData.svrIdx == this.mRoomData.getSelfIdx() )
        {
            this.refresh( this.mRoomData );
            return ;
        }

        let clientIdx = this.mRoomData.svrIdxToClientIdx(p.mPlayerBaseData.svrIdx);
        this.mPlayers[clientIdx].state = eRoomPlayerState.RPS_Normal ;
        this.mPlayers[clientIdx].setInfo(p.mPlayerBaseData);
        this.mPlayers[clientIdx].isReady = p.mPlayerBaseData.isReady && this.mRoomData.mBaseData.isInGamingState();
    }

    onGameStart() : void 
    {
        for ( let p of this.mPlayers )
        {
            p.isReady = false ;
        }
        this.setBankerIdx( this.mRoomData.mBaseData.bankerIdx );
    }

    onClickPlayer( isSitDown : boolean , arg : number )
    {
        if ( isSitDown )
        {
            if ( this.mRoomData.getSelfIdx() == -1 )
            {
                this.mRoomData.doClickedSitDown(arg) ;
            }
        }
        else
        {
            //layer dlg show player info ;
            //cc.log( "clicked player uid = " + arg );
            this.mScene.showDlgPlayerInfo( arg ) ;
        }
    }

    onBtnSetReady()
    {
        this.mRoomData.doReady();
    }
    // update (dt) {}
}
