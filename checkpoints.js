import {world, system, Player, BlockPermutation, Block, Container, BlockInventoryComponent, ItemStack, ItemTypes, Vector, EffectType, EffectTypes} from '@minecraft/server';
import { BookData } from "./saveData/bookData";
import { ScoreboardFunctions } from './staticScripts/scoreboardFunctions';
//import { sys } from 'typescript';
import { CollisionFunctions } from './staticScripts/collisionFunctions';
import { VectorFunctions } from './staticScripts/vectorFunctions';
import { AwaitFunctions } from './staticScripts/awaitFunctions';
import { ActionbarMessage, HudManager, timer } from './hud';
import { DrawFunctions } from './staticScripts/drawFunctions';
import { GlobalVars } from './globalVars';
import { TickFunctions } from './staticScripts/tickFunctions';
import { ChestData } from './saveData/chestData';
import { DebugOptions } from './debugging/debugCommands';
export {oldParkour}
class Checkpoint extends ChestData{

    static spawnOffset = {x:0.5, y:0, z:0.5}
    /**
     * @type {Player[]}
     */
    #players;

    /**
     * @type {import('@minecraft/server').Vector3[]}
     */
    #checkpoints = []

    parkourBoundA
    parkourBoundB

    /**
     * @type {ItemStack}
     */
    backItem
    /**
     * @type {ItemStack}
     */
    forwardItem

    /**
     * 
     * @param {ItemStack} backwardItem 
     * @param {ItemStack} forwardItem 
     */
    setItems(backwardItem, forwardItem){
        this.backwardItem = backwardItem
        this.forwardItem = forwardItem
    }

    setParkourBounds(a, b){
        this.parkourBoundA = a
        this.parkourBoundB = b
    }
    /**
     * 
     * @param {import('@minecraft/server').Vector3} chestLocation 
     */
    constructor(chestLocation){
        
        super(chestLocation)
        TickFunctions.addFunction(() => this.tick(), 2)
              
    }


