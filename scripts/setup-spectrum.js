/**
 * Photon Spectrum Setup Helper for Sleek AI
 * 
 * Project ID: a2908f60-fd06-459b-954a-71e1ffba2593
 * Photon Dashboard: https://app.photon.codes/dashboard/a2908f60-fd06-459b-954a-71e1ffba2593/platforms
 * Photon Docs: https://docs.photon.codes/
 * 
 * To run:
 *   node scripts/setup-spectrum.js
 */

const { execSync } = require("child_process");

const PROJECT_ID = "a2908f60-fd06-459b-954a-71e1ffba2593";
const SCAFFOLD_CMD_NPM = `npx create-spectrum-project@latest sleek-line --projectId ${PROJECT_ID} --providers imessage --yes`;

console.log("==================================================");
console.log("🚀 Sleek AI • Photon Spectrum Setup Helper");
console.log("==================================================");
console.log(`Project ID: ${PROJECT_ID}`);
console.log(`Platforms: iMessage (Exclusive 3-Way Escrow Room)`);
console.log("");
console.log("To scaffold the line handler:");
console.log(`  ${SCAFFOLD_CMD_NPM}`);
console.log("");
console.log("Dashboard Action Required:");
console.log(`  1. Visit: https://app.photon.codes/dashboard/${PROJECT_ID}/platforms`);
console.log("  2. Add your dedicated iMessage line under Platforms.");
console.log("  3. Text your assigned number from an iPhone to verify reply.");
console.log("==================================================");
