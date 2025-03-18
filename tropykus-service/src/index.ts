import express, { Request, Response, NextFunction } from 'express';
import { exec } from 'child_process';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import Joi from 'joi';
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

/**
 * @swagger
 * tags:
 *   name: Lightning
 *   description: Lightning operations
 */

  /**
 * @swagger
 * /addinvoice:
 *   post:
 *     summary: Generates a lightning invoice (in BTC min 0.0001 - max 0.042).
 *     tags: [Lightning]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 required: true
 *                 description: The amount of the invoice in BTC
 *     responses:
 *       200:
 *         description: Returns the invoice
 *       4XX:
 *         description: Error creating invoice
 */
app.post('/addinvoice', checkSecretKey, (req: Request, res: Response) => {
  const { amount } = req.body;
  const schema = Joi.object({
    amount: Joi.number().required().min(0.0001).max(0.042)
  });

  const { error } = schema.validate({ amount });
  if (error) {
    return res.status(400).json({error: error.details[0].message});
  }

  const satoshiWeiFactor = 100_000_000;
  const satsAmount = amount * satoshiWeiFactor;
  
  const command = `docker exec -i boltz-scripts bash -c "source /etc/profile.d/utils.sh && lncli-sim 1 addinvoice --amt ${satsAmount}"`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: "Not possible to create the invoice, please try again" });
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return res.status(500).json({ error: "Not possible to create the invoice, please try again" });
    }
    const parsedOutput = JSON.parse(stdout);
    res.json({ invoice: parsedOutput.payment_request });
  });
});

/**
 * @swagger
 * /sendpayment:
 *   post:
 *     summary: Pay a lightning invoice.
 *     tags: [Lightning]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invoice:
 *                 type: string
 *                 required: true
 *                 description: The invoice to pay
 *     responses:
 *       200:
 *         description: Returns a success message
 *       4XX:
 *         description: Error paying invoice
 */
app.post('/sendpayment', checkSecretKey, (req: Request, res: Response) => {
  const { invoice } = req.body;
  const btcRegtest = /^(1|3)[A-HJ-NP-Za-km-z1-9]{25,34}$|^lnbcrt[a-z0-9]{8,87}$/;
  const schema = Joi.object({
    invoice: Joi.string().regex(btcRegtest).required()
  });

  const { error } = schema.validate({ invoice });
  if (error) {
    return res.status(400).json({error: error.details[0].message});
  }
  
  const command = `docker exec -i boltz-scripts bash -c "source /etc/profile.d/utils.sh && lncli-sim 1 payinvoice -f ${invoice} &>/dev/null & disown"`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: "Not possible to send the payment, please try again" });
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return res.status(400).json({ error: "Not possible to send the payment, please try again" });
    }
    res.json({ result: 'Payment Initiated' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
