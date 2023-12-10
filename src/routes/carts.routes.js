import express from "express";
import fs from "fs";

const cartsFilePath = "./src/data/carrito.json";
const cartsRouter = express.Router();

// Crear un nuevo carrito
cartsRouter.post('/', (req, res) => {
    try {
        const { id, products } = req.body;

        // Verificar si ya existe un carrito con el mismo id
        const carts = JSON.parse(fs.readFileSync(cartsFilePath, 'utf-8'));
        const existingCart = carts.find(cart => cart.id === id);

        if (existingCart) {
            return res.status(400).json({ error: "Ya existe un carrito con este id." });
        }

        // Agregar el nuevo carrito al arreglo de carritos
        carts.push({ id, products: [] });
        fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));

        res.status(201).json({ message: "Nuevo carrito creado con éxito." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

// Obtener productos de un carrito por ID
cartsRouter.get('/:cid', (req, res) => {
    try {
        const { cid } = req.params;

        // Obtener la información del carrito con el id proporcionado
        const carts = JSON.parse(fs.readFileSync(cartsFilePath, 'utf-8'));
        const cart = carts.find(cart => cart.id === cid);

        if (!cart) {
            return res.status(404).json({ error: "Carrito no encontrado." });
        }

        // Enviar los productos del carrito en la respuesta
        res.status(200).json(cart.products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

// Agregar un producto a un carrito por ID de carrito y ID de producto
cartsRouter.post('/:cid/product/:pid', (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        // Obtener la información del carrito con el id proporcionado
        const carts = JSON.parse(fs.readFileSync(cartsFilePath, 'utf-8'));
        const cart = carts.find(cart => cart.id === cid);

        if (!cart) {
            return res.status(404).json({ error: "Carrito no encontrado." });
        }

        // Buscar el producto en el carrito
        const productIndex = cart.products.findIndex(product => product.id === pid);

        if (productIndex === -1) {
            // Si el producto no existe, agregarlo al carrito
            cart.products.push({ id: pid, quantity });
        } else {
            // Si el producto ya existe, incrementar la cantidad
            cart.products[productIndex].quantity += quantity;
        }

        // Actualizar el archivo JSON con la nueva información del carrito
        fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));

        res.status(201).json({ message: "Producto agregado al carrito con éxito." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

export default cartsRouter;
