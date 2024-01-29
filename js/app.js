import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import brush from '../brush.png'

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();
    
    this.container = options.domElement;
    this.width = options.domElement.offsetWidth;
    this.height = options.domElement.offsetHeight;
    this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 0.01, 10);
    var frustumSize = this.height;
    var aspect = this.width/this.height;
    this.camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000);
    this.camera.position.z = 1;

    
    
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
    this.geometry = new THREE.PlaneGeometry(40, 40, 1, 1);

    // this.material = new THREE.MeshNormalMaterial();

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













// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import * as dat from "dat.gui";
// import gsap from "gsap";

// import brush from "../brush.png";

// export default class Sketch {
//   constructor(options) {
//     this.scene = new THREE.Scene();

//     this.container = options.domElement;
//     this.width = this.container.offsetWidth;
//     this.height = this.container.offsetHeight;
//     this.renderer = new THREE.WebGLRenderer({ antialias: true });
//     this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//     this.renderer.setSize(this.width, this.height);
//     this.renderer.setClearColor(0x000000, 1);
//     this.renderer.physicallyCorrectLights = true;
//     this.renderer.outputEncoding = THREE.sRGBEncoding;

//     this.container.appendChild(this.renderer.domElement);

//     this.camera = new THREE.PerspectiveCamera(
//       70,
//       this.width/this.height,
//       0.001,
//       1000
//     )

//     var frustumSize = this.height;
//     var aspect = this.width/this.height;
//     this.camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000);
//     this.camera.position.set(0, 0, 2);
//     this.controls = new OrbitControls(this.camera, this.renderer.domElement);
//     // this.controls.enableDamping = true;
//     this.time = 0;
//     this.mouse = new THREE.Vector2(0, 0);
//     this.prevMouse = new THREE.Vector2(0, 0);
//     this.currentWave = 0;
    
//     this.isPlaying = true;
//     this.mouseEvents();
//     this.addObjects();
//     this.resize();
//     this.render();
//     this.setupResize();
//     // this.settings()
//   }

//   settings() {
//     let that = this;
//     this.settings = {
//       progress: 0,
//     };
//     this.gui = new dat.GUI();
//     this.gui.add(this.settings, "progress", 0, 1, 0.01);
//   }

//   setupResize() {
//     window.addEventListener("resize", this.resize.bind(this));
//   }

//   resize() {
//     this.width = this.container.offsetWidth;
//     this.height = this.container.offsetHeight;
//     this.renderer.setSize(this.width, this.height);
//     this.camera.aspect = this.width / this.height;

//     // image cover
//     // this.imageAspect = 853/1280;
//     // let a1; let a2;
//     // if(this.height/this.width>this.imageAspect){
//     //   a1 = (this.width/this.height) * this.imageAspect;
//     //   a2 = 1;
//     // } else {
//     //   a1 = 1;
//     //   a2 = (this.height/this.width) / this.imageAspect;
//     // }

//     // this.material.uniforms.resolution.value.x = this.width;
//     // this.material.uniforms.resolution.value.y = this.height;
//     // this.material.uniforms.resolution.value.z = a1;
//     // this.material.uniforms.resolution.value.w = a2;

//     this.camera.updateProjectionMatrix();
//   }

//   mouseEvents() {
//     window.addEventListener("mousemove", (e) => {
//       this.mouse.x = e.clientX - this.width / 2;
//       this.mouse.y = this.height/ 2 - e.clientY;
//     })
//   }

//   addObjects() {
//     let that = this;
//     this.material = new THREE.ShaderMaterial({});

//     this.max = 2;

//     this.geometry = new THREE.PlaneGeometry(100, 100, 1, 1);
//     this.meshes = [];

//     // this.material1 = new THREE.MeshBasicMaterial({
//     //   color: 0xff0000,
//     //   map: new THREE.TextureLoader().load(brush),
//     // });


//     for (let i = 0; i < this.max; i++) {
//       let m = new THREE.MeshBasicMaterial({
//         map: new THREE.TextureLoader().load(brush),
//         transparent: true,
//         blending: THREE.AdditiveBlending,
//         depthTest: false,
//         depthWrite: false
//       });

//       let mesh = new THREE.Mesh(this.geometry, m);

//       // mesh.visible = false;
//       mesh.rotation.z = 2 * Math.PI * Math.random();
//       this.scene.add(mesh);
//       this.meshes.push(mesh);
//     }

//     // this.mesh = new THREE.Mesh(this.geometry, this.material1);
//     // this.scene.add(this.mesh);
//   }

//   stop() {
//     this.isPlaying = false;
//   }

//   play() {
//     if (!this.isPlaying) {
//       this.isPlaying = true;
//       this.render();
//     }
//   }

//   setNewWave(x,y,index) {
//     let mesh  = this.meshes[index];
//     mesh.visible = true;
//     mesh.position.x = x;
//     mesh.position.y = y;
//   }

//   trackMousePos() {
//     if(Math.abs(this.mouse.x - this.prevMouse.x)<4 && 
//     Math.abs(this.mouse.y - this.prevMouse.y)<4){
//       // Nothing
//     } else {
//       this.setNewWave(this.mouse.x, this.mouse.y, this.currentWave)
//       this.currentWave = (this.currentWave+1)%this.max;
//       console.log(this.currentWave);
//     }

//     this.prevMouse.x = this.mouse.x;
//     this.prevMouse.y = this.mouse.y;
//   }

//   render() {
//     this.trackMousePos()
//     if (!this.isPlaying) return;
//     this.time += 0.05;
//     // this.controls.update();
//     requestAnimationFrame(this.render.bind(this));
//     this.renderer.render(this.scene, this.camera);

//     this.meshes.forEach(mesh => {
//       // mesh.position.x = this.mouse.x;
//       // mesh.position.y = this.mouse.y;
//     })
//   }
// }

// new Sketch({
//   domElement: document.getElementById("container"),
// });
