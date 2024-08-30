export const default_vert =
`
precision mediump float;
attribute vec2 a_pos;
varying vec2 v_pos;
void main()
{
    gl_Position = vec4(a_pos, 0.0, 1.0);
    v_pos = a_pos;
} 
`
export const acid_frag =
`
precision mediump float;
uniform sampler2D u_texture;
uniform float u_kernel[9];
uniform float u_time;
uniform vec2 u_res;
uniform bool u_step;
uniform bool u_pause;
varying vec2 v_pos;

float activation(float x)
{
    [AF]
}

void main()
{
    if (u_step && !u_pause)
    {
        vec2 position = gl_FragCoord.xy / u_res.xy;

        float sum = 
            texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0, -1.0)) / u_res.xy).r * u_kernel[0]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0, -1.0)) / u_res.xy).r * u_kernel[1]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0, -1.0)) / u_res.xy).r * u_kernel[2]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0,  0.0)) / u_res.xy).r * u_kernel[3]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0,  0.0)) / u_res.xy).r * u_kernel[4]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0,  0.0)) / u_res.xy).r * u_kernel[5]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0,  1.0)) / u_res.xy).r * u_kernel[6]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0,  1.0)) / u_res.xy).r * u_kernel[7]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0,  1.0)) / u_res.xy).r * u_kernel[8];
        
        float x = activation(sum);
        gl_FragColor = vec4(x, x, x, 1.0) + (vec4(v_pos, length(v_pos), 1.0) * sin(u_time / 3000.0) * 0.2) + (vec4(length(v_pos), v_pos, 1.0) * cos(u_time / 1500.0) * 0.2);
    }
    else
    {
        gl_FragColor = texture2D(u_texture, (gl_FragCoord.xy) / u_res.xy).rgba;
    }
}
`

export const alpha_frag = 
`
precision mediump float;
uniform sampler2D u_texture;
uniform float u_kernel[9];
uniform float u_time;
uniform vec2 u_res;
uniform bool u_step;
uniform bool u_pause;
varying vec2 v_pos;

float activation(float x)
{
    [AF]
}

void main()
{
    if (u_step && !u_pause)
    {
        vec2 position = gl_FragCoord.xy / u_res.xy;
        float sum = 
            texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0, -1.0)) / u_res.xy).a * u_kernel[0]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0, -1.0)) / u_res.xy).a * u_kernel[1]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0, -1.0)) / u_res.xy).a * u_kernel[2]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0,  0.0)) / u_res.xy).a * u_kernel[3]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0,  0.0)) / u_res.xy).a * u_kernel[4]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0,  0.0)) / u_res.xy).a * u_kernel[5]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0,  1.0)) / u_res.xy).a * u_kernel[6]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0,  1.0)) / u_res.xy).a * u_kernel[7]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0,  1.0)) / u_res.xy).a * u_kernel[8];
        
        float x = activation(sum);
        gl_FragColor = vec4(0.0, 0.0, 0.0, x);
    }
    else
    {
        gl_FragColor = texture2D(u_texture, (gl_FragCoord.xy) / u_res.xy).rgba;
    } 
}
`

export const bnw_frag = 
`
precision mediump float;
uniform vec4 u_color;
uniform sampler2D u_texture;
uniform float u_kernel[9];
uniform float u_time;
uniform vec2 u_res;
uniform bool u_step;
uniform bool u_pause;
varying vec2 v_pos;

float activation(float x)
{
    [AF]
}

void main()
{
    if (u_step && !u_pause)
    {
        vec2 position = gl_FragCoord.xy / u_res.xy;

        float sum = 
            texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0, -1.0)) / u_res.xy).r * u_kernel[0]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0, -1.0)) / u_res.xy).r * u_kernel[1]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0, -1.0)) / u_res.xy).r * u_kernel[2]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0,  0.0)) / u_res.xy).r * u_kernel[3]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0,  0.0)) / u_res.xy).r * u_kernel[4]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0,  0.0)) / u_res.xy).r * u_kernel[5]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0,  1.0)) / u_res.xy).r * u_kernel[6]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0,  1.0)) / u_res.xy).r * u_kernel[7]
            + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0,  1.0)) / u_res.xy).r * u_kernel[8];
        
        float x = activation(sum);
        gl_FragColor = vec4(x, x, x, 1.0);
    }
    else
    {
        gl_FragColor = texture2D(u_texture, (gl_FragCoord.xy) / u_res.xy).rgba;
    }
}
`

export const rgb_frag = 
`
precision mediump float;
uniform sampler2D u_texture;
uniform float u_kernel[9];
uniform float u_time;
uniform vec2 u_res;
uniform bool u_step;
uniform bool u_pause;
varying vec2 v_pos;

float activation(float x)
{
    [AF]
}

void main()
{
  if (u_step && !u_pause)
  {
    vec2 position = gl_FragCoord.xy / u_res.xy;

    float sum_r = 
          texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0, -1.0)) / u_res.xy).r * u_kernel[0]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0, -1.0)) / u_res.xy).r * u_kernel[1]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0, -1.0)) / u_res.xy).r * u_kernel[2]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0,  0.0)) / u_res.xy).r * u_kernel[3]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0,  0.0)) / u_res.xy).r * u_kernel[4]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0,  0.0)) / u_res.xy).r * u_kernel[5]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0,  1.0)) / u_res.xy).r * u_kernel[6]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0,  1.0)) / u_res.xy).r * u_kernel[7]
        + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0,  1.0)) / u_res.xy).r * u_kernel[8];

    float sum_g = 
        texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0, -1.0)) / u_res.xy).g * u_kernel[0]
      + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0, -1.0)) / u_res.xy).g * u_kernel[1]
      + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0, -1.0)) / u_res.xy).g * u_kernel[2]
      + texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0,  0.0)) / u_res.xy).g * u_kernel[3]
      + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0,  0.0)) / u_res.xy).g * u_kernel[4]
      + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0,  0.0)) / u_res.xy).g * u_kernel[5]
      + texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0,  1.0)) / u_res.xy).g * u_kernel[6]
      + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0,  1.0)) / u_res.xy).g * u_kernel[7]
      + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0,  1.0)) / u_res.xy).g * u_kernel[8];

    float sum_b = 
      texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0, -1.0)) / u_res.xy).b * u_kernel[0]
    + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0, -1.0)) / u_res.xy).b * u_kernel[1]
    + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0, -1.0)) / u_res.xy).b * u_kernel[2]
    + texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0,  0.0)) / u_res.xy).b * u_kernel[3]
    + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0,  0.0)) / u_res.xy).b * u_kernel[4]
    + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0,  0.0)) / u_res.xy).b * u_kernel[5]
    + texture2D(u_texture, (gl_FragCoord.xy + vec2( 1.0,  1.0)) / u_res.xy).b * u_kernel[6]
    + texture2D(u_texture, (gl_FragCoord.xy + vec2( 0.0,  1.0)) / u_res.xy).b * u_kernel[7]
    + texture2D(u_texture, (gl_FragCoord.xy + vec2(-1.0,  1.0)) / u_res.xy).b * u_kernel[8];
    
    float r = activation(sum_r);
    float g = activation(sum_g);
    float b = activation(sum_b);

    gl_FragColor = vec4(r, g, b, 1.0);
  }
  else
  {
    gl_FragColor = texture2D(u_texture, (gl_FragCoord.xy) / u_res.xy).rgba;
  }
}
`