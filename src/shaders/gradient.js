import { gl_program } from '../gl_program'

function gradient_shader ( gl, num_colors ) {

    var _gl = gl;
    var _program = gl_program( _gl, gradient_vertex( num_colors ), gradient_fragment() );

    _gl.useProgram( _program );

    var attrib_normal = _gl.getAttribLocation( _program, 'vertex_normal' );
    var attrib_position = _gl.getAttribLocation( _program, 'vertex_position' );
    var uniform_colors = _gl.getUniformLocation( _program, 'colors' );
    var uniform_color_stops = _gl.getUniformLocation( _program, 'stops' );
    var uniform_projection = _gl.getUniformLocation( _program, 'projection_matrix' );
    var uniform_wire_alpha = _gl.getUniformLocation( _program, 'wire_alpha' );
    var uniform_wire_color = _gl.getUniformLocation( _program, 'wire_color' );
    var uniform_wire_width = _gl.getUniformLocation( _program, 'wire_width' );

    _program.attrib_normal = function () {
        return attrib_normal;
    };

    _program.attrib_position = function () {
        return attrib_position;
    };

    _program.set_projection = function ( matrix ) {
        _gl.useProgram( _program );
        _gl.uniformMatrix4fv( uniform_projection, false, matrix );
        return _program;
    };

    _program.set_wire_alpha = function ( a ) {
        _gl.useProgram( _program );
        _gl.uniform1f( uniform_wire_alpha, a );
        return _program;
    };

    _program.set_wire_color = function ( c ) {
        _gl.useProgram( _program );
        _gl.uniform3fv( uniform_wire_color, [c.r, c.g, c.b] );
        return _program;
    };

    _program.set_gradient = function ( stops, colors ) {
        return _program
    };

    _program.set_wire_width = function ( w ) {
        _gl.useProgram( _program );
        _gl.uniform1f( uniform_wire_width, w );
        return _program;
    };

    _program.use = function () {
        _gl.useProgram( _program );
        return _program;
    };

    return _program;

}

function gradient_vertex ( num_colors ) {

    var code = [
        'attribute vec3 vertex_position;',
        'attribute vec3 vertex_normal;',
        'uniform mat4 projection_matrix;',
        'uniform float stops[' + num_colors + '];',
        'uniform vec3 colors[' + num_colors + '];',
        'varying vec3 _vertex_normal;',
        'varying vec3 _vertex_color;',
        'void main() {',
        '  gl_Position = projection_matrix * vec4( vertex_position, 1.0 );',
        '  _vertex_normal = vertex_normal;',
        '  _vertex_color = colors[0];',
        '  float t;'
    ];

    for ( var i=1; i<num_colors; ++i ) {
        code.push( '  t = clamp((vertex_position.z - stops['+(i-1)+']) / (stops['+i+']-stops['+(i-1)+']), 0.0, 1.0);' );
        code.push( '  _vertex_color = mix( _vertex_color, colors['+i+'], t*t*(3.0-2.0*t));')
    }

    code.push('}');

    return code.join( '\n' );

}

function gradient_fragment () {

    return [
        '#extension GL_OES_standard_derivatives : enable',
        'precision mediump float;',
        'varying vec3 _vertex_normal;',
        'varying vec3 _vertex_color;',
        'uniform vec3 wire_color;',
        'uniform float wire_alpha;',
        'uniform float wire_width;',
        'float edgeFactorTri() {',
        '   vec3 d = fwidth( _vertex_normal.xyz );',
        '   vec3 a3 = smoothstep( vec3( 0.0 ), d * wire_width, _vertex_normal.xyz );',
        '   return min( min( a3.x, a3.y ), a3.z );',
        '}',
        'void main() {',
        '   vec4 wire = mix( vec4(_vertex_color, 1.0), vec4(wire_color, 1.0), wire_alpha);',
        '   gl_FragColor = mix( wire, vec4(_vertex_color, 1.0), edgeFactorTri() );',
        '}'
    ].join('\n');

}

export { gradient_shader }