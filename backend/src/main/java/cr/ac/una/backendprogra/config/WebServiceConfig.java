package cr.ac.una.backendprogra.config;

import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.ws.config.annotation.EnableWs;
import org.springframework.ws.config.annotation.WsConfigurerAdapter;
import org.springframework.ws.transport.http.MessageDispatcherServlet;
import org.springframework.xml.xsd.SimpleXsdSchema;
import org.springframework.xml.xsd.XsdSchema;
import org.springframework.ws.wsdl.wsdl11.DefaultWsdl11Definition;

@EnableWs
@Configuration
public class WebServiceConfig extends WsConfigurerAdapter {

    @Bean
    public ServletRegistrationBean<MessageDispatcherServlet> messageDispatcherServlet(ApplicationContext applicationContext) {
        MessageDispatcherServlet servlet = new MessageDispatcherServlet();
        servlet.setApplicationContext(applicationContext);
        servlet.setTransformWsdlLocations(true);
        return new ServletRegistrationBean<>(servlet, "/ws/*");
    }

    @Bean(name = "personas")
    public DefaultWsdl11Definition personasWsdl11Definition(XsdSchema personaSchema) {
        DefaultWsdl11Definition wsdl11Definition = new DefaultWsdl11Definition();
        wsdl11Definition.setPortTypeName("PersonaPort");
        wsdl11Definition.setLocationUri("/ws");
        wsdl11Definition.setTargetNamespace("http://soapcrud.una.ac.cr/ws/persona");
        wsdl11Definition.setSchema(personaSchema);
        return wsdl11Definition;
    }

    @Bean
    public XsdSchema personaSchema() {
        return new SimpleXsdSchema(new org.springframework.core.io.ClassPathResource("personas.xsd"));
    }

    @Bean(name = "oficinas")
    public DefaultWsdl11Definition oficinasWsdl11Definition(XsdSchema oficinaSchema) {
        DefaultWsdl11Definition wsdl11Definition = new DefaultWsdl11Definition();
        wsdl11Definition.setPortTypeName("OficinaPort");
        wsdl11Definition.setLocationUri("/ws");
        wsdl11Definition.setTargetNamespace("http://soapcrud.una.ac.cr/ws/oficina");
        wsdl11Definition.setSchema(oficinaSchema);
        return wsdl11Definition;
    }

    @Bean
    public XsdSchema oficinaSchema() {
        return new SimpleXsdSchema(new org.springframework.core.io.ClassPathResource("oficinas.xsd"));
    }


    @Bean(name = "registros")
    public DefaultWsdl11Definition registrosWsdl11Definition(XsdSchema registroSchema) {
        DefaultWsdl11Definition wsdl11Definition = new DefaultWsdl11Definition();
        wsdl11Definition.setPortTypeName("RegistroPort");
        wsdl11Definition.setLocationUri("/ws");
        wsdl11Definition.setTargetNamespace("http://soapcrud.una.ac.cr/ws/registro");
        wsdl11Definition.setSchema(registroSchema);
        return wsdl11Definition;
    }

    @Bean
    public XsdSchema registroSchema() {
        return new SimpleXsdSchema(new org.springframework.core.io.ClassPathResource("registros.xsd"));
    }
}