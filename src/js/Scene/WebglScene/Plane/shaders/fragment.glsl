varying vec2 vUv;

uniform sampler2D u_map;
uniform float u_time;
uniform float u_aspect;
uniform vec2 u_mouseUV;
uniform float u_mouseIntensity;
uniform vec2 u_uvScale;

void main() {
  vec2 mouse = vec2(u_mouseUV.x * u_aspect, 1.0 - u_mouseUV.y);
  vec2 point = vec2(vUv.x * u_aspect, vUv.y);

  float intensity = u_mouseIntensity * 3.0;

  // hover area

  float cursorCircle = distance(point, mouse);
  cursorCircle = smoothstep(0.0, 0.9, cursorCircle);
  cursorCircle = 1.0 - cursorCircle;
  cursorCircle *= intensity;

  // distortion noise

  float noiseScale = 4.25;

  float noise1 = snoise(vec3(vUv * noiseScale, cursorCircle + u_time));
  noise1 = smoothstep(0.0, 0.1, noise1);
  
  float noise2 = snoise(vec3(vUv * noiseScale * 0.995, cursorCircle + u_time));
  noise2 = smoothstep(0.0, 0.1, noise2);

  float noise = clamp(noise1 - noise2, 0.0, 1.0);

  // coordinates

  vec2 uv = (vUv - 0.5) * u_uvScale + 0.5;

  vec2 coords = uv;
  coords -= vec2(0.5);
  coords /= 1.0 + cursorCircle;
  coords += vec2(0.5);

  coords += noise * cursorCircle * 0.75;

  // colors

	vec4 color = texture2D(u_map, coords);

  // color.r += noise * cursorCircle;
  // color.g = color.g * (1.0 - (noise * cursorCircle));
  // color.b += noise * cursorCircle;

  gl_FragColor = color;
}
