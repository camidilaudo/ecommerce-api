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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.uade.tpo.ecommerce.dto.DeleteResponse;
import com.uade.tpo.ecommerce.dto.ProductoDTO;

@Service
@Transactional
public class ProductoService {

	@Autowired
	private ProductoRepository productoRepository;

	@Autowired
	private CategoriaRepository categoriaRepository;

	@Autowired
	private com.uade.tpo.ecommerce.repository.CarritoItemRepository carritoItemRepository;

	@Autowired
	private com.uade.tpo.ecommerce.repository.PedidoItemRepository pedidoItemRepository;

	@Autowired
	private com.uade.tpo.ecommerce.repository.UsuarioRepository usuarioRepository;

	// Método auxiliar para validar que el usuario es el propietario del producto
	private void validarPropietarioProducto(Producto producto, Long usuarioId) {
		Usuario usuario = usuarioRepository.findById(usuarioId)
			.orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

		if (usuario.getRole() == com.uade.tpo.ecommerce.model.enums.Role.ADMIN) {
			return; // Administrador tiene privilegios totales
		}

		if (producto.getUsuario() == null || !producto.getUsuario().getId().equals(usuarioId)) {
			throw new UnAuthorizedException("No tienes permiso para modificar este producto. Solo el creador o un administrador pueden hacerlo.");
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
		List<Producto> productos = productoRepository.findByActivoTrueOrderByNombreAsc();
		return productos.stream().map(this::toDto).collect(Collectors.toList());
	}

	public Page<ProductoDTO> getAllProductosPaginated(int page, int size, String sortBy, String direction) {
		Sort sort = Sort.by(direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
		Pageable pageable = PageRequest.of(page, size, sort);
		Page<Producto> productPage = productoRepository.findByActivoTrue(pageable);
		return productPage.map(this::toDto);
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

		// Clean up from active shopping carts (since the product is deactivated)
		carritoItemRepository.deleteByProductoId(id);

		// Perform Soft Delete (Logical deletion)
		producto.setActivo(false);
		productoRepository.save(producto);

		return DeleteResponse.builder()
			.mensaje("Producto eliminado exitosamente")
			.build();
	}

	// CREATE productos
	public ProductoDTO saveProducto(Producto producto, Usuario usuario) {
		// Asegurarse de que el usuario esté gestionado en la sesión de Hibernate actual para evitar problemas de entidades detached
		Usuario managedUsuario = usuarioRepository.findById(usuario.getId())
			.orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
		producto.setUsuario(managedUsuario);

		// Si el estado activo viene nulo (porque el frontend no lo manda en el JSON), lo seteamos por defecto a true
		if (producto.getActivo() == null) {
			producto.setActivo(true);
		}

		// Mapear IDs de categorías transitorios del Frontend a entidades Categoria reales
		if (producto.getCategoriaIds() != null && !producto.getCategoriaIds().isEmpty()) {
			List<Categoria> cats = categoriaRepository.findAllById(producto.getCategoriaIds());
			producto.setCategorias(cats);
		}
		// Mapear imagen única del Frontend a la lista de imagenes
		if (producto.getImagen() != null && !producto.getImagen().isEmpty()) {
			producto.setImagenes(new java.util.ArrayList<>(java.util.List.of(producto.getImagen())));
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

		// Mapear IDs de categorías de forma segura para Hibernate (clear + addAll)
		if (existingProducto.getCategorias() == null) {
			existingProducto.setCategorias(new java.util.ArrayList<>());
		}
		existingProducto.getCategorias().clear();
		if (producto.getCategoriaIds() != null && !producto.getCategoriaIds().isEmpty()) {
			List<Categoria> cats = categoriaRepository.findAllById(producto.getCategoriaIds());
			existingProducto.getCategorias().addAll(cats);
		} else if (producto.getCategorias() != null) {
			existingProducto.getCategorias().addAll(producto.getCategorias());
		}

		// Mapear imágenes de forma segura para Hibernate (clear + addAll)
		if (existingProducto.getImagenes() == null) {
			existingProducto.setImagenes(new java.util.ArrayList<>());
		}
		existingProducto.getImagenes().clear();
		if (producto.getImagen() != null && !producto.getImagen().isEmpty()) {
			existingProducto.getImagenes().add(producto.getImagen());
		} else if (producto.getImagenes() != null) {
			existingProducto.getImagenes().addAll(producto.getImagenes());
		}

		Producto saved = productoRepository.save(existingProducto);
		return toDto(saved);
	}

	public List<ProductoDTO> getByCategoria(Long categoriaId) {
		List<Producto> productos = productoRepository.findByActivoTrueAndCategoriasId(categoriaId);
		return productos.stream().map(this::toDto).collect(Collectors.toList());
	}

	public List<ProductoDTO> buscarPorNombre(String nombre) {
		List<Producto> productos = productoRepository.findByActivoTrueAndNombreContaining(nombre);
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

	public void descontarStock(Long id, int cantidad) {
		Producto producto = productoRepository.findById(id)
			.orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

		if (producto.getStock() < cantidad) {
			throw new BadRequestException("Stock insuficiente para el producto: " + producto.getNombre());
		}
		producto.setStock(producto.getStock() - cantidad);
		productoRepository.save(producto);
	}

}