# Tareas de Implementación: Upgrades y Downgrades con Stripe

- [x] 1. Crear `billing-subscription.service.ts` en `backend/src/billing/`
- [/] 2. Modificar `billing.controller.ts` para inyectar el servicio y agregar el endpoint `/billing/change-plan`
- [ ] 3. Modificar `billing.module.ts` para registrar el nuevo servicio en NestJS
- [ ] 4. Modificar `billing.service.ts` para dar soporte al webhook de Stripe (`customer.subscription.updated` y `customer.subscription.deleted`)
- [ ] 5. Crear `billingApi.ts` en `frontend/src/features/billing/api/`
- [ ] 6. Modificar `PricingPage.tsx` en el frontend para manejar modales de confirmación dinámicos y la llamada a `changePlan`
- [ ] 7. Ejecutar compilación y validación estática de tipos en ambos proyectos (backend y frontend)
