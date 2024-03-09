let allFavorites;

if(JSON.parse(localStorage.getItem("allFavorites")) === null) {
    allFavorites = [];
} else {
    allFavorites = JSON.parse(localStorage.getItem("allFavorites"));
}


(async function getAllPokemons () {
    try {
        const allPokemon = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");

        

        if (allPokemon.status !== 200){
            throw new Error("Something went wrong with fetching the 151 pokemons")
        } else {
            const pokemonsData = await allPokemon.json(); //the json method returns a promise
            console.log(pokemonsData);
            const pokemonResults = pokemonsData.results; //inside the key results
        
            loopThroughAllPokemon(pokemonResults); 
            // pokemonResults is an array of 151 objects
            // [{name:"bulbasaur", url:"https://pokeapi.co/api/v2/pokemon/1"},
          
        }
    } catch(err){
        console.log("we have an error", err);
    }
})()


async function loopThroughAllPokemon (pokemonResults) {
    const allPokemon = []; 

    for (let i = 0; i<pokemonResults.length; i++) {
        const data = await getDataOnePokemon(pokemonResults[i].url);
        const pokemonData = {
                    id : data.id,
                    name : data.name, 
                    picUrl : data.sprites.front_default,
                    types : data.types,
                    moves: data.moves,
                    game_indices : data.game_indices,
                    locationUrl : data.location_area_encounters,
                    speciesUrl : data.species.url,
        };
    
        allPokemon.push(pokemonData);
    }
    allPokemon.sort(cmpPokimons)

    

    allPokemon.forEach(pokemon => addPokemon(pokemon))
}


function cmpPokimons(pkD1,pkD2){
    console.log(pkD1.name[0] - pkD2.name[0])
   return pkD1.name.charCodeAt(0) - pkD2.name.charCodeAt(0);
}

//for every url  call this function
async function getDataOnePokemon(pokemonUrl){
    try {
        const onePokemon = await fetch(pokemonUrl);

        if (onePokemon.status !== 200){
            throw new Error("Something went wrong with fetching the one pokemon")
        } else {
            const onePokemonData = await onePokemon.json(); 
            return onePokemonData; 
        }
    } catch(err){ 
        console.log("we have an error", err);
    } 
}

function addPokemon (pokemon) {
        //extract the data from the object to use it
        const namePokemon = pokemon.name;
        const imgPokemon  = pokemon.picUrl;
        const allTypes = pokemon.types;
        const allMoves = pokemon.moves;
        const allGames = pokemon.game_indices;
        const locationUrl = pokemon.locationUrl;
        const speciesUrl = pokemon.speciesUrl;

        const sectionAllPokemon = document.getElementById("sectionAllPokemons"); 
        

        const divPokemon = document.createElement("div"); 
        divPokemon.classList.add("divEachPokemon"); 

        const titlePokemon = document.createElement("h1");
        titlePokemon.classList.add("nameTitlePokemon"); 

        const picPokemon = document.createElement("img");
        picPokemon.classList.add("imagePokemon"); 

        titlePokemon.textContent = namePokemon;
        picPokemon.src = imgPokemon; 
        picPokemon.alt = `A picture of ${namePokemon}`;

        const buttonReadMore = createButton("Read more about the pokemon", revealInfo);        
        const buttonAddToFavorite = createButton(`Add  ${namePokemon} to favorite`, addToFavorite);

        const sectionMoreInfo = document.createElement("section");
        sectionMoreInfo.classList.add("hidden", "sectionMoreInfo") 

        divPokemon.append(buttonAddToFavorite, titlePokemon, picPokemon, buttonReadMore, sectionMoreInfo);
        sectionAllPokemon.appendChild(divPokemon);

        appendMoreInfo(allTypes, "Types", sectionMoreInfo);
        appendMoreInfo(allMoves, "Moves", sectionMoreInfo);
        appendMoreInfo(allGames, "Games", sectionMoreInfo);
        retrieveLocations (locationUrl, sectionMoreInfo);
        retrieveEvolution(speciesUrl, sectionMoreInfo); 
}

function createButton(titleButton, func) {
    const button = document.createElement("button");
    button.textContent = titleButton;
    button.addEventListener("click", func); 
    button.classList.add("btnPokemon"); 
    return button;
}

async function retrieveLocations (locationUrl, sectionMoreInfo){
    try {
        const allLocationsData = await fetch(locationUrl);
        if(allLocationsData.status !== 200) {
            throw new Error ("Problem with the locations");
        } else {
            const locations = await allLocationsData.json();
            appendMoreInfo(locations, "Locations", sectionMoreInfo);
        }
    } catch (err) {
        console.log(err); //"Problem with the locations"
    }

}

