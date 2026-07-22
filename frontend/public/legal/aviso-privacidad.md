# AVISO DE PRIVACIDAD

**Última actualización: 22 de julio de 2026**

En **ConciliaFácil** (en adelante, el "Servicio" o la "Plataforma"), nos tomamos muy en serio la privacidad de tus datos personales y financieros. Este Aviso de Privacidad detalla la información que recopilamos, cómo la tratamos, la finalidad del procesamiento y los mecanismos disponibles para ejercer tus derechos de acceso, rectificación, cancelación y oposición.

---

## 1. Responsable del Tratamiento de Datos
El responsable del tratamiento de los datos recabados a través de esta plataforma es **ConciliaFácil**, la cual opera como una solución de software como servicio (SaaS). Si tienes alguna pregunta sobre este Aviso de Privacidad o el tratamiento de tus datos, puedes ponerte en contacto con nuestro equipo de soporte técnico y de privacidad.

---

## 2. Datos Personales y Financieros que Recopilamos
Al utilizar ConciliaFácil, recopilamos y procesamos datos en las siguientes categorías:

### A. Información de la Cuenta y Registro
* **Correo electrónico:** Utilizado para la creación de tu cuenta, autenticación de seguridad y notificaciones del servicio.
* **Identificadores técnicos:** Identificador único de usuario (UUID) asignado automáticamente al registrarte.

### B. Preferencias de la Aplicación
* **Preferencias de interfaz:** Guardamos información básica de personalización, como la configuración de tu tema visual (modo claro o modo oscuro).

### C. Datos de Facturación y Suscripción (Procesados vía Stripe)
* **Información de cliente en Stripe:** ID de cliente de Stripe, ID de suscripción activa, identificador del plan adquirido (`stripePriceId`), el estado de la suscripción y fecha de vencimiento del periodo de facturación actual.
* **Nota importante:** ConciliaFácil **no almacena directamente números de tarjetas de crédito o débito**. Estos datos son administrados de forma segura y directa por nuestro procesador de pagos de terceros, Stripe, bajo sus propias políticas de seguridad y cumplimiento PCI-DSS.

### D. Datos Contables y de Conciliación (Subidos por el Usuario)
Para prestar el servicio de conciliación inteligente, procesamos y guardamos en nuestra base de datos los siguientes registros extraídos de los archivos que subes voluntariamente:
* **Datos de Empresas:** RFC (Registro Federal de Contribuyentes) y Razón Social de los contribuyentes que registres.
* **Movimientos Bancarios (de tus estados de cuenta):** Fecha del movimiento, descripción o concepto de la transacción, monto y tipo de operación (ingreso o egreso).
* **Facturas XML (CFDI del SAT):** UUID de la factura, fecha de expedición, RFC del emisor y del receptor, nombre o razón social del emisor y del receptor, tipo de comprobante (ingreso/egreso) y el monto total de la factura.
* **Grupos y Coincidencias:** Las relaciones lógicas generadas por la conciliación (enlaces entre movimientos bancarios y facturas correspondientes).

---

## 3. Finalidad del Tratamiento de los Datos
Utilizamos la información recopilada exclusivamente para los siguientes fines operativos y de servicio:
1. **Prestación del Servicio:** Ejecutar el motor de conciliación y pareo inteligente entre tus estados de cuenta bancarios y tus facturas XML.
2. **Historial y Borradores:** Almacenar el registro histórico de tus conciliaciones completadas y guardar borradores de conciliaciones en curso para permitirte continuar tu trabajo posteriormente.
3. **Gestión de Suscripciones:** Administrar el cobro del plan contratado, verificar el cumplimiento de límites mensuales del plan (conciliaciones y RFCs) y procesar transacciones a través de Stripe.
4. **Soporte y Seguridad:** Brindar soporte técnico personalizado, asegurar que los datos no sean accedidos por terceros no autorizados y prevenir usos fraudulentos del sistema.

---

## 4. Transferencia de Datos y No Comercialización
En ConciliaFácil mantenemos un compromiso ético estricto con tu información financiera:
* **No comercializamos:** Bajo ninguna circunstancia vendemos, rentamos, intercambiamos o cedemos tus datos personales ni tus registros contables a terceros con fines publicitarios o comerciales.
* **Terceros Autorizados:** Los datos únicamente se comparten con proveedores de infraestructura tecnológica estrictamente necesarios para operar el SaaS (como bases de datos de Supabase para el almacenamiento cifrado y autenticación, y Stripe para el procesamiento de pagos). Estos proveedores actúan como encargados del tratamiento bajo rigurosas medidas de confidencialidad.

---

## 5. Eliminación Completa de Cuenta y Registros (Derechos ARCO)
Tienes el derecho absoluto de solicitar la cancelación y eliminación de tu información en cualquier momento:
* **Autoservicio de Eliminación:** Puedes eliminar tu cuenta de forma definitiva desde la sección de Configuración de tu Perfil dentro de la plataforma.
* **Eliminación Irreversible (Hard Delete):** Al ejecutar la acción de eliminar cuenta (a través del endpoint del sistema `DELETE /users/me`), se desencadena un borrado físico, inmediato e irreversible en cascada de:
  1. Tu registro de usuario y credenciales en Supabase Auth.
  2. Tus datos de perfil y preferencias en la base de datos.
  3. Todas las empresas y RFCs que hayas registrado.
  4. La totalidad del historial de conciliaciones, incluyendo los borradores, movimientos bancarios, facturas asociadas y detalles de pareo.
* Ningún dato financiero subido por ti permanecerá en nuestros servidores activos una vez procesada la eliminación de la cuenta.

---

## 6. Modificaciones al Aviso de Privacidad
Nos reservamos el derecho de efectuar en cualquier momento modificaciones o actualizaciones al presente Aviso de Privacidad para la atención de novedades legislativas o políticas internas. Te notificaremos sobre cambios significativos a través de un aviso en la plataforma o por correo electrónico.
