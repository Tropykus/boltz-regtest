import express, { Request, Response, NextFunction } from 'express';
import { exec } from 'child_process';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3030;
const SECRET_KEY = process.env.SECRET_KEY;

app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const checkSecretKey = (req: Request, res: Response, next: NextFunction) => {
  const secretKey = req.headers['x-secret-key'];
  if (secretKey !== SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid secret key' });
  }
  next();
};

app.post('/addinvoice', checkSecretKey, (req: Request, res: Response) => {
  const { amount } = req.body;
  if (!amount) {
    return res.status(400).json({ error: 'Missing "amount" parameter' });
  }
  
  const command = `docker exec -i boltz-scripts bash -c "source /etc/profile.d/utils.sh && lncli-sim 1 addinvoice --amt ${amount}"`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return res.status(500).json({ error: stderr });
    }
    res.json({ result: stdout });
  });
});

app.post('/sendpayment', checkSecretKey, (req: Request, res: Response) => {
  const { pay_req } = req.body;
  if (!pay_req) {
    return res.status(400).json({ error: 'Missing "pay_req" parameter' });
  }
  
  const command = `docker exec -i boltz-scripts bash -c "source /etc/profile.d/utils.sh && lncli-sim 1 payinvoice -f ${pay_req} &>/dev/null & disown"`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    res.json({ result: 'Payment Initiated' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
