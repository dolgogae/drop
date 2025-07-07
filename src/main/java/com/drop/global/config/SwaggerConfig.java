package com.drop.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger springdoc-ui 구성 파일
 */
@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI openAPI(){
        Info info = new Info()
                .title("Spring Security 연계 프로젝트")
                .version("v0.0.1")
                .description("Spring Security 연계 프로젝트");
        return new OpenAPI()
                .components(new Components())
                .info(info);
    }
}
