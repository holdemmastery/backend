
import express, { Express, Request, Response } from 'express';
import { getProblem, getUncompletedProblemId, completedProblem, createNewUser, login } from './db';
import fetch from 'node-fetch';
import dotenv from "dotenv";

dotenv.config();



const app: Express = express();
const port = process.env.PORT || 3000;


app.use(express.json()) ;
app.get("/get-problem", (req: Request, res: Response) => {
    if (!req.body['problem_id']) {
      // failure
    }

    const problemId: string = req.body['problem_id'];
    getProblem(problemId).then(result => {
      res.json(result);
    });
});

app.get("/get-next-problem", (req: Request, res: Response) => {
  if (!req.body['userId']) {
    // status code
  }

  const userId: string = req.body['userId'];
  getUncompletedProblemId(userId).then(result => result ? res.json({ message: "Successfully retrieved uncompleted problem", problemId : result }) : 
    res.json({ message: "No uncompleted problems remain" }));
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
    status ? res.json({ message: "Successfully marked problem as completed. "}) : res.json({ message : "Something went wrong! "});
  });
});

app.post("/create-user", (req: Request, res: Response) => {
  if (!req.body['userId']) {
    // failure status
  }

  if (!req.body['password']) {
    // failure status
  }

  const user_id: string = req.body['userId'];
  const password: string = req.body['password'];
  createNewUser(user_id, password).then(status => {
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