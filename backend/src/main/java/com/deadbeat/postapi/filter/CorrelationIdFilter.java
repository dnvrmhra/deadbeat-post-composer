package com.deadbeat.postapi.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

/**
 * Experiment 2.1.2 — Correlation ID Filter (Servlet Filter)
 *
 * This filter runs for every HTTP request before it reaches any controller.
 * It implements two responsibilities:
 *
 * 1. CORRELATION ID
 *    Assigns a unique ID to each request using MDC (Mapped Diagnostic Context).
 *    MDC is a thread-local map that SLF4J/Logback reads when formatting log lines.
 *    The correlation ID is:
 *      - Read from the X-Correlation-ID request header (if provided by the client)
 *      - Or generated as a new UUID if not present
 *    The ID is written back into the response header so the frontend
 *    can reference it when reporting errors.
 *
 * 2. REQUEST / RESPONSE LOGGING
 *    Logs the method, URI, and execution time for every request, producing
 *    structured, traceable log output like:
 *      [a3f7c1...] --> POST /api/posts
 *      [a3f7c1...] <-- POST /api/posts 201 CREATED in 42ms
 *
 * MDC.clear() in the finally block prevents correlation ID leakage across
 * requests on thread-pool threads.
 *
 * @Order(1) ensures this filter runs first in the filter chain.
 */
@Component
@Order(1)
@Slf4j
public class CorrelationIdFilter implements Filter {

    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    private static final String MDC_KEY = "correlationId";

    @Override
    public void doFilter(ServletRequest request,
                         ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {

        HttpServletRequest  httpReq  = (HttpServletRequest)  request;
        HttpServletResponse httpResp = (HttpServletResponse) response;

        String correlationId = httpReq.getHeader(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        }

        MDC.put(MDC_KEY, correlationId);
        httpResp.setHeader(CORRELATION_ID_HEADER, correlationId);

        long startTime = System.currentTimeMillis();
        log.info("[{}] --> {} {}", correlationId, httpReq.getMethod(), httpReq.getRequestURI());

        try {
            chain.doFilter(request, response);
        } finally {
            long elapsed = System.currentTimeMillis() - startTime;
            log.info("[{}] <-- {} {} {} in {}ms",
                    correlationId,
                    httpReq.getMethod(),
                    httpReq.getRequestURI(),
                    httpResp.getStatus(),
                    elapsed);
            MDC.clear();
        }
    }
}
