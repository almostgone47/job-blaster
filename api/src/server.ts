import express from 'express';
import cors from 'cors';
import {env} from './env';
import {requireAuth} from './auth';
import jobs from './routes/jobs';
import parse from './routes/parse';
import apps from './routes/apps';
import resumes from './routes/resumes';
import templates from './routes/templates';
import interviews from './routes/interviews';

const app = express();

app.use(cors({origin: env.ALLOW_ORIGIN, credentials: true}));
app.use(express.json());

app.get('/health', (_, res) => res.json({ok: true}));

// Dev auth via header "x-user-id"
app.use(requireAuth);

// Routes
app.use(parse);
app.use(jobs);
app.use(apps);
app.use(resumes);
app.use(templates);
app.use(interviews);

app.listen(env.PORT, () => {
  console.log(`API running on http://localhost:${env.PORT}`);
});
