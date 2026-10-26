const productosJSON = `[
  { "id": 1, "nombre": "Cheeseburger", "descripcion": "Medallón de carne, cheddar, pepinos y ketchup", "categoria": "Clásicas", "precio": 7500, "stock": 10, "imagen": "img/1.jpg" },
  { "id": 2, "nombre": "Clásica Completa", "descripcion": "Carne, lechuga, tomate y cebolla", "categoria": "Clásicas", "precio": 8200, "stock": 8, "imagen": "img/2.jpg" },
  { "id": 3, "nombre": "Cuarto de Libra", "descripcion": "Carne de 200 g, cheddar, cebolla y tomate", "categoria": "Clásicas", "precio": 9900, "stock": 0, "imagen": "img/3.jpg" },
  { "id": 4, "nombre": "Bacon BBQ", "descripcion": "Carne, panceta crocante, cheddar y salsa barbacoa", "categoria": "Especiales", "precio": 12500, "stock": 5, "imagen": "img/4.jpg" },
  { "id": 5, "nombre": "Provoleta", "descripcion": "Carne, provoleta fundida y cebolla caramelizada", "categoria": "Especiales", "precio": 13200, "stock": 4, "imagen": "img/5.jpg" },
  { "id": 6, "nombre": "Doble Cheddar", "descripcion": "Doble carne, doble cheddar, cebolla y lechuga", "categoria": "Especiales", "precio": 14000, "stock": 3, "imagen": "img/6.jpg" },
  { "id": 7, "nombre": "Combo Clásico", "descripcion": "Hamburguesa completa con papas fritas", "categoria": "Combos", "precio": 15900, "stock": 6, "imagen": "img/7.jpg" },
  { "id": 8, "nombre": "Combo Crispy", "descripcion": "Pollo crispy, coleslaw y papas fritas", "categoria": "Combos", "precio": 16500, "stock": 2, "imagen": "img/8.jpg" },
  { "id": 9, "nombre": "Combo Onion", "descripcion": "Carne, aros de cebolla, cheddar y papas fritas", "categoria": "Combos", "precio": 17800, "stock": 1, "imagen": "img/9.jpg" }
]`;

const productosArray = JSON.parse(productosJSON);

localStorage.setItem('productos', JSON.stringify(productosArray));


const productosGuardados = JSON.parse(localStorage.getItem('productos')) || [];
console.table(productosGuardados);


let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

const titleBurgerHouse = document.querySelector('.shop-header h2');
const productsContainer = document.getElementById('products-container');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const categoryRadios = document.querySelectorAll('input[name="category"]');

if (titleBurgerHouse) {
    titleBurgerHouse.style.cursor = 'pointer';

    titleBurgerHouse.addEventListener('click', () => {
        aplicarFiltrosYOrden();
    });
}

if (searchInput) {
    searchInput.addEventListener('input', () => aplicarFiltrosYOrden());
}

if (sortSelect) {
    sortSelect.addEventListener('change', () => aplicarFiltrosYOrden());
}

categoryRadios.forEach(radio => {
    radio.addEventListener('change', () => aplicarFiltrosYOrden());
});

function aplicarFiltrosYOrden() {
    let resultados = [...productosGuardados];


    const radioSeleccionado = document.querySelector('input[name="category"]:checked');
    if (radioSeleccionado) {
        const categoria = radioSeleccionado.value;
        if (categoria !== 'todas') {
            const mapaCategorias = {
                'clasicas': 'Clásicas',
                'especiales': 'Especiales',
                'combos': 'Combos'
            };
            resultados = resultados.filter(prod => prod.categoria === mapaCategorias[categoria]);
        }
    }


    if (searchInput) {
        const texto = searchInput.value.toLowerCase().trim();
        if (texto !== '') {
            resultados = resultados.filter(prod => 
                prod.nombre.toLowerCase().includes(texto) || 
                prod.descripcion.toLowerCase().includes(texto)
            );
        }
    }


    if (sortSelect) {
        const orden = sortSelect.value;
        if (orden === 'menor') {
            resultados.sort((a, b) => a.precio - b.precio);
        } else if (orden === 'mayor') {
            resultados.sort((a, b) => b.precio - a.precio);
        }
    }


    renderizarProductos(resultados);
}

