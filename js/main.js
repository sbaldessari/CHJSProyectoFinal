const abecedario = 'abcdefghijklmnopqrstuvwxyz'.split('')
let palabraElegida = []
const coincidencias = []
const letrasIngresadas = []
let chances = 10
let intentos = 0
let usuario = ""

let botonNuevoJuego = document.getElementById("btnNuevoJuego")
botonNuevoJuego.addEventListener("click", () => nuevoJuego())     
let botonIngresarUsuario = document.getElementById("btnIngresarUsuario")
botonIngresarUsuario.addEventListener("click", () => iniciarJuego())     
let botonIngresarPalabra = document.getElementById("btnIngresarPalabra")
botonIngresarPalabra.addEventListener("click", () => intentarPalabra())  
let botonSolicitarPista = document.getElementById("btnSolicitarPista")
botonSolicitarPista.addEventListener("click", () => solicitarPista())  
let botonRankingBusqueda = document.getElementById("txtRankingBusqueda")
botonRankingBusqueda.addEventListener("keyup", () => rankingBusqueda())

let thPuesto = document.getElementById("thPuesto")
thPuesto.addEventListener("click", () => ordenarTablaRanking(0))
document.getElementById("thPuesto").style.cursor = "pointer"

let thUsuario = document.getElementById("thUsuario")
thUsuario.addEventListener("click", () => ordenarTablaRanking(1))
document.getElementById("thUsuario").style.cursor = "pointer"

let thIntentos = document.getElementById("thIntentos")
thIntentos.addEventListener("click", () => ordenarTablaRanking(2))
document.getElementById("thIntentos").style.cursor = "pointer"

let thPalabra = document.getElementById("thPalabra")
thPalabra.addEventListener("click", () => ordenarTablaRanking(3))
document.getElementById("thPalabra").style.cursor = "pointer"

ocultarElemento("divNuevoJuego")

renderizarRanking()

function nuevoJuego(){

    mostrarElemento("divNuevoJuego")
    
    mostrarElemento("divUsuario")
    ocultarElemento("divAhorcado")

    document.getElementById("txtUsuario").value = ""
    document.getElementById("txtPalabra").value = ""   

}

function iniciarJuego(){

    const baseDeDatosPalabras = []
    delete palabraElegida
    coincidencias.splice(0,coincidencias.length)
    letrasIngresadas.splice(0,letrasIngresadas.length)
    intentos = 0

    usuario = document.getElementById("txtUsuario").value

    if(usuario == ""){
        Toastify({
            text: `Debes ingresar un nombre de usuario`,
            className: "info",
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            }
        }).showToast()       
    }else{
        ocultarElemento("divUsuario")

        fetch('/data/data.json')
            .then(respuesta => respuesta.json())
            .then(data => {

                data.forEach((item) => {
                    let palabra = new Palabra(item.palabra, item.pista, item.id, item.cantidadLetras)
                    baseDeDatosPalabras.push(palabra)
                })      
               
                let numeroAleatorio = Math.floor(Math.random() * baseDeDatosPalabras.length)

                palabraElegida = baseDeDatosPalabras[numeroAleatorio]
            
                for (let i = 0; i < palabraElegida.cantidadLetras; i++) {
                    coincidencias.push("*")
                }  
            
                Toastify({
                    text: `La palabra a adivinar tiene ${palabraElegida.cantidadLetras} letras`,
                    className: "info",     
                    duration: 10000,               
                    style: {
                        background: "linear-gradient(to right, #00b09b, #96c93d)",
                    }
                }).showToast()
            
                mostrarElemento("divAhorcado")
            
                revisarIntentos()
                renderizarLetrasDisponibles()

            })
            .catch(error => {
                Swal.fire(
                    `Ah ocurrido un error!!!!`,
                    `Descripción del error: ${error}` ,
                    'error'
                    )
            }
            )

    }

}

function ocultarElemento(elemento) {
    document.getElementById(elemento).style.display = 'none'
}

function mostrarElemento(elemento) {
    document.getElementById(elemento).style.display = 'flex'
}

function buscarLetra(letra){
    let letraEncontrada = false
    for (let i = 0; i < palabraElegida.cantidadLetras; i++) {
        if (palabraElegida.palabra[i] === letra) {
            coincidencias[i] = letra
            letraEncontrada = true
        }
    }
    return letraEncontrada
}

