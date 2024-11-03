document.addEventListener('DOMContentLoaded', function() {
    obtenerOfertasPorRating();
    obtenerOfertasPorMetacritic();
    document.getElementById('boton-buscar').addEventListener('click', buscarJuegos);
});

function obtenerOfertasPorRating() {
    // Usando fetch con .then
    fetch('https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=50&sortBy=DealRating&pageSize=5')
        .then(function(respuesta) {
            return respuesta.json();
        })
        .then(function(datos) {
            mostrarOfertas(datos, 'ofertas-rating');
        })
        .catch(function(error) {
            console.error('Error al obtener ofertas por rating:', error);
        });
}

async function obtenerOfertasPorMetacritic() {
    // Usando fetch con async/await
    try {
        let respuesta = await fetch('https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=50&sortBy=Metacritic&pageSize=5');
        let datos = await respuesta.json();
        mostrarOfertas(datos, 'ofertas-metacritic');
    } catch (error) {
        console.error('Error al obtener ofertas por Metacritic:', error);
    }
}

function mostrarOfertas(ofertas, elementoID) {
    let contenedor = document.getElementById(elementoID);
    contenedor.innerHTML = '';
    ofertas.forEach(function(oferta) {
        let divOferta = document.createElement('div');
        divOferta.className = 'oferta';
        let titulo = document.createElement('h3');
        titulo.textContent = oferta.title;
        let imagen = document.createElement('img');
        imagen.src = oferta.thumb;
        let precio = document.createElement('p');
        precio.textContent = 'Precio: $' + oferta.salePrice;
        let precioOriginal = document.createElement('p');
        precioOriginal.textContent = 'Precio Original: $' + oferta.normalPrice;
        let ahorro = document.createElement('p');
        ahorro.textContent = 'Ahorro: ' + Math.round(oferta.savings) + '%';
        let metacritic = document.createElement('p');
        metacritic.textContent = 'Metacritic: ' + (oferta.metacriticScore || 'N/A');
        let dealRating = document.createElement('p');
        dealRating.textContent = 'Rating de la Oferta: ' + oferta.dealRating;
        let enlace = document.createElement('a');
        enlace.href = 'https://www.cheapshark.com/redirect?dealID=' + oferta.dealID;
        enlace.target = '_blank';
        enlace.textContent = 'Ver Oferta';
        divOferta.appendChild(imagen);
        divOferta.appendChild(titulo);
        divOferta.appendChild(precio);
        divOferta.appendChild(precioOriginal);
        divOferta.appendChild(ahorro);
        divOferta.appendChild(metacritic);
        divOferta.appendChild(dealRating);
        divOferta.appendChild(enlace);
        contenedor.appendChild(divOferta);
    });
}

function buscarJuegos() {
    let terminoBusqueda = document.getElementById('buscador').value;
    if (terminoBusqueda) {
        obtenerResultadosBusqueda(terminoBusqueda);
    }
}

function obtenerResultadosBusqueda(termino) {
    // Usando axios
    axios.get('https://www.cheapshark.com/api/1.0/games', {
        params: {
            title: termino,
            limit: 5
        }
    })
    .then(function(respuesta) {
        mostrarOfertasBusqueda(respuesta.data);
    })
    .catch(function(error) {
        console.error('Error al buscar juegos:', error);
    });
}

function mostrarOfertasBusqueda(juegos) {
    let contenedor = document.getElementById('resultados-busqueda');
    contenedor.innerHTML = '';
    juegos.forEach(function(juego) {
        obtenerDetallesJuego(juego.gameID);
    });
}

function obtenerDetallesJuego(gameID) {
    // Usando XMLHttpRequest
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `https://www.cheapshark.com/api/1.0/games?id=${gameID}`);
    xhr.onload = function() {
        if (xhr.status === 200) {
            let datos = JSON.parse(xhr.responseText);
            let ofertas = datos.deals;
            let mejorOferta = ofertas.reduce(function(prev, current) {
                return (parseFloat(prev.price) < parseFloat(current.price)) ? prev : current;
            });
            mostrarOfertaBusqueda(datos.info, mejorOferta);
        } else {
            console.error('Error al obtener detalles del juego');
        }
    };
    xhr.send();
}

function mostrarOfertaBusqueda(infoJuego, oferta) {
    let contenedor = document.getElementById('resultados-busqueda');
    let divOferta = document.createElement('div');
    divOferta.className = 'oferta';
    let titulo = document.createElement('h3');
    titulo.textContent = infoJuego.title;
    let imagen = document.createElement('img');
    imagen.src = infoJuego.thumb;
    let precio = document.createElement('p');
    precio.textContent = 'Precio: $' + oferta.price;
    let precioOriginal = document.createElement('p');
    precioOriginal.textContent = 'Precio Original: $' + oferta.retailPrice;
    let ahorro = document.createElement('p');
    ahorro.textContent = 'Ahorro: ' + Math.round(oferta.savings) + '%';
    let metacritic = document.createElement('p');
    metacritic.textContent = 'Metacritic: ' + (infoJuego.metacriticScore || 'N/A');
    let dealRating = document.createElement('p');
    dealRating.textContent = 'Rating de la Oferta: ' + (oferta.dealRating || 'N/A');
    let enlace = document.createElement('a');
    enlace.href = 'https://www.cheapshark.com/redirect?dealID=' + oferta.dealID;
    enlace.target = '_blank';
    enlace.textContent = 'Ver Oferta';
    divOferta.appendChild(imagen);
    divOferta.appendChild(titulo);
    divOferta.appendChild(precio);
    divOferta.appendChild(precioOriginal);
    divOferta.appendChild(ahorro);
    divOferta.appendChild(metacritic);
    divOferta.appendChild(dealRating);
    divOferta.appendChild(enlace);
    contenedor.appendChild(divOferta);
}