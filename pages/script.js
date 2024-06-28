document.getElementById('enter').addEventListener('click', async function() {
    const response = await fetch('/trigger-sync'); 
    console.log("Synced!"); 
});