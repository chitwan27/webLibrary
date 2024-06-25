const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

const pocketPath = 'db/pocket/articles.json';
const youtubePath = 'db/youtube/videos.json';
const redditPath = 'db/reddit/posts.json';
const miscPath = 'db/misc/misc.json';

makeApi('/api/youtube', pocketPath);
makeApi('/api/pocket', youtubePath);
makeApi('/api/reddit', redditPath);
makeApi('/api/misc', miscPath);

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

app.listen(port, () => {
    console.log(`Running On: http://localhost:${port} \n`);
});

//---//

async function makeApi(apiPath, filePath) {
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
        const holderImg = "https://picsum.photos/300/200";
        for (const key in data.list) {
            itemsId.push(key);
            const item = data.list[key];
            if (item.status==1) {
                miscObj[item.resolved_url] = item.resolved_title;
            }
            else if (/watch\?v/i.test(item.given_url) || /youtube\.com\/shorts/i.test(item.given_url)) {
                youtubeObj[item.given_url] = item.resolved_title;
            }
            else if (/reddit\.com\/r\/[^/]+\/comments/i.test(item.given_url)) {
                redditObj[item.given_url] = item.resolved_title;
            }
            else {
                const pair = [item.resolved_title, item.image?.src || holderImg];
                pocketObj[item.resolved_url] = pair; 
            };
        }
        updateJson(youtubeObj,youtubePath);
        updateJson(pocketObj,pocketPath);
        updateJson(redditObj,redditPath);
        updateJson(miscObj,miscPath);
        clearPocket(itemsId);
    })
    .catch(error => {
        console.error('Fetch error:', error);
    });
}

function updateJson(newObj,path) {
    fs.readFile(path, 'utf8')
    .then((err,data) => {
        if (err) throw err;
        const oldObj = JSON.parse(data);
        for (const key in newObj) {
            oldObj[key] = newObj[key];
        }
        fs.writeFile(path,JSON.stringify(oldObj))
        .then((err) => {
            if (err) throw err;
            console.log("Written Successfully: " + path);
        });
    });
}

function clearPocket(items) {
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