
import { system, world, Player, MolangVariableMap } from "@minecraft/server"
//import { sys } from "typescript";
export {TickFunctions}

class TickFunction{
     /**
     * @type {(() => void)[]}
     */
    tickFunction = [];

    /**
     * @type {number}
     */
    tick

    constructor(tickFunction, tick){
        this.tickFunction = tickFunction
        if(typeof tick == "undefined"){
            this.tick = 1
        }
        else{
            this.tick = tick
        }
        
    }
}

class TickFunctions{
    /**
     * @type {TickFunction[]}
     */
    static tickFunctions = [];

    static tick(){
        system.runInterval(() => {
            for(const func of this.tickFunctions){
                if(system.currentTick % func.tick == 0){
                    func.tickFunction()
                }
                
            }
        }, 1)
    }

    /**
     * 
     * @param {(() => void)} newFunction 
     */
    static addFunction(newFunction, tick){
        this.tickFunctions = this.tickFunctions.concat([new TickFunction(newFunction, tick)])
    }
}

TickFunctions.tick()