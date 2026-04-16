package com.uade.tpo.ecommerce.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uade.tpo.ecommerce.model.Producto;
import com.uade.tpo.ecommerce.repository.ProductoRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    // GET todos los productos (ordenados alfabéticamente)
    public List<Producto> getAllProductos() {
        return productoRepository.findAllByOrderByNombreAsc();
    }

    // GET producto por ID
    public Producto getProductoById(Long id) {

        return productoRepository
                .findById(id)
                .orElse(null);

    }

    // DELETE producto
    public void deleteProductoById(Long id) {

        productoRepository.deleteById(id);

    }

    // CREATE producto
    public Producto saveProducto(
            Producto producto) {

        return productoRepository
                .save(producto);

    }

    // UPDATE producto
    public Producto updateProducto(
            Long id,
            Producto producto) {

        Producto existingProducto =
                getProductoById(id);

        if (existingProducto != null) {

            existingProducto
                    .setNombre(producto.getNombre());

            existingProducto
                    .setDescripcion(
                            producto.getDescripcion());

            existingProducto
                    .setPrecio(producto.getPrecio());

            existingProducto
                    .setStock(producto.getStock());

            existingProducto
                    .setImagenes(
                            producto.getImagenes());

            existingProducto
                    .setCategorias(
                            producto.getCategorias());

            return productoRepository
                    .save(existingProducto);
        }

        return null;
    }

    // 🧩 NUEVO — buscar por categoria
        public List<Producto> getByCategoria(
                Long categoriaId) {

        return productoRepository
                .findByCategoriasId(categoriaId);

        }

    // 🧩 NUEVO — buscar por nombre
    public List<Producto> buscarPorNombre(
            String nombre) {

        return productoRepository
                .findByNombreContaining(nombre);

    }

}