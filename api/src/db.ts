import { Schema, model, connect } from 'mongoose';
import { determineOutcome, adjustRating } from './rating';

interface ICompletedProblem {
    problem_id: string;
    time_completed: string;
    player_action: string;
}

export interface IEV {
    option: string;
    ev: number;
}

interface IHistoryAction {
    street: string;
    actor: string;
    option: string;
}

interface IProblem {
    problem_elo: number;
    time_created: number;

    hero_position: string;
    villain_position: string;

    hole_cards: string;
    board: string;

    action_history: Array<IHistoryAction>
    river_option_evs: Array<IEV>;
}

interface IProblemReturn {
    holeCards: string;
    boardCards: string;
    actionHistory: Array<IHistoryAction>;
    problemElo: number;
}

interface IUser {
    user_elo: number;
    user_id: string;
    password: string;
    problems_completed: Array<ICompletedProblem>;
}
  
const usersSchema = new Schema<IUser> ({
    user_elo: { type: Number, required: true },
    user_id: { type: String, required: true },
    password: { type: String, required: true },
    problems_completed: { type: [], required: true}
});

const problemSchema = new Schema<IProblem> ({
    problem_elo: { type: Number, required: true },
    time_created: { type: Number, required: true },
    
    hero_position: { type: String, required: true},
    villain_position: { type: String, required: true },

    hole_cards: { type: String, required: true },
    board: { type: String, required: true },

    action_history: {type: [], required: true},
    river_option_evs: { type: [], required: true },
});

const Problems = model<IProblem> ('problems', problemSchema);
const Users = model<IUser> ('users', usersSchema);

export async function getProblem(problemId: string) : Promise<IProblemReturn> {
    // problems, users collection.
    await connect('mongodb+srv://dev:hacklytics@hack.ufwzptn.mongodb.net/db');
    const firstProblem = await Problems.findById(problemId);
    const data = {
        problemId: problemId,
        holeCards: firstProblem? firstProblem['hole_cards'] : '',
        boardCards: firstProblem? firstProblem['board'] : '',
        actionHistory: firstProblem? firstProblem['action_history'] : [],
        problemElo: firstProblem? firstProblem['problem_elo'] : 0
    };
    return data;
}

export async function getUncompletedProblemId(player_id: string) : Promise<string> {
    await connect('mongodb+srv://dev:hacklytics@hack.ufwzptn.mongodb.net/db');

    const retrievedPlayer = await Users.findById(player_id);
    let ids: Array<string> = await Problems.distinct('_id', {});
    
    for (const completedProblem of retrievedPlayer?.problems_completed? retrievedPlayer.problems_completed : []) {
        ids = ids.filter(id => id != completedProblem.problem_id);
    }
    return ids.length ? ids[0] : "";
}

export async function getUserElo(player_id: string) : Promise<number> {
    await connect('mongodb+srv://dev:hacklytics@hack.ufwzptn.mongodb.net/db');

    const retrievedPlayer = await Users.findById(player_id);
    if (!retrievedPlayer) {
        return -1;
    }
    return retrievedPlayer.user_elo;
}

export async function completedProblem(problemId: string, player_id: string, action: string) : Promise<[boolean, number]> {
    await connect('mongodb+srv://dev:hacklytics@hack.ufwzptn.mongodb.net/db');

    const retrievedPlayer = await Users.findById(player_id);
    if (!retrievedPlayer) {
        return [false, -1];
    }

    const retrievedProblem = await Problems.findById(problemId);
    if (!retrievedProblem) {
        return [false, -1];
    }

    const outcome: number = determineOutcome(action, retrievedProblem.river_option_evs);

    let playerElo: number = retrievedPlayer.user_elo;
    let problemElo: number = retrievedProblem.problem_elo;
    
    playerElo = adjustRating(playerElo, problemElo, outcome);
    problemElo = adjustRating(problemElo, playerElo, 1 - outcome);
    
    const completedProblem: ICompletedProblem = {
        problem_id: problemId,
        time_completed: Date.now().toString(),
        player_action: action
    }
    retrievedPlayer.problems_completed.push(completedProblem);
    retrievedPlayer.user_elo = playerElo;
    retrievedProblem.problem_elo = problemElo;
    await retrievedPlayer.save();
    await retrievedProblem.save();
    return [true, playerElo];
}

export async function createNewUser(userId: string, pword: string) : Promise<boolean> {
    await connect('mongodb+srv://dev:hacklytics@hack.ufwzptn.mongodb.net/db');
    const usernameExists: boolean = (await Users.exists({ user_id: userId })) != null;
    if (usernameExists) {
        return false;
    }
    const new_user: IUser = {
        user_elo: 1000,
        user_id: userId,
        password: pword,
        problems_completed: []
    };
    await Users.insertMany([new_user]);
    return true;
}

export async function login(username: string, inputtedPassword: string) : Promise<string> {
    // TODO:
    await connect('mongodb+srv://dev:hacklytics@hack.ufwzptn.mongodb.net/db');

    const retrievedPlayer = await Users.findOne({ user_id: username });
    if (!retrievedPlayer) {
        return '';
    }

    if (retrievedPlayer?.password !== inputtedPassword) {
        return '';
    }
    return retrievedPlayer?._id.toString();
}

export async function putNewProblem() : Promise<void> {
    await connect('mongodb+srv://dev:hacklytics@hack.ufwzptn.mongodb.net/db');
    const problem = new Problems({
        problem_elo: 1000,
        time_created: Date.now().toString(),

        hero_position: 'CO',
        villain_position: 'BTN',

        hole_cards: '4hTc',
        board: '2h3s4dQhKd',

        action_history: [],
        river_actions_evs: []
    });
    await Problems.create(problem);
}
