import { gl_program } from '../gl_program'

function basic_shader ( gl ) {

    var _gl = gl;
    var _program = gl_program( _gl, basic_vertex(), basic_fragment() );
    var _face_color = d3.color( 'white' );
    var _wire_color = d3.color( 'black' );
    var _wire_alpha = 0.3;
    var _wire_width = 1.0;

    _gl.useProgram( _program );

    var _attributes = d3.map({
        'vertex_normal': _gl.getAttribLocation( _program, 'vertex_normal' ),
        'vertex_position': _gl.getAttribLocation( _program, 'vertex_position' )
    });

    var _uniforms = d3.map({
        'face_color': _gl.getUniformLocation( _program, 'face_color' ),
        'projection_matrix': _gl.getUniformLocation( _program, 'projection_matrix' ),
        'wire_alpha': _gl.getUniformLocation( _program, 'wire_alpha' ),
        'wire_color': _gl.getUniformLocation( _program, 'wire_color' ),
        'wire_width': _gl.getUniformLocation( _program, 'wire_width' )
    });

    _program.attribute = function ( attribute ) {
        return _attributes.get( attribute );
    };

    _program.attributes = function ( _ ) {
        if ( !arguments.length ) return _attributes.keys();
        _attributes.each( _ );
        return _program;
    };

    _program.face_color = function ( _ ) {
        if ( !arguments.length ) return _face_color;
        _face_color = _;
        _gl.useProgram( _program );
        _gl.uniform3fv( _program.uniform( 'face_color' ), [ _.r/255, _.g/255, _.b/255 ] );
        return _program;
    };

    _program.set_projection = function ( matrix ) {

        _gl.useProgram( _program );
        _gl.uniformMatrix4fv( _program.uniform( 'projection_matrix' ), false, matrix );
        return _program;
    };

    _program.wire_alpha = function ( _ ) {
        if ( !arguments.length ) return _wire_alpha;
        _wire_alpha = _;
        _gl.useProgram( _program );
        _gl.uniform1f( _program.uniform( 'wire_alpha' ), _ );
        return _program;
    };

    _program.wire_color = function ( _ ) {
        if ( !arguments.length ) return _wire_color;
        _wire_color = _;
        _gl.useProgram( _program );
        _gl.uniform3fv( _program.uniform( 'wire_color' ), [_.r/255, _.g/255, _.b/255] );
        return _program;
    };

    _program.wire_width = function ( _ ) {
        if ( !arguments.length ) return _wire_width;
        _wire_width = _;
        _gl.useProgram( _program );
        _gl.uniform1f( _program.uniform( 'wire_width' ), _ );
        return _program;
    };

    _program.uniform = function ( uniform ) {
        return _uniforms.get( uniform );
    };

    _program.uniforms = function () {
        return _uniforms.keys();
    };

    _program.use = function () {

        _gl.useProgram( _program );
        return _program;

    };

    return _program
        .face_color( _program.face_color() )
        .wire_alpha( _program.wire_alpha() )
        .wire_color( _program.wire_color() )
        .wire_width( _program.wire_width() );

}

function basic_vertex () {

    return [
        'attribute vec3 vertex_position;',
        'attribute vec3 vertex_normal;',
        'uniform mat4 projection_matrix;',
        'varying vec3 _vertex_normal;',
        'void main( void ) {',
        '   gl_Position = projection_matrix * vec4( vertex_position, 1.0 );',
        '   _vertex_normal = vertex_normal;',
        '}'
    ].join('\n');

}

function basic_fragment () {

    return [
        '#extension GL_OES_standard_derivatives : enable',
        'precision highp float;',
        'varying vec3 _vertex_normal;',
        'uniform vec3 face_color;',
        'uniform vec3 wire_color;',
        'uniform float wire_alpha;',
        'uniform float wire_width;',
        'float edgeFactorTri() {',
        '   vec3 d = fwidth( _vertex_normal.xyz );',
        '   vec3 a3 = smoothstep( vec3( 0.0 ), d * wire_width, _vertex_normal.xyz );',
        '   return min( min( a3.x, a3.y ), a3.z );',
        '}',
        'void main() {',
        '   vec4 wire = mix( vec4(face_color, 1.0), vec4(wire_color, 1.0), wire_alpha);',
        '   gl_FragColor = mix( wire, vec4(face_color, 1.0), edgeFactorTri() );',
        '}'
    ].join('\n');

}

export { basic_shader }