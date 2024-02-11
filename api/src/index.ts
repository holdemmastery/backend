
import express, { Express, Request, Response } from 'express';
import { getProblem, getUncompletedProblemId, completedProblem } from './db';
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


app.post("/finish-problem", (req: Request, res: Response) => {
  if (!req.body['problem_id']) {
    // failure status
  }
  
  if (!req.body['player_id']) {
    
  }

  if (!req.body['player_action']) {
    // failure status
  }
  const problemId: string = req.body['problem_id'];
  completedProblem(problemId, req.body['player_id'], req.body['player_action']);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});