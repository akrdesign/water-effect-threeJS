import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import fragment from './shader/fragment.glsl';
import vertex from './shader/vertex.glsl';

import brush from '../brush.png';
import girl from '../girl.jpg';
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

    this.baseTexture = new THREE.WebGLRenderTarget(
      this.width, this.height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
      }
    )
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);

    // this.control = new OrbitControls(this.camera, this.renderer.domElement)
    this.container.appendChild(this.renderer.domElement);

    this.time = 0;
    this.mouse = new THREE.Vector2(0, 0);
    this.prevMouse = new THREE.Vector2(0, 0);
    this.currentWave = 0;
    
    this.mouseEvents()
    this.addObjects();
    this.resize();
    this.render();
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    // image cover
    this.imageAspect = 853/1280;
    let a1; let a2;
    if(this.height/this.width>this.imageAspect){
      a1 = (this.width/this.height) * this.imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = (this.height/this.width) / this.imageAspect;
    }

    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;

    this.camera.updateProjectionMatrix();
  }

  mouseEvents() {
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX - this.width/2;
      this.mouse.y = this.height/2 - e.clientY;
    })
  }

  addObjects() {
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        uDisplacement: { value: null },
        uTexture: { value: new THREE.TextureLoader().load(girl) },
        resolution: { value: new THREE.Vector4() }
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    this.geometry = new THREE.PlaneGeometry(64, 64, 1, 1);
    this.geometryFullScreen = new THREE.PlaneGeometry(this.width + this.width / 3, this.height + this.height / 3, 1, 1);


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


    this.quad = new THREE.Mesh(this.geometryFullScreen, this.material);
    this.scene1.add(this.quad);
  }

  setNewWave(x,y,index) {
    let mesh  = this.meshes[index];
    mesh.visible = true;
    mesh.position.x = x;
    mesh.position.y = y;
    mesh.scale.x=mesh.scale.y = 0.2;
    mesh.material.opacity = 0.5;
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

    this.renderer.setRenderTarget(this.baseTexture);
    this.renderer.render(this.scene, this.camera);
    this.material.uniforms.uDisplacement.value = this.baseTexture.texture;
    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.scene1, this.camera);

    this.meshes.forEach(mesh => {
      if(mesh.visible) {
        // mesh.position.x = this.mouse.x;
        // mesh.position.y = this.mouse.y;
        mesh.rotation.z += 0.02;
        mesh.material.opacity *= 0.96;

        mesh.scale.x = 0.982*mesh.scale.x + 0.108;
        mesh.scale.y = mesh.scale.x;
        if(mesh.material.opacity<0.002) {mesh.visible = false}
      }
    })
  }
}

new Sketch({
    domElement: document.getElementById("container")
});