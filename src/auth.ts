import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import chalk from 'chalk';

const DEVICE_CODE_URL = 'https://github.com/login/device/code';
const TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_API_URL = 'https://api.github.com';
const CLIENT_ID = 'Ov23lizFzNwkYjfSEzJw';

interface DeviceFlowResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface TokenResponse {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

export async function login(): Promise<void> {
  const tokenPath = getTokenPath();
  
  if (fs.existsSync(tokenPath)) {
    const existingToken = fs.readFileSync(tokenPath, 'utf8').trim();
    if (existingToken) {
      console.log(chalk.green('Already logged in.'));
      return;
    }
  }

  const envToken = process.env.GITHUB_TOKEN;
  if (envToken) {
    console.log(chalk.white('Checking GITHUB_TOKEN from environment...\n'));
    const isValid = await validateToken(envToken);
    if (isValid) {
      fs.mkdirSync(getConfigDir(), { recursive: true });
      fs.writeFileSync(tokenPath, envToken);
      console.log(chalk.green('Authentication successful! Token from GITHUB_TOKEN environment variable saved.\n'));
      return;
    } else {
      console.log(chalk.yellow('GITHUB_TOKEN is invalid. Falling back to device flow.\n'));
    }
  }

  console.log(chalk.white('Initiating GitHub device flow authentication...\n'));

  const deviceResponse = await axios.post<DeviceFlowResponse>(
    DEVICE_CODE_URL,
    new URLSearchParams({
      client_id: CLIENT_ID,
      scope: 'repo',
    }),
    { headers: { Accept: 'application/json' } }
  );

  const { device_code, user_code, verification_uri, interval } = deviceResponse.data;

  console.log(chalk.white('Please visit:') + chalk.blue(` ${verification_uri}`));
  console.log(chalk.bold(`Enter code: `) + chalk.green(user_code));
  console.log(chalk.yellow('Waiting for authentication... (press Ctrl+C to cancel)\n'));

  const token = await pollForToken(device_code, interval);

  fs.mkdirSync(getConfigDir(), { recursive: true });
  fs.writeFileSync(tokenPath, token);

  console.log(chalk.green('Authentication successful! Token saved.\n'));
}

export async function getToken(): Promise<string> {
  const tokenPath = getTokenPath();
  
  if (fs.existsSync(tokenPath)) {
    const token = fs.readFileSync(tokenPath, 'utf8').trim();
    if (token) {
      return token;
    }
  }

  console.error(chalk.red('Not logged in. Run "pp login" to authenticate.'));
  process.exit(1);
}

export function logout(): void {
  const tokenPath = getTokenPath();
  if (fs.existsSync(tokenPath)) {
    fs.unlinkSync(tokenPath);
    console.log(chalk.green('Logged out successfully.'));
  } else {
    console.log(chalk.yellow('Not logged in.'));
  }
}

function getConfigDir(): string {
  return path.join(os.homedir(), '.pipeline-poker');
}

function getTokenPath(): string {
  return path.join(getConfigDir(), 'token');
}

async function validateToken(token: string): Promise<boolean> {
  try {
    await axios.get(`${GITHUB_API_URL}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    return true;
  } catch {
    return false;
  }
}

async function pollForToken(deviceCode: string, interval: number): Promise<string> {
  while (true) {
    await new Promise(resolve => setTimeout(resolve, interval * 1000));

    try {
      const tokenResponse = await axios.post<TokenResponse>(
        TOKEN_URL,
        new URLSearchParams({
          client_id: CLIENT_ID,
          'device_code': deviceCode,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        }),
        { headers: { Accept: 'application/json' } }
      );

      if (tokenResponse.data.access_token) {
        return tokenResponse.data.access_token;
      }

      if (tokenResponse.data.error) {
        if (tokenResponse.data.error === 'expired_token') {
          console.error(chalk.red('Authentication timed out. Please try again.'));
          process.exit(1);
        }
        if (tokenResponse.data.error === 'authorization_pending') {
          continue;
        }
        if (tokenResponse.data.error === 'slow_down') {
          interval += 5;
          continue;
        }
        console.error(chalk.red(`${tokenResponse.data.error}: ${tokenResponse.data.error_description}`));
        process.exit(1);
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      
      if (errorData?.error === 'expired_token') {
        console.error(chalk.red('Authentication timed out. Please try again.'));
        process.exit(1);
      }
      
      if (errorData?.error === 'authorization_pending') {
        continue;
      }
      
      if (errorData?.error === 'slow_down') {
        interval += 5;
        continue;
      }

      throw error;
    }
  }
}
