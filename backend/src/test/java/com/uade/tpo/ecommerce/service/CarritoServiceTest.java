package com.uade.tpo.ecommerce.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.uade.tpo.ecommerce.exception.BadRequestException;
import com.uade.tpo.ecommerce.model.*;
import com.uade.tpo.ecommerce.repository.CarritoRepository;
import com.uade.tpo.ecommerce.repository.ProductoRepository;
import com.uade.tpo.ecommerce.dto.CheckoutResponse;
import com.uade.tpo.ecommerce.dto.CarritoDTO;
import com.uade.tpo.ecommerce.dto.PedidoDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
public class CarritoServiceTest {

    @Mock
    private CarritoRepository carritoRepository;

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private ProductoService productoService;

    @Mock
    private UsuarioService usuarioService;

    @Mock
    private PedidoService pedidoService;
    
    @InjectMocks
    private CarritoService carritoService;

    private Usuario usuarioPrueba;
    private Producto productoPrueba;
    private Carrito carritoPrueba;

    @BeforeEach
    void setUp() {
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

    @Test
    void checkout_Exitoso() {
        // GIVEN: El carrito tiene un item con cantidad 2
        CarritoItem item = new CarritoItem();
        item.setProducto(productoPrueba);
        item.setCantidad(2);
        carritoPrueba.getItems().add(item);

        when(usuarioService.getUsuarioEntityById(1L)).thenReturn(usuarioPrueba);
        when(carritoRepository.findByUsuarioId(1L)).thenReturn(Optional.of(carritoPrueba));

        when(productoRepository.findById(productoPrueba.getId())).thenReturn(Optional.of(productoPrueba));
        when(pedidoService.savePedido(any(Pedido.class))).thenReturn(PedidoDTO.builder().id(1L).total(3000.0).build());

        // WHEN: Ejecutamos el checkout
        CheckoutResponse resultado = carritoService.checkout(1L);

        // THEN: Validaciones
        assertNotNull(resultado);
        assertTrue(resultado.getMensaje().contains("Compra realizada con éxito"));

        // Verificamos que se llamó al descuento de stock atómico
        verify(productoService, times(1)).descontarStock(productoPrueba.getId(), 2);
        verify(pedidoService, times(1)).savePedido(any(Pedido.class));
        assertTrue(carritoPrueba.getItems().isEmpty()); // El carrito debe quedar vacío
    }

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

        // Simulamos que al descontar el stock lanza la excepción (ya que el servicio lo hace internamente)
        doThrow(new BadRequestException("Stock insuficiente para: Notebook"))
                .when(productoService).descontarStock(productoPrueba.getId(), 5);

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
        productoPrueba.setStock(0);

        when(usuarioService.getUsuarioEntityById(1L)).thenReturn(usuarioPrueba);
        when(carritoRepository.findByUsuarioId(1L)).thenReturn(Optional.of(carritoPrueba));
        when(productoRepository.findById(productoPrueba.getId())).thenReturn(Optional.of(productoPrueba));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> carritoService.agregarProducto(productoPrueba.getId(), 1L, 1));
        assertEquals("No hay stock disponible para el producto: " + productoPrueba.getNombre(), ex.getMessage());
    }
}