package com.drop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableCaching
@EnableJpaAuditing
@SpringBootApplication//(exclude={SecurityAutoConfiguration.class})
public class GymoryApplication {

    public static void main(String[] args) {
        SpringApplication.run(GymoryApplication.class, args);
    }
}
