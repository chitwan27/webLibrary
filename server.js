const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

const pocketPath = 'db/pocket/articles.json';
const youtubePath = 'db/youtube/videos.json';
const redditPath = 'db/reddit/posts.json';
const miscPath = 'db/misc/misc.json';

fs.readFile('db/pocket/data.json','utf8')
.then((data) => {
    const myData = JSON.parse(data);
    const consumerKey = myData["Consumer Key"];
    const accessToken = myData["access_token"];
    getPocket(consumerKey,accessToken);
})
.catch((err) => {
    console.log(`Error Occured: ${err}`)
});

app.use(express.static(path.join(__dirname, 'pages')));

makeApi('/api/youtube', youtubePath);
makeApi('/api/pocket', pocketPath);
makeApi('/api/reddit', redditPath);
makeApi('/api/misc', miscPath);

app.listen(port, () => {
    console.log(`Running On: http://localhost:${port} \n`);
});

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

function getPocket(consumerKey,accessToken){
    const requestData = {
        consumer_key: consumerKey,
        access_token: accessToken,
        detailType: 'complete',
        sort: 'title',
        state: 'all'
    };
    fetch("https://getpocket.com/v3/get", {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
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
            itemsId.push(key);
            const item = data.list[key];
            if (item.status==1) {
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
            };
        }
        if(itemsId.length > 0) {
            clearPocket(itemsId,consumerKey,accessToken);
            updateJson(youtubeObj,youtubePath);
            updateJson(pocketObj,pocketPath);
            updateJson(redditObj,redditPath);
            updateJson(miscObj,miscPath);
        }
    })
    .catch(error => {
        console.log('Fetch Error:', error);
    });
}

function updateJson(newObj,path) {
    fs.readFile(path, 'utf8')
    .then((data) => {
        const oldObj = JSON.parse(data);
        for (const key in newObj) {
            oldObj[key] = newObj[key];
        }
        fs.writeFile(path,JSON.stringify(oldObj))
        .then(() => {
            console.log(`Written Successfully: ${path} \n`);
        })
        .catch(err => {
            console.log(`Error Writing: ${err}`);
        });
    })
    .catch(err => {
        console.log(`Read Error: ${err}`);
    });
}

function clearPocket(items,consumerKey,accessToken) {
    const requestData = {
        consumer_key: consumerKey,
        access_token: accessToken,
        actions: []
    };
    items.forEach( id => {
        requestData.actions.push({action: "delete", item_id: id});
    });
    fetch("https://getpocket.com/v3/send", {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(requestData)
    })
    .then(response => {
        if (!response.ok) {
        throw new Error(`Error Status: ${response.status}`);
        }
    });
}