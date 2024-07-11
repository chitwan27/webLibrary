document.addEventListener('DOMContentLoaded', async () => {
    const nInput = document.getElementById("nInput");
    const frame = document.querySelector("div");

    const obj = await fetchData(); 
    const arr = Object.entries(obj);
    nInput.placeholder = "Till - " + Math.ceil((arr.length)/8);
    nInput.addEventListener("change", () => {
        frame.innerHTML = "";
        const num = nInput.value;
        supplyLinks(arr,num,frame);
    });
});

function supplyLinks(list,number,container) {
    if (number>0) {
        for(let i = ((number-1)*8); i < (number*8) && i < list.length; i++) {
            let link = list[i][0];
            let text = list[i][1];

            const subEmbed = document.createElement('a');
            const linkEmbed = document.createElement('a');
            const script = document.createElement('script');
            const blockquote = document.createElement('blockquote');

            linkEmbed.textContent = text;
            linkEmbed.href = `${link}?ref=share&ref_source=embed`;

            const subgex = /https:\/\/www\.reddit\.com\/r\/([^\/]+)\/comments\//;
            const subredditName = link.match(subgex)[1];

            subEmbed.href = `https://www.reddit.com/r/${subredditName}`;
            subEmbed.textContent = subredditName;

            script.src = "https://embed.reddit.com/widgets.js";
            script.setAttribute("charset", "UTF-8");
            script.setAttribute("async", "");

            blockquote.setAttribute("data-card-created", Date.now());
            blockquote.setAttribute("class", "reddit-card");

            blockquote.appendChild(linkEmbed);
            blockquote.appendChild(document.createTextNode(" from "));
            blockquote.appendChild(subEmbed);

            container.appendChild(blockquote);
            container.appendChild(script);
        }
    }
}

async function fetchData() {
    try {
        const response = await fetch('/api/reddit');
        if (!response.ok) {
            throw new Error('Network Response: ' + response.statusText);
        }
        return response.json();        
    } 
    catch (error) {
        console.error('Error Fetching:', error);
    }
}