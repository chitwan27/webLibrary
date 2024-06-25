document.addEventListener('DOMContentLoaded', async () => {
    const nInput = document.getElementById("nInput");
    const frame = document.querySelector("div");

    const obj = await fetchData(); 
    const arr = Object.entries(obj);
    nInput.placeholder = "1 - " + Math.floor((arr.length)/10 + 1);
    nInput.addEventListener("change", () => {
        frame.innerHTML = "";
        const num = nInput.value;
        supplyLinks(arr,num,frame);
    });
});

function supplyLinks(list,number,container) {
    if (number>0) {
        for(let i = ((number-1)*10); i < (number*10) && i < list.length; i++) {
            const link = list[i][0];
            const title = list[i][1][0];
            const image = list[i][1][1];

            const linkEmbed = document.createElement('embed');
            linkEmbed.style.maxHeight = "125px";
            linkEmbed.style.maxWidth = "250px";
            linkEmbed.src = image;

            const lnk = document.createElement('a');
            lnk.setAttribute("target","_blank");
            lnk.textContent = " 🔗 ";
            lnk.textContent += title;
            lnk.href = link;

            const linkElement = document.createElement('div');
            linkElement.style.justifyContent = "space-evenly";
            linkElement.style.backgroundColor = "#FFF7F7";
            linkElement.style.borderColor = "#0F88FB";
            linkElement.style.borderRadius = "10px";
            linkElement.style.flexWrap = "nowrap";
            linkElement.style.height = "300px";
            linkElement.style.width = "600px";

            linkElement.appendChild(linkEmbed);
            linkElement.appendChild(lnk);

            container.appendChild(linkElement);
        }
    }
}

async function fetchData() {
    try {
        const response = await fetch('/api/pocket');
        if (!response.ok) {
            throw new Error('Network Response: ' + response.statusText);
        }
        return response.json();        
    } 
    catch (error) {
        console.error('Error Fetching:', error);
    }
}
