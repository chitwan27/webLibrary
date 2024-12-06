document.addEventListener('DOMContentLoaded', async () => {
    const nInput = document.getElementById("nInput");
    const frame = document.querySelector("div");

    const obj = await fetchData();
    const arr = Object.entries(obj);
    nInput.placeholder = "Last: " + Math.ceil((arr.length) / 16);
    nInput.addEventListener("change", () => {
        frame.innerHTML = "";
        const num = nInput.value;
        supplyLinks(arr, num, frame);
    });
});

function supplyLinks(list, number, container) {
    if (number > 0) {
        for (let i = ((number - 1) * 16); i < (number * 16) && i < list.length; i++) {
            const title = list[i][1];
            const link = list[i][0];

            const lnk = document.createElement('a');
            lnk.setAttribute("target", "_blank");
            lnk.textContent = "🔗";
            lnk.textContent += title;
            lnk.href = link;

            if (lnk.textContent.length < 5) lnk.textContent += link;
            const linkElement = document.createElement('div');
            linkElement.style.backgroundColor = "#FFF7F7";
            linkElement.style.borderColor = "#0f99f0";
            linkElement.style.borderRadius = "10px";
            linkElement.style.minHeight = "125px";
            linkElement.style.width = "250px";

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