    async tick(){
        for(let i = 0; i < this.#checkpoints.length; i++){
            this.atStart = false
            const cp = this.#checkpoints[i]
            for(const player of GlobalVars.players){
                    
                player.getComponent("inventory").container.setItem(8, this.forwardItem)
                player.getComponent("inventory").container.setItem(7, this.backwardItem)
                
                if(player.location.y < -59.5){
                    //player.addEffect("blindness", 40)
                    let failTp = VectorFunctions.addVector(this.#checkpoints[ScoreboardFunctions.getScore(player, "currentCp")], Checkpoint.spawnOffset)
                    player.teleport({x: player.location.x, y:player.location.y + 1.5, z: player.location.z})
                    await DrawFunctions.drawGraph(20, player.location, VectorFunctions.addVector(this.#checkpoints[ScoreboardFunctions.getScore(player, "currentCp")], Checkpoint.spawnOffset), player)
                    await AwaitFunctions.waitTicks(1)
                    player.teleport(failTp)
                    ScoreboardFunctions.setScore(player, "deaths", ScoreboardFunctions.getScore(player, "deaths") + 1)
                    player.removeEffect("blindness")
                    //player.applyKnockback(0, 0, 0, -5)
                        
                    //player.addEffect("slowness", 5, {amplifier: 5})
                    player.playSound("note.bassattack")
                }
                //world.sendMessage(`${CollisionFunctions.insideBox(player.location, VectorFunctions.subtractVector(cp, {x:1, y:1, z:1}), VectorFunctions.addVector(cp, {x:1, y:1, z:1}))}`)
                let boxSize = 1
                if(CollisionFunctions.insideBox(player.location, VectorFunctions.subtractVector(cp, {x:boxSize, y:0.1, z:boxSize}), VectorFunctions.addVector(cp, {x:boxSize, y:2, z:boxSize}), DebugOptions.debug)){
                    if(ScoreboardFunctions.getScore(player, "currentCp") != i){
                        player.addEffect("night_vision", 40)
                        if(i > ScoreboardFunctions.getScore(player, "maxCp")){
                            player.playSound("random.levelup")
                            for(let n = 0; n < 10; n++){
                                overworld.spawnParticle("minecraft:totem_particle", VectorFunctions.addVector(player.location, VectorFunctions.multiplyVector(VectorFunctions.getForwardVectorFromRotationXY(player.getRotation().x, player.getRotation().y), 3)))
                            }
                            HudManager.addActionbarMessage(new ActionbarMessage(
                                player,
                                `§aNew Record! | CP: ${i}`,
                                50
                            ))
                            ScoreboardFunctions.setScore(player, "maxCp", i)
                        }
                        else{
                            player.playSound("conduit.activate")
                            overworld.spawnParticle("minecraft:totem_particle", player.location)
                            HudManager.addActionbarMessage(new ActionbarMessage(
                                player,
                                `§aCP: ${i}`,
                                50
                            ))
                        }
                        ScoreboardFunctions.setScore(player, "currentCp", i)
    

                    }
                }
            }
        }
    }

    updateLore(){
        AwaitFunctions.doAttempts(10, 30, () => { 
            world.sendMessage("AGAGAGAG")
            this.readLore()
            
            this.#checkpoints = []
            let currentLore = this.getLore()
            for(let i = 0; i < currentLore.length; i++){
                let splitCoordinates = currentLore[i].split(" ")
                this.#checkpoints[i] = {x: Math.floor(splitCoordinates[0]), y: Math.floor(splitCoordinates[1]), z: Math.floor(splitCoordinates[2])}
                //world.sendMessage(`${this.#checkpoints[i].x} ${this.#checkpoints[i].y} ${this.#checkpoints[i].z}`)
            }
        })
       
    }

    /**
     * 
     * @param {number} index 
     * @returns {Vector3}
     */
    getCp(index){

        let vector = this.#checkpoints[index]
        return vector
    }

    addCp(newCp){
        this.addLore(`${newCp.x} ${newCp.y} ${newCp.z}`)
        this.updateLore()
    }

    removeCp(index){
        this.removeLore(index)
        this.updateLore()
    }

    /**
     * 
     * @param {Player} player
     * @param {number} index 
     * 
     */
    tpToCp(player, index){
        player.teleport(VectorFunctions.addVector(this.#checkpoints[index], Checkpoint.spawnOffset))
        player.playSound("note.pling")
    } 
}
const overworld = world.getDimension("overworld")
const commandPrefix = ";;";

let oldParkour = new Checkpoint({x:0, y:-60, z:5})

let forwardItem = new ItemStack(ItemTypes.get("minecraft:red_dye"));
forwardItem.nameTag = "§cPrevious Checkpoint"

const backwardItem = new ItemStack(ItemTypes.get("minecraft:lime_dye"));
backwardItem.nameTag = "§aNext Checkpoint";

system.run(() => {
    for(const player of GlobalVars.players){
        player.getComponent("inventory").container.setItem(8, forwardItem)
    }
})

oldParkour.setItems( forwardItem, backwardItem)

    

world.beforeEvents.itemUse.subscribe(async (eventData) => {
    system.run(async () => {
        var player = eventData.source;
        
    
        switch (eventData.itemStack.typeId) {
            case 'minecraft:lime_dye':
    
                if (ScoreboardFunctions.getScore(player, "currentCp")  < ScoreboardFunctions.getScore(player, "maxCp")) {
                    timer.addPenalty(3000)
                    ScoreboardFunctions.setScore(player, "deaths", ScoreboardFunctions.getScore(player, "deaths") + 5)
                    oldParkour.tpToCp(player, ScoreboardFunctions.getScore(player, "currentCp") + 1)
                    HudManager.addActionbarMessage(new ActionbarMessage(
                        player,
                        "§aYou are Now at CP" + (ScoreboardFunctions.getScore(player, "currentCp") + 1) + " |§4§l Penalty: 5 Deaths 300 Ticks",
                        50
                    ))
                    player.runCommand("clear @s feather")
                   // player.sendMessage("§aYou are Now at CP" + (ScoreboardFunctions.getScore(player, "currentCp") + 1) + " |§4§l Penalty: 5 Deaths 300 Ticks");
                }
                else {
                    player.sendMessage("Your PB is: " + ScoreboardFunctions.getScore(player, "maxCp") + ", but you want to teleport to Cp" + (ScoreboardFunctions.getScore(player, "currentCp") + 1));
                }
                break;

            case "minecraft:red_dye": 
                if (ScoreboardFunctions.getScore(player, "currentCp") != 0) {
                    oldParkour.tpToCp(player, ScoreboardFunctions.getScore(player, "currentCp") - 1);
                    player.sendMessage("You are Now at CP" + (ScoreboardFunctions.getScore(player, "currentCp") - 1));
    
                }
                else {
                    oldParkour.tpToCp(player, ScoreboardFunctions.getScore(player, "currentCp"));
                    player.sendMessage("You are Now at CP" + ScoreboardFunctions.getScore(player, "currentCp"));
    
                }
                break;
    
        }
    });
    
    /* system.runInterval(async (eventData) => {
        if (showForm == true) {
            counter += 1;
            if (counter > 50) {
                // world.say('1sec');
                for (var i = 0; i < players.length; i++) {
                    if (players[i].name == lastPlayer) {
                        var showFormTo = players[i];
                        form.show(showFormTo).then((response) => {
    
                            if (response.selection === 3) {
                                world.say('L89  ');
                            }
                        });
                    }
    
                }
                counter = 0;
                showForm = false;
            }
        } */
        // world.say(players[0].name);
        /*
        for (var i = 0; i < players.length; i++) {
            if (players[i].name == 'StikmanMann') {
                var stik = players[i];
            }
     
        }
        */
    //})
   
});

//Checkpoint Commands
world.beforeEvents.chatSend.subscribe((eventData) => {
    system.run(() => {
        let message = eventData.message;
        if(!message.startsWith(commandPrefix)) {return}
        
        let player =  eventData.sender // You could just do getPlayerObject(eventData.sender).getPlayer() but this looks lame
        let msgSplit = message.split(" ")

        switch(msgSplit[0]){
            case ";;addCp":
                try{
                    if(msgSplit.length != 4) {throw("Expected split array of length 4")}
                    for(var i = 0; i < 3; i++){
                        let num = Math.floor(msgSplit[i + 1])
                        if(isNaN(num)) { throw("Not a Number! \nError: " + msgSplit[i + 1]) }
                    } 
                    let newCp = {x: Math.floor(msgSplit[1]), y: Math.floor(msgSplit[2]), z: Math.floor(msgSplit[3])}
                    
                    oldParkour.addCp(newCp)

                }
                catch(e){
                    player.sendMessage("Something went wrong \nYour command: §4" + message + "\n" + e)
                }
                break;
            case ";;removeCp":
                try{
                    if(msgSplit.length != 2) {throw("Expected split array of length 2")}
                    let num = Math.floor(msgSplit[1])
                    if(isNaN(num)) { throw("Not a Number! \nError: " + msgSplit[1]) }
                    
                    oldParkour.removeCp(num)

                }
                catch(e){
                    player.sendMessage("Something went wrong \nYour command: §4" + message + "\n" + e)
                }
                break;
            case ";;readCp":
                oldParkour.readLore()
                break;
            case ";;help":
                player.sendMessage(`;;addCp x y z \n;;removeCp index "starts from 0"\n;;readCp`)
        }
    })
})