package com.uade.tpo.ecommerce.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.uade.tpo.ecommerce.model.Producto;
import com.uade.tpo.ecommerce.model.Usuario;
import com.uade.tpo.ecommerce.model.Categoria;
import com.uade.tpo.ecommerce.repository.ProductoRepository;
import com.uade.tpo.ecommerce.repository.CategoriaRepository;
import com.uade.tpo.ecommerce.exception.*;

import jakarta.transaction.Transactional;

import com.uade.tpo.ecommerce.dto.DeleteResponse;
import com.uade.tpo.ecommerce.dto.ProductoDTO;

@Service
@Transactional
public class ProductoService {

	@Autowired
	private ProductoRepository productoRepository;

	@Autowired
	private CategoriaRepository categoriaRepository;

	// Método auxiliar para validar que el usuario es el propietario del producto
	private void validarPropietarioProducto(Producto producto, Long usuarioId) {
		if (producto.getUsuario() == null || !producto.getUsuario().getId().equals(usuarioId)) {
			throw new UnAuthorizedException("No tienes permiso para modificar este producto. Solo el creador puede hacerlo.");
		}
	}

	public ProductoDTO toDto(Producto producto) {
		if (producto == null) return null;
		List<Long> categoriaIds = null;
		List<String> categoriaNombres = null;
		if (producto.getCategorias() != null) {
			categoriaIds = producto.getCategorias().stream().map(c -> c.getId()).collect(Collectors.toList());
			categoriaNombres = producto.getCategorias().stream().map(c -> c.getNombre()).collect(Collectors.toList());
		}
		String imagen = (producto.getImagenes() != null && !producto.getImagenes().isEmpty()) ? producto.getImagenes().get(0) : "";
		String categoria = (categoriaNombres != null && !categoriaNombres.isEmpty()) ? String.join(", ", categoriaNombres) : "";
		return ProductoDTO.builder()
				.id(producto.getId())
				.nombre(producto.getNombre())
				.precio(producto.getPrecio())
				.descripcion(producto.getDescripcion())
				.stock(producto.getStock())
				.imagenes(producto.getImagenes())
				.categoriaIds(categoriaIds)
				.categoriaNombres(categoriaNombres)
				.usuarioId(producto.getUsuario() != null ? producto.getUsuario().getId() : null)
				.imagen(imagen)
				.categoria(categoria)
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

		// Mapear IDs de categorías transitorios del Frontend a entidades Categoria reales
		if (producto.getCategoriaIds() != null && !producto.getCategoriaIds().isEmpty()) {
			List<Categoria> cats = categoriaRepository.findAllById(producto.getCategoriaIds());
			producto.setCategorias(cats);
		}
		// Mapear imagen única del Frontend a la lista de imagenes
		if (producto.getImagen() != null && !producto.getImagen().isEmpty()) {
			producto.setImagenes(List.of(producto.getImagen()));
		}

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

		// Mapear IDs de categorías transitorios del Frontend a entidades Categoria reales
		if (producto.getCategoriaIds() != null && !producto.getCategoriaIds().isEmpty()) {
			List<Categoria> cats = categoriaRepository.findAllById(producto.getCategoriaIds());
			existingProducto.setCategorias(cats);
		} else if (producto.getCategorias() != null) {
			existingProducto.setCategorias(producto.getCategorias());
		}

		// Mapear imagen única del Frontend a la lista de imagenes
		if (producto.getImagen() != null && !producto.getImagen().isEmpty()) {
			existingProducto.setImagenes(List.of(producto.getImagen()));
		} else if (producto.getImagenes() != null) {
			existingProducto.setImagenes(producto.getImagenes());
		}

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