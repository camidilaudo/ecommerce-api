package com.uade.tpo.ecommerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
public class ApiEcommerceApplication {

	@PostConstruct
	public void init() {
		// Forzar zona horaria de Buenos Aires para la JVM (UTC-3)
		TimeZone.setDefault(TimeZone.getTimeZone("America/Argentina/Buenos_Aires"));
	}

	public static void main(String[] args) {
		SpringApplication.run(ApiEcommerceApplication.class, args);
	}

}
