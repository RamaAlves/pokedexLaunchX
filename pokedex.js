const pokeNameInput = document.getElementById("pokeName");
const pokePhoto = document.getElementById("pokeImg");
const displayDatosExtra= document.getElementById("displayExt");
const displaySize= document.getElementById("size");
const displayWeight= document.getElementById("weight");
const btnAbilities = document.getElementById("btn-abilities");
const btnMoves = document.getElementById("btn-moves");
const btnStats = document.getElementById("btn-stats");
const btnSpecies = document.getElementById("btn-species");
const btnTypes = document.getElementById("btn-types");
const btnMale = document.getElementById("btn-male");
const btnFemale = document.getElementById("btn-female");
const btnShinyMale = document.getElementById("btn-shiny-male");
const btnShinyFemale = document.getElementById("btn-shiny-female");
const btnLocation = document.getElementById("btn-location");
const btnAux1 = document.getElementById("btn-aux-1");
const btnAux2 = document.getElementById("btn-aux-2");
const btnRandom = document.getElementById("btn-random");
const btnSearch = document.getElementById("btn-search");


const body = document.querySelector('body')

const pokedex = document.getElementById("pokedex-main");
const auxiliarLeds = document.getElementById("auxiliar-leds-principal");
const decorators = document.getElementById("decorators");

const PokeNotFound = './Assets/pokeball.png'

let data = null;

//variables variedades

let searchVariety; //bool

//variedades mega
let countMegaVariety;
let megaVarieties;

//variedades gmax
let countGmaxVariety;
let gmaxVarieties;



const error = `<strong>Error en la busqueda</strong>`
const loading = `<strong>CARGANDO...</strong>`
const spin = `<u><strong>cargando</strong></u> <br>`

//agregando listeners a los botones de busqueda
btnSearch.addEventListener("click",(event)=>{
    event.preventDefault();
    if (pokeNameInput.value!=""){
        fetchPokemon();
    }else{
        //animaciones y mensaje de error
        addClass(pokedex, "error")
        refreshDisplayExtra("Ingrese un dato valido para buscar")
        setTimeout(()=>{removeClass(pokedex, "error")},1000)
    }
})
btnRandom.addEventListener("click", ()=>{
    pokeRandom()
})

//animacion background
let bgXDesplazamiento = 0
setInterval(()=>{
    bgXDesplazamiento -=.375;
    body.style= `background-position-x: ${bgXDesplazamiento}px`;
},60)

//se realiza la consulta a la API de pokemon
const fetchPokemon = async ()=>{
    //reseteando elemento
    removeClass(pokedex, "error")
    removeClass(pokedex, "found")
    removeClass(decorators, "searching")
    removeClass(decorators, "found")
    //activando animacion
    addClass(pokedex, "searching-led")
    addClass(auxiliarLeds, "animation-search")
    //seteando el contador de variedades en 0, el bool en true e inicializando el array para almacenar variedades
    countMegaVariety = 0;
    countGmaxVariety = 0;
    searchVariety = true;
    megaVarieties=[];
    gmaxVarieties=[];
    
    //estableciendo el modo cargando
    refreshDisplayExtra(loading);
    let pokeName = pokeNameInput.value;
    pokeName=pokeName.toLowerCase();
    const url=`https://pokeapi.co/api/v2/pokemon/${pokeName}`;
    
    //el objeto que se recibe se lo guarda en data
    data = await fetch(url).then((res)=>{
        if (res.status!="200"){
            console.log(res)
            pokeImage("./Assets/pokemon-sad.gif")
            namePokemon("pokemon no encontrado")
            refreshDisplayExtra(error)
            removeClass(pokedex, "searching-led")
            addClass(pokedex, "error")
            removeClass(auxiliarLeds, "animation-search")
        }
        else{
            return res.json()
        }
    })
    console.log(data)
    //si se recibe data se muestra la data en la pantalla de la pokedex
    if (data){
        removeClass(auxiliarLeds, "animation-search")
        removeClass(pokedex, "searching-led")
        addClass(pokedex, "found")
        let pokeImg = data.sprites.front_default;
        pokeImage(pokeImg);
        let name = data.name;
        namePokemon(name)
        let datosPreview= `name: ${data.name} <br> Id: ${data.id}`;
        refreshDisplayExtra(datosPreview);
        let dataSize = data.height;
        refreshSize(dataSize);
        let dataWeight = data.weight;
        refreshWeight(dataWeight);
        //se agregan los listeners a los botones y se le pasa la data para mostrar la info
        addListeners(data);
    }
}

