document.addEventListener('DOMContentLoaded', async () => {
    const nInput = document.getElementById("nInput");
    const frame = document.querySelector("div");

    const obj = await fetchData(); 
    const arr = Object.entries(obj);
    nInput.placeholder = "1 - " + Math.floor((arr.length)/10 + 1);
    nInput.addEventListener("change", () => {
        frame.innerHTML = "";
        const num = nInput.value;
        supplyLinks(arr.sort(),num,frame);
    });
});

function supplyLinks(list,number,container) {
    const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|shorts\/)([a-zA-Z0-9_-]+)/;
    if (number>0) {
        for(let i = ((number-1)*10); i < (number*10) && i < list.length; i++) {
            let link = list[i][0];

            link = link.replace(regex,"https://www.youtube.com/embed/$1");
            const linkElement = document.createElement('iframe');
            linkElement.setAttribute("allowfullscreen","");
            container.appendChild(linkElement);
            linkElement.height = 300;
            linkElement.width = 600;
            linkElement.src = link;
        }
    }
}

async function fetchData() {
    try {
        const response = await fetch('/api/youtube');
        if (!response.ok) {
            throw new Error('Network Response: ' + response.statusText);
        }
        return response.json();        
    } 
    catch (error) {
        console.error('Error Fetching:', error);
    }
}