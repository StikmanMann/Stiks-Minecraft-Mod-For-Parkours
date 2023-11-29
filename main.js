import {world, system, Player} from '@minecraft/server';
import "./checkpoints.js"
import "./betterChat.js"
import "./scoreboard.js"
import "./customName.js"
import "./hud.js"
import "./staticScripts/tickFunctions.js"
import "./testing.js"
import "./worldEdit/mainEdit.js"
import "./playerChange.js"
import "./staticScripts/drawFunctions.js"
import "./launchpads.js"
import "./playerMovement/jumpFunctions.js"
import "./options.js"
import "./saveData/chestData.js"
import "./debugging/debugCommands.js"
import "./tagAreas.js"
import "./playerMovement/playerBoost.js"
import { Logger } from './staticScripts/Logger.js';

//import "C:/Users/flori/AppData/Local/ Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState/games/com.mojang/development_behavior_packs/test BP/scripts/main.js" // world Edit :D


world.sendMessage("If you jsut startetd the world up, pelase type /retry")
Logger.log("IM HERE", "MAIN")
export {getPlayerObject}
//import * as ui from '@minecraft/server-ui';
//import * as gt from '@minecraft/server-gametest';

const commandPrefix = "!!";
console.warn("Script is running and switched");

class PlayerClass{
    /**
    * @type {Player}
    */
    #player

    /**
     * @param {Player} player 
     */
    constructor(player, index){
        this.#player = player;
        this.index = index;
    }

    /**
     * 
     * @returns {Player}
     */
    getPlayer(){
        return this.#player;
    }
    
}

/**
 * @type {PlayerClass[]}
 */
var players = []//world.getAllPlayers();

var playerArry = world.getAllPlayers();
for (let index = 0; index < playerArry.length; ++index) {
    players[index] = new PlayerClass(playerArry[index], index)
    //players[index].getPlayer().sendMessage("HI IM YOU")
    // ...use `element`...
}
//const item = new server.ItemStack("minecraft:redDye", 1);





/**
 *  @param {Player} player 
 * @returns {PlayerClass}
 */
function getPlayerObject(player){

    for(const playerObject of players)
    {
       // console.warn(`Checkign Object Player ${playerObject.getPlayer().name} with ${player.name}`)
        if(playerObject.getPlayer().name == player.name){
            //console.warn("Success")
            return playerObject;
        }
    }

    console.warn("You shouldnt se this message")
};

for(const element of world.getAllPlayers()){
    //console.warn(getPlayerObject(element).getPlayer().name)
   // getPlayerObject(element).getPlayer().sendMessage("DASLDJALJKDS")
}



/*
const form = new ui.ActionFormData()
form.title("Months");
form.body("Choose your favorite month!");
form.button("January");
form.button("February");
form.button("March");
form.button("April");
form.button("May");
*/
var getOuttaChat ={x: 0 , y: 1, z:0};

var counter = 0;

var lastPlayer = "test";

var showForm = false;

/*
server.world.events.beforeChat.subscribe(cb => {
    switch (cb.message) {
        case "!!myscores":
            form.show(cb.sender).then(response => {
                if (response.selection === 3) {
                    cb.sender.runCommandAsync(`say L86`)
                }
            })
            break;
    }
});
*/



world.afterEvents.playerJoin.subscribe(async (eventData) => {
    //const player = eventData.playerId;
   // player.
    //player.kill();

});
///*
world.beforeEvents.chatSend.subscribe(async (eventData) => {
    system.run(async () => {
        const player = eventData.sender;

        if (!eventData.message.startsWith(commandPrefix)) {return;}
        var msg = eventData.message;
        var splitMsg = msg.split(" ");

        switch (splitMsg.length) {
            case 1:
                console.warn("upperSwitch");
                switch (msg) {

                    case '!!gmc':
                        if (!player.hasTag('Admin')) return;
                        eventData.cancel = true;
                        await player.runCommandAsync('gamemode c');
                        break;


                    case '!!gms':
                        if (!player.hasTag('Admin')) return;
                        eventData.cancel = true;
                        await player.runCommandAsync('gamemode s');
                        break;


                // case '!!myscores':
                    //    eventData.cancel = true;
                //     player.runCommandAsync('damage @s 0')
                    //    player.tell('Close the chatbox to recive the UI (You got 2.5 Seconds to do so)');
                    //    showForm = true;
                    //    counter = 0;
                    //    lastPlayer = player.name;



                        break;
                    case '!!next':
                        if (!player.hasTag('parkour')) {
                            await player.runCommandAsync('tell @s You are currently not in a Parkour!');
                            eventData.cancel = true;
                            return;
                        }
                        else {
                            eventData.cancel = true;

                            var scoreboardCpId = world.scoreboard.getObjective('cpId');
                            var scoreCpId = scoreboardCpId.getScore(player.scoreboardIdentity)
                            var scoreboardCpIdMax = world.scoreboard.getObjective('cpIdMax');
                            var scoreCpIdMax = scoreboardCpIdMax.getScore(player.scoreboardIdentity)
                            console.warn("Current Score: " + scoreCpId);
                            console.warn("Current Score: " + scoreCpIdMax);
            
                            if (scoreCpId < scoreCpIdMax) {
                                player.teleport(cp[scoreCpId + 1]);
                                player.sendMessage("You are Now at CP" + (scoreCpId + 1));
                            }
                            else {
                                player.sendMessage("Your PB is: " + scoreCpIdMax + ", but you want to teleport to Cp" + (scoreCpId + 1));
                            }
                            break;
                        }

                    case '!!back':
                        eventData.cancel = true;

                        var scoreCpId = world.scoreboard.getObjective('cpId');
                        var score = scoreCpId.getScore(player.scoreboardIdentity)
            
                        console.warn("Current Score: " + score);

            
                        
                        if (score != 0) {
                            player.teleport(cp[score - 1]);
                            player.sendMessage("You are Now at CP" + (score - 1));
            
                        }
                        else {
                            player.teleport(cp[score]);
                            player.sendMessage("You are Now at CP" + score);
            
                        }
                        break;

                    case '!!help':
                        console.warn("!!help erkannt")
                        eventData.cancel = true;
                        player.sendMessage('You have following acces to commands: \n!!help - Duh\n!!next -  Teleport to the next CP(Only works till your PB)\n!!back - Teleport 1 CP backwards\n!!myscores -    No use');
                        break;
                    default:
                        //S eventData.cancel = true;
                        //player.runCommandAsync('tell @s ' + eventData.message + ' is not a valid cmd');
                }
                break;



            case 2:
                console.warn("bottom");
                
                break;
            default:
               // eventData.cancel = true;
               // player.runCommandAsync('tell @s ' + eventData.message + ' is not a valid cmd');
        }
    });
});
//*/