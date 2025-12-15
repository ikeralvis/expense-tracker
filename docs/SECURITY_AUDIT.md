0# Informe de Auditoría de Seguridad y Pentesting - Expense Tracker

**Fecha:** 24 de Noviembre de 2024
**Objetivo:** Evaluación de seguridad de la aplicación web "Expense Tracker" para identificar vulnerabilidades y proponer remediaciones.

## 1. Identificación y Enumeración

### Stack Tecnológico
- **Frontend/Framework:** Next.js 16.0.3 (React 19)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Base de Datos & Autenticación:** Supabase (PostgreSQL)
- **Librerías Clave:** `@supabase/ssr`, `lucide-react`, `recharts`, `html-to-image`

### Puntos de Entrada
- **Autenticación:** `/login`, `/register` (Manejado por Supabase Auth)
- **Dashboard:** `/dashboard/*` (Protegido por Middleware)
- **Server Actions:** `lib/actions/*.ts` (Funciones del servidor para mutación de datos)
- **API Routes:** `app/api/auth/*` (Callbacks de autenticación)

## 2. Análisis de Vulnerabilidades (OWASP Top 10)

### A01:2021 - Broken Access Control (Control de Acceso Roto)
- **Hallazgo (RLS):** Se verificó la existencia de políticas de seguridad a nivel de fila (RLS) para la tabla `recurring_transactions` en `schema.sql`.
    - **Riesgo Potencial (ALTO):** No se encontraron definiciones explícitas de RLS para las tablas `accounts`, `transactions`, `budgets` y `categories` en el código fuente. Si estas tablas no tienen RLS habilitado en la base de datos, existe un riesgo crítico de IDOR (Insecure Direct Object Reference), donde un usuario podría acceder a los datos de otros.
- **Mitigación Existente:** Las Server Actions (`lib/actions/*.ts`) implementan filtros explícitos `.eq('user_id', user.id)`, lo cual actúa como una capa de defensa efectiva. Sin embargo, la seguridad no debe depender solo de la aplicación; la base de datos debe ser segura por diseño.

### A03:2021 - Injection (Inyección)
- **SQL Injection:**
    - **Estado:** **Seguro**. La aplicación utiliza el cliente de Supabase (`@supabase/supabase-js`), que utiliza consultas parametrizadas por defecto. No se encontró uso de SQL crudo concatenado.
- **XSS (Cross-Site Scripting):**
    - **Estado:** **Seguro**. React escapa automáticamente el contenido renderizado. Se realizó una búsqueda de `dangerouslySetInnerHTML` y no se encontraron instancias, eliminando el vector principal de XSS en React.

### A07:2021 - Identification and Authentication Failures
- **Autenticación:**
    - **Estado:** **Robusto**. Se delega en Supabase Auth, un proveedor seguro.
- **Gestión de Sesiones:**
    - **Estado:** **Bueno**. El `middleware.ts` protege adecuadamente las rutas `/dashboard`, redirigiendo a usuarios no autenticados. Las cookies de sesión son manejadas de forma segura por `@supabase/ssr`.

### A05:2021 - Security Misconfiguration
- **Secretos:**
    - **Estado:** **Bueno**. Las claves de API (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) se cargan desde variables de entorno (`process.env`), no están hardcodeadas en el código (según la revisión de `middleware.ts`).
    - **Nota:** La `ANON_KEY` es pública por diseño en Supabase, pero depende de RLS para la seguridad.

## 3. Informe de Riesgos y Hallazgos

| ID | Vulnerabilidad | Severidad | Impacto | Descripción |
|----|----------------|-----------|---------|-------------|
| **VULN-01** | **Posible Falta de RLS en Tablas Core** | **Alta** | Crítico | Si las tablas `accounts`, `transactions`, etc., no tienen RLS habilitado en Supabase, un fallo en la lógica de la aplicación podría exponer todos los datos de los usuarios. |
| **VULN-02** | **Dependencia de Validación en Cliente/App** | **Media** | Alto | Confiar solo en los filtros de las Server Actions (`.eq('user_id')`) es arriesgado. Si se crea un nuevo endpoint y se olvida este filtro, los datos quedan expuestos. |

## 4. Hoja de Ruta y Plan de Remediación

### Fase 1: Acciones Inmediatas (Críticas)
1.  **Verificar y Habilitar RLS Globalmente:**
    -   Acceder al Dashboard de Supabase o revisar las migraciones.
    -   Asegurarse de que **TODAS** las tablas (`accounts`, `categories`, `transactions`, `budgets`) tengan RLS habilitado (`ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`).
    -   Crear políticas de acceso para cada tabla similares a las de `recurring_transactions`:
        ```sql
        CREATE POLICY "Users can view own data" ON table_name FOR SELECT USING (auth.uid() = user_id);
        -- Repetir para INSERT, UPDATE, DELETE
        ```

### Fase 2: Fortalecimiento (DevSecOps)
2.  **Validación de Esquemas (Zod):**
    -   Implementar validación estricta de tipos en las Server Actions usando una librería como `zod` para asegurar que los datos de entrada (`formData`) cumplan con el formato esperado antes de procesarlos.
3.  **Headers de Seguridad:**
    -   Configurar headers HTTP de seguridad en `next.config.js` o middleware (ej: `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`).

### Fase 3: Mantenimiento
4.  **Escaneo de Dependencias:**
    -   Ejecutar regularmente `npm audit` para detectar vulnerabilidades en librerías de terceros.
5.  **Rotación de Secretos:**
    -   Establecer una política de rotación periódica para las Service Role Keys de Supabase (si se usan en el futuro).

## Conclusión
La aplicación `expense-tracker` tiene una base de seguridad sólida gracias al uso de Next.js y Supabase. La autenticación y la protección contra inyecciones son robustas. El riesgo principal reside en la **verificación de las políticas RLS** para todas las tablas. Una vez confirmado y remediado esto, la aplicación puede considerarse segura para producción.
