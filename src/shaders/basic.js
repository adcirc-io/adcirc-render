import { gl_program } from '../gl_program'

function basic_shader ( gl ) {

    var _gl = gl;
    var _program = gl_program( _gl, basic_vertex(), basic_fragment() );

    _gl.useProgram( _program );

    var attrib_position = _gl.getAttribLocation( _program, 'vertex_position' );
    var attrib_color = _gl.getAttribLocation( _program, 'vertex_color' );
    var uniform_projection = _gl.getUniformLocation( _program, 'projection_matrix' );
    var uniform_transformation = _gl.getUniformLocation( _program, 'transformation_matrix' );

    _program.attrib_position = function () {
        return attrib_position;
    };

    _program.attrib_color = function () {
        return attrib_color;
    };
    
    _program.set_projection = function ( matrix ) {

        _gl.useProgram( _program );
        _gl.uniformMatrix4fv( uniform_projection, false, matrix );
        return _program;
    };

    _program.set_transformation = function ( matrix ) {

        _gl.useProgram( _program );
        _gl.uniformMatrix4fv( uniform_transformation, false, matrix );
        return _program;

    };

    _program.use = function () {

        _gl.useProgram( _program );
        return _program;

    };

    return _program;

}

function basic_vertex () {

    return [
        'attribute vec3 vertex_position;',
        'attribute vec4 vertex_color;',
        'uniform mat4 projection_matrix;',
        'uniform mat4 transformation_matrix;',
        'varying lowp vec4 vert_color;',
        'void main( void ) {',
        '   gl_Position = projection_matrix * transformation_matrix * vec4( vertex_position, 1.0 );',
        '   vert_color = vertex_color;',
        '}'
    ].join('\n');

}

function basic_fragment () {

    return [
        'varying lowp vec4 vert_color;',
        'void main( void ) {',
        '   gl_FragColor = vert_color;',
        '}'
    ].join('\n');

}

export { basic_shader }