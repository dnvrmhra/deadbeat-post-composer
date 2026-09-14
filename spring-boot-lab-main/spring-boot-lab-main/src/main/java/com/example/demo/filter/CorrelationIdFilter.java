package com.example.demo.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

/**
 * Experiment 2.1.2 - Correlation ID Filter
 *
 * Assigns a unique ID to every request via MDC (Mapped Diagnostic Context).
 * The ID appears in every log line for that request, enabling full
 * request lifecycle tracing.
 *
 * - Reads X-Correlation-ID from request header (if client provides one)
 * - Generates a new UUID if not present
 * - Writes it back into the response header so clients can reference it
 * - Clears MDC after the request completes to prevent thread-pool leakage
 */
@Component
@Order(1)
public class CorrelationIdFilter implements Filter {

    private static final String CORRELATION_ID_KEY = "correlationId";
    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String correlationId = httpRequest.getHeader(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }

        MDC.put(CORRELATION_ID_KEY, correlationId);

        // Write correlation ID into response header so Postman/frontend can see it
        httpResponse.setHeader(CORRELATION_ID_HEADER, correlationId);

        try {
            chain.doFilter(request, response);
        } finally {
            MDC.remove(CORRELATION_ID_KEY);
        }
    }
}