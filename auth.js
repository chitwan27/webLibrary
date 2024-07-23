const path = require('path');
const fs = require('fs').promises;
const readline = require('readline');

const DATA_FILE_PATH = path.join(__dirname, 'db/pocket/data.json');
const REDIRECT_URI = 'https://getpocket.com/home';

async function authenticate() {
    try {
        const consumerKey = await promptUser("Enter webLibrary's Pocket Key: ");
        const requestToken = await getRequestToken(consumerKey);
        const { default: open } = await import('open');

        const authorizationUrl = `https://getpocket.com/auth/authorize?request_token=${requestToken}&redirect_uri=${REDIRECT_URI}`;
        console.log(`Opening authorization URL!`);
        open(authorizationUrl);

        const chk = await promptUser('Has authentication been completed by Pocket? (y/n) ');
        if (chk == 'y') {
            const userData = await getAccessToken(consumerKey, requestToken);
            const accessToken = userData.access_token;
            const username = userData.username;
            const data = {
                consumer_key: consumerKey,
                access_token: accessToken,
                username: username
            };
            await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2));
            console.log('Data saved to data.json successfully.');
        }
        else {
            console.log("Please try authenticating later!")
        }
    }
    catch (error) {
        console.error('Error during authentication:', error);
    }
}

async function promptUser(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function getRequestToken(consumerKey) {
    const response = await fetch('https://getpocket.com/v3/oauth/request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Accept': 'application/json'
        },
        body: JSON.stringify({
            consumer_key: consumerKey,
            redirect_uri: REDIRECT_URI
        })
    });
    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.code;
}

async function getAccessToken(consumerKey, code) {
    const response = await fetch('https://getpocket.com/v3/oauth/authorize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Accept': 'application/json'
        },
        body: JSON.stringify({
            consumer_key: consumerKey,
            code: code
        })
    });
    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

module.exports = { authenticate };