//muestra las habilidades en pantalla derecha
const pokeAbilities= async (pokemon)=>{
    //reseteando elemento
    removeClass(decorators, "searching")
    removeClass(decorators, "found")
    //activando animacion
    addClass(decorators, "searching")
    //estableciendo el modo cargando
    refreshDisplayExtra(loading);
    let abilitiesData =pokemon?.abilities
    //variable donde se agregaran los datos
    let text =`<u><strong>Abilities:</strong></u> <br>`
    //se itera por todas las habilidades 
    let count=0;
    for (ability in abilitiesData){
        count+=1;
        let dir = abilitiesData[ability]?.ability?.url
        //por cada habilidad se consulta los datos realizando una peticion
        let consulta= await fetch(dir).then((res)=>{
            if (res.status!="200"){
                console.log(res)
            }
            else{
                return res.json()
            }
        })
        //se itera por los datos recibidos buscando el nombre de la habilidad en español
        //al finalizar se agrega el nombre de la habilidad al text
        for (element in consulta?.names){
            if (consulta.names[element]?.language?.name =="es"){
                let abilityName = `<strong>${consulta.names[element]?.name}:</strong> <br>`;
                text+= abilityName
                break;
            }
        }
        
        //se itera por los datos recibidos buscando la descripcion de la habilidad en español
        //al finalizar se agrega la descripcion de la habilidad al text
        for (element in consulta?.flavor_text_entries){
            if (consulta.flavor_text_entries[element]?.language?.name == "es"){
                let abilityDescription = `${consulta.flavor_text_entries[element].flavor_text} <br><br>`;
                text += abilityDescription;
                break;
            }
        }
        if (count%10===0){
            copy = text
            copy+= `<br> <strong>cargando mas datos...</strong>`
            refreshDisplayExtra(copy);
        }
    }
    //por ultimo se actualiza el display con los datos obtenidos
    refreshDisplayExtra(text);
    //animacion de finalizacion
    removeClass(decorators, "searching")
    addClass(decorators, "found")
};
//muestra los movimientos en pantalla derecha
const pokeMoves= async (pokemon)=>{
    //reseteando elemento
    removeClass(decorators, "searching")
    removeClass(decorators, "found")
    //activando animacion
    addClass(decorators, "searching")
    //estableciendo el modo cargando
    refreshDisplayExtra(loading);
    let movesData =pokemon?.moves
    //variable donde se agregaran los datos
    let text =`<u><strong>Movimientos:</strong></u> <br>`
    //se itera por todos los movimientos 
    let count=0;
    for (moves in movesData){
        count+=1;
        let dir = movesData[moves]?.move?.url
        //por cada movimiento se consulta los datos realizando una peticion
        let consulta= await fetch(dir).then((res)=>{
            if (res.status!="200"){
                console.log(res)
            }
            else{
                return res.json()
            }
        })
        //se itera por los datos recibidos buscando el nombre del movimiento en español
        //al finalizar se agrega el nombre del movimiento al text
        
        for (element in consulta?.names){
            if (consulta.names[element]?.language?.name =="es"){
                let abilityName = `<strong>${consulta.names[element]?.name}:</strong> <br>`;
                text+= abilityName
                break;
            }
        }
        
        //se itera por los datos recibidos buscando la descripcion del movimiento en español
        //al finalizar se agrega la descripcion del movimiento al text
        for (element in consulta?.flavor_text_entries){
            if (consulta.flavor_text_entries[element]?.language?.name == "es"){
                let abilityDescription = `${consulta.flavor_text_entries[element].flavor_text} <br><br>`;
                text += abilityDescription;
                break;
            }
        }
        if (count%10===0){
            copy = text
            copy+= `<br> <strong>cargando mas datos...</strong>`
            refreshDisplayExtra(copy);
        }
    }
    //por ultimo se actualiza el display con los datos obtenidos
    refreshDisplayExtra(text);
    //animacion de finalizacion
    removeClass(decorators, "searching")
    addClass(decorators, "found")
};
//muestra las estadisticas en la pantalla derecha
const pokeStats= async (pokemon)=>{
    //reseteando elemento
    removeClass(decorators, "searching")
    removeClass(decorators, "found")
    //activando animacion
    addClass(decorators, "searching")
    //estableciendo el modo cargando
    refreshDisplayExtra(loading);
    let statsData =pokemon?.stats
    
    //variable donde se agregaran los datos
    let text =`<u><strong>Estadisticas:</strong></u> <br>`
    //se itera por todos los Estadisticas 
    let count=0;
    for (stat in statsData){
        count+=1;
        let dir = statsData[stat]?.stat?.url
        //por cada estadistica se consulta los datos realizando una peticion
        let consulta= await fetch(dir).then((res)=>{
            if (res.status!="200"){
                console.log(res)
            }
            else{
                return res.json()
            }
        })
        //se itera por los datos recibidos buscando el nombre de la estadistica en español
        //al finalizar se agrega el nombre de la estadistica al text
        for (element in consulta?.names){
            if (consulta.names[element]?.language?.name =="es"){
                let abilityName = `<strong>${consulta.names[element]?.name}:</strong> <br>`;
                text+= abilityName
                break;
            }
        }
        
        //se busca en los datos recibidos buscando el valor de la estadistica y al finalizar se agrega al text
        let statValue = `${statsData[stat].base_stat} <br><br>`;
        text += statValue;

        if (count%10===0){
            copy = text
            copy+= `<br> <strong>cargando mas datos...</strong>`
            refreshDisplayExtra(copy);
        }
    }
    //por ultimo se actualiza el display con los datos obtenidos
    refreshDisplayExtra(text);
    //animacion de finalizacion
    removeClass(decorators, "searching")
    addClass(decorators, "found")
}
//muestra la especie en la pantalla de la derecha
const pokeSpecies= async (pokemon)=>{
    //reseteando elemento
    removeClass(decorators, "searching")
    removeClass(decorators, "found")
    //activando animacion
    addClass(decorators, "searching")
    //estableciendo el modo cargando
    refreshDisplayExtra(loading);
    let speciesData =pokemon?.species
    
    //variable donde se agregaran los datos
    let text =`<u><strong>Especie:</strong></u> <br>`
    //se itera por todas las habilidades 
    if (speciesData != null){
        let dir = speciesData?.url
        //por cada habilidad se consulta los datos realizando una peticion
        let consulta= await fetch(dir).then((res)=>{
            if (res.status!="200"){
                console.log(res)
            }
            else{
                return res.json()
            }
        })
        
        //se itera por los datos recibidos buscando la especie en español
        //al finalizar se agrega el nombre de la especie al text
        
        for (element in consulta?.genera){
            if (consulta.genera[element]?.language?.name =="es"){
                let genus = `<p>${consulta.genera[element]?.genus}</p> <br>`;
                text+= genus;
            }
        }
        
        //se itera por los datos recibidos buscando las descripciones en español
        //al finalizar se agrega la descripcion al text
        text += `<strong>Descripcion:</strong><br>`
        let count=0;
        for (element in consulta?.flavor_text_entries){
            count+=1;
            if (consulta.flavor_text_entries[element]?.language?.name =="es"){
                let colorData = `<p>${consulta.flavor_text_entries[element]?.flavor_text}</p> <br>`;
                text+= colorData;
            }
            if (count%10===0){
                copy = text
                copy+= `<br> <strong>cargando mas datos...</strong>`
                refreshDisplayExtra(copy);
            }
        }
    }
    //por ultimo se actualiza el display con los datos obtenidos
    refreshDisplayExtra(text);
    //animacion de finalizacion
    removeClass(decorators, "searching")
    addClass(decorators, "found")
};
//muestra los tipos en la pantalla de la derecha
const pokeTypes= async (pokemon)=>{
    //reseteando elemento
    removeClass(decorators, "searching")
    removeClass(decorators, "found")
    //activando animacion
    addClass(decorators, "searching")
    //estableciendo el modo cargando
    refreshDisplayExtra(loading);
    let typesData =pokemon?.types
    //variable donde se agregaran los datos
    let text =`<u><strong>Tipos:</strong></u> <br>`
    //se itera por todos los tipos 
    let count=0;
    for (type in typesData){
        count+=1;
        let dir = typesData[type]?.type?.url
        //por cada tipo se consulta los datos realizando una peticion
        let consulta= await fetch(dir).then((res)=>{
            if (res.status!="200"){
                console.log(res)
            }
            else{
                return res.json()
            }
        })
        //se itera por los datos recibidos buscando el nombre del tipo en español
        //al finalizar se agrega el nombre del tipo al text
        
        for (element in consulta?.names){
            if (consulta.names[element]?.language?.name =="es"){
                let typeName = `<p>${consulta.names[element]?.name}</p> `;
                text+= typeName
            }
        }
        
        if (count%10===0){
            copy = text
            copy+= `<br> <strong>cargando mas datos...</strong>`
            refreshDisplayExtra(copy);
        }
    }
    //por ultimo se actualiza el display con los datos obtenidos
    refreshDisplayExtra(text);
    //animacion de finalizacion
    removeClass(decorators, "searching")
    addClass(decorators, "found")
};

