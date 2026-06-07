# Instalacion Codex

## Windows

```powershell
git clone https://github.com/fdirico/PortalupStack.git
cd PortalupStack
.\scripts\install-local.ps1
node scripts\validate-skills.js
node scripts\validate-fixtures.js
node scripts\validate-actual-outputs.js
node scripts\validate-continuity.js
node scripts\validate-cli.js
node scripts\validate-all.js
node scripts\doctor.js
```

## Linux/macOS

```bash
git clone https://github.com/fdirico/PortalupStack.git
cd PortalupStack
chmod +x scripts/install-local.sh
./scripts/install-local.sh
node scripts/validate-skills.js
node scripts/validate-fixtures.js
node scripts/validate-actual-outputs.js
node scripts/validate-continuity.js
node scripts/validate-cli.js
node scripts/validate-all.js
node scripts/doctor.js
```

## Resultado

Las skills quedan copiadas en el directorio local de skills de Codex y pueden invocarse con `$portalup-review`, `$portalup-qa`, `$portalup-propuesta-comercial` y las demas skills incluidas.

## CLI helper

En Windows:

```powershell
.\scripts\pstack.ps1 ask "Describe tu tarea"
```

En Linux/macOS:

```bash
./scripts/pstack.sh ask "Describe tu tarea"
```

## Exportar paquete

En Windows:

```powershell
.\scripts\export-skills.ps1
```

En Linux/macOS:

```bash
./scripts/export-skills.sh
```
