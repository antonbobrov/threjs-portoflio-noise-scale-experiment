varying vec2 vUv;

uniform float u_activeProgress;

void main() {
  vUv = uv;
  vec3 transformed = vec3(position);

  vec2 center = vec2(0.5, 0.5);
  float circle = 1.0 - distance(center, transformed.xy);

  transformed.z += circle * u_activeProgress;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
