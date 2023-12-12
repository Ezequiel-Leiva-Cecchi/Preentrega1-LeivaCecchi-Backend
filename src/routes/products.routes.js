import express from "express";
import fs from "fs";

const productsFilePath = "./src/data/productos.json";
const productsRouter = express.Router();

// Obtener todos los productos
productsRouter.get('/', (req, res) => {
    try {
        // Lee el archivo JSON que contiene la información de los productos
        const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

        // Envía la lista de productos en la respuesta
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        // Maneja errores y devuelve un mensaje de error en la respuesta
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

// Obtener un producto por ID
productsRouter.get('/:pid', (req, res) => {
    try {
        const { pid } = req.params;

        // Lee el archivo JSON que contiene la información de los productos
        const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

        // Busca el producto con el ID proporcionado
        const product = products.find(product => product.id === pid);

        // Si no se encuentra el producto, devuelve un mensaje de error
        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado." });
        }

        // Envía el producto encontrado en la respuesta
        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

// Agregar un nuevo producto
productsRouter.post('/', (req, res) => {
    try {
        // Extrae datos del cuerpo de la solicitud
        const { title, description, code, price, status, stock, category } = req.body;

        // Validaciones de tipo
        if (typeof price !== 'number' || typeof status !== 'boolean' || typeof stock !== 'number') {
            return res.status(400).json({ error: "El precio debe ser un número, el estado debe ser un booleano y el stock debe ser un número." });
        }

        // Validaciones de campos no vacíos o solo espacios en blanco
        if (![title, description, code, category].every(field => typeof field === 'string' && field.trim() !== '')) {
            return res.status(400).json({ error: "Los campos 'title', 'description', 'code' y 'category' son obligatorios y no pueden estar vacíos." });
        }

        // Lee el archivo JSON que contiene la información de los productos
        const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

        // Genera un nuevo ID (puedes utilizar una lógica específica aquí)
        const newProductId = Date.now().toString();

        // Crea un nuevo objeto de producto con los datos proporcionados
        const newProduct = {
            id: newProductId,
            title,
            description,
            code,
            price,
            status: status || true,
            stock,
            category,
        };

        // Agrega el nuevo producto al array de productos
        products.push(newProduct);

        // Actualiza el archivo JSON con la nueva lista de productos
        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));

        // Envía una respuesta con un mensaje de éxito y el nuevo producto
        res.status(201).json({ message: "Producto agregado correctamente.", product: newProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

// Actualizar un producto por ID
productsRouter.put('/:pid', (req, res) => {
    try {
        const { pid } = req.params;
        const updatedProductData = req.body;

        // Lee el archivo JSON que contiene la información de los productos
        const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

        // Encuentra el índice del producto que se actualizará
        const productIndex = products.findIndex(product => product.id === pid);

        // Si el producto no se encuentra, devuelve un mensaje de error
        if (productIndex === -1) {
            return res.status(404).json({ error: "Producto no encontrado." });
        }

        // Validación de campos no vacíos o solo espacios en blanco
        for (const key in updatedProductData) {
            if (updatedProductData.hasOwnProperty(key) && typeof updatedProductData[key] === 'string' && updatedProductData[key].trim() === '') {
                return res.status(400).json({ error: `El campo ${key} no puede estar vacío.` });
            }
        }

        // No actualiza el ID y asigna los nuevos datos al producto existente
        updatedProductData.id = pid;
        Object.assign(products[productIndex], updatedProductData);

        // Actualiza el archivo JSON con la nueva lista de productos
        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));

        // Envía una respuesta con un mensaje de éxito y el producto actualizado
        res.status(200).json({ message: "Producto actualizado correctamente.", product: updatedProductData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

// Eliminar un producto por ID
productsRouter.delete('/:pid', (req, res) => {
    try {
        const { pid } = req.params;

        // Lee el archivo JSON que contiene la información de los productos
        const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

        // Filtra los productos para excluir el que se eliminará
        const updatedProducts = products.filter(product => product.id !== pid);

        // Si no se eliminó ningún producto, devuelve un mensaje de error
        if (products.length === updatedProducts.length) {
            return res.status(404).json({ error: "Producto no encontrado." });
        }

        // Actualiza el archivo JSON con la nueva lista de productos sin el producto eliminado
        fs.writeFileSync(productsFilePath, JSON.stringify(updatedProducts, null, 2));

        // Envía una respuesta con un mensaje de éxito
        res.status(200).json({ message: "Producto eliminado correctamente." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

export default productsRouter;
