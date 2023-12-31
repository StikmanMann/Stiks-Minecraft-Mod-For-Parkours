import {world, system, Player, BlockPermutation, Block, Container, BlockInventoryComponent, ItemStack, ItemTypes, Vector} from '@minecraft/server';
import { ScoreboardFunctions } from './staticScripts/scoreboardFunctions';
import { oldParkour } from './checkpoints';
import { CollisionFunctions } from './staticScripts/collisionFunctions';
import { VectorFunctions } from './staticScripts/vectorFunctions';
import { Logger } from './staticScripts/Logger';
import { GlobalVars } from './globalVars';
import { TickFunctions } from './staticScripts/tickFunctions';
//import { listenerCount } from 'gulp';

export { timer, ActionbarMessage, HudManager}

class ActionbarMessage{
    /**
     *  @type {Player} 
    */
        player
    /**
     * @type {String}
     */
    message 

    /**
     * @type {number}
     */
    lifetime


    /**
     * 
     * @param {Player} player 
     * @param {String} message 
     * @param {number} lifetime 
     */
    constructor(player, message, lifetime){
        this.player = player
        this.message = message
        this.lifetime = lifetime
    }
}



class HudManager{
    /**
     * @type {ActionbarMessage[]}
     */
    static actionbarMessages = []

    static init(){
        TickFunctions.addFunction(() => this.tick())
    }

    static tick(){
        for(const player of GlobalVars.players){
            let combiendMessage = ""
            let maxLength = 0 
            for(let i = 0; i < this.actionbarMessages.length; i++){
                if(this.actionbarMessages[i].message.length > maxLength){
                    maxLength = this.actionbarMessages[i].message.length
                }
            }
            for(let i = 0; i < this.actionbarMessages.length; i++){
                //world.sendMessage(`YO ${this.actionbarMessages[i].player.name} = ${ player.name}`)
                if(this.actionbarMessages[i].player.name == player.name){
                    
                    let addSpace = Math.ceil((maxLength - this.actionbarMessages[i].message.length) / 2)
                    //world.sendMessage(""+maxLength + " T: " + this.actionbarMessages[i].message.length + " A: " + addSpace)
                    for(let i = 0; i < addSpace; i++){
                        combiendMessage = `${combiendMessage} `
                    }
                    combiendMessage = `${combiendMessage}${this.actionbarMessages[i].message}\n`
                    this.actionbarMessages[i].lifetime = this.actionbarMessages[i].lifetime - 1
                    if(this.actionbarMessages[i].lifetime < 1){
                        this.actionbarMessages = this.actionbarMessages.slice(0, i).concat(this.actionbarMessages.slice(i+1))
                    
                        
                    }
                }
                    
            }
            player.onScreenDisplay.setActionBar(combiendMessage)
        }
        
    }
    /**
     * 
     * @param {actionbarMessage} actionbarMessage
     */
    static addActionbarMessage(actionbarMessage){
        this.actionbarMessages = this.actionbarMessages.concat([actionbarMessage])
    }
    /**
     * 
     * @param {Player} player
     * @param {String} message
     * @param {number} lifetime For how many ticks to display
     */
    //addActionbarMessageScratch(player, message, lifetime){
     //   this.actionbarMessages.concat([new ActionbarMessage(player, message, lifetime)])
    //}
}

HudManager.init()
for(const player of world.getAllPlayers()){
    HudManager.addActionbarMessage(new ActionbarMessage(player, `§a§lHud initalised!`, 100))
}

class Timer{

    #queuePenalty = 0;

    init(){
        system.runInterval(async () => {
            for(const player of GlobalVars.players){
                //world.getDimension("overworld").spawnParticle("minecraft:totem_particle", VectorFunctions.addVector(player.location, VectorFunctions.multiplyVector(VectorFunctions.getForwardVectorFromRotationXY(player.getRotation().x, player.getRotation().y), 3)))
                if(!CollisionFunctions.insideBox(player.location, VectorFunctions.subtractVector(oldParkour.getCp(0), {x:2, y:2, z:2}), VectorFunctions.addVector(oldParkour.getCp(0), {x:2, y:2, z:2}))){
                    
                    if(this.#queuePenalty != 0) {
                        await ScoreboardFunctions.setScore(player, "ticks", ScoreboardFunctions.getScore(player, "ticks") + 1 + this.#queuePenalty)
                        this.#queuePenalty = 0
                    }
                    else{
                        await ScoreboardFunctions.setScore(player, "ticks", ScoreboardFunctions.getScore(player, "ticks") + 1)
                    }
                    
         
                }
                else{
                    ScoreboardFunctions.setScore(player, "ticks", 0)
                    ScoreboardFunctions.setScore(player, "deaths", 0)
                }
        
                let ticks = ScoreboardFunctions.getScore(player, "ticks")
                let seconds = ticks / 20;
                let hours = Math.floor(seconds / 60 / 60)
                let minutes = Math.floor(seconds / 60 % 60)
                let roundSeconds = Math.floor(seconds % 60)
                HudManager.addActionbarMessage( new ActionbarMessage(
                    player,
                    `§a${hours}:${minutes}:${roundSeconds}:${((seconds%1).toFixed(2)).toString().slice(2)} | Ticks: ${ScoreboardFunctions.getScore(player, "ticks")} | Deaths: ${ScoreboardFunctions.getScore(player, "deaths")}`,
                    1
                ))
                //player.onScreenDisplay.setActionBar(`§a ${hours}:${minutes}:${roundSeconds}:${((seconds%1).toFixed(2)).toString().slice(2)} | Ticks: ${ScoreboardFunctions.getScore(player, "ticks")} | At ${20}TPS`)
            }
        })
    }

    /**
     * 
     * @param {*} amount 
     */
    addPenalty(amount){
        this.#queuePenalty = amount
    }
}

let timer = new Timer 
