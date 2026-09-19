sargdev02@MacBook-Air-de-Sergio dev-assistant % npm run dev

> dev-assistant@0.1.0 dev
> tsx src/index.ts

◇ injected env (9) from .env // tip: ⌘ override existing { override: true }
╔════════════════════════════════════════╗
║        DevAssistant - Curso IA         ║
║            Primera Llamada.            ║
╚════════════════════════════════════════╝

Enviando pregunta a claude

Pregunta: ¿Qué es typescript y en que se diferencia de javascript?. Responde en maximo 3 puntos.
 Error:  400 {"type":"error","error":{"type":"invalid_request_error","message":"Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits."},"request_id":"req_011CevPzfz3KmiN7PDbwpC6Y"}
sargdev02@MacBook-Air-de-Sergio dev-assistant % npm run dev

> dev-assistant@0.1.0 dev
> tsx src/index.ts

◇ injected env (9) from .env // tip: ⌘ enable debugging { debug: true }
╔════════════════════════════════════════╗
║        DevAssistant - Curso IA         ║
║             system prompts.            ║
╚════════════════════════════════════════╝

Demo 1: Enviando código SIN systemprompt

Pregunta: Revisa este codigo:
````javascript

async function getUser(id) {
  const query = "SELECT * FROM users WHERE id = " + id;
  const result = await db.query(query);
  return result[0];
}

function calcularDescuento(precio, tipo) {
  if (tipo == "vip") {
    return precio * 0.8;
  } else if (tipo == "regular") {
    return precio * 0.9;
  } else {
    return precio;
  }
}