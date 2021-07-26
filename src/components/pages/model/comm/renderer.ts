import * as THREE from 'three';

function createRenderer(modelWidth:any,modelHeight:any) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    // renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setSize( modelWidth, modelHeight );
    renderer.sortObjects = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;
    return renderer;
  }
  
  export { createRenderer };
  