//muestra la imagen de un pokemon macho
const pokeMale= (pokemon)=>{
    //reseteando elemento
    removeClass(decorators, "searching")
    removeClass(decorators, "found")
    //activando animacion
    addClass(decorators, "searching")
    
    let malePhoto =pokemon?.sprites?.front_default
    if (malePhoto){
        pokeImage(malePhoto)
        let datosPreview= `name: ${data.name} <br> Id: ${data.id}`;
        refreshDisplayExtra(datosPreview);
        //animacion de finalizacion
        removeClass(decorators, "searching")
        addClass(decorators, "found")
    }else{
        let errorPhoto=`<strong>No se encontró la imagen solicitada</strong>`
        pokeImage(PokeNotFound)
        refreshDisplayExtra(errorPhoto);
        //animacion de finalizacion
        removeClass(decorators, "searching")
        addClass(decorators, "found")
    }
};

//muestra la imagen de un pokemon hembra
const pokeFemale= (pokemon)=>{
    //reseteando elemento
    removeClass(decorators, "searching")
    removeClass(decorators, "found")
    //activando animacion
    addClass(decorators, "searching")

    let femalePhoto =pokemon?.sprites?.front_female
    if (femalePhoto){
        pokeImage(femalePhoto)
        let datosPreview= `name: ${data.name} <br> Id: ${data.id}`;
        refreshDisplayExtra(datosPreview);
        //animacion de finalizacion
        removeClass(decorators, "searching")
        addClass(decorators, "found")
    }else{
        let errorPhoto=`<strong>No se encontró la imagen solicitada</strong>`
        pokeImage(PokeNotFound)
        refreshDisplayExtra(errorPhoto);
        //animacion de finalizacion
        removeClass(decorators, "searching")
        addClass(decorators, "found")
    }
};
//muestra la imagen de un pokemon macho shiny
const pokeShinyMale= (pokemon)=>{
    //reseteando elemento
    removeClass(decorators, "searching")
    removeClass(decorators, "found")
    //activando animacion
    addClass(decorators, "searching")

    let malePhoto =pokemon?.sprites?.front_shiny
    if (malePhoto){
        pokeImage(malePhoto)
        let datosPreview= `name: ${data.name} <br> Id: ${data.id}<br> Shiny`;
        refreshDisplayExtra(datosPreview);
        //animacion de finalizacion
        removeClass(decorators, "searching")
        addClass(decorators, "found")
    }else{
        let errorPhoto=`<strong>No se encontró la imagen solicitada</strong>`
        pokeImage(PokeNotFound)
        refreshDisplayExtra(errorPhoto);
        //animacion de finalizacion
        removeClass(decorators, "searching")
        addClass(decorators, "found")
    }
};

