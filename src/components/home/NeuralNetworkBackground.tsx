import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

interface NeuralNetworkBackgroundProps {
  opacity?: number;
  paletteIndex?: number;
}

class NNode {
  position: THREE.Vector3;
  connections: { node: NNode; strength: number }[];
  level: number;
  type: number;
  size: number;
  distanceFromRoot: number;

  constructor(position: THREE.Vector3, level = 0, type = 0) {
    this.position = position;
    this.connections = [];
    this.level = level;
    this.type = type;
    this.size = type === 0 ? THREE.MathUtils.randFloat(0.8, 1.4) : THREE.MathUtils.randFloat(0.5, 1.0);
    this.distanceFromRoot = 0;
  }

  addConnection(node: NNode, strength = 1.0) {
    if (!this.isConnectedTo(node)) {
      this.connections.push({ node, strength });
      node.connections.push({ node: this, strength });
    }
  }

  isConnectedTo(node: NNode) {
    return this.connections.some(c => c.node === node);
  }
}

const noiseFunctions = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const colorPalettes = [
  [new THREE.Color(0x667eea), new THREE.Color(0x764ba2), new THREE.Color(0xf093fb), new THREE.Color(0x9d50bb), new THREE.Color(0x6e48aa)],
  [new THREE.Color(0xF59E0B), new THREE.Color(0xD97706), new THREE.Color(0xFBBF24), new THREE.Color(0xB45309), new THREE.Color(0xEAB308)],
  [new THREE.Color(0x10B981), new THREE.Color(0x059669), new THREE.Color(0x34D399), new THREE.Color(0x047857), new THREE.Color(0x6EE7B7)],
];

function generateNetwork(densityFactor = 1.0) {
  const nodes: NNode[] = [];
  const rootNode = new NNode(new THREE.Vector3(0, 0, 0), 0, 0);
  rootNode.size = 2.0;
  nodes.push(rootNode);

  const layers = 5;
  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  for (let layer = 1; layer <= layers; layer++) {
    const radius = layer * 4;
    const numPoints = Math.floor(layer * 12 * densityFactor);
    for (let i = 0; i < numPoints; i++) {
      const phi = Math.acos(1 - 2 * (i + 0.5) / numPoints);
      const theta = 2 * Math.PI * i / goldenRatio;
      const pos = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );
      const isLeaf = layer === layers || Math.random() < 0.3;
      const node = new NNode(pos, layer, isLeaf ? 1 : 0);
      node.distanceFromRoot = radius;
      nodes.push(node);

      if (layer > 1) {
        const prevLayerNodes = nodes.filter(n => n.level === layer - 1 && n !== rootNode);
        prevLayerNodes.sort((a, b) => pos.distanceTo(a.position) - pos.distanceTo(b.position));
        for (let j = 0; j < Math.min(3, prevLayerNodes.length); j++) {
          const dist = pos.distanceTo(prevLayerNodes[j].position);
          const strength = 1.0 - (dist / (radius * 2));
          node.addConnection(prevLayerNodes[j], Math.max(0.3, strength));
        }
      } else {
        rootNode.addConnection(node, 0.9);
      }
    }

    const layerNodes = nodes.filter(n => n.level === layer && n !== rootNode);
    for (let i = 0; i < layerNodes.length; i++) {
      const node = layerNodes[i];
      const nearby = layerNodes.filter(n => n !== node)
        .sort((a, b) => node.position.distanceTo(a.position) - node.position.distanceTo(b.position))
        .slice(0, 5);
      for (const nearNode of nearby) {
        const dist = node.position.distanceTo(nearNode.position);
        if (dist < radius * 0.8 && !node.isConnectedTo(nearNode)) {
          node.addConnection(nearNode, 0.6);
        }
      }
    }
  }

  return { nodes, rootNode };
}

