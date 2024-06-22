document.addEventListener('DOMContentLoaded', () => {
    const nInput = document.getElementById("nInput");
    nInput.placeholder = "1-56";

    nInput.addEventListener("change", () => {
        const num = document.getElementById("nInput").value;
        const div = document.querySelector("div");
        dv.innerHTML = "";
        fetchData(num,div);
    });
    
});

async function fetchData(num,div) {
    try {
        // Fetch the data from the server
        const response = await fetch('/api/data');
        // Check if the response is OK (status in the range 200-299)
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        // Parse the response as JSON
        const data = await response.json();
        // Fill the links into the div element
        supplyLinks(data,num,div);
    } 
    catch (error) {
        // Handle any errors that occurred during the fetch or parsing
        console.error('Error fetching data:', error);
    }
}

function supplyLinks(list,num,div) {
    if (num>0) {
        for(let i = ((num-1)*10); i < (num*10) && i < list.length; i++) {
            const link = "https://www.youtube.com/embed/" + list[i];
            const linkElement = document.createElement('iframe');
            linkElement.setAttribute("allowfullscreen","");
            div.appendChild(linkElement);
            linkElement.height = 300;
            linkElement.width = 600;
            linkElement.src = link;
        }
    }
}