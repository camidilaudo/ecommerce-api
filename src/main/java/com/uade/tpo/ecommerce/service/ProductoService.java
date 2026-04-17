package com.uade.tpo.ecommerce.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uade.tpo.ecommerce.model.Producto;
import com.uade.tpo.ecommerce.model.Usuario;
import com.uade.tpo.ecommerce.repository.ProductoRepository;
import com.uade.tpo.ecommerce.repository.UsuarioRepository;

import jakarta.transaction.Transactional;
import com.uade.tpo.ecommerce.exception.*;

@Service
@Transactional
public class ProductoService {

        @Autowired
        private ProductoRepository productoRepository;

        @Autowired
        private UsuarioRepository usuarioRepository;

        // Método auxiliar para validar que el usuario es el propietario del producto
        private void validarPropietarioProducto(Producto producto, Long usuarioId) {
                if (producto.getUsuario() == null || !producto.getUsuario().getId().equals(usuarioId)) {
                        throw new UnAuthorizedException("No tienes permiso para modificar este producto. Solo el creador puede hacerlo.");
                }
        }

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

        // DELETE producto (Solo el propietario o ADMIN)
        public void deleteProductoById(Long id, Long usuarioId) {
                Producto producto = getProductoById(id);
                if (producto == null) {
                        throw new ResourceNotFoundException("Producto no encontrado");
                }
                validarPropietarioProducto(producto, usuarioId);
                productoRepository.deleteById(id);
        }

        // CREATE producto
        public Producto saveProducto(
                        Producto producto, 
                        Usuario usuario) {

                producto.setUsuario(usuario);
                return productoRepository
                                .save(producto);

        }

        // UPDATE producto (Solo el propietario o ADMIN)
        public Producto updateProducto(
                        Long id,
                        Producto producto,
                        Long usuarioId) {

                Producto existingProducto = getProductoById(id);

                if (existingProducto != null) {
                        validarPropietarioProducto(existingProducto, usuarioId);

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

                return productoRepository.findByNombreContaining(nombre);
                        }

        // UPDATE stock del producto (Solo el propietario o ADMIN)
        public Producto updateStockProducto(Long id, Integer stock, Long usuarioId) {
                Producto existingProducto = getProductoById(id);

                if (existingProducto == null) {
                        throw new ResourceNotFoundException("No existe el producto");
                }
                
                validarPropietarioProducto(existingProducto, usuarioId);
                
                if (stock < 0) {
                        throw new BadRequestException("El stock no puede ser negativo");
                }
                existingProducto.setStock(stock);
                return productoRepository.save(existingProducto);
        }

}