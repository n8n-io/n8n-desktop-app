const fs = require('fs');
const path = require('path');

const REMOVE_FILES = false;
const REMOVE_CACHE = false;

const nodeModulesPath = path.resolve(__dirname, '..', 'node_modules');
const n8nNodesPackagePath = path.resolve(nodeModulesPath, 'n8n-nodes-base');
const n8nNodesPackageJsonPath = path.resolve(n8nNodesPackagePath, "package.json");
const n8nNodesPackageDistPath = path.resolve(n8nNodesPackagePath, 'dist');
const n8nNodesPackageCredentialsPath = path.resolve(n8nNodesPackageDistPath, 'credentials');
const n8nNodesPackageNodesPath = path.resolve(n8nNodesPackageDistPath, 'nodes');
const n8nNodesLazyLoadingCacheKnownPath = path.resolve(n8nNodesPackageDistPath, 'known');
const n8nNodesLazyLoadingCacheTypesPath = path.resolve(n8nNodesPackageDistPath, 'types');

const n8nNodesPackageJson = require(n8nNodesPackageJsonPath);

const unsupportedNodes = [
    'EditImage',
    'Git',
    'Kafka',
    'KafkaTrigger'
];

unsupportedNodes.forEach((nodeName) => {
    const nodesPath = path.resolve(n8nNodesPackageNodesPath, nodeName);
    const nodesJsPath = path.resolve(n8nNodesPackageNodesPath, `${nodeName}.node.js`);
    const credentialsJsPath = path.resolve(n8nNodesPackageCredentialsPath, `${nodeName}.credentials.js`);

    n8nNodesPackageJson.n8n.nodes = n8nNodesPackageJson.n8n.nodes.filter((nodePath) => !nodePath.includes(path.basename(nodesJsPath)));
    n8nNodesPackageJson.n8n.credentials = n8nNodesPackageJson.n8n.credentials.filter((nodePath) => !nodePath.includes(path.basename(credentialsJsPath)));

    console.log(nodesJsPath, credentialsJsPath)

    if (REMOVE_FILES) {
        const credentialsDtsPath = path.resolve(n8nNodesPackageCredentialsPath, `${nodeName}.credentials.d.ts`);
        const credentialsMapPath = path.resolve(n8nNodesPackageCredentialsPath, `${nodeName}.credentials.js.map`);

        [credentialsJsPath, credentialsDtsPath, credentialsMapPath, nodesJsPath, nodesPath].forEach((filePath) => {
            if (fs.existsSync(filePath)) {
                console.log(`Removing ${filePath}...`);
                fs.rmSync(filePath, {recursive: true});
            }
        });
    }
});

if (REMOVE_CACHE) {
    console.log('Removing lazy-loading cache...');
    if (fs.existsSync(n8nNodesLazyLoadingCacheKnownPath)) {
        fs.rmSync(path.resolve(n8nNodesPackageDistPath, 'known'), { recursive: true });
    }

    if (fs.existsSync(n8nNodesLazyLoadingCacheTypesPath)) {
        fs.rmSync(path.resolve(n8nNodesPackageDistPath, 'types'), { recursive: true });
    }
}

console.log('Rewriting n8n-nodes-base/package.json...');
fs.writeFileSync(n8nNodesPackageJsonPath, JSON.stringify(n8nNodesPackageJson, null, 2));
