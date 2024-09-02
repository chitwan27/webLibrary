document.addEventListener('DOMContentLoaded', async () => {
    const nInput = document.getElementById("nInput");
    const frame = document.querySelector("div");

    const obj = await fetchData();
    const arr = Object.entries(obj);
    nInput.placeholder = "Last: " + Math.ceil((arr.length) / 8);
    nInput.addEventListener("change", () => {
        frame.innerHTML = "";
        const num = nInput.value;
        supplyLinks(arr.sort((a, b)=>a[1].localeCompare(b[1])), num, frame);
    });
});

function supplyLinks(list, number, container) {
    if (number > 0) {
        for (let i = ((number - 1) * 8); i < (number * 8) && i < list.length; i++) {
            let link = list[i][0];
            link = extractVid(link);
            link = "https://www.youtube.com/embed/" + link;
            const linkElement = document.createElement('iframe');
            linkElement.setAttribute("allowfullscreen", "");
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

function extractVid(str) {
    num = str.indexOf("watch?v=");
    if (num == -1) num = str.indexOf("/shorts/");
    return str.substr(num + 8, 11);
}