package com.uade.tpo.ecommerce.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.uade.tpo.ecommerce.exception.BadRequestException;
import com.uade.tpo.ecommerce.model.*;
import com.uade.tpo.ecommerce.repository.CarritoRepository;
import com.uade.tpo.ecommerce.dto.CheckoutResponse;
import com.uade.tpo.ecommerce.dto.CarritoDTO;
import com.uade.tpo.ecommerce.dto.ProductoDTO;
import com.uade.tpo.ecommerce.dto.PedidoDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

/**
 * ==========================================================
 * Clase de Test: CarritoServiceTest
 * ==========================================================
 * Descripción:
 * Pruebas unitarias utilizando Mockito para aislar la lógica
 * de negocio del CarritoService.
 * * Se prueban los escenarios críticos del TPO:
 * 1. Checkout exitoso con descuento de stock.
 * 2. Error en checkout por falta de stock.
 * ==========================================================
 */
@ExtendWith(MockitoExtension.class) // Habilita el uso de Mocks en JUnit 5
public class CarritoServiceTest {

    @Mock
    private CarritoRepository carritoRepository;

    @Mock
    private ProductoService productoService;

    @Mock
    private UsuarioService usuarioService;

    @Mock
    private PedidoService pedidoService;
    @InjectMocks
    private CarritoService carritoService; // Inyecta los mocks anteriores en el servicio

    private Usuario usuarioPrueba;
    private Producto productoPrueba;
    private Carrito carritoPrueba;

    @BeforeEach
    void setUp() {
        // Inicializamos datos de prueba antes de cada test
        usuarioPrueba = new Usuario();
        usuarioPrueba.setId(1L);
        usuarioPrueba.setEmail("test@uade.edu.ar");

        productoPrueba = Producto.builder()
                .id(100L)
                .nombre("Notebook")
                .precio(1500.0)
                .stock(10)
                .build();

        carritoPrueba = new Carrito();
        carritoPrueba.setUsuario(usuarioPrueba);
        carritoPrueba.setItems(new ArrayList<>());
    }

    // TEST: Verificar que el checkout descuenta stock y genera el pedido correctamente
    @Test
    void checkout_Exitoso() {
        // GIVEN: El carrito tiene un item con cantidad 2
        CarritoItem item = new CarritoItem();
        item.setProducto(productoPrueba);
        item.setCantidad(2);
        carritoPrueba.getItems().add(item);

        // Simulamos el comportamiento del repositorio
        when(usuarioService.getUsuarioEntityById(1L)).thenReturn(usuarioPrueba);
        when(carritoRepository.findByUsuarioId(1L)).thenReturn(Optional.of(carritoPrueba));

        ProductoDTO productoDTO = ProductoDTO.builder()
            .id(productoPrueba.getId())
            .nombre(productoPrueba.getNombre())
            .precio(productoPrueba.getPrecio())
            .stock(productoPrueba.getStock())
            .usuarioId(usuarioPrueba.getId())
            .build();

        when(productoService.getProductoById(productoPrueba.getId())).thenReturn(productoDTO);
        when(pedidoService.savePedido(any(Pedido.class))).thenReturn(PedidoDTO.builder().id(1L).total(3000.0).build());

        when(productoService.saveProducto(any(Producto.class), eq(usuarioPrueba))).thenAnswer(invocation -> {
            Producto p = invocation.getArgument(0);
            return ProductoDTO.builder()
                .id(p.getId())
                .nombre(p.getNombre())
                .precio(p.getPrecio())
                .stock(p.getStock())
                .usuarioId(usuarioPrueba.getId())
                .build();
        });

        // WHEN: Ejecutamos el checkout
        CheckoutResponse resultado = carritoService.checkout(1L);

        // THEN: Validaciones
        assertNotNull(resultado);
        assertTrue(resultado.getMensaje().contains("Compra realizada con éxito"));

        // Verificamos que se llamó al guardado de los cambios con stock descontado (10 - 2 = 8)
        verify(productoService, times(1)).saveProducto(argThat(p -> p.getStock() == 8), eq(usuarioPrueba));
        verify(pedidoService, times(1)).savePedido(any(Pedido.class));
        assertTrue(carritoPrueba.getItems().isEmpty()); // El carrito debe quedar vacío
    }

    // TEST: Verificar que si no hay stock suficiente, el checkout lanza una excepción
    @Test
    void checkout_ErrorFaltaDeStock() {
        // GIVEN: El producto tiene stock 2, pero el carrito pide 5
        productoPrueba.setStock(2);
        CarritoItem item = new CarritoItem();
        item.setProducto(productoPrueba);
        item.setCantidad(5);
        carritoPrueba.getItems().add(item);

        when(usuarioService.getUsuarioEntityById(1L)).thenReturn(usuarioPrueba);
        when(carritoRepository.findByUsuarioId(1L)).thenReturn(Optional.of(carritoPrueba));

        ProductoDTO productoDTO = ProductoDTO.builder()
                .id(productoPrueba.getId())
                .nombre(productoPrueba.getNombre())
                .precio(productoPrueba.getPrecio())
                .stock(productoPrueba.getStock())
                .usuarioId(usuarioPrueba.getId())
                .build();

        when(productoService.getProductoById(productoPrueba.getId())).thenReturn(productoDTO);

        // WHEN & THEN: Verificamos que lance la excepción BadRequestException
        BadRequestException exception = assertThrows(BadRequestException.class, () -> carritoService.checkout(1L));

        assertEquals("Stock insuficiente para: Notebook", exception.getMessage());
        verify(pedidoService, never()).savePedido(any()); // El pedido NO debe guardarse
    }

    @Test
    void obtenerCarrito_RetornaCarritoDTO() {
        when(usuarioService.getUsuarioEntityById(1L)).thenReturn(usuarioPrueba);
        when(carritoRepository.findByUsuarioId(1L)).thenReturn(Optional.of(carritoPrueba));

        CarritoDTO dto = carritoService.obtenerCarrito(1L);

        assertNotNull(dto);
        assertNotNull(dto.getUsuario());
        assertEquals(usuarioPrueba.getId(), dto.getUsuario().getId());
        assertTrue(dto.getItems().isEmpty());
    }

    @Test
    void agregarProducto_NoStock_LanzaBadRequest() {
        // GIVEN: producto con stock 0
        ProductoDTO productoDTO = ProductoDTO.builder()
                .id(productoPrueba.getId())
                .nombre(productoPrueba.getNombre())
                .precio(productoPrueba.getPrecio())
                .stock(0)
                .usuarioId(usuarioPrueba.getId())
                .build();

        when(usuarioService.getUsuarioEntityById(1L)).thenReturn(usuarioPrueba);
        when(carritoRepository.findByUsuarioId(1L)).thenReturn(Optional.of(carritoPrueba));
        when(productoService.getProductoById(productoPrueba.getId())).thenReturn(productoDTO);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> carritoService.agregarProducto(productoPrueba.getId(), 1L));
        assertEquals("No hay stock disponible para el producto: " + productoPrueba.getNombre(), ex.getMessage());
    }
}