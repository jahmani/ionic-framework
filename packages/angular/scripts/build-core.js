const fs = require('fs-extra');
const path = require('path');
const spawn = require('child_process').spawn;

const typescriptPath = path.join(__dirname, '..', 'node_modules', '.bin');

function copyCSS() {
  // Create the CSS files in the dist/css directory
  const dst = path.join(__dirname, '..', 'dist', 'css');
  const rootCssDir = path.join(__dirname, '..', 'css');
  const ionicCoreCssDir = path.join(__dirname, '..', 'node_modules', '@ionic', 'core', 'css');
  const ionicCoreDistDir = path.join(__dirname, '..', 'node_modules', '@ionic', 'core', 'dist');
  const ourDistDir = path.join(__dirname, '..', 'dist');

  // Clean and create directories
  fs.removeSync(dst);
  fs.ensureDirSync(dst);
  fs.removeSync(rootCssDir);
  fs.ensureDirSync(rootCssDir);

  // List of CSS files to copy
  const cssFiles = [
    'core.css',
    'normalize.css',
    'structure.css',
    'typography.css',
    'padding.css',
    'float-elements.css',
    'text-alignment.css',
    'text-transformation.css',
    'flex-utils.css',
    'display.css'
  ];

  // Copy each CSS file from @ionic/core to both dist/css and css directories
  cssFiles.forEach(file => {
    const sourceFile = path.join(ionicCoreCssDir, file);
    const distFile = path.join(dst, file);
    const rootFile = path.join(rootCssDir, file);

    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, distFile);
      fs.copyFileSync(sourceFile, rootFile);
    } else {
      console.warn(`Warning: Could not find source file: ${sourceFile}`);
    }
  });

  // Copy the entire dist directory from @ionic/core
  if (fs.existsSync(ionicCoreDistDir)) {
    fs.copySync(ionicCoreDistDir, path.join(ourDistDir, 'core'), {
      filter: (src) => {
        // Skip node_modules and test directories
        return !src.includes('node_modules') && !src.includes('test');
      }
    });
  } else {
    console.warn('Warning: Could not find @ionic/core dist directory');
  }
}

function buildSchematics(){
  return new Promise((resolve, reject) => {
    const cmd = 'tsc';
    const args = [
      '--project',
      path.join(__dirname, '..', 'tsconfig.schematics.json'),
    ];

    const p = spawn(cmd, args, { cwd: typescriptPath, stdio: 'inherit', shell: true });
    p.on('close', (code) => {
      if (code > 0) {
        console.log(`ng-add build exited with ${code}`);
        reject();
      } else {
        resolve();
      }
    });
  });
}

function copySchematicsJson(){
  const src = path.join(__dirname, '..', 'src', 'schematics', 'collection.json');
  const fileSrc = path.join(__dirname, '..', 'src', 'schematics', 'add', 'files');
  const dst = path.join(__dirname, '..', 'dist','schematics', 'collection.json');
  const fileDst = path.join(__dirname, '..', 'dist', 'schematics', 'add', 'files');
  const schemaSrc = path.join(__dirname, '..', 'src', 'schematics', 'add', 'schema.json');
  const schemaDst = path.join(__dirname, '..', 'dist', 'schematics', 'add', 'schema.json');

  fs.removeSync(dst);
  fs.removeSync(fileDst);
  fs.copySync(src, dst);
  fs.copySync(fileSrc,fileDst);
  fs.copySync(schemaSrc, schemaDst);

}

copyCSS();
buildSchematics();
copySchematicsJson()