function buscarPalabra(palabra){
    let palabraEncontrada = true
    if(palabra.length == palabraElegida.cantidadLetras){
        for (let i = 0; i < palabra.length; i++) {
            if (palabraElegida.palabra[i] !== palabra[i]) {
                palabraEncontrada = false
            }
        }
    }else{
        palabraEncontrada = false
    }
    return palabraEncontrada
}

function intentarPalabra(){    
    palabra = document.getElementById("txtPalabra").value
    let existePalabra = buscarPalabra(palabra)
    ocultarElemento("divNuevoJuego") 
    if(existePalabra){
        Swal.fire(
            `Ganaste!!!! La palabra es ${palabra}!!!`,
            'Revisa si entraste en el ranking!',
            'success'
            )  
        let juego = new Ranking(palabraElegida.palabra, intentos, usuario)
        actualizarRanking(juego) 
        renderizarRanking() 
    }else{   
        Swal.fire(
            `Perdiste!!!!`,
            'No adivinaste la palabra!',
            'error'
            )
    }     
}

function solicitarPista(){  
    Swal.fire({
        title: 'Al solicitar una pista perderas 2 chances, seguro?',
        showCancelButton: true,
        confirmButtonText: 'Si! El que tenga miedo a morir que no nazca',
        cancelButtonText: 'No, siempre no',
      }).then((result) => {
        if (result.isConfirmed) {
            intentos = intentos + 2  
            Swal.fire(
                `La pista es: ${palabraElegida.pista}`
                )        
            revisarIntentos()
            renderizarLetrasDisponibles()
        } 
      })
}

function revisarSiGano(){
    for (let i = 0; i < palabraElegida.cantidadLetras; i++) {
        if (palabraElegida.palabra[i] !== coincidencias[i]) {
            return false
        }
    }
    return true
}

function renderizarLetrasDisponibles(){
    let divBotonera = document.getElementById("divBotonera")
    divBotonera.innerHTML = ""   
    for (let i = 0; i < abecedario.length; i++) {
        let letra = document.createElement("button")
        letra.className = "btn btn-warning m-3 btn-lg"
        letra.innerHTML = `${abecedario[i]}`
        letra.setAttribute("onclick", `intentarLetra('${abecedario[i]}')`)
        const usada = letrasIngresadas.find((element) => element === abecedario[i])
        if (usada) {
            letra.disabled = true
        }
        divBotonera.appendChild(letra)
    }
}

function revisarIntentos(){
    document.getElementById("divCoincidencias").innerHTML = coincidencias.join("")    
    document.getElementById("divCantidadIntentosRestantes").innerHTML = '<h2>' + (chances - intentos) + '</h2>'   
    if(intentos == chances){    
        ocultarElemento("divNuevoJuego")
        renderizarRanking()    
        Swal.fire(
            `Perdiste!!!!`,
            'No adivinaste la palabra!',
            'error'
            )
    }else{
        if((chances - intentos) > 2){
            mostrarElemento("btnSolicitarPista")
        }else{
            ocultarElemento("btnSolicitarPista")
        }
    }
}

function intentarLetra(letra){    
    letrasIngresadas.push(letra)
    let existeLetra = buscarLetra(letra)
    document.getElementById("divCoincidencias").innerHTML = coincidencias.join("")
    if(existeLetra){
        let gano = revisarSiGano()
        if(gano){
            ocultarElemento("divNuevoJuego")
            Swal.fire(
                `Ganaste!!!! La palabra es ${coincidencias.join("")}!!!`,
                'Revisa si entraste en el ranking!',
                'success'
                )      
            let juego = new Ranking(palabraElegida.palabra, intentos, usuario)
            actualizarRanking(juego) 
            renderizarRanking()       
        }else{
            revisarIntentos()
            renderizarLetrasDisponibles()
        }
    }else{ 
        intentos++           
        revisarIntentos()
        renderizarLetrasDisponibles()
    } 
}

