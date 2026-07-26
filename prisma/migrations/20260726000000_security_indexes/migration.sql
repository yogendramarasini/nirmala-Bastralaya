CREATE INDEX "audit_logs_action_ipAddress_createdAt_idx"
ON "audit_logs"("action", "ipAddress", "createdAt");

CREATE INDEX "audit_logs_action_entityId_createdAt_idx"
ON "audit_logs"("action", "entityId", "createdAt");