//muestra la imagen de un pokemon hembra shiny
const pokeShinyFemale= (pokemon)=>{
    //reseteando elemento
    removeClass(decorators, "searching")
    removeClass(decorators, "found")
    //activando animacion
    addClass(decorators, "searching")

    let femalePhoto =pokemon?.sprites?.front_shiny_female
    if (femalePhoto){
        pokeImage(femalePhoto)
        let datosPreview= `name: ${data.name} <br> Id: ${data.id}<br> Shiny`;
        refreshDisplayExtra(datosPreview);
        //animacion de finalizacion
        removeClass(decorators, "searching")
        addClass(decorators, "found")
    }else{
        let errorPhoto=`<strong>No se encontró la imagen solicitada</strong>`
        pokeImage(PokeNotFound)
        refreshDisplayExtra(errorPhoto);
        //animacion de finalizacion
        removeClass(decorators, "searching")
        addClass(decorators, "found")
    }
};
//muestra las ubicaciones conocidas en la pantalla de la derecha
const pokeLocation= async (pokemon)=>{
    //reseteando elemento
    removeClass(decorators, "searching")
    removeClass(decorators, "found")
    //activando animacion
    addClass(decorators, "searching")
    //estableciendo el modo cargando
    refreshDisplayExtra(loading);
    //estableciendo contador
    let count =0;
    //definiendo url
    let locationData =pokemon?.location_area_encounters
    //variable donde se agregaran los datos
    let text =`<u><strong>Ubicaciones:</strong></u> <br>`
    //se consulta todas las ubicaciones 
    
    let consulta= await fetch(locationData).then((res)=>{
        if (res.status!="200"){
            console.log(res)
        }
        else{
            return res.json()
        }
    })
    if (consulta.length<=0){
        text +=`<p>No hay ubicaciones disponibles</p>`
    }else{
        //verificar si existe url y llamar a la api 
        for (element in consulta){
            count+=1;
            let nameArea = null;
            if(consulta[element]?.location_area?.url){
                let locationAreaDir = consulta[element]?.location_area?.url
                console.log(locationAreaDir)
                let areaEncounters = await fetch(locationAreaDir).then((res)=>{
                    if (res.status!="200"){
                        console.log(res)
                    }
                    else{
                        return res.json()
                    }
                })
                console.log(areaEncounters)
                //define el nombre del area en ingles
                nameArea = `<p>${areaEncounters?.name}</p>`
                //busca si existe el nombre del area en español y en caso de encontrarlo sobreescribe la variable anterior
                for (area in areaEncounters?.names){
                    if (areaEncounters?.names[area]?.language?.name =="es"){
                        nameArea = `<p>${areaEncounters?.names[area]?.name}</p>`
                    }
                }
            }
            //verifica la cantidad de informacion y realiza cargas progresivas
            text += nameArea;
            if (count%10 == 0){
                copy = text
                copy += `<strong>Cargando...</strong>`
                refreshDisplayExtra(copy);
            }
        }
    }
    //por ultimo se actualiza el display con los datos obtenidos
    refreshDisplayExtra(text);
    //animacion de finalizacion
    removeClass(decorators, "searching")
    addClass(decorators, "found")
};

