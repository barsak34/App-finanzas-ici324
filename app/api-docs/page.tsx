'use client';

import { useEffect } from 'react';

export default function ApiDocsPage() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      // @ts-ignore
      if (window.SwaggerUIBundle) {
        // @ts-ignore
        window.SwaggerUIBundle({
          url: '/api/docs',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            // @ts-ignore
            window.SwaggerUIBundle.presets.apis,
            // @ts-ignore
            window.SwaggerUIBundle.SwaggerUIStandalonePreset,
          ],
          layout: 'BaseLayout',
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{
        backgroundColor: '#0f172a',
        color: '#ffffff',
        padding: '16px 24px',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ fontSize: '18px', fontWeight: '600' }}>
          App Finanzas del Hogar - Documentación API
        </div>
        <div>
          <a
            href="/api/docs"
            target="_blank"
            rel="noreferrer"
            style={{
              color: '#94a3b8',
              fontSize: '13px',
              textDecoration: 'none',
              padding: '6px 12px',
              border: '1px solid #334155',
              borderRadius: '4px',
            }}
          >
            OpenAPI Spec
          </a>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        <div id="swagger-ui" />
      </main>
    </div>
  );
}
