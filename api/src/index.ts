
import express, { Express, Request, Response } from 'express';
import { getProblem, getUncompletedProblemId, completedProblem, createNewUser, login, getUserElo } from './db';
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json()) ;
app.get("/get-problem", (req: Request, res: Response) => {
    if (!req.body['problem_id']) {
      // failure status
    }

    const problemId: string = req.body['problem_id'];
    getProblem(problemId).then(result => {
      res.json(result);
    });
});


app.get("/get-next-problem", (req: Request, res: Response) => {
  if (!req.body['userId']) {
    // failure status
  }

  const userId: string = req.body['userId'];
  getUncompletedProblemId(userId).then(result => result ? res.json({ message: "Successfully retrieved uncompleted problem", problemId : result }) : 
    res.json({ message: "No uncompleted problems remain" }));
});

app.get('/get-user-elo', (req: Request, res: Response) => {
  if (!req.body['userId']) {
    // failure status
  }

  const userId: string = req.body['userId'];
  getUserElo(userId).then(elo => res.json(
    {
      userElo: elo
    }));
});


app.post("/finish-problem", (req: Request, res: Response) => {
  if (!req.body['problem_id']) {
    // failure status
  }
  
  if (!req.body['userId']) {
    
  }

  if (!req.body['player_action']) {
    // failure status
  }
  
  completedProblem(req.body['problem_id'], req.body['userId'], req.body['player_action']).then(status => {
    status[0] ? res.json(
      { 
        message: "Successfully marked problem as completed. ",
        updatedElo: status[1]
      }) 
      : 
      res.json(
        { 
          message : "Something went wrong! "
        });
  });
});

app.post("/create-user", (req: Request, res: Response) => {
  if (!req.body['username']) {
    // failure status
  }

  if (!req.body['password']) {
    // failure status
  }

  const username: string = req.body['username'];
  const password: string = req.body['password'];
  createNewUser(username, password).then(status => {
    status ? res.json({ message: "Successfully created new user. "}) : res.json({ message: "Username already exists! "});
  });
});

app.post("/login", (req: Request, res: Response) => {
  if (!req.body['username']) {
    // failure status
  }

  if (!req.body['password']) {
    // failure status
  }

  const username: string = req.body['username'];
  const password: string = req.body['password'];
  login(username, password).then(userId => {
    userId ? res.json({ message: 'Login attempt successful', userId: userId }) : res.json({ message: 'Login attempt unsuccessful' });
  })
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});