function actualizarRanking(juego){
    let storageRanking = localStorage.getItem("storageRanking") ? JSON.parse(localStorage.getItem("storageRanking")) : []
    juego.id = storageRanking.length + 1
    storageRanking.push(juego)

    storageRanking.sort((a, b) => {
        if (a.id < b.id) return -1;
        if (a.id > b.id) return 1;
      
        if (a.intentos > b.intentos) return 1;
        if (a.intentos < b.intentos) return -1;
      
        return 0;
      });

    let contador = 1
    for(let index=0; index<storageRanking.length; index++){
        storageRanking[index].puesto = contador;
        contador++;        
    }

    localStorage.setItem("storageRanking", JSON.stringify(storageRanking))
}

function renderizarRanking(){
    let storageRanking = localStorage.getItem("storageRanking") ? JSON.parse(localStorage.getItem("storageRanking")) : []
    let contenedorRanking = document.getElementById("tBodyRanking")

    contenedorRanking.innerHTML = ""        
    storageRanking.sort((a, b) => {
        if (a.id < b.id) return -1;
        if (a.id > b.id) return 1;
      
        if (a.intentos > b.intentos) return 1;
        if (a.intentos < b.intentos) return -1;
      
        return 0;
      });
    
    storageRanking.forEach(({ puesto, usuario, intentos, palabra }) => {
        let jugador = document.createElement("tr")
        jugador.className = ""
        jugador.innerHTML = `
        <th scope='row'>${puesto}</th>
        <td>${usuario}</td>
        <td>${intentos}</td>
        <td>${palabra}</td>            
        `
        contenedorRanking.appendChild(jugador)
    })

}

function rankingBusqueda(){
    let busqueda = document.getElementById("txtRankingBusqueda").value
    let storageRanking = localStorage.getItem("storageRanking") ? JSON.parse(localStorage.getItem("storageRanking")) : []
    let contenedorRanking = document.getElementById("tBodyRanking")

    contenedorRanking.innerHTML = ""  

    const resultado = storageRanking.filter((w) => w.palabra == busqueda || w.usuario == busqueda || w.intentos == busqueda || busqueda  === "")

    resultado.sort((a, b) => {
        if (a.id < b.id) return -1;
        if (a.id > b.id) return 1;
      
        if (a.intentos > b.intentos) return 1;
        if (a.intentos < b.intentos) return -1;
      
        return 0;
      });
    
    resultado.forEach(({ puesto, usuario, intentos, palabra }) => {
        let jugador = document.createElement("tr")
        jugador.className = ""
        jugador.innerHTML = `
        <th scope='row'>${puesto}</th>
        <td>${usuario}</td>
        <td>${intentos}</td>
        <td>${palabra}</td>            
        `
        contenedorRanking.appendChild(jugador)
    })

}

function ordenarTablaRanking(columna) {
    let storageRanking = localStorage.getItem("storageRanking") ? JSON.parse(localStorage.getItem("storageRanking")) : []
    let contenedorRanking = document.getElementById("tBodyRanking")

    contenedorRanking.innerHTML = ""      
    
    switch(columna){
        case 0:
            storageRanking.sort(function (a, b) {
                if (a.puesto > b.puesto) {
                return 1
                }
                if (a.puesto < b.puesto) {
                return -1
                }
                return 0
            })
            break
        case 1:
            storageRanking.sort(function (a, b) {
                if (a.usuario > b.usuario) {
                return 1
                }
                if (a.usuario < b.usuario) {
                return -1
                }
                return 0
            })
            break
        case 2:
            storageRanking.sort(function (a, b) {
                if (a.intentos > b.intentos) {
                return 1
                }
                if (a.intentos < b.intentos) {
                return -1
                }
                return 0
            })
            break
        case 3:
            storageRanking.sort(function (a, b) {
                if (a.palabra > b.palabra) {
                return 1
                }
                if (a.palabra < b.palabra) {
                return -1
                }
                return 0
            })
            break
        default:
            break
    }
    
    storageRanking.forEach(({ puesto, usuario, intentos, palabra }) => {
        let jugador = document.createElement("tr")
        jugador.className = ""
        jugador.innerHTML = `
        <th scope='row'>${puesto}</th>
        <td>${usuario}</td>
        <td>${intentos}</td>
        <td>${palabra}</td>            
        `
        contenedorRanking.appendChild(jugador)
    })

    localStorage.setItem("storageRanking", JSON.stringify(storageRanking))
}