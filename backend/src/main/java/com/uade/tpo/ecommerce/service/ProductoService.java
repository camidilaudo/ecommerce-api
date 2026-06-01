package com.uade.tpo.ecommerce.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.uade.tpo.ecommerce.dto.DeleteResponse;
import com.uade.tpo.ecommerce.dto.ProductoDTO;
import com.uade.tpo.ecommerce.dto.ProductoRequest;
import com.uade.tpo.ecommerce.exception.BadRequestException;
import com.uade.tpo.ecommerce.exception.ResourceNotFoundException;
import com.uade.tpo.ecommerce.exception.UnAuthorizedException;
import com.uade.tpo.ecommerce.model.Categoria;
import com.uade.tpo.ecommerce.model.Producto;
import com.uade.tpo.ecommerce.model.Usuario;
import com.uade.tpo.ecommerce.repository.CarritoItemRepository;
import com.uade.tpo.ecommerce.repository.CategoriaRepository;
import com.uade.tpo.ecommerce.repository.PedidoItemRepository;
import com.uade.tpo.ecommerce.repository.ProductoRepository;
import com.uade.tpo.ecommerce.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

// DT-02 FIX: Inyección por constructor (RequiredArgsConstructor + final fields)
// BUG-02 FIX: import correcto de Spring @Transactional
@Service
@Transactional
@RequiredArgsConstructor
public class ProductoService {

	private final ProductoRepository productoRepository;
	private final CategoriaRepository categoriaRepository;
	private final CarritoItemRepository carritoItemRepository;
	private final PedidoItemRepository pedidoItemRepository;
	private final UsuarioRepository usuarioRepository;

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

		// Limpiar de los carritos activos
		carritoItemRepository.deleteByProductoId(id);

		// Soft Delete (Baja lógica)
		producto.setActivo(false);
		productoRepository.save(producto);

		return DeleteResponse.builder()
			.mensaje("Producto eliminado exitosamente")
			.build();
	}

	// DT-01 FIX: Recibe ProductoRequest DTO en lugar de la entidad Producto directamente
	public ProductoDTO saveProducto(ProductoRequest request, Usuario usuario) {
		Usuario managedUsuario = usuarioRepository.findById(usuario.getId())
			.orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

		// Mapear lista de categoriaIds a entidades Categoria
		List<Categoria> categorias = new ArrayList<>();
		if (request.getCategoriaIds() != null && !request.getCategoriaIds().isEmpty()) {
			categorias = categoriaRepository.findAllById(request.getCategoriaIds());
		}

		// Mapear imágenes
		List<String> imagenes = new ArrayList<>();
		if (request.getImagenes() != null && !request.getImagenes().isEmpty()) {
			imagenes.addAll(request.getImagenes());
		}

		Producto producto = Producto.builder()
			.nombre(request.getNombre())
			.descripcion(request.getDescripcion())
			.precio(request.getPrecio())
			.stock(request.getStock())
			.activo(true)
			.usuario(managedUsuario)
			.categorias(categorias)
			.imagenes(imagenes)
			.build();

		Producto saved = productoRepository.save(producto);
		return toDto(saved);
	}

	// DT-01 FIX: Recibe ProductoRequest DTO en lugar de la entidad Producto directamente
	public ProductoDTO updateProducto(Long id, ProductoRequest request, Long usuarioId) {
		Producto existingProducto = productoRepository
			.findById(id)
			.orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
		validarPropietarioProducto(existingProducto, usuarioId);

		existingProducto.setNombre(request.getNombre());
		existingProducto.setDescripcion(request.getDescripcion());
		existingProducto.setPrecio(request.getPrecio());
		existingProducto.setStock(request.getStock());

		// Mapear categorías de forma segura para Hibernate (clear + addAll)
		if (existingProducto.getCategorias() == null) {
			existingProducto.setCategorias(new ArrayList<>());
		}
		existingProducto.getCategorias().clear();
		if (request.getCategoriaIds() != null && !request.getCategoriaIds().isEmpty()) {
			List<Categoria> cats = categoriaRepository.findAllById(request.getCategoriaIds());
			existingProducto.getCategorias().addAll(cats);
		}

		// Mapear imágenes de forma segura (clear + addAll)
		if (existingProducto.getImagenes() == null) {
			existingProducto.setImagenes(new ArrayList<>());
		}
		existingProducto.getImagenes().clear();
		if (request.getImagenes() != null && !request.getImagenes().isEmpty()) {
			existingProducto.getImagenes().addAll(request.getImagenes());
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

	/**
	 * BUG-01 FIX — Descuento de stock atómico.
	 * Usa una query UPDATE con WHERE stock >= cantidad para evitar la race condition.
	 * Si retorna 0 filas afectadas, el stock era insuficiente.
	 */
	@Transactional
	public void descontarStock(Long id, int cantidad) {
		if (!productoRepository.existsById(id)) {
			throw new ResourceNotFoundException("Producto no encontrado con id: " + id);
		}
		int filasAfectadas = productoRepository.decrementarStockAtomico(id, cantidad);
		if (filasAfectadas == 0) {
			Producto p = productoRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
			throw new BadRequestException("Stock insuficiente para el producto: " + p.getNombre()
				+ ". Stock actual: " + p.getStock() + ", solicitado: " + cantidad);
		}
	}
}