const NeuralNetworkBackground: React.FC<NeuralNetworkBackgroundProps> = ({ opacity = 1, paletteIndex = 0 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.002);

    const camera = new THREE.PerspectiveCamera(65, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 8, 28);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Starfield
    const starCount = 5000;
    const starPositions: number[] = [];
    const starColors: number[] = [];
    const starSizes: number[] = [];
    for (let i = 0; i < starCount; i++) {
      const r = THREE.MathUtils.randFloat(50, 150);
      const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      starPositions.push(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
      starColors.push(1, 1, 1);
      starSizes.push(THREE.MathUtils.randFloat(0.1, 0.3));
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    starGeo.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));
    const starMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: `attribute float size;attribute vec3 color;varying vec3 vColor;uniform float uTime;void main(){vColor=color;vec4 mvPosition=modelViewMatrix*vec4(position,1.0);float twinkle=sin(uTime*2.0+position.x*100.0)*0.3+0.7;gl_PointSize=size*twinkle*(300.0/-mvPosition.z);gl_Position=projectionMatrix*mvPosition;}`,
      fragmentShader: `varying vec3 vColor;void main(){vec2 center=gl_PointCoord-0.5;float dist=length(center);if(dist>0.5)discard;float alpha=1.0-smoothstep(0.0,0.5,dist);gl_FragColor=vec4(vColor,alpha*0.8);}`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.6;
    controls.minDistance = 8;
    controls.maxDistance = 80;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    controls.enablePan = false;
    controls.enableZoom = false;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(canvas.clientWidth, canvas.clientHeight), 1.8, 0.6, 0.7);
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    const pulseUniforms = {
      uTime: { value: 0.0 },
      uPulsePositions: { value: [new THREE.Vector3(1e3, 1e3, 1e3), new THREE.Vector3(1e3, 1e3, 1e3), new THREE.Vector3(1e3, 1e3, 1e3)] },
      uPulseTimes: { value: [-1e3, -1e3, -1e3] },
      uPulseColors: { value: [new THREE.Color(1, 1, 1), new THREE.Color(1, 1, 1), new THREE.Color(1, 1, 1)] },
      uPulseSpeed: { value: 18.0 },
      uBaseNodeSize: { value: 0.6 }
    };

    const nodeVertexShader = `${noiseFunctions}
attribute float nodeSize;attribute float nodeType;attribute vec3 nodeColor;attribute float distanceFromRoot;
uniform float uTime;uniform vec3 uPulsePositions[3];uniform float uPulseTimes[3];uniform float uPulseSpeed;uniform float uBaseNodeSize;
varying vec3 vColor;varying float vNodeType;varying vec3 vPosition;varying float vPulseIntensity;varying float vDistanceFromRoot;varying float vGlow;
float getPulseIntensity(vec3 worldPos,vec3 pulsePos,float pulseTime){if(pulseTime<0.0)return 0.0;float t=uTime-pulseTime;if(t<0.0||t>4.0)return 0.0;float r=t*uPulseSpeed;float d=distance(worldPos,pulsePos);return smoothstep(3.0,0.0,abs(d-r))*smoothstep(4.0,0.0,t);}
void main(){vNodeType=nodeType;vColor=nodeColor;vDistanceFromRoot=distanceFromRoot;vec3 worldPos=(modelMatrix*vec4(position,1.0)).xyz;vPosition=worldPos;float totalPulse=0.0;for(int i=0;i<3;i++){totalPulse+=getPulseIntensity(worldPos,uPulsePositions[i],uPulseTimes[i]);}vPulseIntensity=min(totalPulse,1.0);float breathe=sin(uTime*0.7+distanceFromRoot*0.15)*0.15+0.85;float baseSize=nodeSize*breathe;float pulseSize=baseSize*(1.0+vPulseIntensity*2.5);vGlow=0.5+0.5*sin(uTime*0.5+distanceFromRoot*0.2);vec3 modPos=position;if(nodeType>0.5){float n=snoise(position*0.08+uTime*0.08);modPos+=normal*n*0.15;}vec4 mvPos=modelViewMatrix*vec4(modPos,1.0);gl_PointSize=pulseSize*uBaseNodeSize*(1000.0/-mvPos.z);gl_Position=projectionMatrix*mvPos;}`;

    const nodeFragmentShader = `uniform float uTime;uniform vec3 uPulseColors[3];varying vec3 vColor;varying float vNodeType;varying vec3 vPosition;varying float vPulseIntensity;varying float vDistanceFromRoot;varying float vGlow;
void main(){vec2 center=2.0*gl_PointCoord-1.0;float dist=length(center);if(dist>1.0)discard;float glow1=1.0-smoothstep(0.0,0.5,dist);float glow2=1.0-smoothstep(0.0,1.0,dist);float glowStrength=pow(glow1,1.2)+glow2*0.3;float breatheColor=0.9+0.1*sin(uTime*0.6+vDistanceFromRoot*0.25);vec3 baseColor=vColor*breatheColor;vec3 finalColor=baseColor;if(vPulseIntensity>0.0){vec3 pulseColor=mix(vec3(1.0),uPulseColors[0],0.4);finalColor=mix(baseColor,pulseColor,vPulseIntensity*0.8);finalColor*=(1.0+vPulseIntensity*1.2);glowStrength*=(1.0+vPulseIntensity);}float coreBrightness=smoothstep(0.4,0.0,dist);finalColor+=vec3(1.0)*coreBrightness*0.3;float alpha=glowStrength*(0.95-0.3*dist);float camDist=length(vPosition-cameraPosition);float distFade=smoothstep(100.0,15.0,camDist);if(vNodeType>0.5){finalColor*=1.1;alpha*=0.9;}finalColor*=(1.0+vGlow*0.1);gl_FragColor=vec4(finalColor,alpha*distFade);}`;

    // Build network
    const network = generateNetwork(0.8);
    const palette = colorPalettes[paletteIndex % colorPalettes.length];

    const nodesGeo = new THREE.BufferGeometry();
    const nodePositions: number[] = [];
    const nodeTypes: number[] = [];
    const nodeSizes: number[] = [];
    const nodeColorArr: number[] = [];
    const distancesFromRoot: number[] = [];

    network.nodes.forEach(node => {
      nodePositions.push(node.position.x, node.position.y, node.position.z);
      nodeTypes.push(node.type);
      nodeSizes.push(node.size);
      distancesFromRoot.push(node.distanceFromRoot);
      const colorIndex = Math.min(node.level, palette.length - 1);
      const baseColor = palette[colorIndex % palette.length].clone();
      baseColor.offsetHSL(THREE.MathUtils.randFloatSpread(0.03), THREE.MathUtils.randFloatSpread(0.08), THREE.MathUtils.randFloatSpread(0.08));
      nodeColorArr.push(baseColor.r, baseColor.g, baseColor.b);
    });

    nodesGeo.setAttribute('position', new THREE.Float32BufferAttribute(nodePositions, 3));
    nodesGeo.setAttribute('nodeType', new THREE.Float32BufferAttribute(nodeTypes, 1));
    nodesGeo.setAttribute('nodeSize', new THREE.Float32BufferAttribute(nodeSizes, 1));
    nodesGeo.setAttribute('nodeColor', new THREE.Float32BufferAttribute(nodeColorArr, 3));
    nodesGeo.setAttribute('distanceFromRoot', new THREE.Float32BufferAttribute(distancesFromRoot, 1));

    const nodesMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(pulseUniforms),
      vertexShader: nodeVertexShader,
      fragmentShader: nodeFragmentShader,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const nodesMesh = new THREE.Points(nodesGeo, nodesMaterial);
    scene.add(nodesMesh);

    // Connections
    const connGeo = new THREE.BufferGeometry();
    const connPositions: number[] = [];
    const startPoints: number[] = [];
    const endPoints: number[] = [];
    const connStrengths: number[] = [];
    const connColors: number[] = [];
    const pathIndices: number[] = [];
    const processed = new Set<string>();
    let pathIdx = 0;

    network.nodes.forEach((node, ni) => {
      node.connections.forEach(conn => {
        const ci = network.nodes.indexOf(conn.node);
        if (ci === -1) return;
        const key = `${Math.min(ni, ci)}-${Math.max(ni, ci)}`;
        if (processed.has(key)) return;
        processed.add(key);
        for (let i = 0; i < 20; i++) {
          const t = i / 19;
          connPositions.push(t, 0, 0);
          startPoints.push(node.position.x, node.position.y, node.position.z);
          endPoints.push(conn.node.position.x, conn.node.position.y, conn.node.position.z);
          pathIndices.push(pathIdx);
          connStrengths.push(conn.strength);
          const avgLevel = Math.min(Math.floor((node.level + conn.node.level) / 2), palette.length - 1);
          const baseColor = palette[avgLevel % palette.length].clone();
          connColors.push(baseColor.r, baseColor.g, baseColor.b);
        }
        pathIdx++;
      });
    });

    connGeo.setAttribute('position', new THREE.Float32BufferAttribute(connPositions, 3));
    connGeo.setAttribute('startPoint', new THREE.Float32BufferAttribute(startPoints, 3));
    connGeo.setAttribute('endPoint', new THREE.Float32BufferAttribute(endPoints, 3));
    connGeo.setAttribute('connectionStrength', new THREE.Float32BufferAttribute(connStrengths, 1));
    connGeo.setAttribute('connectionColor', new THREE.Float32BufferAttribute(connColors, 3));
    connGeo.setAttribute('pathIndex', new THREE.Float32BufferAttribute(pathIndices, 1));

    const connVertexShader = `${noiseFunctions}
attribute vec3 startPoint;attribute vec3 endPoint;attribute float connectionStrength;attribute float pathIndex;attribute vec3 connectionColor;
uniform float uTime;uniform vec3 uPulsePositions[3];uniform float uPulseTimes[3];uniform float uPulseSpeed;
varying vec3 vColor;varying float vConnectionStrength;varying float vPulseIntensity;varying float vPathPosition;varying float vDistanceFromCamera;
float getPulseIntensity(vec3 worldPos,vec3 pulsePos,float pulseTime){if(pulseTime<0.0)return 0.0;float t=uTime-pulseTime;if(t<0.0||t>4.0)return 0.0;float r=t*uPulseSpeed;float d=distance(worldPos,pulsePos);return smoothstep(3.0,0.0,abs(d-r))*smoothstep(4.0,0.0,t);}
void main(){float t=position.x;vPathPosition=t;vec3 midPoint=mix(startPoint,endPoint,0.5);float pathOffset=sin(t*3.14159)*0.15;vec3 perp=normalize(cross(normalize(endPoint-startPoint),vec3(0.0,1.0,0.0)));if(length(perp)<0.1)perp=vec3(1.0,0.0,0.0);midPoint+=perp*pathOffset;vec3 p0=mix(startPoint,midPoint,t);vec3 p1=mix(midPoint,endPoint,t);vec3 finalPos=mix(p0,p1,t);float noise=snoise(vec3(pathIndex*0.08,t*0.6,uTime*0.15));finalPos+=perp*noise*0.12;vec3 worldPos=(modelMatrix*vec4(finalPos,1.0)).xyz;float totalPulse=0.0;for(int i=0;i<3;i++){totalPulse+=getPulseIntensity(worldPos,uPulsePositions[i],uPulseTimes[i]);}vPulseIntensity=min(totalPulse,1.0);vColor=connectionColor;vConnectionStrength=connectionStrength;vDistanceFromCamera=length(worldPos-cameraPosition);gl_Position=projectionMatrix*modelViewMatrix*vec4(finalPos,1.0);}`;

    const connFragmentShader = `uniform float uTime;uniform vec3 uPulseColors[3];varying vec3 vColor;varying float vConnectionStrength;varying float vPulseIntensity;varying float vPathPosition;varying float vDistanceFromCamera;
void main(){float flow1=sin(vPathPosition*25.0-uTime*4.0)*0.5+0.5;float flow2=sin(vPathPosition*15.0-uTime*2.5+1.57)*0.5+0.5;float combinedFlow=(flow1+flow2*0.5)/1.5;vec3 baseColor=vColor*(0.8+0.2*sin(uTime*0.6+vPathPosition*12.0));float flowIntensity=0.4*combinedFlow*vConnectionStrength;vec3 finalColor=baseColor;if(vPulseIntensity>0.0){vec3 pulseColor=mix(vec3(1.0),uPulseColors[0],0.3);finalColor=mix(baseColor,pulseColor*1.2,vPulseIntensity*0.7);flowIntensity+=vPulseIntensity*0.8;}finalColor*=(0.7+flowIntensity+vConnectionStrength*0.5);float baseAlpha=0.7*vConnectionStrength;float flowAlpha=combinedFlow*0.3;float alpha=baseAlpha+flowAlpha;alpha=mix(alpha,min(1.0,alpha*2.5),vPulseIntensity);float distFade=smoothstep(100.0,15.0,vDistanceFromCamera);gl_FragColor=vec4(finalColor,alpha*distFade);}`;

    const connMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(pulseUniforms),
      vertexShader: connVertexShader,
      fragmentShader: connFragmentShader,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const connMesh = new THREE.LineSegments(connGeo, connMaterial);
    scene.add(connMesh);

    palette.forEach((color, i) => {
      if (i < 3) {
        connMaterial.uniforms.uPulseColors.value[i].copy(color);
        nodesMaterial.uniforms.uPulseColors.value[i].copy(color);
      }
    });

    // Auto-pulse
    let lastPulseIndex = 0;
    const autoPulseInterval = setInterval(() => {
      const t = clock.getElapsedTime();
      lastPulseIndex = (lastPulseIndex + 1) % 3;
      const randomPos = new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(20),
        THREE.MathUtils.randFloatSpread(20),
        THREE.MathUtils.randFloatSpread(20)
      );
      nodesMaterial.uniforms.uPulsePositions.value[lastPulseIndex].copy(randomPos);
      nodesMaterial.uniforms.uPulseTimes.value[lastPulseIndex] = t;
      connMaterial.uniforms.uPulsePositions.value[lastPulseIndex].copy(randomPos);
      connMaterial.uniforms.uPulseTimes.value[lastPulseIndex] = t;
      const randomColor = palette[Math.floor(Math.random() * palette.length)];
      nodesMaterial.uniforms.uPulseColors.value[lastPulseIndex].copy(randomColor);
      connMaterial.uniforms.uPulseColors.value[lastPulseIndex].copy(randomColor);
    }, 2000);

    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      nodesMaterial.uniforms.uTime.value = t;
      connMaterial.uniforms.uTime.value = t;
      nodesMesh.rotation.y = Math.sin(t * 0.04) * 0.05;
      connMesh.rotation.y = Math.sin(t * 0.04) * 0.05;
      starField.rotation.y += 0.0002;
      starMat.uniforms.uTime.value = t;
      controls.update();
      composer.render();
    };

    const handleResize = () => {
      if (!canvas.parentElement) return;
      const w = canvas.parentElement.clientWidth;
      const h = canvas.parentElement.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloomPass.resolution.set(w, h);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(autoPulseInterval);
      cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      controls.dispose();
    };
  }, [paletteIndex]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity, zIndex: 0 }}
    />
  );
};

export default NeuralNetworkBackground;