async function retrieveEvolution(speciesUrl, sectionMoreInfo){
    try {
        const allSpeciesData = await fetch(speciesUrl);
        if(allSpeciesData.status !== 200) {
            throw new Error ("Problem with the species");
        } else {
            const species = await allSpeciesData.json();
            const speciesEvolveFrom = species.evolves_from_species;
                
            let pokemonFrom;

            if (speciesEvolveFrom === null) {
                pokemonFrom = null;
            } else {
                pokemonFrom = speciesEvolveFrom.name;
            }

            appendMoreInfo(pokemonFrom, "Previous Evolution", sectionMoreInfo);

            const currentPokemon = species.name;
            const infoEvolutionTo = await retrieveFutureEvolution(species.evolution_chain.url, pokemonFrom, currentPokemon);                
            appendMoreInfo(infoEvolutionTo, "Future Evolutions", sectionMoreInfo);
        }
    } catch (err) {
        console.log(err); 
    } 
}

async function retrieveFutureEvolution (evolutionChainUrl, pokemonfrom, currentPokemon){
    try {
        
        // the url looks like this :  https://pokeapi.co/api/v2/evolution-chain/1/
        const allEvolutionsData = await fetch(evolutionChainUrl);
        if(allEvolutionsData.status !== 200) {
            throw new Error ("Problem with the evolutions chains");
        } else {
            const evolutions = await allEvolutionsData.json();

            let varEvolution = evolutions.chain.evolves_to[0]; //first evolution

            const arrEvolution = [];

            while(varEvolution !== undefined){
                //if name of the pokemon is not included in the array of prev and curr
                if([currentPokemon,pokemonfrom].includes(varEvolution.species.name) === false){
                    arrEvolution.push(varEvolution.species.name);
                }
                
                varEvolution = varEvolution.evolves_to[0]; 
            }

            return arrEvolution;
        }
    } catch (err) {
        console.log(err); 
    }
}


function appendMoreInfo (data, titleInfo, sectionMoreInfo) {

    const h2 =  document.createElement("h2");
    if (titleInfo === "Previous Evolution") {
        h2.textContent = `The ${titleInfo}`;
    } else {
        h2.textContent = `All ${titleInfo}`;
    }
   
    const moreInfoDiv = document.createElement("div");
    const moreInfoParagraph = document.createElement("p");
    moreInfoDiv.appendChild(moreInfoParagraph);
    sectionMoreInfo.append(h2, moreInfoDiv);

    if(data === null || data.length === 0){
        moreInfoParagraph.textContent = `No ${titleInfo} for this pokemon`;
    } else if (typeof data === "string") { 
        //the data from evolution_from is a string, so we need this condition
        moreInfoParagraph.textContent = data;
    } else {
        data.forEach((element) => {
            if(titleInfo === "Types") {
                moreInfoParagraph.textContent += `${element.type.name}, `; //to not override
                const imageType = document.createElement("img");
                imageType.src = `icons-pokemon\\${element.type.name}.png`; 
                imageType.style.width = 30+"px"; 
                moreInfoDiv.appendChild(imageType);
            } else if (titleInfo === "Moves") {
                moreInfoParagraph.textContent += `${element.move.name}, `;
            } else if (titleInfo === "Games") {
                moreInfoParagraph.textContent += `${element.version.name}, `;
            } else if (titleInfo === "Locations"){
                moreInfoParagraph.textContent += `${element.location_area.name}, `;
            } else if (titleInfo === "Future Evolutions") { 
                moreInfoParagraph.textContent += `${element}, `;
            }   
        }) 
    }
}

function revealInfo(event) {
    const section = event.target.nextElementSibling;
    section.classList.toggle("hidden");
}

function addToFavorite(event){ 
    const div = event.target.parentElement;
    const namePokemon = div.querySelector("h1").textContent; 
    const picPokemon = div.querySelector("img").src; 

    const newPokemon = {
        name : namePokemon,
        picture : picPokemon,
    }
  
    if (allFavorites.some(existingFavoritePokemon => existingFavoritePokemon.name === newPokemon.name) === false && allFavorites.length < 6){
        allFavorites.push(newPokemon);
    } else if(allFavorites.length == 6) {
        alert("The favorites can contain maximum 6 pokemons")
    } else {
        alert(`you already have ${namePokemon.toUpperCase()} in the favorites`);
    }

    localStorage.setItem("allFavorites", JSON.stringify(allFavorites))
}



