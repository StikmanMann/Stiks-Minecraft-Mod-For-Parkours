import { ActionFormData, ModalFormData, ModalFormResponse } from "@minecraft/server-ui";
import { BookData } from "./saveData/bookData";
import { MolangVariableMap, Player, system, world } from "@minecraft/server";
import { Logger } from "./staticScripts/Logger";
import { AwaitFunctions } from "./staticScripts/awaitFunctions";
import { CollisionFunctions } from "./staticScripts/collisionFunctions";
import { VectorFunctions } from "./staticScripts/vectorFunctions";
import { GlobalVars } from "./globalVars";
import { TickFunctions } from "./staticScripts/tickFunctions";
import { ChestData } from "./saveData/chestData"
import { DebugOptions } from "./debugging/debugCommands";
import { ActionbarMessage, HudManager } from "./hud";

class TagVars{
    /**
     * @type {import("@minecraft/server").Vector3}
     */
    startLoc

    /**
     * @type {import("@minecraft/server").Vector3}
     */
    endLoc

    /**
     * @type {string}
     */
    tag

    /**
     * 
     * @param {String} str 
     */
    constructor(str){
        let splitStr = str.split(" ")
        this.startLoc = {x: Number(splitStr[0]), y: Number(splitStr[1]), z: Number(splitStr[2])}
        this.endLoc = {x:Number(splitStr[3]), y: Number(splitStr[4]), z: Number(splitStr[5])}
        this.tag = splitStr[6]

    }
}

class TagArea extends ChestData{

    static knownTags = ["wallJump", "giveLauncher"]
    
    static gui = new ModalFormData()
                .title("Cool GUI for TagArea Creation")
                .textField("Starting Coords of Hitbox", "For example: 30 -60 10")
                .textField("Ending Coords of Hitbox", "For example: 25 -55 15")
                .dropdown("Known Tags (GUI doesnt support custom Tags)", this.knownTags)
                

    static expectedValues = 7

    /**
     * @type {TagVars[]}
     */
    #tagVarsArr = []
    
    /**
     * @type {MolangVariableMap} 
     * */
    molangVars = new MolangVariableMap()
    .setColorRGBA("variable.color", { red: 255, green: 0, blue: 255, alpha: 255 })
    

    constructor(chestLocation){
        super(chestLocation)
       
        TickFunctions.addFunction(() => this.tick(), 5)
        
    }

    tick(){
       
        for(const player of GlobalVars.players){
            let tags = player.getTags()   
            for(let i = 0; i < this.#tagVarsArr.length; i++){
                let tagVars = this.#tagVarsArr[i]
                //world.sendMessage(`${CollisionFunctions.insideBox(player.location, tagVars.startLoc, tagVars.endLoc)}`)

                if(CollisionFunctions.insideBox(player.location, tagVars.startLoc, tagVars.endLoc, true, "minecraft:basic_flame_particle")){    
                    //world.sendMessage(`${speed}`)
                    //player.playSound("firework.launch")
                    if(DebugOptions.debug){HudManager.addActionbarMessage(new ActionbarMessage(player, `DEBUG - In area ${i} with Tag ${tagVars.tag}`, 5))}
                    player.addTag(tagVars.tag)
                    tags = tags.filter(tag => tag !== tagVars.tag)
                }
               
            }
            tags = tags.filter(tag => tag !== "Admin")
            tags = tags.filter(tag => tag !== "worldEdit")
            tags.forEach(tag => {
                player.removeTag(tag)
            })
        }

    }

    updateLore(){
        //  super.readLore()
        AwaitFunctions.doAttempts(10, 30, () => { 
            this.#tagVarsArr = []
            let currentLore = this.getLore()
            for(let i = 0; i < currentLore.length; i++){
                let splitCoordinates = currentLore[i].split(" ")
                this.#tagVarsArr[i] = new TagVars(currentLore[i])
                //world.sendMessage(`${this.#checkpoints[i].x} ${this.#checkpoints[i].y} ${this.#checkpoints[i].z}`)
            }
        })
    }

    addTagArea(newTagArea){
        this.addLore(newTagArea)
        this.readLore()
        this.updateLore()
    }
}
const overworld = world.getDimension("overworld")
const commandPrefix = ";;";

let tagArea = new TagArea({x:0, y:-60, z:2})

world.beforeEvents.chatSend.subscribe((eventData) => {
    system.run(async () => {
        let message = eventData.message;
        if(!message.startsWith(commandPrefix)) {return}
        
        let player =  eventData.sender // You could just do getPlayerObject(eventData.sender).getPlayer() but this looks lame

        const msgSplit = message.split(" ")
        switch(msgSplit[0]){
            case ";;addTagArea":
                let combinedString = "";
                /**
                * @type {ModalFormResponse}
                */
                let formResult
                if(msgSplit.length == 1){
                    let attempts = 0;
                    player.sendMessage("Please close Chat to make the GUI appear!")
                    do{formResult = await TagArea.gui.show(player); attempts++;await AwaitFunctions.waitTicks(5); Logger.log(formResult.cancelationReason, "Form Canceled")} while(attempts<10 && formResult.cancelationReason == "UserBusy");
                    if(formResult.canceled) {return;}

                    Logger.log("Form Recived!", "Form")
                    if(formResult.canceled) {Logger.log(formResult.cancelationReason, "Form Canceled");return}
                    Logger.log("Form Not Canceled", "Form")

                    for(let i = 0; i < formResult.formValues.length; i++){
                        const result = formResult.formValues[i]
                        if(typeof result != "string") {return}
                        if(i == 3){
                            combinedString = `${combinedString}${result} `
                            break;
                        }
                        const strSplit = result.split(" ")
                        for(const str of strSplit){
                            if(isNaN(str)) {player.sendMessage(`Expected Number! ${str}`); return}
                        
                            combinedString = `${combinedString}${str} `
                        }
                        
                    }
     
                    Logger.log(resultsString, "FORM END")
                } else if(msgSplit.length == TagArea.expectedValues + 1){
                    for(let i = 1; i < msgSplit.length; i++){
                        if(i == TagArea.expectedValues){
                            combinedString = `${combinedString}${msgSplit[i]} `
                            break;
                        }
                        if(isNaN(msgSplit[i])) {player.sendMessage(`Expected Number! ${msgSplit[i]}`); return}
                        
                        combinedString = `${combinedString}${msgSplit[i]} `
                    }
                } else{
                    player.sendMessage(`Expected ${TagArea.expectedValues} Values | Or only type ;;addTagArea for GUI`)
                    return;
                }
                
                tagArea.addTagArea(combinedString)
                Logger.log(combinedString, "FORM END")
                
                break;
            case ";;removeTagArea":
                try{
                    if(msgSplit.length != 2) {throw("Expected split array of length 2")}
                    let num = Math.floor(msgSplit[1])
                    if(isNaN(num)) { throw("Not a Number! \nError: " + msgSplit[1]) }
                    
                    tagArea.removeLore(num)

                }
                catch(e){
                    player.sendMessage("Something went wrong \nYour command: §4" + message + "\n" + e)
                }
                break;

        }
    })
})

