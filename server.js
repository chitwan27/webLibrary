const { authenticate } = require('./auth');
const favicon = require('serve-favicon');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

const requiredFiles = [
    'db/pocket/data.json',
    'db/pocket/articles.json',
    'db/youtube/videos.json',
    'db/reddit/posts.json',
    'db/misc/misc.json'
];

const dataFilePath = path.join(__dirname, requiredFiles[0]);
const pocketPath = requiredFiles[1];
const youtubePath = requiredFiles[2];
const redditPath = requiredFiles[3];
const miscPath = requiredFiles[4];

makeApi('/api/youtube', youtubePath);
makeApi('/api/pocket', pocketPath);
makeApi('/api/reddit', redditPath);
makeApi('/api/misc', miscPath);

app.use(favicon(path.join(__dirname, 'pages/assets', 'favicon.ico')));

app.use(async (req, res, next) => {
    await checkAndCreateFiles();
    next();
});

app.use(async (req, res, next) => {
    await authenticator(res, next);
});

app.use(express.static(path.join(__dirname, 'pages')));

app.listen(port, () => {
    console.log(`Running On: http://localhost:${port} \n`);
});

runner()

app.get('/trigger-sync', (req, res) => {
    fs.readFile(dataFilePath, 'utf8')
        .then((data) => {
            const myData = JSON.parse(data);
            const consumerKey = myData["consumer_key"];
            const accessToken = myData["access_token"];
            getPocket(consumerKey, accessToken);
            res.send();
        })
        .catch((err) => {
            console.log(`Error Occured: ${err}`)
        });
});

async function runner() {
    const { default: open } = await import('open');
    open(`http://localhost:${port}`);
}

async function authenticator(res, next) {
    try {
        const data = JSON.parse(await fs.readFile(dataFilePath, 'utf8'));
        if (!data.access_token) {
            res.send('Authentication in progress. Please reload after completion.');
            await authenticate();
        }
        else {
            next();
        }
    }
    catch (err) {
        console.error('Error Authenticating:', err);
        res.status(500).send('Server error.');
    }
}

async function checkAndCreateFiles() {
    try {
        await fs.access(dataFilePath);
    } catch (error) {
        await Promise.all(requiredFiles.map(async (filePath) => {
            const fullPath = path.join(__dirname, filePath);
            try {
                await fs.access(fullPath);
            } catch (error) {
                await fs.mkdir(path.dirname(filePath), { recursive: true });
                await fs.writeFile(fullPath, JSON.stringify({}));
                console.log(`Created file: ${fullPath}`);
            }
        }));
    }
}

function makeApi(apiPath, filePath) {
    app.get(apiPath, (req, res) => {
        fs.readFile(path.join(__dirname, filePath), 'utf8')
            .then(data => {
                res.json(JSON.parse(data));
            })
            .catch(err => {
                res.status(500).send(`Error reading data file: ${err}`);
            });
    });
}

function getPocket(consumerKey, accessToken) {
    const requestData = {
        consumer_key: consumerKey,
        access_token: accessToken,
        detailType: 'complete',
        state: 'all'
    };
    fetch("https://getpocket.com/v3/get", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const youtubeObj = {};
            const pocketObj = {};
            const redditObj = {};
            const miscObj = {};
            const itemsId = [];
            for (const key in data.list) {
                const item = data.list[key];
                if (item.status < 2) {
                    itemsId.push(key);
                    if (item.status == 1) {
                        miscObj[item.resolved_url] = item.resolved_title;
                    }
                    else if (/watch\?v/i.test(item.given_url) || /youtube\.com\/shorts/i.test(item.given_url)) {
                        youtubeObj[item.resolved_url] = item.resolved_title;
                    }
                    else if (/reddit\.com\/r\/[^/]+\/comments/i.test(item.given_url)) {
                        redditObj[item.given_url] = item.resolved_title;
                    }
                    else {
                        pocketObj[item.resolved_url] = item.resolved_title;
                    }
                }
            }
            if (itemsId.length > 0) {
                clearPocket(itemsId, consumerKey, accessToken);
                updateJson(youtubeObj, youtubePath);
                updateJson(pocketObj, pocketPath);
                updateJson(redditObj, redditPath);
                updateJson(miscObj, miscPath);
            }
        })
        .catch(error => {
            console.log('Fetch Error:', error);
        });
}

function updateJson(newObj, filePath) {
    fs.readFile(path.join(__dirname, filePath), 'utf8')
        .then((data) => {
            const oldObj = JSON.parse(data);
            for (const key in newObj) {
                oldObj[key] = newObj[key];
            }
            fs.writeFile(path.join(__dirname, filePath), JSON.stringify(oldObj))
                .then(() => {
                    console.log(`Written Successfully: ${filePath} \n`);
                })
                .catch(err => {
                    console.log(`Error Writing: ${err}`);
                });
        })
        .catch(err => {
            console.log(`Read Error: ${err}`);
        });
}

function clearPocket(items, consumerKey, accessToken) {
    const requestData = {
        consumer_key: consumerKey,
        access_token: accessToken,
        actions: []
    };
    items.forEach(id => {
        requestData.actions.push({ action: "delete", item_id: id });
    });
    fetch("https://getpocket.com/v3/send", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error Status: ${response.status}`);
            }
        });
}
