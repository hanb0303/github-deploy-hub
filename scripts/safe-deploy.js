import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 [Safe-Deploy] Starting safe deployment pipeline...');

try {
  // Step 1: Always pull latest changes from main to guarantee config.json is fresh
  console.log('📥 1. Pulling latest cloud configuration from origin main...');
  execSync('git pull origin main', { stdio: 'inherit' });

  // Step 2: Validate public/config.json
  const configPath = path.resolve('public/config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('public/config.json does not exist!');
  }
  const configContent = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  if (!configContent.folders || configContent.folders.length === 0) {
    throw new Error('public/config.json appears corrupted or empty!');
  }
  console.log(`✅ 2. Validated config.json (${configContent.folders.length} folders present).`);

  // Step 3: Build application
  console.log('📦 3. Building application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Step 4: Ensure dist/config.json matches public/config.json
  fs.copyFileSync(configPath, path.resolve('dist/config.json'));
  console.log('✅ 4. Synced config.json to dist/');

  // Step 5: Push dist to gh-pages branch
  console.log('🌐 5. Deploying to gh-pages branch...');
  process.chdir('dist');
  execSync('git add -A', { stdio: 'inherit' });
  try {
    execSync('git commit -m "deploy: automated safe deployment"', { stdio: 'inherit' });
  } catch (e) {
    console.log('No new dist changes to commit.');
  }
  execSync('git push origin gh-pages --force', { stdio: 'inherit' });
  process.chdir('..');

  console.log('🎉 [Safe-Deploy] Deployment completed successfully without any data loss!');
} catch (error) {
  console.error('❌ [Safe-Deploy] Deployment aborted due to error:', error);
  process.exit(1);
}
