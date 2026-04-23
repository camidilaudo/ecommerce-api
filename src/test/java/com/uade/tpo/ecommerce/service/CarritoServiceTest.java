package com.uade.tpo.ecommerce.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.uade.tpo.ecommerce.exception.BadRequestException;
import com.uade.tpo.ecommerce.model.*;
import com.uade.tpo.ecommerce.repository.*;
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
    private ProductoRepository productoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PedidoRepository pedidoRepository;

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

        productoPrueba = new Producto();
        productoPrueba.setId(100L);
        productoPrueba.setNombre("Notebook");
        productoPrueba.setPrecio(1500.0);
        productoPrueba.setStock(10); // Empezamos con 10 unidades

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
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioPrueba));
        when(carritoRepository.findByUsuarioId(1L)).thenReturn(Optional.of(carritoPrueba));

        // WHEN: Ejecutamos el checkout
        String resultado = carritoService.checkout(1L);

        // THEN: Validaciones
        assertNotNull(resultado);
        assertTrue(resultado.contains("Compra realizada con éxito"));
        assertEquals(8, productoPrueba.getStock()); // Verificamos descuento de stock (10 - 2)

        // Verificamos que se llamó al guardado de los cambios
        verify(productoRepository, times(1)).save(any(Producto.class));
        verify(pedidoRepository, times(1)).save(any(Pedido.class));
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

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioPrueba));
        when(carritoRepository.findByUsuarioId(1L)).thenReturn(Optional.of(carritoPrueba));

        // WHEN & THEN: Verificamos que lance la excepción BadRequestException
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            carritoService.checkout(1L);
        });

        assertEquals("Stock insuficiente para: Notebook", exception.getMessage());
        verify(pedidoRepository, never()).save(any()); // El pedido NO debe guardarse
    }
}