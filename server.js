import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;

app.use(cors());

// app.use(cors({
//   origin: 'https://tame-emu-4.loca.lt',
//   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

app.use(express.json());


app.get('/carapi-lookup', async (req, res) => {
  const country_code = 'UK';
  const lookup = req.query.lookup;
  const jwt = req.headers.authorization;

  try {
    const response = await fetch(`https://carapi.app/api/license-plate?country_code=${country_code}&lookup=${lookup}`, {
      headers: {
        'Authorization': jwt,
        'Accept': 'application/json'
      }
    });

    // console.log('Response status:', response);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch license plate data' });
  }
});


app.post('/carapi-auth', async (req, res) => {
  try {
    const response = await fetch('https://carapi.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Accept': 'text/plain',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_token: '655cd6a9-7622-41dc-8dea-082471de54fe',
        api_secret: '3db05edd87b6d2b73f70842b4aba0a59',
      }),
    });
    
    // console.log('Response status:', response);
    const jwt = await response.text();
    return res.status(200).json({ token: jwt });
  } catch (error) {
    console.error('Error authenticating with carapi:', error);
    res.status(500).json({ error: 'Failed to authenticate with carapi' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
