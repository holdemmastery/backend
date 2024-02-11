import { Schema, model, connect } from 'mongoose';

interface ICompletedProblem {
    problem_id: string;
    time_completed: string;
    player_action: string;
}

interface IEVs {
    option: string;
    ev: number;
}

interface IHistoryAction {
    street: string;
    actor: string;
    option: string;
}

interface IProblem {
    time_created: number;
    hero_position: string;
    villain_position: string;

    hole_cards: string;
    board: string;

    action_history: Array<IHistoryAction>

    river_option_evs: Array<IEVs>;
}

interface IProblemReturn {
    holeCards: string;
    boardCards: string;
    actionHistory: Array<IHistoryAction>;
}

interface IUser {
    user_id: string;
    password: string;
    problems_completed: Array<ICompletedProblem>;
}
  
const usersSchema = new Schema<IUser> ({
    user_id: { type: String, required: true },
    password: { type: String, required: true },
    problems_completed: { type: [], required: true}
});

const problemSchema = new Schema<IProblem> ({
    time_created: { type: Number, required: true },
    hero_position: { type: String, required: true},
    villain_position: { type: String, required: true },

    hole_cards: { type: String, required: true },
    board: { type: String, required: true },

    action_history: {type: [], required: true},
  
    river_option_evs: { type: [], required: true },
});

const Problem = model<IProblem> ('problems', problemSchema);
const Users = model<IUser> ('users', usersSchema);

export async function getProblem(problemId: string) : Promise<IProblemReturn> {
    // problems, users collection.
    await connect('mongodb+srv://dev:hacklytics@hack.ufwzptn.mongodb.net/db');
    const firstProblem = await Problem.findById(problemId);
    const data = {
        problemId: problemId,
        holeCards: firstProblem? firstProblem['hole_cards'] : '',
        boardCards: firstProblem? firstProblem['board'] : '',
        actionHistory: firstProblem? firstProblem['action_history'] : []
    };
    return data;
}

export async function getUncompletedProblemId(player_id: string) : Promise<string> {
    await connect('mongodb+srv://dev:hacklytics@hack.ufwzptn.mongodb.net/db');

    const retrievedPlayer = await Users.findById(player_id);
    let ids: Array<string> = await Problem.distinct('_id', {});
    
    for (const completedProblem of retrievedPlayer?.problems_completed? retrievedPlayer.problems_completed : []) {
        ids = ids.filter(id => id != completedProblem.problem_id);
    }
    return ids.length ? ids[0] : "";
}

export async function completedProblem(problemId: string, player_id: string, action: string) : Promise<boolean> {
    await connect('mongodb+srv://dev:hacklytics@hack.ufwzptn.mongodb.net/db');

    const retrievedPlayer = await Users.findById(player_id);
    if (!retrievedPlayer) {
        return false;
    }

    const completedProblem: ICompletedProblem = {
        problem_id: problemId,
        time_completed: Date.now().toString(),
        player_action: action
    }
    retrievedPlayer.problems_completed.push(completedProblem);
    await retrievedPlayer.save();
    return true;
}

export async function createNewUser(userId: string, pword: string) : Promise<boolean> {
    await connect('mongodb+srv://dev:hacklytics@hack.ufwzptn.mongodb.net/db');
    const usernameExists: boolean = (await Users.exists({ user_id: userId })) != null;
    if (usernameExists) {
        return false;
    }
    const new_user: IUser = {
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

export async function putNewProblem(problemId: number) : Promise<void> {
    await connect('mongodb+srv://dev:hacklytics@hack.ufwzptn.mongodb.net/db');
    const problem = new Problem({
        problem_id: 10,

        hero_position: 'CO',
        villain_position: 'BTN',

        hole_cards: '4hTc',
        cards: '2h3s4dQhKd',

        correct_action_river: 'asdf',
        river_actions_evs: []
    });
    await Problem.create(problem);
}
