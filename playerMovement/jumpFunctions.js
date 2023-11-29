import { Player, world } from "@minecraft/server";
import { GlobalVars } from "../globalVars";
import { TickFunctions } from "../staticScripts/tickFunctions";
import { VectorFunctions } from "../staticScripts/vectorFunctions";
import { ActionbarMessage, HudManager } from "../hud";



class Jumpfunctions{
    /**
     * @type {(() => void)[]}
     */
    static jumpFunctions = [];

    /**
     * @type {Player}
     */
    static jumpingPlayers = []

    /**
     * @type {Player}
     */
    static slidingPlayers = []

    static init(){
        TickFunctions.addFunction(() => this.tick())
    }

    static tick(){
        for(const player of GlobalVars.players){
            
          // 
            //HudManager.addActionbarMessage(new ActionbarMessage(player, `§a§lWall jump enabled!`, 1))
            this.wallSlide(player)
            

            if(this.jumpingPlayers.find(existingPlayer => existingPlayer === player)) {

                if(!player.isJumping){
                    this.jumpingPlayers = this.jumpingPlayers.filter(existingPlayer => existingPlayer !== player);
                }
            }
            else{

                if(player.isJumping){
                    //world.sendMessage(`${player.name} jumped!`)
                    this.wallJump(player)
                    this.jumpingPlayers = this.jumpingPlayers.concat([player])

                }
            }
                  
        }
    }

    

    /**
     * @param {Player} player
     */
    static wallSlide(player){
        
        if(!player.hasTag("wallJump")) {return;}
        //world.sendMessage("TESTING ")
        const playerRot = player.getRotation()
        let rotY = playerRot.y - 90
        let rotYadd = 15;
        let blockTrue = true;
        for(let i = -1; i<2; i++){
            const blockLocation = VectorFunctions.addVector(player.location, VectorFunctions.rotateVectorY({x: Math.cos((rotY) * (Math.PI / 180) ), y: 0, z: Math.sin((rotY) * (Math.PI / 180))}, rotYadd * i))
            GlobalVars.overworld.spawnParticle("minecraft:basic_flame_particle", blockLocation)
            if(GlobalVars.overworld.getBlock(blockLocation).typeId == "minecraft:air" || GlobalVars.overworld.getBlock(blockLocation).typeId == "minecraft:packed_ice"){
                
                blockTrue = false
            }
        }
        

        if(blockTrue) {
            player.addEffect("slow_falling", 10, {amplifier: 4, showParticles: false})
            if(!this.slidingPlayers.find(existingPlayer => existingPlayer === player)) {
                player.playSound("note.pling")
            }
            this.slidingPlayers = this.slidingPlayers.concat([player])
            
        }
        else{
            this.slidingPlayers = this.slidingPlayers.filter(existingPlayer => existingPlayer !== player);
        }
            
        
    }
    /**
     * @param {Player} player
     */
    static wallJump(player){
        if(player.hasTag("wallJump")){
            const playerRot = player.getRotation()
            if(typeof player.getEffect("slow_falling") != "undefined"){
                player.applyKnockback(Math.sin(playerRot.y * (Math.PI / 180) *-1), Math.cos(playerRot.y * (Math.PI / 180) *-1), 1, 0.75 + player.getVelocity().y/ -3)
            }
        }
    }

    /**
     * 
     * @param {actionbarMessage} actionbarMessage
     */
    static addFunction(newFunction){
        world.sendMessage("PSL WORKSDOSADK")
        this.tickFunctions = this.tickFunctions.concat([newFunction])
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
Jumpfunctions.init()

