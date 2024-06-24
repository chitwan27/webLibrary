document.addEventListener('DOMContentLoaded', () => {
    const nInput = document.getElementById("nInput");
    const frame = document.querySelector("div");
    pageReferesher(nInput, frame);
});

async function pageReferesher(npt, cntnr) {
    const arr = await fetchData();
    npt.addEventListener("change", () => {
        cntnr.innerHTML = "";
        const num = npt.value;
        supplyLinks(arr,num,cntnr);
    });
}

function supplyLinks(list,number,container) {
    if (number>0) {
        for(let i = ((number-1)*10); i < (number*10) && i < list.length; i++) {
            const link = "https://www.youtube.com/embed/" + list[i];
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
        const response = await fetch('/api/data');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();        
    } 
    catch (error) {
        console.error('Error fetching data:', error);
    }
}