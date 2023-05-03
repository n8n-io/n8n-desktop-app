// WARNING: Do not use - Remove nodes manually instead

const fs = require("fs");
const path = require("path");

// select nodes for n8n desktop

const JSON_PATH = path.resolve("node_modules", "n8n-nodes-base", "package.json");

const json = require(JSON_PATH);

const toRemove = [
  "dist/nodes/EditImage.node.js", // requires GraphicsMagick
  "dist/nodes/Kafka/Kafka.node.js", // kafkajs breaks build
  "dist/nodes/Kafka/KafkaTrigger.node.js", // kafkajs breaks build
];

const desktopNodes = json.n8n.nodes.filter((node) => !toRemove.includes(node));

const newPackageJson = JSON.stringify({
  ...json,
  n8n: { nodes: desktopNodes },
}, null, 2);

fs.writeFileSync(JSON_PATH, newPackageJson);

console.log(`Incompatible nodes removed from ${JSON_PATH}`);