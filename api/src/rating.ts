import { IEV } from './db';

const K_FACTOR = 32;
let adjustmentFactor = 0;

const expectedOutcome = (ratingA: number, ratingB: number) : number =>  {
    return 1.0 / (1.0 + Math.pow(10, (ratingB - ratingA) / 400.0));
}

/**
 * Takes into account two player's rating, outcome and computes the new rating of player A
 * @param ratingA Rating of player A
 * @param ratingB Rating of player B
 * @param outcome Which player won. 1 if player A won, 0 if player A lost. Only applicable for 0 sum games
 * @returns New rating of player A
 */
export function adjustRating(ratingA: number, ratingB: number, outcome: number) : number {
    const expectedVictory: number = expectedOutcome(ratingA, ratingB);
    return ratingA + (K_FACTOR - adjustmentFactor) * (outcome - expectedVictory);
}

export function determineOutcome(playerAction: string, riverActionEvs: Array<IEV>) : number {
    const playerActionIEV: IEV = riverActionEvs.filter(action => action.option === playerAction)[0];

    let highestEV: number = -9999999;
    let optimalIEV: IEV = riverActionEvs[0];

    for (let i = 1; i < riverActionEvs.length; ++i) {
        const action: IEV = riverActionEvs[i];
        if (action.ev > highestEV) {
            highestEV = action.ev;
            optimalIEV = action;
        }
    }
    // If player gets problem wrong, adjust rating based off of how far off they were. 
    // If player gets problem correct, increase rating according to formula. 
    adjustmentFactor = playerActionIEV.option === optimalIEV.option ? 0 : K_FACTOR * (1 - (playerActionIEV.ev - playerActionIEV.ev) / playerActionIEV.ev);
    return playerActionIEV.option === optimalIEV.option ? 1 : 0;
}