//muestra las ubicaciones conocidas en la pantalla de la derecha
const pokeMega= async (pokemon)=>{
    //reseteando elemento
    removeClass(decorators, "searching")
    removeClass(decorators, "found")
    //activando animacion
    addClass(decorators, "searching")
    //verificando si la busqueda ya se realizó
    await searchVarieties(pokemon)
    //estableciendo el modo cargando
    refreshDisplayExtra(loading);

    //variable donde se agregaran los datos
    let text =`<u><strong>Variedad:</strong></u> <br>`
    let textVariety=`<p>No se encontraron variedades mega de este pokemon</p>`
    if (megaVarieties[countMegaVariety]?.url != null){
        let req = await fetch(megaVarieties[countMegaVariety]?.url).then((res)=>{
            if (res.status!="200"){
                console.log(res)
            }
            else{
                return res.json()
            }
        })
        textVariety=`<p>nombre: ${req.name}</p><p> Id: ${req.id}</p>`
        pokeImage(req.sprites.front_default)
        refreshSize(req.height);
        refreshWeight(req.weight);
    }
    
    text+=textVariety;
    
    refreshDisplayExtra(text);
    //animacion de finalizacion
    removeClass(decorators, "searching")
    addClass(decorators, "found")
    if (countMegaVariety>=megaVarieties.length-1){
        countMegaVariety = 0;
    }else{
        countMegaVariety++;
    }
};

//muestra las ubicaciones conocidas en la pantalla de la derecha
const pokeGmax= async (pokemon)=>{
    //reseteando elemento
    removeClass(decorators, "searching")
    removeClass(decorators, "found")
    //activando animacion
    addClass(decorators, "searching")
    //verificando si la busqueda ya se realizó
    await searchVarieties(pokemon)
    //estableciendo el modo cargando
    refreshDisplayExtra(loading);

    //variable donde se agregaran los datos
    let text =`<u><strong>Variedad:</strong></u> <br>`
    let textVariety=`<p>No se encontraron variedades gmax de este pokemon</p>`
    if (gmaxVarieties[countGmaxVariety]?.url != null){
        let req = await fetch(gmaxVarieties[countGmaxVariety]?.url).then((res)=>{
            if (res.status!="200"){
                console.log(res)
            }
            else{
                return res.json()
            }
        })
        textVariety=`<p>nombre: ${req.name}</p><p> Id: ${req.id}</p>`
        pokeImage(req.sprites.front_default)
        refreshSize(req.height);
        refreshWeight(req.weight);
    }
    
    text+=textVariety;
    
    refreshDisplayExtra(text);
    //animacion de finalizacion
    removeClass(decorators, "searching")
    addClass(decorators, "found")
    if (countGmaxVariety>=gmaxVarieties.length-1){
        countGmaxVariety = 0;
    }else{
        countGmaxVariety++;
    }
};

