import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import fragment from './shader/fragment.glsl';
import vertex from './shader/vertex.glsl'

import brush from '../brush.png'
import ocean from '../ocean.jpg'

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();
    this.scene1 = new THREE.Scene();

    this.container = options.domElement;
    this.width = options.domElement.offsetWidth;
    this.height = options.domElement.offsetHeight;
    this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 0.01, 10);
    var frustumSize = this.height;
    var aspect = this.width/this.height;
    this.camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000);
    this.camera.position.z = 1;

    
    // this.baseTexture = new THREE.WebGLRenderTarget(
    //   this.width, this.height, {
    //     minFilter: THREE.LinearFilter,
    //     magFilter: THREE.LinearFilter,
    //     format: THREE.RGBAFormat
    //   }
    // )
    
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);

    this.control = new OrbitControls(this.camera, this.renderer.domElement)
    this.container.appendChild(this.renderer.domElement);

    this.time = 0;
    this.mouse = new THREE.Vector2(0, 0);
    this.prevMouse = new THREE.Vector2(0, 0);
    this.currentWave = 0;
    
    this.mouseEvents()
    this.addObjects();
    this.render();
  }

  mouseEvents() {
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX - this.width/2;
      this.mouse.y = this.height/2 - e.clientY;
    })
  }

  addObjects() {
    // this.material = new THREE.ShaderMaterial({
    //   extensions: {
    //     derivatives: "#extension GL_OES_standard_derivatives : enable"
    //   },
    //   side: THREE.DoubleSide,
    //   uniforms: {
    //     time: { value: 0 },
    //     uDisplacement: { value: null },
    //     uTexture: { value: new THREE.TextureLoader().load(ocean) },
    //     resolution: { value: new THREE.Vector4() }
    //   },
    //   vertexShader: vertex,
    //   fragmentShader: fragment
    // });
    this.geometry = new THREE.PlaneGeometry(40, 40, 1, 1);


    this.max = 50;
    this.meshes = [];

    for (let i = 0; i < this.max; i++) {
      let m  = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(brush),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false

      })

      let mesh = new THREE.Mesh(this.geometry, m);

      mesh.visible = false;
      mesh.rotation.z = 2 * Math.PI * Math.random();
      this.scene.add(mesh);
      this.meshes.push(mesh);
      
    }


    // this.mesh = new THREE.Mesh(this.geometry, this.material);
    // this.scene.add(this.mesh);
  }

  setNewWave(x,y,index) {
    let mesh  = this.meshes[index];
    mesh.visible = true;
    mesh.position.x = x;
    mesh.position.y = y;
    mesh.scale.x=mesh.scale.y = 1;
    mesh.material.opacity = 1;
  }

  trackMousePos() {
    if(Math.abs(this.mouse.x - this.prevMouse.x)<4 &&
    Math.abs(this.mouse.y - this.prevMouse.y)<4) {
      // Nothing
    } else {
      this.setNewWave(this.mouse.x, this.mouse.y, this.currentWave)
      this.currentWave = (this.currentWave+1)%this.max;
    }

    this.prevMouse.x = this.mouse.x;
    this.prevMouse.y = this.mouse.y;
  }

  render() {
    this.trackMousePos()
    this.time += 0.05;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera)

    this.meshes.forEach(mesh => {
      if(mesh.visible) {
        // mesh.position.x = this.mouse.x;
        // mesh.position.y = this.mouse.y;
        mesh.rotation.z += 0.02
        mesh.material.opacity *= 0.98
        mesh.scale.x = 0.98*mesh.scale.x + 0.1
        mesh.scale.y = mesh.scale.x
        if(mesh.material.opacity<0.02) {mesh.visible = false}
      }
    })
  }
}

new Sketch({
    domElement: document.getElementById("container")
});