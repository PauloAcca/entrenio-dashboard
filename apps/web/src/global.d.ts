
export { };

import { Object3DNode, MaterialNode } from '@react-three/fiber';
import * as THREE from 'three';

declare module '*.glb';
declare module '*.png';

declare module 'meshline' {
  export class MeshLineGeometry extends THREE.BufferGeometry {
    constructor();
    setPoints(points: Array<number | THREE.Vector3>): void;
  }

  export class MeshLineMaterial extends THREE.ShaderMaterial {
    constructor(parameters?: any);
    color: THREE.Color;
    map: THREE.Texture;
    useMap: number;
    alphaMap: THREE.Texture;
    useAlphaMap: number;
    resolution: THREE.Vector2;
    sizeAttenuation: number;
    lineWidth: number;
    near: number;
    far: number;
    dashArray: number;
    dashOffset: number;
    dashRatio: number;
    visibility: number;
    alphaTest: number;
    repeat: THREE.Vector2;
  }
}

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: Object3DNode<import('meshline').MeshLineGeometry, typeof import('meshline').MeshLineGeometry>;
    meshLineMaterial: MaterialNode<import('meshline').MeshLineMaterial, typeof import('meshline').MeshLineMaterial>;
  }
}
