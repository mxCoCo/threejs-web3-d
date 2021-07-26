import * as THREE from 'three';

function createScene(backgroundColor?:any) {
    let scene = new THREE.Scene();
    if(backgroundColor){
        scene.background = new THREE.Color(backgroundColor);
    }else {
        scene.background = new THREE.Color('#eeeeee');
    }
    return scene;
}
  
export { createScene };