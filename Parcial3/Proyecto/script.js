// Datos de ejemplo de productos (esto podría venir de una base de datos o API en un proyecto real)
const products = [
    { name: "Laptop", price: 500, code: "P001" },  // Precio predeterminado de Walmart
    { name: "Smartphone", price: 300, code: "P002" },
    { name: "Tablet", price: 200, code: "P003" },
    { name: "Auriculares", price: 50, code: "P004" },
];

// Referencias a los elementos del DOM
const productNameInput = document.getElementById("productName");
const searchBtn = document.getElementById("searchBtn");
const productInfo = document.getElementById("productInfo");
const productDisplayName = document.getElementById("productDisplayName");
const productPrice = document.getElementById("productPrice");
const productCode = document.getElementById("productCode");
const quantityInput = document.getElementById("quantity");
const samsPriceInput = document.getElementById("samsPrice");
const addBtn = document.getElementById("addBtn");
const productListTable = document.getElementById("productList").getElementsByTagName("tbody")[0];

// Función para buscar el producto
function searchProduct() {
    const productName = productNameInput.value.trim().toLowerCase();
    const product = products.find(p => p.name.toLowerCase().includes(productName));

    if (product) {
        productInfo.style.display = "block"; // Muestra el cuadro de información del producto
        productDisplayName.textContent = product.name;
        productPrice.textContent = product.price; // Precio de Walmart
        productCode.textContent = product.code;
    } else {
        alert("Producto no encontrado.");
        productInfo.style.display = "none";
    }
}

// Función para agregar el producto a la lista
function addProductToList() {
    const productName = productDisplayName.textContent;
    const priceWalmart = parseFloat(productPrice.textContent); // Precio de Walmart
    const code = productCode.textContent;
    const quantity = parseInt(quantityInput.value);
    const total = priceWalmart * quantity;

    const samsPrice = parseFloat(samsPriceInput.value);

    // Compara los precios entre Walmart y Sams
    let comparison = '';
    if (samsPrice) {
        if (priceWalmart < samsPrice) {
            comparison = 'Mejor precio en Walmart';
        } else if (priceWalmart > samsPrice) {
            comparison = 'Mejor precio en Sams';
        } else {
            comparison = 'Precios iguales';
        }
    } else {
        comparison = 'Precio de Sams no ingresado';
    }

    // Crear una nueva fila en la tabla
    const newRow = productListTable.insertRow();
    newRow.innerHTML = `
        <td>${productName}</td>
        <td>$${priceWalmart}</td>
        <td>${code}</td>
        <td>${quantity}</td>
        <td>$${total}</td>
        <td>$${samsPrice ? samsPrice : 'N/A'}</td>
        <td>${comparison}</td>
        <td><button class="removeBtn">Eliminar</button></td>
    `;

    // Agregar evento para eliminar el producto de la tabla
    newRow.querySelector(".removeBtn").addEventListener("click", () => {
        newRow.remove();
    });

    // Limpiar los formularios de cantidad y precio de Sams
    quantityInput.value = 1;
    samsPriceInput.value = '';
}

// Event listeners
searchBtn.addEventListener("click", searchProduct);
addBtn.addEventListener("click", addProductToList);
