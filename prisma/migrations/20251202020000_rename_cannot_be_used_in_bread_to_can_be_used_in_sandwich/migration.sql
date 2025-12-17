-- Renomear coluna e inverter valores (true vira false, false vira true)
ALTER TABLE "products" 
  RENAME COLUMN "cannotBeUsedInBread" TO "canBeUsedInSandwich";

-- Inverter os valores: se era false (não pode usar), agora é true (pode usar)
-- Se era true (não pode usar), agora é false (pode usar)
UPDATE "products" 
SET "canBeUsedInSandwich" = NOT "canBeUsedInSandwich";

-- Alterar o valor padrão para true
ALTER TABLE "products" 
  ALTER COLUMN "canBeUsedInSandwich" SET DEFAULT true;