function renderizarProductos(listaProductos) {
    let contenidoHTML = '';

    if (listaProductos.length === 0) {
        contenidoHTML = '<p style="grid-column: span 3; text-align: center; color: #666; padding: 20px;">No se encontraron productos.</p>';
    } else {
        listaProductos.forEach(prod => {
            const sinStock = prod.stock === 0;
            const textoBoton = sinStock ? 'Sin stock' : 'AGREGAR AL CARRITO';
            const claseBoton = sinStock ? 'btn-add btn-disabled' : 'btn-add';
            const atributoDisabled = sinStock ? 'disabled' : '';

            contenidoHTML += `
                <div class="product-card">
                    <img src="${prod.imagen}" alt="${prod.nombre}">
                    <div class="product-title">${prod.nombre}</div>
                    <div class="product-description">${prod.descripcion}</div>
                    <div class="product-price">$${prod.precio.toLocaleString()}</div>
                    <button class="${claseBoton}" data-id="${prod.id}" ${atributoDisabled}>${textoBoton}</button>
                </div>
            `;
        });
    }

    if (productsContainer) {
        productsContainer.innerHTML = contenidoHTML;


        const botonesAgregar = productsContainer.querySelectorAll('.btn-add:not(.btn-disabled)');
        botonesAgregar.forEach(boton => {
            boton.addEventListener('click', (e) => {
                const idProducto = parseInt(e.target.getAttribute('data-id'));
                agregarAlCarrito(idProducto, productosGuardados);
            });
        });
    }
}

function agregarAlCarrito(id, listaProductos) {
    const productoEncontrado = listaProductos.find(p => p.id === id);
    if (!productoEncontrado) return;

    const itemEnCarrito = carrito.find(item => item.id === id);
    if (itemEnCarrito) {
        itemEnCarrito.cantidad++;
    } else {
        carrito.push({ ...productoEncontrado, cantidad: 1 });
    }

    actualizarCarrito();
}

function actualizarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));

    const cartList = document.getElementById('cart-list');
    const cartCounter = document.getElementById('cart-counter');
    const cartTotal = document.getElementById('cart-total');

    if (!cartList) return;

    cartList.innerHTML = '';
    let totalPrecio = 0;
    let totalCantidad = 0;

    carrito.forEach(item => {
        totalPrecio += item.precio * item.cantidad;
        totalCantidad += item.cantidad;

        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        li.style.marginBottom = '8px';
        li.style.fontSize = '13px';

        li.innerHTML = `
            <span>${item.nombre} x${item.cantidad}</span>
            <span>$${(item.precio * item.cantidad).toLocaleString()}</span>
            <button class="btn-quitar" data-id="${item.id}" style="background: none; border: 1px solid var(--primary-color); color: var(--primary-color); cursor: pointer; padding: 2px 6px; border-radius: 3px; font-size: 10px;">Quitar</button>
        `;
        cartList.appendChild(li);
    });

    if (cartCounter) cartCounter.textContent = `Carrito (${totalCantidad})`;
    if (cartTotal) cartTotal.textContent = `Total: $${totalPrecio.toLocaleString()}`;

    const botonesQuitar = cartList.querySelectorAll('.btn-quitar');
    botonesQuitar.forEach(boton => {
        boton.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            quitarDelCarrito(id);
        });
    });
}

function quitarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    actualizarCarrito();
}

const emptyCartBtn = document.getElementById('empty-cart-btn');
if (emptyCartBtn) {
    emptyCartBtn.addEventListener('click', () => {
        carrito = [];
        actualizarCarrito();
    });
}
actualizarCarrito();