package com.uade.tpo.ecommerce.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uade.tpo.ecommerce.model.Producto;
import com.uade.tpo.ecommerce.model.Usuario;
import com.uade.tpo.ecommerce.repository.ProductoRepository;
import com.uade.tpo.ecommerce.exception.*;

import jakarta.transaction.Transactional;

import com.uade.tpo.ecommerce.dto.DeleteResponse;
import com.uade.tpo.ecommerce.dto.ProductoDTO;

@Service
@Transactional
public class ProductoService {

	@Autowired
	private ProductoRepository productoRepository;

	// Método auxiliar para validar que el usuario es el propietario del producto
	private void validarPropietarioProducto(Producto producto, Long usuarioId) {
		if (producto.getUsuario() == null || !producto.getUsuario().getId().equals(usuarioId)) {
			throw new UnAuthorizedException("No tienes permiso para modificar este producto. Solo el creador puede hacerlo.");
		}
	}

	private ProductoDTO toDto(Producto producto) {
		if (producto == null) return null;
		List<Long> categoriaIds = null;
		if (producto.getCategorias() != null) {
			categoriaIds = producto.getCategorias().stream().map(c -> c.getId()).collect(Collectors.toList());
		}
		return ProductoDTO.builder()
				.id(producto.getId())
				.nombre(producto.getNombre())
				.precio(producto.getPrecio())
				.descripcion(producto.getDescripcion())
				.stock(producto.getStock())
				.imagenes(producto.getImagenes())
				.categoriaIds(categoriaIds)
				.usuarioId(producto.getUsuario() != null ? producto.getUsuario().getId() : null)
				.build();
	}

	public List<ProductoDTO> getAllProductos() {
		List<Producto> productos = productoRepository.findAllByOrderByNombreAsc();
		return productos.stream().map(this::toDto).collect(Collectors.toList());
	}

	public ProductoDTO getProductoById(Long id) {
		Producto producto = productoRepository
			.findById(id)
			.orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
		return toDto(producto);
	}

	public DeleteResponse deleteProductoById(Long id, Long usuarioId) {
		Producto producto = productoRepository
			.findById(id)
			.orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
		validarPropietarioProducto(producto, usuarioId);
		productoRepository.deleteById(id);
		return DeleteResponse.builder()
			.mensaje("Producto eliminado exitosamente")
			.build();
	}

	// CREATE productos
	public ProductoDTO saveProducto(Producto producto, Usuario usuario) {
		producto.setUsuario(usuario);
		Producto saved = productoRepository.save(producto);
		return toDto(saved);
	}

	// UPDATE producto (Solo el propietario o ADMIN)
	public ProductoDTO updateProducto(Long id, Producto producto, Long usuarioId) {
		Producto existingProducto = productoRepository
			.findById(id)
			.orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
		validarPropietarioProducto(existingProducto, usuarioId);

		existingProducto.setNombre(producto.getNombre());
		existingProducto.setDescripcion(producto.getDescripcion());
		existingProducto.setPrecio(producto.getPrecio());
		existingProducto.setStock(producto.getStock());
		existingProducto.setImagenes(producto.getImagenes());
		existingProducto.setCategorias(producto.getCategorias());

		Producto saved = productoRepository.save(existingProducto);
		return toDto(saved);
	}

	public List<ProductoDTO> getByCategoria(Long categoriaId) {
		List<Producto> productos = productoRepository.findByCategoriasId(categoriaId);
		return productos.stream().map(this::toDto).collect(Collectors.toList());
	}

	public List<ProductoDTO> buscarPorNombre(String nombre) {
		List<Producto> productos = productoRepository.findByNombreContaining(nombre);
		return productos.stream().map(this::toDto).collect(Collectors.toList());
	}

	public ProductoDTO updateStockProducto(Long id, Integer stock, Long usuarioId) {
		Producto existingProducto = productoRepository.findById(id)
			.orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

		validarPropietarioProducto(existingProducto, usuarioId);

		if (stock < 0) {
			throw new BadRequestException("El stock no puede ser negativo");
		}
		existingProducto.setStock(stock);
		Producto saved = productoRepository.save(existingProducto);
		return toDto(saved);
	}

}