//realiza la busqueda de variedades
const searchVarieties = async (pokemon)=>{
    if(searchVariety){
        console.log('no debo estar aqui')
        //actualizando bool
        searchVariety= false;
        let speciesData =pokemon?.species
        
        //se itera por todas las habilidades 
        if (speciesData != null){
            let dir = speciesData?.url
            //por cada habilidad se consulta los datos realizando una peticion
            let consulta= await fetch(dir).then((res)=>{
                if (res.status!="200"){
                    console.log(res)
                }
                else{
                    return res.json()
                }
            })
            for (variety of consulta?.varieties){
                console.log (variety?.pokemon?.name)
                if (variety?.pokemon?.name.includes('mega')){
                    let megaVariety = variety.pokemon;
                    megaVarieties.push(megaVariety);
                }else if(variety?.pokemon?.name.includes('gmax')){
                    let gmaxVariety = variety.pokemon;
                    gmaxVarieties.push(gmaxVariety);
                }
            }
        }
    }
}

const pokeRandom= ()=>{
    const randomNumber = (number)=>{
        return Math.ceil(Math.random()*number)
    }
    //modificar el valor que se pasa como parametro a randomNumber cuando se quiera modificar la cantidad de pokemones aleatorios
    pokeNameInput.value=randomNumber(1020)
    console.log(pokeNameInput.value)
    fetchPokemon();
}
//se recibe como parametro la data despues de la busqueda y se agregan las funciones a los botones adicionales
const addListeners=(poke)=>{
    btnAbilities.addEventListener("click", ()=>{
        pokeAbilities(poke);
    });
    btnMoves.addEventListener("click", ()=>{
        pokeMoves(poke)
    })
    btnStats.addEventListener("click", ()=>{
        pokeStats(poke)
    })
    btnSpecies.addEventListener("click", ()=>{
        pokeSpecies(poke)
    })
    btnTypes.addEventListener("click", ()=>{
        pokeTypes(poke)
    })
    btnMale.addEventListener("click", ()=>{
        pokeMale(poke)
    })
    btnFemale.addEventListener("click", ()=>{
        pokeFemale(poke)
    })
    btnShinyMale.addEventListener("click", ()=>{
        pokeShinyMale(poke)
    })
    btnShinyFemale.addEventListener("click", ()=>{
        pokeShinyFemale(poke)
    })
    btnLocation.addEventListener("click", ()=>{
        pokeLocation(poke)
    })
    btnAux1.addEventListener("click", ()=>{
        pokeMega(poke)
    })
    btnAux2.addEventListener("click", ()=>{
        pokeGmax(poke)
    })
}

const pokeImage= (url) => {
    pokePhoto.src= url
}

const namePokemon=(name)=>{
    pokeNameInput.value=name
}

const refreshDisplayExtra = (datos)=>{
    displayDatosExtra.innerHTML= datos;
}

const refreshSize=(dataSize)=>{
    let size = Math.round(dataSize*10)
    if (size <100){
        displaySize.innerText= size + " cm";
    }
    else{
        displaySize.innerText= size/100 + " mts";
    }

}
const refreshWeight=(dataWeight)=>{
    let weight = ((dataWeight*100)/1000);
    displayWeight.innerText= weight.toFixed(1)+" kgs";
}

//animaciones 

//agregar una animacion por medio de clases
//recibe un elemento del dom como primer parametro y un nombre de clase como string en el segundo
const addClass=(element, classAdd)=>{
    element.classList.add(classAdd)
}

//eliminar una animacion quitando una clase
//recibe un elemento del dom como primer parametro y un nombre de clase como string en el segundo
const removeClass =(element, classRemove)=>{
    if(element.classList.contains(classRemove)){
        element.classList.remove(classRemove)
    }
}