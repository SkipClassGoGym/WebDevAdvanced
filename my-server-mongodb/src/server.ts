import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { MongoClient } from 'mongodb';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Cookie parser setup
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const mongoUri = process.env['MONGODB_URI'] || 'mongodb://127.0.0.1:27017';
const mongoClient = new MongoClient(mongoUri);
let mongoClientPromise: Promise<MongoClient> | undefined;

async function getDb() {
  if (!mongoClientPromise) {
    mongoClientPromise = mongoClient.connect();
  }
  const client = await mongoClientPromise;
  return client.db('FashionData');
}

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Login API: verify user from MongoDB and save cookies.
 */
app.post('/auth/login', async (req, res) => {
  const username = (req.body?.name || '').toString().trim();
  const password = (req.body?.password || '').toString();

  if (!username || !password) {
    return res.status(400).send('Missing username or password');
  }

  try {
    const db = await getDb();
    const user = await db.collection('User').findOne({ username, password });

    if (!user) {
      return res.status(401).send('Invalid username or password');
    }

    // Persist cookies so they remain after reopening the browser
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    res.cookie('username', username, { maxAge, sameSite: 'lax' });
    res.cookie('password', password, { maxAge, sameSite: 'lax' });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).send('Server error');
  }
});

/**
 * Read login cookies for prefilling the login form.
 */
app.get('/auth/cookie', (req, res) => {
  res.json({
    username: req.cookies.username ?? '',
    password: req.cookies.password ?? '',
  });
});

/**
 * Chrome devtools probe. Respond directly to avoid SSR attempting to render it.
 */
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end();
});

/**
 * Create cookies: single values and JSON object.
 */
app.get('/create-cookie', cors(), (req, res) => {
  res.cookie('username', 'tranduythanh');
  res.cookie('password', '123456');

  const account = {
    username: 'tranduythanh',
    password: '123456',
  };
  res.cookie('account', account);

  // Limited-time cookies
  res.cookie('infor_limit1', 'I am limited Cookie - way 1', {
    expires: new Date(Date.now() + 360000),
  });
  res.cookie('infor_limit2', 'I am limited Cookie - way 2', { maxAge: 360000 });

  res.send('cookies are created');
});

/**
 * Read cookies and display each value.
 */
app.get('/read-cookie', cors(), (req, res) => {
  // cookie is stored in client, so we use req
  const username = req.cookies.username;
  const password = req.cookies.password;
  const account = req.cookies.account as
    | { username?: string; password?: string }
    | undefined;

  let infor = 'username = ' + username + '<br/>';
  infor += 'password = ' + password + '<br/>';

  if (account != null) {
    infor += 'account.username = ' + account.username + '<br/>';
    infor += 'account.password = ' + account.password + '<br/>';
  }

  res.send(infor);
});

/**
 * Clear saved cookies.
 */
app.get('/clear-cookie', cors(), (req, res) => {
  res.clearCookie('account');
  res.send('[account] Cookie is removed');
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
