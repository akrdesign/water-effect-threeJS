uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;

void main() {
    vec4 modelPositon = modelMatrix * vec4(position, 1.0);

    vec4 viewPosition = viewMatrix * modelPositon;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    vUv = uv;
}