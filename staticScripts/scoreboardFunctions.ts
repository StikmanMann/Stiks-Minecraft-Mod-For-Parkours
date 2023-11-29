import { DisplaySlotId, ObjectiveSortOrder, Player, ScoreboardIdentity, ScoreboardObjective, system, world } from "@minecraft/server"
export {ScoreboardFunctions}
class ScoreboardFunctions{

    /**
     * Change the name of a player across all scoreboards.tsc --version
     * @param {string} oldName - The old name of the player.
     * @param {string} newName - The new name to set for the player.
     */
    static nameChange(oldName: string, newName: string): void {
        system.run(() => {
            world.scoreboard.getObjectives().forEach(scoreboard => {
                const oldScore = scoreboard.getScore(oldName) ?? 0;
                scoreboard.setScore(newName, oldScore);
                
                scoreboard.removeParticipant(oldName);
            });
        });
    }
    /**
     * Get the score for a player on a specific scoreboard.
     * If the player or scoreboard is not found, return 0.
     * @param {Player | string} player - The player or player name.
     * @param {ScoreboardObjective | string} scoreboardId - The objective or objective ID.
     * @returns {number} - The score for the player on the scoreboard.
     */
    static getScore(player: Player | string, scoreboardId: ScoreboardObjective | string): number {
        return system.run(() => {
            let playerName: string;
            let objectiveId: string;

            if (typeof player === 'string') {
                playerName = player;
            } else {
                playerName = player.nameTag;
            }

            if (typeof scoreboardId === 'string') {
                objectiveId = scoreboardId;
            } else {
                objectiveId = scoreboardId.id;
            }

            return world.scoreboard.getObjective(objectiveId)?.getScore(playerName) ?? 0;
        });
    }

    /**
     * Set the score for a player on a specific scoreboard.
     * @param {Player | string} player - The player or player name.
     * @param {ScoreboardObjective | string} scoreboardId - The objective or objective ID.
     * @param {number} value - The value to set for the player's score.
     */
    static setScore(player: Player | string, scoreboardId: ScoreboardObjective | string, value: number): void {
        system.run(() => {
            let playerName: string;
            let objectiveId: string;

            if (typeof player === 'string') {
                playerName = player;
            } else {
                playerName = player.nameTag;
            }

            if (typeof scoreboardId === 'string') {
                objectiveId = scoreboardId;
            } else {
                objectiveId = scoreboardId.id;
            }

            world.scoreboard.getObjective(objectiveId)?.setScore(playerName, value);
        });
    }

    /**
     * Remove a participant (player) from a specific scoreboard.
     * @param {Player | string} player - The player or player name to remove.
     * @param {ScoreboardObjective | string} scoreboardId - The objective or objective ID.
     */
    static removeParticipant(player: Player | string, scoreboardId: ScoreboardObjective | string): void {
        system.run(() => {
            let playerName: string;
            let objectiveId: string;

            if (typeof player === 'string') {
                playerName = player;
            } else {
                playerName = player.nameTag;
            }

            if (typeof scoreboardId === 'string') {
                objectiveId = scoreboardId;
            } else {
                objectiveId = scoreboardId.id;
            }

            world.scoreboard.getObjective(objectiveId)?.removeParticipant(playerName);
        });
    }
}