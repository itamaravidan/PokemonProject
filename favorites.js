(function getAllFavorites(){
    const favorites = JSON.parse(localStorage.getItem("allFavorites"));
    
    const sectionAllFavorites = document.getElementById("sectionAllFavorites");

    if (favorites == null) {
        const paragraph = document.createElement("p");
        paragraph.textContent = "No favorites yet";
        sectionAllFavorites.append(paragraph);
    } else {
        favorites.forEach(element => {
            const div = document.createElement("div");
            div.classList.add("divEachPokemon"); 

            const para = document.createElement("p");
            para.classList.add("nameTitlePokemon"); 

            const image = document.createElement("img");
            image.classList.add("imagePokemon"); 

            para.textContent = element.name;
            image.src = element.picture;
            image.alt = `An image of a favorite pokemon ${element.name}`

            div.append(para, image);
            sectionAllFavorites.append(div);
        })
        const buttonClearFavorites = createClearButton() 
        sectionAllFavorites.append(buttonClearFavorites);     

    }
})()

function createClearButton(){
    const clearButton = document.createElement("button");
    clearButton.textContent = 'Clear All';
    clearButton.addEventListener("click", clearAll);
    clearButton.classList.add("btnPokemon", "clearbtn");
    return clearButton;
}

function clearAll(){
    localStorage.clear();
    const allDiv = document.querySelectorAll(".divEachPokemon");
    for(let i = 0; i<allDiv.length; i++){
        allDiv[i].remove();
    }
}